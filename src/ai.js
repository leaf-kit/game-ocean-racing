// AI 조타 로직
import * as THREE from 'three';
import { TRACK_HALF_WIDTH } from './track.js?v=20260912153205';

const DIFF = {
  easy: { skill: 0.8, rubber: 0.10, fireChance: 0.25, boostUse: 0.5, laneVar: 0.7 },
  normal: { skill: 0.92, rubber: 0.08, fireChance: 0.55, boostUse: 0.8, laneVar: 0.6 },
  hard: { skill: 1.0, rubber: 0.05, fireChance: 0.85, boostUse: 1.0, laneVar: 0.5 },
};
export function difficultyParams(name) { return DIFF[name] || DIFF.normal; }

const _t = new THREE.Vector3();

function angleDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

export function aiControl(boat, track, boats, player, wind, dt, diff, krakenActive) {
  const P = boat.phys;
  const ai = boat.ai;
  // 차선 변경
  ai.laneTimer -= dt;
  if (ai.laneTimer <= 0) { ai.laneTimer = 4 + Math.random() * 6; ai.targetLane = (Math.random() - 0.5) * 2 * diff.laneVar; }
  ai.laneOffset += ((ai.targetLane ?? 0) - ai.laneOffset) * Math.min(1, dt * 0.8);

  // 앞쪽 목표점
  const sampleLen = track.totalLength / track.sampleCount;
  const lookUnits = 34 + boat.speed * 1.1;
  const idx = boat.curveIdx + Math.round(lookUnits / sampleLen);
  const p = track.pointAt(idx), n = track.normalAt(idx);
  let tx = p.x + n.x * ai.laneOffset * TRACK_HALF_WIDTH * 0.75;
  let tz = p.z + n.z * ai.laneOffset * TRACK_HALF_WIDTH * 0.75;

  // 장애물 회피 (암초, 섬, 소용돌이, 크라켄)
  const fx = Math.sin(boat.heading), fz = Math.cos(boat.heading);
  let avoidX = 0, avoidZ = 0;
  const consider = (ox, oz, r, weight) => {
    const dx = ox - boat.pos.x, dz = oz - boat.pos.z;
    const dist = Math.hypot(dx, dz);
    const ahead = dx * fx + dz * fz;
    if (ahead < 0 || dist > r + 70) return;
    const lateral = dx * fz - dz * fx; // 양수 = 왼쪽
    if (Math.abs(lateral) > r + P.radius + 10) return;
    const push = (r + P.radius + 12 - Math.abs(lateral)) * weight * (1 - ahead / (r + 70));
    const side = lateral > 0 ? -1 : 1; // 반대쪽으로
    avoidX += (fz * side) * push; avoidZ += (-fx * side) * push;
  };
  for (const o of track.obstacles) if (o.active !== false) consider(o.x, o.z, o.r, 1.2);
  for (const w of track.whirlpools) if (w.active !== false) consider(w.x, w.z, w.r + 6, 1.8);
  const kr = track.kraken;
  const krDist = Math.hypot(kr.x - boat.pos.x, kr.z - boat.pos.z);
  if (krDist < 170 && kr.enabled !== false) {
    // 크라켄 구역: 촉수 사이 중앙 통로로 진입
    ai.laneOffset *= Math.max(0, (krDist - 60) / 110);
    if (krakenActive) for (const tt of kr.tentacles) consider(tt.x, tt.z, tt.r + 3, 1.2);
  }
  // 다른 배와 최소한의 거리 유지 + 바로 앞 배 추돌 방지
  let brake = 1;
  for (const b of boats) {
    if (b === boat) continue;
    consider(b.pos.x, b.pos.z, b.phys.radius, 0.6);
    const dx = b.pos.x - boat.pos.x, dz = b.pos.z - boat.pos.z;
    const ahead = dx * fx + dz * fz, lateral = Math.abs(dx * fz - dz * fx);
    if (ahead > 0 && ahead < 26 && lateral < 7 && b.speed < boat.speed + 2) brake = Math.min(brake, 0.45 + ahead / 60);
  }
  tx += avoidX; tz += avoidZ;

  const desired = Math.atan2(tx - boat.pos.x, tz - boat.pos.z);
  const diffA = angleDiff(desired, boat.heading);
  boat.steer = THREE.MathUtils.clamp(diffA * 2.4, -1, 1);
  boat.throttle = (Math.abs(diffA) > 1.1 ? 0.55 : 1) * brake;

  // 고무줄 효과 (플레이어와의 거리에 따라 실력 보정)
  const gap = boat.progress - player.progress;
  let skill = diff.skill;
  if (gap < -220) skill += diff.rubber * Math.min(1, (-gap - 220) / 400);
  else if (gap > 260) skill -= diff.rubber * 0.6 * Math.min(1, (gap - 260) / 400);
  boat.skill += (skill - boat.skill) * Math.min(1, dt);

  // 부스트 사용
  if (!boat.boosting && boat.boost > 0.45 && Math.abs(diffA) < 0.25 && !boat.offCourse && Math.random() < diff.boostUse * dt * 0.8) boat.boosting = true;
  if (boat.boosting && (boat.boost <= 0.02 || Math.abs(diffA) > 0.6)) boat.boosting = false;

  // 포격: 전방 가까운 배가 있으면
  let fire = false;
  ai.fireTimer -= dt;
  if (boat.cannonCd <= 0 && ai.fireTimer <= 0 && boat.time > 12) {
    for (const b of boats) {
      if (b === boat) continue;
      const dx = b.pos.x - boat.pos.x, dz = b.pos.z - boat.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 20 && d < 95) {
        const a = Math.abs(angleDiff(Math.atan2(dx, dz), boat.heading));
        if (a < 0.3 && Math.random() < diff.fireChance) { fire = true; break; }
      }
    }
    ai.fireTimer = 1.5;
  }
  return fire;
}
