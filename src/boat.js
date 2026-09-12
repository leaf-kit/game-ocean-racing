// 함선 상태 및 물리
import * as THREE from 'three';
import { derivePhysics } from './ships.js?v=20260912153205';
import { waveHeight, waveNormal, SEA } from './ocean.js?v=20260912153205';

const _n = new THREE.Vector3();

export class Boat {
  constructor(def, mesh, opts = {}) {
    this.def = def;
    this.mesh = mesh;
    this.phys = derivePhysics(def);
    this.isPlayer = !!opts.isPlayer;
    this.name = opts.name || def.name;
    this.color = opts.color || '#ffe08a';
    this.skill = opts.skill ?? 1;

    this.pos = new THREE.Vector3();
    this.heading = 0;
    this.speed = 0;
    this.slide = new THREE.Vector3();
    this.throttle = 0; this.steer = 0; this.boosting = false;
    this.boost = 0.3;
    this.cannonCd = 0;
    this.stun = 0;       // 피격/충돌 후 감속
    this.whirl = 0;      // 소용돌이 영향
    this.whirlTime = 0;  // 소용돌이 체류 시간
    this.whirlImmune = 0; // 탈출 직후 면역
    this.spin = 0;       // 강제 회전 속도
    this.offCourse = false;
    this.offDist = 0;

    this.lap = 0; this.nextCp = 1; this.progress = 0; this.curveIdx = 0; this.rank = 1;
    this.finished = false; this.finishTime = 0;
    this.time = 0;
    this.ai = { laneOffset: 0, laneTimer: 0, fireTimer: 0 };
    this.heel = 0; this.pitch = 0;
    this.windEffect = 0;
    this.lastHitBy = null;
    this.draftMul = 1;   // 슬립스트림 가속 배수 (main에서 설정)
    this.steerS = 0;     // 부드럽게 보간된 조타 입력
    this.turbo = 0;      // 부스터 패드/아이템의 초고속 남은 시간
    this.rowMul = 1;     // SHIFT 연타 게이지에 따른 가속 배수 (main에서 설정)
    this.airborne = false; this.airY = 0; this.airVy = 0; this.airTime = 0; this.rampCd = 0; // 점프대 비행 상태
    this.crest = 0;      // 폭풍 파도 마루 감지용
  }

  setStart(pos, heading) {
    this.pos.copy(pos); this.heading = heading; this.speed = 0; this.slide.set(0, 0, 0);
    this.mesh.position.copy(pos); this.mesh.rotation.set(0, heading, 0);
    this.curveIdx = 0;
  }

  forward(out = new THREE.Vector3()) { return out.set(Math.sin(this.heading), 0, Math.cos(this.heading)); }

  update(dt, wind, t) {
    const P = this.phys;
    this.time += dt;
    if (this.cannonCd > 0) this.cannonCd -= dt;
    if (this.stun > 0) this.stun -= dt;
    this.whirl = Math.max(0, this.whirl - dt);
    if (this.whirl <= 0) this.whirlTime = 0;
    if (this.whirlImmune > 0) this.whirlImmune -= dt;

    // 바람 영향 (순풍 +, 역풍 -)
    const rel = Math.cos(this.heading - wind.dir);
    let effect = rel * P.windSens * wind.strength;
    if (effect > 0) effect *= (this.def.tailwindMul ?? 1); else effect *= (this.def.headwindMul ?? 1);
    this.windEffect = effect;

    // 부스트
    if (this.boosting && this.boost > 0) { this.boost = Math.max(0, this.boost - dt * P.boostDrain / 2.8); }
    else this.boosting = false;
    this.boost = Math.min(1, this.boost + dt * 0.022 * P.boostRegen);

    let envMul = 1;
    if (this.stun > 0) envMul *= 0.55;
    if (this.whirl > 0) envMul *= 0.75;
    if (this.offCourse) { const pen = this.offDist > 100 ? 0.7 : 0.45; envMul *= 1 - pen * (this.def.offCourseMul ?? 1); }

    if (this.turbo > 0) this.turbo -= dt;
    if (this.rampCd > 0) this.rampCd -= dt;
    const boostMul = this.turbo > 0 ? 2.1 : this.boosting ? 1.7 : 1;
    const target = P.maxSpeed * this.skill * Math.max(-0.3, this.throttle) * (1 + effect) * boostMul * envMul * this.draftMul * this.rowMul;
    if (this.turbo > 0) this.speed = Math.max(this.speed, target * 0.9); // 부스터: 즉시 초고속
    if (target > this.speed) this.speed += (target - this.speed) * Math.min(1, P.accel * dt);
    else this.speed += (target - this.speed) * Math.min(1, (P.accel * 1.8 + 0.5) * dt * (this.turbo > 0 ? 0.3 : 1));

    // 조타 (속도가 있어야 잘 돔)
    const turnEff = THREE.MathUtils.clamp(Math.abs(this.speed) / (P.maxSpeed * 0.3), 0.2, 1);
    // 키 입력(0/1)을 완만하게 보간해 뱃머리가 스르르 돌아가게
    this.steerS += (this.steer - this.steerS) * Math.min(1, 5 * dt);
    const turn = this.steerS * P.turnRate * turnEff;
    this.heading += (turn + this.spin) * dt;
    this.spin *= Math.exp(-2.5 * dt);
    if (Math.abs(this.steerS) > 0.1) this.speed *= 1 - Math.abs(this.steerS) * 0.07 * dt * turnEff;

    // 이동
    const f = this.forward(_n);
    this.pos.x += f.x * this.speed * dt + this.slide.x * dt;
    this.pos.z += f.z * this.speed * dt + this.slide.z * dt;
    this.slide.multiplyScalar(Math.exp(-2.6 * dt));

    // 시각 갱신: 파도 위 부유
    const h = waveHeight(this.pos.x, this.pos.z, t);
    const wn = waveNormal(this.pos.x, this.pos.z, t, _n);
    // 점프대 비행: 포물선으로 날다가 수면에 닿으면 착수
    if (this.airborne) {
      this.airTime += dt; this.airVy -= 26 * dt; this.airY += this.airVy * dt;
      if (this.airY <= 0) { this.airY = 0; this.airborne = false; this.justLanded = true; this.airVy = 0; }
    }
    // 폭풍: 파도 경사면을 따라 배가 밀린다 (거북선은 절반)
    if (SEA.storm > 0.05 && !this.airborne && !this.def.hover) {
      const push = SEA.storm * (this.def.turtle ? 9 : 18) * (this.def.stormResist ?? 1);
      this.slide.x += wn.x * push * dt; this.slide.z += wn.z * push * dt;
    }
    this.crest = h;
    const hover = this.def.hover ?? 0; // 위그선: 항상 수면 위를 낮게 비행
    this.mesh.position.set(this.pos.x, h * (hover ? 0.4 : 0.85) + 0.25 + hover + this.airY, this.pos.z);
    const rock = (0.8 + SEA.storm * 0.9) * (this.def.hover ? 0.3 : 1);
    const targetHeel = -this.steerS * turnEff * 0.26 * (this.speed / P.maxSpeed) + (wn.x * Math.cos(this.heading) * 0.5 - wn.z * Math.sin(this.heading) * 0.5) * rock + effect * 0.3;
    let targetPitch = -(this.speed / P.maxSpeed) * 0.06 + (wn.x * Math.sin(this.heading) + wn.z * Math.cos(this.heading)) * 0.55 * rock;
    if (this.airborne) targetPitch = -THREE.MathUtils.clamp(this.airVy * 0.025, -0.45, 0.35); // 상승 시 뱃머리 들림, 하강 시 숙임
    this.heel += (targetHeel - this.heel) * Math.min(1, 2 * dt);
    this.pitch += (targetPitch - this.pitch) * Math.min(1, 2 * dt);
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotateY(this.heading);
    this.mesh.rotateX(this.pitch);
    this.mesh.rotateZ(this.heel);

    // 돛 부풀림/깃발
    const ud = this.mesh.userData;
    const fill = THREE.MathUtils.clamp(0.35 + rel * 0.65 * wind.strength + this.speed / P.maxSpeed * 0.3, 0.2, 1.2);
    for (const s of ud.sails) s.scale.z += (fill - s.scale.z) * Math.min(1, 2 * dt);
    ud.flag.rotation.y = (wind.dir - this.heading) + Math.PI + Math.sin(t * 8) * 0.15;
    ud.fire.visible = this.boosting || this.turbo > 0;
    if (ud.fire.visible) { ud.fire.scale.set(1 + Math.random() * 0.3, 1 + Math.random() * 0.5, 1 + Math.random() * 0.3); }
  }

  // 점프대 발사: 속도가 빠를수록 높이·멀리 난다. 공중에서는 터보로 초고속
  launch() {
    if (this.airborne || this.rampCd > 0) return false;
    const P = this.phys;
    const ratio = Math.max(0.35, Math.abs(this.speed) / P.maxSpeed);
    this.airborne = true; this.airTime = 0; this.airY = 0.5; this.airVy = 16 + ratio * 14;
    this.turbo = Math.max(this.turbo, 3.6); this.rampCd = 5;
    this.speed = Math.max(this.speed, P.maxSpeed * 1.4);
    return true;
  }

  // 충돌 반응
  hitObstacle(nx, nz, strength = 1) {
    const P = this.phys;
    const loss = P.collisionLoss * strength;
    this.speed *= 1 - Math.max(0, loss);
    this.slide.x += nx * 18 * strength; this.slide.z += nz * 18 * strength;
    this.stun = Math.max(this.stun, 0.5 * strength * (1.1 - P.mass / 4));
    this.spin += (Math.random() - 0.5) * 0.3 * strength * (this.def.turtle ? 0.2 : (this.def.spinResist ?? 1));
  }
  hitByCannon(dirx, dirz) {
    if (this.def.turtle) { this.slide.x += dirx * 6; this.slide.z += dirz * 6; this.stun = Math.max(this.stun, 0.5); return; }
    this.speed *= 0.6;
    this.slide.x += dirx * 12; this.slide.z += dirz * 12;
    this.stun = Math.max(this.stun, 1.2);
    this.spin += (Math.random() - 0.5) * 0.6;
  }
}
