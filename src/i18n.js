// 언어 설정 (한국어 기본, 영어 선택). 정적 HTML은 data-i18n 속성으로, 동적 문자열은 t()로, 데이터는 applyEnglishData()로 바꾼다.
import { PORTS, TRIVIA, EVENTS, FIGURES, DISCOVERIES } from './history.js?v=20260912153205';
import { SHIPS, SHIP_CATEGORIES, AI_NAMES } from './ships.js?v=20260912153205';
import { EN_DATA } from './i18n-data.js?v=20260912153205';

export const LANG = (() => { try { return localStorage.getItem('hr_lang') || 'ko'; } catch (_) { return 'ko'; } })();
export function setLang(l) { try { localStorage.setItem('hr_lang', l); } catch (_) { /* 무시 */ } location.reload(); }

const UI = {
  ko: {
    // 타이틀
    'title.sub': 'AGE OF SAIL', 'title.main': '대항해시대 레이싱',
    'title.desc': '리스본에서 출항해 희망봉·캘리컷·나가사키·아카풀코를 거쳐 세계를 세 바퀴. 바람을 읽고, 폭풍을 뚫고, 가장 먼저 돌아오라!',
    'title.start': '출항 준비',
    'hint.w': 'W/↑ 전진', 'hint.s': 'S/↓ 감속', 'hint.ad': 'A/D ←/→ 조타', 'hint.shift': 'SHIFT 연타 급가속 / 꾹 전속 항해', 'hint.mouse': '🖱/👆 누른 채 좌우 조타 · 연타 급가속', 'hint.space': 'SPACE 포격', 'hint.c': 'C 카메라', 'hint.m': 'M 음악', 'hint.esc': 'ESC 함선 선택',
    'tip.near': '⚡ 아슬아슬하게 스치면 <b>니어미스</b>', 'tip.draft': '🌀 앞 배 뒤에 붙으면 <b>슬립스트림</b>', 'tip.coin': '🪙 금화·보물로 <b>콤보</b>', 'tip.storm': '⛈ 폭풍 속 파도를 넘어라', 'tip.scroll': '📜 두루마리로 <b>역사 인물</b> 발견', 'tip.orb': '🔮 발견 구슬로 <b>오로라·해류</b> 체험', 'tip.jump': '🚀 점프대를 밟으면 <b>하늘을 날아</b> 초고속',
    'music.label': '♪ 배경음악: ', 'music.checking': '확인 중…', 'music.ext': 'assets/music 폴더의 {n}곡 재생', 'music.synth': '내장 뱃노래 (assets/music/bgm.mp3 를 넣으면 그 곡을 재생)', 'music.synthName': '내장 뱃노래',
    'lang.label': '언어', 'mobile.rotate': '가로 화면으로 돌려주세요', 'select.map': '맵', 'menu.title': '메뉴', 'menu.mapRestart': '🗺 맵을 바꿔 새로 시작', 'menu.select': '⛵ 함선 선택으로', 'menu.home': '🏠 메인으로', 'music.playlist': '플레이리스트 · 클릭하면 재생', 'music.main': '메인 테마', 'music.now': '재생 중', 'gate.title': '대항해시대 레이싱', 'gate.text': '🔊 화면을 클릭하면 메인 테마와 함께 항해가 시작됩니다',
    // 선택
    'select.title': '함선을 선택하세요', 'select.laps': '랩 수', 'select.lap1': '1랩', 'select.lap2': '2랩', 'select.lap3': '3랩',
    'select.diff': '난이도', 'diff.easy': '견습 항해사', 'diff.normal': '일등 항해사', 'diff.hard': '전설의 제독',
    'select.time': '시간대', 'time.cycle': '낮 → 석양 → 밤', 'time.random': '무작위(고정)', 'time.day': '한낮', 'time.sunset': '석양', 'time.night': '달밤',
    'select.go': '출항!', 'select.types': '{n}종', 'ship.selected': '✔ 선택됨', 'select.name': '제독 이름', 'select.portrait': '제독 초상', 'select.portraitHint': '초상을 고르면 이름 칸이 비어 있을 때 그 이름이 채워집니다', 'name.placeholder': '이름을 입력하세요', 'hud.admiral': '제독', 'name.default': '이름 없는 제독',
    'stat.speed': '속도', 'stat.accel': '가속', 'stat.handling': '조타', 'stat.dur': '내구',
    // HUD
    'hud.rank': '위', 'hud.wind': '바람 <span id="wind-strength">0</span>노트', 'hud.knots': '노트', 'hud.score': '점수', 'hud.combo': '콤보',
    'hud.tap': '연타 부스트 · <b>SHIFT 연타</b>', 'hud.boost': '전속 항해 · SHIFT 꾹', 'hud.cannon': '포격 (SPACE)',
    'hud.offcourse': '⚠ 항로 이탈! 항로로 복귀하세요', 'hud.wrongWay': '⛔ 역방향! 방향을 돌리세요', 'hud.draft': '🌀 슬립스트림', 'hud.storm': '⛈ 폭풍 접근!',
    'hud.tapHint': '⚡ <b>SHIFT 연타</b> = 급가속 버스트 &nbsp;·&nbsp; <b>SHIFT 꾹</b> = 전속 항해<br><small>🖱 마우스/터치: 누른 채 좌우로 조타 · 빠르게 두드리면 급가속 · 우클릭/두 손가락 = 전속 항해</small>', 'hud.fireBtn': '💣 포격',
    'hud.me': '나 (선장)', 'hud.tailwind': '순풍 +', 'hud.headwind': '역풍 ',
    'port.lap': '세계 일주 {lap}회차 · {i}/{n} 기항지',
    'kc.event': '연대기 · 대항해시대', 'kc.figure': '📜 역사 인물 발견', 'kc.discovery': '🔮 발견 · {kind}', 'kc.guide': '항해 안내', 'kc.guideDate': '세계 일주 {n}회',
    'kc.guideTitle': '리스본에서 출항합니다', 'kc.guideText': '항해 중 우측에 연대기가 흐릅니다. 📜 두루마리를 밟으면 역사 인물을, 🔮 발견 구슬을 밟으면 오로라·해류 같은 현상을 만납니다. 🔥 주황 화살표 패드는 부스터, 🚀 나무 점프대를 밟으면 하늘을 납니다!',
    'eff.aurora': '하늘에 오로라가 펼쳐집니다 (25초)', 'eff.elmo': '돛대 끝에 푸른 불꽃이 맺힙니다', 'eff.tradewind': '12초 동안 바람이 내 편이 됩니다', 'eff.current': '10초 동안 해류가 배를 밀어줍니다', 'eff.citrus': '선원이 건강해져 전속 항해 게이지가 가득 찹니다', 'eff.bonus': '15초 동안 획득 점수 2배',
    // 이벤트 메시지
    'ev.start': '{label} 항해 · 세계 일주 {laps}회 · {diff}', 'ev.gust': '💨 돌풍! 바람의 방향이 바뀝니다 — 나침반을 확인하세요',
    'ev.stormWarn': '⛈ 수평선에 먹구름! 폭풍이 다가옵니다', 'ev.stormIn': '🌊 폭풍 돌입! 파도에 배가 밀립니다 — 항로를 지키세요', 'ev.stormOut': '☀ 폭풍이 지나갔습니다',
    'ev.offcourse': '⚠ 항로를 벗어났습니다! 역류로 속도가 떨어집니다', 'ev.rail': '🪢 가드레일! 항로 안으로 돌아갑니다',
    'ev.lapTime': '랩 타임 {t}', 'ev.finished': '{name}의 {ship}이(가) 완주했습니다!', 'ev.overtaken': '추월당했습니다! 현재 {r}',
    'ev.rock': '💥 암초에 부딪혔습니다!', 'ev.island': '💥 섬에 충돌!', 'ev.whirl': '🌀 소용돌이에 휘말렸습니다! 조타로 빠져나가세요', 'ev.whirlOut': '🌊 소용돌이에서 튕겨져 나왔다!',
    'ev.supply': '🛢 보급품! 부스터 점화 + 게이지 +35%', 'ev.kraken': '🐙 크라켄의 촉수에 붙잡혔다!', 'ev.krakenRise': '🐙 크라켄 출현! 촉수를 피하세요!',
    'ev.collide': '⚔ {name}의 {ship}과(와) 충돌!', 'ev.hitBy': '💣 {name}의 포격에 맞았다!', 'ev.comboBreak': '콤보 끊김 (×{n})',
    'ev.music.on': '♪ 음악 켜짐', 'ev.music.off': '♪ 음악 꺼짐', 'ev.earlyStart': '출발이 조금 빨랐습니다 — GO 직전에 W를 누르면 퍼펙트 스타트!',
    'ev.newRock': '⚠ 항로에 새 암초가 드러났습니다', 'ev.newWhirl': '🌀 항로에 소용돌이가 생겼습니다!', 'ev.newKraken': '🐙 바다가 술렁입니다… 크라켄 구역이 열렸습니다',
    // 팝업
    'pop.near': '아슬아슬!', 'pop.whirlNear': '소용돌이 스침!', 'pop.tentacle': '촉수 회피!', 'pop.storm': '폭풍 돌파!', 'pop.lap': '세계 일주 완료!', 'pop.lead': '선두 탈환!', 'pop.overtake': '추월!',
    'pop.draft': '슬립스트림!', 'pop.coinCombo': '금화 콤보!', 'pop.chest': '💰 보물 발견!', 'pop.hit': '🎯 명중!', 'pop.plunder': '🏴‍☠️ 약탈 명중!', 'pop.pad': '🔥 부스터!', 'pop.perfect': '퍼펙트 스타트!',
    'pop.figure': '📜 인물 발견!', 'pop.tapBurst': '⚡ 연타 부스트!', 'pop.tapSub': '급가속!', 'pop.jump': '🚀 점프!', 'pop.land': '착수! 체공 {s}초',
    'center.final': 'FINAL LAP!', 'center.lap': '세계 일주 {n}회차', 'center.win': '🏆 1위!', 'center.rank': '{r} 완주!', 'center.go': 'GO!',
    // 결과
    'res.first': '신대륙 최초 도달!', 'res.honor': '명예로운 항해', 'res.end': '레이스 종료', 'res.rank1': '🏆 1위', 'res.rank': '{r}', 'res.score': '점수 {s}',
    'res.rankPts': '순위 보너스', 'res.maxCombo': '최대 콤보', 'res.near': '니어미스', 'res.overtake': '추월', 'res.draft': '슬립스트림', 'res.tap': '연타 부스트', 'res.coins': '금화', 'res.chests': '보물', 'res.storms': '폭풍 돌파', 'res.jumps': '점프', 'res.perfect': '퍼펙트 스타트', 'res.bestLap': '최고 랩',
    'res.learned': '📚 이번 항해에서 배운 역사', 'res.learnedLine': '연대기 {e}건 열람 · 인물 {f}명 · 발견 {d}건', 'res.sailing': '항해 중', 'res.retry': '다시 출항', 'res.select': '함선 변경',
  },
  en: {
    'title.sub': 'AGE OF SAIL', 'title.main': 'Age of Sail Racing',
    'title.desc': 'Set sail from Lisbon, round the Cape, touch Calicut, Nagasaki and Acapulco, and circle the world three times. Read the wind, ride out the storms, and be first home!',
    'title.start': 'Prepare to Sail',
    'hint.w': 'W/↑ Forward', 'hint.s': 'S/↓ Slow', 'hint.ad': 'A/D ←/→ Steer', 'hint.shift': 'SHIFT tap = burst / hold = full sail', 'hint.mouse': '🖱/👆 hold & drag to steer · taps = burst', 'hint.space': 'SPACE Fire', 'hint.c': 'C Camera', 'hint.m': 'M Music', 'hint.esc': 'ESC Ship select',
    'tip.near': '⚡ Graze hazards for a <b>Near Miss</b>', 'tip.draft': '🌀 Tuck behind a ship to <b>Slipstream</b>', 'tip.coin': '🪙 Coins & treasure build <b>Combos</b>', 'tip.storm': '⛈ Ride the storm waves', 'tip.scroll': '📜 Scrolls reveal <b>historical figures</b>', 'tip.orb': '🔮 Discovery orbs trigger <b>auroras & currents</b>', 'tip.jump': '🚀 Hit a ramp to <b>fly</b> at top speed',
    'music.label': '♪ Music: ', 'music.checking': 'checking…', 'music.ext': 'playing {n} track(s) from assets/music', 'music.synth': 'built-in shanty (drop assets/music/bgm.mp3 to play your own)', 'music.synthName': 'Built-in shanty',
    'lang.label': 'Language', 'mobile.rotate': 'Please rotate to landscape', 'select.map': 'Map', 'menu.title': 'Menu', 'menu.mapRestart': '🗺 Restart on another map', 'menu.select': '⛵ Ship select', 'menu.home': '🏠 Main menu', 'music.playlist': 'Playlist · click to play', 'music.main': 'Main theme', 'music.now': 'Now playing', 'gate.title': 'Age of Sail Racing', 'gate.text': '🔊 Click anywhere to begin with the main theme',
    'select.title': 'Choose Your Ship', 'select.laps': 'Laps', 'select.lap1': '1 lap', 'select.lap2': '2 laps', 'select.lap3': '3 laps',
    'select.diff': 'Difficulty', 'diff.easy': 'Apprentice', 'diff.normal': 'First Mate', 'diff.hard': 'Legendary Admiral',
    'select.time': 'Time of day', 'time.cycle': 'Day → Sunset → Night', 'time.random': 'Random (fixed)', 'time.day': 'Noon', 'time.sunset': 'Sunset', 'time.night': 'Moonlit night',
    'select.go': 'Set Sail!', 'select.types': '{n} types', 'ship.selected': '✔ Selected', 'select.name': 'Admiral', 'select.portrait': 'Admiral Portrait', 'select.portraitHint': 'Picking a portrait fills the name box if it is empty', 'name.placeholder': 'Enter your name', 'hud.admiral': 'ADMIRAL', 'name.default': 'Nameless Admiral',
    'stat.speed': 'Speed', 'stat.accel': 'Accel', 'stat.handling': 'Steer', 'stat.dur': 'Hull',
    'hud.rank': '', 'hud.wind': 'Wind <span id="wind-strength">0</span> kn', 'hud.knots': 'kn', 'hud.score': 'Score', 'hud.combo': 'combo',
    'hud.tap': 'Tap Boost · <b>tap SHIFT</b>', 'hud.boost': 'Full Sail · hold SHIFT', 'hud.cannon': 'Cannon (SPACE)',
    'hud.offcourse': '⚠ Off course! Return to the route', 'hud.wrongWay': '⛔ WRONG WAY! Turn around', 'hud.draft': '🌀 Slipstream', 'hud.storm': '⛈ Storm incoming!',
    'hud.tapHint': '⚡ <b>Tap SHIFT</b> = speed burst &nbsp;·&nbsp; <b>Hold SHIFT</b> = full sail<br><small>🖱 Mouse/touch: hold and drag sideways to steer · rapid taps = burst · right-click / two fingers = full sail</small>', 'hud.fireBtn': '💣 Fire',
    'hud.me': 'You (Captain)', 'hud.tailwind': 'Tailwind +', 'hud.headwind': 'Headwind ',
    'port.lap': 'Voyage {lap} · port {i}/{n}',
    'kc.event': 'Chronicle · Age of Discovery', 'kc.figure': '📜 Historical Figure', 'kc.discovery': '🔮 Discovery · {kind}', 'kc.guide': 'Voyage Guide', 'kc.guideDate': '{n} circumnavigations',
    'kc.guideTitle': 'Departing Lisbon', 'kc.guideText': 'A chronicle scrolls on the right as you sail. 📜 Scrolls reveal historical figures; 🔮 orbs reveal phenomena like auroras and currents. 🔥 Orange arrow pads are boosters, 🚀 wooden ramps launch you into the sky!',
    'eff.aurora': 'An aurora unfolds across the sky (25 s)', 'eff.elmo': 'Blue flames dance on the masthead', 'eff.tradewind': 'The wind is at your back for 12 s', 'eff.current': 'A current pushes you along for 10 s', 'eff.citrus': 'The crew recovers: full-sail gauge filled', 'eff.bonus': 'Double points for 15 s',
    'ev.start': '{label} voyage · {laps} laps around the world · {diff}', 'ev.gust': '💨 Gust! The wind is shifting — check the compass',
    'ev.stormWarn': '⛈ Dark clouds on the horizon! A storm is coming', 'ev.stormIn': '🌊 Into the storm! Waves push the ship — hold your course', 'ev.stormOut': '☀ The storm has passed',
    'ev.offcourse': '⚠ Off course! Countercurrents slow you down', 'ev.rail': '🪢 Guard rope! Back onto the route',
    'ev.lapTime': 'Lap time {t}', 'ev.finished': "{name}'s {ship} has finished!", 'ev.overtaken': 'Overtaken! Now {r}',
    'ev.rock': '💥 Struck a reef!', 'ev.island': '💥 Ran into an island!', 'ev.whirl': '🌀 Caught in a whirlpool! Steer out', 'ev.whirlOut': '🌊 Flung out of the whirlpool!',
    'ev.supply': '🛢 Supplies! Booster lit + gauge +35%', 'ev.kraken': '🐙 Seized by the kraken!', 'ev.krakenRise': '🐙 Kraken rising! Dodge the tentacles!',
    'ev.collide': "⚔ Collided with {name}'s {ship}!", 'ev.hitBy': "💣 Hit by {name}'s cannon!", 'ev.comboBreak': 'Combo lost (×{n})',
    'ev.music.on': '♪ Music on', 'ev.music.off': '♪ Music off', 'ev.earlyStart': 'A bit early — press W right before GO for a perfect start!',
    'ev.newRock': '⚠ A new reef has surfaced on the route', 'ev.newWhirl': '🌀 A whirlpool has formed on the route!', 'ev.newKraken': '🐙 The sea stirs… the kraken zone is open',
    'pop.near': 'Near Miss!', 'pop.whirlNear': 'Whirlpool graze!', 'pop.tentacle': 'Tentacle dodge!', 'pop.storm': 'Storm survived!', 'pop.lap': 'Circumnavigation!', 'pop.lead': 'Lead retaken!', 'pop.overtake': 'Overtake!',
    'pop.draft': 'Slipstream!', 'pop.coinCombo': 'Coin combo!', 'pop.chest': '💰 Treasure!', 'pop.hit': '🎯 Direct hit!', 'pop.plunder': '🏴‍☠️ Plunder hit!', 'pop.pad': '🔥 Booster!', 'pop.perfect': 'Perfect start!',
    'pop.figure': '📜 Figure found!', 'pop.tapBurst': '⚡ Tap Boost!', 'pop.tapSub': 'Burst!', 'pop.jump': '🚀 Jump!', 'pop.land': 'Splashdown! {s}s airborne',
    'center.final': 'FINAL LAP!', 'center.lap': 'Voyage {n}', 'center.win': '🏆 1st!', 'center.rank': 'Finished {r}!', 'center.go': 'GO!',
    'res.first': 'First to the New World!', 'res.honor': 'An Honorable Voyage', 'res.end': 'Race Over', 'res.rank1': '🏆 1st', 'res.rank': '{r}', 'res.score': 'Score {s}',
    'res.rankPts': 'Rank bonus', 'res.maxCombo': 'Max combo', 'res.near': 'Near misses', 'res.overtake': 'Overtakes', 'res.draft': 'Slipstreams', 'res.tap': 'Tap boosts', 'res.coins': 'Coins', 'res.chests': 'Treasure', 'res.storms': 'Storms survived', 'res.jumps': 'Jumps', 'res.perfect': 'Perfect start', 'res.bestLap': 'Best lap',
    'res.learned': '📚 History learned on this voyage', 'res.learnedLine': '{e} chronicle entries · {f} figures · {d} discoveries', 'res.sailing': 'still sailing', 'res.retry': 'Sail Again', 'res.select': 'Change Ship',
  },
};

export function t(key, vars) {
  let s = (UI[LANG] && UI[LANG][key]) ?? UI.ko[key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}
export const ordinal = (n) => LANG === 'en' ? (n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : Math.min(n % 10, 4) % 4] || 'th')) : n + '위';

// index.html의 data-i18n 요소를 현재 언어로 바꾼다
export function applyStaticI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach((el) => { const k = el.dataset.i18n; if (UI[LANG][k] != null) el.innerHTML = UI[LANG][k]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { const k = el.dataset.i18nPlaceholder; if (UI[LANG][k] != null) el.placeholder = UI[LANG][k]; });
  const sel = document.getElementById('lang-select'); if (sel) sel.value = LANG;
}

// 영어 선택 시 데이터 객체를 영어 내용으로 덮어쓴다 (필드 이름은 그대로 유지)
export function applyEnglishData() {
  if (LANG !== 'en') return;
  const D = EN_DATA;
  PORTS.forEach((p, i) => Object.assign(p, D.ports[i]));
  EVENTS.forEach((e, i) => Object.assign(e, D.events[i]));
  FIGURES.forEach((f, i) => Object.assign(f, D.figures[i]));
  DISCOVERIES.forEach((d, i) => Object.assign(d, D.discoveries[i]));
  TRIVIA.splice(0, TRIVIA.length, ...D.trivia);
  for (const s of SHIPS) if (D.ships[s.id]) Object.assign(s, D.ships[s.id]);
  Object.assign(SHIP_CATEGORIES.sail, D.categories.sail); Object.assign(SHIP_CATEGORIES.galley, D.categories.galley); Object.assign(SHIP_CATEGORIES.special, D.categories.special);
  AI_NAMES.splice(0, AI_NAMES.length, 'Bartolomeu', 'Magellan', 'Zheng He', 'Drake', 'Yi Sun-sin', 'Columbus', 'Da Gama', 'Prince Henry', 'Albuquerque', 'Cabot', 'Vespucci', 'Hayreddin');
}
