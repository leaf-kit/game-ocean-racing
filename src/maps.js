// 맵 정의: 항로 모양, 섬 스타일, 물빛, 폭풍 빈도, 소용돌이 등장 시점
// points: 항로 제어점 [x, z] (스케일 적용 전). style: tropical 열대섬 / atoll 환초 / rocky 절벽섬 / ice 빙산 / coast 해안 절벽
export const MAPS = [
  {
    id: 'caribbean', name: '카리브 군도', en: 'Caribbean Isles',
    desc: '열대 섬과 산호초가 흩어진 따뜻한 바다. 기본 항로.', descEn: 'Warm waters dotted with tropical islands and reefs. The classic route.',
    scale: 0.82, style: 'tropical', storm: 1.0, whirl: [0.75, 2, 2], kraken: 0.9,
    points: [[0, 0], [360, 0], [640, 90], [740, 350], [580, 570], [310, 480], [130, 650], [-170, 720], [-470, 580], [-640, 300], [-560, 40], [-360, -120], [-200, -60], [-100, -10]],
  },
  {
    id: 'pacific', name: '태평양', en: 'Pacific Ocean',
    desc: '끝없이 넓은 대양. 긴 직선 구간과 큰 너울, 잦은 폭풍.', descEn: 'The endless ocean. Long straights, great swells and frequent storms.',
    scale: 0.9, style: 'atoll', storm: 1.7, whirl: [0.6, 2, 2], kraken: 0.85, tint: { deep: 0x0538a8, shallow: 0x1cb4ea },
    points: [[0, 0], [500, -40], [900, 60], [1050, 320], [900, 620], [500, 720], [80, 700], [-380, 640], [-720, 420], [-760, 120], [-560, -120], [-260, -110]],
  },
  {
    id: 'mediterranean', name: '지중해', en: 'Mediterranean',
    desc: '섬 사이를 누비는 굽이진 항로. 잔잔한 바다, 절벽과 올리브빛 언덕.', descEn: 'A winding course threading between islands. Calm seas, cliffs and olive hills.',
    scale: 0.78, style: 'rocky', storm: 0.5, whirl: [0.5, 0.8, 2], kraken: 0.9, tint: { deep: 0x0a4a90, shallow: 0x2fb8cc },
    points: [[0, 0], [300, -60], [520, 120], [420, 320], [640, 470], [520, 680], [220, 600], [40, 760], [-260, 700], [-380, 460], [-620, 380], [-640, 120], [-420, -60], [-180, 40]],
  },
  {
    id: 'arctic', name: '북극해', en: 'Arctic Ocean',
    desc: '빙산 사이의 차가운 바다. 밤이면 오로라가 하늘을 덮는다.', descEn: 'Cold water between icebergs. At night the aurora fills the sky.',
    scale: 0.82, style: 'ice', storm: 1.2, whirl: [2, 2, 2], kraken: 2, aurora: true, tint: { deep: 0x0a3462, shallow: 0x6fd0ee }, fog: 0.8,
    points: [[0, 0], [380, 40], [560, 260], [760, 380], [640, 620], [300, 560], [40, 700], [-300, 640], [-560, 440], [-700, 180], [-520, -60], [-240, -80]],
  },
  {
    id: 'antarctic', name: '남극해', en: 'Southern Ocean',
    desc: '빙붕과 거대한 빙산, 세계에서 가장 거친 파도가 이는 바다.', descEn: 'Ice shelves, giant bergs and the roughest waves on Earth.',
    scale: 0.86, style: 'ice', storm: 2.2, whirl: [0.7, 2, 2], kraken: 0.8, aurora: true, tint: { deep: 0x0a2a4e, shallow: 0x58bfe0 }, fog: 0.75, bigIce: true,
    points: [[0, 0], [420, -30], [760, 120], [820, 420], [600, 640], [260, 560], [-60, 720], [-420, 660], [-700, 420], [-660, 100], [-380, -100], [-160, -40]],
  },
  {
    id: 'strait', name: '한일해협', en: 'Korea Strait',
    desc: '명량의 물살처럼 소용돌이가 도는 좁은 해협. 절벽 해안 사이를 달린다.', descEn: 'A narrow strait of racing tides and whirlpools, like Myeongnyang. Cliffs on both sides.',
    scale: 0.8, style: 'coast', storm: 0.9, whirl: [0.15, 0.4, 0.65], kraken: 0.9, tint: { deep: 0x0b3556, shallow: 0x2d95bd },
    points: [[0, 0], [340, 20], [520, 200], [700, 260], [820, 480], [600, 620], [320, 520], [60, 640], [-240, 720], [-520, 560], [-620, 300], [-460, 60], [-260, -120], [-120, -40]],
  },
];
export const DEFAULT_MAP = MAPS[0];
export function findMap(id) { return MAPS.find((m) => m.id === id) || DEFAULT_MAP; }
