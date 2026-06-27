let currentScreen = 0; 
let redCircleCursor = false; 

// Ekran 1
let screen1Lines = []; 
let screen1Text = "ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY ZAKUPY"; 
let lineCount = 17;
let currentLineIndex = 0; 

// Ekran 2
let screen2Texts = ["DOSWIADCZ DESIGNU ", " STWORZ WIZJE PRZYSZLOSCI ", "ROZPOCZNIJ TRANSFORMACJE "];
let screen2Positions = [0, 0, 0];
let screen2Line3Stopped = false; 

// Ekran 3, 4, 5, 6 (Pozycje przewijanych pasków)
let headerPositions = { 3: 0, 4: 0, 5: 0, 6: 0 };
let screen3Price = 5001; 

// Ekran 4 - zmienione na proporcje pctX i pctY względem bazy 1200x675
let auras = [];

// Ekran 5
let speechRec; 
let spokenText = ""; 
let isRecording = false;
let hasSpoken = false; 
let btnDostarcz = { x: 0, y: 0, w: 250, h: 70 }; // Pozycja liczona dynamicznie

// Finałowa wiadomość
let finalMessage = "Właśnie doświadczyłeś/aś cyfrowego 'hostile designu'.\n\nDla wprawnego użytkownika ten interfejs był tylko małą przeszkodą. Jednak dla osób 'małokomputerowych' brak etykiet tekstowych, niejednoznaczne ikony oraz presja ze strony systemu są barierą nie do przejścia.\n\nMinimalizm w projektowaniu często nie służy użyteczności – buduje elityzm i generuje wykluczenie społeczne, wywołując u starszych lub niewprawnych technicznie osób wstyd, lęk i zrezygnowanie.";

let imgPlus, imgMinus, imgArrows, imgMic;

function usunPolskieZnaki(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function preload() {
  imgPlus = loadImage('Plusy.svg');
  imgMinus = loadImage('Minusy.svg');
  imgArrows = loadImage('Strzalki.svg');
  imgMic = loadImage('Mikrofon.svg'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Ustawienie dynamicznych pozycji zależnych od wielkości ekranu
  updateDynamicPositions();

  // Inicjalizacja Ekranu 1
  for (let i = 0; i < lineCount; i++) {
    screen1Lines.push({ x: 0, y: (height / lineCount) * i + (height / lineCount) / 2, stopped: false });
  }

  // Inicjalizacja Ekranu 4 przy użyciu proporcji (oryginalna_pozycja / oryginalny_wymiar)
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
    
    speechRec.onstart = () => { isRecording = true; spokenText = "Słucham..."; hasSpoken = false; };
    speechRec.onresult = (e) => {
      let rawTranscribedText = e.results[e.resultIndex][0].transcript;
      spokenText = usunPolskieZnaki(rawTranscribedText);
      hasSpoken = true; 
    };
    speechRec.onend = () => { isRecording = false; if (spokenText === "Słucham...") spokenText = ""; };
  } else {
    spokenText = "Brak obsługi mikrofonu w przeglądarce.";
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
    // Jeśli linia już skończyła bieg, dopasuj jej pozycję do nowej szerokości ekranu
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
    case 5: drawScreen6(); break;
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

// **********************************************************
// AKTUALIZACJA EKRANU 1: EASING ANIMACJI
// **********************************************************
function drawScreen1() {
  background(130, 20, 10); 
  textFont('beastly'); 
  textSize((height / lineCount) + 20); 
  textStyle(BOLD);
  textAlign(LEFT, CENTER); 

  let tWidth = textWidth(screen1Text);
  let targetX = width - tWidth; // Cel, do którego dąży tekst

  for (let i = 0; i < screen1Lines.length; i++) {
    fill(i % 2 === 0 ? [250, 70, 70] : [255, 180, 180]);
    if (screen1Lines[i].x === 0 && !screen1Lines[i].stopped) screen1Lines[i].x = -tWidth;
    text(screen1Text, screen1Lines[i].x, screen1Lines[i].y);
  }

  if (currentLineIndex < lineCount) {
    let currentLine = screen1Lines[currentLineIndex];
    
    // Obliczanie dystansu do celu
    let dx = targetX - currentLine.x;
    
    // Zwiększanie pozycji o ułamek pozostałego dystansu (0.12 odpowiada za prędkość)
    // Zmniejsz tę wartość (np. do 0.08) dla wolniejszego, bardziej miękkiego ruchu
    currentLine.x += dx * 0.08; 
    
    // Sprawdzenie, czy obiekt zbliżył się wystarczająco blisko celu (próg zatrzaśnięcia)
    if (abs(targetX - currentLine.x) < 0.3) {
      currentLine.x = targetX; 
      currentLine.stopped = true; 
      currentLineIndex++; 
    }
  } else {
    currentScreen = 1; 
  }
}
// **********************************************************

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

function drawScreen6() {
  background(20, 20, 30); 
  textFont('beastly'); 
  textAlign(LEFT, TOP);
  
  drawScrollingHeader("HOSTILE DESIGN ", 6, 3, -15, 180, '#b9c3ff', -1);

  textFont('Helvetica'); 
  textSize(34);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  fill(240); 
  
  rectMode(CENTER);
  text(finalMessage, width / 2, height / 2 + 50, width * 0.75, height * 0.7);
  rectMode(CORNER);
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
    if (mouseX >= width - 150 && width - 45 && mouseY >= height - 200 && mouseY <= height - 24) {
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
}