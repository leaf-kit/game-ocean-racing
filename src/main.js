// 대항해시대 레이싱 - 메인 게임 루프
import * as THREE from 'three';
import { SHIPS, SHIP_CATEGORIES, AI_NAMES, buildShipMesh, renderShipPreview, pickAiName } from './ships.js?v=20260912153205';
import { Environment, TIME_PRESETS, waveHeight, SEA } from './ocean.js?v=20260912153205';
import { Track, TRACK_HALF_WIDTH, GUARD_OFFSET, CHECKPOINT_COUNT } from './track.js?v=20260912153205';
import { Boat } from './boat.js?v=20260912153205';
import { aiControl, difficultyParams } from './ai.js?v=20260912153205';
import { HUD, formatTime } from './hud.js?v=20260912153205';
import { Particles, Seagulls } from './effects.js?v=20260912153205';
import { AudioManager } from './audio.js?v=20260912153205';
import { PORTS, TRIVIA, EVENTS, FIGURES, DISCOVERIES, MAP_ROUTES } from './history.js?v=20260912153205';
import { WORLD_ROUTE } from './worldmap.js?v=20260912153205';
import { t, LANG, setLang, applyStaticI18n, applyEnglishData, ordinal } from './i18n.js?v=20260912153205';
import { PORTRAITS, drawPortrait } from './portraits.js?v=20260912153205';
import { MAPS, DEFAULT_MAP, findMap } from './maps.js?v=20260912153205';

applyEnglishData();
applyStaticI18n();
document.getElementById('lang-select').addEventListener('change', (e) => setLang(e.target.value));

const $ = (id) => document.getElementById(id);
const AI_COLORS = ['#ff6b6b', '#6bcBff', '#7bed9f', '#f8a5ff', '#ffa94d', '#c3b1ff'];

// ---------- 렌더러/씬 ----------
const app = $('app');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  window.showLoadError?.('WebGL 컨텍스트를 만들 수 없습니다. 브라우저의 하드웨어 가속(WebGL)을 켜거나 다른 브라우저로 시도하세요. (' + err.message + ')');
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

let scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.5, 6000);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const hud = new HUD();
const audio = new AudioManager();
audio.onTrackChange = (name) => { hud.setMusic(name || t('music.synthName')); const el = $('music-hint-name'); if (el && name) el.textContent = '♪ ' + name + ' · ' + t('music.ext', { n: audio.tracks.length }); updateMusicWidget(); };
// ---------- 플레이리스트 위젯 ----------
function updateMusicWidget() {
  const w = $('music-widget'); if (!audio.hasExternalMusic) { w.classList.add('hidden'); return; }
  w.classList.remove('hidden');
  const names = audio.trackNames();
  $('music-cur').textContent = audio.trackName || names[0] || '';
  const ul = $('music-items');
  if (ul.children.length !== names.length) {
    ul.innerHTML = '';
    names.forEach((n, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${n}</span>${i === audio.mainIdx ? `<span class="tag">★ ${t('music.main')}</span>` : ''}`;
      li.addEventListener('click', (e) => { e.stopPropagation(); audio.init(); audio.playIndex(i); updateMusicWidget(); }); // 목록은 열어 둔 채 현재 곡 표시만 갱신
      ul.appendChild(li);
    });
  }
  [...ul.children].forEach((li, i) => li.classList.toggle('current', i === audio.trackIdx && !!audio.trackName));
}
$('music-toggle').addEventListener('click', (e) => { e.stopPropagation(); $('music-list').classList.toggle('hidden'); updateMusicWidget(); });
window.addEventListener('pointerdown', (e) => { if (!e.target.closest('#music-widget')) $('music-list').classList.add('hidden'); });
audio.ready.then(updateMusicWidget);
// 브라우저가 자동재생을 막으면 '클릭하여 입장' 안내를 띄우고, 첫 클릭에 곧바로 메인 테마를 튼다
audio.autoplay().then((ok) => {
  const gate = $('enter-gate');
  if (ok || !audio.hasExternalMusic) { gate.classList.add('hidden'); return; }
  gate.classList.remove('hidden');
  const enter = () => { gate.classList.add('hidden'); window.removeEventListener('keydown', enter); };
  gate.addEventListener('pointerdown', enter, { once: true });
  window.addEventListener('keydown', enter);
});
const clock = new THREE.Clock();

// ---------- 게임 상태 ----------
const G = {
  state: 'title', // title | select | countdown | racing | finished | result
  selectedShip: SHIPS[0],
  laps: 3, difficulty: 'normal', timeOfDay: 'random',
  env: null, track: null, particles: null, gulls: null,
  boats: [], player: null, projectiles: [],
  wind: { dir: 0, strength: 0.7, gustTimer: 25, gust: 0, targetDir: 0 },
  raceTime: 0, countdown: 0, t: 0, camMode: 0, camShake: 0, finishTimer: 0,
  keys: {}, previewDisposers: [], whirlCooldown: 0, krakenActive: false, doubleShotTimer: 0,
  lastLapTime: 0,
  // 점수 / 콤보 / 통계
  score: 0, combo: 0, comboTimer: 0,
  stats: null,
  // 슬립스트림
  draft: { t: 0, awarded: false, off: 0 },
  // 폭풍
  storm: { state: 'calm', level: 0, timer: 0, lightning: 0, flash: 0, hitDuring: false, warned: false },
  // 퍼펙트 스타트
  throttleKeyTime: -1, goTime: 0,
  // 추월 판정 (pending: 남은 확인 시간, confirmed: 마지막으로 확정된 순위)
  overtake: { pending: -1, confirmed: 6 },
  // 역사 학습: 연대기 진행, 발견한 인물/현상
  eventIdx: 0, eventTimer: 6, learned: { figures: [], discoveries: [], events: 0 },
  // 발견 효과 남은 시간
  fx: { aurora: 0, elmo: 0, tradeWind: 0, current: 0, doubleScore: 0 },
  cycle: false, phase: 0,
  camOff: new THREE.Vector3(), camOffInit: false,
  map: DEFAULT_MAP,
  // SHIFT 연타: 게이지(0~1), 마지막 탭 시각, 안내 타이머
  tap: { meter: 0, last: -10, hintT: 0, hintOn: false, taps: 0, bursts: 0 },
};
const COMBO_WINDOW = 4.0;

function freshStats() { return { nearMiss: 0, overtakes: 0, coins: 0, chests: 0, slipstreams: 0, perfectStart: false, maxCombo: 0, bestLap: Infinity, storms: 0, rankPts: 0, jumps: 0 }; }

// ---------- 입력 ----------
window.addEventListener('keydown', (e) => {
  if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return; // 이름 입력 중에는 단축키 무시
  if (!G.keys[e.code] && (e.code === 'KeyW' || e.code === 'ArrowUp') && G.state === 'countdown') G.throttleKeyTime = G.t;
  if (!G.keys[e.code] && (e.code === 'ShiftLeft' || e.code === 'ShiftRight') && G.state === 'racing') onShiftTap();
  G.keys[e.code] = true;
  if (e.code === 'KeyC' && G.state === 'racing') G.camMode = (G.camMode + 1) % 3;
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'KeyM' && audio.enabled) { audio.musicOn = !audio.musicOn; audio.setMusicVolume(audio.musicOn ? audio.MUSIC_VOL : 0); hud.event(audio.musicOn ? t('ev.music.on') : t('ev.music.off'), 1200); }
  if (e.code === 'Escape' && ['racing', 'finished', 'countdown', 'result'].includes(G.state)) { endRace(); showSelect(); }
});
window.addEventListener('keyup', (e) => { G.keys[e.code] = false; });
window.addEventListener('blur', () => { G.keys = {}; });

// ---------- 마우스 / 터치 조작 ----------
// 누른 채 좌우로 끌면 조타 + 전진, 빠르게 두드리면 연타 부스트, 우클릭/두 손가락은 전속 항해
const PTR = { down: false, id: null, steer: 0, boost: false, fingers: new Set(), lastDown: -10 };
// 가상 패드 (모바일): 버튼을 누르는 동안 해당 키가 눌린 것으로 취급
const VK = { left: false, right: false, up: false, down: false, boost: false };
for (const btn of document.querySelectorAll('#touch-pad .pad-btn')) {
  const k = btn.dataset.vk;
  const press = (e) => { e.preventDefault(); e.stopPropagation(); btn.classList.add('on'); try { btn.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ }
    if (k === 'fire') { if (G.state === 'racing' && G.player && !G.player.finished) fireCannon(G.player); return; }
    VK[k] = true; if (k === 'boost' && G.state === 'racing') onShiftTap(); };
  const release = (e) => { e.preventDefault(); btn.classList.remove('on'); if (k !== 'fire') VK[k] = false; };
  btn.addEventListener('pointerdown', press); btn.addEventListener('pointerup', release); btn.addEventListener('pointercancel', release); btn.addEventListener('lostpointercapture', release);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
const isUiTarget = (el) => !!(el && el.closest && el.closest('#select-screen, #result-screen, #title-screen, #lang-bar, #music-widget, #top-menu, #touch-pad, #btn-fire, #enter-gate, select, button, input'));
function ptrSteerFrom(x) {
  const w = window.innerWidth, c = w / 2, dead = w * 0.06;
  const d = x - c;
  if (Math.abs(d) < dead) return 0;
  return -Math.max(-1, Math.min(1, (d - Math.sign(d) * dead) / (w * 0.28))); // 오른쪽으로 끌면 오른쪽 조타 (steer 음수)
}
window.addEventListener('pointerdown', (e) => {
  if (isUiTarget(e.target)) return;
  if (G.state !== 'racing' && G.state !== 'countdown') return;
  e.preventDefault();
  PTR.fingers.add(e.pointerId);
  if (e.pointerType === 'mouse' && e.button === 2) { PTR.boost = true; return; }
  if (PTR.fingers.size >= 2) { PTR.boost = true; return; } // 두 번째 손가락 = 전속 항해
  PTR.down = true; PTR.id = e.pointerId; PTR.steer = ptrSteerFrom(e.clientX);
  if (G.state === 'racing') onShiftTap(); // 두드리기 = 연타 부스트 게이지
  if (G.state === 'countdown') G.throttleKeyTime = G.t;
});
window.addEventListener('pointermove', (e) => { if (PTR.down && e.pointerId === PTR.id) PTR.steer = ptrSteerFrom(e.clientX); });
const ptrUp = (e) => {
  PTR.fingers.delete(e.pointerId);
  if (e.pointerType === 'mouse' && e.button === 2) PTR.boost = false;
  if (e.pointerId === PTR.id) { PTR.down = false; PTR.id = null; PTR.steer = 0; }
  if (PTR.fingers.size < 2 && e.pointerType !== 'mouse') PTR.boost = false;
  if (PTR.fingers.size === 0) { PTR.down = false; PTR.boost = false; PTR.steer = 0; }
};
window.addEventListener('pointerup', ptrUp); window.addEventListener('pointercancel', ptrUp);
window.addEventListener('contextmenu', (e) => { if (!isUiTarget(e.target)) e.preventDefault(); });
$('btn-fire').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (G.state === 'racing' && G.player && !G.player.finished) fireCannon(G.player); });

// ---------- 화면 전환 ----------
$('btn-start').addEventListener('click', () => { audio.init(); showSelect(); });
$('btn-race').addEventListener('click', () => { audio.init(); startRace(); });
$('btn-retry').addEventListener('click', () => { $('result-screen').classList.add('hidden'); startRace(); });
$('btn-select').addEventListener('click', () => { $('result-screen').classList.add('hidden'); showSelect(); });

// 타이틀에 배경음악 상태 표시 (assets/music 폴더 탐색이 끝난 뒤)
audio.ready.then(() => {
  const el = $('music-hint-name');
  if (el && !audio.trackName) el.textContent = audio.hasExternalMusic ? t('music.ext', { n: audio.tracks.length }) : t('music.synth');
});

// ---------- 맵 선택 ----------
try { G.map = findMap(localStorage.getItem('hr_map')); } catch (_) { /* 무시 */ }
function buildMapOptions() {
  const sel = $('opt-map'); if (sel.options.length) return;
  for (const m of MAPS) { const o = document.createElement('option'); o.value = m.id; o.textContent = LANG === 'en' ? m.en : m.name; sel.appendChild(o); }
  sel.value = G.map.id;
  const desc = $('map-desc'); desc.textContent = LANG === 'en' ? G.map.descEn : G.map.desc;
  sel.addEventListener('change', () => { G.map = findMap(sel.value); desc.textContent = LANG === 'en' ? G.map.descEn : G.map.desc; try { localStorage.setItem('hr_map', G.map.id); } catch (_) { /* 무시 */ } });
  // 레이스 중 상단 메뉴의 맵 목록
  const ml = $('menu-maps');
  for (const m of MAPS) { const li = document.createElement('li'); li.textContent = LANG === 'en' ? m.en : m.name; li.dataset.id = m.id; li.addEventListener('click', (e) => { e.stopPropagation(); G.map = m; sel.value = m.id; desc.textContent = LANG === 'en' ? m.descEn : m.desc; try { localStorage.setItem('hr_map', m.id); } catch (_) { /* 무시 */ } $('top-menu-list').classList.add('hidden'); $('result-screen').classList.add('hidden'); startRace(); }); ml.appendChild(li); }
}
$('menu-toggle').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.toggle('hidden'); [...$('menu-maps').children].forEach((li) => li.classList.toggle('current', li.dataset.id === G.map.id)); });
$('menu-home').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.add('hidden'); goHome(); });
$('menu-select').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.add('hidden'); endRace(); showSelect(); });
window.addEventListener('pointerdown', (e) => { if (!e.target.closest('#top-menu')) $('top-menu-list').classList.add('hidden'); });
function goHome() {
  endRace();
  $('select-screen').classList.add('hidden'); $('result-screen').classList.add('hidden');
  $('title-screen').classList.remove('hidden'); $('lang-bar').classList.remove('hidden'); $('top-menu').classList.add('hidden');
  G.state = 'title'; G.attract = false;
  if (audio.enabled) audio.playTheme();
}

// ---------- 제독 초상 선택 ----------
G.portrait = PORTRAITS[0];
try { const saved = localStorage.getItem('hr_portrait'); const f = PORTRAITS.find((p) => p.id === saved); if (f) G.portrait = f; } catch (_) { /* 무시 */ }
function buildPortraitRow() {
  const row = $('portrait-row'); if (row.children.length) return;
  for (const p of PORTRAITS) {
    const el = document.createElement('div'); el.className = 'portrait' + (p === G.portrait ? ' selected' : '');
    const cv = document.createElement('canvas'); drawPortrait(cv, p, 128);
    const nm = document.createElement('div'); nm.className = 'pname'; nm.textContent = LANG === 'en' ? p.en : p.name;
    el.append(cv, nm);
    el.addEventListener('click', () => {
      G.portrait = p; [...row.children].forEach((c) => c.classList.remove('selected')); el.classList.add('selected');
      const inp = $('opt-name'); if (!inp.value.trim() || PORTRAITS.some((q) => inp.value.trim() === q.name || inp.value.trim() === q.en)) { inp.value = LANG === 'en' ? p.en : p.name; inp.dispatchEvent(new Event('change')); }
      try { localStorage.setItem('hr_portrait', p.id); } catch (_) { /* 무시 */ }
      audio.pickup();
    });
    row.appendChild(el);
  }
}
function admiralName() {
  const v = ($('opt-name').value || '').trim().slice(0, 12);
  return v || t('name.default');
}
$('opt-name').addEventListener('change', () => { try { localStorage.setItem('hr_name', $('opt-name').value.trim()); } catch (_) { /* 무시 */ } });
try { $('opt-name').value = localStorage.getItem('hr_name') || ''; } catch (_) { /* 무시 */ }

function showSelect() {
  G.state = 'select';
  $('lang-bar').classList.remove('hidden');
  if (audio.enabled) audio.playTheme(); // 타이틀·함선 선택은 메인 테마, 레이스 시작 시 무작위 곡
  G.attract = false;
  $('title-screen').classList.add('hidden');
  $('result-screen').classList.add('hidden');
  hud.hide();
  $('select-screen').classList.remove('hidden');
  $('top-menu').classList.remove('hidden');
  buildMapOptions();
  buildPortraitRow();
  const wrap = $('ship-cards');
  if (!wrap.children.length) {
    const cards = [];
    for (const catKey of Object.keys(SHIP_CATEGORIES)) {
      const cat = SHIP_CATEGORIES[catKey];
      const head = document.createElement('div');
      head.className = 'ship-cat';
      head.innerHTML = `<h3>${cat.name} <small>${t('select.types', { n: SHIPS.filter((d) => d.cat === catKey).length })}</small></h3><p>${cat.desc}</p>`;
      wrap.appendChild(head);
      for (const def of SHIPS.filter((d) => d.cat === catKey)) {
        const card = document.createElement('div');
        card.className = 'ship-card' + (def === G.selectedShip ? ' selected' : '') + (def.legend ? ' legend' : '');
        const s = def.stats;
        const bar = (label, v) => `<div class="stat-row"><label>${label}</label><div class="stat-bar"><div style="width:${v * 10}%"></div></div><span class="stat-num">${v * 10}</span></div>`;
        card.innerHTML = `${def.legend ? '<div class="legend-tag">★ SPECIAL</div>' : ''}<canvas></canvas><h3>${def.name}</h3><div class="ship-nation">${def.en} · ${def.nation}</div><div class="ship-desc">${def.desc}</div>
          ${bar(t('stat.speed'), s.speed)}${bar(t('stat.accel'), s.accel)}${bar(t('stat.handling'), s.handling)}${bar(t('stat.dur'), s.durability)}<div class="ship-special">${def.special}</div>`;
        card.addEventListener('click', () => {
          G.selectedShip = def;
          cards.forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          audio.pickup();
        });
        wrap.appendChild(card); cards.push(card);
        G.previewDisposers.push(renderShipPreview(card.querySelector('canvas'), def));
      }
    }
  }
}

// ---------- 레이스 준비 ----------
function clearScene() {
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
  scene = new THREE.Scene();
}

function resetStorm() {
  const sf = 1 / ((G.map && G.map.storm) || 1);
  G.storm = { state: 'calm', level: 0, timer: (22 + Math.random() * 12) * sf, lightning: 0, flash: 0, hitDuring: false, warned: false };
  SEA.storm = 0; SEA.flash = 0;
}

function buildWorld(tod, map = G.map) {
  clearScene();
  G.env = new Environment(scene, tod, 5000, map);
  G.track = new Track(scene, map);
  G.particles = new Particles(scene);
  G.gulls = new Seagulls(scene, new THREE.Vector3(250, 0, 200), 12);
  G.projectiles = [];
  G.boats = [];
  hud.mapCache = null;
  resetStorm();
}

function startRace() {
  $('select-screen').classList.add('hidden');
  $('lang-bar').classList.add('hidden');
  G.laps = parseInt($('opt-laps').value, 10);
  G.difficulty = $('opt-difficulty').value;
  let tod = $('opt-time').value;
  if (tod === 'random') tod = ['day', 'sunset', 'night'][Math.floor(Math.random() * 3)];
  G.timeOfDay = tod;
  G.cycle = tod === 'cycle'; G.phase = 0;

  buildWorld(tod);
  G.attract = false;
  G.eventIdx = Math.floor(Math.random() * 4); G.eventTimer = 7; G.learned = { figures: [], discoveries: [], events: 0 };
  G.fx = { aurora: 0, elmo: 0, tradeWind: 0, current: 0, doubleScore: 0 };

  // 함선 배치: 플레이어 + 나머지 5종 AI
  const others = SHIPS.filter((s) => s !== G.selectedShip && !s.aiExclude);
  shuffle(others);
  const starts = G.track.startPositions(6);
  const lineup = [G.selectedShip, ...others.slice(0, 5)];
  const diff = difficultyParams(G.difficulty);
  // AI 이름 풀에서 플레이어 이름은 제외 (제독 이름과 겹치지 않게)
  const myName = admiralName();
  const nameOrder = shuffle(AI_NAMES.map((_, i) => i).filter((i) => AI_NAMES[i] !== myName));
  lineup.forEach((def, i) => {
    const isPlayer = i === 0;
    const mesh = buildShipMesh(def, { flagColor: isPlayer ? 0xffe08a : undefined });
    scene.add(mesh);
    const boat = new Boat(def, mesh, { isPlayer, name: isPlayer ? admiralName() : pickAiName(nameOrder[i]), color: isPlayer ? '#ffe08a' : AI_COLORS[i], skill: isPlayer ? 1 : diff.skill });
    const st = starts[i];
    boat.setStart(st.pos, st.heading);
    mesh.userData.lantern.intensity = (TIME_PRESETS[tod].lantern ?? 0) * 30;
    G.boats.push(boat);
  });
  G.player = G.boats[0];
  const order = shuffle(G.boats.map((_, i) => i));
  G.boats.forEach((b, i) => { const st = starts[order[i]]; b.setStart(st.pos, st.heading); });

  // 바람 초기화
  G.wind.dir = Math.random() * Math.PI * 2; G.wind.targetDir = G.wind.dir; G.wind.strength = 0.7; G.wind.gust = 0; G.wind.gustTimer = 18 + Math.random() * 10;

  G.raceTime = 0; G.countdown = 3.6; G.state = 'countdown'; G.camMode = 0; G.finishTimer = 0; G.krakenActive = false; G.lastLapTime = 0;
  G.countStep = 4;
  G.score = 0; G.combo = 0; G.comboTimer = 0; G.stats = freshStats();
  G.draft = { t: 0, awarded: false, off: 0 };
  G.overtake = { pending: -1, confirmed: 6 };
  G.tap = { meter: 0, last: -10, hintT: 0.5, hintOn: false, taps: 0, bursts: 0 };
  G.camOffInit = false;
  G.throttleKeyTime = -1;
  for (const o of G.track.obstacles) o.nearT = -10;
  for (const b of G.boats) b.padCd = 0;
  G.track.setDifficultyProgress(0);
  hud.setRoute(MAP_ROUTES[G.map.id] || WORLD_ROUTE); // 맵마다 다른 지역 지도와 기항지
  hud.resetScoreDisplay();
  hud.setAdmiral(admiralName(), G.selectedShip.name, G.portrait);
  hud.show();
  hud.event((LANG === 'en' ? G.map.en : G.map.name) + ' · ' + t('ev.start', { label: t('time.' + tod), laps: G.laps, diff: t('diff.' + G.difficulty) }), 3500);
  hud.showPort(0, 0, G.laps, 6000);
  hud.knowledge({ kind: 'event', label: t('kc.guide'), date: t('kc.guideDate', { n: G.laps }), title: t('kc.guideTitle'), text: t('kc.guideText'), dur: 8 });
  audio.setMusicVolume(audio.musicOn ? audio.MUSIC_VOL : 0);
  audio.startMusic();

}

function endRace() { G.state = 'select'; hud.hide(); audio.setSpeed(0, false); resetStorm(); if (G.env) { G.env.setStorm(0, 0); G.env.setAurora(0); } }

// 타이틀/선택 화면 뒤에서 AI 함선들이 항해하는 배경 장면
function startAttract() {
  const tod = ['day', 'sunset', 'night'][Math.floor(Math.random() * 3)];
  buildWorld(tod, MAPS[Math.floor(Math.random() * MAPS.length)]);
  const starts = G.track.startPositions(6);
  const lineup = shuffle(SHIPS.filter((s) => !s.aiExclude)).slice(0, 4);
  lineup.forEach((def, i) => {
    const mesh = buildShipMesh(def);
    scene.add(mesh);
    const boat = new Boat(def, mesh, { name: def.name, color: AI_COLORS[i], skill: 0.9 });
    boat.setStart(starts[i].pos, starts[i].heading);
    mesh.userData.lantern.intensity = TIME_PRESETS[tod].lantern * 30;
    G.boats.push(boat);
  });
  G.player = G.boats[0];
  G.wind.dir = Math.random() * Math.PI * 2; G.wind.targetDir = G.wind.dir;
  G.attract = true;
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- SHIFT 연타 가속 ----------
// 연타: 누를 때마다 게이지가 크게 참 → 가득 차면 급가속 버스트. 꾹: 천천히 차며 기존 전속 항해.
function onShiftTap() {
  const T = G.tap, p = G.player;
  if (!p || p.finished) return;
  const quick = G.t - T.last < 0.45; // 리듬 있게 연타하면 보너스
  T.last = G.t; T.taps++;
  T.meter = Math.min(1.2, T.meter + (quick ? 0.16 : 0.1));
  audio.coin(Math.floor(T.meter * 10));
  if (T.meter >= 1) {
    T.meter = 0; T.bursts++;
    p.turbo = Math.max(p.turbo, 2.2);
    G.camShake = Math.max(G.camShake, 0.3);
    addQuiet(40);
    hud.comboPop(t('pop.tapBurst'), t('pop.tapSub'), '#ffb347');
    audio.boost();
    const f = p.forward();
    G.particles.burst(p.pos.x - f.x * p.phys.radius, 1, p.pos.z - f.z * p.phys.radius, 30, { speed: 8, up: 6, life: 0.8, size: 4, color: 0xffb347, grav: -6 });
  }
}
function updateTap(dt) {
  const T = G.tap, p = G.player, k = G.keys;
  if (G.state !== 'racing' || p.finished) { p.rowMul = 1; hud.setTap(0, false); return; }
  const held = !!(k.ShiftLeft || k.ShiftRight || VK.boost || PTR.boost);
  if (held && G.t - T.last > 0.35) T.meter = Math.min(1, T.meter + dt * 0.12); // 꾹: 천천히
  else if (!held && G.t - T.last > 0.5) T.meter = Math.max(0, T.meter - dt * 0.3); // 놓으면 서서히 감소
  p.rowMul = 1 + T.meter * 0.22;
  // 안내: 레이스 시작 후 12초, 이후 45초마다 4초씩
  T.hintT -= dt;
  if (T.hintT <= 0) { T.hintOn = !T.hintOn; T.hintT = T.hintOn ? (G.raceTime < 15 ? 12 : 4) : 45; }
  hud.setTap(T.meter, T.hintOn);
}

// ---------- 역방향 감지 ----------
function updateWrongWay(dt) {
  const p = G.player;
  if (G.state !== 'racing' || p.finished) { G.wrongT = 0; hud.setWrongWay(false); return; }
  const tng = G.track.tangentAt(p.curveIdx);
  const dot = Math.sin(p.heading) * tng.x + Math.cos(p.heading) * tng.z;
  G.wrongT = (dot < -0.3 && p.speed > 5) ? (G.wrongT || 0) + dt : 0;
  hud.setWrongWay(G.wrongT > 0.6);
}

// ---------- 점수 / 콤보 ----------
function award(points, label, color, sound) {
  if (G.state !== 'racing') return;
  G.combo += 1; G.comboTimer = COMBO_WINDOW;
  const mult = Math.min(G.combo, 10) * (G.fx.doubleScore > 0 ? 2 : 1);
  const got = points * mult;
  G.score += got;
  G.stats.maxCombo = Math.max(G.stats.maxCombo, G.combo);
  hud.comboPop(label, `+${got.toLocaleString('ko-KR')}` + (mult > 1 ? ` (×${mult})` : ''), color);
  if (sound) sound(); else audio.combo(G.combo);
}
function addQuiet(points) { const mult = Math.min(Math.max(1, G.combo), 10); G.score += points * mult; }
function breakCombo() {
  if (G.combo >= 2) { hud.comboBreak(); hud.event(t('ev.comboBreak', { n: G.combo }), 1200); }
  G.combo = 0; G.comboTimer = 0;
}

// ---------- 레이스 진행 ----------
function updateWind(dt) {
  const w = G.wind;
  w.gustTimer -= dt;
  if (w.gustTimer <= 0) {
    w.gustTimer = 20 + Math.random() * 15;
    w.gust = 6;
    w.targetDir += (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.9);
    if (G.state === 'racing') hud.event(t('ev.gust'), 3000);
  }
  if (w.gust > 0) w.gust -= dt;
  w.targetDir += (Math.random() - 0.5) * 0.02 * dt;
  if (G.fx.tradeWind > 0 && G.player) w.targetDir = G.player.heading; // 무역풍: 내 진행 방향의 순풍
  let d = w.targetDir - w.dir; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  w.dir += d * Math.min(1, dt * 0.5);
  const base = 0.62 + Math.sin(G.t * 0.11) * 0.15 + G.storm.level * 0.5 + (G.fx.tradeWind > 0 ? 0.35 : 0);
  w.strength += ((w.gust > 0 ? base + 0.45 : base) - w.strength) * Math.min(1, dt * 0.8);
}

// ---------- 폭풍 ----------
function updateStorm(dt) {
  const S = G.storm;
  const racing = G.state === 'racing' || G.state === 'finished';
  S.timer -= dt;
  if (S.state === 'calm') {
    if (racing && S.timer <= 0) { S.state = 'warn'; S.timer = 3.2; hud.setStorm(0, 0, true); hud.event(t('ev.stormWarn'), 3000); audio.stormWarn(); }
  } else if (S.state === 'warn') {
    if (S.timer <= 0) { S.state = 'rising'; S.timer = 3; hud.setStorm(0, 0, false); S.hitDuring = false; S.lightning = 1.5; }
  } else if (S.state === 'rising') {
    S.level = Math.min(1, S.level + dt / 3);
    if (S.timer <= 0) { S.state = 'active'; S.timer = 11 + Math.random() * 5; hud.event(t('ev.stormIn'), 2500); }
  } else if (S.state === 'active') {
    S.level = 1;
    if (S.timer <= 0 || !racing) { S.state = 'fading'; S.timer = 4; }
  } else if (S.state === 'fading') {
    S.level = Math.max(0, S.level - dt / 4);
    if (S.level <= 0) {
      S.state = 'calm'; S.timer = (30 + Math.random() * 20) / ((G.map && G.map.storm) || 1);
      if (racing && G.state === 'racing') {
        G.stats.storms++;
        if (!S.hitDuring) award(250, t('pop.storm'), '#8fd4ff', () => audio.perfect());
        else hud.event(t('ev.stormOut'), 2000);
      }
    }
  }
  // 번개
  S.flash = Math.max(0, S.flash - dt * 6);
  if (S.level > 0.5 && racing) {
    S.lightning -= dt;
    if (S.lightning <= 0) {
      S.lightning = 1.8 + Math.random() * 3.5;
      S.flash = 1;
      G.camShake = Math.max(G.camShake, 0.45);
      setTimeout(() => audio.thunder(), 250 + Math.random() * 600);
    }
  }
  SEA.storm = S.level; SEA.flash = S.flash;
  G.env.setStorm(S.level, S.flash);
  hud.setStorm(S.level, S.flash, S.state === 'warn');
  // 비: 카메라 앞쪽 공간에 빗줄기 파티클
  if (S.level > 0.05) {
    const n = Math.floor(S.level * 26);
    const f = _f; camera.getWorldDirection(f);
    for (let i = 0; i < n; i++) {
      const x = camera.position.x + f.x * (10 + Math.random() * 60) + (Math.random() - 0.5) * 90;
      const z = camera.position.z + f.z * (10 + Math.random() * 60) + (Math.random() - 0.5) * 90;
      G.particles.spawn(x, camera.position.y + 10 + Math.random() * 25, z, Math.sin(G.wind.dir) * 18, -70, Math.cos(G.wind.dir) * 18, 0.55, 1.6, 0xcfe8ff, -1);
    }
  }
}

// ---------- 역사 학습: 연대기, 인물, 발견 ----------
function updateChronicle(dt) {
  if (G.state !== 'racing') return;
  G.eventTimer -= dt;
  if (G.eventTimer <= 0) {
    const e = EVENTS[G.eventIdx % EVENTS.length]; G.eventIdx++; G.learned.events++;
    hud.knowledge({ kind: 'event', label: t('kc.event'), date: e.date, title: e.title, text: e.text, dur: 7.5 });
    G.eventTimer = 10.5;
  }
}
function pickUnseen(list, seen) {
  const cand = list.filter((x) => !seen.includes(x.name));
  const pool = cand.length ? cand : list;
  return pool[Math.floor(Math.random() * pool.length)];
}
function foundFigure() {
  const f = pickUnseen(FIGURES, G.learned.figures);
  G.learned.figures.push(f.name);
  hud.knowledge({ kind: 'figure', label: t('kc.figure'), date: f.years, title: f.name, text: f.text, dur: 9 }, true);
  award(150, t('pop.figure'), '#ffe08a', () => audio.treasure());
}
function foundDiscovery() {
  const d = pickUnseen(DISCOVERIES, G.learned.discoveries);
  G.learned.discoveries.push(d.name);
  const eff = t('eff.' + d.effect);
  hud.knowledge({ kind: 'discovery', label: t('kc.discovery', { kind: d.kind }), date: eff, title: d.name, text: d.text, dur: 9 }, true);
  const F = G.fx, p = G.player;
  if (d.effect === 'aurora') F.aurora = 25;
  else if (d.effect === 'elmo') F.elmo = 12;
  else if (d.effect === 'tradewind') F.tradeWind = 12;
  else if (d.effect === 'current') F.current = 10;
  else if (d.effect === 'citrus') p.boost = 1;
  else if (d.effect === 'bonus') F.doubleScore = 15;
  award(150, `🔮 ${d.name}!`, d.color, () => audio.perfect());
}
const _elmoLight = new THREE.PointLight(0x7fd4ff, 0, 40);
function updateEffects(dt) {
  const F = G.fx, p = G.player;
  for (const k of Object.keys(F)) if (F[k] > 0) F[k] -= dt;
  // 오로라: 서서히 켜지고 꺼짐
  let auroraT = Math.max(0, Math.min(1, F.aurora / 3, (25 - F.aurora) / 3));
  if (G.map && G.map.aurora) auroraT = Math.max(auroraT, Math.max(0, (G.phase - 0.55) * 1.6) * 0.7); // 극지 맵: 밤이면 오로라
  G.env.setAurora(auroraT);
  // 세인트 엘모의 불: 돛대 끝 푸른 빛 + 불꽃 입자
  if (F.elmo > 0) {
    if (!_elmoLight.parent) { p.mesh.userData.inner.add(_elmoLight); }
    const fl = p.mesh.userData.flag; _elmoLight.position.copy(fl.position); _elmoLight.intensity = 30 + Math.random() * 20;
    if (Math.random() < 0.6) {
      const wp = fl.getWorldPosition(_f);
      G.particles.spawn(wp.x + (Math.random() - 0.5), wp.y + 0.5, wp.z + (Math.random() - 0.5), (Math.random() - 0.5) * 2, 1 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.5, 2.5, 0x9fe4ff, 0);
    }
  } else if (_elmoLight.parent) { _elmoLight.parent.remove(_elmoLight); _elmoLight.intensity = 0; }
  // 해류: 진행 방향으로 밀어줌 + 물결 입자
  if (F.current > 0 && !p.finished) {
    p.draftMul = Math.max(p.draftMul, 1.22);
    if (Math.random() < 0.7) { const f = p.forward(); G.particles.spawn(p.pos.x + (Math.random() - 0.5) * 20, 0.6, p.pos.z + (Math.random() - 0.5) * 20, f.x * 30, 0, f.z * 30, 0.6, 2, 0x5cc8ff, 0); }
  }
  // 장애물 점진 등장: 레이스 진행률에 따라 하나씩
  if (G.state === 'racing' && G.track) {
    const frac = Math.max(0, Math.min(1, p.progress / (G.laps * G.track.totalLength)));
    const added = G.track.setDifficultyProgress(frac);
    if (added.includes('kraken')) hud.event(t('ev.newKraken'), 3000);
    else if (added.includes('whirl')) hud.event(t('ev.newWhirl'), 2500);
    else if (added.includes('rock') && Math.random() < 0.5) hud.event(t('ev.newRock'), 1800);
  }
  // 낮 → 밤 진행
  if (G.cycle && G.track) {
    const target = Math.max(0, Math.min(1, p.progress / (G.laps * G.track.totalLength)));
    G.phase += (target - G.phase) * Math.min(1, dt * 0.5);
    const lantern = G.env.setPhase(G.phase);
    for (const b of G.boats) b.mesh.userData.lantern.intensity = lantern * 30;
  }
}

function updateProgress(boat) {
  const tr = G.track;
  const { dist, idx } = tr.distToCurve(boat.pos.x, boat.pos.z, boat.curveIdx);
  boat.curveIdx = idx;
  boat.offDist = Math.max(0, dist - TRACK_HALF_WIDTH);
  // 가드레일: 로프 밖으로 나가면 안쪽으로 밀어 넣는다 (부드러운 벽)
  if (boat.railCd > 0) boat.railCd -= 1 / 60;
  if (dist > GUARD_OFFSET - 2 && dist < 400) {
    const c = tr.pointAt(idx);
    const dx = (boat.pos.x - c.x) / dist, dz = (boat.pos.z - c.z) / dist;
    const over = dist - (GUARD_OFFSET - 2);
    boat.pos.x -= dx * over; boat.pos.z -= dz * over;
    // 레일을 따라 미끄러지되 안쪽으로 튕김
    const inward = 14 + Math.min(20, over * 3);
    boat.slide.x -= dx * inward; boat.slide.z -= dz * inward;
    if (!(boat.railCd > 0)) {
      boat.railCd = 1.2;
      boat.speed *= 0.82;
      const tg = tr.tangentAt(idx);
      boat.heading += (Math.atan2(tg.x, tg.z) - boat.heading) * 0.25;
      G.particles.burst(boat.pos.x, 0.8, boat.pos.z, 18, { speed: 5, up: 6, life: 0.8, size: 3, color: 0xffffff });
      if (boat.isPlayer) { audio.hit(0.35); G.camShake = Math.max(G.camShake, 0.25); hud.event(t('ev.rail'), 1200); }
    }
    boat.offCourse = false; boat.offDist = 0;
    return updateProgressCore(boat, idx, dist);
  }
  const wasOff = boat.offCourse;
  boat.offCourse = dist > TRACK_HALF_WIDTH + 22;
  if (boat.isPlayer && boat.offCourse && !wasOff) { hud.event(t('ev.offcourse'), 2000); breakCombo(); }
  return updateProgressCore(boat, idx, dist);
}
function updateProgressCore(boat, idx, dist) {
  const tr = G.track;
  if (boat.finished) return;
  // 체크포인트
  const N = tr.sampleCount;
  const cpIdx = tr.checkpoints[boat.nextCp];
  const passed = ((idx - cpIdx) % N + N) % N;
  if (passed < 60 && dist < TRACK_HALF_WIDTH * 3) {
    const reached = boat.nextCp;
    boat.nextCp = (boat.nextCp + 1) % CHECKPOINT_COUNT;
    if (boat.nextCp === 1) {
      // 출발선 통과 = 랩 완료
      boat.lap++;
      if (boat.isPlayer) {
        if (boat.lap >= G.laps) finishBoat(boat);
        else {
          const lapT = G.raceTime - G.lastLapTime; G.lastLapTime = G.raceTime;
          G.stats.bestLap = Math.min(G.stats.bestLap, lapT);
          hud.centerMsg(boat.lap === G.laps - 1 ? t('center.final') : t('center.lap', { n: boat.lap + 1 }), boat.lap === G.laps - 1 ? '#ff8b6b' : '#ffe08a');
          award(500, t('pop.lap'), '#ffe08a', () => audio.lap());
          setTimeout(() => { if (G.state === 'racing') hud.event(`📜 ${TRIVIA[Math.floor(Math.random() * TRIVIA.length)]}`, 6000); }, 1200);
          hud.showPort(0, boat.lap, G.laps);
        }
      } else if (boat.lap >= G.laps) finishBoat(boat);
    } else if (boat.isPlayer && G.state === 'racing') {
      // 기항지 도착: 우측 상단 세계지도 + 역사 해설
      hud.showPort(reached, boat.lap, G.laps);
      addQuiet(40);
    }
  }
  let cum = tr.cum[idx];
  if (boat.nextCp !== 0) { const cpCum = tr.cum[tr.checkpoints[boat.nextCp]]; if (cum > cpCum + 250) cum = cpCum; }
  boat.progress = boat.lap * tr.totalLength + cum;
}

function finishBoat(boat) {
  boat.finished = true; boat.finishTime = G.raceTime;
  if (boat.isPlayer) {
    G.state = 'finished'; G.finishTimer = 3.0;
    const r = boat.rank;
    G.stats.rankPts = [0, 3000, 2000, 1200, 700, 400, 200][r] || 0;
    G.score += G.stats.rankPts;
    hud.centerMsg(r === 1 ? t('center.win') : t('center.rank', { r: ordinal(r) }), r === 1 ? '#ffe08a' : '#fff3d6');
    hud.setDraft(false, false); hud.setSpeedLines(0);
    audio.finish(r === 1); audio.bell();
    G.particles.burst(boat.pos.x, 6, boat.pos.z, 200, { speed: 20, up: 25, life: 2.2, size: 5, color: r === 1 ? 0xffe08a : 0x8fd4ff, grav: -10, spread: 10 });
  } else if (G.state === 'racing') {
    hud.event(t('ev.finished', { name: boat.name, ship: boat.def.name }), 2000);
  }
}

function updateRanks() {
  const sorted = [...G.boats].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1; if (b.finished) return 1;
    return b.progress - a.progress;
  });
  const prevRank = G.player.rank;
  sorted.forEach((b, i) => { b.rank = i + 1; });
  const p = G.player, O = G.overtake;
  if (G.state === 'racing' && G.raceTime > 4) {
    if (p.rank < prevRank && O.pending < 0) O.pending = 1.2; // 추월 후보: 1.2초 동안 순위를 지키면 인정
    if (p.rank > prevRank) {
      if (O.pending >= 0) O.pending = -1; // 바로 되추월당함 → 취소
      else if (p.rank > O.confirmed) hud.event(t('ev.overtaken', { r: ordinal(p.rank) }), 1500);
      O.confirmed = Math.max(O.confirmed, p.rank);
    }
  }
}
function updateOvertake(dt) {
  const p = G.player, O = G.overtake;
  if (O.pending >= 0) {
    O.pending -= dt;
    if (O.pending < 0) {
      if (p.rank < O.confirmed) {
        G.stats.overtakes++;
        award(200, p.rank === 1 ? t('pop.lead') : t('pop.overtake'), '#7bed9f', () => audio.overtake());
      }
      O.confirmed = p.rank; O.pending = -1;
    }
  }
}

function handleCollisions(dt) {
  const tr = G.track;
  for (const b of G.boats) {
    const R = b.phys.radius * 0.6;
    const fast = Math.abs(b.speed) > b.phys.maxSpeed * 0.55;
    // 장애물
    for (const o of tr.obstacles) {
      if (o.active === false || b.airborne) continue;
      const dx = b.pos.x - o.x, dz = b.pos.z - o.z; const d = Math.hypot(dx, dz);
      if (d < o.r + R) {
        const nx = dx / (d || 1), nz = dz / (d || 1);
        b.pos.x = o.x + nx * (o.r + R + 0.5); b.pos.z = o.z + nz * (o.r + R + 0.5);
        const strength = o.type === 'rock' ? 0.8 : 1.1;
        const spd = Math.abs(b.speed);
        b.hitObstacle(nx, nz, strength);
        G.particles.burst(b.pos.x - nx * R, 1, b.pos.z - nz * R, 25, { speed: 6, up: 8, life: 0.9, size: 3, color: 0xffffff });
        if (b.isPlayer) { audio.hit(Math.min(1, spd / 30)); hud.hitFlash(); G.camShake = 0.6; hud.event(o.type === 'rock' ? t('ev.rock') : t('ev.island'), 1500); breakCombo(); G.storm.hitDuring = true; o.nearT = G.t; }
        else if (b.pos.distanceTo(G.player.pos) < 120) audio.hit(0.4);
      } else if (b.isPlayer && fast && d < o.r + R + 9 && G.t - (o.nearT ?? -10) > 3 && G.state === 'racing') {
        // 니어미스: 빠른 속도로 스치듯 통과
        o.nearT = G.t; G.stats.nearMiss++;
        award(100, t('pop.near'), '#ff9a3c', () => { audio.whoosh(); audio.combo(G.combo); });
        G.camShake = Math.max(G.camShake, 0.15);
      }
    }
    // 소용돌이
    for (const w of tr.whirlpools) {
      if (w.active === false || b.airborne) continue;
      const dx = w.x - b.pos.x, dz = w.z - b.pos.z; const d = Math.hypot(dx, dz);
      if (d < w.r + 6 && b.whirlImmune <= 0 && !b.def.whirlImmune) {
        if (b.whirl <= 0 && b.isPlayer) { hud.event(t('ev.whirl'), 1800); audio.whirl(); G.camShake = 0.3; breakCombo(); }
        b.whirl = 0.3; b.whirlTime += dt;
        const pull = (0.4 + (1 - d / (w.r + 6)) * 0.6) * 26;
        b.slide.x += (dx / (d || 1)) * pull * dt; b.slide.z += (dz / (d || 1)) * pull * dt;
        b.spin = (Math.PI * 2) / 2.2; // 2.2초 동안 딱 한 바퀴 (어지러운 정도)
        if (b.whirlTime > 2.2) {
          const tg = G.track.tangentAt(b.curveIdx + 20);
          b.slide.x += tg.x * 45 - (dx / (d || 1)) * 30; b.slide.z += tg.z * 45 - (dz / (d || 1)) * 30;
          b.whirlImmune = 3; b.whirl = 0; b.whirlTime = 0;
          // 방향을 확 바꾸지 않고, 남은 각도만큼 짧게 돌아 항로 방향으로 정렬
          let dA = Math.atan2(tg.x, tg.z) - b.heading; while (dA > Math.PI) dA -= Math.PI * 2; while (dA < -Math.PI) dA += Math.PI * 2;
          b.spin = dA * 2.5;
          G.particles.burst(b.pos.x, 1, b.pos.z, 40, { speed: 10, up: 12, life: 1.2, size: 4, color: 0xdff6ff });
          if (b.isPlayer) { hud.event(t('ev.whirlOut'), 1500); audio.splash(); G.camShake = 0.5; }
        }
      } else if (b.isPlayer && fast && d < w.r + 14 && G.t - (w.nearT ?? -10) > 4 && G.state === 'racing') {
        w.nearT = G.t; G.stats.nearMiss++;
        award(120, t('pop.whirlNear'), '#8fd4ff', () => { audio.whoosh(); audio.combo(G.combo); });
      }
    }
    // 보급 통
    const pickR = b.def.pickupRadius ?? 1;
    for (const p of tr.pickups) {
      if (!p.active) continue;
      if (Math.hypot(p.x - b.pos.x, p.z - b.pos.z) < (p.r + R * 0.6) * pickR) {
        tr.collectPickup(p);
        b.boost = Math.min(1, b.boost + 0.35 * (b.def.pickupBonus ?? 1));
        G.particles.burst(p.x, 2, p.z, 30, { speed: 5, up: 7, life: 1.0, size: 3, color: 0xffe08a, grav: -6 });
        b.turbo = Math.max(b.turbo, 1.6);
        if (b.isPlayer) { audio.boost(); addQuiet(50); hud.event(t('ev.supply'), 1500); G.camShake = Math.max(G.camShake, 0.2); }
      }
    }
    // 부스터 패드 (모든 배)
    if (b.padCd > 0) b.padCd -= dt;
    for (const pad of tr.boostPads) {
      if (b.padCd > 0) break;
      if (Math.hypot(pad.x - b.pos.x, pad.z - b.pos.z) < pad.r + R * 0.4) {
        b.turbo = Math.max(b.turbo, 3); b.padCd = 4;
        const f = b.forward();
        G.particles.burst(b.pos.x - f.x * R, 1, b.pos.z - f.z * R, 30, { speed: 8, up: 6, life: 0.8, size: 4, color: 0xff9a3c, grav: -6 });
        if (b.isPlayer && G.state === 'racing') { award(80, t('pop.pad'), '#ff9a3c', () => audio.boost()); G.camShake = Math.max(G.camShake, 0.35); }
        else if (b.isPlayer) audio.boost();
      }
    }
    // 점프대: 진행 방향으로 밟으면 발사
    if (!b.airborne && b.rampCd <= 0) {
      const fx = Math.sin(b.heading), fz = Math.cos(b.heading);
      for (const rp of tr.ramps) {
        if (Math.hypot(rp.x - b.pos.x, rp.z - b.pos.z) < rp.r && fx * rp.tx + fz * rp.tz > 0.5 && Math.abs(b.speed) > 8) {
          if (b.launch()) {
            const f = b.forward();
            G.particles.burst(b.pos.x - f.x * R, 1, b.pos.z - f.z * R, 40, { speed: 9, up: 10, life: 1, size: 4, color: 0xdff6ff, grav: -8 });
            if (b.isPlayer && G.state === 'racing') { award(120, t('pop.jump'), '#8fd4ff', () => { audio.whoosh(); audio.boost(); }); G.camShake = Math.max(G.camShake, 0.3); }
            else if (b.isPlayer) audio.whoosh();
          }
          break;
        }
      }
    }
    // 착수: 물보라 + 체공 보너스
    if (b.justLanded) {
      b.justLanded = false;
      G.particles.burst(b.pos.x, 0.5, b.pos.z, 70, { speed: 12, up: 12, life: 1.3, size: 5, color: 0xffffff, grav: -12, spread: 6 });
      if (b.isPlayer) {
        audio.splash(); G.camShake = Math.max(G.camShake, 0.5);
        if (G.state === 'racing') { G.stats.jumps++; award(Math.round(60 + b.airTime * 60), t('pop.land', { s: b.airTime.toFixed(1) }), '#ffe08a', () => audio.combo(G.combo)); }
      } else if (b.pos.distanceTo(G.player.pos) < 150) audio.splash();
    }
    // 역사 인물 두루마리 / 발견 구슬 (플레이어만)
    if (b.isPlayer && G.state === 'racing') {
      for (const sc of tr.scrolls) {
        if (!sc.active) continue;
        if (Math.hypot(sc.x - b.pos.x, sc.z - b.pos.z) < (sc.r + R * 0.5) * pickR) {
          tr.collectScroll(sc); foundFigure();
          G.particles.burst(sc.x, 2, sc.z, 40, { speed: 5, up: 9, life: 1.2, size: 3.5, color: 0xffe08a, grav: -6 });
        }
      }
      for (const dc of tr.discoveries) {
        if (!dc.active) continue;
        if (Math.hypot(dc.x - b.pos.x, dc.z - b.pos.z) < (dc.r + R * 0.5) * pickR) {
          tr.collectDiscovery(dc); foundDiscovery();
          G.particles.burst(dc.x, 2, dc.z, 60, { speed: 7, up: 10, life: 1.4, size: 4, color: 0x8fd4ff, grav: -5, spread: 3 });
        }
      }
    }
    // 금화 / 보물 상자 (플레이어만)
    if (b.isPlayer && G.state === 'racing') {
      for (const c of tr.coins) {
        if (!c.active) continue;
        if (Math.hypot(c.x - b.pos.x, c.z - b.pos.z) < (c.r + R * 0.5) * pickR) {
          tr.collectCoin(c);
          G.stats.coins++; G.combo += 1; G.comboTimer = COMBO_WINDOW; G.stats.maxCombo = Math.max(G.stats.maxCombo, G.combo);
          addQuiet(20); audio.coin(G.combo);
          G.particles.burst(c.x, 2.5, c.z, 10, { speed: 3, up: 5, life: 0.7, size: 2.5, color: 0xffd54f, grav: -8 });
          if (G.combo % 5 === 0) hud.comboPop(t('pop.coinCombo'), `×${G.combo}`, '#ffd54f');
        }
      }
      for (const c of tr.chests) {
        if (!c.active) continue;
        if (Math.hypot(c.x - b.pos.x, c.z - b.pos.z) < (c.r + R * 0.6) * pickR) {
          tr.collectChest(c);
          b.boost = 1; G.stats.chests++;
          award(300, t('pop.chest'), '#ffd54f', () => audio.treasure());
          G.particles.burst(c.x, 2, c.z, 80, { speed: 9, up: 14, life: 1.6, size: 4, color: 0xffd54f, grav: -10, spread: 4 });
        }
      }
    }
    // 크라켄
    if (G.krakenActive) {
      for (const tt of tr.kraken.tentacles) {
        const dx = b.pos.x - tt.x, dz = b.pos.z - tt.z; const d = Math.hypot(dx, dz);
        if (d < tt.r + R) {
          const nx = dx / (d || 1), nz = dz / (d || 1);
          b.pos.x = tt.x + nx * (tt.r + R + 0.5); b.pos.z = tt.z + nz * (tt.r + R + 0.5);
          b.hitObstacle(nx, nz, 1.1); b.spin += 0.7;
          G.particles.burst(b.pos.x, 1, b.pos.z, 30, { speed: 8, up: 10, life: 1, size: 3, color: 0xd08ad8 });
          if (b.isPlayer) { audio.hit(1); hud.hitFlash(); G.camShake = 1; hud.event(t('ev.kraken'), 2000); breakCombo(); G.storm.hitDuring = true; }
        } else if (b.isPlayer && fast && d < tt.r + R + 8 && G.t - (tt.nearT ?? -10) > 3 && G.state === 'racing') {
          tt.nearT = G.t; G.stats.nearMiss++;
          award(150, t('pop.tentacle'), '#d08ad8', () => { audio.whoosh(); audio.combo(G.combo); });
        }
      }
    }
  }
  // 배끼리 충돌
  for (let i = 0; i < G.boats.length; i++) for (let j = i + 1; j < G.boats.length; j++) {
    const a = G.boats[i], b = G.boats[j];
    if (a.airborne || b.airborne) continue;
    const ra = a.phys.radius * 0.55, rb = b.phys.radius * 0.55;
    const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z; const d = Math.hypot(dx, dz);
    if (d < ra + rb && d > 0.001) {
      const nx = dx / d, nz = dz / d, overlap = ra + rb - d;
      const ma = a.phys.mass, mb = b.phys.mass, tot = ma + mb;
      a.pos.x -= nx * overlap * (mb / tot); a.pos.z -= nz * overlap * (mb / tot);
      b.pos.x += nx * overlap * (ma / tot); b.pos.z += nz * overlap * (ma / tot);
      const relSpeed = Math.abs(a.speed - b.speed) + 4;
      const k = Math.min(1, relSpeed / 40);
      a.hitObstacle(-nx, -nz, 0.35 * k * (mb / tot) * 2);
      b.hitObstacle(nx, nz, 0.35 * k * (ma / tot) * 2);
      G.particles.burst((a.pos.x + b.pos.x) / 2, 1.5, (a.pos.z + b.pos.z) / 2, 18, { speed: 5, up: 6, life: 0.8, size: 2.5, color: 0xffffff });
      if (a.isPlayer || b.isPlayer) { audio.hit(0.6 * k); G.camShake = Math.max(G.camShake, 0.35); const other = a.isPlayer ? b : a; if (Math.random() < 0.5) hud.event(t('ev.collide', { name: other.name, ship: other.def.name }), 1200); }
    }
  }
}

// ---------- 슬립스트림 (앞 배의 바람 그늘) ----------
function updateSlipstream(dt) {
  const p = G.player;
  if (p.finished || G.state !== 'racing') { p.draftMul = 1; hud.setDraft(false, false); return; }
  const fx = Math.sin(p.heading), fz = Math.cos(p.heading);
  let drafting = false;
  for (const b of G.boats) {
    if (b === p) continue;
    const dx = b.pos.x - p.pos.x, dz = b.pos.z - p.pos.z;
    const ahead = dx * fx + dz * fz, lateral = Math.abs(dx * fz - dz * fx);
    if (ahead > p.phys.radius && ahead < 48 && lateral < 7.5) { drafting = true; break; }
  }
  const D = G.draft;
  if (drafting) {
    D.t += dt; D.off = 0;
    p.draftMul = 1.14;
    p.boost = Math.min(1, p.boost + dt * 0.09);
    if (D.t > 1.3 && !D.awarded) { D.awarded = true; G.stats.slipstreams++; award(150, t('pop.draft'), '#8fd4ff'); }
    // 항적 파티클을 조금 더
    if (Math.random() < 0.5) G.particles.spawn(p.pos.x + fx * 6 + (Math.random() - 0.5) * 6, 2 + Math.random() * 3, p.pos.z + fz * 6 + (Math.random() - 0.5) * 6, -fx * 25, 0, -fz * 25, 0.4, 2, 0xbfe6ff, 0);
  } else {
    D.off += dt;
    if (D.off > 0.6) { D.t = 0; D.awarded = false; }
    p.draftMul = 1;
  }
  hud.setDraft(drafting, D.awarded);
}

// ---------- 포격 ----------
const ballGeo = new THREE.SphereGeometry(0.7, 8, 8);
const ballMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.4 });
function fireCannon(boat) {
  if (boat.cannonCd > 0 || boat.finished) return;
  boat.cannonCd = boat.phys.cannonCooldown;
  spawnBall(boat);
  if (boat.phys.doubleShot) setTimeout(() => { if (G.state === 'racing' || G.state === 'finished') spawnBall(boat); }, 220);
  if (boat.isPlayer) audio.cannon(); else if (boat.pos.distanceTo(G.player.pos) < 150) audio.cannon();
  G.particles.burst(boat.pos.x + Math.sin(boat.heading) * boat.phys.radius, 2.5, boat.pos.z + Math.cos(boat.heading) * boat.phys.radius, 14, { speed: 3, up: 3, life: 0.9, size: 5, color: 0x999999, grav: 1 });
}
function spawnBall(boat) {
  const f = boat.forward();
  const mesh = new THREE.Mesh(ballGeo, ballMat);
  const pos = boat.pos.clone().addScaledVector(f, boat.phys.radius + 1).setY(3);
  mesh.position.copy(pos);
  scene.add(mesh);
  const vel = f.clone().multiplyScalar(95 + boat.speed * 0.6).setY(9);
  G.projectiles.push({ mesh, pos, vel, owner: boat, life: 3 });
}
function updateProjectiles(dt) {
  for (let i = G.projectiles.length - 1; i >= 0; i--) {
    const p = G.projectiles[i];
    p.life -= dt; p.vel.y -= 18 * dt;
    p.pos.addScaledVector(p.vel, dt); p.mesh.position.copy(p.pos);
    let remove = p.life <= 0;
    if (p.pos.y < waveHeight(p.pos.x, p.pos.z, G.t)) {
      remove = true;
      G.particles.burst(p.pos.x, 0.5, p.pos.z, 16, { speed: 3, up: 9, life: 0.9, size: 3, color: 0xffffff });
      if (p.pos.distanceTo(G.player.pos) < 100) audio.splash();
    }
    if (!remove) for (const b of G.boats) {
      if (b === p.owner) continue;
      if (Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z) < b.phys.radius * 0.7 && p.pos.y < 6) {
        const d = p.vel.clone().setY(0).normalize();
        b.hitByCannon(d.x, d.z); b.lastHitBy = p.owner;
        if (p.owner.def.plunder) p.owner.boost = Math.min(1, p.owner.boost + 0.3);
        G.particles.burst(p.pos.x, 3, p.pos.z, 40, { speed: 9, up: 8, life: 1.1, size: 4, color: 0xff9800, grav: -8 });
        G.particles.burst(p.pos.x, 3, p.pos.z, 20, { speed: 4, up: 4, life: 1.6, size: 6, color: 0x444444, grav: 2 });
        if (b.isPlayer) { audio.hit(1); hud.hitFlash(); G.camShake = 0.9; hud.event(t('ev.hitBy', { name: p.owner.name }), 1800); breakCombo(); G.storm.hitDuring = true; }
        else if (p.owner.isPlayer) { award(180, p.owner.def.plunder ? t('pop.plunder') : t('pop.hit'), '#ff9800', () => { audio.hit(0.7); audio.combo(G.combo); }); }
        remove = true; break;
      }
    }
    if (remove) { scene.remove(p.mesh); G.projectiles.splice(i, 1); }
  }
}

// ---------- 카메라 ----------
const camTarget = new THREE.Vector3(), camPos = new THREE.Vector3(), _f = new THREE.Vector3(), _camOff = new THREE.Vector3();
function updateCamera(dt) {
  const p = G.player;
  p.forward(_f);
  const h = waveHeight(p.pos.x, p.pos.z, G.t);
  if (G.state === 'countdown') {
    const u = 1 - Math.max(0, G.countdown - 1) / 2.6; // 0 -> 1
    const ang = p.heading + Math.PI * 0.8 - u * Math.PI * 0.8;
    const r = 58 - u * 14;
    camPos.set(p.pos.x + Math.sin(ang) * r, 18 + (1 - u) * 8, p.pos.z + Math.cos(ang) * r);
    camTarget.set(p.pos.x, h + 6, p.pos.z);
    camera.position.lerp(camPos, Math.min(1, dt * 4));
    camera.lookAt(camTarget);
    camera.fov += (72 - camera.fov) * Math.min(1, dt * 3); camera.updateProjectionMatrix();
    return;
  }
  const speedRatio = Math.abs(p.speed) / p.phys.maxSpeed;
  const rush = Math.max(0, speedRatio - 0.75) * 4; // 고속 구간 0~1
  const turbo = p.turbo > 0 ? Math.min(1, p.turbo) : 0;
  const air = p.airborne ? Math.min(1, p.airY / 25) : 0;
  let dist, height, lookAhead, fovT;
  let targetY;
  // 추적 카메라: 속도가 붙어도 배가 작아지지 않도록 거리는 거의 고정, 배는 화면 아래쪽 1/3에 오도록 시선을 앞·위로
  // 표준 추적 카메라: 배 뒤 약간 위에서 내려다보며, 배는 화면 아래쪽 1/3
  if (G.camMode === 0) { dist = 31 + speedRatio * 2 + turbo * 2; height = 16 - rush * 1; lookAhead = 30 + rush * 4; targetY = 5; fovT = 68 + speedRatio * 6 + (p.boosting ? 6 : 0) + turbo * 10; }
  else if (G.camMode === 1) { dist = 60; height = 30; lookAhead = 50; targetY = 8; fovT = 66 + (p.boosting ? 8 : 0); }
  else { dist = -p.phys.radius * 0.9; height = 4.2; lookAhead = 90; targetY = 5; fovT = 80 + (p.boosting ? 12 : 0); }
  if (G.state === 'finished' || G.state === 'result') { const a = G.t * 0.4; camPos.set(p.pos.x + Math.sin(a) * 40, 16, p.pos.z + Math.cos(a) * 40); camTarget.set(p.pos.x, h + 3, p.pos.z); camera.position.lerp(camPos, Math.min(1, dt * 2)); camera.lookAt(camTarget); return; }
  camPos.set(p.pos.x - _f.x * (dist + air * 10), h * 0.5 + height + p.airY * 0.7 + air * 6, p.pos.z - _f.z * (dist + air * 10));
  camTarget.set(p.pos.x + _f.x * lookAhead, h + targetY + p.airY * 0.8, p.pos.z + _f.z * lookAhead);
  // 느린 숨결 같은 흔들림 (낭만적인 항해 느낌)
  camPos.y += Math.sin(G.t * 0.5) * 0.8; camPos.x += Math.sin(G.t * 0.33) * 0.6;
  // 배 기준 오프셋을 보간: 배가 아무리 빨라도 카메라가 뒤처져 멀어지지 않는다
  const lerp = G.camMode === 2 ? 1 : Math.min(1, dt * 4);
  _camOff.subVectors(camPos, p.pos);
  if (!G.camOffInit) { G.camOff.copy(_camOff); G.camOffInit = true; }
  G.camOff.lerp(_camOff, lerp);
  camera.position.copy(p.pos).add(G.camOff);
  const shake = G.camShake * 0.7 + SEA.storm * 0.05 + (p.boosting ? 0.03 : 0) + rush * 0.02;
  if (G.camShake > 0) G.camShake = Math.max(0, G.camShake - dt * 2.5);
  if (shake > 0) {
    camera.position.x += (Math.random() - 0.5) * shake * 2; camera.position.y += (Math.random() - 0.5) * shake * 1.5;
  }
  camera.lookAt(camTarget);
  // 선체 기울기에 맞춰 카메라도 아주 살짝 롤
  camera.rotateZ(-p.heel * 0.18);
  camera.fov += (fovT - camera.fov) * Math.min(1, dt * 2.5); camera.updateProjectionMatrix();
  hud.setSpeedLines(rush * 0.45 + (p.boosting ? 0.45 : 0) + (p.draftMul > 1 ? 0.2 : 0) + turbo * 0.8 + air * 0.4);
}

// ---------- 결과 ----------
function showResults() {
  G.state = 'result';
  if (audio.enabled) audio.playTheme();
  hud.hide();
  const sorted = [...G.boats].sort((a, b) => a.rank - b.rank);
  const me = G.player, st = G.stats;
  $('result-title').textContent = me.rank === 1 ? t('res.first') : me.rank <= 3 ? t('res.honor') : t('res.end');
  $('result-rank-big').textContent = me.rank === 1 ? t('res.rank1') : t('res.rank', { r: ordinal(me.rank) });
  drawPortrait($('result-portrait'), G.portrait, 128); $('result-admiral-name').textContent = me.name;
  const item = (label, v) => `<span>${label}<b>${v}</b></span>`;
  $('result-score').innerHTML = `<div class="total">${t('res.score', { s: G.score.toLocaleString() })}</div>` +
    item(t('res.rankPts'), st.rankPts.toLocaleString()) + item(t('res.maxCombo'), '×' + st.maxCombo) + item(t('res.near'), st.nearMiss) + item(t('res.overtake'), st.overtakes) +
    item(t('res.draft'), st.slipstreams) + item(t('res.tap'), G.tap.bursts) + item(t('res.coins'), st.coins) + item(t('res.chests'), st.chests) + item(t('res.storms'), st.storms) + item(t('res.jumps'), st.jumps) +
    (st.perfectStart ? item(t('res.perfect'), '✔') : '') + (st.bestLap < Infinity ? item(t('res.bestLap'), formatTime(st.bestLap)) : '');
  const L = G.learned;
  const tags = (arr, cls) => arr.map((n) => `<span class="tag ${cls}">${n}</span>`).join('');
  $('result-learned').innerHTML = `<h4>${t('res.learned')}</h4>` +
    `<div>${t('res.learnedLine', { e: L.events, f: L.figures.length, d: L.discoveries.length })}</div>` +
    (L.figures.length ? `<div style="margin-top:6px">${tags(L.figures, 'f')}</div>` : '') +
    (L.discoveries.length ? `<div style="margin-top:4px">${tags(L.discoveries, 'd')}</div>` : '');
  $('result-table').innerHTML = sorted.map((b) => `<tr class="${b.isPlayer ? 'me' : ''}"><td class="rank">${b.rank}</td><td><span style="color:${b.color}">■</span> ${b.name}</td><td>${b.def.name}</td><td>${b.finished ? formatTime(b.finishTime) : t('res.sailing')}</td></tr>`).join('');
  $('result-screen').classList.remove('hidden');
}

// ---------- 메인 루프 ----------
function loop() {
  requestAnimationFrame(loop);
  step();
}
function step() {
  const dt = G.fixedDt ?? Math.min(clock.getDelta(), 0.05);
  G.t += dt;
  const st = G.state;
  if (st === 'title' || st === 'select') {
    if (!G.attract) startAttract();
    const tr = G.track;
    G.env.update(G.t, camera.position);
    tr.update(dt, G.t); G.gulls.update(G.t); G.particles.update(dt); updateWind(dt); tr.updateKraken(dt);
    const diff = difficultyParams('normal');
    for (const b of G.boats) {
      aiControl(b, tr, G.boats, G.boats[0], G.wind, dt, diff, false);
      b.boosting = false;
      b.update(dt, G.wind, G.t);
      const sr = Math.abs(b.speed) / b.phys.maxSpeed;
      if (sr > 0.2) { const f = b.forward(); G.particles.spawn(b.pos.x - f.x * b.phys.radius * 0.8 + (Math.random() - 0.5) * 3, 0.4, b.pos.z - f.z * b.phys.radius * 0.8, (Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4, 1.5, 3 + sr * 3, 0xe8f6ff, 0); }
    }
    handleCollisions(dt);
    for (const b of G.boats) updateProgress(b);
    const lead = G.boats[0];
    const a = G.t * 0.25;
    const h = waveHeight(lead.pos.x, lead.pos.z, G.t);
    camPos.set(lead.pos.x + Math.sin(a) * 45, h + 14 + Math.sin(G.t * 0.5) * 3, lead.pos.z + Math.cos(a) * 45);
    camera.position.lerp(camPos, Math.min(1, dt * 2));
    camTarget.set(lead.pos.x, h + 3, lead.pos.z);
    camera.lookAt(camTarget);
    renderer.render(scene, camera);
    return;
  }

  const tr = G.track;
  G.env.update(G.t, camera.position);
  tr.update(dt, G.t);
  G.gulls.update(G.t);
  G.particles.update(dt);
  updateWind(dt);
  updateStorm(dt);
  updateEffects(dt);
  updateChronicle(dt);
  hud.updateKnowledge(dt);

  // 크라켄
  const kr = tr.updateKraken(dt);
  G.krakenActive = kr.active;
  if (kr.rose && (st === 'racing') && Math.hypot(G.player.pos.x - tr.kraken.x, G.player.pos.z - tr.kraken.z) < 320) { hud.event(t('ev.krakenRise'), 2500); audio.kraken(); G.camShake = 0.5; }

  // 카운트다운
  if (st === 'countdown') {
    G.countdown -= dt;
    const step = Math.ceil(G.countdown);
    if (step !== G.countStep && step <= 3) {
      G.countStep = step;
      if (step >= 1) { hud.centerMsg(String(step)); audio.countdown(); }
    }
    if (G.countdown <= 0) {
      G.state = 'racing'; G.goTime = G.t; hud.centerMsg(t('center.go'), '#7bed9f'); audio.go();
      G.overtake = { pending: -1, confirmed: G.player.rank };
      // 퍼펙트 스타트: GO 직전 0.45초 안에 전진 키를 눌렀으면 보너스
      const k = G.keys, p = G.player;
      const held = k.KeyW || k.ArrowUp || PTR.down || VK.up;
      if (held && G.throttleKeyTime >= 0 && G.t - G.throttleKeyTime < 0.45) {
        p.speed = p.phys.maxSpeed * 0.6; G.stats.perfectStart = true;
        setTimeout(() => { award(300, t('pop.perfect'), '#7bed9f', () => audio.perfect()); }, 350);
        G.particles.burst(p.pos.x, 1, p.pos.z, 50, { speed: 12, up: 6, life: 1, size: 3, color: 0x7bed9f });
      } else if (held) hud.event(t('ev.earlyStart'), 2500);
    }
    for (const b of G.boats) { b.throttle = 0; b.steer = 0; b.update(dt, G.wind, G.t); }
    updateCamera(dt);
    hud.setRace(G.player.rank, G.boats.length, 1, G.laps, 0);
    hud.setShip(G.player, G.wind);
    hud.updatePortCard(0, G.t);
    hud.drawMinimap(tr, G.boats, G.player, G.krakenActive);
    renderer.render(scene, camera);
    return;
  }

  if (st === 'racing' || st === 'finished') {
    if (st === 'racing') G.raceTime += dt;
    const diff = difficultyParams(G.difficulty);
    const p = G.player;
    // 콤보 타이머
    if (G.comboTimer > 0) { G.comboTimer -= dt; if (G.comboTimer <= 0) { G.combo = 0; hud.el.combo.classList.add('hidden'); } }
    // 플레이어 입력
    if (G.autoPlayer && !p.finished) { if (aiControl(p, tr, G.boats, p, G.wind, dt, diff, G.krakenActive)) fireCannon(p); }
    else if (!p.finished) {
      const k = G.keys;
      p.throttle = (k.KeyW || k.ArrowUp || VK.up || PTR.down) ? 1 : (k.KeyS || k.ArrowDown || VK.down) ? -0.3 : 0.35;
      const keySteer = ((k.KeyA || k.ArrowLeft || VK.left) ? 1 : 0) - ((k.KeyD || k.ArrowRight || VK.right) ? 1 : 0);
      p.steer = keySteer !== 0 ? keySteer : PTR.steer;
      const wantBoost = !!(k.ShiftLeft || k.ShiftRight || PTR.boost || VK.boost);
      if (wantBoost && !p.boosting && p.boost > 0.08) { p.boosting = true; audio.boost(); }
      if (!wantBoost) p.boosting = false;
      if (k.Space) fireCannon(p);
    } else { p.throttle = 0.4; p.steer = 0; p.boosting = false; }

    updateSlipstream(dt);
    updateTap(dt);
    updateWrongWay(dt);

    for (const b of G.boats) {
      if (!b.isPlayer) {
        if (b.finished) { b.throttle = 0.5; b.steer = 0; b.boosting = false; }
        else if (aiControl(b, tr, G.boats, p, G.wind, dt, diff, G.krakenActive)) fireCannon(b);
      }
      b.update(dt, G.wind, G.t);
      // 항적 파티클
      const sr = Math.abs(b.speed) / b.phys.maxSpeed;
      if (sr > 0.1) {
        const n = Math.floor(sr * 3 + Math.random());
        for (let i = 0; i < n; i++) {
          const f = b.forward(); const R = b.phys.radius;
          G.particles.spawn(b.pos.x - f.x * R * 0.8 + (Math.random() - 0.5) * 3, 0.4, b.pos.z - f.z * R * 0.8 + (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 6 - f.x * 3, 0, (Math.random() - 0.5) * 6 - f.z * 3, 1.2 + Math.random(), 2.2 + sr * 2.5, b.boosting ? 0xffe08a : 0xe8f6ff, 0);
          if (sr > 0.5 && Math.random() < 0.6 + SEA.storm * 0.4) G.particles.spawn(b.pos.x + f.x * R * 0.9, 1.5, b.pos.z + f.z * R * 0.9, (Math.random() - 0.5) * 8, 4 + Math.random() * 3 + SEA.storm * 5, (Math.random() - 0.5) * 8, 0.7, 2.5 + SEA.storm * 2, 0xffffff, -14);
        }
      }
      if (b.boosting && b.def.turtle) { const f = b.forward(); G.particles.spawn(b.pos.x + f.x * (b.phys.radius + 2), 2, b.pos.z + f.z * (b.phys.radius + 2), f.x * 20 + (Math.random() - 0.5) * 6, 2, f.z * 20 + (Math.random() - 0.5) * 6, 0.5, 5, 0xff7043, 0); }
    }
    handleCollisions(dt);
    for (const b of G.boats) updateProgress(b);
    updateRanks();
    updateOvertake(dt);
    updateProjectiles(dt);
    updateCamera(dt);

    audio.setSpeed(Math.abs(p.speed) / p.phys.maxSpeed + SEA.storm * 0.4, p.boosting);
    hud.setRace(p.rank, G.boats.length, p.lap + 1, G.laps, p.finished ? p.finishTime : G.raceTime);
    hud.setShip(p, G.wind);
    hud.setScore(G.score, G.combo, G.comboTimer / COMBO_WINDOW);
    hud.standings(G.boats);
    hud.updatePortCard(p.curveIdx / tr.sampleCount, G.t);
    hud.drawMinimap(tr, G.boats, p, G.krakenActive);

    if (st === 'finished') {
      G.finishTimer -= dt;
      const allDone = G.boats.every((b) => b.finished);
      if (G.finishTimer <= 0 || allDone) { showResults(); }
    }
  } else if (st === 'result') {
    for (const b of G.boats) { b.throttle = 0; b.update(dt, G.wind, G.t); }
    updateCamera(dt);
  }
  renderer.render(scene, camera);
}
window.__G = G; // 디버그용
window.__dbg = { award, finishBoat, showResults, breakCombo, step, renderer, audio }; // 테스트용 훅
loop();
