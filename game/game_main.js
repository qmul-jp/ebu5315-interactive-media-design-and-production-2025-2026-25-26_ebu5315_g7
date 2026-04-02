const mapCanvas = document.getElementById("drawMap");
const mapCtx = mapCanvas.getContext("2d");

const gearCanvas = document.getElementById("drawCircles");
const gearCtx = gearCanvas.getContext("2d");

const CONFIG = {
  cols: 10,
  rows: 6,
};

let cell, offsetX, offsetY;

let pieces = [];
let dragging = null;

/* ---------- resize ---------- */
function resizeCanvas() {
  mapCanvas.width = mapCanvas.clientWidth;
  mapCanvas.height = mapCanvas.clientHeight;

  gearCanvas.width = gearCanvas.clientWidth;
  gearCanvas.height = gearCanvas.clientHeight;
}

/* ---------- grid ---------- */
function computeGrid() {
  cell = Math.min(
    mapCanvas.width / CONFIG.cols,
    mapCanvas.height / CONFIG.rows
  );

  offsetX = (mapCanvas.width - CONFIG.cols * cell) / 2;
  offsetY = (mapCanvas.height - CONFIG.rows * cell) / 2;
}

function gridToPixel(gx, gy) {
  return {
    x: offsetX + gx * cell,
    y: offsetY + gy * cell
  };
}

/* ---------- piece ---------- */
class Piece {
  constructor(x, y, r, label, inMap) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.label = label;
    this.inMap = inMap;

    this.dragging = false;
  }

  draw(ctx) {
    ctx.save();

    if (this.dragging) {
      ctx.shadowBlur = 15;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = "#6aa9ff";
    ctx.fill();

    ctx.strokeStyle = this.dragging ? "#ff8800" : "#333";
    ctx.lineWidth = this.dragging ? 4 : 2;
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.label, this.x, this.y);

    ctx.restore();
  }

  contains(mx, my) {
    return (mx - this.x) ** 2 + (my - this.y) ** 2 <= this.r ** 2;
  }
}

/* ---------- build ---------- */
function buildGame() {
  computeGrid();

  pieces = [];

  // 固定几个 map 圆
  for (let i = 0; i < 3; i++) {
    let gx = 2 + i * 3;
    let gy = Math.floor(CONFIG.rows / 2);

    let r = (i % 2) + 1;

    let pos = gridToPixel(gx, gy);

    pieces.push(new Piece(pos.x, pos.y, r * cell, r, true));
  }

  // gearBar 圆（关键：限制大小）
  const maxR = gearCanvas.height * 0.25;

  for (let i = 0; i < 5; i++) {
    let r = (i % 3) + 1;

    pieces.push(new Piece(0, 0, Math.min(r * cell, maxR), r, false));
  }

  layoutGear();
  draw();
}

/* ---------- gear 横排 ---------- */
function layoutGear() {
  const list = pieces.filter(p => !p.inMap);

  const gap = gearCanvas.width / (list.length + 1);

  list.forEach((p, i) => {
    p.x = gap * (i + 1);
    p.y = gearCanvas.height / 2;
  });
}

/* ---------- draw ---------- */
function drawGrid() {
  mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

  mapCtx.strokeRect(offsetX, offsetY, CONFIG.cols * cell, CONFIG.rows * cell);

  for (let i = 0; i <= CONFIG.cols; i++) {
    let x = offsetX + i * cell;
    mapCtx.beginPath();
    mapCtx.moveTo(x, offsetY);
    mapCtx.lineTo(x, offsetY + CONFIG.rows * cell);
    mapCtx.stroke();
  }

  for (let j = 0; j <= CONFIG.rows; j++) {
    let y = offsetY + j * cell;
    mapCtx.beginPath();
    mapCtx.moveTo(offsetX, y);
    mapCtx.lineTo(offsetX + CONFIG.cols * cell, y);
    mapCtx.stroke();
  }
}

function draw() {
  drawGrid();

  mapCtx.save();
  pieces.filter(p => p.inMap).forEach(p => p.draw(mapCtx));
  mapCtx.restore();

  gearCtx.clearRect(0, 0, gearCanvas.width, gearCanvas.height);
  pieces.filter(p => !p.inMap).forEach(p => p.draw(gearCtx));
}

/* ---------- events ---------- */
function getMouse(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

gearCanvas.addEventListener("mousedown", e => {
  const m = getMouse(gearCanvas, e);

  pieces.forEach(p => {
    if (!p.inMap && p.contains(m.x, m.y)) {
      dragging = p;
      p.dragging = true;
    }
  });
});

mapCanvas.addEventListener("mousedown", e => {
  const m = getMouse(mapCanvas, e);

  pieces.forEach(p => {
    if (p.inMap && p.contains(m.x, m.y)) {
      dragging = p;
      p.dragging = true;
    }
  });
});

window.addEventListener("mousemove", e => {
  if (!dragging) return;

  const rect = mapCanvas.getBoundingClientRect();

  dragging.x = e.clientX - rect.left;
  dragging.y = e.clientY - rect.top;

  draw();
});

window.addEventListener("mouseup", () => {
  if (!dragging) return;

  dragging.dragging = false;

  // 判断在哪个区域
  if (dragging.y > mapCanvas.height) {
    dragging.inMap = false;
    layoutGear();
  } else {
    dragging.inMap = true;
  }

  dragging = null;
  draw();
});

/* ---------- start ---------- */
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  buildGame();
});