let currentScreen = 0; 
let redCircleCursor = false; 

// Zmienne na czcionki
let fontHeadline; 

// Ekran 1
let screen1Lines = []; 
let screen1Text = "ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY"; 
let lineCount = 17;
let currentLineIndex = 0; 

// Ekran 2
let screen2Texts = ["DOSWIADCZ DESIGNU ", " STWORZ WIZJE PRZYSZLOSCI ", "ROZPOCZNIJ TRANSFORMACJE "];
let screen2Positions = [0, 0, 0];
let screen2Line3Stopped = false; 

// Ekran 3, 4, 5 (Pozycje przewijanych pasków)
let headerPositions = { 3: 0, 4: 0, 5: 0 };
let screen3Price = 5001; 

// Ekran 4
let auras = [];

// Ekran 5
let speechRec; 
let spokenText = ""; 
let isRecording = false;
let hasSpoken = false; 
let btnDostarcz = { x: 0, y: 0, w: 250, h: 70 }; 

let imgPlus, imgMinus, imgArrows, imgMic;

function usunPolskieZnaki(text) {
  let tekstBezL = text.replace(/Ł/g, "L").replace(/ł/g, "l");
  return tekstBezL.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function preload() {
  imgPlus = loadImage('Plusy.svg');
  imgMinus = loadImage('Minusy.svg');
  imgArrows = loadImage('Strzalki.svg');
  imgMic = loadImage('Mikrofon.svg'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateDynamicPositions();

  // Inicjalizacja Ekranu 1
  for (let i = 0; i < lineCount; i++) {
    screen1Lines.push({ x: 0, y: (height / lineCount) * i + (height / lineCount) / 2, stopped: false });
  }

  // Inicjalizacja Ekranu 4 przy użyciu proporcji
  auras = [
    { text: "AURA", pctX: 750/1200, pctY: 220/675, baseColor: [250, 70, 50], currentSize: 70, defaultSize: 70 },
    { text: "AURA", pctX: 140/1200, pctY: 400/675, baseColor: [230, 255, 0], currentSize: 60, defaultSize: 60 },
    { text: "AURA", pctX: 480/1200, pctY: 320/675, baseColor: [255, 180, 0], currentSize: 65, defaultSize: 65 },
    { text: "AURA", pctX: 420/1200, pctY: 480/675, baseColor: [0, 255, 255], currentSize: 55, defaultSize: 55 },
    { text: "AURA", pctX: 800/1200, pctY: 400/675, baseColor: [0, 255, 50], currentSize: 60, defaultSize: 60 },
    { text: "AURA", pctX: 550/1200, pctY: 620/675, baseColor: [200, 50, 255], currentSize: 65, defaultSize: 65 },
    { text: "AURA", pctX: 850/1200, pctY: 550/675, baseColor: [50, 100, 255], currentSize: 55, defaultSize: 55 }
  ];

  // Inicjalizacja Web Speech API
  let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    speechRec = new SpeechRecognition();
    speechRec.lang = 'pl-PL'; 
    speechRec.interimResults = true; 
    
    speechRec.onstart = () => { isRecording = true; spokenText = "Slucham..."; hasSpoken = false; };
    speechRec.onresult = (e) => {
      let rawTranscribedText = e.results[e.resultIndex][0].transcript;
      spokenText = usunPolskieZnaki(rawTranscribedText);
      hasSpoken = true; 
    };
    speechRec.onend = () => { isRecording = false; if (spokenText === "Slucham...") spokenText = ""; };
  } else {
    spokenText = "Brak obslugi mikrofonu w przeglądarce.";
  }
}

function updateDynamicPositions() {
  btnDostarcz.x = width / 2;
  btnDostarcz.y = height * (620 / 675);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDynamicPositions();
  
  for (let i = 0; i < screen1Lines.length; i++) {
    screen1Lines[i].y = (height / lineCount) * i + (height / lineCount) / 2;
    if (screen1Lines[i].stopped) {
      push();
      textFont('beastly');
      textSize((height / lineCount) + 20);
      screen1Lines[i].x = width - textWidth(screen1Text);
      pop();
    }
  }
}

function draw() {
  noCursor();
  switch (currentScreen) {
    case 0: drawScreen1(); break;
    case 1: drawScreen2(); break;
    case 2: drawScreen3(); break;
    case 3: drawScreen4(); break;
    case 4: drawScreen5(); break;
    case 5: drawScreenHostile(); break; 
    case 6: drawScreen6(); break; 
    case 7: drawScreen7(); break; 
  }

  fill(redCircleCursor ? [255, 0, 0] : [57, 255, 20]);
  noStroke();
  ellipse(mouseX, mouseY, 30, 30);
}

function drawScrollingHeader(txt, screenKey, speed, yPos, size, col, dir = -1) {
  textSize(size);
  let w = textWidth(txt);
  
  headerPositions[screenKey] += speed * dir;
  if (dir === 1 && headerPositions[screenKey] >= w) headerPositions[screenKey] = 0;
  if (dir === -1 && headerPositions[screenKey] <= -w) headerPositions[screenKey] = 0;
  
  fill(col);
  text(txt.repeat(15), dir === 1 ? headerPositions[screenKey] - w : headerPositions[screenKey], yPos);
}

function drawScreen1() {
  background(130, 20, 10); 
  textFont('beastly'); 
  textSize((height / lineCount) + 20); 
  textStyle(BOLD);
  textAlign(LEFT, CENTER); 

  let tWidth = textWidth(screen1Text);
  let targetX = width - tWidth;

  for (let i = 0; i < screen1Lines.length; i++) {
    fill(i % 2 === 0 ? [250, 70, 70] : [255, 180, 180]);
    if (screen1Lines[i].x === 0 && !screen1Lines[i].stopped) screen1Lines[i].x = -tWidth;
    text(screen1Text, screen1Lines[i].x, screen1Lines[i].y);
  }

  if (currentLineIndex < lineCount) {
    let currentLine = screen1Lines[currentLineIndex];
    let dx = targetX - currentLine.x;
    
    currentLine.x += dx * 0.12; 
    
    if (abs(targetX - currentLine.x) < 0.5) {
      currentLine.x = targetX; 
      currentLine.stopped = true; 
      currentLineIndex++; 
    }
  } else {
    currentScreen = 1; 
  }
}

function drawScreen2() {
  background(10, 10, 50); 
  textFont('beastly'); 
  textSize((height / 3) + 110); 
  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  noStroke();

  let w = screen2Texts.map(t => textWidth(t));

  screen2Positions[0] = (screen2Positions[0] + 3) % w[0];
  fill(160, 160, 255);
  text(screen2Texts[0].repeat(15), screen2Positions[0] - w[0], (height / 6) + 22);

  screen2Positions[1] -= 4;
  if (screen2Positions[1] <= -w[1]) screen2Positions[1] = 0;
  text(screen2Texts[1].repeat(15), screen2Positions[1], (height / 2) + 22);
  
  if (!screen2Line3Stopped) screen2Positions[2] = (screen2Positions[2] + 5) % w[2];
  fill(255, 100, 150);
  text(screen2Texts[2].repeat(15), screen2Positions[2] - w[2], (height * 5 / 6) + 20);
  
  let text3Y = (height * 5 / 6) + 20;
  screen2Line3Stopped = (mouseY >= text3Y - height / 6 && mouseY <= text3Y + height / 6);
  redCircleCursor = screen2Line3Stopped;
}

function drawScreen3() {
  background(255, 70, 70); 
  textFont('beastly'); 
  textAlign(LEFT, TOP);
  textStyle(BOLD);

  drawScrollingHeader("ROZPOCZNIJ TRANSFORMACJE ", 3, 4, -50, height * 2 / 3, [100, 20, 20], -1);

  textAlign(RIGHT, TOP);
  textSize(height / 16);
  fill(160, 160, 255);
  text("WALUTY", width - 20, height / 3 + 15); 
  
  textSize(height / 9);
  text(screen3Price, width - 30 - textWidth("WALUTY"), height / 3 - 10); 

  image(imgPlus, 35, height - 200, 90, 90);
  image(imgMinus, 35, height - 100, 90, 90);
  image(imgArrows, width - 150, height - 200, 105, 176);
}

function drawScreen4() {
  background(255, 102, 178); 
  textFont('beastly'); 
  textAlign(LEFT, TOP);
  
  drawScrollingHeader("ROZPOCZNIJ PLATNOSC ", 4, 5, 5, 140, [60, 10, 10], -1);

  textSize(90);
  text("METODA PLATNOSCI", 40, 140);

  textAlign(CENTER, CENTER);
  redCircleCursor = false;

  for (let aura of auras) {
    let auraX = width * aura.pctX;
    let auraY = height * aura.pctY;

    textSize(aura.currentSize);
    let tw = textWidth(aura.text), th = aura.currentSize * 0.8;
    let isHovering = mouseX > auraX - tw / 2 && mouseX < auraX + tw / 2 && mouseY > auraY - th / 2 && mouseY < auraY + th / 2;
    
    if (isHovering) {
      redCircleCursor = true;
      aura.currentSize = lerp(aura.currentSize, aura.defaultSize * 1.5, 0.1);
      fill(map(sin(frameCount * 0.1), -1, 1, 100, 255), map(cos(frameCount * 0.13), -1, 1, 100, 255), map(sin(frameCount * 0.17), -1, 1, 100, 255));
    } else {
      aura.currentSize = lerp(aura.currentSize, aura.defaultSize, 0.1);
      fill(aura.baseColor);
    }
    text(aura.text, auraX, auraY);
  }
}

function drawScreen5() {
  background(135, 145, 255); 
  textFont('beastly'); 
  textAlign(LEFT, TOP);
  
  drawScrollingHeader("WYSYLKA ", 5, 3, -15, 180, '#b9c3ff', -1);
  
  fill('#b9c3ff');
  textSize(45);
  textAlign(CENTER, CENTER);
  text("POWIEDZ GDZIE DOSTARCZYC", width / 2, height / 2 - 160);
  image(imgMic, width / 2 - 65, height / 2 - 109.5, 130, 219);

  if (spokenText !== "") {
    textSize(36);
    text(spokenText, width / 2, height / 2 + 140);
  }

  redCircleCursor = false;
  if (hasSpoken && !isRecording) {
    if (mouseX > btnDostarcz.x - btnDostarcz.w / 2 && mouseX < btnDostarcz.x + btnDostarcz.w / 2 && mouseY > btnDostarcz.y - btnDostarcz.h / 2 && mouseY < btnDostarcz.y + btnDostarcz.h / 2) {
      redCircleCursor = true;
    }
    textSize(40);
    text("DOSTARCZ", btnDostarcz.x, btnDostarcz.y - 5); 
  }
}

// EKRAN 5: HOSTILE DESIGNU
function drawScreenHostile() {
  background('#040849'); 
  noStroke();
  
  // Narożnik geometryczny
  fill('#ff564c');
  rect(width - 380, 0, 380, 110);  
  rect(width - 140, 0, 140, 350);  

  textFont('Montserrat');
  textAlign(LEFT, TOP);

  // Cyfra "1."
  textSize(150);
  textStyle(BOLD); 
  fill('#ff564c');
  text("1.", 60, 30);

  // Główny blok tekstu
  textSize(100);
  textStyle(BOLD); 
  fill('#8d99ff'); 
  
  let startY = 200; 
  let lineSpacing = 115; 
  
  text("Właśnie", 60, startY);
  text("doświadczyłaś/eś", 60, startY + lineSpacing);
  text("cyfrowego", 60, startY + lineSpacing * 2);

  // Fraza dolna
  fill('#ff564c');
  let hostileY = startY + lineSpacing * 3 + 15;
  text("Hostile Designu.", 60, hostileY);

  // ZUNIFIKOWANE CZERWONE STRZAŁKI NAWIGACJI
  textSize(110);
  textAlign(RIGHT, BOTTOM);
  textStyle(BOLD);
  
  fill('#ff564c'); 
  text(">", width - 140, height - 35);
  fill('#ff564c'); 
  text(">", width - 50, height - 35);

  // Zunifikowana detekcja kolizji myszy
  if (mouseX > width - 240 && mouseX < width - 40 && mouseY > height - 150 && mouseY < height - 30) {
    redCircleCursor = true;
  } else {
    redCircleCursor = false;
  }
}

// EKRAN 6: PUNKT 2 (PRZYCIĘTE "H" + MARGINES + CZERWONE STRZAŁKI)
function drawScreen6() {
  background('#040849'); 
  noStroke();

  // STYLIZOWANE PRZYCIĘTE "H"
  fill('#8d99ff');
  rect(width - 240, 0, 100, height);
  rect(width - 70, 0, 70, height);
  rect(width - 240, height / 2 - 40, 240, 80);

  textFont('Montserrat');
  textAlign(LEFT, TOP);
  textStyle(BOLD);

  // Cyfra "2."
  textSize(150);
  fill('#ff564c');
  text("2.", 60, 30);

  // Blok opisowy (Dostosowany margines na dole)
  textSize(46);
  fill('#8d99ff');
  
  let sY = 190;      
  let sSpace = 46;   
  
  text("Dla wprawnego użytkownika", 60, sY);
  text("ten interfejs był tylko małą", 60, sY + sSpace);
  text("przeszkodą. Jednak dla osób", 60, sY + sSpace * 2);
  
  // Wyróżnienie "małokomputerowych"
  fill('#ff564c');
  text('"małokomputerowych"', 60, sY + sSpace * 3);
  
  fill('#8d99ff');
  let offsetW = textWidth('"małokomputerowych" ');
  text("brak", 60 + offsetW, sY + sSpace * 3);
  
  text("etykiet tekstowych,", 60, sY + sSpace * 4);
  text("niejednoznaczne ikony", 60, sY + sSpace * 5);
  text("i presja ze strony systemu", 60, sY + sSpace * 6);
  
  text("są ", 60, sY + sSpace * 7);
  fill('#ff564c');
  let sąW = textWidth("są ");
  text("barierą nie do przejścia.", 60 + sąW, sY + sSpace * 7);

  // ZUNIFIKOWANE CZERWONE STRZAŁKI NAWIGACJI
  textSize(110);
  textAlign(RIGHT, BOTTOM);
  
  fill('#ff564c'); 
  text(">", width - 140, height - 35);
  fill('#ff564c'); 
  text(">", width - 50, height - 35);

  // Zunifikowana detekcja kolizji myszy
  if (mouseX > width - 240 && mouseX < width - 40 && mouseY > height - 150 && mouseY < height - 30) {
    redCircleCursor = true;
  } else {
    redCircleCursor = false;
  }
}

// EKRAN 7: PUNKT 3 (DOPASOWANY TEKST + BRAK NIEBIESKIEJ STRZAŁKI)
function drawScreen7() {
  background('#040849');
  noStroke();

  // Konstrukcja wielkiego czerwonego grota po prawej stronie
  fill('#ff564c');
  beginShape();
  vertex(width, 0);
  vertex(width - 320, 0);
  vertex(width, 320);
  endShape(CLOSE);

  beginShape();
  vertex(width, height);
  vertex(width - 550, height);
  vertex(width, height - 550);
  endShape(CLOSE);

  textFont('Montserrat');
  textAlign(LEFT, TOP);
  textStyle(BOLD);

  // Cyfra "3."
  textSize(150);
  fill('#ff564c');
  text("3.", 60, 30);

  // Treść akapitu
  textSize(44); 
  fill('#8d99ff');
  
  let sY = 200;
  let sSpace = 48; 

  text("Minimalizm", 60, sY);
  text("w projektowaniu często", 60, sY + sSpace);
  text("nie służy użyteczności,", 60, sY + sSpace * 2);
  text("buduje elitaryzm i generuje", 60, sY + sSpace * 3);
  
  // Wyróżnienie "wykluczenie społeczne,"
  fill('#ff564c');
  text("wykluczenie społeczne,", 60, sY + sSpace * 4);
  
  fill('#8d99ff');
  text("wywołując u starszych", 60, sY + sSpace * 5);
  text("lub niewprawnych", 60, sY + sSpace * 6);
  text("technicznie osób ", 60, sY + sSpace * 7);
  
  fill('#ff564c');
  let tW1 = textWidth("technicznie osób ");
  text("wstyd,", 60 + tW1, sY + sSpace * 7);
  
  text("lęk i zrezygnowanie.", 60, sY + sSpace * 8);

  redCircleCursor = false;
}

function mousePressed() {
  if (currentScreen === 1 && redCircleCursor) {
    currentScreen = 2;
    redCircleCursor = false;
  } 
  else if (currentScreen === 2) {
    if (mouseX >= 35 && mouseX <= 125) {
      if (mouseY >= height - 200 && mouseY <= height - 110) screen3Price++;
      if (mouseY >= height - 100 && mouseY <= height - 10) screen3Price--;
    }
    if (mouseX >= width - 150 && mouseX <= width - 45 && mouseY >= height - 200 && mouseY <= height - 24) {
      currentScreen = 3; 
    }
  } 
  else if (currentScreen === 3) {
    textFont('beastly');
    for (let aura of auras) {
      let auraX = width * aura.pctX;
      let auraY = height * aura.pctY;
      textSize(aura.currentSize);
      if (mouseX > auraX - textWidth(aura.text) / 2 && mouseX < auraX + textWidth(aura.text) / 2 && mouseY > auraY - aura.currentSize * 0.4 && mouseY < auraY + aura.currentSize * 0.4) {
        currentScreen = 4; 
        redCircleCursor = false;
        break;
      }
    }
  } 
  else if (currentScreen === 4) {
    if (mouseX >= width / 2 - 65 && mouseX <= width / 2 + 65 && mouseY >= height / 2 - 110 && mouseY <= height / 2 + 109) {
      if (speechRec && !isRecording) {
        try { speechRec.start(); } catch(e) { console.error(e); }
      }
    }
    if (hasSpoken && !isRecording && mouseX >= btnDostarcz.x - btnDostarcz.w / 2 && mouseX <= btnDostarcz.x + btnDostarcz.w / 2 && mouseY >= btnDostarcz.y - btnDostarcz.h / 2 && mouseY <= btnDostarcz.y + btnDostarcz.h / 2) {
      currentScreen = 5; 
      redCircleCursor = false;
    }
  }
  // Zunifikowana strefa kliknięcia dla Ekranu 5 -> Przejście do 6
  else if (currentScreen === 5) {
    if (mouseX > width - 240 && mouseX < width - 40 && mouseY > height - 150 && mouseY < height - 30) {
      currentScreen = 6; 
      redCircleCursor = false;
    }
  }
  // Zunifikowana strefa kliknięcia dla Ekranu 6 -> Przejście do 7
  else if (currentScreen === 6) {
    if (mouseX > width - 240 && mouseX < width - 40 && mouseY > height - 150 && mouseY < height - 30) {
      currentScreen = 7; 
      redCircleCursor = false;
    }
  }
}