// 세계 일주 항로의 기항지와 역사 해설, 세계지도 대륙 윤곽 (경도, 위도)
// 체크포인트 14개 = 기항지 14곳. 리스본에서 출발해 아프리카 → 인도양 → 동아시아 → 태평양 → 카리브해 → 대서양으로 돌아온다.

export const PORTS = [
  { name: '리스본', lon: -9.1, lat: 38.7, year: '1497', region: '포르투갈',
    fact: '바스코 다 가마가 이곳에서 출항해 인도 항로를 열었다. 엔히크 항해왕자가 후원한 항해 연구가 대항해시대의 문을 열었다.' },
  { name: '카나리아 제도', lon: -15.4, lat: 28.1, year: '1492', region: '스페인령',
    fact: '콜럼버스가 대서양 횡단 전 마지막으로 물과 식량을 채운 곳. 북동 무역풍을 타고 서쪽으로 향했다.' },
  { name: '카보베르데', lon: -23.5, lat: 15.0, year: '1494', region: '포르투갈령',
    fact: '토르데시야스 조약은 이 섬 서쪽 370레구아에 선을 그어 스페인과 포르투갈이 세계를 나눠 갖게 했다.' },
  { name: '엘미나', lon: -1.35, lat: 5.1, year: '1482', region: '황금 해안',
    fact: '포르투갈이 사하라 이남에 세운 최초의 유럽 요새 상조르즈 다 미나. 황금 무역의 거점이었으나 뒤에는 노예 무역의 비극이 이어졌다.' },
  { name: '희망봉', lon: 18.5, lat: -34.4, year: '1488', region: '아프리카 남단',
    fact: '바르톨로메우 디아스가 처음 돌았을 때는 "폭풍의 곶"이라 불렀다. 주앙 2세가 인도로 가는 희망을 담아 "희망봉"으로 고쳐 불렀다.' },
  { name: '모잠비크', lon: 40.7, lat: -15.0, year: '1498', region: '스와힐리 해안',
    fact: '다 가마 함대가 정박해 스와힐리 무역 도시와 처음 접촉했다. 이후 말린디에서 얻은 아랍 항해사의 안내로 인도양을 건넜다.' },
  { name: '캘리컷', lon: 75.8, lat: 11.3, year: '1498', region: '인도 말라바르',
    fact: '1498년 5월 다 가마가 도착해 유럽과 인도를 잇는 해상 항로가 완성됐다. 후추와 향신료 무역의 심장부였다.' },
  { name: '말라카', lon: 102.2, lat: 2.2, year: '1511', region: '말레이 반도',
    fact: '향신료 항로의 관문. 정화의 대함대가 기지로 삼았고, 1511년 알부케르크가 점령해 포르투갈의 동방 거점이 됐다.' },
  { name: '나가사키', lon: 129.9, lat: 32.7, year: '1571', region: '일본',
    fact: '포르투갈 무역선에 개항하며 남만 무역이 시작됐다. 조총, 카스텔라, 기독교가 이 항구를 통해 일본에 전해졌다.' },
  { name: '마닐라', lon: 121.0, lat: 14.6, year: '1571', region: '필리핀',
    fact: '스페인이 세운 아시아 거점. 마닐라 갤리온이 250년간 멕시코의 은과 중국의 비단·도자기를 실어 날랐다.' },
  { name: '아카풀코', lon: -99.9, lat: 16.9, year: '1565', region: '누에바에스파냐',
    fact: '우르다네타가 쿠로시오 해류와 편서풍을 이용한 태평양 동향 항로를 찾아내 마닐라 갤리온 무역이 시작됐다.' },
  { name: '카르타헤나', lon: -75.5, lat: 10.4, year: '1533', region: '카리브해',
    fact: '신대륙의 은이 모이던 스페인 보물선단의 요새 항구. 드레이크 같은 사략선의 표적이 되어 거대한 성벽을 쌓았다.' },
  { name: '아바나', lon: -82.4, lat: 23.1, year: '1519', region: '쿠바',
    fact: '보물선단이 대서양 횡단 전 집결하던 항구. 멕시코 만류를 타고 북상한 뒤 편서풍으로 유럽에 돌아갔다.' },
  { name: '아조레스', lon: -25.7, lat: 37.7, year: '1427', region: '대서양 한가운데',
    fact: '귀항하는 인도 함대와 보물선단의 중계지. 바람을 크게 돌아 귀환하는 "볼타 두 마르" 항법의 핵심이었다.' },
];

// 랩 완료 시 보여주는 짧은 역사 상식
export const TRIVIA = [
  '마젤란 원정대(1519~1522)는 5척 약 270명이 출발해 빅토리아호 1척 18명만이 세계 일주를 마치고 돌아왔다.',
  '정화의 보선은 길이 100m가 넘었다고 전해진다. 콜럼버스의 산타마리아호는 약 20m였다.',
  '괴혈병은 대항해시대 선원의 최대 적이었다. 원인이 비타민C 부족임이 밝혀진 것은 18세기에 이르러서다.',
  '경도를 정확히 재는 크로노미터가 나오기 전까지, 배는 위도만 알고 동서 위치는 추측항법으로 짐작해야 했다.',
  '이순신 장군의 거북선은 1592년 사천 해전에서 처음 실전에 투입되었다.',
  '향신료 후추는 한때 같은 무게의 은과 맞바꿀 만큼 귀했다. 인도 항로는 곧 후추 항로였다.',
  '콜럼버스는 죽을 때까지 자신이 도착한 곳을 아시아라고 믿었다.',
  '드레이크는 1577~1580년 두 번째로 세계 일주를 마쳤고, 영국 여왕에게 기사 작위를 받았다.',
];

// 대륙 윤곽 (매우 단순화한 폴리곤, [경도, 위도])
export const CONTINENTS = [
  // 유라시아
  [[-9.5,43],[-2,43.5],[0,46],[-4.5,48.5],[-1.5,49.5],[2,51],[5,53.5],[8.5,54],[8,57],[10.5,57.7],[12,56],[10.5,59],[5,59],[5,62],[13,65.5],[17,69],[24,71],[30,70.5],[41,68],[44,66],[38,65],[43,68.5],[54,69],[60,69],[68,73],[73,68],[80,73],[90,75],[105,77.5],[115,73.5],[130,71.5],[140,72],[160,70],[180,69],[180,65],[170,60],[162,59],[157,52],[162,56],[156,50],[143,53],[140,54],[135,48],[131,43],[129,36],[126,34],[125,38],[122,40],[118,39],[121,36],[120,32],[122,30],[119,25],[113,22],[108,21],[106,18],[109,12],[105,8.5],[100,13],[98,10],[100,4],[104,1.5],[103,8],[99,15],[96,17],[94,21],[91,22],[87,21],[80,15],[77,8],[73,20],[67,24],[57,25],[56,22],[59,22.5],[52,17],[45,13],[43,12.5],[39,21],[35,28],[32,31],[34,36],[30,36.5],[27,40],[26,41],[23,37],[22,40],[19,42],[13,45],[12,42],[16,38],[15,38.5],[16,40],[13,44],[9,44],[6,43],[3,43],[3,42],[-1,37],[-6,36],[-9,37]],
  // 아프리카
  [[-6,35.5],[-10,32],[-17,21],[-17,15],[-15,11],[-8,4.5],[0,5],[8,4.5],[9,0],[13,-8],[12,-17],[15,-27],[18,-34.5],[27,-33.5],[33,-28],[36,-19],[41,-15],[40,-3],[42,3],[51,11],[43,12],[39,15],[37,20],[33,27],[32,31],[25,32],[19,31],[10,34],[10,37],[0,36]],
  // 마다가스카르
  [[44,-25],[47,-25],[50,-16],[49,-12],[46,-16],[44,-20]],
  // 북아메리카
  [[-168,66],[-162,59],[-152,60],[-146,61],[-134,58],[-130,54],[-124,48],[-124,40],[-118,34],[-110,23],[-105,20],[-97,16],[-92,15],[-88,13],[-84,10],[-80,8],[-77,8],[-83,14],[-88,16],[-87,21],[-90,21],[-91,18],[-97,19],[-97,27],[-90,29],[-84,30],[-81,25],[-80,32],[-76,35],[-74,40],[-70,42],[-67,45],[-60,46],[-66,50],[-59,55],[-64,60],[-78,62],[-82,55],[-95,59],[-92,64],[-80,69],[-95,73],[-115,73],[-128,70],[-140,70],[-156,71]],
  // 남아메리카
  [[-77,8],[-72,12],[-62,10],[-52,4],[-50,0],[-44,-2],[-35,-6],[-38,-13],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-42],[-68,-52],[-68,-55],[-73,-50],[-74,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,4]],
  // 오스트레일리아
  [[114,-22],[114,-34],[118,-35],[124,-33],[134,-32],[138,-35],[141,-38],[147,-39],[150,-37],[153,-31],[153,-25],[146,-19],[142,-11],[137,-12],[136,-15],[130,-12],[127,-14],[122,-17]],
  // 그린란드
  [[-45,60],[-40,65],[-22,70],[-18,77],[-30,83],[-60,82],[-70,78],[-55,70],[-50,64]],
  // 영국 / 아일랜드 / 아이슬란드
  [[-5,50],[1.5,51],[1.5,53],[-1.5,56],[-3,58.5],[-6,58],[-5,55],[-3,54]],
  [[-10,52],[-6,52],[-6,55],[-10,54]],
  [[-24,65],[-14,65],[-14,66.5],[-22,66.5]],
  // 일본
  [[130,31],[132,34],[136,35],[140,36],[141,41],[140,45],[145,44],[142,42],[141,38],[137,34],[133,33]],
  // 보르네오 / 수마트라 / 자바 / 필리핀 / 뉴기니 / 스리랑카 / 뉴질랜드
  [[109,1],[113,3],[117,7],[119,5],[117,0],[114,-3],[110,-2]],
  [[95,5.5],[98,4],[104,-2],[106,-6],[103,-5],[100,-1],[96,3]],
  [[105,-6.5],[114,-7.5],[114,-8.5],[106,-7.5]],
  [[120,18],[122,18],[124,13],[126,8],[125,6],[122,8],[120,15]],
  [[131,-1],[141,-2],[150,-6],[147,-10],[140,-8],[135,-4]],
  [[80,10],[82,8],[81,6],[80,7]],
  [[166,-46],[171,-44],[175,-41],[178,-38],[174,-36],[172,-40]],
  // 남극 대륙
  [[-60,-63],[-45,-70],[-20,-72],[0,-70],[20,-70],[45,-67],[70,-68],[90,-66],[110,-66],[140,-67],[160,-70],[170,-75],[180,-78],[180,-90],[-180,-90],[-180,-78],[-150,-77],[-120,-74],[-100,-73],[-80,-73],[-70,-68]],
  // 쿠바 / 히스파니올라
  [[-85,22.5],[-78,22],[-74,20],[-77,20],[-84,21.5]],
  [[-74,19.5],[-68.5,19],[-69,18],[-74,18.5]],
];

// ---------- 연대기: 항해 중 우측에 연월일 순서로 흐르는 역사 사건 ----------
export const EVENTS = [
  { date: '1415.08.21', title: '세우타 점령', text: '포르투갈이 북아프리카 세우타를 점령하며 대항해시대의 서막이 오른다.' },
  { date: '1419', title: '사그레스의 항해 연구', text: '엔히크 항해왕자가 지도 제작자·조선공·천문학자를 모아 탐험을 후원하기 시작한다.' },
  { date: '1434', title: '보자도르 곶 돌파', text: '질 이아네스가 "돌아올 수 없는 곶"이라 불리던 보자도르 곶을 넘어 공포를 깼다.' },
  { date: '1456', title: '카보베르데 제도 발견', text: '베네치아 출신 카다모스토가 포르투갈 왕실을 위해 카보베르데 제도를 발견한다.' },
  { date: '1488.02.03', title: '희망봉 도달', text: '바르톨로메우 디아스가 아프리카 남단을 돌아 모셀만에 상륙. 인도양이 열렸다.' },
  { date: '1492.08.03', title: '콜럼버스 출항', text: '산타마리아·핀타·니냐 3척이 스페인 팔로스 항을 떠나 서쪽으로 향한다.' },
  { date: '1492.10.12', title: '신대륙 상륙', text: '콜럼버스가 바하마의 과나하니(산살바도르)에 상륙한다. 그는 그곳을 인도라 믿었다.' },
  { date: '1494.06.07', title: '토르데시야스 조약', text: '스페인과 포르투갈이 카보베르데 서쪽 370레구아 선을 기준으로 세계를 둘로 나눈다.' },
  { date: '1497.07.08', title: '다 가마 출항', text: '바스코 다 가마가 4척을 이끌고 리스본을 떠나 인도를 향한다.' },
  { date: '1498.05.20', title: '캘리컷 도착', text: '다 가마가 인도 캘리컷에 닿아 유럽-인도 해상 항로가 완성된다.' },
  { date: '1500.04.22', title: '브라질 발견', text: '카브랄이 인도로 가던 중 서쪽으로 크게 돌다 브라질 해안에 닿는다.' },
  { date: '1507.04.25', title: '"아메리카"라는 이름', text: '발트제뮐러의 세계지도가 신대륙에 아메리고 베스푸치의 이름을 붙인다.' },
  { date: '1510.11.25', title: '고아 점령', text: '알부케르크가 인도 고아를 점령해 포르투갈 동방 제국의 수도로 삼는다.' },
  { date: '1511.08.24', title: '말라카 점령', text: '알부케르크가 향신료 항로의 관문 말라카를 손에 넣는다.' },
  { date: '1513.09.25', title: '태평양 발견', text: '발보아가 파나마 지협을 넘어 유럽인 최초로 태평양을 본다.' },
  { date: '1519.09.20', title: '마젤란 출항', text: '5척 약 270명이 스페인 산루카르를 떠나 서쪽 향신료 항로를 찾아 나선다.' },
  { date: '1520.11.28', title: '마젤란 해협 통과', text: '남아메리카 끝의 해협을 빠져나온 바다가 잔잔해 "태평양(Mar Pacífico)"이라 이름 짓는다.' },
  { date: '1521.04.27', title: '마젤란 전사', text: '필리핀 막탄섬에서 라푸라푸의 전사들과 싸우다 마젤란이 목숨을 잃는다.' },
  { date: '1522.09.06', title: '최초의 세계 일주', text: '엘카노가 이끄는 빅토리아호가 18명만 태운 채 스페인으로 돌아온다.' },
  { date: '1543.08.25', title: '조총 전래', text: '포르투갈인이 탄 배가 일본 다네가시마에 표착해 조총을 전한다.' },
  { date: '1565.06.01', title: '태평양 귀환 항로', text: '우르다네타가 쿠로시오와 편서풍을 타고 필리핀에서 멕시코로 돌아가는 길을 찾는다.' },
  { date: '1571.10.07', title: '레판토 해전', text: '신성동맹 갤리 함대가 오스만 함대를 격파. 갤리선 시대 최후의 대해전.' },
  { date: '1577.12.13', title: '드레이크 출항', text: '드레이크가 골든하인드호로 세계 일주 겸 스페인 보물선 사냥에 나선다.' },
  { date: '1588.08.08', title: '무적함대 패배', text: '그라블린 해전에서 영국이 스페인 아르마다를 물리친다.' },
  { date: '1592.07.08', title: '한산도 대첩', text: '이순신이 학익진으로 일본 수군을 대파. 거북선이 선봉에 섰다.' },
  { date: '1597.09.16', title: '명량 해전', text: '이순신이 13척으로 130여 척의 일본 함대를 울돌목에서 막아낸다.' },
  { date: '1600.12.31', title: '영국 동인도회사 설립', text: '엘리자베스 1세가 동인도 무역 독점권을 부여한다.' },
  { date: '1602.03.20', title: '네덜란드 동인도회사(VOC)', text: '세계 최초의 주식회사가 세워져 향신료 무역을 장악한다.' },
  { date: '1606.02.26', title: '오스트레일리아 상륙', text: '얀스존의 다위프컨호가 유럽인 최초로 오스트레일리아 해안에 닿는다.' },
  { date: '1620.11.21', title: '메이플라워호 도착', text: '필그림들이 66일 항해 끝에 케이프코드에 닻을 내린다.' },
  { date: '1642.12.13', title: '뉴질랜드 발견', text: '아벨 타스만이 태즈메이니아에 이어 뉴질랜드를 발견한다.' },
  { date: '1761.11.18', title: '크로노미터 시험 항해', text: '해리슨의 H4 시계가 자메이카까지 경도를 오차 몇 km로 맞춘다. 경도 문제가 풀렸다.' },
];

// ---------- 역사 인물 (두루마리 아이템으로 발견) ----------
export const FIGURES = [
  { name: '엔히크 항해왕자', years: '1394~1460', text: '포르투갈 왕자. 직접 항해하지 않았지만 아프리카 서해안 탐험을 40년간 후원해 대항해시대를 열었다.' },
  { name: '바르톨로메우 디아스', years: '1450?~1500', text: '1488년 희망봉을 처음 돌았다. 훗날 카브랄 함대에 합류했다가 바로 그 희망봉 앞바다 폭풍에서 실종됐다.' },
  { name: '크리스토퍼 콜럼버스', years: '1451~1506', text: '제노바 출신. 지구 둘레를 실제보다 작게 계산해 서쪽으로 인도에 갈 수 있다고 믿었고, 대신 아메리카에 닿았다.' },
  { name: '바스코 다 가마', years: '1460?~1524', text: '1498년 인도 항로를 열었다. 항해 거리는 콜럼버스 1차 항해의 4배가 넘는 약 4만 km였다.' },
  { name: '아메리고 베스푸치', years: '1454~1512', text: '신대륙이 아시아가 아닌 별개의 대륙임을 주장했다. 그 이름이 "아메리카"가 되었다.' },
  { name: '페르디난드 마젤란', years: '1480~1521', text: '포르투갈인이지만 스페인 왕의 후원으로 세계 일주 항해를 이끌었다. 필리핀에서 전사해 일주를 완성하지는 못했다.' },
  { name: '후안 세바스티안 엘카노', years: '1476~1526', text: '마젤란 사후 빅토리아호를 지휘해 1522년 최초의 세계 일주를 완성했다. 문장에 "네가 나를 처음 일주했다"는 글귀를 받았다.' },
  { name: '정화(鄭和)', years: '1371~1433', text: '명나라 환관 제독. 1405~1433년 일곱 차례 대함대를 이끌고 동남아·인도·아라비아·동아프리카까지 항해했다.' },
  { name: '이순신', years: '1545~1598', text: '조선 수군 장군. 임진왜란 23전 전승. 거북선과 학익진으로 일본 수군을 막아냈다.' },
  { name: '프랜시스 드레이크', years: '1540?~1596', text: '영국의 사략선장. 스페인 보물선을 털며 세계를 일주했고, 무적함대 격파에 공을 세웠다.' },
  { name: '아폰수 드 알부케르크', years: '1453~1515', text: '고아·말라카·호르무즈를 점령해 포르투갈의 인도양 제국을 세운 "동방의 사자".' },
  { name: '하이레딘 바르바로사', years: '1478?~1546', text: '오스만 제국의 대제독. 지중해를 갤리 함대로 지배한 바르바리 해적 출신.' },
  { name: '피리 레이스', years: '1465?~1553', text: '오스만 제독이자 지도 제작자. 1513년 지도에 남아메리카 해안이 놀랍도록 정확히 그려져 있다.' },
  { name: '게라르두스 메르카토르', years: '1512~1594', text: '1569년 항해용 도법을 발표했다. 나침반 방위를 직선으로 그릴 수 있는 이 지도는 지금도 쓰인다.' },
  { name: '안드레스 데 우르다네타', years: '1498~1568', text: '수도사이자 항해사. 태평양을 동쪽으로 건너는 귀환 항로를 찾아 마닐라 갤리온 무역을 가능하게 했다.' },
  { name: '페드루 알바르스 카브랄', years: '1467?~1520', text: '인도로 가던 길에 브라질을 발견했다. 함대에는 희망봉의 디아스도 타고 있었다.' },
  { name: '바스코 누녜스 데 발보아', years: '1475~1519', text: '파나마 지협을 걸어 넘어 유럽인 최초로 태평양을 본 탐험가.' },
  { name: '존 해리슨', years: '1693~1776', text: '시계 장인. 흔들리는 배에서도 정확한 크로노미터를 만들어 바다 위 경도 측정을 가능하게 했다.' },
];

// ---------- 발견: 현상 / 사물 / 사건 (발견 구슬 아이템) ----------
// effect: aurora 하늘 오로라 / elmo 돛대 불빛 / tradewind 순풍 / current 해류 가속 / citrus 게이지 충전 / bonus 점수 2배
export const DISCOVERIES = [
  { kind: '자연현상', name: '오로라', text: '고위도 밤하늘의 빛의 장막. 태양풍의 입자가 대기와 부딪혀 빛난다. 북방 항로의 선원들이 신의 징조로 여겼다.', effect: 'aurora', color: '#7bffb0' },
  { kind: '자연현상', name: '세인트 엘모의 불', text: '폭풍 전후 돛대 끝에 푸른 불꽃이 맺히는 현상. 대기 전기의 코로나 방전이다. 마젤란 함대는 이를 수호성인의 가호로 믿었다.', effect: 'elmo', color: '#8fd4ff' },
  { kind: '자연현상', name: '무역풍', text: '적도 양쪽에서 늘 같은 방향으로 부는 바람. 콜럼버스는 이 바람을 타고 서쪽으로 갔다. 영어 trade는 "일정한 길"이란 옛 뜻이다.', effect: 'tradewind', color: '#ffe08a' },
  { kind: '자연현상', name: '쿠로시오 해류', text: '필리핀에서 일본을 지나 북태평양을 도는 검푸른 난류. 우르다네타는 이 흐름을 타고 멕시코로 돌아갔다.', effect: 'current', color: '#5cc8ff' },
  { kind: '자연현상', name: '편서풍', text: '중위도에서 서쪽에서 동쪽으로 부는 바람. 유럽으로 돌아오는 배들은 북쪽으로 올라가 이 바람을 탔다.', effect: 'tradewind', color: '#ffe08a' },
  { kind: '자연현상', name: '적도 무풍대', text: '적도 부근에서 바람이 죽는 지대. 몇 주씩 갇힌 배에서는 물과 식량이 떨어졌다. 영어로 doldrums, "우울"이란 뜻이 됐다.', effect: 'bonus', color: '#c8b89a' },
  { kind: '자연현상', name: '사르가소 해', text: '대서양 한가운데 해초가 떠다니는 바다. 콜럼버스 선원들은 육지가 가까운 줄 알았으나 수천 km의 바다였다.', effect: 'bonus', color: '#8fbf6a' },
  { kind: '사물', name: '아스트롤라베', text: '태양이나 별의 고도를 재서 위도를 구하는 도구. 흔들리는 갑판 위에서는 오차가 컸다.', effect: 'bonus', color: '#d4af37' },
  { kind: '사물', name: '나침반', text: '중국에서 발명되어 아랍을 거쳐 유럽에 전해졌다. 흐린 날에도 방위를 알 수 있게 되자 겨울 항해가 가능해졌다.', effect: 'bonus', color: '#d4af37' },
  { kind: '사물', name: '포르톨라노 해도', text: '항구 사이를 잇는 방위선이 그물처럼 그려진 중세 해도. 지중해 항해의 필수품이었다.', effect: 'bonus', color: '#d4af37' },
  { kind: '사물', name: '감귤 상자', text: '괴혈병은 비타민C 부족으로 잇몸이 무너지는 병. 1747년 린드가 감귤로 낫는다는 것을 실험으로 증명했다.', effect: 'citrus', color: '#ffb347' },
  { kind: '사물', name: '후추 자루', text: '한때 같은 무게의 은과 맞바꿀 만큼 비쌌다. 인도 항로는 곧 후추 항로였다.', effect: 'bonus', color: '#ff9a3c' },
  { kind: '사물', name: '포토시 은', text: '볼리비아 포토시 은광의 은이 마닐라 갤리온을 타고 중국까지 흘러 세계 화폐가 되었다.', effect: 'bonus', color: '#e0e0e0' },
  { kind: '사물', name: '명나라 청화백자', text: '유럽 왕실이 열광한 중국 도자기. 갤리온과 카락의 선창에 짚에 싸여 실려 왔다.', effect: 'bonus', color: '#8fd4ff' },
  { kind: '사물', name: '건빵과 소금절임', text: '항해 식량은 벌레 먹은 건빵과 소금에 절인 고기였다. 신선한 물은 며칠 만에 상했다.', effect: 'citrus', color: '#c8b89a' },
  { kind: '사건', name: '적도 통과 의식', text: '처음 적도를 넘는 선원을 바닷물에 빠뜨리는 전통. "넵튠 왕"이 심판을 맡았다.', effect: 'bonus', color: '#5cc8ff' },
  { kind: '사건', name: '괴혈병 창궐', text: '다 가마의 첫 항해에서 선원 170명 중 100명 이상이 괴혈병으로 죽었다.', effect: 'citrus', color: '#ffb347' },
  { kind: '사건', name: '선상 반란', text: '마젤란은 파타고니아에서 반란을 진압했다. 규율은 목숨과 직결된 문제였다.', effect: 'bonus', color: '#ff6b6b' },
];

// ---------- 맵별 항로 (우측 상단 지도용): 각 14곳, 체크포인트와 1:1 ----------
// bounds: [경도 최소, 경도 최대, 위도 최소, 위도 최대]
export const MAP_ROUTES = {
  pacific: { bounds: [95, 215, -25, 40], center: 155, ports: [
    { name: '마닐라', en: 'Manila', lon: 121.0, lat: 14.6, year: '1571', region: '필리핀', regionEn: 'Philippines', fact: '마닐라 갤리온이 250년간 태평양을 오간 출발점.', factEn: 'Where the Manila galleons set out across the Pacific for 250 years.' },
    { name: '괌', en: 'Guam', lon: 144.8, lat: 13.5, year: '1521', region: '마리아나 제도', regionEn: 'Marianas', fact: '마젤란 함대가 태평양 횡단 후 처음 상륙한 섬.', factEn: 'The first island Magellan\'s fleet touched after crossing the Pacific.' },
    { name: '팔라우', en: 'Palau', lon: 134.5, lat: 7.5, year: '1543', region: '미크로네시아', regionEn: 'Micronesia', fact: '스페인 탐험가 비야로보스가 처음 기록한 산호섬.', factEn: 'Coral islands first recorded by the Spanish explorer Villalobos.' },
    { name: '라바울', en: 'Rabaul', lon: 152.2, lat: -4.2, year: '1700', region: '뉴기니', regionEn: 'New Guinea', fact: '화산 칼데라 속의 천연 항구. 댐피어가 뉴브리튼을 발견했다.', factEn: 'A natural harbour inside a volcanic caldera; Dampier discovered New Britain here.' },
    { name: '과달카날', en: 'Guadalcanal', lon: 160.0, lat: -9.6, year: '1568', region: '솔로몬 제도', regionEn: 'Solomon Islands', fact: '멘다냐가 "솔로몬의 황금"을 찾아 이름 붙인 섬.', factEn: 'Named by Mendaña, who came looking for the gold of Solomon.' },
    { name: '수바', en: 'Suva', lon: 178.4, lat: -18.1, year: '1643', region: '피지', regionEn: 'Fiji', fact: '타스만이 지나간 뒤 쿡이 다시 찾은 남태평양의 관문.', factEn: 'Passed by Tasman, revisited by Cook: the gateway to the South Pacific.' },
    { name: '아피아', en: 'Apia', lon: -171.8, lat: -13.8, year: '1722', region: '사모아', regionEn: 'Samoa', fact: '네덜란드의 로헤베인이 유럽인 최초로 사모아를 보았다.', factEn: 'Roggeveen was the first European to sight Samoa.' },
    { name: '파페에테', en: 'Papeete', lon: -149.6, lat: -17.5, year: '1767', region: '타히티', regionEn: 'Tahiti', fact: '월리스와 쿡이 금성 관측을 위해 찾은 낙원의 섬.', factEn: 'Wallis and Cook came here to observe the transit of Venus.' },
    { name: '호놀룰루', en: 'Honolulu', lon: -157.9, lat: 21.3, year: '1778', region: '하와이', regionEn: 'Hawaii', fact: '쿡 선장이 "샌드위치 제도"라 부른 태평양의 십자로.', factEn: 'Cook named these the Sandwich Islands: the crossroads of the Pacific.' },
    { name: '미드웨이', en: 'Midway', lon: -177.4, lat: 28.2, year: '1859', region: '북태평양', regionEn: 'North Pacific', fact: '태평양 한가운데의 환초. 이름 그대로 아시아와 아메리카의 중간.', factEn: 'An atoll in mid-ocean, halfway between Asia and America as its name says.' },
    { name: '웨이크섬', en: 'Wake Island', lon: 166.6, lat: 19.3, year: '1568', region: '북태평양', regionEn: 'North Pacific', fact: '멘다냐가 발견한 외딴 환초. 훗날 태평양 횡단 비행의 중계지.', factEn: 'A lonely atoll found by Mendaña, later a stop for trans-Pacific flights.' },
    { name: '사이판', en: 'Saipan', lon: 145.7, lat: 15.2, year: '1565', region: '마리아나 제도', regionEn: 'Marianas', fact: '레가스피가 스페인령으로 선언한 마리아나의 섬.', factEn: 'Claimed for Spain by Legazpi.' },
    { name: '나하', en: 'Naha', lon: 127.7, lat: 26.2, year: '1429', region: '류큐', regionEn: 'Ryukyu', fact: '류큐 왕국의 항구. 명·조선·일본·동남아를 잇는 중계 무역으로 번영했다.', factEn: 'Port of the Ryukyu Kingdom, rich on trade linking China, Korea, Japan and Southeast Asia.' },
    { name: '타이난', en: 'Tainan', lon: 120.2, lat: 23.0, year: '1624', region: '타이완', regionEn: 'Taiwan', fact: '네덜란드가 질란디아 요새를 세운 타이완의 첫 관문.', factEn: 'Where the Dutch built Fort Zeelandia, Taiwan\'s first gateway.' },
  ] },
  mediterranean: { bounds: [-10, 38, 29, 47], coasts: 'mediterranean', ports: [
    { name: '지브롤터', en: 'Gibraltar', lon: -5.35, lat: 36.1, year: '1462', region: '헤라클레스의 기둥', regionEn: 'Pillars of Hercules', fact: '지중해의 문. 고대에는 여기가 세상의 끝이었다.', factEn: 'The gate of the Mediterranean; in antiquity, the edge of the world.' },
    { name: '발렌시아', en: 'Valencia', lon: -0.38, lat: 39.5, year: '1238', region: '아라곤', regionEn: 'Aragon', fact: '비단과 도자기의 항구. 아라곤 왕국의 지중해 무역 거점.', factEn: 'Port of silk and ceramics, Aragon\'s Mediterranean trading base.' },
    { name: '마요르카', en: 'Mallorca', lon: 2.65, lat: 39.6, year: '1375', region: '발레아레스', regionEn: 'Balearics', fact: '카탈루냐 지도의 고향. 유대인 지도 제작자들이 세계를 그렸다.', factEn: 'Home of the Catalan Atlas, where Jewish cartographers mapped the world.' },
    { name: '마르세유', en: 'Marseille', lon: 5.37, lat: 43.3, year: '-600', region: '프로방스', regionEn: 'Provence', fact: '그리스인이 세운 프랑스 최고(最古)의 항구.', factEn: 'France\'s oldest port, founded by Greek settlers.' },
    { name: '제노바', en: 'Genoa', lon: 8.93, lat: 44.4, year: '1451', region: '리구리아', regionEn: 'Liguria', fact: '콜럼버스의 고향. 베네치아와 지중해 무역을 다툰 해양 공화국.', factEn: 'Columbus\'s birthplace, a maritime republic that rivalled Venice.' },
    { name: '나폴리', en: 'Naples', lon: 14.25, lat: 40.8, year: '1442', region: '캄파니아', regionEn: 'Campania', fact: '베수비오 아래의 대항구. 아라곤과 스페인의 남이탈리아 수도.', factEn: 'Great harbour under Vesuvius, capital of Aragonese and Spanish southern Italy.' },
    { name: '팔레르모', en: 'Palermo', lon: 13.36, lat: 38.1, year: '1072', region: '시칠리아', regionEn: 'Sicily', fact: '아랍·노르만·스페인 문화가 겹겹이 쌓인 시칠리아의 수도.', factEn: 'Sicily\'s capital, layered with Arab, Norman and Spanish culture.' },
    { name: '몰타', en: 'Malta', lon: 14.5, lat: 35.9, year: '1565', region: '몰타 기사단', regionEn: 'Knights of Malta', fact: '기사단이 오스만의 대포위를 막아낸 지중해의 요새.', factEn: 'The fortress island where the Knights withstood the Great Siege of 1565.' },
    { name: '알렉산드리아', en: 'Alexandria', lon: 29.9, lat: 31.2, year: '-331', region: '이집트', regionEn: 'Egypt', fact: '대등대와 대도서관의 도시. 향신료가 인도양에서 지중해로 넘어오던 길목.', factEn: 'City of the Lighthouse and the Library, where spices passed from the Indian Ocean to the Mediterranean.' },
    { name: '로도스', en: 'Rhodes', lon: 28.2, lat: 36.4, year: '1522', region: '도데카니사', regionEn: 'Dodecanese', fact: '거상이 서 있던 섬. 기사단이 쫓겨나 몰타로 옮겨갔다.', factEn: 'Island of the Colossus; the Knights were driven out and moved to Malta.' },
    { name: '이라클리온', en: 'Heraklion', lon: 25.1, lat: 35.3, year: '1204', region: '크레타', regionEn: 'Crete', fact: '베네치아의 "칸디아". 400년간 동지중해 함대의 기지였다.', factEn: 'Venetian "Candia", base of the eastern fleet for 400 years.' },
    { name: '이스탄불', en: 'Istanbul', lon: 28.97, lat: 41.0, year: '1453', region: '오스만', regionEn: 'Ottoman', fact: '두 대륙을 잇는 제국의 수도. 오스만 갤리 함대의 심장.', factEn: 'Imperial capital bridging two continents, heart of the Ottoman galley fleet.' },
    { name: '베네치아', en: 'Venice', lon: 12.34, lat: 45.4, year: '1571', region: '베네토', regionEn: 'Veneto', fact: '바다의 공화국. 갤리어스로 레판토를 승리로 이끌었다.', factEn: 'Republic of the sea; its galleasses won the day at Lepanto.' },
    { name: '튀니스', en: 'Tunis', lon: 10.2, lat: 36.8, year: '1535', region: '바르바리', regionEn: 'Barbary', fact: '바르바로사의 해적 기지를 카를 5세가 점령한 카르타고의 땅.', factEn: 'Land of Carthage, where Charles V took Barbarossa\'s corsair base.' },
  ] },
  arctic: { bounds: [-180, 180, 55, 85], ports: [
    { name: '베르겐', en: 'Bergen', lon: 5.3, lat: 60.4, year: '1360', region: '노르웨이', regionEn: 'Norway', fact: '한자 동맹의 말린 대구 무역 거점.', factEn: 'Hanseatic base of the stockfish trade.' },
    { name: '트롬쇠', en: 'Tromsø', lon: 18.95, lat: 69.6, year: '1794', region: '노르웨이', regionEn: 'Norway', fact: '북극 탐험대의 출발 항구. "북극의 문".', factEn: 'Gateway to the Arctic, where polar expeditions set out.' },
    { name: '스발바르', en: 'Svalbard', lon: 15.6, lat: 78.2, year: '1596', region: '북극해', regionEn: 'Arctic', fact: '바렌츠가 북동항로를 찾다 발견한 얼음의 섬.', factEn: 'Found by Barentsz while seeking the Northeast Passage.' },
    { name: '무르만스크', en: 'Murmansk', lon: 33.1, lat: 69.0, year: '1916', region: '러시아', regionEn: 'Russia', fact: '멕시코 만류 덕에 얼지 않는 북극권의 항구.', factEn: 'An Arctic port kept ice-free by the Gulf Stream.' },
    { name: '아르한겔스크', en: 'Arkhangelsk', lon: 40.5, lat: 64.5, year: '1553', region: '러시아', regionEn: 'Russia', fact: '챈슬러가 북쪽 바다로 러시아에 닿아 영국-러시아 무역이 열렸다.', factEn: 'Chancellor reached Russia by the northern sea, opening English trade.' },
    { name: '노바야제믈랴', en: 'Novaya Zemlya', lon: 56.0, lat: 74.0, year: '1597', region: '북극해', regionEn: 'Arctic', fact: '바렌츠 일행이 얼음에 갇혀 겨울을 난 곳.', factEn: 'Where Barentsz\'s crew wintered trapped in the ice.' },
    { name: '딕손', en: 'Dikson', lon: 80.5, lat: 73.5, year: '1875', region: '시베리아', regionEn: 'Siberia', fact: '노르덴셸드가 북동항로 최초 통과 때 들른 카라해의 항구.', factEn: 'Kara Sea harbour on Nordenskiöld\'s first passage of the Northeast route.' },
    { name: '틱시', en: 'Tiksi', lon: 128.9, lat: 71.6, year: '1739', region: '시베리아', regionEn: 'Siberia', fact: '레나강 하구. 대북방 탐험대가 해안선을 그렸다.', factEn: 'Mouth of the Lena, charted by the Great Northern Expedition.' },
    { name: '베링 해협', en: 'Bering Strait', lon: -169, lat: 65.8, year: '1728', region: '아시아·아메리카 사이', regionEn: 'Between Asia and America', fact: '베링이 두 대륙이 떨어져 있음을 확인한 해협.', factEn: 'Where Bering proved that Asia and America are separate.' },
    { name: '우트키아그빅', en: 'Utqiagvik', lon: -156.8, lat: 71.3, year: '1826', region: '알래스카', regionEn: 'Alaska', fact: '미국 최북단. 비치가 북서항로를 찾아 닿은 곶.', factEn: 'The northernmost point of the USA, reached by Beechey seeking the Northwest Passage.' },
    { name: '레졸루트', en: 'Resolute', lon: -94.9, lat: 74.7, year: '1850', region: '캐나다 북극', regionEn: 'Canadian Arctic', fact: '실종된 프랭클린 탐험대를 찾던 배들의 겨울 기지.', factEn: 'Winter base of the ships searching for Franklin\'s lost expedition.' },
    { name: '누크', en: 'Nuuk', lon: -51.7, lat: 64.2, year: '1721', region: '그린란드', regionEn: 'Greenland', fact: '바이킹이 500년 살다 사라진 땅에 한스 에게데가 다시 세운 마을.', factEn: 'Refounded by Hans Egede where Vikings had lived and vanished.' },
    { name: '레이캬비크', en: 'Reykjavík', lon: -21.9, lat: 64.1, year: '874', region: '아이슬란드', regionEn: 'Iceland', fact: '잉골푸르가 정착한 "연기의 만". 북대서양 항해의 중계지.', factEn: '"Smoky Bay" settled by Ingólfur, a way station of North Atlantic voyages.' },
    { name: '토르스하운', en: 'Tórshavn', lon: -6.8, lat: 62.0, year: '1000', region: '페로 제도', regionEn: 'Faroes', fact: '바이킹의 의회가 열리던 섬. 노르웨이와 아이슬란드 사이의 징검다리.', factEn: 'Island of the Viking assembly, stepping stone between Norway and Iceland.' },
  ] },
  antarctic: { bounds: [-180, 180, -80, -45], ports: [
    { name: '우수아이아', en: 'Ushuaia', lon: -68.3, lat: -54.8, year: '1520', region: '티에라델푸에고', regionEn: 'Tierra del Fuego', fact: '세계 최남단 도시. 마젤란이 본 "불의 땅".', factEn: 'The world\'s southernmost city, on Magellan\'s "Land of Fire".' },
    { name: '케이프혼', en: 'Cape Horn', lon: -67.3, lat: -55.9, year: '1616', region: '드레이크 해협', regionEn: 'Drake Passage', fact: '스하우턴이 돌아 이름 붙인 남아메리카의 끝. 선원의 무덤.', factEn: 'Rounded and named by Schouten; the sailors\' graveyard.' },
    { name: '킹조지섬', en: 'King George Island', lon: -58.3, lat: -62.0, year: '1819', region: '사우스셰틀랜드', regionEn: 'South Shetlands', fact: '스미스가 발견한 남극권 최초의 땅. 세종기지가 여기 있다.', factEn: 'First land found south of the Antarctic Convergence; home of Korea\'s King Sejong Station.' },
    { name: '파머 기지', en: 'Palmer Station', lon: -64.1, lat: -64.8, year: '1820', region: '남극반도', regionEn: 'Antarctic Peninsula', fact: '물개잡이 파머가 남극 대륙을 본 곳.', factEn: 'Where sealer Nathaniel Palmer sighted the Antarctic mainland.' },
    { name: '웨들해', en: 'Weddell Sea', lon: -45.0, lat: -70.0, year: '1823', region: '남극', regionEn: 'Antarctica', fact: '섀클턴의 인듀어런스호가 얼음에 갇혀 부서진 바다.', factEn: 'Where Shackleton\'s Endurance was crushed in the ice.' },
    { name: '사우스조지아', en: 'South Georgia', lon: -36.5, lat: -54.3, year: '1775', region: '남대서양', regionEn: 'South Atlantic', fact: '쿡이 상륙한 섬. 섀클턴의 구조 행군이 끝난 곳.', factEn: 'Landed by Cook; the end of Shackleton\'s rescue march.' },
    { name: '부베섬', en: 'Bouvet Island', lon: 3.4, lat: -54.4, year: '1739', region: '남대서양', regionEn: 'South Atlantic', fact: '세상에서 가장 외딴 섬.', factEn: 'The most remote island on Earth.' },
    { name: '케르겔렌', en: 'Kerguelen', lon: 69.3, lat: -49.3, year: '1772', region: '남인도양', regionEn: 'Southern Indian Ocean', fact: '쿡이 "황량한 섬"이라 부른 폭풍의 군도.', factEn: 'Cook called them the Desolation Islands.' },
    { name: '매쿼리섬', en: 'Macquarie Island', lon: 158.9, lat: -54.6, year: '1810', region: '남태평양', regionEn: 'Southern Pacific', fact: '모슨 남극 탐험대의 무선 중계 기지.', factEn: 'Radio relay base of Mawson\'s Antarctic expedition.' },
    { name: '맥머도', en: 'McMurdo', lon: 166.7, lat: -77.8, year: '1841', region: '로스해', regionEn: 'Ross Sea', fact: '로스가 발견한 만. 스콧과 아문센의 남극점 경쟁이 시작된 곳.', factEn: 'Found by Ross; where the race to the Pole between Scott and Amundsen began.' },
    { name: '아문센해', en: 'Amundsen Sea', lon: -110, lat: -73.0, year: '1929', region: '남극', regionEn: 'Antarctica', fact: '최초로 남극점에 선 아문센의 이름을 딴 바다.', factEn: 'Named for Amundsen, first to stand at the South Pole.' },
    { name: '피터 1세 섬', en: 'Peter I Island', lon: -90.6, lat: -68.8, year: '1821', region: '벨링스하우젠해', regionEn: 'Bellingshausen Sea', fact: '벨링스하우젠이 남극권에서 처음 발견한 섬.', factEn: 'First island found within the Antarctic Circle, by Bellingshausen.' },
    { name: '스탠리', en: 'Stanley', lon: -57.9, lat: -51.7, year: '1690', region: '포클랜드', regionEn: 'Falklands', fact: '케이프혼을 도는 배들의 마지막 보급항.', factEn: 'Last supply port for ships rounding the Horn.' },
    { name: '푼타아레나스', en: 'Punta Arenas', lon: -70.9, lat: -53.2, year: '1848', region: '마젤란 해협', regionEn: 'Strait of Magellan', fact: '마젤란 해협의 항구. 남극 탐험대의 출발지.', factEn: 'Port on the Strait of Magellan, departure point of Antarctic expeditions.' },
  ] },
  strait: { bounds: [124, 133, 31.5, 37.5], coasts: 'strait', ports: [
    { name: '부산', en: 'Busan', lon: 129.04, lat: 35.1, year: '1407', region: '경상도', regionEn: 'Gyeongsang', fact: '왜관이 열린 조선의 관문. 임진왜란 첫 격전지.', factEn: 'Joseon\'s gateway with its Japanese trading post; first battleground of the Imjin War.' },
    { name: '거제', en: 'Geoje', lon: 128.6, lat: 34.8, year: '1592', region: '경상도', regionEn: 'Gyeongsang', fact: '옥포 해전. 이순신의 첫 승리가 여기서 시작됐다.', factEn: 'Battle of Okpo, Yi Sun-sin\'s first victory.' },
    { name: '한산도', en: 'Hansando', lon: 128.45, lat: 34.75, year: '1592', region: '통영', regionEn: 'Tongyeong', fact: '학익진으로 왜 수군을 섬멸한 한산도 대첩의 바다.', factEn: 'Sea of the Hansando victory, won with the crane-wing formation.' },
    { name: '여수', en: 'Yeosu', lon: 127.7, lat: 34.75, year: '1591', region: '전라좌수영', regionEn: 'Jeolla Left Navy', fact: '전라좌수영 본영. 거북선이 이곳에서 건조됐다.', factEn: 'Headquarters of the Jeolla Left Navy, where the turtle ship was built.' },
    { name: '명량', en: 'Myeongnyang', lon: 126.3, lat: 34.57, year: '1597', region: '울돌목', regionEn: 'Uldolmok', fact: '13척으로 130여 척을 막은 울돌목의 소용돌이.', factEn: 'The whirling strait where 13 ships held off 130.' },
    { name: '목포', en: 'Mokpo', lon: 126.4, lat: 34.8, year: '1597', region: '전라도', regionEn: 'Jeolla', fact: '명량 뒤 이순신이 고하도에 진을 친 서남해의 항구.', factEn: 'Southwestern port where Yi camped at Gohado after Myeongnyang.' },
    { name: '제주', en: 'Jeju', lon: 126.5, lat: 33.5, year: '1653', region: '탐라', regionEn: 'Tamna', fact: '하멜 일행이 표류해 조선을 서양에 처음 알린 섬.', factEn: 'Where Hamel\'s crew was shipwrecked and first told the West about Korea.' },
    { name: '나가사키', en: 'Nagasaki', lon: 129.9, lat: 32.7, year: '1571', region: '규슈', regionEn: 'Kyushu', fact: '남만 무역의 항구. 데지마의 네덜란드 상관.', factEn: 'Port of the Nanban trade and the Dutch post at Dejima.' },
    { name: '히라도', en: 'Hirado', lon: 129.55, lat: 33.4, year: '1609', region: '규슈', regionEn: 'Kyushu', fact: '네덜란드·영국 상관이 처음 들어선 일본의 창.', factEn: 'Japan\'s first window to the Dutch and English trading posts.' },
    { name: '하카타', en: 'Hakata', lon: 130.4, lat: 33.6, year: '1274', region: '규슈', regionEn: 'Kyushu', fact: '여몽 연합군이 상륙한 항구. "가미카제"의 전설이 태어났다.', factEn: 'Where the Mongol-Goryeo fleet landed; birthplace of the "kamikaze" legend.' },
    { name: '시모노세키', en: 'Shimonoseki', lon: 130.95, lat: 33.95, year: '1185', region: '간몬 해협', regionEn: 'Kanmon Strait', fact: '단노우라 해전. 헤이케가 바다에 가라앉은 좁은 해협.', factEn: 'Battle of Dan-no-ura, where the Heike sank in the narrow strait.' },
    { name: '이키', en: 'Iki', lon: 129.7, lat: 33.8, year: '1281', region: '쓰시마 해협', regionEn: 'Tsushima Strait', fact: '몽골 원정군의 길목이 된 작은 섬.', factEn: 'Small island on the path of the Mongol invasions.' },
    { name: '쓰시마', en: 'Tsushima', lon: 129.3, lat: 34.4, year: '1419', region: '대마도', regionEn: 'Tsushima', fact: '조선과 일본 사이의 다리. 이종무의 정벌과 통신사가 오간 섬.', factEn: 'Bridge between Korea and Japan: Yi Jong-mu\'s expedition and the Joseon envoys passed here.' },
    { name: '울산', en: 'Ulsan', lon: 129.4, lat: 35.5, year: '1598', region: '경상도', regionEn: 'Gyeongsang', fact: '정유재란 울산성 전투의 항구. 오늘날 조선(造船)의 도시.', factEn: 'Port of the siege of Ulsan; today a city of shipbuilding.' },
  ] },
};

// ---------- 확대 지도용 상세 해안선 (지중해, 한일해협) ----------
export const REGION_COASTS = {
  mediterranean: [
    // 유럽 남해안 (이베리아 → 프랑스 → 이탈리아 반도 → 발칸 → 아나톨리아)
    [[-10,47],[-10,44],[-9.5,36.5],[-6,36],[-2,36.7],[0,38.5],[0.5,40.5],[3,42],[3.5,43.3],[5,43.2],[7.5,43.7],[9,44.4],[10,44],[10.5,43],[11.2,42.4],[12.2,41.7],[14,40.8],[15.6,40],[16.2,38.9],[15.6,38],[16.5,38.4],[17.2,39.4],[18.5,40],[16,41.5],[15.9,41.9],[14,42.7],[13.5,43.6],[12.3,44.5],[12.3,45.4],[13.7,45.6],[14.5,45],[15.5,43.9],[17,43],[19,42],[19.5,40.8],[20.2,39.5],[21.5,38.4],[22.5,37],[23,37.8],[24,38],[23.5,39],[22.5,40.5],[24,40.8],[26,40.7],[26.2,41.5],[28,41.2],[29,41],[29.5,40.5],[27,40.3],[26.5,39.5],[26.8,38.4],[27.5,37],[28.5,36.7],[30,36.3],[32.5,36.1],[35,36.6],[36,36.3],[36,37.5],[38,38],[38,47]],
    // 아프리카 북해안 + 레반트
    [[-10,29],[-10,35.8],[-5.9,35.8],[-2,35.1],[0,35.8],[3,36.8],[8,36.9],[10.3,37.3],[11,36.8],[10.5,35.5],[11,34],[13,32.9],[15.5,32.4],[19,30.3],[20,32.2],[23,32.8],[25,31.6],[29,30.9],[31,31.5],[33,31.1],[34.3,31.3],[35,33],[35.9,34.6],[36,36.3],[38,36],[38,29]],
    // 시칠리아 / 사르데냐 / 코르시카 / 크레타 / 키프로스 / 마요르카 / 몰타
    [[12.4,38],[15.6,38.2],[15.1,36.7],[12.5,37.5]], [[8.2,41],[9.7,41],[9.6,39],[8.4,39]], [[8.6,43],[9.5,42.8],[9.2,41.4],[8.7,41.6]],
    [[23.5,35.3],[26.3,35.3],[26,35],[24,35]], [[32.3,35],[34.6,35.6],[34,34.6],[32.5,34.7]], [[2.4,39.6],[3.4,39.9],[3.1,39.3],[2.5,39.5]], [[14.3,36],[14.6,36],[14.5,35.8]],
  ],
  strait: [
    // 한반도 남부
    [[124,38.5],[124,38],[126,37.3],[126.6,36.7],[126.3,35.9],[126.3,34.8],[126.5,34.3],[127.4,34.6],[128,34.8],[128.6,34.7],[129.2,35.1],[129.4,35.6],[129.5,37],[131,38.5]],
    // 제주
    [[126.2,33.5],[126.9,33.5],[126.9,33.3],[126.3,33.25]],
    // 규슈
    [[129.7,33.9],[130.4,33.9],[131,33.9],[131.9,33.3],[131.9,32],[131.3,31.3],[130.6,31],[130.2,31.6],[130.2,32.6],[129.8,32.7],[129.7,33.3]],
    // 혼슈 서단
    [[130.9,34],[131.5,34.4],[132.5,34.3],[133,34.5],[133,35.6],[132,35.5],[130.9,34.4]],
    // 쓰시마 / 이키
    [[129.2,34.1],[129.5,34.15],[129.45,34.7],[129.2,34.65]], [[129.65,33.75],[129.8,33.75],[129.8,33.85],[129.65,33.85]],
  ],
};
