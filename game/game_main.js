/* =========================
   Gear Puzzle - v1.3
   ========================= */

/* ---------- Canvas ---------- */
const canvas = document.getElementById("drawCircles");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  buildGame();
});

/* ---------- Config ---------- */
const CONFIG = {
  mapCols: 12,
  mapRows: 8,
  minStep: 2,
  maxStep: 4,

  mapArea: {
    left: 60,
    top: 60,
    widthRatio: 0.75,
    heightRatio: 0.6
  },

  trayArea: {
    padding: 20,
    yOffsetFromBottom: 90
  },

  minPixelRadius: 18,
  radiusScale: 8
};

/* ---------- Utils ---------- */
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

/* ---------- Map ---------- */
class GearNode {
  constructor(r, x, y) {
    this.radius = r;
    this.gridX = x;
    this.gridY = y;
  }
}

class GearMap {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.nodes = [];
  }

  generatePath() {
    this.nodes = [];

    let x = 0;
    let y = rand(0, this.rows);

    let lastDir = "right";

    this.nodes.push(new GearNode(2, x, y));

    while (x < this.cols) {
      let dirs = ["right"];

      if (y > 1) dirs.push("up");
      if (y < this.rows - 1) dirs.push("down");

      // reduce jumping arround
      if (lastDir !== "right") dirs = ["right"];

      const dir = dirs[rand(0, dirs.length - 1)];

      const step = rand(CONFIG.minStep, CONFIG.maxStep);

      let nx = x;
      let ny = y;

      if (dir === "right") nx += step;
      if (dir === "up") ny -= step;
      if (dir === "down") ny += step;

      nx = Math.min(this.cols, nx);
      ny = Math.max(0, Math.min(this.rows, ny));

      const r = Math.max(1, step);

      this.nodes.push(new GearNode(r, nx, ny));

      x = nx;
      y = ny;
      lastDir = dir;
    }
  }
}

/* ---------- Piece ---------- */
class CirclePiece {
  constructor({ x, y, r, color, label }) {
    this.x = x;
    this.y = y;

    this.startX = x;
    this.startY = y;

    this.radius = r;
    this.label = label;
    this.color = color;

    this.gridX = null;
    this.gridY = null;

    this.inMap = false;
    this.isDragging = false;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(Math.round(this.label)), this.x, this.y);
  }

  contains(mx, my) {
    const dx = mx - this.x;
    const dy = my - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.inMap = false;
    this.gridX = null;
    this.gridY = null;
  }
}

/* ---------- State ---------- */
let gearMap;
let pieces = [];
let active = null;
let offX = 0;
let offY = 0;

/* ---------- Grid ---------- */
function getRect() {
  return {
    left: CONFIG.mapArea.left,
    top: CONFIG.mapArea.top,
    width: canvas.width * CONFIG.mapArea.widthRatio,
    height: canvas.height * CONFIG.mapArea.heightRatio
  };
}

function gridToPixel(gx, gy) {
  const r = getRect();
  const cw = r.width / CONFIG.mapCols;
  const ch = r.height / CONFIG.mapRows;

  return {
    x: r.left + gx * cw,
    y: r.top + gy * ch
  };
}

function nearestGrid(x, y) {
  const r = getRect();
  const cw = r.width / CONFIG.mapCols;
  const ch = r.height / CONFIG.mapRows;

  let gx = Math.round((x - r.left) / cw);
  let gy = Math.round((y - r.top) / ch);

  gx = Math.max(0, Math.min(CONFIG.mapCols, gx));
  gy = Math.max(0, Math.min(CONFIG.mapRows, gy));

  const p = gridToPixel(gx, gy);
  return { gx, gy, x: p.x, y: p.y };
}

function occupied(gx, gy, ignore) {
  return pieces.some(p =>
    p !== ignore && p.inMap && p.gridX === gx && p.gridY === gy
  );
}

/* ---------- Build ---------- */
function buildGame() {
  gearMap = new GearMap(CONFIG.mapCols, CONFIG.mapRows);
  gearMap.generatePath();

  pieces = [];

  const tray = [];

  gearMap.nodes.forEach((n, i) => {
    const pos = gridToPixel(n.gridX, n.gridY);

    const p = new CirclePiece({
      x: 0,
      y: 0,
      r: Math.max(CONFIG.minPixelRadius, n.radius * CONFIG.radiusScale),
      label: n.radius,
      color: `hsl(${rand(0,360)},70%,60%)`
    });

    p.target = pos;

    if (i === 0 || i === gearMap.nodes.length - 1 || i % 2 === 0) {
      p.x = pos.x;
      p.y = pos.y;
      p.gridX = n.gridX;
      p.gridY = n.gridY;
      p.inMap = true;
    } else {
      tray.push(p);
    }

    pieces.push(p);
  });

  layoutTray(tray);
  draw();
}

/* ---------- Tray ---------- */
function layoutTray(arr) {
  let x = 20;
  const y = canvas.height - 100;

  arr.forEach(p => {
    x += p.radius;
    p.x = x;
    p.y = y;
    p.startX = p.x;
    p.startY = p.y;
    x += p.radius + 10;
  });
}

function inTray(y) {
  return y > canvas.height - 150;
}

/* ---------- Place ---------- */
function place(piece) {
  const n = nearestGrid(piece.x, piece.y);

  if (occupied(n.gx, n.gy, piece)) return false;

  piece.x = n.x;
  piece.y = n.y;
  piece.gridX = n.gx;
  piece.gridY = n.gy;
  piece.inMap = true;
  return true;
}

/* ---------- WIN CHECK ---------- */
function checkWin() {
  const placed = pieces.filter(p => p.inMap);

  if (placed.length !== gearMap.nodes.length) return false;

  // 检查链条
  for (let i = 0; i < gearMap.nodes.length - 1; i++) {
    const a = gearMap.nodes[i];
    const b = gearMap.nodes[i + 1];

    const pa = pieces.find(p => p.gridX === a.gridX && p.gridY === a.gridY);
    const pb = pieces.find(p => p.gridX === b.gridX && p.gridY === b.gridY);

    if (!pa || !pb) return false;

    const dx = pa.x - pb.x;
    const dy = pa.y - pb.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const target = pa.radius + pb.radius;

    if (Math.abs(dist - target) > 2) return false;
  }

  return true;
}

/* ---------- Draw ---------- */
function drawGrid() {
  const r = getRect();

  ctx.strokeRect(r.left, r.top, r.width, r.height);

  const cw = r.width / CONFIG.mapCols;
  const ch = r.height / CONFIG.mapRows;

  for (let i = 0; i <= CONFIG.mapCols; i++) {
    const x = r.left + i * cw;
    ctx.beginPath();
    ctx.moveTo(x, r.top);
    ctx.lineTo(x, r.top + r.height);
    ctx.stroke();
  }

  for (let j = 0; j <= CONFIG.mapRows; j++) {
    const y = r.top + j * ch;
    ctx.beginPath();
    ctx.moveTo(r.left, y);
    ctx.lineTo(r.left + r.width, y);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  pieces.forEach(p => p.draw());

  if (checkWin()) {
    ctx.fillStyle = "green";
    ctx.font = "30px sans-serif";
    ctx.fillText("✔ 通关!", 200, 40);
  }
}

/* ---------- Events ---------- */
canvas.addEventListener("mousedown", e => {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;

  for (let i = pieces.length - 1; i >= 0; i--) {
    if (pieces[i].contains(mx, my)) {
      active = pieces[i];
      offX = mx - active.x;
      offY = my - active.y;
      break;
    }
  }
});

canvas.addEventListener("mousemove", e => {
  if (!active) return;

  const r = canvas.getBoundingClientRect();
  active.x = e.clientX - r.left - offX;
  active.y = e.clientY - r.top - offY;

  draw();
});

canvas.addEventListener("mouseup", () => {
  if (!active) return;

  if (inTray(active.y)) {
    active.reset();
  } else {
    if (!place(active)) {
      active.reset();
    }
  }

  active = null;
  draw();
});

/* ---------- Start ---------- */
buildGame();