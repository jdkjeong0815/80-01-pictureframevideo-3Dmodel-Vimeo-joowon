// =============================================================================
// 프로그램 : 80-01-pictureframevideo-3Dmodel-Vimeo-joowon
// Created : 2025-Jan-14
// 작가 : jdk                    Inspiration : 비디오 : LOST IN WHITE,  김주원 작가
// Github : https://github.com/jdkjeong0815/80-01-pictureframevideo-3Dmodel-Vimeo-joowon
// Web : https://jdkjeong0815.github.io/80-01-pictureframevideo-3Dmodel-Vimeo-joowon/
// 작품 설명 : 흰 설경을 주제로 한 김주원 작가의 작품을 흰색 3D 모델 액자에 넣어 비디오로 재생하는 작품
  // 김주원 작가 : https://www.instagram.com/photographer_kimjoowon/?hl=en
  // 한 비디오를 반복 재생 함
  // 화면 위의 컨트롤 아이콘들은 vimeo 비용 지불해야 함
// 라이브러리 기능 : jdklib.js / 풀 스크린 모드 삭제(움직이면 화면과 비디오 위치가 틀어지는 현상 때문)
// Last Update : 
// 2025-Jan-19 요약 : Vimeo 비디오 재생
//  - 1) 비디오를 Vimeo에 저장 후 url로 재생
//    2) vimeo API 사용
//    3) video는 p5.js 캔버스를 사용하지 않고 HTML5 IFrame을 사용하여 재생. 따라서 3D 적용이 안됨
//    4) 문제점: 처음에 UI가 나오는 문제 
// 2024-Dec-24 : 3D 액자 모델 + Vimeo 비디오
  // 기기에 관계 없이 센터 중심으로 정렬되어 보이도록 함.(세로 모드는 안됨)
  // 3d 모델의 크기는 화면 크기에 비례, 비디오 화면 크기는 3d 모델 크기에 맞춰 조정
  // 비디오는 iframe을 사용하여 재생
  // 터치 후 비디오 재생이 되도록 함(자동 재생은 크롬 정책상 불가능)
  // 라이브러리 기능 : jdklib.js
  // 주기적인 리로드 : 매  ??초마다 리로드  
// =============================================================================

let saveFileName = "80-01-pictureframevideo-3Dmodel-Vimeo-joowon";
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
  noScroll();
  minCanvas = min(windowWidth, windowHeight);
  let canva = createCanvas(windowWidth, windowHeight, WEBGL);
  bbox = calculateBoundingBox(picFrame);
  scaleFactor = calculateScaleFactor(bbox, width, height);
  minBbox = min(bbox.width, bbox.height);

  setupText();
  setupVimeo(minBbox, scaleFactor, videoSize);

  // Ensure WebGL context is properly set up
  // canva.parent('canvas-container');
  noStroke(); // Ensure no stroke for the 3D model
}  // setup() END

function draw() {
  background(180);  // 배경색. 비디오 분위기와 맞추기 위해 회색으로 설정
  setupLighting();
  drawModel(picFrame, scaleFactor);  // Updated to use modelObj parameter name
  drawText(bbox, scaleFactor, pgw, pgh, pg);
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

