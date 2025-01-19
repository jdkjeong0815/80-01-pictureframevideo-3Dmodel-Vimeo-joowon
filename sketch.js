// git test

// 프로그램 : 80-01-pictureframevideo-3Dmodel-Vimeo-joowon
// jdk : 2025-Jan-14
// title : 3dmodel/picture frame video 
// 비디오 : LOST IN WHITE,  김주원 작가
// 3D 액자 모델 + Vimeo 비디오
// 기기에 관계 없이 센터 중심으로 정렬되어 보이도록 함.(세로 모드는 안됨)
// 3d 모델의 크기는 화면 크기에 비례, 비디오 화면 크기는 3d 모델 크기에 맞춰 조정
// 비디오는 iframe을 사용하여 재생
// 터치 후 비디오 재생이 되도록 함(자동 재생은 크롬 정책상 불가능)
// 2025-Jan-19: Vimeo 비디오 재생 
//    1) 비디오를 Vimeo에 저장 후 url로 재생
//    2) vimeo API 사용
//    3) video는 p5.js 캔버스를 사용하지 않고 HTML5 IFrame을 사용하여 재생. 따라서 3D 적용이 안됨
//    4) 문제점: 처음에 UI가 나오는 문제


let img; // 그림 이미지 변수
let img2; // 그림 이미지 변수
let img3; // 그림 이미지 변수
let bgImg; // 배경 이미지 변수
let minCanvas;
let myFont;
let pgw;  // 텍스쳐 길이
let pgh;  // 텍스쳐 높이

let picFrame; // 픽쳐 프레임 3d model
let scaleFactor; // 모델 크기 조정 변수
let bbox; // 모델 바운딩 박스 변수
let minBbox; // 모델 바운딩 박스 최소값 변수
let videoSize = 1; // 비디오 크기 비율
let blurredTexture; // 블러 이미지 텍스처

function preload() {
  //picFrame = loadModel('assets/3dmodel/picture frame.obj', true);
  picFrame = loadModel('assets/3dmodel/픽쳐프레임.obj', true);  
  // 500x500 크기의 그림 이미지를 로드
  img = loadImage("assets/image/pexels-vlado-paunovic-1567547-9445935-sm.jpg"); 
  img2 = loadImage("assets/3dmodel/Plastic008_2K_Roughness.jpg"); 
  img3 = loadImage("assets/3dmodel/Plastic008_2K_White_Color.jpg"); 
  bgImg = loadImage("assets/image/wood-2045379_1920.jpg");
  frameTexture = loadImage("assets/image/6456.jpg");
  myFont = loadFont("assets/font/해수체L.ttf");  //HSWinter.ttf
}  // preload() END

function setup() {
  minCanvas = min(windowWidth, windowHeight);
  let canva = createCanvas(windowWidth, windowHeight, WEBGL);
  // 1. Calculate the bounding box of the model
  bbox = calculateBoundingBox(picFrame);
  // 2. Calculate the scale factor
  scaleFactor = calculateScaleFactor(bbox, width, height);
  minBbox = min(bbox.width, bbox.height);

   noScroll(); // 스크롤 금지. 스크롤바 생기는 것 방지
  // console.log('Bounding Box:', bbox, minBbox);
  // console.log('Scale Factor:', scaleFactor);

  // 텍스트 
  // 고밀도 렌더링
  pixelDensity(3); 
  // 텍스처 필터링 설정
  textureWrap(REPEAT);
  textureMode(NORMAL);
  noStroke(); // 선 없음

  // 2D 캔버스 생성 후 텍스트 사용시 절차
  // 0) createGraphics는 push, pop내에 translate()에 의해 좌표 이동 함!!!
  // 1) createGraphics 크기를 캔버스에 비례하여 지정
  // 2) createGraphics 의 좌표 중심은 top, left가 0, 0 원점 기준임
  // 3) 그래서 text(string, x, y)에서 x, y의 원점은 default로 createGraphics 따라 감 
  // 4) 따라서 text(string, x, y)에서 x, y를 pg.width/2, pg.height/2로 해야 함
  // 5) 그러므로 textAlign() 함수에서 사용되는 파라미터는 text 중심 기준으로 설정 됨을 주의 
  // 6) 폰트에 따라 다른 높이 위치를 미세 조정으로 해야 함.
  // 7) Align 파라미터: 기본값은 (LEFT, BASELINE) 
  //    좌우 정렬: LEFT, CENTER, RIGHT / 높이 정렬: TOP, CENTER, BOTTOM, BASELINE
  // 8) createGraphics로 그린 후 plane에 텍스쳐로 레스터라이즈 하므로 2개의 크기를 맞춰야 정상.
  //    다르면 찌그러지거나 강제로 당겨진 듯하게 표시 됨.

  let scaleFontFactor = map(width / height, 0.5, 2, 0.015, 0.02, true); // 화면 비율에 따라 폰트 비율 조정
  let baseFontSize = min(width, height) * scaleFontFactor;
  let aspectRatio = innerWidth*innerHeight/1;
  console.log("font size: ", baseFontSize, aspectRatio);

  pgw = bbox.width*scaleFactor*0.8;  //좌우 여백 고려. 3d 모델 설정과 동일하게 가야 함
  pgh = baseFontSize+15;  // 베이스라인 고려
  
  pg = createGraphics(pgw, pgh);
  //pg.background(100);  // 배경 색상
  pg.textFont(myFont);
  pg.textSize(baseFontSize);
  pg.fill(255);  // 글자 색상
  pg.textAlign(CENTER, CENTER);  // BASELINE 폰트 얼라인먼트. text()의 x, y 중심 기준으로 배치 주의
  pg.text("LOST IN WHITE,  by 김주원 작가", pgw/2, pgh/2);  // 폰트 종류에 따라 textAlign과 함께 미세 조정 필요
  // pg.textSize(28);
  // pg.fill(255, 255, 0);  // 글자 색상
  // pg.text("모든 가정에 건강과 행복이 깃들기를 기원드립니다...!", pgw/2, pgh/2+60);


  // 비디오 재생 : iFrame 방식
  let iframe = createDiv(`
    <iframe 
      src="https://player.vimeo.com/video/1048151282?muted=1&autoplay=1&quality=1080p?controls=0&dnt=1"  
      frameborder="0" 
      allow="autoplay;">
    </iframe>
  `);

  // iFrame 크기 설정
  
  let iframeWidth =  minBbox*scaleFactor*videoSize*1.3; 
  let iframeHeight =  minBbox*scaleFactor*videoSize*0.963; 

  let iframeElement = iframe.elt.querySelector('iframe');
  iframeElement.style.width = `${iframeWidth}px`;
  iframeElement.style.height = `${iframeHeight}px`;

  // iFrame 위치 설정 - 중앙 배치
  iframe.position((windowWidth - iframeWidth) / 2, (windowHeight - iframeHeight) / 2);

  // Vimeo Player API 초기화
  player = new Vimeo.Player(iframe.elt.querySelector('iframe'));

  // Loop 설정
  player.setLoop(true).then(() => {
    console.log("Loop 활성화");
  }).catch((error) => {
    console.error("Loop 설정 실패:", error);
  });

}
// setup() END


function draw() {
  //orbitControl(); // 마우스로 회전 및 확대/축소 가능
  //background(bgImg); // 어두운 배경
  background(180); // 40

  // 360도 주변광 설정
  ambientLight(160);

  // 특정 방향에서 오는 조명 추가
  let dirLight = 255;
  let pLight = 300;
  directionalLight(dirLight, dirLight, dirLight, 1, 1, -1);
  pointLight(pLight, pLight, pLight, 1, 1, 1);

// 3d 모델 picture frame 로드
  push();
    //rotateX(PI/2);
    scale(scaleFactor*0.87, scaleFactor*1);  // 양 옆으로 약간의 공간이 있도록 크기 줄임(0.9)
    model(picFrame); 
    //console.log(scale(scaleFactor*0.9, scaleFactor*1));
  pop();

  
  push();
    let aa = (bbox.height*scaleFactor)*0.46;
    //console.log("aa: ", aa, height, bbox.height*scaleFactor);
    translate(0, aa, 110);  //minBbox*scaleFactor*videoSize*0.7  / bbox.height*1.4
    texture(pg);
    plane(pgw, pgh); // 텍스트가 그려진 평면
  pop();

}  // draw() END

function titleText() {
  // 텍스처로 제목, 작가명 적용
  push();
    translate(0, 0, 110);  //minBbox*scaleFactor*videoSize*0.7
    scale(0.4);
    //console.log("mmm: ", height, minBbox*scaleFactor*videoSize*0.5, height);
    texture(pg);
    plane(pgw, pgh); // 텍스트가 그려진 평면
  pop();
}

function calculateBoundingBox(model) {
  let vertices = model.vertices;
  if (!vertices) {
    console.error('Model does not contain vertices.');
    return null;
  }

  let Infinity = 999999999;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < vertices.length; i += 3) {
    let x = vertices[i];
    let y = vertices[i + 1];
    let z = vertices[i + 2];

    // y, y, z는 객체이므로 x.x, y.y, z.z로 접근
    if (x.x < minX) minX = x.x;
    if (x.x > maxX) maxX = x.x;

    if (y.y < minY) minY = y.y;
    if (y.y > maxY) maxY = y.y;

    if (z.z < minZ) minZ = z.z;
    if (z.z > maxZ) maxZ = z.z;
    //console.log("xyz: ", i, x, y, z);
    //console.log("minmax: ", minX, maxX, minY, maxY, minZ, maxZ);
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
    minX, maxX, minY, maxY, minZ, maxZ
  };
}

function calculateScaleFactor(bbox, canvasWidth, canvasHeight) {
  let modelMaxDimension = max(bbox.width, bbox.height, bbox.depth);  // depth 무시. 
  let canvasMinDimension = min(canvasWidth, canvasHeight);
  //console.log('Model Max Dimension:', modelMaxDimension, canvasMinDimension);
  return canvasMinDimension / modelMaxDimension;
}

function noScroll() {
  document.body.style.overflow = 'hidden';
}