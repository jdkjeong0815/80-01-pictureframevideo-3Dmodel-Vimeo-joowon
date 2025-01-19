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

    if (x.x < minX) minX = x.x;
    if (x.x > maxX) maxX = x.x;

    if (y.y < minY) minY = y.y;
    if (y.y > maxY) maxY = y.y;

    if (z.z < minZ) minZ = z.z;
    if (z.z > maxZ) maxZ = z.z;
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
    minX, maxX, minY, maxY, minZ, maxZ
  };
}

function calculateScaleFactor(bbox, canvasWidth, canvasHeight) {
  let modelMaxDimension = max(bbox.width, bbox.height, bbox.depth);
  let canvasMinDimension = min(canvasWidth, canvasHeight);
  return canvasMinDimension / modelMaxDimension;
}

function setupVimeo(minBbox, scaleFactor, videoSize) {
  let iframe = createDiv(`
    <iframe 
      src="https://player.vimeo.com/video/752422133?muted=1&autoplay=1&quality=1080p?controls=0&dnt=1"  
      frameborder="0" 
      allow="autoplay;">
    </iframe>
  `);
  
 //   https://player.vimeo.com/video/752422133  [Commercial] LG(엘지) OLED_The Black 4K HDR
 //   https://player.vimeo.com/video/1048151282 김주원 작가

 

  let iframeWidth = minBbox * scaleFactor * videoSize * 1.3; 
  let iframeHeight = minBbox * scaleFactor * videoSize * 0.963; 

  let iframeElement = iframe.elt.querySelector('iframe');

  iframeElement.style.width = `${iframeWidth}px`;
  iframeElement.style.height = `${iframeHeight}px`;

  iframe.position((windowWidth - iframeWidth) / 2 - 2, (windowHeight - iframeHeight) / 2);

  let player = new Vimeo.Player(iframe.elt.querySelector('iframe'));

  player.setLoop(true).then(() => {
    console.log("Loop 활성화");
  }).catch((error) => {
    console.error("Loop 설정 실패:", error);
  });
}

function setupLighting() {
  ambientLight(160);
  directionalLight(255, 255, 255, 1, 1, -1);
  pointLight(300, 300, 300, 1, 1, 1);
}

function drawModel(modelObj, scaleFactor) {
  push();
  scale(scaleFactor * 0.87, scaleFactor * 1);
  model(modelObj); 
  pop();
}

function setupText() {
  let scaleFontFactor = map(width / height, 0.5, 2, 0.015, 0.02, true);
  let baseFontSize = min(width, height) * scaleFontFactor;
  let aspectRatio = innerWidth * innerHeight / 1;
  console.log("font size: ", baseFontSize, aspectRatio);

  pgw = bbox.width * scaleFactor * 0.8;
  pgh = baseFontSize + 15;
  
  pg = createGraphics(pgw, pgh);
  pg.textFont(myFont);
  pg.textSize(baseFontSize);
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.text("LOST IN WHITE,  by 김주원 작가", pgw / 2, pgh / 2);
}

function drawText(bbox, scaleFactor, pgw, pgh, pg) {
  push();
  let aa = (bbox.height * scaleFactor) * 0.46;
  translate(0, aa, 110);
  texture(pg);
  plane(pgw, pgh);
  pop();
}
