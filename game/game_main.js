/* =========================
   Gear Puzzle - FINAL FIXED
   ========================= */

window.DEBUG_PATH = true;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ---------- Config ---------- */
const CONFIG = {
  cols: 30,
  rows: 18
};

let cell, offsetX, offsetY;
let pieces = [];
let active = null;
let offsetMX = 0, offsetMY = 0;
let gameStarted = false;
let isGameWon = false;

function showWinModal() {
  const modal = document.getElementById("winModal");
  if (modal) modal.classList.remove("hidden");
}

function hideWinModal() {
  const modal = document.getElementById("winModal");
  if (modal) modal.classList.add("hidden");
}

function startGame() {
  if (gameStarted) return;

  const gameArea = document.getElementById("gameArea");
  const startBtn = document.getElementById("startBtn");

  gameStarted = true;
  isGameWon = false;

  if (gameArea) gameArea.classList.remove("hidden");
  if (startBtn) startBtn.disabled = true;

  resizeCanvas();
  buildGame();
}

function restartGame() {
  if (!gameStarted) {
    startGame();
    return;
  }

  isGameWon = false;
  hideWinModal();
  resizeCanvas();
  buildGame();
}

function exitGame() {
  const gameArea = document.getElementById("gameArea");
  const startBtn = document.getElementById("startBtn");

  active = null;
  gameStarted = false;
  isGameWon = false;
  hideWinModal();

  if (gameArea) gameArea.classList.add("hidden");
  if (startBtn) startBtn.disabled = false;
}

window.startGame = startGame;
window.restartGame = restartGame;
window.exitGame = exitGame;

/* ---------- Resize ---------- */
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

/* ---------- Grid ---------- */
function computeGrid() {
  const mapH = canvas.height * 0.7;

  cell = Math.min(
    canvas.width / CONFIG.cols,
    mapH / CONFIG.rows
  );

  offsetX = (canvas.width - CONFIG.cols * cell) / 2;
  offsetY = (mapH - CONFIG.rows * cell) / 2;
}

function gridToPixel(gx, gy) {
  return {
    x: offsetX + gx * cell,
    y: offsetY + gy * cell
  };
}

/* ---------- Logic ---------- */
class GearNode {
  constructor(r, x, y, tan) {
    this.r = r;
    this.x = x;
    this.y = y;
    this.tangency = tan;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePath() {
  const nodes = [];
  const MAX_R = 6;
  const MAX_N = 10;
  const MAX_LAST_R = 3;
  const MAX_ATTEMPTS = 1000;
  const EPS = 1e-6;

  const startY = randomInt(2, CONFIG.rows - 3);
  const start = new GearNode(2, 0, startY, "left");
  nodes.push(start);

  function getTangency(direction) {
    if (direction === "up") return "down";
    if (direction === "down") return "up";
    if (direction === "right") return "left";
    return null;
  }

  function getDirection(tangency, currentX, currentY) {
    let directions = [];

    if (currentY > 0) directions.push("up");
    if (currentY < CONFIG.rows) directions.push("down");
    if (currentX < CONFIG.cols) directions.push("right");

    directions = directions.filter(d => d !== tangency);

    if (directions.length > 0) {
      return directions[randomInt(0, directions.length - 1)];
    }
    return "right";
  }

  // 候选节点是否合法：
  // 1) 自身参数合法
  // 2) 不和“父节点之外”的任何旧节点重叠或相切
  function canPlaceNode(node, parentIndex) {
    if (node.r <= 0) return false;
    if (node.x < 0 || node.x > CONFIG.cols) return false;
    if (node.y < 0 || node.y > CONFIG.rows) return false;

    for (let i = 0; i < nodes.length; i++) {
      if (i === parentIndex) continue;

      const dx = node.x - nodes[i].x;
      const dy = node.y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = node.r + nodes[i].r;

      // 对非父节点：既不能重叠，也不能刚好相切
      if (dist <= minDist + EPS) {
        return false;
      }
    }

    return true;
  }

  // 能否从当前最后一个节点直接补终点
  function buildEndNode() {
    const last = nodes[nodes.length - 1];
    const endY = last.y;
    const endR = CONFIG.cols - last.x - last.r;

    if (endR < 1 || endR > MAX_LAST_R) return null;

    const end = new GearNode(endR, CONFIG.cols, endY, "left");

    // 终点的“父节点”就是当前最后一个节点
    if (!canPlaceNode(end, nodes.length - 1)) return null;

    return end;
  }

  let attempts = 0;

  while (attempts < MAX_ATTEMPTS && nodes.length < MAX_N) {
    attempts++;

    // 先尝试直接收尾
    const endNode = buildEndNode();
    if (endNode) {
      nodes.push(endNode);
      break;
    }

    const last = nodes[nodes.length - 1];

    let currentR = randomInt(1, MAX_R);
    let direct = getDirection(last.tangency, last.x, last.y);

    let currentX = last.x;
    let currentY = last.y;

    if (direct === "up") {
      currentY -= (last.r + currentR);
    } else if (direct === "down") {
      currentY += (last.r + currentR);
    } else if (direct === "right") {
      currentX += (last.r + currentR);
    }

    const node = new GearNode(
      currentR,
      currentX,
      currentY,
      getTangency(direct)
    );

    if (canPlaceNode(node, nodes.length - 1)) {
      nodes.push(node);
    }
  }

  // 循环结束后再补一次，防止最后一轮刚好可收尾
  if (nodes[nodes.length - 1].x !== CONFIG.cols) {
    const endNode = buildEndNode();
    if (endNode) {
      nodes.push(endNode);
    }
  }

  return nodes;
}


function drawPathDebug(nodes) {
  if (!nodes || nodes.length === 0) return;

  ctx.save();

  // ===== 1️⃣ 画连线（路径骨架）=====
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0, 200, 0, 0.8)";

  nodes.forEach((n, i) => {
    const p = gridToPixel(n.x, n.y);

    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });

  ctx.stroke();

  // ===== 2️⃣ 画节点（圆心）=====
  nodes.forEach((n, i) => {
    const p = gridToPixel(n.x, n.y);

    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);

    // 起点 / 终点特殊颜色
    if (i === 0) ctx.fillStyle = "#00ffcc";
    else if (i === nodes.length - 1) ctx.fillStyle = "#ff66cc";
    else ctx.fillStyle = "#00cc66";

    ctx.fill();

    // 半径标注（调试用）
    ctx.fillStyle = "#000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`r:${n.r}`, p.x, p.y - 8);

    // 序号（方便看路径顺序）
    ctx.textBaseline = "top";
    ctx.fillText(i, p.x, p.y + 8);
  });

  ctx.restore();
}

/* ---------- Piece ---------- */
class Piece {
  constructor(node) {
    this.gx = node.x;
    this.gy = node.y;
    this.r = node.r;

    const p = gridToPixel(this.gx, this.gy);
    this.x = p.x;
    this.y = p.y;

    this.startX = this.x;
    this.startY = this.y;

    this.isDragging = false;
    this.inMap = true;

    this.isFixedGray = false;
    this.isFixed = false;
  }

  get radius() {
    return this.r * cell;
  }

  isOverlappingAny() {
  const EPS = 2;

  if (!this.inMap) return false;

  for (let other of pieces) {
    if (other === this) continue;
    if (!other.inMap) continue;

    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < (this.radius + other.radius) - EPS) {
      return true;
    }
  }
  return false;
}

isTouchingAny() {
  const EPS = 2;

  if (!this.inMap) return false;

  for (let other of pieces) {
    if (other === this) continue;
    if (!other.inMap) continue;

    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (Math.abs(dist - (this.radius + other.radius)) < EPS) {
      return true;
    }
  }
  return false;
}

isTouchingPiece(other) {
  const EPS = 2;

  if (!other) return false;
  if (other === this) return false;
  if (!this.inMap || !other.inMap) return false;

  const dx = this.x - other.x;
  const dy = this.y - other.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return Math.abs(dist - (this.radius + other.radius)) < EPS;
}

isConnectedToHead() {
  if (!this.inMap) return false;
  if (!pieces.length) return false;

  const head = pieces[0];
  if (this === head) return true;
  if (!head.inMap) return false;

  const visited = new Set();
  const stack = [head];

  while (stack.length) {
    const cur = stack.pop();
    if (cur === this) return true;
    if (visited.has(cur)) continue;
    visited.add(cur);

    for (const other of pieces) {
      if (visited.has(other)) continue;
      if (cur.isTouchingPiece(other)) {
        stack.push(other);
      }
    }
  }

  return false;
}

  draw() {
    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = this.isDragging ? 18 : 8;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    if (this.isOverlappingAny()) {
      ctx.fillStyle = "#ff4d4d";   // 红：重叠
    } else if (this.isConnectedToHead()) {
      ctx.fillStyle = "#4dff88";   // 绿：和头齿轮连通
    } else if (this.isTouchingAny()) {
      ctx.fillStyle = "#ffd84d";   // 黄：只是相切，但还没连到头
    } else {
      ctx.fillStyle = this.isFixedGray ? "#999" : "#6aa9ff";
    }

    ctx.fill();

    ctx.lineWidth = this.isDragging ? 4 : 2;
    ctx.strokeStyle = "#333";
    ctx.stroke();

    ctx.fillStyle = "#222";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.r, this.x, this.y);

    ctx.restore();
  }

  contains(mx, my) {
    const dx = mx - this.x;
    const dy = my - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  reset() {
  if (this.isFixed) return;
  this.x = this.startX;
  this.y = this.startY;
  this.inMap = false;
  }
}

/* ---------- Tray Layout ---------- */
function layoutTray(list) {
  const padding = 20;
  const y = canvas.height * 0.85;

  let totalWidth = list.reduce((s, p) => s + p.radius * 2, 0);
  let gap = Math.max(10, (canvas.width - padding * 2 - totalWidth) / (list.length - 1));

  let x = padding;

  list.forEach(p => {
    x += p.radius;
    p.x = x;
    p.y = y;
    p.startX = p.x;
    p.startY = p.y;
    x += p.radius + gap;
  });
}

/* ---------- Build ---------- */
function buildGame() {
  computeGrid();
  pieces = [];
  active = null;
  isGameWon = false;
  hideWinModal();

  const nodes = generatePath();
  window.__DEBUG_PATH__ = nodes;
  const tray = [];

  nodes.forEach((n, i) => {
  let p = new Piece(n);

  // ⭐ 起点 & 终点固定
  if (i === 0 || i === nodes.length - 1) {
    p.inMap = true;
    p.isFixed = true;
    p.isFixedGray = true;
  } 
  // 中间逻辑保持你原来的“隔一个固定”
  else if (i % 2 === 0) {
    p.inMap = true;
    p.isFixedGray = true;
    p.isFixed = true;
  } 
  else {
    p.inMap = false;
    p.isFixedGray = false;
    tray.push(p);
  }

  pieces.push(p);
});

  layoutTray(tray);

  draw();
}

function checkWin() {
  if (isGameWon || !pieces.length) return false;

  const tail = pieces[pieces.length - 1];

  if (tail && tail.isConnectedToHead()) {
    isGameWon = true;
    showWinModal();
    return true;
  }

  return false;
}

/* ---------- Snap ---------- */
function snap(p) {
  if (p.isFixed) return false;
  let gx = Math.round((p.x - offsetX) / cell);
  let gy = Math.round((p.y - offsetY) / cell);

  if (
    gx >= 0 && gx <= CONFIG.cols &&
    gy >= 0 && gy <= CONFIG.rows
  ) {
    const pos = gridToPixel(gx, gy);
    p.x = pos.x;
    p.y = pos.y;
    p.inMap = true;
    return true;
  }
  return false;
}

/* ---------- Draw ---------- */
function drawGrid() {
  const mapH = canvas.height * 0.7;

  ctx.strokeRect(offsetX, offsetY, CONFIG.cols * cell, CONFIG.rows * cell);

  for (let i = 0; i <= CONFIG.cols; i++) {
    let x = offsetX + i * cell;
    ctx.beginPath();
    ctx.moveTo(x, offsetY);
    ctx.lineTo(x, offsetY + CONFIG.rows * cell);
    ctx.stroke();
  }

  for (let j = 0; j <= CONFIG.rows; j++) {
    let y = offsetY + j * cell;
    ctx.beginPath();
    ctx.moveTo(offsetX, y);
    ctx.lineTo(offsetX + CONFIG.cols * cell, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(0, mapH);
  ctx.lineTo(canvas.width, mapH);
  ctx.stroke();
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  pieces.forEach(p => p.draw());

  // ⭐ 调试路径（可随时开关）
  if (window.__DEBUG_PATH__) {
    drawPathDebug(window.__DEBUG_PATH__);
  }
}

/* ---------- Events ---------- */
canvas.addEventListener("mousedown", e => {
  if (isGameWon) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let i = pieces.length - 1; i >= 0; i--) {
    if (pieces[i].contains(mx, my) && !pieces[i].isFixed) {
      active = pieces[i];
      active.isDragging = true;
      offsetMX = mx - active.x;
      offsetMY = my - active.y;
      break;
    }
  }
});

canvas.addEventListener("mousemove", e => {
  if (!active) return;

  const rect = canvas.getBoundingClientRect();
  active.x = e.clientX - rect.left - offsetMX;
  active.y = e.clientY - rect.top - offsetMY;

  draw();
});

function stopDrag() {
  if (!active) return;

  active.isDragging = false;

  const ok = snap(active);
  if (!ok) active.reset();

  active = null;
  draw();
  checkWin();
}

canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

/* ---------- Start ---------- */

window.addEventListener("resize", () => {
  if (!gameStarted) return;

  resizeCanvas();
  buildGame();
});

if (window.DEBUG_PATH && window.__DEBUG_PATH__) {
  drawPathDebug(window.__DEBUG_PATH__);
}