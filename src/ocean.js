// 바다, 하늘, 조명 및 파도 높이 계산
import * as THREE from 'three';

// 파도 정의 (JS와 셰이더가 동일한 수식을 사용)
export const WAVES = [
  { dx: 1.0, dz: 0.3, amp: 0.9, len: 60, speed: 1.1 },
  { dx: -0.4, dz: 1.0, amp: 0.55, len: 34, speed: 1.6 },
  { dx: 0.7, dz: -0.8, amp: 0.3, len: 18, speed: 2.4 },
];
for (const w of WAVES) { const l = Math.hypot(w.dx, w.dz); w.dx /= l; w.dz /= l; }

// 바다 전역 상태: storm 0~1 (파도 증폭), flash 0~1 (번개 섬광)
export const SEA = { storm: 0, flash: 0 };
const STORM_K = (Math.PI * 2) / 110;

export function waveHeight(x, z, t) {
  let h = 0;
  const m = 1 + SEA.storm * 1.3;
  for (const w of WAVES) {
    const k = (Math.PI * 2) / w.len;
    h += w.amp * m * Math.sin((x * w.dx + z * w.dz) * k + t * w.speed);
  }
  // 폭풍의 너울 (긴 파장의 큰 파도)
  if (SEA.storm > 0) h += SEA.storm * 2.8 * Math.sin((x * WAVES[0].dx + z * WAVES[0].dz) * STORM_K + t * 0.9);
  return h;
}
export function waveNormal(x, z, t, out) {
  const e = 0.5;
  const hx = waveHeight(x + e, z, t) - waveHeight(x - e, z, t);
  const hz = waveHeight(x, z + e, t) - waveHeight(x, z - e, t);
  out.set(-hx / (2 * e), 1, -hz / (2 * e)).normalize();
  return out;
}

export const TIME_PRESETS = {
  day: {
    skyTop: 0x1a6fe0, skyHorizon: 0xb8e2ff, sunColor: 0xfff4d6, sunIntensity: 2.5, ambient: 0.8,
    deep: 0x0642a8, shallow: 0x1ea9e8, fog: 0xb8e2ff, fogNear: 320, fogFar: 1900, stars: 0, lantern: 0,
    sunPos: new THREE.Vector3(0.5, 0.7, 0.4), sunDisc: 0xfff9e0, sunSize: 70, hemiGround: 0x1467b0, label: '한낮',
  },
  sunset: {
    skyTop: 0x241d6a, skyHorizon: 0xff9c5a, sunColor: 0xffb070, sunIntensity: 2.0, ambient: 0.55,
    deep: 0x0c2f78, shallow: 0x2f6fbd, fog: 0xf0a078, fogNear: 280, fogFar: 1600, stars: 0.25, lantern: 0.5,
    sunPos: new THREE.Vector3(-0.8, 0.12, 0.4), sunDisc: 0xffd28a, sunSize: 140, hemiGround: 0x3a3a70, label: '석양',
  },
  night: {
    skyTop: 0x02051a, skyHorizon: 0x0b2a58, sunColor: 0xa8c4ff, sunIntensity: 1.2, ambient: 0.4,
    deep: 0x031a48, shallow: 0x0c4d9a, fog: 0x081c3a, fogNear: 220, fogFar: 1400, stars: 1, lantern: 1.6,
    sunPos: new THREE.Vector3(0.3, 0.6, -0.6), sunDisc: 0xe8f0ff, sunSize: 60, hemiGround: 0x061a34, label: '달밤',
  },
  cycle: { label: '낮→밤' },
};
// 시간대 순환: u 0 = 한낮, 0.5 = 석양, 1 = 달밤 (프리셋을 선형 보간)
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function lerpPreset(u) {
  const a = u < 0.5 ? TIME_PRESETS.day : TIME_PRESETS.sunset, b = u < 0.5 ? TIME_PRESETS.sunset : TIME_PRESETS.night;
  const t = THREE.MathUtils.smoothstep(u < 0.5 ? u * 2 : (u - 0.5) * 2, 0, 1);
  const col = (k) => _c1.set(a[k]).lerp(_c2.set(b[k]), t).getHex();
  const num = (k) => a[k] + (b[k] - a[k]) * t;
  return {
    skyTop: col('skyTop'), skyHorizon: col('skyHorizon'), sunColor: col('sunColor'), deep: col('deep'), shallow: col('shallow'), fog: col('fog'), sunDisc: col('sunDisc'), hemiGround: col('hemiGround'),
    sunIntensity: num('sunIntensity'), ambient: num('ambient'), fogNear: num('fogNear'), fogFar: num('fogFar'), stars: num('stars'), lantern: num('lantern'), sunSize: num('sunSize'),
    sunPos: a.sunPos.clone().lerp(b.sunPos, t).normalize(), label: u < 0.35 ? '한낮' : u < 0.7 ? '석양' : '달밤',
  };
}

const oceanVert = /* glsl */`
  uniform float uTime, uStorm;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;
  const float PI2 = 6.28318530718;
  // 파도 상수 (WAVES와 동일)
  const vec2 D1 = normalize(vec2(1.0, 0.3));   const float A1 = 0.9;  const float L1 = 60.0; const float S1 = 1.1;
  const vec2 D2 = normalize(vec2(-0.4, 1.0));  const float A2 = 0.55; const float L2 = 34.0; const float S2 = 1.6;
  const vec2 D3 = normalize(vec2(0.7, -0.8));  const float A3 = 0.3;  const float L3 = 18.0; const float S3 = 2.4;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec2 p = wp.xz;
    float k1 = PI2 / L1, k2 = PI2 / L2, k3 = PI2 / L3;
    float ph1 = dot(p, D1) * k1 + uTime * S1;
    float ph2 = dot(p, D2) * k2 + uTime * S2;
    float ph3 = dot(p, D3) * k3 + uTime * S3;
    float m = 1.0 + uStorm * 1.3;
    float h = (A1 * sin(ph1) + A2 * sin(ph2) + A3 * sin(ph3)) * m;
    // 폭풍 너울 (JS waveHeight와 동일)
    float kS = PI2 / 110.0;
    float phS = dot(p, D1) * kS + uTime * 0.9;
    h += uStorm * 2.8 * sin(phS);
    // 작은 잔물결 + 촘촘한 잔파도 (시각 전용)
    h += (0.12 + uStorm * 0.25) * sin(p.x * 0.9 + uTime * 3.0) * sin(p.y * 0.8 - uTime * 2.3);
    vec2 D4 = normalize(vec2(0.3, -1.0)); float k4 = PI2 / 9.0; float ph4 = dot(p, D4) * k4 + uTime * 3.4;
    vec2 D5 = normalize(vec2(-0.9, -0.5)); float k5 = PI2 / 5.5; float ph5 = dot(p, D5) * k5 + uTime * 4.1;
    h += 0.09 * sin(ph4) + 0.05 * sin(ph5);
    // 게르스트너 수평 변위: 마루는 뾰족하고 골은 넓게
    float steep = 0.28 + uStorm * 0.25;
    wp.xz += D1 * (steep * A1 * m * cos(ph1)) + D2 * (steep * A2 * m * cos(ph2));
    vec2 grad = (D1 * (A1 * k1 * cos(ph1)) + D2 * (A2 * k2 * cos(ph2)) + D3 * (A3 * k3 * cos(ph3))) * m + D1 * (uStorm * 2.8 * kS * cos(phS))
      + D4 * (0.09 * k4 * cos(ph4)) + D5 * (0.05 * k5 * cos(ph5));
    wp.y += h;
    vWorldPos = wp.xyz;
    vNormal = normalize(vec3(-grad.x, 1.0, -grad.y));
    vHeight = h;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const oceanFrag = /* glsl */`
  uniform vec3 uDeep, uShallow, uSky, uFog, uSunColor, uSunDir;
  uniform float uFogNear, uFogFar, uTime, uSpecPow, uStorm, uFlash;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uSunDir);
    vec2 p = vWorldPos.xz;
    // 잔물결 디테일 노멀: 서로 다른 방향의 작은 물결 + 노이즈 결
    float r1 = sin(p.x * 0.9 + p.y * 0.4 + uTime * 2.2), r2 = sin(p.x * -0.5 + p.y * 1.1 - uTime * 1.7), r3 = sin(p.x * 1.7 - p.y * 1.3 + uTime * 3.1);
    float nz1 = noise(p * 0.35 + uTime * 0.25), nz2 = noise(p * 0.35 + vec2(1.7, 0.0) + uTime * 0.25);
    vec3 N = normalize(vNormal + vec3(r1 * 0.06 + r3 * 0.03 + (nz1 - 0.5) * 0.12, 0.0, r2 * 0.06 - r3 * 0.03 + (nz2 - 0.5) * 0.12));
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.5);
    float t = smoothstep(-1.2 - uStorm * 2.0, 1.6 + uStorm * 2.5, vHeight);
    // 깊이감: 내려다볼수록 짙은 물, 비스듬히 볼수록 하늘빛. 큰 노이즈로 물빛 얼룩
    float blotch = noise(p * 0.02 + uTime * 0.02) * 0.5 + noise(p * 0.06 - uTime * 0.03) * 0.5;
    vec3 base = mix(uDeep, uShallow, t * 0.75 + blotch * 0.35);
    base *= 0.9 + blotch * 0.2;
    // 파도 마루 뒤로 빛이 비치는 투명한 물빛 (역광 산란)
    float sss = pow(max(dot(V, -L), 0.0), 3.0) * smoothstep(0.2, 1.0, t);
    base += uShallow * sss * 0.7;
    base = mix(base, vec3(0.13, 0.17, 0.2), uStorm * 0.65);
    float diff = max(dot(N, L), 0.0) * 0.4 + 0.6;
    vec3 col = base * diff;
    float down = max(dot(V, vec3(0.0, 1.0, 0.0)), 0.0);
    col = mix(col, uSky, fres * 0.45 * (1.0 - down * 0.4));
    // 태양 반사: 넓은 광택 + 날카로운 반짝임(글리터)
    vec3 H = normalize(L + V);
    float ndh = max(dot(N, H), 0.0);
    float specBroad = pow(ndh, uSpecPow * 0.25) * 0.35;
    float glitter = pow(ndh, uSpecPow * 2.0) * (0.6 + 0.8 * noise(p * 2.5 + uTime * 1.5));
    col += uSunColor * (specBroad + glitter * 1.6);
    // 거품: 마루의 흰 거품 + 바람 방향으로 길게 늘어진 거품 줄무늬
    vec2 wdir = normalize(vec2(1.0, 0.3));
    vec2 sp = vec2(dot(p, wdir), dot(p, vec2(-wdir.y, wdir.x)));
    float foamN = noise(p * 0.25 + uTime * 0.3) * noise(p * 0.07 - uTime * 0.1);
    float streak = noise(vec2(sp.x * 0.05 - uTime * 0.15, sp.y * 0.6)) * noise(vec2(sp.x * 0.12 + uTime * 0.1, sp.y * 1.4));
    float crest = smoothstep(0.55 - uStorm * 0.2, 1.0, t);
    float foam = crest * smoothstep(0.25 - uStorm * 0.15, 0.6, foamN);
    foam += smoothstep(0.3, 0.75, t) * smoothstep(0.42, 0.7, streak) * (0.35 + uStorm * 0.5);
    // 거품 가장자리는 잔거품으로 흩어짐
    float speck = step(0.9, noise(p * 3.0 + uTime * 0.8)) * crest * 0.5;
    foam = clamp(foam + speck, 0.0, 1.0);
    col = mix(col, vec3(0.93, 0.97, 1.0), foam * (0.65 + uStorm * 0.3));
    // 마루 뒤쪽 그늘: 물결에 입체감
    col *= 1.0 - (1.0 - t) * 0.12;
    // 거리: 멀수록 하늘빛이 섞이고 안개
    float dist = length(cameraPosition - vWorldPos);
    col = mix(col, uSky, smoothstep(150.0, 1200.0, dist) * 0.25);
    float fog = smoothstep(uFogNear, uFogFar, dist);
    col = mix(col, uFog, fog);
    col += vec3(uFlash * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const skyVert = /* glsl */`
  varying vec3 vDir;
  void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const skyFrag = /* glsl */`
  uniform vec3 uTop, uHorizon, uSunDir, uSunDisc;
  uniform float uSunSize, uStars, uStorm, uFlash, uAurora, uTime;
  varying vec3 vDir;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
    float sd = max(dot(vDir, normalize(uSunDir)), 0.0);
    float disc = smoothstep(1.0 - uSunSize * 0.00004, 1.0 - uSunSize * 0.00001, sd);
    float glow = pow(sd, 18.0) * 0.5 + pow(sd, 3.0) * 0.12;
    col += uSunDisc * (disc + glow);
    if (uStars > 0.01 && vDir.y > 0.0) {
      // 별: 격자 해시 + 반짝임
      vec3 g = floor(vDir * 220.0);
      float s = hash(g);
      float tw = 0.65 + 0.35 * sin(uTime * (2.0 + hash(g + 3.0) * 4.0) + hash(g + 7.0) * 6.28);
      float star = step(0.982, s) * smoothstep(0.0, 0.2, vDir.y) * tw;
      vec3 g2 = floor(vDir * 90.0);
      float big = step(0.993, hash(g2 + 11.0)) * smoothstep(0.0, 0.2, vDir.y) * (0.7 + 0.3 * sin(uTime * 1.5 + hash(g2) * 6.28));
      col += (vec3(star) * (0.6 + 0.4 * hash(g + 1.0)) + vec3(0.9, 0.95, 1.0) * big * 1.4) * uStars;
      // 은하수: 비스듬한 띠에 노이즈 구름
      vec3 mwN = normalize(vec3(0.55, 0.35, -0.75));
      float d = dot(vDir, mwN);
      float band = exp(-d * d * 28.0);
      vec3 q = vDir * 6.0;
      float n1 = hash(floor(q)) * 0.5 + hash(floor(q * 2.3 + 5.0)) * 0.3 + hash(floor(q * 5.1 + 9.0)) * 0.2;
      float n2 = hash(floor(q * 1.7 + 2.0));
      float mw = band * (0.35 + 0.65 * n1) * smoothstep(0.0, 0.25, vDir.y);
      col += mix(vec3(0.5, 0.6, 0.95), vec3(0.95, 0.85, 0.9), n2) * mw * 0.55 * uStars;
      col += vec3(star) * band * 0.8 * uStars;
    }
    // 수평선 아래는 안개색
    if (vDir.y < 0.0) col = uHorizon;
    // 오로라: 지평선 위에 물결치는 초록-보라 빛의 장막
    if (uAurora > 0.001 && vDir.y > 0.02) {
      float ang = atan(vDir.z, vDir.x);
      float band = sin(ang * 5.0 + uTime * 0.35 + sin(ang * 3.0 - uTime * 0.2) * 1.4) * 0.5 + 0.5;
      float band2 = sin(ang * 9.0 - uTime * 0.5) * 0.5 + 0.5;
      float curtain = smoothstep(0.35, 0.95, band * 0.7 + band2 * 0.3);
      float alt = smoothstep(0.03, 0.22, vDir.y) * (1.0 - smoothstep(0.35, 0.75, vDir.y));
      vec3 ac = mix(vec3(0.15, 0.95, 0.45), vec3(0.6, 0.25, 0.95), smoothstep(0.1, 0.6, vDir.y));
      col += ac * curtain * alt * uAurora * 0.9;
    }
    // 폭풍: 먹구름 색으로, 번개 섬광
    vec3 stormCol = mix(vec3(0.3, 0.32, 0.36), vec3(0.12, 0.13, 0.17), pow(h, 0.5));
    col = mix(col, stormCol, uStorm * 0.9);
    col += vec3(uFlash) * (0.9 + 0.4 * h);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export class Environment {
  constructor(scene, presetName = 'day', size = 5000, map = null) {
    this.scene = scene;
    this.map = map;
    this.tint = map && map.tint ? { deep: new THREE.Color(map.tint.deep), shallow: new THREE.Color(map.tint.shallow) } : null;
    this.fogMul = map && map.fog ? map.fog : 1;
    this.preset = (presetName === 'cycle' ? lerpPreset(0) : TIME_PRESETS[presetName]) || TIME_PRESETS.day;
    const p = this.preset;

    // 바다
    this.oceanUniforms = {
      uTime: { value: 0 },
      uDeep: { value: this._tintDeep(p.deep) }, uShallow: { value: this._tintShallow(p.shallow) },
      uSky: { value: new THREE.Color(p.skyHorizon) }, uFog: { value: new THREE.Color(p.fog) },
      uSunColor: { value: new THREE.Color(p.sunColor) }, uSunDir: { value: p.sunPos.clone().normalize() },
      uFogNear: { value: p.fogNear * this.fogMul }, uFogFar: { value: p.fogFar * this.fogMul }, uSpecPow: { value: presetName === 'sunset' ? 60 : 140 },
      uStorm: { value: 0 }, uFlash: { value: 0 },
    };
    const oceanGeo = new THREE.PlaneGeometry(size, size, 320, 320);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.ShaderMaterial({ uniforms: this.oceanUniforms, vertexShader: oceanVert, fragmentShader: oceanFrag });
    this.ocean = new THREE.Mesh(oceanGeo, oceanMat);
    this.ocean.frustumCulled = false;
    scene.add(this.ocean);

    // 하늘
    const skyGeo = new THREE.SphereGeometry(2400, 32, 16);
    this.skyUniforms = {
      uTop: { value: new THREE.Color(p.skyTop) }, uHorizon: { value: new THREE.Color(p.skyHorizon) },
      uSunDir: { value: p.sunPos.clone().normalize() }, uSunDisc: { value: new THREE.Color(p.sunDisc) },
      uSunSize: { value: p.sunSize }, uStars: { value: +p.stars || 0 }, uStorm: { value: 0 }, uFlash: { value: 0 }, uAurora: { value: 0 }, uTime: { value: 0 },
    };
    const skyMat = new THREE.ShaderMaterial({ uniforms: this.skyUniforms, vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false });
    this.sky = new THREE.Mesh(skyGeo, skyMat);
    this.sky.frustumCulled = false;
    scene.add(this.sky);

    // 조명
    this.sun = new THREE.DirectionalLight(p.sunColor, p.sunIntensity);
    this.sun.position.copy(p.sunPos).multiplyScalar(500);
    scene.add(this.sun);
    this.hemi = new THREE.HemisphereLight(p.skyHorizon, p.hemiGround, p.ambient);
    scene.add(this.hemi);
    scene.fog = new THREE.Fog(p.fog, p.fogNear * this.fogMul, p.fogFar * this.fogMul);

    // 구름 (스프라이트)
    this.clouds = new THREE.Group();
    const cloudTex = makeCloudTexture();
    const cloudColor = presetName === 'night' ? 0x2a3a55 : presetName === 'sunset' ? 0xffc4a0 : 0xffffff;
    for (let i = 0; i < 40; i++) {
      const m = new THREE.SpriteMaterial({ map: cloudTex, color: cloudColor, transparent: true, opacity: presetName === 'night' ? 0.5 : 0.85, depthWrite: false, fog: true });
      const s = new THREE.Sprite(m);
      const a = Math.random() * Math.PI * 2, r = 700 + Math.random() * 1200;
      s.position.set(Math.cos(a) * r, 120 + Math.random() * 160, Math.sin(a) * r);
      const sc = 180 + Math.random() * 260;
      s.scale.set(sc, sc * 0.45, 1);
      s.userData.baseColor = new THREE.Color(cloudColor);
      this.clouds.add(s);
    }
    scene.add(this.clouds);
    this._stormCloud = new THREE.Color(0x2a2d33);
    this._stormFog = new THREE.Color(0x3a3f47);
    this._baseFog = new THREE.Color(p.fog);
    this._tmp = new THREE.Color();
  }

  // 폭풍 강도(0~1)와 번개 섬광(0~1)을 조명/안개/셰이더에 반영
  setStorm(storm, flash) {
    const p = this.preset;
    this.oceanUniforms.uStorm.value = storm; this.oceanUniforms.uFlash.value = flash;
    this.skyUniforms.uStorm.value = storm; this.skyUniforms.uFlash.value = flash;
    this.sun.intensity = p.sunIntensity * (1 - storm * 0.65) + flash * 5;
    this.hemi.intensity = p.ambient * (1 - storm * 0.4) + flash * 1.5;
    this.scene.fog.near = p.fogNear * this.fogMul * (1 - storm * 0.55);
    this.scene.fog.far = p.fogFar * this.fogMul * (1 - storm * 0.5);
    this._tmp.copy(this._baseFog).lerp(this._stormFog, storm);
    this.scene.fog.color.copy(this._tmp);
    this.oceanUniforms.uFog.value.copy(this._tmp);
    for (const c of this.clouds.children) c.material.color.copy(c.userData.baseColor).lerp(this._stormCloud, storm);
  }

  setAurora(v) { this.skyUniforms.uAurora.value = v; }
  // 맵 물빛: 프리셋 색과 맵 색을 섞는다
  _tintDeep(c) { const col = new THREE.Color(c); return this.tint ? col.lerp(this.tint.deep, 0.55) : col; }
  _tintShallow(c) { const col = new THREE.Color(c); return this.tint ? col.lerp(this.tint.shallow, 0.55) : col; }

  // 낮→밤 순환: u 0~1. 반환값은 현재 랜턴 밝기(0~1.6)
  setPhase(u) {
    const p = lerpPreset(u);
    this.preset = p; // 폭풍 계산의 기준값도 함께 이동
    this._baseFog.set(p.fog);
    const O = this.oceanUniforms, S = this.skyUniforms;
    O.uDeep.value.copy(this._tintDeep(p.deep)); O.uShallow.value.copy(this._tintShallow(p.shallow)); O.uSky.value.set(p.skyHorizon); O.uFog.value.set(p.fog);
    O.uSunColor.value.set(p.sunColor); O.uSunDir.value.copy(p.sunPos); O.uFogNear.value = p.fogNear * this.fogMul; O.uFogFar.value = p.fogFar * this.fogMul;
    O.uSpecPow.value = 140 - Math.sin(u * Math.PI) * 80;
    S.uTop.value.set(p.skyTop); S.uHorizon.value.set(p.skyHorizon); S.uSunDir.value.copy(p.sunPos); S.uSunDisc.value.set(p.sunDisc);
    S.uSunSize.value = p.sunSize; S.uStars.value = p.stars;
    this.sun.color.set(p.sunColor); this.sun.position.copy(p.sunPos).multiplyScalar(500);
    this.hemi.color.set(p.skyHorizon); this.hemi.groundColor.set(p.hemiGround);
    const cc = _c1.set(0xffffff).lerp(_c2.set(0xffc4a0), Math.min(1, u * 2)).lerp(_c2.set(0x2a3a55), Math.max(0, u * 2 - 1));
    for (const c of this.clouds.children) { c.userData.baseColor.copy(cc); c.material.opacity = 0.85 - Math.max(0, u * 2 - 1) * 0.35; }
    return p.lantern;
  }

  update(t, cameraPos) {
    this.oceanUniforms.uTime.value = t;
    this.skyUniforms.uTime.value = t;
    // 바다와 하늘은 카메라를 따라다님 (무한 바다 효과)
    this.ocean.position.x = Math.round(cameraPos.x / 20) * 20;
    this.ocean.position.z = Math.round(cameraPos.z / 20) * 20;
    this.sky.position.copy(cameraPos);
    this.clouds.position.x = cameraPos.x * 0.9;
    this.clouds.position.z = cameraPos.z * 0.9;
  }
}

function makeCloudTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 128);
  for (let i = 0; i < 14; i++) {
    const x = 40 + Math.random() * 176, y = 50 + Math.random() * 40, r = 25 + Math.random() * 35;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
