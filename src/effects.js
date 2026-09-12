// 파티클 시스템 및 잡다한 연출 (항적, 물보라, 갈매기)
import * as THREE from 'three';

const MAX = 7000;
const pVert = /* glsl */`
  attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
  varying float vAlpha; varying vec3 vColor;
  void main() {
    vAlpha = aAlpha; vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const pFrag = /* glsl */`
  uniform sampler2D uTex; varying float vAlpha; varying vec3 vColor;
  void main() {
    vec4 t = texture2D(uTex, gl_PointCoord);
    gl_FragColor = vec4(vColor, t.a * vAlpha);
  }
`;

function softTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export class Particles {
  constructor(scene) {
    this.geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(MAX * 3);
    this.col = new Float32Array(MAX * 3);
    this.size = new Float32Array(MAX);
    this.alpha = new Float32Array(MAX);
    this.vel = new Float32Array(MAX * 3);
    this.life = new Float32Array(MAX);
    this.maxLife = new Float32Array(MAX);
    this.grav = new Float32Array(MAX);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    this.geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    this.geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: softTexture() } }, vertexShader: pVert, fragmentShader: pFrag,
      transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.next = 0;
    this._c = new THREE.Color();
  }

  spawn(x, y, z, vx, vy, vz, life, size, color, grav = 0) {
    const i = this.next; this.next = (this.next + 1) % MAX;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.life[i] = life; this.maxLife[i] = life; this.size[i] = size; this.grav[i] = grav;
    this._c.set(color);
    this.col[i * 3] = this._c.r; this.col[i * 3 + 1] = this._c.g; this.col[i * 3 + 2] = this._c.b;
    this.alpha[i] = 1;
  }

  burst(x, y, z, count, opts = {}) {
    const { speed = 8, up = 6, life = 1.0, size = 3, color = 0xffffff, grav = -12, spread = 1 } = opts;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * speed;
      this.spawn(x + (Math.random() - 0.5) * spread, y, z + (Math.random() - 0.5) * spread,
        Math.cos(a) * r, up * (0.5 + Math.random()), Math.sin(a) * r,
        life * (0.6 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.8), color, grav);
    }
  }

  update(dt) {
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      this.vel[i * 3 + 1] += this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.pos[i * 3 + 1] < -0.5 && this.grav[i] < 0) { this.life[i] = 0; }
      this.alpha[i] = Math.max(0, this.life[i] / this.maxLife[i]) * 0.7;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aAlpha.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
  }
}

// 갈매기 무리
export class Seagulls {
  constructor(scene, center, count = 10) {
    this.group = new THREE.Group();
    this.birds = [];
    const mat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5, side: THREE.DoubleSide });
    for (let i = 0; i < count; i++) {
      const b = new THREE.Group();
      const lw = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), mat);
      const rw = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), mat);
      lw.position.x = -1.1; rw.position.x = 1.1;
      lw.geometry.translate(1.1, 0, 0); rw.geometry.translate(-1.1, 0, 0);
      lw.position.x = 0; rw.position.x = 0;
      lw.rotation.x = -Math.PI / 2; rw.rotation.x = -Math.PI / 2;
      lw.scale.x = -1;
      b.add(lw, rw);
      b.userData = { lw, rw, phase: Math.random() * 10, r: 30 + Math.random() * 60, h: 25 + Math.random() * 25, speed: 0.3 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2 };
      this.birds.push(b);
      this.group.add(b);
    }
    this.center = center.clone();
    scene.add(this.group);
  }
  update(t) {
    for (const b of this.birds) {
      const u = b.userData;
      const a = t * u.speed + u.offset;
      b.position.set(this.center.x + Math.cos(a) * u.r, u.h + Math.sin(t * 0.7 + u.phase) * 3, this.center.z + Math.sin(a) * u.r);
      b.rotation.y = -a;
      const flap = Math.sin(t * 9 + u.phase) * 0.6;
      u.lw.rotation.y = flap; u.rw.rotation.y = -flap;
    }
  }
}
