/* =========================
   Gear Puzzle - FINAL FIXED & OPTIMIZED
   ========================= */

window.DEBUG_PATH = true;
window.GAME_DIFFICULTY = 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// --- 渲染优化：离屏缓存画布 ---
const bgCacheCanvas = document.createElement("canvas");
const bgCacheCtx = bgCacheCanvas.getContext("2d");
let needsBgCacheUpdate = true; 

/* ---------- 齿轮图片资源加载 ---------- */
const gearAssets = {
    red: new Image(),    
    yellow: new Image(), 
    green: new Image(),  
    blue: new Image(),   
    grey: new Image()    
};

gearAssets.red.src    = 'source/images/gear_red.png';
gearAssets.yellow.src = 'source/images/gear_yellow.png';
gearAssets.green.src  = 'source/images/gear_green.png';
gearAssets.blue.src   = 'source/images/gear_blue.png';
gearAssets.grey.src   = 'source/images/gear_grey.png';

Object.values(gearAssets).forEach(img => {
    img.onload = () => { needsRedraw1 = true; };
});

const bgAssets = {
    ez: new Image(),
    medium: new Image(),
    hard: new Image()
};

bgAssets.ez.src = 'source/images/bg_ez.png'; 
bgAssets.medium.src = 'source/images/bg_medium.png'; 
bgAssets.hard.src = 'source/images/bg_hard.png'; 

Object.values(bgAssets).forEach(img => {
    img.onload = () => { 
        needsBgCacheUpdate = true; 
        needsRedraw1 = true;
    };
});

let cachedComputedNodeKeys = null;

/* ---------- Config ---------- */
const CONFIG = { cols: 40, rows: 20, maxGearRadius: 6 };
const LAYOUT = { outerPadding: 20, panelGap: 26, trayRatio: 0.3, trayMinHeight: 200 };

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

/* 核心修复 1：回归同步逻辑，彻底消灭时间差崩溃 */
function startGame() {
  const gameArea = document.getElementById("gameArea");
  
  if (gameStarted) {
    if (gameArea && !gameArea.classList.contains("hidden")) {
      gameArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  isGameWon = false;

  if (gameArea) {
    gameArea.classList.remove("hidden");
    // 强制重排，让 CSS 确立
    void gameArea.offsetWidth; 
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 同步初始化：尺寸计算 -> 生成地图 -> 最后再打上 gameStarted 标记
  resizeCanvas();
  buildGame();
  
  gameStarted = true; 
  needsRedraw1 = true;
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
  const introContainer = document.getElementById("introContainer");

  hideWinModal();

  if (markedPoints) markedPoints.clear();
  hoveredPoint = null;

  if (gameArea) {
    gameArea.classList.add("crt-off-anim");
    setTimeout(() => {
      gameArea.classList.remove("crt-off-anim");
      gameArea.classList.add("hidden");
      if (introContainer) introContainer.classList.remove("hidden");
    }, 450);
  }
}

window.startGame = startGame;
window.restartGame = restartGame;
window.exitGame = exitGame;
window.hideWinModal = hideWinModal;

/* 核心修复 2：带安全保底的尺寸重算 */
function resizeCanvas() {
  const w = canvas.clientWidth || 1000;
  const h = canvas.clientHeight || 800;

  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  
  bgCacheCanvas.width = canvas.width;
  bgCacheCanvas.height = canvas.height;
  
  needsBgCacheUpdate = true;
  needsRedraw1 = true;
}

function computeLayout() {
  const outerPadding = Math.max(LAYOUT.outerPadding, Math.min(canvas.width, canvas.height) * 0.02);
  const panelGap = Math.max(LAYOUT.panelGap, canvas.height * 0.02);
  const availableW = canvas.width - outerPadding * 2;
  const availableH = canvas.height - outerPadding * 2;
  const trayH = Math.max(LAYOUT.trayMinHeight, availableH * LAYOUT.trayRatio);
  const mapH = availableH - trayH - panelGap;

  mapPanelRect = { x: outerPadding, y: outerPadding, w: availableW, h: mapH };
  trayPanelRect = { x: outerPadding, y: outerPadding + mapH + panelGap, w: availableW, h: availableH - mapH - panelGap };
}

function computeGrid() {
  computeLayout();
  const gridPadding = 35;
  // 防止极端情况 cell 出现 0 或负数
  cell = Math.max(1, Math.min(
    (mapPanelRect.w - gridPadding * 2) / CONFIG.cols,
    (mapPanelRect.h - gridPadding * 2) / CONFIG.rows
  ));

  const gridW = CONFIG.cols * cell;
  const gridH = CONFIG.rows * cell;
  gridRect = {
    x: mapPanelRect.x + (mapPanelRect.w - gridW) / 2,
    y: mapPanelRect.y + (mapPanelRect.h - gridH) / 2,
    w: gridW, h: gridH
  };

  mapBoundsRect = { ...gridRect };
  offsetX = gridRect.x;
  offsetY = gridRect.y;
  
  needsBgCacheUpdate = true; 
}

function gridToPixel(gx, gy) {
  return { x: offsetX + gx * cell, y: offsetY + gy * cell };
}

function isInsideMapBounds(piece, x, y) {
  if (!gridRect) return false;
  return (x >= gridRect.x && x <= gridRect.x + gridRect.w && y >= gridRect.y && y <= gridRect.y + gridRect.h);
}

/* ---------- Logic ---------- */
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generatePath(diffLevel = window.GAME_DIFFICULTY) {
  const nodes = [];
  const MAX_R = CONFIG.maxGearRadius;
  const MAX_N = 10;
  const MAX_LAST_R = 3;
  const MAX_ATTEMPTS = 1000;
  const EPS = 1e-6;
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
    for (let dx = -MAX_R - 2; dx <= MAX_R + 2; dx++) {
      for (let dy = -MAX_R; dy <= MAX_R; dy++) {
        if (dx === 0 && dy === 0) continue;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        let isOrtho = (dx === 0 || dy === 0); 
        let isValidFormat = false;

        if (mode === 'simple') {
          if (isOrtho) isValidFormat = true;
        } else {
          if (state.rootSq === 0) { isValidFormat = true; } 
          else if (state.sign === 1) { if (isOrtho || distSq === state.rootSq) isValidFormat = true; } 
          else if (state.sign === -1) { if (isOrtho) isValidFormat = true; }
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
    if (diffLevel === 4) {
      let nonIntMoves = allowedMoves.filter(m => {
        let nextIsInt = (state.rootSq === 0 && m.isOrtho) || (state.rootSq !== 0 && !m.isOrtho);
        return !nextIsInt;
      });
      if (nonIntMoves.length > 0 && Math.random() < 0.85) allowedMoves = nonIntMoves;
    }

    let move = allowedMoves[randomInt(0, allowedMoves.length - 1)];
    let newState = { rootSq: 0, sign: 1, intPart: 0, value: move.dist - state.value, text: "" };
    if (state.rootSq === 0) {
      if (move.isOrtho) { newState.intPart = Math.round(move.dist - state.intPart); } 
      else { newState.rootSq = move.distSq; newState.sign = 1; newState.intPart = -state.intPart; }
    } else {
      if (move.isOrtho) { newState.rootSq = state.rootSq; newState.sign = -state.sign; newState.intPart = Math.round(move.dist - state.intPart); } 
      else { newState.rootSq = 0; newState.intPart = Math.round(move.dist - state.value); }
    }
    newState.text = generateRadiusText(newState.rootSq, newState.sign, newState.intPart);

    return { x: lastNode.x + move.dx, y: lastNode.y + move.dy, rState: newState, r: newState.value, rText: newState.text };
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

  const startY = randomInt(2, CONFIG.rows - 3);
  const startR = 2;
  const start = { x: 0, y: startY, r: startR, rState: { rootSq: 0, sign: 1, intPart: startR, value: startR, text: "2" }, rText: "2" };
  nodes.push(start);

  let attempts = 0;
  while (attempts < MAX_ATTEMPTS && nodes.length < MAX_N) {
    attempts++;
    const last = nodes[nodes.length - 1];
    const nextData = generateNextStep(last, difficultyMode);
    if (nextData && canPlaceNode(nextData, nodes.length - 1)) {
      nodes.push(nextData);
      if (nextData.x >= CONFIG.cols - MAX_LAST_R) break; 
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

function drawPathDebug(nodes, targetCtx = ctx) {
  if (!nodes || nodes.length === 0) return;
  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.lineWidth = 3;
  targetCtx.strokeStyle = "rgba(0, 200, 0, 0.8)";
  nodes.forEach((n, i) => {
    const p = gridToPixel(n.x, n.y);
    if (i === 0) targetCtx.moveTo(p.x, p.y);
    else targetCtx.lineTo(p.x, p.y);
  });
  targetCtx.stroke();

  nodes.forEach((n, i) => {
    const p = gridToPixel(n.x, n.y);
    targetCtx.beginPath();
    targetCtx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    if (i === 0) targetCtx.fillStyle = "#00ffcc";
    else if (i === nodes.length - 1) targetCtx.fillStyle = "#ff66cc";
    else targetCtx.fillStyle = "#00cc66";
    targetCtx.fill();
    targetCtx.fillStyle = "#000";
    targetCtx.font = "12px monospace";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "bottom";
    targetCtx.fillText(`r:${n.r}`, p.x, p.y - 8);
    targetCtx.textBaseline = "top";
    targetCtx.fillText(i, p.x, p.y + 8);
  });
  targetCtx.restore();
}

/* ---------- Piece ---------- */
class Piece {
  constructor(node) {
    this.gx = node.x; this.gy = node.y;
    this.r = node.r; this.rText = node.rText || this.r;
    const p = gridToPixel(this.gx, this.gy);
    this.x = p.x; this.y = p.y;
    this.startX = this.x; this.startY = this.y;
    this.isDragging = false; this.inMap = true;
    this.isFixedGray = false; this.isFixed = false;
  }

  get radius() { return this.r * cell; }

  isOverlappingAny() {
    const EPS = 2;
    if (!this.inMap) return false;
    for (let other of pieces) {
      if (other === this || !other.inMap) continue;
      const dx = this.x - other.x, dy = this.y - other.y;
      if (Math.sqrt(dx * dx + dy * dy) < (this.radius + other.radius) - EPS) return true;
    }
    return false;
  }

  isTouchingAny() {
    const EPS = 0.1;
    if (!this.inMap) return false;
    for (let other of pieces) {
      if (other === this || !other.inMap) continue;
      const dx = this.x - other.x, dy = this.y - other.y;
      if (Math.abs(Math.sqrt(dx * dx + dy * dy) - (this.radius + other.radius)) < EPS) return true;
    }
    return false;
  }

  isTouchingPiece(other) {
    const EPS = 2;
    if (!other || other === this || !this.inMap || !other.inMap) return false;
    const dx = this.x - other.x, dy = this.y - other.y;
    return Math.abs(Math.sqrt(dx * dx + dy * dy) - (this.radius + other.radius)) < EPS;
  }

  draw(targetCtx = ctx) {
    targetCtx.save();
    targetCtx.shadowColor = "rgba(0,0,0,0.25)";
    targetCtx.shadowBlur = this.isDragging ? 18 : 8;

    let stateImg = gearAssets.blue; 
    if (this.isOverlappingAny()) stateImg = gearAssets.red;    
    else if (typeof isCorrectlyConnectedToHead === "function" && isCorrectlyConnectedToHead(this)) stateImg = gearAssets.green;  
    else if (this.isTouchingAny()) stateImg = gearAssets.yellow; 
    else if (this.isFixed) stateImg = gearAssets.grey;   

    if (stateImg.complete && stateImg.naturalWidth !== 0) {
        targetCtx.drawImage(stateImg, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    } else {
        targetCtx.beginPath();
        targetCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const colors = { red: "#ff4d4d", yellow: "#ffd84d", green: "#4dff88", blue: "#6aa9ff", grey: "#999" };
        let fallbackColor = colors.blue;
        if (stateImg === gearAssets.red) fallbackColor = colors.red;
        if (stateImg === gearAssets.yellow) fallbackColor = colors.yellow;
        if (stateImg === gearAssets.green) fallbackColor = colors.green;
        if (stateImg === gearAssets.grey) fallbackColor = colors.grey;
        targetCtx.fillStyle = fallbackColor;
        targetCtx.fill();
        targetCtx.lineWidth = 2;
        targetCtx.strokeStyle = "#333";
        targetCtx.stroke();
    }

    targetCtx.shadowBlur = 0;
    targetCtx.beginPath();
    targetCtx.strokeStyle = "rgba(0, 0, 0, 0.8)"; 
    targetCtx.lineWidth = 3;
    const crossHalf = 6;
    targetCtx.moveTo(this.x - crossHalf, this.y); targetCtx.lineTo(this.x + crossHalf, this.y);
    targetCtx.moveTo(this.x, this.y - crossHalf); targetCtx.lineTo(this.x, this.y + crossHalf);
    targetCtx.stroke();

    let textOffsetY = this.radius * 0.4; 
    if (!this.isDragging && this.inMap && this.gy >= (CONFIG.rows - 1)) textOffsetY = -this.radius * 0.5; 

    const fontSize = Math.max(12, Math.min(this.radius * 0.7, 42));
    targetCtx.fillStyle = "#222";
    targetCtx.font = `bold ${fontSize}px sans-serif`;
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.strokeStyle = "rgba(255,255,255,0.8)";
    targetCtx.lineWidth = Math.max(2, fontSize * 0.15);
    targetCtx.strokeText(this.rText, this.x, this.y + textOffsetY);
    targetCtx.fillText(this.rText, this.x, this.y + textOffsetY);

    targetCtx.restore();
  }

  contains(mx, my) {
    const dx = mx - this.x; const dy = my - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  reset() {
    if (this.isFixed) return;
    this.x = this.startX; this.y = this.startY; this.inMap = false;
  }
}

/* ---------- Tray Layout ---------- */
function layoutTray(list) {
  if (!trayPanelRect || !list.length) return;
  const sidePadding = 18, rowGap = Math.max(14, cell * 0.9), pieceGap = Math.max(12, cell * 0.6);
  const availableW = trayPanelRect.w - sidePadding * 2;
  const rows = []; let currentRow = [], currentWidth = 0;

  list.forEach(piece => {
    const pieceWidth = piece.radius * 2;
    const nextWidth = currentRow.length ? currentWidth + pieceGap + pieceWidth : currentWidth + pieceWidth;
    if (currentRow.length && nextWidth > availableW) {
      rows.push(currentRow); currentRow = [piece]; currentWidth = pieceWidth;
    } else {
      currentRow.push(piece); currentWidth = nextWidth;
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
      x += piece.radius; piece.x = x; piece.y = centerY;
      piece.startX = piece.x; piece.startY = piece.y;
      x += piece.radius + pieceGap;
    });
    y += rowHeight + rowGap;
  });
}

/* ---------- Build ---------- */
let validNodeKeys = new Set();
function makeNodeKey(x, y, r) { return `${x},${y},${r}`; }
function getAllComputedNodeKeys() { return cachedComputedNodeKeys || new Set(); }

function isCorrectlyConnectedToHead(piece) {
  if (!piece || !piece.inMap || !pieces.length) return false;
  const head = pieces[0];
  if (!head || !head.inMap) return false;
  const canJoinGreenChain = p => p && p.inMap && !p.isOverlappingAny() && isPieceOnComputedNode(p);
  if (!canJoinGreenChain(piece) || !canJoinGreenChain(head)) return false;

  const visited = new Set(), stack = [head];
  while (stack.length) {
    const cur = stack.pop();
    if (visited.has(cur)) continue;
    visited.add(cur);
    for (const other of pieces) {
      if (visited.has(other) || !canJoinGreenChain(other)) continue;
      if (cur.isTouchingPiece(other)) stack.push(other);
    }
  }
  if (piece === head) return visited.size > 1;
  return visited.has(piece);
}

function buildGame() {
  computeGrid();
  pieces = []; active = null; isGameWon = false;
  hideWinModal(); markedPoints.clear(); hoveredPoint = null;

  let nodes = null;
  const MAX_BUILD_RETRY = 200;
  for (let i = 0; i < MAX_BUILD_RETRY; i++) {
    const candidate = generatePath(window.GAME_DIFFICULTY);
    if (candidate && candidate.length > 0 && candidate[candidate.length - 1].x === CONFIG.cols) { nodes = candidate; break; }
  }

  if (!nodes) return;
  window.__DEBUG_PATH__ = nodes;
  const tray = [];
  validNodeKeys = new Set(nodes.map(n => makeNodeKey(n.x, n.y, n.r)));

  let fixedIndices = new Set([0, nodes.length - 1]);
  let curr = 0;
  while (curr < nodes.length - 1) {
    curr += 2;
    if (curr < nodes.length - 1) fixedIndices.add(curr);
  }
  fixedIndices.add(nodes.length - 1);

  nodes.forEach((n, i) => {
    let p = new Piece(n);
    if (fixedIndices.has(i)) { p.inMap = true; p.isFixed = true; p.isFixedGray = true; } 
    else { p.inMap = false; p.isFixedGray = false; tray.push(p); }
    pieces.push(p);
  });
  
  validNodeKeys = new Set(nodes.map(n => makeNodeKey(n.x, n.y, n.r)));
  cachedComputedNodeKeys = new Set([...validNodeKeys, ...alternativeNodes()]);
  layoutTray(tray);
  needsRedraw1 = true; 
}

function isPieceOnComputedNode(piece) {
  if (!piece.inMap) return false;
  return getAllComputedNodeKeys().has(makeNodeKey(piece.gx, piece.gy, piece.r));
}

function alternativeNodes() {
  const result = new Set(), nodes = window.__DEBUG_PATH__ || [], EPS = 1e-6;
  if (nodes.length < 3) return result;

  function overlapsOtherNodes(ax, ay, ar, skipA, skipB, skipC) {
    for (let j = 0; j < nodes.length; j++) {
      if (j === skipA || j === skipB || j === skipC) continue;
      const other = nodes[j];
      if (Math.hypot(ax - other.x, ay - other.y) < ar + other.r - EPS) return true;
    }
    return false;
  }

  for (let i = 1; i < nodes.length - 1; i++) {
    const prev = nodes[i - 1], cur = nodes[i], next = nodes[i + 1];
    if (pieces[i] && pieces[i].isFixed) continue;
    const targetDist1 = prev.r + cur.r, targetDist2 = next.r + cur.r;
    const searchRadius = Math.ceil(targetDist1);
    const minX = Math.max(0, prev.x - searchRadius), maxX = Math.min(CONFIG.cols, prev.x + searchRadius);
    const minY = Math.max(0, prev.y - searchRadius), maxY = Math.min(CONFIG.rows, prev.y + searchRadius);

    for (let altX = minX; altX <= maxX; altX++) {
      for (let altY = minY; altY <= maxY; altY++) {
        if (altX === cur.x && altY === cur.y) continue;
        const d1 = Math.hypot(altX - prev.x, altY - prev.y), d2 = Math.hypot(altX - next.x, altY - next.y);
        if (Math.abs(d1 - targetDist1) > EPS || Math.abs(d2 - targetDist2) > EPS) continue;
        if (overlapsOtherNodes(altX, altY, cur.r, i - 1, i, i + 1)) continue;
        result.add(makeNodeKey(altX, altY, cur.r));
      }
    }
  }
  return result;
}

function checkWin() {
  if (isGameWon || !pieces.length) return false;
  const allLegalKeys = getAllComputedNodeKeys();
  const movablePieces = pieces.filter(p => !p.isFixed);
  const hasOverlap = pieces.some(p => p.inMap && p.isOverlappingAny());
  const allPlacedCorrectly = movablePieces.every(p => p.inMap && allLegalKeys.has(makeNodeKey(p.gx, p.gy, p.r)));
  const allConnectedToHead = movablePieces.every(p => isCorrectlyConnectedToHead(p));

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
  let gx = Math.round((p.x - offsetX) / cell), gy = Math.round((p.y - offsetY) / cell);
  if (gx >= 0 && gx <= CONFIG.cols && gy >= 0 && gy <= CONFIG.rows) {
    const pos = gridToPixel(gx, gy);
    if (!isInsideMapBounds(p, pos.x, pos.y)) return false;
    p.x = pos.x; p.y = pos.y; p.inMap = true; p.gx = gx; p.gy = gy;
    return true;
  }
  return false;
}

/* ---------- Draw Components ---------- */

function drawMapBase(targetCtx) {
  targetCtx.save();
  let currentBg = (window.GAME_DIFFICULTY === 1) ? bgAssets.ez : (window.GAME_DIFFICULTY === 3 ? bgAssets.medium : bgAssets.hard);

  targetCtx.fillStyle = "#f8fafc"; 
  targetCtx.fillRect(mapPanelRect.x, mapPanelRect.y, mapPanelRect.w, mapPanelRect.h);

  if (currentBg.complete && currentBg.naturalWidth !== 0) {
    targetCtx.globalAlpha = 0.65; 
    const scale = Math.max(mapPanelRect.w / currentBg.naturalWidth, mapPanelRect.h / currentBg.naturalHeight);
    const drawW = currentBg.naturalWidth * scale, drawH = currentBg.naturalHeight * scale;
    const drawX = mapPanelRect.x + (mapPanelRect.w - drawW) / 2, drawY = mapPanelRect.y + (mapPanelRect.h - drawH) / 2;
    targetCtx.drawImage(currentBg, drawX, drawY, drawW, drawH);
    targetCtx.globalAlpha = 1.0; 
  }

  targetCtx.strokeStyle = "rgba(255, 255, 255, 0.7)"; 
  targetCtx.lineWidth = 3;
  targetCtx.strokeRect(gridRect.x, gridRect.y, gridRect.w, gridRect.h);

  for (let i = 0; i <= CONFIG.cols; i++) {
    const x = gridRect.x + i * cell;
    targetCtx.beginPath();
    targetCtx.moveTo(x, gridRect.y); targetCtx.lineTo(x, gridRect.y + gridRect.h);
    targetCtx.stroke();
  }

  for (let j = 0; j <= CONFIG.rows; j++) {
    const y = gridRect.y + j * cell;
    targetCtx.beginPath();
    targetCtx.moveTo(gridRect.x, y); targetCtx.lineTo(gridRect.x + gridRect.w, y);
    targetCtx.stroke();
  }

  targetCtx.fillStyle = "#334155"; 
  targetCtx.font = "bold 18px Arial";
  targetCtx.textAlign = "center"; targetCtx.textBaseline = "bottom";
  for (let i = 0; i <= CONFIG.cols; i++) {
    const x = gridRect.x + i * cell;
    targetCtx.beginPath(); targetCtx.moveTo(x, gridRect.y); targetCtx.lineTo(x, gridRect.y - 6); targetCtx.stroke();
    if (i % 5 === 0) targetCtx.fillText(i, x, gridRect.y - 8);
  }

  targetCtx.textAlign = "right"; targetCtx.textBaseline = "middle";
  for (let j = 0; j <= CONFIG.rows; j++) {
    const y = gridRect.y + j * cell;
    targetCtx.beginPath(); targetCtx.moveTo(gridRect.x, y); targetCtx.lineTo(gridRect.x - 6, y); targetCtx.stroke();
    if (j % 5 === 0) targetCtx.fillText(j, gridRect.x - 8, y);
  }
  targetCtx.restore();
}

function drawTrayBase(targetCtx) {
  targetCtx.save();
  targetCtx.fillStyle = "#f7efe1";
  targetCtx.fillRect(trayPanelRect.x, trayPanelRect.y, trayPanelRect.w, trayPanelRect.h);
  targetCtx.restore();
}

function drawTrayFrame(targetCtx) {
  targetCtx.save();
  targetCtx.lineWidth = 2;
  targetCtx.strokeStyle = "#43536b";
  targetCtx.strokeRect(trayPanelRect.x, trayPanelRect.y, trayPanelRect.w, trayPanelRect.h);
  targetCtx.restore();
}

function drawMapOverlay(targetCtx = ctx) {
  targetCtx.save();
  targetCtx.fillStyle = "#f9fafb";
  targetCtx.fillRect(0, 0, canvas.width, mapPanelRect.y);
  targetCtx.fillRect(0, 0, mapPanelRect.x, canvas.height);
  const rightX = mapPanelRect.x + mapPanelRect.w;
  targetCtx.fillRect(rightX, 0, canvas.width - rightX, canvas.height);
  const mapBottom = mapPanelRect.y + mapPanelRect.h;
  const gapHeight = trayPanelRect.y - mapBottom;
  if (gapHeight > 0) targetCtx.fillRect(mapPanelRect.x, mapBottom, mapPanelRect.w, gapHeight);
  const trayBottom = trayPanelRect.y + trayPanelRect.h;
  targetCtx.fillRect(mapPanelRect.x, trayBottom, mapPanelRect.w, canvas.height - trayBottom);

  targetCtx.lineWidth = 2; targetCtx.strokeStyle = "#43536b";
  targetCtx.strokeRect(mapPanelRect.x, mapPanelRect.y, mapPanelRect.w, mapPanelRect.h);
  targetCtx.strokeRect(trayPanelRect.x, trayPanelRect.y, trayPanelRect.w, trayPanelRect.h);
  targetCtx.restore();
}

function updateBgCache() {
  bgCacheCtx.clearRect(0, 0, bgCacheCanvas.width, bgCacheCanvas.height);
  drawMapBase(bgCacheCtx);
  drawTrayBase(bgCacheCtx);
  drawTrayFrame(bgCacheCtx);
  needsBgCacheUpdate = false;
}

/* 核心拦截：防止因 null 产生白屏死机 */
function draw() {
  if (!canvas.width || !canvas.height || !mapPanelRect || !gridRect || !trayPanelRect) return;

  if (needsBgCacheUpdate) {
    updateBgCache();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgCacheCanvas, 0, 0);

  pieces.filter(p => p.inMap && p !== active).forEach(p => p.draw(ctx));

  if (window.__DEBUG_PATH__) drawPathDebug(window.__DEBUG_PATH__, ctx);

  drawMapOverlay(ctx);

  pieces.filter(p => !p.inMap && p !== active).forEach(p => p.draw(ctx));

  drawGridInteractions(ctx);

  if (active) active.draw(ctx);
}

function getNearestGridPoint(mx, my) {
  if (!gridRect) return null;
  let gx = Math.round((mx - offsetX) / cell), gy = Math.round((my - offsetY) / cell);
  if (gx >= 0 && gx <= CONFIG.cols && gy >= 0 && gy <= CONFIG.rows) {
    const px = offsetX + gx * cell, py = offsetY + gy * cell;
    if (Math.hypot(mx - px, my - py) < cell * 0.4) return { gx, gy, px, py };
  }
  return null;
}

function drawGridInteractions(targetCtx = ctx) {
  targetCtx.save();
  const mToggle = document.getElementById("markToggle");
  const isMarkModeOn = mToggle && mToggle.checked;

  if (isMarkModeOn) {
    targetCtx.fillStyle = "#ff0055"; 
    markedPoints.forEach(key => {
      const [gx, gy] = key.split(',').map(Number);
      const p = gridToPixel(gx, gy);
      targetCtx.beginPath(); targetCtx.arc(p.x, p.y, 6, 0, Math.PI * 2); targetCtx.fill();
      targetCtx.strokeStyle = "#fff"; targetCtx.lineWidth = 1.5; targetCtx.stroke();
    });
  }

  if (hoveredPoint && !active && isMarkModeOn) {
    const { gx, gy, px, py } = hoveredPoint;
    targetCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
    targetCtx.beginPath(); targetCtx.arc(px, py, 4, 0, Math.PI * 2); targetCtx.fill();

    const text = `(${gx}, ${gy})`;
    targetCtx.font = "bold 13px Arial";
    const metrics = targetCtx.measureText(text);
    const boxW = metrics.width + 12, boxH = 24;
    let tx = px + 12, ty = py - 12 - boxH;

    targetCtx.fillStyle = "rgba(255, 255, 255, 0.95)";
    targetCtx.strokeStyle = "#333"; targetCtx.lineWidth = 1;
    targetCtx.fillRect(tx, ty, boxW, boxH); targetCtx.strokeRect(tx, ty, boxW, boxH);

    targetCtx.fillStyle = "#111"; targetCtx.textAlign = "left"; targetCtx.textBaseline = "top";
    targetCtx.fillText(text, tx + 6, ty + 4);
  }
  targetCtx.restore();
}

/* ---------- Events ---------- */
const markToggle = document.getElementById("markToggle");

let needsRedraw1 = false;

canvas.addEventListener("mousedown", e => {
  if (isGameWon) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;

  let clickedGear = false;
  for (let i = pieces.length - 1; i >= 0; i--) {
    if (pieces[i].contains(mx, my) && !pieces[i].isFixed) {
      active = pieces[i];
      active.isDragging = true;
      offsetMX = mx - active.x; offsetMY = my - active.y;
      clickedGear = true;
      needsRedraw1 = true; 
      break; 
    }
  }

  if (!clickedGear && markToggle && markToggle.checked) {
    const nearest = getNearestGridPoint(mx, my);
    if (nearest) {
      const key = `${nearest.gx},${nearest.gy}`;
      markedPoints.has(key) ? markedPoints.delete(key) : markedPoints.add(key);
      needsRedraw1 = true;
    }
  }
});


canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;

  if (active) {
    active.x = mx - offsetMX; active.y = my - offsetMY;
    needsRedraw1 = true; 
    return;
  }

  const nearest = getNearestGridPoint(mx, my);
  let localNeedsRedraw = false;
  
  if (nearest) {
    if (!hoveredPoint || hoveredPoint.gx !== nearest.gx || hoveredPoint.gy !== nearest.gy) {
      hoveredPoint = nearest; localNeedsRedraw = true;
    }
  } else {
    if (hoveredPoint) { hoveredPoint = null; localNeedsRedraw = true; }
  }

  if (localNeedsRedraw) needsRedraw1 = true; 
});

function stopDrag() {
  if (!active) return;
  active.isDragging = false;
  if (!snap(active)) active.reset();
  active = null;
  needsRedraw1 = true; 
  checkWin();
}

function relayoutCurrentGame() {
  if (!pieces || pieces.length === 0) return;
  resizeCanvas(); computeGrid();
  pieces.forEach(p => {
    if (p.inMap) { const pos = gridToPixel(p.gx, p.gy); p.x = pos.x; p.y = pos.y; }
  });
  layoutTray(pieces.filter(p => !p.inMap));
  needsRedraw1 = true; 
}

function resetGame() { buildGame(); }

canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

window.addEventListener('resize', relayoutCurrentGame);

document.getElementById('resetBtn').addEventListener('click', resetGame);

if (markToggle) {
    markToggle.addEventListener('change', () => {
        if (!markToggle.checked) hoveredPoint = null;
        needsRedraw1 = true; 
    });
}

const difficultySelect = document.getElementById('difficultySelect');
if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
        window.GAME_DIFFICULTY = parseInt(e.target.value, 10);
        needsBgCacheUpdate = true; 
        if (gameStarted) resetGame();
    });
}

function mainLoop1() {
    if (needsRedraw1 && gameStarted) {
        draw();
        needsRedraw1 = false;
    }
    requestAnimationFrame(mainLoop1);
}
mainLoop1();