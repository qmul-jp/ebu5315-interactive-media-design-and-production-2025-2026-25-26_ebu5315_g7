/* =========================
   Gear Puzzle - FINAL FIXED
   ========================= */

window.DEBUG_PATH = true;
window.GAME_DIFFICULTY = 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ---------- Config ---------- */
const CONFIG = {
  cols: 40,
  rows: 20,
  maxGearRadius: 6
};

const LAYOUT = {
  outerPadding: 20,
  panelGap: 26,
  trayRatio: 0.3,
  trayMinHeight: 200
};

let cell, offsetX, offsetY;
let pieces = [];
let active = null;
let offsetMX = 0, offsetMY = 0;
let gameStarted = false;
let isGameWon = false;
let hoveredPoint = null; 
let markedPoints = new Set();

let mapPanelRect = null;
let trayPanelRect = null;
let mapBoundsRect = null;
let gridRect = null;

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

  gameStarted = true;
  isGameWon = false;

  if (gameArea) gameArea.classList.remove("hidden");

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
  gameStarted = false;
  const gameArea = document.getElementById("gameArea");
  const gameIntro = document.getElementById("gameIntro");
  if (gameArea) gameArea.classList.add("hidden");
  if (gameIntro) gameIntro.classList.remove("hidden");

  hideWinModal();

  if (markedPoints) {
    markedPoints.clear();
  }
  hoveredPoint = null;
}

window.startGame = startGame;
window.restartGame = restartGame;
window.exitGame = exitGame;
window.hideWinModal = hideWinModal;

/* ---------- Resize ---------- */
function resizeCanvas() {
  canvas.width = Math.round(canvas.clientWidth);
  canvas.height = Math.round(canvas.clientHeight);
}

/* ---------- Grid & Layout ---------- */
function computeLayout() {
  const outerPadding = Math.max(LAYOUT.outerPadding, Math.min(canvas.width, canvas.height) * 0.02);
  const panelGap = Math.max(LAYOUT.panelGap, canvas.height * 0.02);

  const availableW = canvas.width - outerPadding * 2;
  const availableH = canvas.height - outerPadding * 2;

  const trayH = Math.max(LAYOUT.trayMinHeight, availableH * LAYOUT.trayRatio);
  const mapH = availableH - trayH - panelGap;

  mapPanelRect = {
    x: outerPadding,
    y: outerPadding,
    w: availableW,
    h: mapH
  };

  trayPanelRect = {
    x: outerPadding,
    y: outerPadding + mapH + panelGap,
    w: availableW,
    h: availableH - mapH - panelGap
  };
}

function computeGrid() {
  computeLayout();

  const gridPadding = 35; // 四周留出 35px 的距离

  cell = Math.min(
    (mapPanelRect.w - gridPadding * 2) / CONFIG.cols,
    (mapPanelRect.h - gridPadding * 2) / CONFIG.rows
  );

  const gridW = CONFIG.cols * cell;
  const gridH = CONFIG.rows * cell;

  const gridX = mapPanelRect.x + (mapPanelRect.w - gridW) / 2;
  const gridY = mapPanelRect.y + (mapPanelRect.h - gridH) / 2;

  gridRect = {
    x: gridX,
    y: gridY,
    w: gridW,
    h: gridH
  };

  // 现在地图可放置范围直接等于格子范围
  mapBoundsRect = { ...gridRect };

  // 网格原点
  offsetX = gridRect.x;
  offsetY = gridRect.y;
}

function gridToPixel(gx, gy) {
  return {
    x: offsetX + gx * cell,
    y: offsetY + gy * cell
  };
}

function isInsideMapBounds(piece, x, y) {
  if (!gridRect) return false;

  return (
    x >= gridRect.x &&
    x <= gridRect.x + gridRect.w &&
    y >= gridRect.y &&
    y <= gridRect.y + gridRect.h
  );
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

function generatePath(diffLevel = window.GAME_DIFFICULTY) {
  const nodes = [];
  const MAX_R = CONFIG.maxGearRadius;
  const MAX_N = 10;
  const MAX_LAST_R = 3;
  const MAX_ATTEMPTS = 1000;
  const EPS = 1e-6;
  
  // 难度 1 和 2 使用 'simple' 行走规则，难度 3 和 4 使用 'hard' 数学规则
  const difficultyMode = (diffLevel >= 3) ? 'hard' : 'simple';

  function generateRadiusText(rootSq, sign, intPart) {
    if (rootSq === 0) return `${intPart}`; 
    if (sign === 1) {
      if (intPart === 0) return `√${rootSq}`;
      if (intPart > 0) return `√${rootSq} + ${intPart}`;
      return `√${rootSq} - ${Math.abs(intPart)}`;
    } else {
      if (intPart === 0) return `-√${rootSq}`; 
      return `${intPart} - √${rootSq}`;
    }
  }

  function generateNextStep(lastNode, mode) {
    let allowedMoves = [];
    let state = lastNode.rState;

    for (let dx = -MAX_R - 2; dx <= MAX_R + 2; dx++) { // 修正范围
      for (let dy = -MAX_R; dy <= MAX_R; dy++) {
        if (dx === 0 && dy === 0) continue;

        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        let isOrtho = (dx === 0 || dy === 0); 
        let isValidFormat = false;

        if (mode === 'simple') {
          if (isOrtho) isValidFormat = true;
        } else {
          if (state.rootSq === 0) {
            isValidFormat = true;
          } else if (state.sign === 1) {
            if (isOrtho || distSq === state.rootSq) isValidFormat = true;
          } else if (state.sign === -1) {
            if (isOrtho) isValidFormat = true;
          }
        }

        if (isValidFormat) {
          let currentR_val = dist - state.value;
          if (currentR_val >= 0.8 && currentR_val <= MAX_R * 1.5) {
            allowedMoves.push({ dx, dy, distSq, dist, isOrtho });
          }
        }
      }
    }

    if (allowedMoves.length === 0) return null;

    // 难度 4 特殊逻辑：减少整数
    if (diffLevel === 4) {
      let nonIntMoves = allowedMoves.filter(m => {
        let nextIsInt = (state.rootSq === 0 && m.isOrtho) || (state.rootSq !== 0 && !m.isOrtho);
        return !nextIsInt;
      });
      if (nonIntMoves.length > 0 && Math.random() < 0.85) {
        allowedMoves = nonIntMoves;
      }
    }

    let move = allowedMoves[randomInt(0, allowedMoves.length - 1)];
    
    // 计算新状态
    let newState = { rootSq: 0, sign: 1, intPart: 0, value: move.dist - state.value, text: "" };
    if (state.rootSq === 0) {
      if (move.isOrtho) { newState.intPart = Math.round(move.dist - state.intPart); } 
      else { newState.rootSq = move.distSq; newState.sign = 1; newState.intPart = -state.intPart; }
    } else {
      if (move.isOrtho) { newState.rootSq = state.rootSq; newState.sign = -state.sign; newState.intPart = Math.round(move.dist - state.intPart); } 
      else { newState.rootSq = 0; newState.intPart = Math.round(move.dist - state.value); }
    }
    newState.text = generateRadiusText(newState.rootSq, newState.sign, newState.intPart);

    return { 
      x: lastNode.x + move.dx, 
      y: lastNode.y + move.dy, 
      rState: newState, 
      r: newState.value,
      rText: newState.text
    };
  }

  function canPlaceNode(node, parentIndex) {
    if (node.r <= 0) return false;
    if (node.x < 0 || node.x > CONFIG.cols || node.y < 0 || node.y > CONFIG.rows) return false;
    for (let i = 0; i < nodes.length; i++) {
      if (i === parentIndex) continue;
      const dx = node.x - nodes[i].x; const dy = node.y - nodes[i].y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.r + nodes[i].r + EPS) return false;
    }
    return true;
  }

  // 初始化起点
  const startY = randomInt(2, CONFIG.rows - 3);
  const startR = 2;
  const start = { x: 0, y: startY, r: startR, rState: { rootSq: 0, sign: 1, intPart: startR, value: startR, text: "2" }, rText: "2" };
  nodes.push(start);

  let attempts = 0;
  while (attempts < MAX_ATTEMPTS && nodes.length < MAX_N) {
    attempts++;
    const last = nodes[nodes.length - 1];
    const nextData = generateNextStep(last, difficultyMode); // 修正变量名

    if (nextData && canPlaceNode(nextData, nodes.length - 1)) {
      nodes.push(nextData);
      if (nextData.x >= CONFIG.cols - MAX_LAST_R) break; // 靠近边界则尝试结束
    }
  }

  const last = nodes[nodes.length - 1];
  const endR_val = CONFIG.cols - last.x - last.r;
  if (endR_val >= 1 && endR_val <= MAX_LAST_R) {
    let endState = { rootSq: last.rState.rootSq, sign: -last.rState.sign, intPart: (CONFIG.cols - last.x) - last.rState.intPart, value: endR_val };
    endState.text = generateRadiusText(endState.rootSq, endState.sign, endState.intPart);
    nodes.push({ x: CONFIG.cols, y: last.y, r: endR_val, rState: endState, rText: endState.text });
  }

  return nodes[nodes.length - 1].x === CONFIG.cols ? nodes : null;
}

function drawPathDebug(nodes) {
  if (!nodes || nodes.length === 0) return;

  ctx.save();

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

  nodes.forEach((n, i) => {
    const p = gridToPixel(n.x, n.y);

    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);

    if (i === 0) ctx.fillStyle = "#00ffcc";
    else if (i === nodes.length - 1) ctx.fillStyle = "#ff66cc";
    else ctx.fillStyle = "#00cc66";

    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`r:${n.r}`, p.x, p.y - 8);

    ctx.textBaseline = "top";
    ctx.fillText(i, p.x, p.y + 8);
  });

  ctx.restore();
}

/* ---------- Piece ---------- */
function isGridTangent(a, b) {
  if (!a || !b) return false;
  if (!a.inMap || !b.inMap) return false;

  const dist = Math.hypot(a.gx - b.gx, a.gy - b.gy);
  return Math.abs(dist - (a.r + b.r)) < 1e-6;
}

function hasComputedNeighbor(piece) {
  if (!piece.inMap) return false;

  return pieces.some(other =>
    other !== piece &&
    other.inMap &&
    isPieceOnComputedNode(other) &&
    isGridTangent(piece, other)
  );
}

class Piece {
  constructor(node) {
    this.gx = node.x;
    this.gy = node.y;
    this.r = node.r;
    this.rText = node.rText || this.r;

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
    const EPS = 0.1;

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

    // 阴影效果
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = this.isDragging ? 18 : 8;

    // --- 1. 绘制半透明齿轮主体 ---
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // 颜色判定逻辑
    if (this.isOverlappingAny()) {
      ctx.fillStyle = "rgba(255, 77, 77, 0.7)";   // 重叠
    } else if (typeof isCorrectlyConnectedToHead === "function" && isCorrectlyConnectedToHead(this)) {
      ctx.fillStyle = "rgba(77, 255, 136, 0.7)";  // 连通
    } else if (this.isTouchingAny()) {
      ctx.fillStyle = "rgba(255, 216, 77, 0.7)";  // 接触
    } else {
      ctx.fillStyle = this.isFixed ? "rgba(153, 153, 153, 0.7)" : "rgba(106, 169, 255, 0.7)";
    }
    ctx.fill();

    // 轮廓
    ctx.lineWidth = this.isDragging ? 4 : 2;
    ctx.strokeStyle = "#333";
    ctx.stroke();

    // --- 2. 辅助定位线 (中心十字 + 四向刻度) ---
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)"; 
    ctx.lineWidth = 1.5;
    const tickLen = Math.min(this.radius * 0.2, 10);
    const crossHalf = 6;
    ctx.moveTo(this.x - crossHalf, this.y); ctx.lineTo(this.x + crossHalf, this.y);
    ctx.moveTo(this.x, this.y - crossHalf); ctx.lineTo(this.x, this.y + crossHalf);
    ctx.moveTo(this.x, this.y - this.radius); ctx.lineTo(this.x, this.y - this.radius + tickLen);
    ctx.moveTo(this.x, this.y + this.radius); ctx.lineTo(this.x, this.y + this.radius - tickLen);
    ctx.moveTo(this.x - this.radius, this.y); ctx.lineTo(this.x - this.radius + tickLen, this.y);
    ctx.moveTo(this.x + this.radius, this.y); ctx.lineTo(this.x + this.radius - tickLen, this.y);
    ctx.stroke();

    // radius showcase
    // 默认向下平移一个单元格
    let textOffsetY = this.radius*0.4; 

    if (!this.isDragging && this.inMap && this.gy >= (CONFIG.rows - 1)) {
      textOffsetY = -this.radius*0.5; // 向上平移
    }

    const textX = this.x;
    const textY = this.y + textOffsetY;

    const fontSize = Math.max(12, Math.min(this.radius * 0.7, 42));
    ctx.fillStyle = "#222";
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = Math.max(2, fontSize * 0.12);
    ctx.strokeText(this.rText, textX, textY);
    ctx.fillText(this.rText, textX, textY);

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
  if (!trayPanelRect || !list.length) return;

  const sidePadding = 18;
  const rowGap = Math.max(14, cell * 0.9);
  const pieceGap = Math.max(12, cell * 0.6);
  const availableW = trayPanelRect.w - sidePadding * 2;

  const rows = [];
  let currentRow = [];
  let currentWidth = 0;

  list.forEach(piece => {
    const pieceWidth = piece.radius * 2;
    const nextWidth = currentRow.length ? currentWidth + pieceGap + pieceWidth : currentWidth + pieceWidth;

    if (currentRow.length && nextWidth > availableW) {
      rows.push(currentRow);
      currentRow = [piece];
      currentWidth = pieceWidth;
    } else {
      currentRow.push(piece);
      currentWidth = nextWidth;
    }
  });

  if (currentRow.length) rows.push(currentRow);

  const rowHeights = rows.map(row => Math.max(...row.map(piece => piece.radius * 2)));
  const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0) + rowGap * (rows.length - 1);

  let y = trayPanelRect.y + (trayPanelRect.h - totalHeight) / 2;

  rows.forEach((row, rowIndex) => {
    const rowHeight = rowHeights[rowIndex];
    const rowWidth = row.reduce((sum, piece) => sum + piece.radius * 2, 0) + pieceGap * (row.length - 1);
    let x = trayPanelRect.x + (trayPanelRect.w - rowWidth) / 2;
    const centerY = y + rowHeight / 2;

    row.forEach(piece => {
      x += piece.radius;
      piece.x = x;
      piece.y = centerY;
      piece.startX = piece.x;
      piece.startY = piece.y;
      x += piece.radius + pieceGap;
    });

    y += rowHeight + rowGap;
  });
}

/* ---------- Build ---------- */
let validNodeKeys = new Set();
function makeNodeKey(x, y, r) {
  return `${x},${y},${r}`;
}function getAllComputedNodeKeys() {
  return new Set([...validNodeKeys, ...alternativeNodes()]);
}

function isPieceOnComputedNode(piece) {
  if (!piece.inMap) return false;
  return getAllComputedNodeKeys().has(makeNodeKey(piece.gx, piece.gy, piece.r));
}

function isCorrectlyConnectedToHead(piece) {
  if (!piece || !piece.inMap) return false;
  if (!pieces.length) return false;

  const head = pieces[0];
  if (!head || !head.inMap) return false;

  const canJoinGreenChain = p =>
    p &&
    p.inMap &&
    !p.isOverlappingAny() &&
    isPieceOnComputedNode(p);

  if (!canJoinGreenChain(piece)) return false;
  if (!canJoinGreenChain(head)) return false;

  const visited = new Set();
  const stack = [head];

  while (stack.length) {
    const cur = stack.pop();
    if (visited.has(cur)) continue;
    visited.add(cur);

    for (const other of pieces) {
      if (visited.has(other)) continue;
      if (!canJoinGreenChain(other)) continue;
      if (cur.isTouchingPiece(other)) {
        stack.push(other);
      }
    }
  }

  // do not leave the first node green alone
  if (piece === head) {
    return visited.size > 1;
  }

  return visited.has(piece);
}



function buildGame() {
  computeGrid();
  pieces = [];
  active = null;
  isGameWon = false;
  hideWinModal();

  markedPoints.clear(); 
  hoveredPoint = null;

  let nodes = null;
  const MAX_BUILD_RETRY = 200;

  for (let i = 0; i < MAX_BUILD_RETRY; i++) {
    const candidate = generatePath(window.GAME_DIFFICULTY);
    if (candidate && candidate.length > 0 && candidate[candidate.length - 1].x === CONFIG.cols) {
      nodes = candidate;
      break;
    }
  }

  if (!nodes) {
    console.error("Failed to generate a valid path ending on the right edge.");
    return;
  }

  window.__DEBUG_PATH__ = nodes;
  const tray = [];
  validNodeKeys = new Set(
  nodes.map(n => makeNodeKey(n.x, n.y, n.r))
  );

  // 1. 计算哪些齿轮需要固定在地图上
  let fixedIndices = new Set([0, nodes.length - 1]);
  let curr = 0;
  
  while (curr < nodes.length - 1) {
    let skip = 1;
    
    curr += (skip + 1);
    if (curr < nodes.length - 1) {
      fixedIndices.add(curr);
    }
  }
  // 双重保险：确保终点始终是固定的
  fixedIndices.add(nodes.length - 1);

  // 2. 将计算好的属性赋给实际齿轮
  nodes.forEach((n, i) => {
    let p = new Piece(n);

    if (fixedIndices.has(i)) {
      p.inMap = true;
      p.isFixed = true;
      p.isFixedGray = true;
    } else {
      p.inMap = false;
      p.isFixedGray = false;
      tray.push(p);
    }

    pieces.push(p);
  });

  layoutTray(tray);
  draw();
}

function isPieceOnComputedNode(piece) {
  if (!piece.inMap) return false;
 return getAllComputedNodeKeys().has(makeNodeKey(piece.gx, piece.gy, piece.r));
}

function alternativeNodes() {
  const result = new Set();
  const nodes = window.__DEBUG_PATH__ || [];
  const EPS = 1e-6;

  if (nodes.length < 3) return result;

  const opposite = {
    left: "right",
    right: "left",
    up: "down",
    down: "up"
  };

  const isHorizontal = t => t === "left" || t === "right";

  function overlapsOtherNodes(ax, ay, ar, skipA, skipB, skipC) {
    for (let j = 0; j < nodes.length; j++) {
      if (j === skipA || j === skipB || j === skipC) continue;

      const other = nodes[j];
      const dist = Math.hypot(ax - other.x, ay - other.y);

      if (dist < ar + other.r - EPS) {
        return true;
      }
    }
    return false;
  }

  for (let i = 1; i < nodes.length - 1; i++) {
    const prev = nodes[i - 1];
    const cur = nodes[i];
    const next = nodes[i + 1];

    if (pieces[i] && pieces[i].isFixed) continue;

    // the tangency information records current node's tengency point with previous node
    const inTan = cur.tangency;

    // current node's tangency direction need to be opposite
    const outTan = opposite[next.tangency];

    if (!inTan || !outTan) continue;

    // is turn?
    const isTurn = isHorizontal(inTan) !== isHorizontal(outTan);
    if (!isTurn) continue;

    // only when previous and next one are having same radius
    if (prev.r !== next.r) continue;

    const altX = prev.x + next.x - cur.x;
    const altY = prev.y + next.y - cur.y;

    if (altX < 0 || altX > CONFIG.cols || altY < 0 || altY > CONFIG.rows) {
      continue;
    }

    const d1 = Math.hypot(altX - prev.x, altY - prev.y);
    const d2 = Math.hypot(altX - next.x, altY - next.y);

    if (Math.abs(d1 - (prev.r + cur.r)) > EPS) continue;
    if (Math.abs(d2 - (next.r + cur.r)) > EPS) continue;

    if (overlapsOtherNodes(altX, altY, cur.r, i - 1, i, i + 1)) continue;

    result.add(makeNodeKey(altX, altY, cur.r));
  }

  return result;
}

function checkWin() {
  if (isGameWon || !pieces.length) return false;

  // 获取所有合法位置（原始路径节点 + 镜像/对称产生的备选节点）
  const allLegalKeys = getAllComputedNodeKeys();

  const movablePieces = pieces.filter(p => !p.isFixed);

  // 1. 检查是否有重叠
  const hasOverlap = pieces.some(p => p.inMap && p.isOverlappingAny());

  // 2. 检查所有可移动齿轮是否都放置在合法位置上（包含 alternatives）
  const allPlacedCorrectly = movablePieces.every(
    p => p.inMap && allLegalKeys.has(makeNodeKey(p.gx, p.gy, p.r))
  );

  // 3. 检查是否所有齿轮都与起点（Head）连通且处于正确状态
  const allConnectedToHead = movablePieces.every(
    p => isCorrectlyConnectedToHead(p)
  );

  if (!hasOverlap && allPlacedCorrectly && allConnectedToHead) {
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

    if (!isInsideMapBounds(p, pos.x, pos.y)) {
      return false;
    }

    p.x = pos.x;
    p.y = pos.y;
    p.inMap = true;
    p.gx = gx;
    p.gy = gy;
    return true;
  }

  return false;
}

/* ---------- Draw ---------- */

function drawMapBase() {
  ctx.save();

  // 地图区底色
  ctx.fillStyle = "#eef6ff";
  ctx.fillRect(mapPanelRect.x, mapPanelRect.y, mapPanelRect.w, mapPanelRect.h);

  // 网格
  ctx.strokeStyle = "#8da0b8";
  ctx.lineWidth = 1;
  ctx.strokeRect(gridRect.x, gridRect.y, gridRect.w, gridRect.h);

  for (let i = 0; i <= CONFIG.cols; i++) {
    const x = gridRect.x + i * cell;
    ctx.beginPath();
    ctx.moveTo(x, gridRect.y);
    ctx.lineTo(x, gridRect.y + gridRect.h);
    ctx.stroke();
  }

  for (let j = 0; j <= CONFIG.rows; j++) {
    const y = gridRect.y + j * cell;
    ctx.beginPath();
    ctx.moveTo(gridRect.x, y);
    ctx.lineTo(gridRect.x + gridRect.w, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#555";
  ctx.font = "bold 12px Arial";
  
  // 顶部 X 轴刻度
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (let i = 0; i <= CONFIG.cols; i++) {
    const x = gridRect.x + i * cell;
    // 绘制小短线刻度
    ctx.beginPath();
    ctx.moveTo(x, gridRect.y);
    ctx.lineTo(x, gridRect.y - 6);
    ctx.stroke();
    // 每隔 5 个单位标注一次数字，防拥挤
    if (i % 5 === 0) {
      ctx.fillText(i, x, gridRect.y - 8);
    }
  }

  // 左侧 Y 轴刻度
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let j = 0; j <= CONFIG.rows; j++) {
    const y = gridRect.y + j * cell;
    // 绘制小短线刻度
    ctx.beginPath();
    ctx.moveTo(gridRect.x, y);
    ctx.lineTo(gridRect.x - 6, y);
    ctx.stroke();
    // 每隔 5 个单位标注一次数字
    if (j % 5 === 0) {
      ctx.fillText(j, gridRect.x - 8, y);
    }
  }

  ctx.restore();
}

function drawTrayBase() {
  ctx.save();

  ctx.fillStyle = "#f7efe1";
  ctx.fillRect(trayPanelRect.x, trayPanelRect.y, trayPanelRect.w, trayPanelRect.h);

  ctx.restore();
}

function drawMapOverlay() {
  ctx.save();

  // 设置为画布背景色，起到遮挡效果
  ctx.fillStyle = "#f9fafb";

  // 1. 顶部遮罩：覆盖地图上方区域
  ctx.fillRect(0, 0, canvas.width, mapPanelRect.y);

  // 2. 左侧遮罩：从顶部贯穿到底部
  ctx.fillRect(0, 0, mapPanelRect.x, canvas.height);

  // 3. 右侧遮罩：从地图右边缘贯穿到画布右边缘
  const rightX = mapPanelRect.x + mapPanelRect.w;
  ctx.fillRect(rightX, 0, canvas.width - rightX, canvas.height);

  // 4. 中间间隙遮罩：覆盖地图底部和托盘顶部之间的区域
  const mapBottom = mapPanelRect.y + mapPanelRect.h;
  const gapHeight = trayPanelRect.y - mapBottom;
  if (gapHeight > 0) {
    ctx.fillRect(mapPanelRect.x, mapBottom, mapPanelRect.w, gapHeight);
  }

  // 5. 底部遮罩：覆盖托盘下方的画布区域
  const trayBottom = trayPanelRect.y + trayPanelRect.h;
  ctx.fillRect(mapPanelRect.x, trayBottom, mapPanelRect.w, canvas.height - trayBottom);

  // 最后绘制面板的深色边框，使其压在遮罩之上
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#43536b";
  ctx.strokeRect(mapPanelRect.x, mapPanelRect.y, mapPanelRect.w, mapPanelRect.h);
  ctx.strokeRect(trayPanelRect.x, trayPanelRect.y, trayPanelRect.w, trayPanelRect.h);

  ctx.restore();
}

function drawTrayFrame() {
  ctx.save();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#43536b";
  ctx.strokeRect(trayPanelRect.x, trayPanelRect.y, trayPanelRect.w, trayPanelRect.h);

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // first: map
  drawMapBase();
  

  // second layer: all static gears
  pieces
    .filter(p => p.inMap && p !== active)
    .forEach(p => p.draw());

  if (window.__DEBUG_PATH__) {
    drawPathDebug(window.__DEBUG_PATH__);
  }

  // third layer: overlay
  drawMapOverlay();
  drawTrayBase();
  drawTrayFrame();
  // 第四层：托盘齿轮（重新画一遍非拖拽的托盘齿轮，确保它们在遮罩之上）
  pieces
    .filter(p => !p.inMap && p !== active)
    .forEach(p => p.draw());

  drawGridInteractions();

  // fifth layer: gears that are being dragged now
  if (active) {
    active.draw();
  }
}

/* ---------- Interactive Tools ---------- */
function getNearestGridPoint(mx, my) {
  if (!gridRect) return null;
  let gx = Math.round((mx - offsetX) / cell);
  let gy = Math.round((my - offsetY) / cell);
  
  if (gx >= 0 && gx <= CONFIG.cols && gy >= 0 && gy <= CONFIG.rows) {
    const px = offsetX + gx * cell;
    const py = offsetY + gy * cell;
    // 当鼠标距离某个格点小于 40% 的格子宽度时，吸附到该格点
    if (Math.hypot(mx - px, my - py) < cell * 0.4) {
      return { gx, gy, px, py };
    }
  }
  return null;
}

function drawGridInteractions() {
  ctx.save();
  
  const mToggle = document.getElementById("markToggle");
  const isMarkModeOn = mToggle && mToggle.checked;

  // 1. 绘制玩家点击标记的鲜明圆点 (红色) - 只有开关开启时才绘制！
  if (isMarkModeOn) {
    ctx.fillStyle = "#ff0055"; 
    markedPoints.forEach(key => {
      const [gx, gy] = key.split(',').map(Number);
      const p = gridToPixel(gx, gy);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // 2. 绘制悬浮时的坐标提示框
  if (hoveredPoint && !active && isMarkModeOn) {
    const { gx, gy, px, py } = hoveredPoint;
    
    // 格点上的小黑点反馈
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    const text = `(${gx}, ${gy})`;
    ctx.font = "bold 13px Arial";
    const metrics = ctx.measureText(text);
    const paddingX = 6;
    const paddingY = 4;
    const boxW = metrics.width + paddingX * 2;
    const boxH = 16 + paddingY * 2;

    let tx = px + 12; // 提示框偏移量
    let ty = py - 12 - boxH;

    // 绘制提示框背景
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.fillRect(tx, ty, boxW, boxH);
    ctx.strokeRect(tx, ty, boxW, boxH);

    // 绘制文字
    ctx.fillStyle = "#111";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(text, tx + paddingX, ty + paddingY);
  }
  ctx.restore();
}

/* ---------- Events ---------- */
// 获取开关元素
const markToggle = document.getElementById("markToggle");

canvas.addEventListener("mousedown", e => {
  if (isGameWon) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let clickedGear = false;
  
  // 1. 优先判定是否点中了齿轮（准备拖拽）
  for (let i = pieces.length - 1; i >= 0; i--) {
    if (pieces[i].contains(mx, my) && !pieces[i].isFixed) {
      active = pieces[i];
      active.isDragging = true;
      offsetMX = mx - active.x;
      offsetMY = my - active.y;
      clickedGear = true;
      break; 
    }
  }

  // 2. 如果没点中齿轮，且“标记开关”打开了，才进行标记逻辑
  if (!clickedGear && markToggle && markToggle.checked) {
    const nearest = getNearestGridPoint(mx, my);
    if (nearest) {
      const key = `${nearest.gx},${nearest.gy}`;
      if (markedPoints.has(key)) {
        markedPoints.delete(key);
      } else {
        markedPoints.add(key);
      }
      draw();
    }
  }
});

canvas.addEventListener("mousemove", e => {
 const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (active) {
    active.x = mx - offsetMX;
    active.y = my - offsetMY;
    draw();
    return;
  }

  // --- 新增：悬浮格点坐标逻辑 ---
  const nearest = getNearestGridPoint(mx, my);
  let needsRedraw = false;
  
  if (nearest) {
    if (!hoveredPoint || hoveredPoint.gx !== nearest.gx || hoveredPoint.gy !== nearest.gy) {
      hoveredPoint = nearest;
      needsRedraw = true;
    }
  } else {
    if (hoveredPoint) {
      hoveredPoint = null;
      needsRedraw = true;
    }
  }

  if (needsRedraw) draw();
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

function relayoutCurrentGame() {
  if (!pieces || pieces.length === 0) return;

  resizeCanvas();
  computeGrid();

  pieces.forEach(p => {
    if (p.inMap) {
      const pos = gridToPixel(p.gx, p.gy);
      p.x = pos.x;
      p.y = pos.y;
    }
  });

  const tray = pieces.filter(p => !p.inMap);
  layoutTray(tray);

  draw();
}

function resetGame() {
    buildGame();
}

canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

/* ---------- Start ---------- */
window.addEventListener('resize', () => {
    relayoutCurrentGame(); 
});

document.getElementById('resetBtn').addEventListener('click', () => {
    resetGame();
});

if (markToggle) {
    markToggle.addEventListener('change', () => {
        // 关闭开关时，如果有悬浮提示框也直接清掉
        if (!markToggle.checked) {
            hoveredPoint = null;
        }
        // 调用重绘函数，此时 drawGridInteractions 会根据开关状态决定是否画出红点
        draw(); 
    });
}

const difficultySelect = document.getElementById('difficultySelect');
if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
        window.GAME_DIFFICULTY = parseInt(e.target.value, 10);
        // 如果游戏已经开始了，切换难度自动重置当前棋盘
        if (gameStarted) {
            resetGame();
        }
    });
}

if (window.DEBUG_PATH && window.__DEBUG_PATH__) {
  drawPathDebug(window.__DEBUG_PATH__);
}