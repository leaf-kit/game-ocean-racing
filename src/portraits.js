// 제독 초상: 캔버스로 직접 그리는 스타일화된 인물화 (외부 이미지 없음)
// 각 초상은 피부·머리·수염·모자·의복 색과 형태로 구성된다.
export const PORTRAITS = [
  { id: 'yi', name: '이순신', en: 'Yi Sun-sin', nation: '조선', skin: '#e8c39e', hair: '#1a1410', hairStyle: 'topknot', beard: 'long', hat: 'gat', coat: '#8b1e2d', collar: '#f0e6d2', accent: '#d4af37', bg: ['#1a3a5c', '#0a1a2c'] },
  { id: 'columbus', name: '콜럼버스', en: 'Columbus', nation: '제노바', skin: '#f1cfae', hair: '#c9c2b6', hairStyle: 'bob', beard: 'none', hat: 'beret', coat: '#3b2a6b', collar: '#e8dcc0', accent: '#c9a55a', bg: ['#2d4a7a', '#0e1c33'] },
  { id: 'magellan', name: '마젤란', en: 'Magellan', nation: '포르투갈', skin: '#e6bf98', hair: '#2b1d12', hairStyle: 'short', beard: 'full', hat: 'none', coat: '#1f1f1f', collar: '#f5f0e6', accent: '#8a8a8a', bg: ['#3b3f5c', '#101223'] },
  { id: 'dagama', name: '바스코 다 가마', en: 'Vasco da Gama', nation: '포르투갈', skin: '#e2b98f', hair: '#3a2a1a', hairStyle: 'short', beard: 'full', hat: 'beret', coat: '#7a1f14', collar: '#f0e6d2', accent: '#d4af37', bg: ['#5c2a1a', '#1c0c06'] },
  { id: 'drake', name: '드레이크', en: 'Francis Drake', nation: '잉글랜드', skin: '#f3d3b3', hair: '#7a4a22', hairStyle: 'short', beard: 'goatee', hat: 'none', coat: '#2c3e50', collar: '#ffffff', accent: '#c9a55a', bg: ['#1f4e5c', '#07171c'] },
  { id: 'zhenghe', name: '정화', en: 'Zheng He', nation: '명나라', skin: '#e9c9a0', hair: '#1a1410', hairStyle: 'hidden', beard: 'none', hat: 'ming', coat: '#c0392b', collar: '#f1c40f', accent: '#f1c40f', bg: ['#6b2d1a', '#1f0d06'] },
  { id: 'barbarossa', name: '바르바로사', en: 'Hayreddin Barbarossa', nation: '오스만', skin: '#d9a877', hair: '#8a3a1a', hairStyle: 'hidden', beard: 'long', hat: 'turban', coat: '#2e6b4a', collar: '#e8dcc0', accent: '#d4af37', bg: ['#1f5a4a', '#061c16'] },
  { id: 'elcano', name: '엘카노', en: 'Elcano', nation: '스페인', skin: '#ebc7a3', hair: '#3a2a1a', hairStyle: 'short', beard: 'short', hat: 'tricorne', coat: '#4a2f16', collar: '#f0e6d2', accent: '#c9a55a', bg: ['#4a3a2a', '#15100a'] },
  { id: 'dias', name: '디아스', en: 'Bartolomeu Dias', nation: '포르투갈', skin: '#e6bf98', hair: '#4a3a2a', hairStyle: 'bob', beard: 'short', hat: 'none', coat: '#2e4a6b', collar: '#e8dcc0', accent: '#8fd4ff', bg: ['#1a3a5c', '#0a1a2c'] },
  { id: 'henry', name: '엔히크 왕자', en: 'Prince Henry', nation: '포르투갈', skin: '#f1cfae', hair: '#1a1410', hairStyle: 'bob', beard: 'none', hat: 'chaperon', coat: '#1a1a1a', collar: '#c9a55a', accent: '#d4af37', bg: ['#3a2a5c', '#120a22'] },
  { id: 'catalina', name: '카탈리나 데 에라우소', en: 'Catalina de Erauso', nation: '스페인', skin: '#f3d3b3', hair: '#2b1d12', hairStyle: 'short', beard: 'none', hat: 'plumed', coat: '#6b1f3a', collar: '#ffffff', accent: '#c9a55a', bg: ['#5c1f3a', '#1c0612'] },
  { id: 'piri', name: '피리 레이스', en: 'Piri Reis', nation: '오스만', skin: '#dcae82', hair: '#1a1410', hairStyle: 'hidden', beard: 'short', hat: 'turban', coat: '#1f4e7a', collar: '#f0e6d2', accent: '#d4af37', bg: ['#1a3a5c', '#0a1a2c'] },
];

// 캔버스에 초상을 그린다 (size x size)
export function drawPortrait(canvas, p, size = 128) {
  canvas.width = size; canvas.height = size;
  const c = canvas.getContext('2d'); const S = size / 128;
  c.save(); c.scale(S, S);
  // 배경: 방사형 그라데이션 + 나침반 문양
  const g = c.createRadialGradient(64, 50, 10, 64, 64, 90); g.addColorStop(0, p.bg[0]); g.addColorStop(1, p.bg[1]);
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = 'rgba(201,165,90,0.18)'; c.lineWidth = 1.2;
  c.beginPath(); c.arc(64, 64, 52, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; c.beginPath(); c.moveTo(64 + Math.cos(a) * 20, 64 + Math.sin(a) * 20); c.lineTo(64 + Math.cos(a) * 52, 64 + Math.sin(a) * 52); c.stroke(); }
  // 어깨/의복
  c.fillStyle = p.coat;
  c.beginPath(); c.moveTo(14, 128); c.quadraticCurveTo(18, 88, 44, 84); c.lineTo(84, 84); c.quadraticCurveTo(110, 88, 114, 128); c.closePath(); c.fill();
  // 옷깃
  c.fillStyle = p.collar;
  c.beginPath(); c.moveTo(48, 84); c.lineTo(64, 104); c.lineTo(80, 84); c.lineTo(72, 82); c.lineTo(64, 92); c.lineTo(56, 82); c.closePath(); c.fill();
  // 단추/장식
  c.fillStyle = p.accent; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(64, 108 + i * 7, 1.8, 0, Math.PI * 2); c.fill(); }
  // 목
  c.fillStyle = shade(p.skin, -12); c.fillRect(56, 68, 16, 20);
  // 얼굴
  const fg = c.createLinearGradient(40, 30, 88, 80); fg.addColorStop(0, shade(p.skin, 8)); fg.addColorStop(1, shade(p.skin, -10));
  c.fillStyle = fg; c.beginPath(); c.ellipse(64, 54, 22, 26, 0, 0, Math.PI * 2); c.fill();
  // 귀
  c.fillStyle = shade(p.skin, -6); c.beginPath(); c.ellipse(42, 56, 3.5, 5, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(86, 56, 3.5, 5, 0, 0, Math.PI * 2); c.fill();
  // 머리카락
  c.fillStyle = p.hair;
  if (p.hairStyle === 'bob') { c.beginPath(); c.moveTo(40, 58); c.quadraticCurveTo(38, 22, 64, 24); c.quadraticCurveTo(90, 22, 88, 58); c.lineTo(84, 60); c.quadraticCurveTo(84, 36, 64, 34); c.quadraticCurveTo(44, 36, 44, 60); c.closePath(); c.fill(); }
  else if (p.hairStyle === 'short') { c.beginPath(); c.moveTo(42, 46); c.quadraticCurveTo(44, 26, 64, 27); c.quadraticCurveTo(84, 26, 86, 46); c.quadraticCurveTo(80, 36, 64, 36); c.quadraticCurveTo(48, 36, 42, 46); c.closePath(); c.fill(); }
  else if (p.hairStyle === 'topknot') { c.beginPath(); c.moveTo(43, 44); c.quadraticCurveTo(46, 28, 64, 28); c.quadraticCurveTo(82, 28, 85, 44); c.quadraticCurveTo(78, 37, 64, 36); c.quadraticCurveTo(50, 37, 43, 44); c.closePath(); c.fill(); }
  // 눈썹
  c.strokeStyle = shade(p.hair, 10); c.lineWidth = 2.2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(50, 46); c.quadraticCurveTo(56, 43, 60, 46); c.stroke(); c.beginPath(); c.moveTo(68, 46); c.quadraticCurveTo(72, 43, 78, 46); c.stroke();
  // 눈
  for (const ex of [55, 73]) {
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, 53, 4.2, 2.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(ex + 0.5, 53.3, 2.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + 1.3, 52.4, 0.7, 0, Math.PI * 2); c.fill();
  }
  // 코
  c.strokeStyle = shade(p.skin, -28); c.lineWidth = 1.5; c.beginPath(); c.moveTo(64, 54); c.quadraticCurveTo(61, 63, 66, 64); c.stroke();
  // 입
  c.strokeStyle = shade(p.skin, -40); c.lineWidth = 1.8; c.beginPath(); c.moveTo(57, 71); c.quadraticCurveTo(64, 74, 71, 71); c.stroke();
  // 수염
  c.fillStyle = p.hair;
  if (p.beard === 'full') { c.beginPath(); c.moveTo(44, 62); c.quadraticCurveTo(46, 86, 64, 90); c.quadraticCurveTo(82, 86, 84, 62); c.quadraticCurveTo(78, 74, 64, 76); c.quadraticCurveTo(50, 74, 44, 62); c.closePath(); c.fill(); }
  else if (p.beard === 'long') { c.beginPath(); c.moveTo(46, 64); c.quadraticCurveTo(50, 100, 64, 104); c.quadraticCurveTo(78, 100, 82, 64); c.quadraticCurveTo(76, 76, 64, 77); c.quadraticCurveTo(52, 76, 46, 64); c.closePath(); c.fill(); }
  else if (p.beard === 'short') { c.beginPath(); c.moveTo(46, 66); c.quadraticCurveTo(50, 82, 64, 83); c.quadraticCurveTo(78, 82, 82, 66); c.quadraticCurveTo(76, 76, 64, 77); c.quadraticCurveTo(52, 76, 46, 66); c.closePath(); c.fill(); }
  else if (p.beard === 'goatee') { c.beginPath(); c.moveTo(58, 74); c.quadraticCurveTo(64, 88, 70, 74); c.quadraticCurveTo(64, 79, 58, 74); c.closePath(); c.fill(); c.fillRect(56, 66, 16, 2.5); }
  // 모자
  c.fillStyle = shade(p.coat, -18);
  if (p.hat === 'tricorne') { c.beginPath(); c.moveTo(30, 40); c.quadraticCurveTo(64, 10, 98, 40); c.quadraticCurveTo(64, 30, 30, 40); c.closePath(); c.fill(); c.fillStyle = p.accent; c.fillRect(46, 30, 36, 2); }
  else if (p.hat === 'beret') { c.beginPath(); c.ellipse(62, 30, 28, 11, -0.1, 0, Math.PI * 2); c.fill(); c.fillStyle = p.accent; c.beginPath(); c.arc(84, 27, 2.5, 0, Math.PI * 2); c.fill(); }
  else if (p.hat === 'gat') { c.fillStyle = '#111'; c.beginPath(); c.ellipse(64, 34, 40, 6, 0, 0, Math.PI * 2); c.fill(); c.fillRect(50, 12, 28, 22); c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.moveTo(52, 34); c.lineTo(48, 60); c.moveTo(76, 34); c.lineTo(80, 60); c.stroke(); }
  else if (p.hat === 'ming') { c.fillStyle = '#111'; c.beginPath(); c.moveTo(42, 34); c.lineTo(46, 18); c.lineTo(82, 18); c.lineTo(86, 34); c.closePath(); c.fill(); c.fillRect(24, 26, 20, 5); c.fillRect(84, 26, 20, 5); c.fillStyle = p.accent; c.fillRect(46, 30, 36, 2); }
  else if (p.hat === 'turban') { c.fillStyle = p.collar; c.beginPath(); c.ellipse(64, 32, 27, 14, 0, Math.PI, 0); c.fill(); c.beginPath(); c.moveTo(37, 32); c.quadraticCurveTo(64, 46, 91, 32); c.quadraticCurveTo(64, 40, 37, 32); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(40 + i * 4, 32); c.quadraticCurveTo(64, 18 + i * 3, 88 - i * 4, 32); c.stroke(); } c.fillStyle = p.accent; c.beginPath(); c.arc(64, 26, 3, 0, Math.PI * 2); c.fill(); }
  else if (p.hat === 'chaperon') { c.fillStyle = shade(p.coat, 10); c.beginPath(); c.moveTo(38, 44); c.quadraticCurveTo(40, 16, 64, 18); c.quadraticCurveTo(92, 16, 92, 40); c.quadraticCurveTo(100, 30, 96, 50); c.lineTo(86, 40); c.quadraticCurveTo(80, 30, 64, 30); c.quadraticCurveTo(46, 30, 38, 44); c.closePath(); c.fill(); }
  else if (p.hat === 'plumed') { c.beginPath(); c.moveTo(34, 38); c.quadraticCurveTo(64, 24, 96, 38); c.quadraticCurveTo(64, 32, 34, 38); c.closePath(); c.fill(); c.fillRect(46, 20, 34, 16); c.strokeStyle = '#f5f0e6'; c.lineWidth = 3; c.beginPath(); c.moveTo(78, 22); c.quadraticCurveTo(96, 6, 108, 16); c.stroke(); }
  // 액자
  c.strokeStyle = '#c9a55a'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, 125, 125);
  c.strokeStyle = 'rgba(201,165,90,0.5)'; c.lineWidth = 1; c.strokeRect(5.5, 5.5, 117, 117);
  c.restore();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
