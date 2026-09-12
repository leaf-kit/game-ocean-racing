// 레이스 코스: 항로, 체크포인트, 섬, 암초, 소용돌이, 보급품, 크라켄
import * as THREE from 'three';
import { waveHeight } from './ocean.js?v=20260912153205';
import { DEFAULT_MAP } from './maps.js?v=20260912153205';

// 시드 난수
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// 항로 제어점과 스케일은 맵(maps.js)에서 온다

export const TRACK_HALF_WIDTH = 38;
export const GUARD_OFFSET = TRACK_HALF_WIDTH + 12; // 가드레일(로프) 위치: 이보다 밖으로는 못 나감
export const CHECKPOINT_COUNT = 14;

export class Track {
  constructor(scene, map = DEFAULT_MAP) {
    this.scene = scene;
    this.map = map;
    const TRACK_SCALE = map.scale; this.scale = TRACK_SCALE;
    const CONTROL_POINTS = map.points.map(([x, z]) => [x * TRACK_SCALE, z * TRACK_SCALE]);
    this.group = new THREE.Group();
    scene.add(this.group);
    const rand = rng(20240912);
    this.rand = rand;

    // 항로 곡선
    const pts = CONTROL_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
    this.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.6);
    this.sampleCount = 800;
    this.samples = this.curve.getSpacedPoints(this.sampleCount);
    this.samples.pop(); // 마지막은 첫점과 동일
    this.cum = new Float32Array(this.sampleCount);
    let acc = 0;
    for (let i = 0; i < this.sampleCount; i++) {
      this.cum[i] = acc;
      const a = this.samples[i], b = this.samples[(i + 1) % this.sampleCount];
      acc += a.distanceTo(b);
    }
    this.totalLength = acc;
    this.tangents = this.samples.map((p, i) => {
      const n = this.samples[(i + 1) % this.sampleCount];
      return new THREE.Vector3().subVectors(n, p).normalize();
    });

    // 체크포인트 인덱스
    this.checkpoints = [];
    for (let c = 0; c < CHECKPOINT_COUNT; c++) this.checkpoints.push(Math.floor((c / CHECKPOINT_COUNT) * this.sampleCount));

    this.obstacles = []; // {x,z,r,type}
    this.islands = [];
    this.whirlpools = [];
    this.pickups = [];
    this.coins = [];
    this.chests = [];
    this.boostPads = [];    // 부스터 패드
    this.ramps = [];        // 점프대
    this.scrolls = [];      // 역사 인물 두루마리
    this.discoveries = [];  // 발견 구슬 (현상/사물/사건)
    this.buoys = [];
    this.animated = [];

    this._buildBuoys();
    this._buildStartGate();
    this._buildRaceLine();
    this._buildIslands();
    this._buildRocks();
    this._buildWhirlpools();
    this._buildPickups();
    this._buildCoins();
    this._buildChests();
    this._buildKnowledgeItems();
    this._buildBoostPads();
    this._buildJumpRamps();
    this._buildKraken();
    this._assignUnlocks();
    this.setDifficultyProgress(1);
  }

  // ----- 난이도 점진: 장애물마다 해금 진행률(0~1)을 부여 -----
  _assignUnlocks() {
    const rocks = this.obstacles.filter((o) => o.type === 'rock');
    // 장애물 최소화: 암초는 처음엔 없고 진행률 15%~90% 사이에 최대 6개만 하나씩 등장, 나머지는 영구 비활성
    const MAX_ROCKS = 6;
    const shuffled = [...rocks].sort(() => this.rand() - 0.5);
    shuffled.forEach((o, i) => { o.unlock = i < MAX_ROCKS ? 0.15 + (i / Math.max(1, MAX_ROCKS - 1)) * 0.75 : 2; });
    for (const o of this.obstacles) if (o.type !== 'rock') o.unlock = 0;
    this.whirlpools.forEach((w, i) => { w.unlock = this.map.whirl[i] ?? 2; }); // 맵마다 소용돌이 등장 시점이 다름
    this.kraken.unlock = this.map.kraken ?? 0.9;
    this.progressFrac = -1;
  }
  // 진행률에 따라 장애물을 켠다. 새로 켜진 장애물 종류 목록을 돌려준다.
  setDifficultyProgress(frac) {
    if (frac === this.progressFrac) return [];
    this.progressFrac = frac;
    const added = [];
    for (const o of this.obstacles) {
      const on = o.unlock <= frac;
      if (o.active !== on) { o.active = on; if (on && o.type === 'rock') added.push('rock'); }
      if (o.type === 'rock' && o.inst !== undefined) {
        for (let j = 0; j < 3; j++) { const k = o.inst + j; this.rockMesh.setMatrixAt(k, on ? this.rockMatrices[k] : _ZERO); }
      }
    }
    if (this.rockMesh) this.rockMesh.instanceMatrix.needsUpdate = true;
    for (const w of this.whirlpools) { const on = w.unlock <= frac; if (w.active !== on) { w.active = on; w.mesh.visible = on; if (on) added.push('whirl'); } }
    const kOn = this.kraken.unlock <= frac;
    if (this.kraken.enabled !== kOn) { this.kraken.enabled = kOn; this.krakenSign.visible = kOn; if (kOn) added.push('kraken'); }
    return added;
  }

  // ----- 유틸 -----
  distToCurve(x, z, hintIdx = -1) {
    let best = Infinity, bi = 0;
    const check = (i) => {
      const p = this.samples[i];
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < best) { best = d; bi = i; }
    };
    if (hintIdx >= 0) {
      for (let k = -40; k <= 40; k++) check((hintIdx + k + this.sampleCount) % this.sampleCount);
      // 힌트 근처 결과가 너무 멀면 전역 탐색
      if (best > 200 * 200) { best = Infinity; for (let i = 0; i < this.sampleCount; i += 2) check(i); }
    } else {
      for (let i = 0; i < this.sampleCount; i += 2) check(i);
    }
    return { dist: Math.sqrt(best), idx: bi };
  }
  pointAt(idx) { return this.samples[((idx % this.sampleCount) + this.sampleCount) % this.sampleCount]; }
  tangentAt(idx) { return this.tangents[((idx % this.sampleCount) + this.sampleCount) % this.sampleCount]; }
  normalAt(idx) { const t = this.tangentAt(idx); return new THREE.Vector3(-t.z, 0, t.x); }

  // 출발 그리드 위치 (출발선 뒤쪽)
  startPositions(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 2), col = i % 2;
      const idx = (this.sampleCount - 8 - row * 14 + this.sampleCount) % this.sampleCount;
      const p = this.pointAt(idx).clone();
      const nrm = this.normalAt(idx);
      p.addScaledVector(nrm, (col === 0 ? -1 : 1) * 19);
      const t = this.tangentAt(idx);
      out.push({ pos: p, heading: Math.atan2(t.x, t.z) });
    }
    return out;
  }

  // ----- 부표 -----
  _buildBuoys() {
    const redMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.6 });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffc107, emissive: 0x7a5000, emissiveIntensity: 0.3, roughness: 0.5 });
    const buoyGeo = new THREE.ConeGeometry(1.6, 4, 8);
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 5, 6);
    const flagGeo = new THREE.PlaneGeometry(2.2, 1.4);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xffe08a, side: THREE.DoubleSide });
    const step = 12;
    const smallBuoys = new THREE.InstancedMesh(buoyGeo, redMat, Math.ceil(this.sampleCount / step) + 2);
    const smallBuoysG = new THREE.InstancedMesh(buoyGeo, greenMat, Math.ceil(this.sampleCount / step) + 2);
    let ri = 0, gi = 0;
    const m = new THREE.Matrix4();
    for (let i = 0; i < this.sampleCount; i += step) {
      const p = this.pointAt(i), n = this.normalAt(i);
      const l = p.clone().addScaledVector(n, -TRACK_HALF_WIDTH);
      const r = p.clone().addScaledVector(n, TRACK_HALF_WIDTH);
      m.makeTranslation(l.x, 1.2, l.z); smallBuoys.setMatrixAt(ri++, m);
      m.makeTranslation(r.x, 1.2, r.z); smallBuoysG.setMatrixAt(gi++, m);
      this.buoys.push({ x: l.x, z: l.z, mesh: smallBuoys, i: ri - 1 }, { x: r.x, z: r.z, mesh: smallBuoysG, i: gi - 1 });
    }
    smallBuoys.count = ri; smallBuoysG.count = gi;
    this.group.add(smallBuoys, smallBuoysG);
    this.buoyMeshes = [smallBuoys, smallBuoysG];

    // 체크포인트 게이트 (큰 금색 부표 + 깃발)
    this.gateMeshes = [];
    this.checkpoints.forEach((idx, c) => {
      if (c === 0) return; // 출발선은 아치로
      const p = this.pointAt(idx), n = this.normalAt(idx);
      for (const s of [-1, 1]) {
        const g = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 2.2, 10), goldMat);
        const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x3e2a14 }));
        pole.position.y = 3.2;
        const flag = new THREE.Mesh(flagGeo, flagMat); flag.position.set(1.1, 5.0, 0);
        g.add(base, pole, flag);
        const pos = p.clone().addScaledVector(n, s * (TRACK_HALF_WIDTH + 2));
        g.position.set(pos.x, 0, pos.z);
        g.userData.flag = flag;
        this.group.add(g);
        this.gateMeshes.push(g);
      }
    });
  }

  _buildStartGate() {
    const p = this.pointAt(0), n = this.normalAt(0), t = this.tangentAt(0);
    const g = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1a });
    for (const s of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 26, 10), poleMat);
      pole.position.set(s * (TRACK_HALF_WIDTH + 4), 12, 0);
      g.add(pole);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 3, 12), new THREE.MeshStandardMaterial({ color: 0x8d6e63 }));
      base.position.set(s * (TRACK_HALF_WIDTH + 4), 0.5, 0);
      g.add(base);
    }
    const banner = new THREE.Mesh(new THREE.BoxGeometry((TRACK_HALF_WIDTH + 4) * 2, 5, 0.4), new THREE.MeshStandardMaterial({ color: 0xc0392b }));
    banner.position.y = 23;
    g.add(banner);
    // 체크무늬 깃발 띠
    const checker = makeCheckerTexture();
    const strip = new THREE.Mesh(new THREE.PlaneGeometry((TRACK_HALF_WIDTH + 4) * 2, 1.6), new THREE.MeshBasicMaterial({ map: checker, side: THREE.DoubleSide }));
    strip.position.set(0, 19.8, 0);
    g.add(strip);
    // 작은 삼각 깃발들
    for (let i = -6; i <= 6; i++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 3), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffe08a : 0x3498db, side: THREE.DoubleSide }));
      f.position.set(i * 6, 24.5 + Math.abs(i) * 0.1, 0); f.rotation.x = Math.PI; f.rotation.z = Math.PI;
      f.rotation.set(0, 0, Math.PI);
      f.position.y = 26.8;
      g.add(f);
    }
    g.position.set(p.x, 0, p.z);
    g.rotation.y = Math.atan2(t.x, t.z); // 기둥·현수막이 항로를 가로지르도록 (접선의 법선 방향)
    this.group.add(g);
    this.startGate = g;
  }

  // ----- 레이싱 라인: 중앙 화살표 리본 + 좌우 경계선 -----
  _buildRaceLine() {
    const N = this.sampleCount;
    const makeRibbon = (offset, halfW, mat, uRepeat) => {
      const pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
      for (let i = 0; i <= N; i++) {
        const p = this.pointAt(i), n = this.normalAt(i);
        const cx = p.x + n.x * offset, cz = p.z + n.z * offset;
        pos.set([cx - n.x * halfW, 0, cz - n.z * halfW, cx + n.x * halfW, 0, cz + n.z * halfW], i * 6);
        const u = (i / N) * uRepeat;
        uv.set([u, 0, u, 1], i * 4);
        if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false; mesh.renderOrder = 2;
      this.group.add(mesh);
      return { mesh, geo, offset };
    };
    const chevron = makeChevronTexture();
    const centerMat = new THREE.MeshBasicMaterial({ map: chevron, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: true });
    // 좌우 경계선: 끊김 없는 실선 (길이 분명히 보이도록)
    const leftMat = new THREE.MeshBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, fog: true });
    const rightMat = new THREE.MeshBasicMaterial({ color: 0x5cff8a, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, fog: true });
    const ropeMat = new THREE.MeshBasicMaterial({ map: makeRopeTexture(), transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, fog: true });
    this.raceLines = [
      makeRibbon(0, 3.2, centerMat, Math.round(this.totalLength / 14)),
      makeRibbon(-TRACK_HALF_WIDTH, 1.6, leftMat, 1),
      makeRibbon(TRACK_HALF_WIDTH, 1.6, rightMat, 1),
      // 가드레일: 항로 바깥 로프 (부표 사이를 잇는 밧줄)
      makeRibbon(-GUARD_OFFSET, 0.9, ropeMat, Math.round(this.totalLength / 6)),
      makeRibbon(GUARD_OFFSET, 0.9, ropeMat, Math.round(this.totalLength / 6)),
    ];
    // 가드레일 말뚝 부표
    const postGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.8 });
    const posts = new THREE.InstancedMesh(postGeo, postMat, Math.ceil(this.sampleCount / 20) * 2 + 2);
    const pm = new THREE.Matrix4(); let pi = 0;
    for (let i = 0; i < this.sampleCount; i += 20) {
      const p = this.pointAt(i), n = this.normalAt(i);
      for (const sd of [-1, 1]) { pm.makeTranslation(p.x + n.x * sd * GUARD_OFFSET, 1.5, p.z + n.z * sd * GUARD_OFFSET); posts.setMatrixAt(pi++, pm); }
    }
    posts.count = pi; this.group.add(posts); this.guardPosts = posts;
    this.raceLineScroll = 0;
  }

  // ----- 금화 (점수 + 콤보) -----
  _buildCoins() {
    const geo = new THREE.CylinderGeometry(1.5, 1.5, 0.35, 14);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xff9f00, emissiveIntensity: 0.7, metalness: 0.8, roughness: 0.25 });
    const groups = 16, per = 5, gap = 9;
    const mesh = new THREE.InstancedMesh(geo, mat, groups * per);
    const m = new THREE.Matrix4();
    let k = 0;
    for (let g = 0; g < groups; g++) {
      const baseIdx = Math.floor(((g + 0.25) / groups) * this.sampleCount) + 12;
      const lane = [-0.55, 0.55, 0, -0.3, 0.3][g % 5] * TRACK_HALF_WIDTH * 0.8;
      for (let j = 0; j < per; j++) {
        const idx = baseIdx + Math.round((j * gap) / (this.totalLength / this.sampleCount));
        const p = this.pointAt(idx), n = this.normalAt(idx);
        const x = p.x + n.x * lane, z = p.z + n.z * lane;
        m.makeTranslation(x, 2, z); mesh.setMatrixAt(k, m);
        this.coins.push({ x, z, r: 4.5, i: k, active: true, timer: 0, idx });
        k++;
      }
    }
    mesh.count = k;
    this.group.add(mesh);
    this.coinMesh = mesh;
    this._m4 = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._v = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1);
  }

  // ----- 보물 상자 (희귀: 부스트 풀 + 큰 점수) -----
  _buildChests() {
    const wood = new THREE.MeshStandardMaterial({ color: 0x6b3f1d, roughness: 0.8 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xffc107, emissive: 0xff8f00, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.3 });
    for (const u of [0.22, 0.66]) {
      const idx = Math.floor(u * this.sampleCount);
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const side = u < 0.5 ? 1 : -1;
      const x = p.x + n.x * side * TRACK_HALF_WIDTH * 0.85, z = p.z + n.z * side * TRACK_HALF_WIDTH * 0.85;
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 3), wood);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1, 3.2), gold); lid.position.y = 1.7;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.22, 6, 28), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.8 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = -0.8;
      g.add(box, lid, ring);
      g.position.set(x, 1.5, z);
      this.group.add(g);
      this.chests.push({ x, z, r: 6.5, mesh: g, active: true, timer: 0 });
    }
  }

  // ----- 부스터 패드: 밟으면 초고속 -----
  _buildBoostPads() {
    const tex = makeChevronTexture();
    for (let i = 0; i < 7; i++) {
      const idx = Math.floor(((i + 0.5) / 7) * this.sampleCount) + 60;
      const p = this.pointAt(idx), n = this.normalAt(idx), t = this.tangentAt(idx);
      const lane = [0, -0.4, 0.4][i % 3] * TRACK_HALF_WIDTH;
      const x = p.x + n.x * lane, z = p.z + n.z * lane;
      const geo = new THREE.PlaneGeometry(16, 9, 1, 1); geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ map: tex.clone(), color: 0xff9a3c, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      mat.map.wrapS = THREE.RepeatWrapping; mat.map.repeat.set(2, 1); mat.map.needsUpdate = true;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0.6, z); mesh.rotation.y = Math.atan2(t.x, t.z) - Math.PI / 2;
      mesh.renderOrder = 3;
      const ring = new THREE.Mesh(new THREE.RingGeometry(7, 8.2, 24), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.55, z);
      this.group.add(mesh, ring);
      this.boostPads.push({ x, z, r: 8, mesh, ring, mat });
    }
  }

  // ----- 점프대: 밟으면 하늘로 날아올라 초고속 -----
  _buildJumpRamps() {
    const plank = new THREE.MeshStandardMaterial({ map: woodRampTexture(), roughness: 0.85 });
    const glow = new THREE.MeshBasicMaterial({ color: 0x8fd4ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
    const post = new THREE.MeshStandardMaterial({ color: 0x3e2a14, roughness: 0.9 });
    const chevron = makeChevronTexture();
    for (const u of [0.18, 0.46, 0.7, 0.9]) {
      const idx = Math.floor(u * this.sampleCount);
      const p = this.pointAt(idx), n = this.normalAt(idx), t = this.tangentAt(idx);
      const x = p.x, z = p.z;
      const g = new THREE.Group();
      const L = 24, W = 14, tilt = 0.32;
      const deck = new THREE.Mesh(new THREE.BoxGeometry(W, 0.8, L), plank);
      deck.position.set(0, Math.sin(tilt) * L * 0.5 + 0.6, 0); deck.rotation.x = -tilt;
      g.add(deck);
      // 발광 테두리 + 화살표
      for (const sd of [-1, 1]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, L), glow);
        rail.position.set(sd * (W / 2 - 0.3), Math.sin(tilt) * L * 0.5 + 1.2, 0); rail.rotation.x = -tilt; g.add(rail);
      }
      const arrowMat = new THREE.MeshBasicMaterial({ map: chevron.clone(), color: 0xffe08a, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      arrowMat.map.wrapS = THREE.RepeatWrapping; arrowMat.map.repeat.set(3, 1); arrowMat.map.needsUpdate = true;
      const arrow = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.9, W * 0.5), arrowMat);
      arrow.rotation.x = -Math.PI / 2 - tilt; arrow.rotation.z = Math.PI / 2; arrow.position.set(0, Math.sin(tilt) * L * 0.5 + 1.15, 0);
      g.add(arrow);
      // 지지 기둥
      for (const sd of [-1, 1]) for (const k of [0.3, 0.9]) {
        const h = Math.sin(tilt) * L * (k - 0.5) + Math.sin(tilt) * L * 0.5 + 0.6;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, Math.max(1, h + 2), 8), post);
        pole.position.set(sd * (W / 2 - 1.2), h / 2 - 1, -L / 2 + k * L); g.add(pole);
      }
      g.position.set(x, 0, z);
      g.rotation.y = Math.atan2(t.x, t.z);
      this.group.add(g);
      this.ramps.push({ x, z, r: 9, heading: Math.atan2(t.x, t.z), mesh: g, arrowMat, tx: t.x, tz: t.z });
    }
  }
  updateRamps(dt) { for (const r of this.ramps) r.arrowMat.map.offset.x -= dt * 1.2; }

  // ----- 역사 인물 두루마리 / 발견 구슬 -----
  _buildKnowledgeItems() {
    const parch = new THREE.MeshStandardMaterial({ color: 0xf1e2b8, roughness: 0.9 });
    const ribbon = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.75 });
    const ringGeo = new THREE.TorusGeometry(3.2, 0.2, 6, 26);
    // 두루마리 8개: 항로 좌우 가장자리 쪽
    for (let i = 0; i < 8; i++) {
      const idx = Math.floor(((i + 0.6) / 8) * this.sampleCount) + 45;
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const side = i % 2 ? 1 : -1;
      const x = p.x + n.x * side * TRACK_HALF_WIDTH * 0.7, z = p.z + n.z * side * TRACK_HALF_WIDTH * 0.7;
      const g = new THREE.Group();
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 4.2, 12), parch); roll.rotation.z = Math.PI / 2;
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.18, 6, 16), ribbon); band.rotation.y = Math.PI / 2;
      const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = -0.6;
      g.add(roll, band, ring);
      g.position.set(x, 2, z);
      this.group.add(g);
      this.scrolls.push({ x, z, r: 5.5, mesh: g, active: true, timer: 0 });
    }
    // 발견 구슬 12개: 항로 안쪽 여러 차선
    const orbMat = new THREE.MeshStandardMaterial({ color: 0x9fe8ff, emissive: 0x2fb8ff, emissiveIntensity: 1.1, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.9 });
    const orbRing = new THREE.MeshBasicMaterial({ color: 0x8fd4ff, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 12; i++) {
      const idx = Math.floor(((i + 0.3) / 12) * this.sampleCount) + 20;
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const lane = [-0.35, 0.35, 0][i % 3] * TRACK_HALF_WIDTH;
      const x = p.x + n.x * lane, z = p.z + n.z * lane;
      const g = new THREE.Group();
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), orbMat);
      const ring = new THREE.Mesh(ringGeo, orbRing); ring.rotation.x = Math.PI / 2; ring.position.y = -0.6;
      const light = new THREE.PointLight(0x5cc8ff, 6, 22);
      g.add(orb, ring, light);
      g.position.set(x, 2.2, z);
      this.group.add(g);
      this.discoveries.push({ x, z, r: 5.5, mesh: g, active: true, timer: 0, orb });
    }
  }

  // ----- 섬 -----
  _buildIslands() {
    const rand = this.rand;
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xe8d59a, roughness: 1 });
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4f9a3a, roughness: 1 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6d6a5e, roughness: 1 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7b5a2e });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b3a, side: THREE.DoubleSide });

    // 고정 배치 (항로 안쪽/바깥쪽에 지형감을 줌) + 랜덤
    const fixed = [
      [300, 250, 95], [-250, 300, 120], [-50, 380, 60], [880, 200, 110], [-780, 500, 90], [-820, 100, 100],
      [150, -220, 80], [500, 750, 90], [-100, 900, 70], [-500, -300, 100], [700, -150, 70], [-400, 120, 45],
      [400, 40, 26], [-700, 320, 30],
    ];
    const TRACK_SCALE = this.scale, style = this.map.style;
    const candidates = fixed.map(([x, z, r]) => [x * TRACK_SCALE, z * TRACK_SCALE, r * TRACK_SCALE]);
    const ringN = style === 'atoll' ? 28 : style === 'coast' ? 56 : 40;
    for (let i = 0; i < ringN; i++) {
      const a = rand() * Math.PI * 2, r = (style === 'coast' ? 520 + rand() * 700 : 700 + rand() * 900) * TRACK_SCALE;
      candidates.push([Math.cos(a) * r + 50, Math.sin(a) * r + 250, (style === 'atoll' ? 70 : 40) + rand() * 120]);
    }
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xeaf6ff, roughness: 0.55, metalness: 0.05 });
    const iceBase = new THREE.MeshStandardMaterial({ color: 0x9fdcf5, roughness: 0.4, transparent: true, opacity: 0.9 });
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x7a7266, roughness: 1, flatShading: true });
    const darkGreen = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 1 });
    const lagoonMat = new THREE.MeshBasicMaterial({ color: 0x5fe0d8, transparent: true, opacity: 0.8 });
    for (const [x, z, r0] of candidates) {
      const r = this.map.bigIce && style === 'ice' ? r0 * 1.3 : r0;
      const { dist } = this.distToCurve(x, z);
      if (dist < r + TRACK_HALF_WIDTH + 8) continue;
      const g = new THREE.Group();
      if (style === 'ice') {
        // 빙산: 푸른 밑동 + 하얀 각진 봉우리들
        const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.2, 4, 7), iceBase); base.position.y = -1; g.add(base);
        const peaks = 1 + Math.floor(rand() * 3);
        for (let h = 0; h < peaks; h++) {
          const hr = r * (0.35 + rand() * 0.45), hh = hr * (0.6 + rand() * 1.2);
          const peak = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 5 + Math.floor(rand() * 3)), iceMat);
          const a = rand() * Math.PI * 2, d = rand() * r * 0.4;
          peak.position.set(Math.cos(a) * d, hh / 2 - 0.5, Math.sin(a) * d); peak.rotation.y = rand() * Math.PI; peak.rotation.z = (rand() - 0.5) * 0.15;
          g.add(peak);
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.92, type: 'island' });
        continue;
      }
      if (style === 'atoll') {
        // 환초: 얕은 산호초 고리 + 라군 + 작은 모래섬
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.85, r * 0.15, 6, 24), sandMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; g.add(ring);
        const lagoon = new THREE.Mesh(new THREE.CircleGeometry(r * 0.75, 24), lagoonMat); lagoon.rotation.x = -Math.PI / 2; lagoon.position.y = 0.35; g.add(lagoon);
        const n = 2 + Math.floor(rand() * 3);
        for (let k = 0; k < n; k++) {
          const a = rand() * Math.PI * 2, d = r * 0.85, ir = r * (0.12 + rand() * 0.12);
          const isle = new THREE.Mesh(new THREE.CylinderGeometry(ir, ir * 1.2, 2.5, 10), sandMat); isle.position.set(Math.cos(a) * d, 0.6, Math.sin(a) * d); g.add(isle);
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 7, 5), trunkMat); trunk.position.set(isle.position.x, 4.5, isle.position.z); g.add(trunk);
          for (let l = 0; l < 5; l++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.2), leafMat); leaf.position.set(trunk.position.x, 8, trunk.position.z); leaf.rotation.y = (l / 5) * Math.PI * 2; leaf.rotation.z = -0.5; leaf.geometry.translate(2, 0, 0); g.add(leaf); }
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.95, type: 'island' });
        continue;
      }
      if (style === 'rocky' || style === 'coast') {
        // 절벽섬/해안: 각진 회색 절벽 + 초록 정상, 검은 사이프러스
        const cliff = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 1.05, style === 'coast' ? 14 : 8, 7), cliffMat); cliff.position.y = style === 'coast' ? 6 : 3; g.add(cliff);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.86, 1.5, 7), darkGreen); top.position.y = style === 'coast' ? 13.5 : 7.5; g.add(top);
        const hills = 1 + Math.floor(rand() * 2);
        for (let h = 0; h < hills; h++) {
          const hr = r * (0.3 + rand() * 0.35), hh = hr * (0.6 + rand() * 0.9);
          const hill = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 8), h === 0 && r > 80 ? cliffMat : darkGreen);
          const a = rand() * Math.PI * 2, d = rand() * r * 0.35;
          hill.position.set(Math.cos(a) * d, top.position.y + hh / 2, Math.sin(a) * d); g.add(hill);
        }
        const trees = Math.floor(r / 22);
        for (let t = 0; t < trees; t++) {
          const a = rand() * Math.PI * 2, d = r * (0.4 + rand() * 0.4);
          const tree = new THREE.Mesh(new THREE.ConeGeometry(1.2, 6 + rand() * 4, 6), darkGreen); tree.position.set(Math.cos(a) * d, top.position.y + 3.5, Math.sin(a) * d); g.add(tree);
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.95, type: 'island' });
        continue;
      }
      // 모래 기반
      const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, 3, 18), sandMat);
      base.position.y = -0.5;
      g.add(base);
      // 언덕
      const hills = 1 + Math.floor(rand() * 3);
      for (let h = 0; h < hills; h++) {
        const hr = r * (0.35 + rand() * 0.4), hh = hr * (0.5 + rand() * 0.9);
        const hill = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 9), h === 0 && r > 80 ? rockMat : grassMat);
        const a = rand() * Math.PI * 2, d = rand() * r * 0.45;
        hill.position.set(Math.cos(a) * d, hh / 2 - 0.5, Math.sin(a) * d);
        hill.rotation.y = rand() * Math.PI;
        g.add(hill);
        if (r > 80 && h === 0) {
          const snow = new THREE.Mesh(new THREE.ConeGeometry(hr * 0.3, hh * 0.3, 9), new THREE.MeshStandardMaterial({ color: 0xffffff }));
          snow.position.set(hill.position.x, hh - hh * 0.15 - 0.5, hill.position.z);
          g.add(snow);
        }
      }
      // 야자수
      const palms = Math.floor(r / 18);
      for (let t = 0; t < palms; t++) {
        const a = rand() * Math.PI * 2, d = r * (0.55 + rand() * 0.35);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 7, 5), trunkMat);
        trunk.position.set(Math.cos(a) * d, 3.5, Math.sin(a) * d);
        trunk.rotation.z = (rand() - 0.5) * 0.3; trunk.rotation.x = (rand() - 0.5) * 0.3;
        g.add(trunk);
        for (let l = 0; l < 5; l++) {
          const leaf = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.2), leafMat);
          leaf.position.set(trunk.position.x, 7, trunk.position.z);
          leaf.rotation.y = (l / 5) * Math.PI * 2; leaf.rotation.z = -0.5;
          leaf.geometry.translate(2, 0, 0);
          g.add(leaf);
        }
      }
      g.position.set(x, 0, z);
      this.group.add(g);
      this.islands.push({ x, z, r });
      this.obstacles.push({ x, z, r: r * 0.92, type: 'island' });
    }
  }

  // ----- 암초 (항로 가장자리 근처) -----
  _buildRocks() {
    const rand = this.rand;
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4a48, roughness: 1, flatShading: true });
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const count = 34;
    const mesh = new THREE.InstancedMesh(geo, rockMat, count * 3);
    this.rockMatrices = [];
    let k = 0;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(rand() * this.sampleCount);
      // 출발 구간 근처는 피함
      if (idx < 60 || idx > this.sampleCount - 40) continue;
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const side = rand() < 0.5 ? -1 : 1;
      const off = side * (TRACK_HALF_WIDTH * (0.45 + rand() * 0.5));
      const cx = p.x + n.x * off, cz = p.z + n.z * off;
      const r = 4 + rand() * 4;
      const inst = k;
      for (let j = 0; j < 3; j++) {
        pos.set(cx + (rand() - 0.5) * r, 0.5 + rand() * 1.5, cz + (rand() - 0.5) * r);
        q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
        const sc = r * (0.35 + rand() * 0.4);
        s.set(sc, sc * (0.6 + rand() * 0.8), sc);
        m.compose(pos, q, s);
        mesh.setMatrixAt(k, m); this.rockMatrices[k] = m.clone(); k++;
      }
      this.obstacles.push({ x: cx, z: cz, r: r * 0.9, type: 'rock', inst });
    }
    mesh.count = k;
    this.group.add(mesh);
    this.rockMesh = mesh;
  }

  // ----- 소용돌이 -----
  _buildWhirlpools() {
    const baseTex = makeWhirlTexture();
    const spots = [0.33, 0.58, 0.79];
    for (const u of spots) {
      const tex = baseTex.clone(); tex.needsUpdate = true;
      const idx = Math.floor(u * this.sampleCount);
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const off = (this.rand() - 0.5) * TRACK_HALF_WIDTH * 0.8;
      const x = p.x + n.x * off, z = p.z + n.z * off, r = 16;
      const geo = new THREE.PlaneGeometry(r * 2.2, r * 2.2, 12, 12);
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false }));
      mesh.position.set(x, 0, z);
      this.group.add(mesh);
      this.whirlpools.push({ x, z, r, mesh, geo, uvRot: 0 });
    }
  }

  // ----- 보급 통 (부스트 게이지) -----
  _buildPickups() {
    const geo = new THREE.CylinderGeometry(1.4, 1.4, 2.6, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffc107, emissive: 0xff9800, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.3 });
    const ringGeo = new THREE.TorusGeometry(2.6, 0.18, 6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.7 });
    const n = 22;
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(((i + 0.5) / n) * this.sampleCount) + 30;
      const p = this.pointAt(idx), nrm = this.normalAt(idx);
      const lane = [-0.6, 0, 0.6][i % 3] * TRACK_HALF_WIDTH * 0.8;
      const x = p.x + nrm.x * lane, z = p.z + nrm.z * lane;
      const g = new THREE.Group();
      const barrel = new THREE.Mesh(geo, mat);
      barrel.rotation.z = Math.PI / 2;
      const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = -0.4;
      g.add(barrel, ring);
      g.position.set(x, 1.5, z);
      this.group.add(g);
      this.pickups.push({ x, z, r: 6, mesh: g, active: true, timer: 0 });
    }
  }

  // ----- 크라켄 -----
  _buildKraken() {
    const idx = Math.floor(0.88 * this.sampleCount);
    const p = this.pointAt(idx);
    const mat = new THREE.MeshStandardMaterial({ color: 0x5c2a6e, roughness: 0.7 });
    const suckerMat = new THREE.MeshStandardMaterial({ color: 0xd08ad8 });
    const tentacles = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const d = 22 + (i % 2) * 16;
      const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        pts.push(new THREE.Vector3(Math.sin(t * 2.2) * 6 * t, t * 26, Math.cos(t * 1.7) * 4 * t));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 16, 2.4, 8, false);
      // 끝으로 갈수록 얇게
      const posAttr = geo.attributes.position;
      for (let v = 0; v < posAttr.count; v++) {
        const y = posAttr.getY(v);
        const t = y / 26;
        const cp = curve.getPoint(Math.min(1, Math.max(0, t)));
        const sx = posAttr.getX(v) - cp.x, sz = posAttr.getZ(v) - cp.z;
        const sc = 1 - t * 0.75;
        posAttr.setX(v, cp.x + sx * sc); posAttr.setZ(v, cp.z + sz * sc);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      for (let s = 0; s < 6; s++) {
        const sp = curve.getPoint(0.2 + s * 0.13);
        const sucker = new THREE.Mesh(new THREE.SphereGeometry(0.7 - s * 0.07, 6, 6), suckerMat);
        sucker.position.set(sp.x - 2.0, sp.y, sp.z);
        mesh.add(sucker);
      }
      mesh.position.set(x, -30, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      this.group.add(mesh);
      tentacles.push({ mesh, x, z, r: 6, phase: i * 0.15 });
    }
    this.kraken = { x: p.x, z: p.z, tentacles, timer: 5, state: 'hidden', t: 0, warned: false, zoneR: 90 };
    // 크라켄 경고 표지 (해골 부표)
    const sign = new THREE.Mesh(new THREE.OctahedronGeometry(3), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x550000, emissiveIntensity: 0.6 }));
    sign.position.set(p.x, 2.5, p.z);
    this.group.add(sign);
    this.krakenSign = sign;
  }

  // 크라켄 상태 갱신 - 촉수가 나와있으면 true
  updateKraken(dt) {
    const k = this.kraken;
    if (k.enabled === false) { k.state = 'hidden'; k.timer = 3; for (const t of k.tentacles) t.mesh.position.y = -32; return { active: false, rose: false }; }
    k.timer -= dt;
    if (k.state === 'hidden' && k.timer <= 0) { k.state = 'rising'; k.timer = 1.2; k.justRose = true; }
    else if (k.state === 'rising' && k.timer <= 0) { k.state = 'up'; k.timer = 5; }
    else if (k.state === 'up' && k.timer <= 0) { k.state = 'sinking'; k.timer = 1.5; }
    else if (k.state === 'sinking' && k.timer <= 0) { k.state = 'hidden'; k.timer = 6 + Math.random() * 4; }
    k.t += dt;
    let h;
    if (k.state === 'hidden') h = -32;
    else if (k.state === 'rising') h = -32 + (1 - k.timer / 1.2) * 30;
    else if (k.state === 'up') h = -2 + Math.sin(k.t * 2) * 1.5;
    else h = -2 - (1 - k.timer / 1.5) * 30;
    for (const t of k.tentacles) {
      t.mesh.position.y = h + Math.sin(k.t * 1.5 + t.phase * 6) * 0.8;
      t.mesh.rotation.z = Math.sin(k.t * 1.2 + t.phase * 4) * 0.25;
      t.mesh.rotation.x = Math.cos(k.t * 0.9 + t.phase * 3) * 0.2;
    }
    this.krakenSign.rotation.y += dt;
    this.krakenSign.position.y = 2.5 + waveHeight(this.krakenSign.position.x, this.krakenSign.position.z, k.t);
    const rose = k.justRose; k.justRose = false;
    return { active: k.state === 'up' || k.state === 'rising', rose };
  }

  update(dt, t) {
    // 부표/게이트 흔들림
    for (const g of this.gateMeshes) {
      g.position.y = waveHeight(g.position.x, g.position.z, t) * 0.8;
      g.rotation.z = Math.sin(t * 1.3 + g.position.x) * 0.06;
      g.userData.flag.rotation.y = Math.sin(t * 4 + g.position.z) * 0.3;
    }
    // 소용돌이: 텍스처 회전 + 정점이 파도 높이를 따라감
    for (const w of this.whirlpools) {
      w.uvRot -= dt * 2.2;
      const tex = w.mesh.material.map; tex.center.set(0.5, 0.5); tex.rotation = w.uvRot;
      const pos = w.geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const wx = w.x + pos.getX(i), wz = w.z + pos.getZ(i);
        pos.setY(i, waveHeight(wx, wz, t) + 0.45);
      }
      pos.needsUpdate = true;
    }
    // 보급 통 회전/재생성
    for (const p of this.pickups) {
      if (!p.active) { p.timer -= dt; if (p.timer <= 0) { p.active = true; p.mesh.visible = true; } continue; }
      p.mesh.rotation.y += dt * 1.5;
      p.mesh.position.y = 1.5 + waveHeight(p.x, p.z, t) + Math.sin(t * 3 + p.x) * 0.3;
    }
    this.startGate.position.y = waveHeight(this.startGate.position.x, this.startGate.position.z, t) * 0.3;

    // 레이싱 라인: 파도 위에 떠 있게 + 화살표 흐름
    this.raceLineScroll -= dt * 0.9;
    const N = this.sampleCount;
    for (const rl of this.raceLines) {
      const pos = rl.geo.attributes.position;
      for (let i = 0; i <= N; i++) {
        const p = this.pointAt(i), n = this.normalAt(i);
        const cx = p.x + n.x * rl.offset, cz = p.z + n.z * rl.offset;
        const h = waveHeight(cx, cz, t) + 0.5;
        pos.setY(i * 2, h); pos.setY(i * 2 + 1, h);
      }
      pos.needsUpdate = true;
    }
    const cm = this.raceLines[0].mesh.material.map; cm.offset.x = this.raceLineScroll;
    this.updateBoostPads(dt, t);
    this.updateRamps(dt);
    // 금화 회전/재생성
    for (const c of this.coins) {
      if (!c.active) { c.timer -= dt; if (c.timer <= 0) { c.active = true; } else continue; }
      this._v.set(c.x, 2 + waveHeight(c.x, c.z, t) + Math.sin(t * 4 + c.x * 0.1) * 0.25, c.z);
      this._q.setFromAxisAngle(_Y, t * 3 + c.i * 0.4);
      this._m4.compose(this._v, this._q, this._s);
      this.coinMesh.setMatrixAt(c.i, this._m4);
    }
    this.coinMesh.instanceMatrix.needsUpdate = true;
    for (const c of this.chests) {
      if (!c.active) { c.timer -= dt; if (c.timer <= 0) { c.active = true; c.mesh.visible = true; } continue; }
      c.mesh.rotation.y += dt * 0.8;
      c.mesh.position.y = 1.5 + waveHeight(c.x, c.z, t) + Math.sin(t * 2.5 + c.x) * 0.3;
    }
    for (const s of this.scrolls) {
      if (!s.active) { s.timer -= dt; if (s.timer <= 0) { s.active = true; s.mesh.visible = true; } continue; }
      s.mesh.rotation.y += dt * 1.2;
      s.mesh.position.y = 2 + waveHeight(s.x, s.z, t) + Math.sin(t * 3 + s.z) * 0.3;
    }
    for (const d of this.discoveries) {
      if (!d.active) { d.timer -= dt; if (d.timer <= 0) { d.active = true; d.mesh.visible = true; } continue; }
      d.orb.rotation.y += dt * 1.5; d.orb.rotation.x += dt * 0.7;
      d.mesh.position.y = 2.2 + waveHeight(d.x, d.z, t) + Math.sin(t * 2.2 + d.x) * 0.4;
      d.orb.scale.setScalar(1 + Math.sin(t * 4 + d.z) * 0.12);
    }
  }
  collectScroll(s) { s.active = false; s.mesh.visible = false; s.timer = 45; }
  updateBoostPads(dt, t) {
    for (const b of this.boostPads) {
      b.mat.map.offset.x -= dt * 1.6;
      const h = waveHeight(b.x, b.z, t);
      b.mesh.position.y = h + 0.6; b.ring.position.y = h + 0.55;
      b.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.06);
    }
  }
  collectDiscovery(d) { d.active = false; d.mesh.visible = false; d.timer = 35; }

  collectPickup(p) { p.active = false; p.mesh.visible = false; p.timer = 9; }
  collectCoin(c) {
    c.active = false; c.timer = 14;
    this._m4.makeScale(0, 0, 0); this.coinMesh.setMatrixAt(c.i, this._m4); this.coinMesh.instanceMatrix.needsUpdate = true;
  }
  collectChest(c) { c.active = false; c.mesh.visible = false; c.timer = 40; }
}
const _Y = new THREE.Vector3(0, 1, 0);
const _ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

function makeChevronTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 64, 32);
  // 진행 방향(+u) 화살표
  ctx.fillStyle = 'rgba(120,220,255,0.95)';
  ctx.beginPath(); ctx.moveTo(8, 2); ctx.lineTo(30, 16); ctx.lineTo(8, 30); ctx.lineTo(20, 30); ctx.lineTo(42, 16); ctx.lineTo(20, 2); ctx.closePath(); ctx.fill();
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
function makeRopeTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 8;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 64, 8);
  for (let x = 0; x < 64; x += 8) { ctx.fillStyle = (x / 8) % 2 ? '#e8dcc0' : '#8a6a48'; ctx.fillRect(x, 2, 8, 4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping;
  return t;
}
function woodRampTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9a6a3a'; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'rgba(0,0,0,0.12)' : 'rgba(255,220,160,0.1)'; ctx.fillRect(0, i * 16, 128, 16); ctx.fillStyle = '#4a3016'; ctx.fillRect(0, i * 16, 128, 1.5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 3); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeDashTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 8;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 64, 8); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 40, 8);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping;
  return t;
}

function makeCheckerTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32;
  const ctx = c.getContext('2d');
  for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { ctx.fillStyle = (x + y) % 2 ? '#111' : '#fff'; ctx.fillRect(x * 16, y * 16, 16, 16); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.x = 2;
  return t;
}
function makeWhirlTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.translate(128, 128);
  for (let arm = 0; arm < 3; arm++) {
    ctx.beginPath();
    for (let i = 0; i < 200; i++) {
      const t = i / 200, a = t * Math.PI * 5 + (arm / 3) * Math.PI * 2, r = t * 120;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(230,245,255,0.85)'; ctx.lineWidth = 7; ctx.stroke();
  }
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 128);
  g.addColorStop(0, 'rgba(10,30,60,0.9)'); g.addColorStop(0.5, 'rgba(20,60,100,0.5)'); g.addColorStop(1, 'rgba(20,60,100,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 128, 0, Math.PI * 2); ctx.fill();
  return new THREE.CanvasTexture(c);
}
