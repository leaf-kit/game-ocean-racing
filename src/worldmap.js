// 양피지 풍 세계지도: 항로, 기항지, 현재 위치 표시
import { PORTS, CONTINENTS, REGION_COASTS } from './history.js?v=20260912153205';

export const WORLD_ROUTE = { ports: PORTS, bounds: [-180, 180, -58, 78] };

export class WorldMap {
  constructor(canvas, route = WORLD_ROUTE) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.W = canvas.width; this.H = canvas.height;
    this.setRoute(route);
  }
  // 맵마다 다른 항로/범위로 지도를 다시 그린다
  setRoute(route) {
    this.route = route; this.ports = route.ports;
    [this.LON_MIN, this.LON_MAX, this.LAT_MIN, this.LAT_MAX] = route.bounds;
    this.center = route.center ?? null; // 태평양처럼 날짜변경선을 가운데 두는 지도
    this.base = this._drawBase();
  }
  // 경도 정규화: center 가 있으면 center±180 범위로
  _lon(lon) { if (this.center != null) { while (lon < this.center - 180) lon += 360; while (lon > this.center + 180) lon -= 360; } return lon; }
  _xyRaw(lon, lat) { return [((lon - this.LON_MIN) / (this.LON_MAX - this.LON_MIN)) * this.W, ((this.LAT_MAX - lat) / (this.LAT_MAX - this.LAT_MIN)) * this.H]; }
  // 경위도 -> 캔버스 좌표
  xy(lon, lat) {
    lon = this._lon(lon);
    return [((lon - this.LON_MIN) / (this.LON_MAX - this.LON_MIN)) * this.W, ((this.LAT_MAX - lat) / (this.LAT_MAX - this.LAT_MIN)) * this.H];
  }

  _drawBase() {
    const off = document.createElement('canvas'); off.width = this.W; off.height = this.H;
    const o = off.getContext('2d'), W = this.W, H = this.H;
    // 양피지 배경
    const g = o.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.7);
    g.addColorStop(0, '#e9d9ae'); g.addColorStop(1, '#c9ad70');
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    // 얼룩
    for (let i = 0; i < 40; i++) {
      o.fillStyle = `rgba(120,80,30,${0.03 + Math.random() * 0.05})`;
      o.beginPath(); o.arc(Math.random() * W, Math.random() * H, 6 + Math.random() * 30, 0, Math.PI * 2); o.fill();
    }
    // 위경도 격자
    o.strokeStyle = 'rgba(90,60,20,0.18)'; o.lineWidth = 1;
    const gStep = (this.LON_MAX - this.LON_MIN) > 200 ? 30 : (this.LON_MAX - this.LON_MIN) > 40 ? 10 : 2;
    for (let lon = -540; lon <= 540; lon += gStep) { const [x] = this.xy(lon, 0); if (x < 0 || x > W) continue; o.beginPath(); o.moveTo(x, 0); o.lineTo(x, H); o.stroke(); }
    for (let lat = -90; lat <= 90; lat += gStep) { const [, y] = this.xy(this.LON_MIN, lat); if (y < 0 || y > H) continue; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); }
    // 대륙 (날짜변경선 양쪽으로 복사해 어느 범위든 이어지게)
    const polys = this.route.coasts ? REGION_COASTS[this.route.coasts] : CONTINENTS;
    for (const shift of (this.route.coasts ? [0] : [0, 360, -360])) for (const poly of polys) {
      o.beginPath();
      poly.forEach(([lon, lat], i) => { const [x, y] = this._xyRaw(lon + shift, lat); if (i === 0) o.moveTo(x, y); else o.lineTo(x, y); });
      o.closePath();
      o.fillStyle = '#b89a62'; o.fill();
      o.strokeStyle = '#5a3d18'; o.lineWidth = 1.2; o.stroke();
    }
    // 항로 (점선)
    o.setLineDash([4, 3]); o.strokeStyle = 'rgba(140,30,20,0.75)'; o.lineWidth = 1.6;
    for (let i = 0; i < this.ports.length; i++) this._routeSegment(o, this.ports[i], this.ports[(i + 1) % this.ports.length]);
    o.setLineDash([]);
    // 기항지 점
    for (const p of this.ports) { const [x, y] = this.xy(p.lon, p.lat); o.fillStyle = '#7a1f14'; o.beginPath(); o.arc(x, y, 2.6, 0, Math.PI * 2); o.fill(); }
    // 나침반 장식
    const cx = W - 26, cy = H - 26;
    o.strokeStyle = 'rgba(90,60,20,0.7)'; o.lineWidth = 1; o.beginPath(); o.arc(cx, cy, 12, 0, Math.PI * 2); o.stroke();
    o.fillStyle = '#7a1f14'; o.beginPath(); o.moveTo(cx, cy - 14); o.lineTo(cx + 4, cy); o.lineTo(cx, cy + 4); o.lineTo(cx - 4, cy); o.closePath(); o.fill();
    // 테두리
    o.strokeStyle = '#5a3d18'; o.lineWidth = 3; o.strokeRect(1.5, 1.5, W - 3, H - 3);
    return off;
  }

  // 날짜변경선을 넘는 구간은 두 조각으로 나눠 그린다
  _routeSegment(o, a, b) {
    let lonB = b.lon;
    if (lonB - a.lon > 180) lonB -= 360; else if (lonB - a.lon < -180) lonB += 360;
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      // 살짝 휘어진 항적
      const bend = -(this.LON_MAX - this.LON_MIN) / 70;
      const lon = a.lon + (lonB - a.lon) * t, lat = a.lat + (b.lat - a.lat) * t + Math.sin(t * Math.PI) * bend;
      pts.push([lon, lat]);
    }
    const draw = (shift) => {
      o.beginPath();
      pts.forEach(([lon, lat], i) => { const [x, y] = this.xy(lon + shift, lat); if (i === 0) o.moveTo(x, y); else o.lineTo(x, y); });
      o.stroke();
    };
    draw(0);
    if (lonB > 180) draw(-360); else if (lonB < -180) draw(360);
  }

  // 랩 진행률(0~1)을 항로 위 경위도로
  routePos(frac) {
    const n = this.ports.length;
    const f = ((frac % 1) + 1) % 1;
    const i = Math.floor(f * n), t = f * n - i;
    const a = this.ports[i], b = this.ports[(i + 1) % n];
    let lonB = b.lon;
    if (lonB - a.lon > 180) lonB -= 360; else if (lonB - a.lon < -180) lonB += 360;
    let lon = a.lon + (lonB - a.lon) * t;
    if (lon > 180) lon -= 360; if (lon < -180) lon += 360;
    const bend = -(this.LON_MAX - this.LON_MIN) / 70;
    return [lon, a.lat + (b.lat - a.lat) * t + Math.sin(t * Math.PI) * bend];
  }

  // 매 프레임 호출: 현재 기항지 강조 + 배 위치
  draw(portIdx, frac, t) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.drawImage(this.base, 0, 0);
    // 지나온 항로 강조
    ctx.strokeStyle = 'rgba(200,40,20,0.9)'; ctx.lineWidth = 2.2;
    for (let i = 0; i < portIdx; i++) this._routeSegment(ctx, this.ports[i], this.ports[(i + 1) % this.ports.length]);
    // 현재 기항지
    const p = this.ports[portIdx]; const [px, py] = this.xy(p.lon, p.lat);
    ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 6 + Math.sin(t * 5) * 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ff4d2e'; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
    // 배 마커
    const [lon, lat] = this.routePos(frac); const [sx, sy] = this.xy(lon, lat);
    ctx.fillStyle = '#1a1206'; ctx.beginPath(); ctx.moveTo(sx, sy - 5); ctx.lineTo(sx + 4, sy + 3); ctx.lineTo(sx - 4, sy + 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.moveTo(sx, sy - 3.5); ctx.lineTo(sx + 2.5, sy + 2); ctx.lineTo(sx - 2.5, sy + 2); ctx.closePath(); ctx.fill();
  }
}
