// WebAudio 기반 사운드 (외부 파일 없이 합성)
export class AudioManager {
  constructor() {
    this.ctx = null; this.enabled = false; this.master = null; this.musicOn = true;
    this.MUSIC_VOL = 0.8; this.SFX_VOL = 0.2;
    this.tracks = []; this.names = []; this.failed = new Set(); this.trackIdx = 0; this.trackName = ''; this.el = null; this.elSource = null; this.mainIdx = -1; this.mode = 'theme'; this.lastRace = -1;
    this.ready = this.probeMusic();
  }

  // assets/music/ 에 사용자가 넣어둔 음악 파일을 찾는다.
  //  - playlist.json: ["파일1.mp3", "파일2.mp3"] 형태 (assets/music/ 기준 상대 경로)
  //  - 없으면 bgm.mp3 단일 파일
  async probeMusic() {
    let names = [], mainName = null;
    try {
      const r = await fetch('assets/music/playlist.json', { cache: 'no-store' });
      if (r.ok) {
        const list = await r.json();
        // 배열: 전곡 무작위 / 객체 {main, tracks}: main 은 메인 테마, tracks 는 무작위
        if (Array.isArray(list)) names = list.filter((f) => typeof f === 'string');
        else if (list && list.main) { mainName = list.main; names = [list.main, ...(Array.isArray(list.tracks) ? list.tracks.filter((f) => f !== list.main) : [])]; }
      }
    } catch (_) { /* 없음 */ }
    if (!names.length) names = ['bgm.mp3'];
    // 파일마다 실제로 서버에 있는 주소를 찾는다. 한글 파일명은 조합형(NFC)/분리형(NFD)이 달라 404가 날 수 있어 둘 다 확인한다.
    const resolved = [];
    for (const f of names) {
      const cands = [...new Set([f, f.normalize('NFC'), f.normalize('NFD')])];
      let url = null;
      for (const c of cands) {
        const u = 'assets/music/' + encodeURIComponent(c).replace(/%2F/g, '/');
        try { const h = await fetch(u, { method: 'HEAD', cache: 'no-store' }); if (h.ok) { url = u; break; } } catch (_) { /* 다음 후보 */ }
      }
      if (url) resolved.push({ url, name: f.normalize('NFC').replace(/\.[^.]+$/, ''), main: f === mainName });
      else console.warn('음악 파일을 찾을 수 없어 건너뜁니다:', f);
    }
    this.tracks = resolved.map((r) => r.url); this.names = resolved.map((r) => r.name);
    this.mainIdx = resolved.findIndex((r) => r.main);
    this.failed = new Set();
  }
  get hasExternalMusic() { return this.tracks.length > 0; }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.7; this.master.connect(this.ctx.destination);
    // 밸런스: 배경음악 80 / 효과음 20
    this.sfx = this.ctx.createGain(); this.sfx.gain.value = this.SFX_VOL; this.sfx.connect(this.master);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.MUSIC_VOL; this.musicGain.connect(this.master);
    this.enabled = true;
    this._ambient();
    if (this.el && !this.elSource) { this.elSource = this.ctx.createMediaElementSource(this.el); this.elSource.connect(this.musicGain); this.el.volume = 1; }
  }

  // 접속 즉시 메인 테마 재생 시도. 자동재생이 막히면 첫 클릭/키 입력 순간에 재생한다.
  async autoplay() {
    await this.ready;
    if (!this.hasExternalMusic) return;
    this._ensureEl();
    this.el.volume = this.MUSIC_VOL * 0.7; // 아직 WebAudio 그래프에 연결되기 전이므로 요소 볼륨으로 조절
    this.playTheme();
    const ok = await this._tryPlay();
    if (!ok) {
      const kick = () => { this._tryPlay(); window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); window.removeEventListener('touchstart', kick); };
      window.addEventListener('pointerdown', kick); window.addEventListener('keydown', kick); window.addEventListener('touchstart', kick);
    }
    return ok;
  }
  _tryPlay() { return this.el.play().then(() => true).catch(() => false); }
  _ensureEl() {
    if (this.el) return;
    this.el = new Audio();
    this.el.preload = 'auto';
    this.el.addEventListener('ended', () => this._nextTrack());
    this.el.addEventListener('error', () => {
      // 한 곡이 실패해도 목록은 유지하고 다음 곡으로 넘어간다. 전부 실패했을 때만 내장 곡으로.
      console.warn('음악 파일 재생 실패:', this.el.src);
      this.failed.add(this.trackIdx);
      if (this.failed.size >= this.tracks.length) { this.tracks = []; this.names = []; this.el = null; this._startSynth(); return; }
      this._nextTrack();
    });
  }

  _ambient() {
    const ctx = this.ctx;
    // 바람/파도 노이즈
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 400;
    this.windFilter = filt;
    const g = ctx.createGain(); g.gain.value = 0.35; this.windGain = g;
    src.connect(filt); filt.connect(g); g.connect(this.sfx);
    src.start();
    // LFO로 파도 느낌
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.12;
    lfo.connect(lfoG); lfoG.connect(g.gain); lfo.start();
  }

  // 속도에 따라 바람 소리 변화
  setSpeed(ratio, boosting) {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    this.windFilter.frequency.setTargetAtTime(300 + ratio * 900 + (boosting ? 600 : 0), t, 0.2);
    this.windGain.gain.setTargetAtTime(0.25 + ratio * 0.4 + (boosting ? 0.25 : 0), t, 0.2);
  }

  _tone(freq, dur, type = 'sine', vol = 0.3, attack = 0.01, decay = null, dest = null) {
    if (!this.enabled) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.001, t + (decay ?? dur));
    o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.05);
  }
  _noise(dur, vol = 0.4, freq = 800, type = 'bandpass') {
    if (!this.enabled) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.sfx); s.start(t);
  }

  countdown() { this._tone(440, 0.25, 'square', 0.18); }
  go() { this._tone(880, 0.6, 'square', 0.22); setTimeout(() => this._tone(1320, 0.5, 'square', 0.18), 80); }
  pickup() { this._tone(1046, 0.15, 'sine', 0.25); setTimeout(() => this._tone(1568, 0.25, 'sine', 0.25), 70); }
  boost() { this._noise(0.6, 0.5, 1500, 'highpass'); this._tone(220, 0.5, 'sawtooth', 0.12, 0.05); }
  hit(strength = 1) { this._noise(0.35, 0.6 * strength, 200, 'lowpass'); this._tone(80, 0.35, 'triangle', 0.4 * strength); }
  cannon() { this._noise(0.5, 0.8, 150, 'lowpass'); this._tone(60, 0.4, 'sine', 0.5); }
  splash() { this._noise(0.4, 0.35, 2500, 'bandpass'); }
  whirl() { this._tone(200, 1.2, 'sine', 0.15, 0.1); }
  lap() { [660, 880, 1100].forEach((f, i) => setTimeout(() => this._tone(f, 0.3, 'triangle', 0.25), i * 110)); }
  bell() { this._tone(1760, 1.2, 'sine', 0.25, 0.005); this._tone(2637, 0.9, 'sine', 0.12, 0.005); }
  finish(win) {
    const seq = win ? [523, 659, 784, 1046, 784, 1046, 1318] : [392, 349, 330, 294];
    seq.forEach((f, i) => setTimeout(() => this._tone(f, 0.45, 'triangle', 0.3), i * 160));
  }
  kraken() { this._tone(55, 1.5, 'sawtooth', 0.3, 0.2); this._noise(1.2, 0.4, 120, 'lowpass'); }
  // ---- 도파민 효과음 ----
  coin(n = 0) { this._tone(1318 * Math.pow(1.06, Math.min(n, 12)), 0.12, 'square', 0.12); }
  combo(n = 1) {
    const base = 660 * Math.pow(1.0595, Math.min(n, 14));
    this._tone(base, 0.18, 'triangle', 0.25); setTimeout(() => this._tone(base * 1.5, 0.28, 'triangle', 0.22), 70);
  }
  whoosh() { this._noise(0.35, 0.45, 2200, 'highpass'); }
  overtake() { [880, 1108, 1318, 1760].forEach((f, i) => setTimeout(() => this._tone(f, 0.18, 'square', 0.14), i * 55)); }
  perfect() { [1046, 1318, 1568, 2093].forEach((f, i) => setTimeout(() => this._tone(f, 0.25, 'triangle', 0.28), i * 70)); }
  treasure() { [784, 988, 1175, 1568, 1975].forEach((f, i) => setTimeout(() => this._tone(f, 0.3, 'sine', 0.3), i * 90)); this._noise(0.4, 0.2, 3000, 'highpass'); }
  stormWarn() { this._tone(110, 1.4, 'sawtooth', 0.22, 0.3); this._tone(165, 1.4, 'sawtooth', 0.14, 0.3); }
  thunder() {
    if (!this.enabled) return;
    const ctx = this.ctx, t = ctx.currentTime, dur = 2.2;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.08 * w) / 1.08; d[i] = last * 6 * Math.pow(1 - i / len, 1.6); }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(120, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfx); src.start(t);
  }

  // ---------- 배경 음악 ----------
  // assets/music/ 에 파일이 있으면 그 파일을, 없으면 내장 합성 뱃노래를 재생
  startMusic() {
    if (!this.enabled) return;
    if (this.hasExternalMusic) { this._startExternal(); return; }
    this._startSynth();
  }
  _startExternal() {
    this._ensureEl();
    if (!this.elSource) { this.elSource = this.ctx.createMediaElementSource(this.el); this.elSource.connect(this.musicGain); this.el.volume = 1; }
    this.playRace();
  }
  // 메인 테마 모드: 타이틀/선택/결과 화면. 메인 테마만 반복 (메인이 없으면 전곡 무작위)
  playTheme() {
    if (!this.hasExternalMusic) return;
    this._ensureEl();
    if (this.mode === 'theme' && this.trackIdx === this.mainIdx && !this.el.paused) return;
    this.mode = 'theme';
    const ok = this.tracks.map((_, i) => i).filter((i) => !this.failed.has(i));
    this.trackIdx = (this.mainIdx >= 0 && !this.failed.has(this.mainIdx)) ? this.mainIdx : ok[Math.floor(Math.random() * ok.length)];
    if (this.trackIdx == null) return;
    this._playTrack();
  }
  // 사용자가 목록에서 직접 고른 곡
  playIndex(i) {
    if (!this.hasExternalMusic || i < 0 || i >= this.tracks.length) return;
    this._ensureEl();
    this.mode = i === this.mainIdx ? 'theme' : 'race';
    this.trackIdx = i; if (i !== this.mainIdx) this.lastRace = i;
    this._playTrack();
  }
  trackNames() { return this.names || []; }
  // 레이스 모드: 메인 테마를 제외한 곡 중 무작위 (직전 곡은 피함)
  playRace() {
    if (!this.hasExternalMusic) return;
    this._ensureEl();
    const pool = this.tracks.map((_, i) => i).filter((i) => i !== this.mainIdx && !this.failed.has(i));
    if (!pool.length) { this.playTheme(); return; }
    if (this.mode === 'race' && !this.el.paused && pool.includes(this.trackIdx)) return; // 이미 레이스 곡 재생 중
    this.mode = 'race';
    const cand = pool.length > 1 ? pool.filter((i) => i !== this.lastRace) : pool;
    this.trackIdx = cand[Math.floor(Math.random() * cand.length)];
    this.lastRace = this.trackIdx;
    this._playTrack();
  }
  _nextTrack() {
    if (this.mode === 'race') { this.mode = 'idle'; this.playRace(); }
    else { this.mode = 'idle'; this.playTheme(); }
  }
  _playTrack() {
    const src = this.tracks[this.trackIdx];
    this.trackName = (this.names && this.names[this.trackIdx]) || decodeURIComponent(src.split('/').pop()).replace(/\.[^.]+$/, '');
    this.el.src = src; this.el.loop = false;
    this._tryPlay();
    if (this.onTrackChange) this.onTrackChange(this.trackName);
  }
  _startSynth() {
    if (!this.enabled || this._musicTimer) return;
    this.trackName = '';
    if (this.onTrackChange) this.onTrackChange('');
    const ctx = this.ctx;
    // D 도리안 뱃노래 멜로디 (6/8 느낌) - [주파수(0=쉼), 길이(박)]
    const n = (s) => 440 * Math.pow(2, (s - 9) / 12); // s: 반음 인덱스, 9=A4
    const D4 = n(-7), E4 = n(-5), F4 = n(-4), G4 = n(-2), A4 = n(0), B4 = n(2), C5 = n(3), D5 = n(5), E5 = n(7), F5 = n(8), G5 = n(10), A5 = n(12);
    const melody = [
      [D4, 1], [F4, 1], [A4, 1], [D5, 2], [C5, 1], [A4, 2], [F4, 1], [G4, 3],
      [A4, 1], [G4, 1], [F4, 1], [E4, 2], [D4, 1], [E4, 2], [F4, 1], [D4, 3],
      [D5, 1], [D5, 1], [C5, 1], [A4, 2], [F4, 1], [G4, 1], [A4, 1], [C5, 1], [D5, 3],
      [A4, 1], [C5, 1], [D5, 1], [E5, 2], [F5, 1], [E5, 1], [D5, 1], [C5, 1], [D5, 3],
    ];
    const bass = [D4 / 2, D4 / 2, F4 / 2, A4 / 4, D4 / 2, D4 / 2, G4 / 2, A4 / 4];
    const beat = 0.19;
    let step = 0, bstep = 0, nextTime = ctx.currentTime + 0.1, melodyIdx = 0, melodyRemain = 0;
    const tick = () => {
      while (nextTime < ctx.currentTime + 0.3) {
        if (melodyRemain <= 0) {
          const [f, l] = melody[melodyIdx]; melodyIdx = (melodyIdx + 1) % melody.length; melodyRemain = l;
          if (f > 0) this._schedNote(f, l * beat * 0.9, nextTime, 'triangle', 0.2);
        }
        melodyRemain--;
        if (step % 3 === 0) { this._schedNote(bass[bstep % bass.length], beat * 2.5, nextTime, 'sine', 0.3); bstep++; }
        if (step % 3 === 0) this._schedPerc(nextTime, 0.16);
        else if (step % 3 === 2) this._schedPerc(nextTime, 0.06);
        step++; nextTime += beat;
      }
    };
    this._musicTimer = setInterval(tick, 80);
  }
  _schedNote(f, dur, t, type, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + dur + 0.05);
  }
  _schedPerc(t, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.08);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + 0.12);
  }
  stopMusic() {
    if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
    if (this.el && !this.el.paused) this.el.pause();
  }
  setMusicVolume(v) { if (this.musicGain) this.musicGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.3); }
}
