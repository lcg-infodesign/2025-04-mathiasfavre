let table;
let worldMap;
let volcanoes = [];
let tooltip = null;

let currentView = "map";   // "map" oppure "detail"
let selectedVolcano = null;

let mapX = 50;
let mapY = 200;
let mapW;
let mapH;

let eruptionColors = {
  "D1": "#ff0008", // 1964 or later
  "D2": "#ff6600",
  "D3": "#ff9900",
  "D4": "#ffcc00",
  "D5": "#ffff00",
  "D6": "#aaff00",
  "D7": "#55ff55",
  "U":  "#55aaff",
  "Q":  "#9999ff",
  "?":  "#cccccc",
  "Unknown": "#888888"
};

let eruptionLabels = [
  { code: "D1", label: "1964 or later" },
  { code: "D2", label: "1900–1963" },
  { code: "D3", label: "1800–1899" },
  { code: "D4", label: "1700–1799" },
  { code: "D5", label: "1500–1699" },
  { code: "D6", label: "A.D. 1–1499" },
  { code: "D7", label: "B.C. (Holocene)" },
  { code: "U",  label: "Undated, probable Holocene" },
  { code: "Q",  label: "Quaternary hydrothermal" },
  { code: "?",  label: "Uncertain Holocene" },
  { code: "Unknown", label: "Unknown" }
];

function preload() {
  // Carica il dataset
  table = loadTable("data/volcanoes-2025-10-27 - Es.3 - Original Data.csv", "csv", "header");
  worldMap = loadImage("data/mappamondo.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight+200);
  imageMode(CORNER);
  computeMapSize();
  loadVolcanoes();
}

function computeMapSize() {
  // Mantieni il rapporto originale della mappa
  let mapAspect = worldMap.width / worldMap.height;
  let availableW = 1100;
  let availableH = windowHeight - 100;
  if (availableW / availableH > mapAspect) {
    mapH = availableH;
    mapW = availableH * mapAspect;
  } else {
    mapW = availableW;
    mapH = availableW / mapAspect;
  }
}

function loadVolcanoes() {
  volcanoes = [];
  for (let r = 0; r < table.getRowCount(); r++) {
    let lat = float(table.getString(r, 'Latitude'));
    let lon = float(table.getString(r, 'Longitude'));
    let elev = float(table.getString(r, 'Elevation (m)'));
    let name = table.getString(r, 'Volcano Name');
    let country = table.getString(r, 'Country');
    let location = table.getString(r, 'Location');
    let type = table.getString(r, 'Type');
    let category = table.getString(r, 'TypeCategory');
    let status = table.getString(r, 'Status');
    let lastEruption = table.getString(r, 'Last Known Eruption');

    if (!eruptionColors[lastEruption]) lastEruption = "Unknown";

    let x = map(lon, -180, 180, mapX -30, mapX + mapW-30);
    let y = map(lat, 90, -90, mapY -20, mapY + mapH);

    volcanoes.push({x, y, elev, name, country, location, type, category, status, lastEruption, lat, lon});
  }
}

function draw() {
  background(0);

  if (currentView === "map") {
    drawMapView();
  } else {
    drawDetailView();
  }
}

function drawMapView() {
  image(worldMap, mapX, mapY, mapW, mapH);
  tint(255, 130);

  tooltip = null;

  drawTitle();
  drawLegend();

  for (let v of volcanoes) {
    drawVolcano(v);
  }

  if (tooltip) showTooltip(tooltip);
}

function drawVolcano(v) {
  let size = map(v.elev, -7000, 7000, 6, 10);
  let col = eruptionColors[v.lastEruption];
  
  fill(col);
  noStroke();

  push();
  translate(v.x, v.y);
  beginShape();
  vertex(0, -size);
  vertex(-size / 1.5, size / 1.5);
  vertex(size / 1.5, size / 1.5);
  endShape(CLOSE);
  pop();

  // Hover detection
  if (dist(mouseX, mouseY, v.x, v.y) < size) {
    tooltip = v;
  }
}

function showTooltip(v) {
  push();

  // Box di sfondo
  let boxW = 240;
  let boxH = 135;
  fill(0, 200);
  noStroke();
  rect(mouseX + 15, mouseY, boxW, boxH, 10);

  // Titolo (nome del vulcano)
  fill(255);
  textAlign(LEFT, TOP);
  textSize(15);
  textStyle(BOLD);
  text(v.name, mouseX + 25, mouseY + 12);

  // Dati secondari
  textSize(12);
  textStyle(NORMAL);
  let infoY = mouseY + 32; // sposta in basso sotto il titolo
  let info = 
    `Location: ${v.location} (${v.country})
Elevation: ${v.elev} m
Type: ${v.type}
Category: ${v.category}
Status: ${v.status}
Last known eruption: ${v.lastEruption}`;
  text(info, mouseX + 25, infoY);
  pop();
}

function drawTitle() {
  fill("#f78652ff");
  textAlign(LEFT);
  textSize (15);
  textStyle(BOLD);
  text("MATHIAS FAVRE", 50, 50)
  textSize(30);
  textStyle(BOLD);
  text("ASSIGNMENT 4 - VISIONE DI DETTAGLIO", 50, 100);

  textSize(15);
  textStyle(NORMAL);
  textAlign(RIGHT);
  fill(255);
  text("Laboratorio di Computer Grafica per l’Information Design / A.A. 2025-2026", windowWidth - 50, 50)
  
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT);
  fill(255);
  text("Ogni triangolo rappresenta un vulcano nel mondo. Clicca su un vulcano sulla mappa per vederne le informazioni.", 50, 130, 500);
}

function drawLegend() {
  let startX = width - 250;
  let startY = 300;
  
  textAlign(LEFT);
  textSize(15);
  fill(255);
  text("Ultima eruzione conosciuta", startX, startY - 45);
  
  textSize(12);
  let spacing = 25;
  
  for (let i = 0; i < eruptionLabels.length; i++) {
    let item = eruptionLabels[i];
    fill(eruptionColors[item.code]);
    noStroke();
    triangle(startX, startY + i * spacing, startX + 10, startY + i * spacing - 10, startX + 20, startY + i * spacing);
    
    fill(255);
    noStroke();
    text(item.label, startX + 45, startY + i * spacing);
  }
}

function mousePressed() {
  if (currentView === "map") {
    for (let v of volcanoes) {
      let size = map(v.elev, -7000, 7000, 6, 10);
      if (dist(mouseX, mouseY, v.x, v.y) < size) {
        selectedVolcano = v;
        currentView = "detail";
        return;
      }
    }
  } else if (currentView === "detail") {
    // click su pulsante "torna alla mappa"
    if (mouseX > 30 && mouseX < 250 && mouseY > 40 && mouseY < 90) {
      currentView = "map";
      selectedVolcano = null;
    }
  }
}

function drawDetailView() {
  background(0);

  if (!selectedVolcano) return;

  drawBackButton();
  drawDetailText(selectedVolcano);
  drawElevationBar(selectedVolcano);
}

function drawBackButton() {
  fill(255);
  textSize(18);
  noStroke();
  textStyle(BOLD);
  text("← TORNA ALLA MAPPA", 50, 50);
}

function drawDetailText(v) {
  fill("#f78652ff");
  textSize(50);
  textStyle(BOLD);
  text(v.name, 200, 170);

  fill(255);
  textSize(24);
  textStyle(NORMAL);

  let info = `
Location: ${v.location} (${v.country})
Elevation: ${v.elev} m
Type: ${v.type}
Category: ${v.category}
Status: ${v.status}
Last known eruption: ${v.lastEruption}
Latitude: ${v.lat}
Longitude: ${v.lon}
  `;

  text(info, 200, 300);
}

function drawElevationBar(v) {
  let barX = width - 300;
  let barY = 150;
  let barW = 60;
  let barH = 500;

  // --- POSIZIONE DI 0 m ---
  let zeroPos = barY + barH / 2;

  // Disegno il gradiente (blu -> rosso)
  for (let i = 0; i < barH; i++) {
    let t = i / barH;
    let r = lerp(240, 50, t);
    let g = 0;
    let b = lerp(50, 240, t);
    stroke(r, g, b);
    line(barX, barY + i, barX + barW, barY + i);
  }

  // Mappa l'elevazione alla barra
  let minElev = -7000;
  let maxElev = 7000;
  let pos = map(v.elev, minElev, maxElev, barY + barH, barY);

  // Colore del punto in base al gradiente
  let t = map(v.elev, minElev, maxElev, 0, 1);
  let r = lerp(50, 240, t);
  let g = 0;
  let b = lerp(240, 50, t);
  let barColor = color(r, g, b);

  // --- ETICHETTE -7000 e +7000 ---
  noStroke();
  fill(255);
  textSize(18);
  textStyle(BOLD);

  text("+7000 m", barX - 300, barY);
  text("-7000 m", barX - 300, barY + barH);
  text("0m", barX -300, barY + barH /2);

  // Triangolo proporzionale all'altitudine
  let triWidth = 100;
  let triX = barX - 120;

  push();
  fill(eruptionColors[v.lastEruption]);
  noStroke();
  beginShape();
  vertex(triX, pos);
  vertex(triX - triWidth / 2, zeroPos);
  vertex(triX + triWidth / 2, zeroPos);
  endShape(CLOSE);
  pop();

  // --- LINEA DI COLLEGAMENTO TRA BAR E TRIANGOLO ---
  stroke(barColor);
  strokeWeight(3);
  line(barX, pos, triX, pos);

  stroke(255);
  strokeWeight(3);
  line(barX + barW, barY, barX - 200, barY)

  stroke(255);
  strokeWeight(3);
  line(barX + barW, barY + barH, barX - 200, barY + barH)

  stroke(255);
  strokeWeight(3);
  line(barX + barW, barY + barH /2, barX - 200, barY + barH /2)

  // Etichetta dell'altitudine con colore giusto
  fill(barColor);
  noStroke();
  textSize(20);
  textStyle(BOLD);
  text(`${v.elev} m`, barX - 100, pos - 10);
}