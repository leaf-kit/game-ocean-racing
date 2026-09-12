// 함선 정의 및 3D 모델 생성
import * as THREE from 'three';

// 분류 설명 (선택 화면 헤더)
export const SHIP_CATEGORIES = {
  sail: { name: '범선 (Sailing Ships)', desc: '노 없이 바람의 힘으로만 항해하는 선박. 원양 항해와 교역에 적합하며 순풍을 타면 빠르다.' },
  galley: { name: '갤리선 (Galleys)', desc: '노를 저어 움직여 바람이 없거나 역풍인 지중해 같은 곳에서도 기동성이 좋다. 가속과 선회에 강하다.' },
  special: { name: '특수선 (Special Craft)', desc: '거북선에서 대한민국 해군, 그리고 현대의 초고속정까지. 규격 밖의 성능으로 항로를 지배한다. AI 상대는 타지 않는다.' },
};

// 스탯 1~10. 특성 훅:
//  windSens 바람 민감도 / tailwindMul 순풍 배수 / headwindMul 역풍 배수 / boostRegen 게이지 충전 / boostDrain 부스트 소모 배수
//  cannonCooldown 재장전 / doubleShot 2연발 / stormResist 폭풍 밀림 배수 / pickupRadius 획득 반경 배수 / plunder 명중 시 게이지 충전
//  모델: masts 돛대 수, length 길이, lateen 삼각돛, oars 노, junk 정크 돛, turtle 거북선, sternH 선미루 높이
export const SHIPS = [
  // ---------------- 범선 ----------------
  {
    id: 'balsa', cat: 'sail', name: '발사', en: 'Balsa', nation: '포르투갈',
    desc: '초보 항해사가 처음 잡는 소형선. 가볍고 잘 돌지만 파도 한 번에 크게 휘청인다.',
    special: '특성: 깃털 선체 — 전속 항해 게이지 충전 최고, 충돌에 매우 약함',
    stats: { speed: 4, accel: 9, handling: 9, durability: 2 },
    windSens: 0.38, boostRegen: 2.2, cannonCooldown: 6, hullColor: 0x9c6b3c, sailColor: 0xf3ead6, masts: 1, length: 9, stripe: 0x3d6b9a, lateen: true,
  },
  {
    id: 'tarette', cat: 'sail', name: '타렛테', en: 'Tarette', nation: '이탈리아',
    desc: '지중해 연안 무역에 쓰인 소형 범선. 작은 항구 사이를 잽싸게 오갔다.',
    special: '특성: 연안 항해 — 항로 이탈 시 감속이 절반',
    stats: { speed: 5, accel: 8, handling: 8, durability: 4 },
    windSens: 0.36, boostRegen: 1.5, cannonCooldown: 5.5, hullColor: 0x7d5a35, sailColor: 0xf7f0dc, masts: 2, length: 10, stripe: 0xc0392b, lateen: true, offCourseMul: 0.5,
  },
  {
    id: 'dhow', cat: 'sail', name: '다우', en: 'Dhow', nation: '아라비아',
    desc: '인도양의 계절풍을 타고 아프리카와 인도를 오간 아랍 선박. 큰 삼각돛 하나로 바람을 움켜쥔다.',
    special: '특성: 계절풍의 아이 — 순풍 보너스 1.4배',
    stats: { speed: 6, accel: 7, handling: 8, durability: 4 },
    windSens: 0.42, boostRegen: 1.3, cannonCooldown: 5.5, hullColor: 0x8a6a48, sailColor: 0xf1e3c2, masts: 1, length: 11, stripe: 0x2e8b57, lateen: true, tailwindMul: 1.4,
  },
  {
    id: 'caravel_latina', cat: 'sail', name: '카라벨 라티나', en: 'Caravel Latina', nation: '포르투갈',
    desc: '삼각 돛을 단 탐험선. 디아스가 희망봉을 돌 때 탄 배가 이 형식이다. 역풍을 거슬러 오를 수 있었다.',
    special: '특성: 삼각돛 — 역풍 페널티 절반, 조타 우수',
    stats: { speed: 6, accel: 8, handling: 9, durability: 4 },
    windSens: 0.36, boostRegen: 1.5, cannonCooldown: 5, hullColor: 0x8b5a2b, sailColor: 0xf5efe0, masts: 2, length: 12, stripe: 0xc0392b, lateen: true, headwindMul: 0.5,
  },
  {
    id: 'caravel_redonda', cat: 'sail', name: '카라벨 레돈다', en: 'Caravel Redonda', nation: '포르투갈',
    desc: '사각 돛을 단 카라벨 개량형. 콜럼버스의 니냐호가 항해 중 이 형식으로 개조되었다.',
    special: '특성: 바람 적응 — 전속 항해 게이지가 빠르게 충전됨',
    stats: { speed: 7, accel: 8, handling: 7, durability: 5 },
    windSens: 0.36, boostRegen: 1.7, cannonCooldown: 5, hullColor: 0x8b5a2b, sailColor: 0xf5efe0, masts: 3, length: 12, stripe: 0xc0392b,
  },
  {
    id: 'nao', cat: 'sail', name: '나오', en: 'Nao', nation: '스페인',
    desc: '어디서나 구할 수 있는 대표적 범선. 콜럼버스의 기함 산타마리아호가 나오였다.',
    special: '특성: 만능 — 보급품 효과 1.5배',
    stats: { speed: 6, accel: 6, handling: 6, durability: 6 },
    windSens: 0.32, boostRegen: 1.1, cannonCooldown: 5, hullColor: 0x6e4a26, sailColor: 0xfff5df, masts: 3, length: 13, stripe: 0xd4af37, pickupBonus: 1.5,
  },
  {
    id: 'sloop', cat: 'sail', name: '슬루프', en: 'Sloop', nation: '영국',
    desc: '돛대 하나에 큰 돛을 단 최고의 탐험용 소형선. 얕은 해안과 좁은 수로를 자유자재로 누빈다.',
    special: '특성: 탐험가의 배 — 선회 최강, 순풍 보너스 1.3배',
    stats: { speed: 8, accel: 9, handling: 10, durability: 3 },
    windSens: 0.4, boostRegen: 1.3, cannonCooldown: 5, hullColor: 0x2f4f6f, sailColor: 0xffffff, masts: 1, length: 10, stripe: 0xecf0f1, lateen: true, tailwindMul: 1.3,
  },
  {
    id: 'carrack', cat: 'sail', name: '카락', en: 'Carrack', nation: '포르투갈',
    desc: '원양 항해를 위해 만들어진 중형 범선. 마젤란의 빅토리아호, 다 가마의 상가브리엘호가 카락이었다.',
    special: '특성: 원양 항해 — 폭풍 파도에 밀리는 정도 절반',
    stats: { speed: 7, accel: 5, handling: 5, durability: 8 },
    windSens: 0.3, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x5a3a1a, sailColor: 0xfff8e7, masts: 3, length: 15, stripe: 0x8e44ad, sternH: 1.4, stormResist: 0.5,
  },
  {
    id: 'galleon', cat: 'sail', name: '갤리온', en: 'Galleon', nation: '스페인',
    desc: '보물을 실어 나르던 거함. 전투와 교역 모두 뛰어난 다목적 범선. 무겁지만 부딪히면 상대가 날아간다.',
    special: '특성: 철벽 선체 — 충돌 시 상대를 강하게 밀어내고 자신은 거의 감속하지 않음',
    stats: { speed: 8, accel: 5, handling: 4, durability: 9 },
    windSens: 0.3, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x5e3a1a, sailColor: 0xfff8e7, masts: 3, length: 16, stripe: 0xd4af37, sternH: 1.6,
  },
  {
    id: 'ship', cat: 'sail', name: '쉽', en: 'Ship', nation: '영국',
    desc: '최대의 적재량과 선원을 자랑하는 최강의 대형 범선. 느리게 출발하지만 한번 속도가 붙으면 멈추지 않는다.',
    special: '특성: 거함 — 최고 속도 최상급, 전속 항해가 1.5배 오래 지속',
    stats: { speed: 10, accel: 3, handling: 3, durability: 10 },
    windSens: 0.28, boostRegen: 0.9, boostDrain: 0.65, cannonCooldown: 4.5, hullColor: 0x3b2a18, sailColor: 0xf5f0e6, masts: 3, length: 18, stripe: 0xc9a55a, sternH: 1.8,
  },
  {
    id: 'fluyt', cat: 'sail', name: '플루트', en: 'Fluyt', nation: '네덜란드',
    desc: '적은 선원으로 많은 짐을 나르도록 설계된 네덜란드 무역선. 17세기 해상 무역을 제패했다.',
    special: '특성: 상인의 눈 — 금화·보급품 획득 반경 1.6배',
    stats: { speed: 7, accel: 6, handling: 5, durability: 7 },
    windSens: 0.32, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x6b4423, sailColor: 0xf0e6d2, masts: 3, length: 14, stripe: 0xe67e22, pickupRadius: 1.6,
  },
  {
    id: 'frigate', cat: 'sail', name: '프리깃', en: 'Frigate', nation: '네덜란드',
    desc: '해상 무역을 지배한 전투 함선. 빠른 재장전으로 앞선 배를 저격하라.',
    special: '특성: 속사포 — 포격 재장전 2배 빠름, 2연발 발사',
    stats: { speed: 8, accel: 7, handling: 6, durability: 7 },
    windSens: 0.34, boostRegen: 1.0, cannonCooldown: 2.5, doubleShot: true, hullColor: 0x6b4423, sailColor: 0xf0e6d2, masts: 3, length: 14, stripe: 0xe67e22, sternH: 1.0,
  },
  {
    id: 'clipper', cat: 'sail', name: '클리퍼', en: 'Clipper', nation: '영국',
    desc: '바다 위의 준마. 순풍을 타면 누구도 따라올 수 없다. 단, 선체는 약하다.',
    special: '특성: 질주 — 최고 속도 최강, 순풍 보너스 1.5배, 충돌에 취약',
    stats: { speed: 10, accel: 6, handling: 6, durability: 3 },
    windSens: 0.5, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x2c3e50, sailColor: 0xffffff, masts: 3, length: 15, stripe: 0xecf0f1, tailwindMul: 1.5, jib: true,
  },
  {
    id: 'junk', cat: 'sail', name: '정크선', en: 'Junk', nation: '명나라',
    desc: '정화의 대함대를 이끈 동양의 명선. 대나무살 돛으로 역풍에도 흔들리지 않는 안정성.',
    special: '특성: 역풍 무시 — 맞바람 페널티 절반, 회전이 매우 민첩',
    stats: { speed: 6, accel: 9, handling: 9, durability: 6 },
    windSens: 0.22, boostRegen: 1.2, cannonCooldown: 5, hullColor: 0x7b3f00, sailColor: 0xc0392b, masts: 3, length: 12, stripe: 0xf1c40f, junk: true, headwindMul: 0.5,
  },
  // ---------------- 갤리선 ----------------
  {
    id: 'light_galley', cat: 'galley', name: '경갤리', en: 'Light Galley', nation: '베네치아',
    desc: '가장 기초적인 소형 갤리선. 노꾼들의 힘으로 바람이 죽은 바다에서도 튀어나간다.',
    special: '특성: 노 젓기 — 바람 영향 거의 없음, 가속 최강',
    stats: { speed: 5, accel: 10, handling: 9, durability: 3 },
    windSens: 0.05, boostRegen: 1.4, cannonCooldown: 6, hullColor: 0x8a5a2a, sailColor: 0xf7f0dc, masts: 1, length: 11, stripe: 0x1f77b4, lateen: true, oars: true,
  },
  {
    id: 'galley', cat: 'galley', name: '갤리', en: 'Galley', nation: '오스만',
    desc: '지중해의 표준 갤리선. 레판토 해전에서 양측 수백 척이 노를 저어 맞붙었다.',
    special: '특성: 노 젓기 — 바람 영향 거의 없음, 충돌 시 회전이 적음',
    stats: { speed: 6, accel: 9, handling: 7, durability: 5 },
    windSens: 0.08, boostRegen: 1.2, cannonCooldown: 5, hullColor: 0x6e4a26, sailColor: 0xf3e6c8, masts: 2, length: 13, stripe: 0xc0392b, lateen: true, oars: true, spinResist: 0.5,
  },
  {
    id: 'lareale', cat: 'galley', name: '라레아르', en: 'La Réale', nation: '프랑스',
    desc: '프랑스 왕실의 기함급 고급 갤리선. 기동성과 속도를 모두 갖춘 탐험용 갤리.',
    special: '특성: 왕실 노꾼 — 바람 영향 적음, 게이지 충전 빠름, 선회 우수',
    stats: { speed: 8, accel: 9, handling: 8, durability: 4 },
    windSens: 0.1, boostRegen: 1.5, cannonCooldown: 5, hullColor: 0x2a3d6b, sailColor: 0xfff3d6, masts: 2, length: 14, stripe: 0xd4af37, lateen: true, oars: true,
  },
  {
    id: 'galleass', cat: 'galley', name: '베네치안 갤리어스', en: 'Venetian Galleass', nation: '베네치아',
    desc: '범선과 갤리선의 장점을 합친 강력한 전투함. 레판토에서 포화로 오스만 함대를 무너뜨렸다.',
    special: '특성: 포열 — 2연발 포격, 노로 역풍 무시, 튼튼한 선체',
    stats: { speed: 7, accel: 7, handling: 5, durability: 9 },
    windSens: 0.15, boostRegen: 1.0, cannonCooldown: 3.5, doubleShot: true, hullColor: 0x4a2f16, sailColor: 0xf3e6c8, masts: 3, length: 16, stripe: 0xc0392b, lateen: true, oars: true, sternH: 1.2,
  },
  {
    id: 'xebec', cat: 'galley', name: '자벡', en: 'Xebec', nation: '바르바리',
    desc: '바르바리 해적이 애용한 삼각돛 쾌속선. 돛과 노를 함께 써서 상선을 덮쳤다.',
    special: '특성: 해적 — 포격 명중 시 전속 항해 게이지 +30%, 빠른 재장전',
    stats: { speed: 8, accel: 8, handling: 8, durability: 4 },
    windSens: 0.2, boostRegen: 1.1, cannonCooldown: 3, hullColor: 0x1f1f1f, sailColor: 0xe8dcc0, masts: 3, length: 13, stripe: 0xc0392b, lateen: true, oars: true, plunder: true,
  },
  // ---------------- 특수선: 거북선 · 대한민국 함대 · 현대 초고속정 ----------------
  {
    id: 'turtle', cat: 'special', name: '거북선', en: 'Turtle Ship', nation: '조선', legend: true, aiExclude: true,
    desc: '★ 스페셜 함선. 이순신 장군의 철갑 거북선. 모든 능력치 100 — 속도·가속·조타·내구 어느 하나 빠지지 않는 최강의 함선.',
    special: '특성: 전설의 철갑 — 바람 무시, 충돌 시 무적, 2연발 속사포, 폭풍에도 끄떡없음, 용머리 화염 부스트',
    stats: { speed: 10, accel: 10, handling: 10, durability: 10 },
    windSens: 0.05, boostRegen: 1.6, cannonCooldown: 3, doubleShot: true, stormResist: 0.5, hullColor: 0x4a3520, sailColor: 0xe8dcc0, masts: 1, length: 12, stripe: 0xc9a55a, turtle: true,
  },
  {
    id: 'sejong', cat: 'special', name: '세종대왕함', en: 'ROKS Sejong the Great', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 대한민국 해군의 이지스 구축함. 강철 선체와 위상배열 레이더. 속도 160에 내구 100 — 무엇에 부딪혀도 흔들리지 않는다.',
    special: '특성: 이지스 — 내구 100, 2연발 함포, 폭풍 영향 없음, 충돌 시 상대를 밀어냄',
    stats: { speed: 16, accel: 5, handling: 4, durability: 10 },
    windSens: 0.02, boostRegen: 1.0, cannonCooldown: 2.5, doubleShot: true, stormResist: 0.2, hullColor: 0x8a9199, sailColor: 0x5c6670, masts: 0, length: 20, stripe: 0x2c3e50, modern: 'destroyer',
  },
  {
    id: 'dokdo', cat: 'special', name: '독도함', en: 'ROKS Dokdo', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 헬기가 뜨고 내리는 넓은 비행갑판을 가진 대형 수송함. 속도 120이지만 내구 100의 거함. 부딪히는 쪽이 튕겨 나간다.',
    special: '특성: 거함 — 내구 100, 충돌 시 상대를 강하게 밀어냄, 보급품 효과 2배',
    stats: { speed: 12, accel: 4, handling: 3, durability: 10 },
    windSens: 0.02, boostRegen: 0.9, boostDrain: 0.6, cannonCooldown: 4, stormResist: 0.2, pickupBonus: 2, hullColor: 0x8a9199, sailColor: 0x5c6670, masts: 0, length: 22, stripe: 0x2c3e50, modern: 'carrier',
  },
  {
    id: 'chamsuri', cat: 'special', name: '참수리 고속정', en: 'Chamsuri-class Patrol Boat', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 서해를 지키는 고속 경비정. 속도 200에 민첩한 선회. 작지만 앞선 배를 빠르게 따라잡는다.',
    special: '특성: 고속 경비 — 속도 200, 조타 우수, 포격 재장전 빠름',
    stats: { speed: 20, accel: 9, handling: 9, durability: 5 },
    windSens: 0.03, boostRegen: 1.4, cannonCooldown: 3, hullColor: 0x8a9199, sailColor: 0x5c6670, masts: 0, length: 12, stripe: 0xc0392b, modern: 'patrol',
  },
  {
    id: 'jangbogo', cat: 'special', name: '장보고함', en: 'ROKS Jang Bogo', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 부상 항해 중인 잠수함. 해상왕 장보고의 이름을 받았다. 속도 150, 낮고 매끈해 파도와 바람을 거의 타지 않는다.',
    special: '특성: 잠항 선체 — 속도 150, 바람·파도 영향 없음, 소용돌이 면역',
    stats: { speed: 15, accel: 6, handling: 6, durability: 9 },
    windSens: 0.01, boostRegen: 1.2, cannonCooldown: 4, stormResist: 0.1, whirlImmune: true, hullColor: 0x1f2a36, sailColor: 0x1f2a36, masts: 0, length: 16, stripe: 0x1f2a36, modern: 'sub',
  },
  {
    id: 'wig', cat: 'special', name: '위그선', en: 'WIG Craft', nation: '미래', legend: true, aiExclude: true,
    desc: '★ 세계에서 가장 빠른 배. 날개로 수면 위 공기를 눌러 파도 위를 날아가는 수면비행선(Wing-In-Ground). 속도 300 — 돛도 노도 없이 바다를 가른다.',
    special: '특성: 지면효과 비행 — 속도 300, 파도·바람의 영향을 거의 받지 않음, 항상 수면 위를 낮게 비행',
    stats: { speed: 30, accel: 8, handling: 6, durability: 5 },
    windSens: 0.02, boostRegen: 1.2, cannonCooldown: 4, stormResist: 0.3, hullColor: 0xe8eef5, sailColor: 0x1f3a5c, masts: 0, length: 13, stripe: 0x1f77b4, wig: true, hover: 1.4,
  },
  {
    id: 'hydrofoil', cat: 'special', name: '수중익선', en: 'Hydrofoil', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 수면 아래 날개(수중익)로 선체를 들어 올려 물의 저항을 벗어난 쾌속선. 속도 200. 파도 위를 미끄러지듯 달린다.',
    special: '특성: 수중익 — 속도 200, 파도 흔들림 거의 없음, 폭풍 영향 절반',
    stats: { speed: 20, accel: 8, handling: 7, durability: 5 },
    windSens: 0.03, boostRegen: 1.2, cannonCooldown: 4, stormResist: 0.5, hullColor: 0xf2f4f7, sailColor: 0x1f3a5c, masts: 0, length: 13, stripe: 0xc0392b, modern: 'foil', hover: 1.1,
  },
  {
    id: 'hovercraft', cat: 'special', name: '호버크라프트', en: 'Hovercraft', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 거대한 팬으로 공기 쿠션을 만들어 물 위를 떠서 달리는 배. 속도 180. 선회가 자유롭고 가속이 폭발적이다.',
    special: '특성: 공기 쿠션 — 속도 180, 가속·선회 최상급, 파도 영향 없음',
    stats: { speed: 18, accel: 9, handling: 9, durability: 4 },
    windSens: 0.06, boostRegen: 1.4, cannonCooldown: 5, stormResist: 0.3, hullColor: 0xffb347, sailColor: 0x2c3e50, masts: 0, length: 12, stripe: 0x2c3e50, modern: 'hover', hover: 0.9,
  },
  {
    id: 'jetboat', cat: 'special', name: '제트보트', en: 'Jet Boat', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 워터제트로 물을 뿜어 튀어나가는 초소형 고속정. 속도 220. 가장 민첩하지만 선체는 가볍다.',
    special: '특성: 워터제트 — 속도 220, 가속·조타 100, 충돌에 약함',
    stats: { speed: 22, accel: 10, handling: 10, durability: 3 },
    windSens: 0.04, boostRegen: 1.6, cannonCooldown: 5, hullColor: 0xe53935, sailColor: 0x1a1a1a, masts: 0, length: 10, stripe: 0xffffff, modern: 'jet', hover: 0.2,
  },
  {
    id: 'catamaran', cat: 'special', name: '파워 카타마란', en: 'Power Catamaran', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 두 개의 선체가 파도를 가르는 고속 쌍동선. 속도 240. 넓고 안정적이어서 고속에서도 흔들리지 않는다.',
    special: '특성: 쌍동 선체 — 속도 240, 내구 우수, 폭풍 영향 절반',
    stats: { speed: 24, accel: 7, handling: 6, durability: 6 },
    windSens: 0.04, boostRegen: 1.1, cannonCooldown: 4, stormResist: 0.5, hullColor: 0x1f77b4, sailColor: 0xf2f4f7, masts: 0, length: 14, stripe: 0xf2f4f7, modern: 'cat', hover: 0.4,
  },
];

// 배 묘사 배율: 배 위치와 형태가 잘 보이도록 크게 (물리 반경도 함께 커짐)
export const SHIP_SCALE = 1.3;

// 스탯 -> 물리 파라미터 변환
export function derivePhysics(def) {
  const s = def.stats;
  return {
    maxSpeed: 48 + s.speed * 3.8,        // 최고 속도 (unit/s) - 속도감 강화
    accel: 0.2 + s.accel * 0.06,         // 가속 lerp 계수
    turnRate: 0.9 + s.handling * 0.14,   // rad/s
    mass: 1 + s.durability * 0.3,
    collisionLoss: 0.65 - s.durability * 0.045, // 충돌 시 속도 손실 비율 (0~0.6)
    windSens: def.windSens,
    boostRegen: def.boostRegen,
    boostDrain: def.boostDrain ?? 1,
    cannonCooldown: def.cannonCooldown,
    doubleShot: !!def.doubleShot,
    radius: def.length * 0.5 * SHIP_SCALE,
  };
}

export const AI_NAMES = ['바르톨로뮤', '마젤란', '정화 제독', '드레이크', '이순신', '콜럼버스', '바스코 다 가마', '헨리 왕자', '알부케르크', '카보토', '베스푸치', '하이레딘'];
export function pickAiName(i) { return AI_NAMES[i % AI_NAMES.length]; }

// ---------- 모델 생성 ----------
// 절차적 텍스처 (판자 나무결, 돛 천, 갑판) - 한 번만 만들어 공유
const TEX = {};
function woodTexture(key, base, dark, planks = 8, grain = 0.35, size = 256) {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const ph = size / planks;
  for (let i = 0; i < planks; i++) {
    const y = i * ph;
    // 판자마다 색 차이
    const shade = (Math.random() - 0.5) * 0.18;
    ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 235 : 0},${shade > 0 ? 200 : 0},${Math.abs(shade)})`;
    ctx.fillRect(0, y, size, ph);
    // 나무결
    for (let k = 0; k < 14; k++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * grain * 0.3})`; ctx.lineWidth = 0.6 + Math.random();
      ctx.beginPath(); const yy = y + Math.random() * ph;
      ctx.moveTo(0, yy);
      for (let x = 0; x <= size; x += 16) ctx.lineTo(x, yy + Math.sin(x * 0.05 + k) * 1.5 + (Math.random() - 0.5));
      ctx.stroke();
    }
    // 판자 이음새 + 못
    ctx.fillStyle = dark; ctx.fillRect(0, y, size, 1.5);
    const seam = Math.floor(Math.random() * size);
    ctx.fillRect(seam, y, 1.5, ph);
    ctx.fillStyle = 'rgba(30,20,10,0.8)';
    for (let n = 0; n < 3; n++) { ctx.beginPath(); ctx.arc((seam + 10 + n * size / 3) % size, y + ph * 0.5, 1.4, 0, Math.PI * 2); ctx.fill(); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  TEX[key] = t; return t;
}
function sailTexture(color) {
  const key = 'sail' + color; if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const col = new THREE.Color(color);
  ctx.fillStyle = `rgb(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)})`; ctx.fillRect(0, 0, 256, 256);
  // 직물 짜임
  for (let y = 0; y < 256; y += 3) { ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.03})`; ctx.fillRect(0, y, 256, 1); }
  for (let x = 0; x < 256; x += 3) { ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`; ctx.fillRect(x, 0, 1, 256); }
  // 세로 이음선(돛폭)과 보강 띠
  for (let x = 0; x < 256; x += 32) { ctx.fillStyle = 'rgba(80,60,30,0.28)'; ctx.fillRect(x, 0, 2, 256); }
  for (let y = 60; y < 256; y += 70) { ctx.fillStyle = 'rgba(80,60,30,0.18)'; ctx.fillRect(0, y, 256, 4); }
  // 얼룩/해짐
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(90,70,40,${0.03 + Math.random() * 0.05})`; ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 18, 0, Math.PI * 2); ctx.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  TEX[key] = t; return t;
}
const MAT = {};
function mat(key, make) { return MAT[key] || (MAT[key] = make()); }
const ropeMat = () => mat('rope', () => new THREE.LineBasicMaterial({ color: 0x3a2a16, transparent: true, opacity: 0.9 }));
const ironMat = () => mat('iron', () => new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.35 }));
const brassMat = () => mat('brass', () => new THREE.MeshStandardMaterial({ color: 0xc9a55a, metalness: 0.9, roughness: 0.3 }));
const darkWoodMat = () => mat('dark', () => new THREE.MeshStandardMaterial({ map: woodTexture('dark', '#4a3418', '#241708', 6, 0.5), roughness: 0.9 }));
const deckMat = () => mat('deck', () => { const m = new THREE.MeshStandardMaterial({ map: woodTexture('deck', '#b8874a', '#6b4a22', 12, 0.4), roughness: 0.85 }); m.map.repeat.set(3, 1); return m; });
const barrelMat = () => mat('barrel', () => new THREE.MeshStandardMaterial({ map: woodTexture('barrel', '#8a5a2a', '#3a2410', 10, 0.5), roughness: 0.9 }));

function hullGeometry(length, width, height) {
  const L = length / 2, W = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(L, 0);
  shape.bezierCurveTo(L * 0.7, W * 0.9, -L * 0.3, W, -L * 0.85, W * 0.85);
  shape.quadraticCurveTo(-L, W * 0.5, -L, 0);
  shape.quadraticCurveTo(-L, -W * 0.5, -L * 0.85, -W * 0.85);
  shape.bezierCurveTo(-L * 0.3, -W, L * 0.7, -W * 0.9, L, 0);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height, bevelEnabled: true, bevelThickness: height * 0.6, bevelSize: width * 0.28, bevelSegments: 4, steps: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -height * 0.4, 0);
  geo.computeVertexNormals();
  // 판자 텍스처가 선체 길이를 따라 감기도록 UV 재계산 (x: 길이, y: 높이)
  const pos = geo.attributes.position; const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) / length) * 4; uv[i * 2 + 1] = (pos.getY(i) / height) * 1.2 + pos.getZ(i) * 0.02; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function makeSail(w, h, color, opts = {}) {
  const geo = new THREE.PlaneGeometry(w, h, 12, 12);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = (x / w + 0.5), v = (y / h + 0.5);
    let bulge = Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * w * 0.28;
    if (opts.junk) { pos.setX(i, x * (0.6 + v * 0.5)); bulge *= 0.4; }
    pos.setZ(i, -bulge);
  }
  geo.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ map: sailTexture(color), side: THREE.DoubleSide, roughness: 0.95, metalness: 0 });
  const mesh = new THREE.Mesh(geo, m);
  if (opts.junk) {
    const batten = new THREE.Group();
    for (let i = 1; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, w * (0.6 + (i / 6) * 0.5), 5), darkWoodMat());
      b.rotation.z = Math.PI / 2; b.position.y = -h / 2 + (h * i) / 6; b.position.z = 0.06;
      batten.add(b);
    }
    mesh.add(batten);
  } else {
    // 돛 아래 모서리 밧줄(시트) 느낌의 가장자리 보강 띠
    const edge = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.08), darkWoodMat());
    edge.position.y = -h / 2; mesh.add(edge);
  }
  return mesh;
}

// 삼각돛 (라틴 세일)
function makeLateenSail(w, h, color) {
  const geo = new THREE.PlaneGeometry(w, h, 12, 12);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = x / w + 0.5, v = y / h + 0.5;
    pos.setX(i, -w * 0.5 + (x + w * 0.5) * (1 - v));
    pos.setZ(i, -Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * w * 0.22);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: sailTexture(color), side: THREE.DoubleSide, roughness: 0.95 }));
}

// 밧줄: 점 목록을 잇는 선
function rope(points) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.Line(geo, ropeMat());
}
// 그물 사다리(래트라인): 돛대에서 좌우 뱃전으로 내려가는 밧줄 다발
function shrouds(mx, top, W, L, side) {
  const pts = [];
  for (let i = -1; i <= 1; i++) pts.push([mx + i * L * 0.04, 0.6, side * W * 0.46], [mx, top, side * 0.2]);
  const g = new THREE.Group();
  const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
  g.add(new THREE.LineSegments(geo, ropeMat()));
  // 가로 밧줄
  const hpts = [];
  for (let k = 1; k <= 5; k++) { const t = k / 6; hpts.push([mx - L * 0.04 * (1 - t), 0.6 + (top - 0.6) * t, side * (W * 0.46 * (1 - t) + 0.2 * t)], [mx + L * 0.04 * (1 - t), 0.6 + (top - 0.6) * t, side * (W * 0.46 * (1 - t) + 0.2 * t)]); }
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(hpts.map((p) => new THREE.Vector3(...p))), ropeMat()));
  return g;
}

// 현대 선박 상부 구조 (수중익선/호버크라프트/제트보트/카타마란/구축함/수송함/고속정/잠수함)
function buildModern(def, g, L, W, H) {
  const grey = new THREE.MeshStandardMaterial({ color: 0x9aa3ab, roughness: 0.5, metalness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a4149, roughness: 0.5, metalness: 0.5 });
  const paint = new THREE.MeshStandardMaterial({ color: def.hullColor, roughness: 0.45, metalness: 0.35 });
  const accent = new THREE.MeshStandardMaterial({ color: def.stripe, roughness: 0.5, metalness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.85 });
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
  const cyl = (r1, r2, h, m, x, y, z, rz = 0) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 12), m); c.position.set(x, y, z); c.rotation.z = rz; g.add(c); return c; };
  box(L * 0.9, 0.15, W * 0.9, dark, 0, 0.12, 0); // 매끈한 갑판
  switch (def.modern) {
    case 'foil': // 수중익선: 선체 아래 지주 + 날개, 위에 유선형 객실
      for (const x of [L * 0.3, -L * 0.3]) { for (const sd of [-1, 1]) cyl(0.12, 0.12, 2.6, dark, x, -1.2, sd * W * 0.4); box(0.3, 0.12, W * 1.4, dark, x, -2.4, 0); }
      box(L * 0.55, 1.4, W * 0.8, paint, 0, 0.9, 0); box(L * 0.3, 0.9, W * 0.7, glass, L * 0.15, 2.0, 0); box(L * 0.55, 0.08, W * 0.85, accent, 0, 1.65, 0);
      break;
    case 'hover': { // 호버크라프트: 둥근 스커트 + 뒤쪽 큰 팬
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.75, W * 0.85, 1.2, 20), dark); skirt.scale.x = L * 0.55 / (W * 0.75); skirt.position.y = -0.3; g.add(skirt);
      box(L * 0.45, 1.2, W * 0.9, paint, L * 0.05, 0.85, 0); box(L * 0.2, 0.8, W * 0.7, glass, L * 0.22, 1.85, 0);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(W * 0.5, 0.15, 8, 20), dark); ring.rotation.y = Math.PI / 2; ring.position.set(-L * 0.36, W * 0.5 + 0.6, 0); g.add(ring);
      for (let i = 0; i < 3; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.1, W * 0.9, 0.5), grey); bl.position.set(-L * 0.36, W * 0.5 + 0.6, 0); bl.rotation.x = (i / 3) * Math.PI; g.add(bl); }
      break; }
    case 'jet': // 제트보트: 낮은 윈드실드 + 좌석 + 제트 노즐
      box(L * 0.25, 0.5, W * 0.6, glass, L * 0.15, 0.55, 0); box(L * 0.3, 0.35, W * 0.5, dark, -L * 0.1, 0.4, 0);
      cyl(0.35, 0.45, 1.2, dark, -L * 0.5, 0.1, 0, Math.PI / 2); box(L * 0.8, 0.06, 0.5, accent, 0, 0.22, 0);
      break;
    case 'cat': // 파워 카타마란: 두 선체 + 다리 갑판 + 조타실
      for (const sd of [-1, 1]) box(L * 0.95, 1.2, W * 0.35, paint, 0, -0.2, sd * W * 0.55);
      box(L * 0.7, 0.3, W * 1.3, dark, 0, 0.5, 0); box(L * 0.35, 1.2, W * 0.9, accent, L * 0.05, 1.2, 0); box(L * 0.25, 0.7, W * 0.8, glass, L * 0.15, 2.1, 0);
      break;
    case 'destroyer': // 이지스 구축함: 상부 구조물 + 레이더면 + 마스트 + 함포 + 헬기갑판
      box(L * 0.45, 2.2, W * 0.8, grey, -L * 0.02, 1.25, 0); box(L * 0.2, 1.4, W * 0.7, grey, L * 0.08, 3.0, 0);
      for (const sd of [-1, 1]) box(0.1, 1.0, 1.0, dark, L * 0.19, 3.0, sd * W * 0.36);
      cyl(0.1, 0.16, 4.5, dark, -L * 0.08, 5.5, 0); cyl(0.9, 1.1, 0.9, grey, L * 0.32, 0.65, 0); cyl(0.08, 0.08, 2.4, dark, L * 0.42, 0.9, 0, Math.PI / 2);
      box(L * 0.2, 0.1, W * 0.7, dark, -L * 0.36, 0.25, 0); cyl(0.5, 0.5, 0.5, accent, L * 0.08, 3.95, 0);
      break;
    case 'carrier': // 대형 수송함: 넓은 비행갑판 + 우측 함교
      box(L * 0.95, 0.25, W * 1.15, grey, 0, 0.9, 0); box(L * 0.2, 2.6, W * 0.25, grey, -L * 0.05, 2.3, W * 0.42); cyl(0.08, 0.12, 3.5, dark, -L * 0.05, 5.0, W * 0.42);
      for (let i = 0; i < 3; i++) { const h = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.75, 16), accent); h.rotation.x = -Math.PI / 2; h.position.set(-L * 0.3 + i * L * 0.3, 1.04, -W * 0.15); g.add(h); }
      break;
    case 'patrol': // 고속정: 함교 + 앞 기관포 + 마스트
      box(L * 0.3, 1.3, W * 0.75, grey, -L * 0.05, 0.85, 0); box(L * 0.18, 0.7, W * 0.65, glass, L * 0.02, 1.85, 0);
      cyl(0.35, 0.4, 0.6, dark, L * 0.3, 0.5, 0); cyl(0.05, 0.05, 1.6, dark, L * 0.38, 0.7, 0, Math.PI / 2); cyl(0.06, 0.08, 2.6, dark, -L * 0.12, 2.9, 0); box(L * 0.9, 0.06, 0.4, accent, 0, 0.2, 0);
      break;
    case 'sub': { // 잠수함: 원통 선체 + 세일(함교탑) + 잠망경 + 꼬리 조종면
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.42, W * 0.42, L * 0.8, 16), paint); hull.rotation.z = Math.PI / 2; hull.position.y = -0.1; g.add(hull);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(W * 0.42, 16, 10), paint); nose.position.set(L * 0.4, -0.1, 0); g.add(nose);
      const tailc = new THREE.Mesh(new THREE.ConeGeometry(W * 0.42, L * 0.2, 16), paint); tailc.rotation.z = Math.PI / 2; tailc.position.set(-L * 0.5, -0.1, 0); g.add(tailc);
      box(L * 0.16, 2.6, W * 0.35, paint, L * 0.05, 1.2, 0); cyl(0.05, 0.05, 1.6, dark, L * 0.08, 3.2, 0); for (const sd of [-1, 1]) box(1.2, 0.12, 0.6, paint, L * 0.05, 1.6, sd * W * 0.45);
      for (const sd of [-1, 1]) box(1.0, 0.12, W * 0.5, paint, -L * 0.45, -0.1, sd * W * 0.35); box(1.0, W * 0.9, 0.12, paint, -L * 0.45, -0.1, 0);
      break; }
  }
}

export function buildShipMesh(def, opts = {}) {
  const g = new THREE.Group();
  const L = def.length, W = L * (def.oars ? 0.26 : 0.32), H = L * (def.oars ? 0.11 : 0.16);
  const isModern = !!(def.modern || def.wig);
  const hullMat = isModern ? new THREE.MeshStandardMaterial({ color: def.hullColor, roughness: 0.45, metalness: 0.35 }) : new THREE.MeshStandardMaterial({ map: woodTexture('hull' + def.hullColor, '#' + new THREE.Color(def.hullColor).getHexString(), '#1d1208', 7, 0.5), roughness: 0.85, metalness: 0.05 });
  const woodMat = deckMat();
  const darkWood = darkWoodMat();
  const stripeMat = new THREE.MeshStandardMaterial({ color: def.stripe, roughness: 0.6, metalness: 0.1 });

  // 선체 + 흘수선 띠 + 방현재(가로 나무 띠)
  const hull = new THREE.Mesh(hullGeometry(L, W, H), hullMat);
  g.add(hull);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(L * 0.86, H * 0.18, W * 1.02), stripeMat);
  stripe.position.y = -H * 0.12; g.add(stripe);
  if (!isModern) { const wale = new THREE.Mesh(new THREE.BoxGeometry(L * 0.8, 0.18, W * 1.06), darkWood); wale.position.y = 0.05; g.add(wale); }
  if (!isModern) {
  // 갑판 (판자 텍스처)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(L * 0.9, 0.2, W * 0.86), woodMat);
  deck.position.y = 0.1; g.add(deck);
  // 난간 + 난간 기둥
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(L * 0.85, 0.12, 0.14), darkWood);
    rail.position.set(-L * 0.02, 0.75, side * W * 0.44); g.add(rail);
    const nPosts = Math.max(5, Math.round(L / 2));
    for (let i = 0; i < nPosts; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), darkWood);
      post.position.set(-L * 0.44 + (i / (nPosts - 1)) * L * 0.84, 0.45, side * W * 0.44); g.add(post);
    }
    // 포문 (갤리선·소형선 제외)
    if (!def.oars && L >= 12) {
      const ports = Math.round(L / 4);
      for (let i = 0; i < ports; i++) {
        const port = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.2), ironMat());
        port.position.set(-L * 0.3 + (i / Math.max(1, ports - 1)) * L * 0.55, -0.15, side * W * 0.5);
        g.add(port);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.9, 6), ironMat());
        barrel.rotation.x = Math.PI / 2; barrel.position.set(port.position.x, -0.15, side * (W * 0.5 + 0.35)); g.add(barrel);
      }
    }
  }
  }
  // 갑판 소품: 해치, 통, 캡스턴, 키(타륜/키손잡이)
  if (!isModern) {
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(L * 0.14, 0.25, W * 0.35), darkWood);
  hatch.position.set(L * 0.05, 0.3, 0); g.add(hatch);
  const bGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.9, 10);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(bGeo, barrelMat()); b.position.set(-L * 0.12 + i * 0.95, 0.65, W * 0.28 * (i % 2 ? -1 : 1)); g.add(b); }
  const capstan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.8, 8), darkWood);
  capstan.position.set(L * 0.28, 0.6, 0); g.add(capstan);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 12), darkWood);
  wheel.position.set(-L * 0.3, 1.0, 0); wheel.rotation.y = Math.PI / 2; g.add(wheel);
  for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.06), darkWood); sp.position.copy(wheel.position); sp.rotation.x = (i / 4) * Math.PI; g.add(sp); }
  }

  // 선미루 + 선미 창문
  const sternH = def.sternH ?? (def.oars ? 0.5 : 0.7);
  if (!isModern) {
  const stern = new THREE.Mesh(new THREE.BoxGeometry(L * 0.22, sternH, W * 0.8), hullMat);
  stern.position.set(-L * 0.36, sternH / 2 + 0.1, 0); g.add(stern);
  const sternTop = new THREE.Mesh(new THREE.BoxGeometry(L * 0.24, 0.15, W * 0.86), woodMat);
  sternTop.position.set(-L * 0.36, sternH + 0.18, 0); g.add(sternTop);
  }
  if (sternH >= 1.0 && !isModern) {
    const winMat = mat('win', () => new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffb347, emissiveIntensity: 0.6 }));
    for (let i = -1; i <= 1; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.5), winMat); w.position.set(-L * 0.475, sternH * 0.55, i * W * 0.22); g.add(w); }
    const gilt = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, W * 0.8), brassMat()); gilt.position.set(-L * 0.478, sternH * 0.9, 0); g.add(gilt);
  }

  // 바우스프릿 / 갤리선 충각 + 뱃머리 장식
  if (!def.turtle && !isModern) {
    const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, L * 0.32, 6), darkWood);
    bow.rotation.z = def.oars ? -Math.PI / 2 + 0.05 : -Math.PI / 2 + 0.35;
    bow.position.set(L * 0.58, def.oars ? 0.1 : 0.6, 0);
    g.add(bow);
    if (def.oars) { const ram = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.6, 6), brassMat()); ram.rotation.z = -Math.PI / 2; ram.position.set(L * 0.72, -0.1, 0); g.add(ram); }
    else { const figure = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), brassMat()); figure.position.set(L * 0.52, 0.5, 0); g.add(figure); }
  }
  // 노 (갤리선/거북선): 손잡이 + 넓적한 날
  if (def.oars || def.turtle) {
    const n = def.turtle ? 6 : Math.max(5, Math.round(L * 0.7));
    const span = L * 0.62;
    const bladeGeo = new THREE.BoxGeometry(0.1, 0.5, 1.1);
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
      const oar = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 5), darkWood);
      shaft.rotation.x = Math.PI / 2; oar.add(shaft);
      const blade = new THREE.Mesh(bladeGeo, woodMat); blade.position.z = 1.9; oar.add(blade);
      oar.position.set(-L * 0.33 + (i / Math.max(1, n - 1)) * span, -0.05, s * (W * 0.5 + 1.2));
      oar.rotation.x = s * 0.45; oar.rotation.y = s > 0 ? 0 : Math.PI;
      g.add(oar);
    }
  }

  const sails = [];
  const mastH = L * (def.oars ? 0.7 : 0.75);
  const mastMat = darkWood;
  const mastTops = [];
  if (def.modern) {
    buildModern(def, g, L, W, H);
    mastTops.push([-L * 0.3, L * 0.3]);
  } else if (def.wig) {
    // 수면비행선: 매끈한 흰 동체 + 짧고 넓은 날개 + T자 꼬리날개 + 엔진 포드
    const white = new THREE.MeshStandardMaterial({ color: 0xe8eef5, roughness: 0.35, metalness: 0.3 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x1f77b4, roughness: 0.4, metalness: 0.3 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.85 });
    const wingGeo = new THREE.BoxGeometry(L * 0.5, 0.25, W * 2.6);
    const wing = new THREE.Mesh(wingGeo, white); wing.position.set(-L * 0.05, 0.9, 0); g.add(wing);
    for (const sd of [-1, 1]) { const tip = new THREE.Mesh(new THREE.BoxGeometry(L * 0.3, 1.6, 0.25), blue); tip.position.set(-L * 0.08, 1.6, sd * W * 1.3); g.add(tip); }
    const stripeW = new THREE.Mesh(new THREE.BoxGeometry(L * 0.5, 0.05, 0.6), blue); stripeW.position.set(-L * 0.05, 1.05, 0); g.add(stripeW);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(L * 0.18, L * 0.34, 0.3), blue); fin.position.set(-L * 0.4, L * 0.17 + 0.8, 0); g.add(fin);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(L * 0.16, 0.2, W * 1.6), white); tail.position.set(-L * 0.42, L * 0.34 + 0.8, 0); g.add(tail);
    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(W * 0.36, 12, 8), glass); cockpit.scale.set(1.8, 0.7, 1); cockpit.position.set(L * 0.2, 1.4, 0); g.add(cockpit);
    for (const sd of [-1, 1]) {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 3.2, 10), ironMat()); pod.rotation.z = Math.PI / 2; pod.position.set(L * 0.28, 2.2, sd * W * 0.55); g.add(pod);
      const prop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.3), ironMat()); prop.position.set(L * 0.28 + 1.7, 2.2, sd * W * 0.55); g.add(prop);
    }
    mastTops.push([-L * 0.4, L * 0.34 + 0.9]);
  } else if (def.turtle) {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(W * 0.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: woodTexture('turtle', '#3b3b3b', '#151515', 10, 0.3), roughness: 0.6, metalness: 0.4 }));
    dome.scale.set(L * 0.7 / (W * 0.6), 1, 1);
    dome.position.y = 0.2;
    g.add(dome);
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.8, roughness: 0.3 });
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const r = 0.55 + Math.random() * 0.35;
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 5), spikeMat);
      s.position.set(Math.cos(a) * L * 0.7 * r, 0.2 + Math.sqrt(Math.max(0, 1 - r * r)) * W * 0.6, Math.sin(a) * W * 0.6 * r);
      s.lookAt(s.position.clone().multiplyScalar(2).setY(s.position.y * 2 + 1));
      s.rotateX(Math.PI / 2);
      g.add(s);
    }
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 1.1), new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 }));
    head.position.set(L * 0.55, 1.1, 0); g.add(head);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.9), new THREE.MeshStandardMaterial({ color: 0xc0392b }));
    jaw.position.set(L * 0.62, 0.55, 0); g.add(jaw);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xffa000, emissiveIntensity: 0.8 });
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), eyeMat); e.position.set(L * 0.6, 1.4, s * 0.4); g.add(e); }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, mastH * 0.7, 8), mastMat);
    mast.position.set(-L * 0.05, mastH * 0.35, 0); g.add(mast);
    const sail = makeSail(L * 0.42, mastH * 0.4, def.sailColor);
    sail.position.set(-L * 0.05 - 0.2, mastH * 0.45, 0); sail.rotation.y = Math.PI / 2;
    g.add(sail); sails.push(sail);
    mastTops.push([-L * 0.05, mastH * 0.7]);
  } else {
    const mastCount = def.masts;
    const positions = mastCount === 3 ? [L * 0.25, -L * 0.02, -L * 0.27] : mastCount === 2 ? [L * 0.2, -L * 0.18] : [0];
    positions.forEach((mx, i) => {
      const h = mastH * (i === 1 ? 1.0 : mastCount === 1 ? 1.0 : 0.85);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, h, 8), mastMat);
      mast.position.set(mx, h / 2, 0); g.add(mast);
      // 돛대 밑동 쇠고리
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 12), ironMat()); ring.rotation.x = Math.PI / 2; ring.position.set(mx, 0.35, 0); g.add(ring);
      mastTops.push([mx, h]);
      if (def.junk) {
        const sail = makeSail(L * 0.42, h * 0.72, def.sailColor, { junk: true });
        sail.position.set(mx - 0.25, h * 0.52, 0); sail.rotation.y = Math.PI / 2;
        g.add(sail); sails.push(sail);
      } else if (def.lateen) {
        const yardLen = h * 1.15;
        const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, yardLen, 6), mastMat);
        yard.position.set(mx + h * 0.05, h * 0.6, 0); yard.rotation.z = Math.PI / 2 - 0.95; g.add(yard);
        const sail = makeLateenSail(W * 2.2, h * 0.8, def.sailColor);
        sail.position.set(mx - W * 0.2, h * 0.5, 0); sail.rotation.y = Math.PI / 2;
        g.add(sail); sails.push(sail);
        // 활대 밧줄
        g.add(rope([[mx + h * 0.05 + Math.cos(0.95) * yardLen * 0.5, h * 0.6 + Math.sin(0.95) * yardLen * 0.5, 0], [L * 0.45, 0.8, 0]]));
      } else {
        const yard1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, W * 1.9, 6), mastMat);
        yard1.rotation.x = Math.PI / 2; yard1.position.set(mx, h * 0.78, 0); g.add(yard1);
        const s1 = makeSail(W * 1.8, h * 0.36, def.sailColor);
        s1.position.set(mx - 0.2, h * 0.58, 0); s1.rotation.y = Math.PI / 2; g.add(s1); sails.push(s1);
        const yard2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, W * 1.5, 6), mastMat);
        yard2.rotation.x = Math.PI / 2; yard2.position.set(mx, h * 0.38, 0); g.add(yard2);
        const s2 = makeSail(W * 1.4, h * 0.3, def.sailColor);
        s2.position.set(mx - 0.2, h * 0.22, 0); s2.rotation.y = Math.PI / 2; g.add(s2); sails.push(s2);
        // 활대 양끝에서 갑판으로 내려오는 밧줄(브레이스/시트)
        for (const sd of [-1, 1]) {
          g.add(rope([[mx, h * 0.78, sd * W * 0.95], [mx - L * 0.12, 0.7, sd * W * 0.44]]));
          g.add(rope([[mx, h * 0.38, sd * W * 0.75], [mx - L * 0.1, 0.7, sd * W * 0.44]]));
        }
        if ((def.id === 'galleon' || def.id === 'carrack' || def.id === 'nao') && i === 1) {
          const crossMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, side: THREE.DoubleSide });
          const c1 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, h * 0.28), crossMat);
          const c2 = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.1, 0.35), crossMat);
          c1.position.set(mx - 0.2 - 0.9, h * 0.58, 0); c1.rotation.y = Math.PI / 2;
          c2.position.copy(c1.position); c2.rotation.y = Math.PI / 2;
          g.add(c1, c2);
        }
      }
      // 망대 + 돛대 꼭대기 장식
      if (i === (mastCount === 3 ? 1 : 0) && !def.lateen) {
        const crow = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.5, 8), darkWood);
        crow.position.set(mx, h * 0.92, 0); g.add(crow);
      }
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), brassMat()); knob.position.set(mx, h + 0.1, 0); g.add(knob);
      // 좌우 슈라우드(그물 사다리)
      for (const sd of [-1, 1]) g.add(shrouds(mx, h * 0.8, W, L, sd));
    });
    // 스테이(돛대 사이/뱃머리로 가는 밧줄)
    for (let i = 0; i < mastTops.length; i++) {
      const [mx, h] = mastTops[i];
      const next = mastTops[i + 1];
      if (next) g.add(rope([[mx, h, 0], [next[0], next[1] * 0.9, 0]]));
    }
    const [fx, fh] = mastTops[0];
    g.add(rope([[fx, fh, 0], [L * 0.62, 0.9, 0]]));
    g.add(rope([[mastTops[mastTops.length - 1][0], mastTops[mastTops.length - 1][1], 0], [-L * 0.47, sternH + 0.3, 0]]));
    if (def.jib || def.id === 'caravel_redonda') {
      const jibGeo = new THREE.BufferGeometry();
      jibGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([L * 0.62, 0.8, 0, L * 0.25, mastH * 0.75, 0, L * 0.25, 1.0, 0]), 3));
      jibGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 1, 1, 0]), 2));
      jibGeo.computeVertexNormals();
      g.add(new THREE.Mesh(jibGeo, new THREE.MeshStandardMaterial({ map: sailTexture(def.sailColor), side: THREE.DoubleSide })));
    }
  }

  // 깃발
  const flagMat = new THREE.MeshStandardMaterial({ color: opts.flagColor ?? def.stripe, side: THREE.DoubleSide });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9, 6, 1), flagMat);
  const topMast = def.modern ? mastTops[0][1] : def.wig ? L * 0.34 + 0.9 : def.turtle ? mastH * 0.7 : mastH;
  const topX = def.modern ? mastTops[0][0] : def.wig ? -L * 0.4 : def.turtle ? -L * 0.05 : (def.masts === 3 ? -L * 0.02 : def.masts === 2 ? L * 0.2 : 0);
  flag.position.set(topX - 0.8, topMast + 0.5, 0);
  flag.geometry.translate(-0.8, 0, 0);
  flag.position.x += 0.8;
  g.add(flag);

  // 선미 랜턴 (놋쇠 등)
  const lantern = new THREE.PointLight(0xffb85c, 0, 30);
  lantern.position.set(-L * 0.4, sternH + 1, 0);
  g.add(lantern);
  const lanternMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffa000, emissiveIntensity: 1.2 }));
  lanternMesh.position.copy(lantern.position); g.add(lanternMesh);
  const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 6, 1, true), brassMat()); cage.material = brassMat(); cage.position.copy(lantern.position); g.add(cage);
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5), darkWood); lanternPost.position.set(-L * 0.4, sternH + 0.5, 0); g.add(lanternPost);

  // 부스트 화염
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.5, 8), new THREE.MeshBasicMaterial({ color: 0xffa726, transparent: true, opacity: 0.85 }));
  if (isModern) { fire.position.set(-L * 0.6, 1.0, 0); fire.rotation.z = Math.PI / 2; }
  else if (def.turtle) { fire.position.set(L * 0.7 + 1.5, 1.0, 0); fire.rotation.z = -Math.PI / 2; }
  else { fire.position.set(-L * 0.55, -0.1, 0); fire.rotation.z = Math.PI / 2; }
  fire.visible = false;
  g.add(fire);

  const outer = new THREE.Group();
  g.rotation.y = -Math.PI / 2;
  g.scale.setScalar(SHIP_SCALE);
  outer.add(g);
  outer.userData = { sails, flag, lantern, fire, hull, length: L, inner: g };
  return outer;
}

// ---------- 카드 미리보기: WebGL 컨텍스트 하나를 공유해 여러 캔버스에 그린다 ----------
const PREVIEW_W = 440, PREVIEW_H = 184;
let previewShared = null;
function getPreviewShared() {
  if (previewShared) return previewShared;
  const canvas = document.createElement('canvas'); canvas.width = PREVIEW_W; canvas.height = PREVIEW_H;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(PREVIEW_W, PREVIEW_H, false);
  previewShared = { renderer, canvas, entries: [], raf: 0, cursor: 0 };
  const tick = () => {
    previewShared.raf = requestAnimationFrame(tick);
    const E = previewShared.entries;
    if (!E.length) return;
    // 프레임당 몇 장만 갱신 (20장이면 각 카드가 초당 ~15회 갱신)
    const per = Math.min(E.length, 5);
    for (let k = 0; k < per; k++) {
      const e = E[previewShared.cursor % E.length]; previewShared.cursor++;
      if (!e.target.isConnected) continue;
      e.t += 0.012 * (E.length / per);
      e.ship.rotation.y = e.t; e.ship.position.y = Math.sin(e.t * 3) * 0.2; e.ship.rotation.z = Math.sin(e.t * 2) * 0.05;
      renderer.render(e.scene, e.cam);
      e.ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
      e.ctx.drawImage(canvas, 0, 0);
    }
  };
  tick();
  return previewShared;
}

export function renderShipPreview(canvas, def) {
  const shared = getPreviewShared();
  canvas.width = PREVIEW_W; canvas.height = PREVIEW_H;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, PREVIEW_W / PREVIEW_H, 0.1, 200);
  cam.position.set(def.length * 1.4 * SHIP_SCALE, def.length * 0.8 * SHIP_SCALE, def.length * 1.5 * SHIP_SCALE);
  cam.lookAt(0, def.length * 0.25 * SHIP_SCALE, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x335577, 1.2));
  const sun = new THREE.DirectionalLight(0xfff2d0, 2.0); sun.position.set(5, 10, 6); scene.add(sun);
  const ship = buildShipMesh(def);
  scene.add(ship);
  const entry = { scene, cam, ship, ctx: canvas.getContext('2d'), target: canvas, t: Math.random() * 6 };
  shared.entries.push(entry);
  return () => { const i = shared.entries.indexOf(entry); if (i >= 0) shared.entries.splice(i, 1); };
}
