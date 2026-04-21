/* =========================
   Game 2 - Circular Maze (Layered Rendering Optimized)
   ========================= */

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

// --- 渲染优化标志位 ---
let needsBgCacheUpdate2 = true;
let needsRedraw2 = false;
let lastThemeWasDark = window.isDarkMode; // 用于监听主题切换以重绘静态缓存

let gameStarted2 = false;
let isGameWon2 = false;
let winTimer2 = null;

let cx = 0; 
let cy = 0; 
let maxRadius = 0; 

// --- 难度配置 ---
const DIFFICULTIES = {
    easy: { rings: 6, sectors: 12 },
    hard: { rings: 9, sectors: 20 }
};

let currentDifficulty = 'easy';
let currentRingCount = DIFFICULTIES[currentDifficulty].rings;
let currentSectorCount = DIFFICULTIES[currentDifficulty].sectors;
let SECTOR_ANGLE = (Math.PI * 2) / currentSectorCount; 

const SNAP_ENTER_THRESHOLD = 0.06;
const SNAP_EXIT_THRESHOLD = 0.20;

let playerDisk = {
    angle: 0,      
    radius: 0,     
    dotSize: 10    
};

let uiState = {
    isDraggingAngle: false,
    isDraggingRadius: false,
    intendedAngle: 0,   
    intendedRing: 0,    
    
    angleTrackRadius: 0, 
    sliderX: 0,          
    sliderYTop: 0,       
    sliderYBottom: 0     
};

let currentMaze = null;

/* ---------- 难度切换逻辑 ---------- */
function setDifficulty2(level) {
    if (DIFFICULTIES[level] && currentDifficulty !== level) {
        currentDifficulty = level;
        currentRingCount = DIFFICULTIES[level].rings;
        currentSectorCount = DIFFICULTIES[level].sectors;
        SECTOR_ANGLE = (Math.PI * 2) / currentSectorCount;
        
        if (gameStarted2) {
            restartGame2(); 
        }
    }
}

/* ---------- 迷宫生成逻辑 ---------- */
function generateMazeMap(ringCount, sectorCount) {
    const ringWalls = Array.from({ length: ringCount }, () => Array(sectorCount).fill(true));
    const radialWalls = Array.from({ length: ringCount }, () => Array(sectorCount).fill(true));
    const visited = Array.from({ length: ringCount }, () => Array(sectorCount).fill(false));
    
    const startSector = Math.floor(Math.random() * sectorCount);
    const stack = [];
    let currentR = ringCount - 1; 
    let currentS = startSector;
    
    visited[currentR][currentS] = true;
    stack.push({ r: currentR, s: currentS });
    
    const getWeightedNeighbors = (r, s) => {
        const neighbors = [];
        const CROSS_RING_WEIGHT = 1;
        const SAME_RING_WEIGHT = 5; 

        if (r > 1 && !visited[r - 1][s]) neighbors.push({ r: r - 1, s: s, dir: 'in', weight: CROSS_RING_WEIGHT });
        if (r < ringCount - 1 && !visited[r + 1][s]) neighbors.push({ r: r + 1, s: s, dir: 'out', weight: CROSS_RING_WEIGHT });
        
        let cw = (s + 1) % sectorCount;
        if (!visited[r][cw]) neighbors.push({ r: r, s: cw, dir: 'cw', weight: SAME_RING_WEIGHT });
        let ccw = (s - 1 + sectorCount) % sectorCount;
        if (!visited[r][ccw]) neighbors.push({ r: r, s: ccw, dir: 'ccw', weight: SAME_RING_WEIGHT });
        
        return neighbors;
    };
    
    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        let neighbors = getWeightedNeighbors(current.r, current.s);
        
        if (neighbors.length > 0) {
            let totalWeight = neighbors.reduce((sum, n) => sum + n.weight, 0);
            let randomVal = Math.random() * totalWeight;
            let next = null;
            
            for (let i = 0; i < neighbors.length; i++) {
                randomVal -= neighbors[i].weight;
                if (randomVal <= 0) {
                    next = neighbors[i];
                    break;
                }
            }
            
            if (next.dir === 'in') ringWalls[current.r][current.s] = false; 
            else if (next.dir === 'out') ringWalls[next.r][current.s] = false;
            else if (next.dir === 'cw') radialWalls[current.r][current.s] = false;
            else if (next.dir === 'ccw') radialWalls[current.r][next.s] = false; 
            
            visited[next.r][next.s] = true;
            stack.push({ r: next.r, s: next.s });
        } else {
            stack.pop();
        }
    }
    
    const centerEntranceSector = Math.floor(Math.random() * sectorCount);
    ringWalls[1][centerEntranceSector] = false;
    
    for (let r = 1; r < ringCount; r++) {
        for (let s = 0; s < sectorCount; s++) {
            if (radialWalls[r][s] && Math.random() < 0.05) radialWalls[r][s] = false;
        }
    }
    
    return { ringWalls, radialWalls, startSector };
}

/* ---------- 生命周期 ---------- */
function startGame2() {
    const gameArea2 = document.getElementById("gameArea2");
    
    if (gameStarted2) {
        if (gameArea2 && !gameArea2.classList.contains("hidden")) {
            gameArea2.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    gameStarted2 = true;
    isGameWon2 = false;
    
    if (gameArea2) {
        gameArea2.classList.remove("hidden");
        void gameArea2.offsetWidth; 
        setTimeout(() => {
            gameArea2.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    }
    
    setTimeout(() => {
        resizeCanvas2();
        currentMaze = generateMazeMap(currentRingCount, currentSectorCount); 
        needsBgCacheUpdate2 = true; 
        initPlayer();
        needsRedraw2 = true;
    }, 50);
}

function exitGame2() {
    gameStarted2 = false;
    if (winTimer2) clearTimeout(winTimer2);
    if (typeof hideWinModal === 'function') hideWinModal();

    const gameArea2 = document.getElementById("gameArea2");
    const introContainer = document.getElementById("introContainer");

    if (gameArea2) {
        gameArea2.classList.add("crt-off-anim");
        setTimeout(() => {
            gameArea2.classList.remove("crt-off-anim"); 
            gameArea2.classList.add("hidden");          
            if (introContainer) introContainer.classList.remove("hidden"); 
        }, 450);
    }
}

function restartGame2() {
    isGameWon2 = false;
    if (winTimer2) clearTimeout(winTimer2);
    if (typeof hideWinModal === 'function') hideWinModal();
    resizeCanvas2();
    currentMaze = generateMazeMap(currentRingCount, currentSectorCount);
    needsBgCacheUpdate2 = true;
    initPlayer();
    needsRedraw2 = true;
}

function resizeCanvas2() {
    canvas2.width = canvas2.clientWidth || 1000;
    canvas2.height = canvas2.clientHeight || 800;
    
    cx = canvas2.width / 2;
    cy = canvas2.height / 2;
    maxRadius = Math.max(10, Math.min(cx, cy) - 50);
    
    uiState.angleTrackRadius = maxRadius + 20; 
    uiState.sliderX = cx + maxRadius + 45;      
    uiState.sliderYTop = cy - maxRadius;        
    uiState.sliderYBottom = cy + maxRadius;

    offscreenCanvas.width = canvas2.width;
    offscreenCanvas.height = canvas2.height;     
    
    needsBgCacheUpdate2 = true;
    needsRedraw2 = true;
}

// 绑定窗口调整大小事件
window.addEventListener('resize', () => {
    if (gameStarted2 && !document.getElementById("gameArea2").classList.contains("hidden")) {
        resizeCanvas2();
    }
});

function initPlayer() {
    uiState.intendedRing = currentRingCount - 1;
    uiState.intendedAngle = (currentMaze.startSector + 0.5) * SECTOR_ANGLE;
    
    const ringWidth = maxRadius / currentRingCount;
    playerDisk.dotSize = Math.max(6, Math.min(12, ringWidth * 0.35));
    playerDisk.radius = (uiState.intendedRing + 0.5) * ringWidth; 
    playerDisk.angle = uiState.intendedAngle; 
}

/* ---------- 核心逻辑：基于数据的轨道钳制引擎 ---------- */

function angleDist(a1, a2) {
    let d = a1 - a2;
    while(d > Math.PI) d -= Math.PI*2;
    while(d < -Math.PI) d += Math.PI*2;
    return Math.abs(d);
}

function getLogicalTrackBounds(ring, currentAngle, stopDist) {
    if (ring === 0) return { isClosed: true };

    let normAngle = (currentAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const currentSector = Math.floor(normAngle / SECTOR_ANGLE) % currentSectorCount;
    
    let rightWallSec = currentSector;
    let rightSteps = 0;
    while (!currentMaze.radialWalls[ring][rightWallSec] && rightSteps < currentSectorCount) {
        rightWallSec = (rightWallSec + 1) % currentSectorCount;
        rightSteps++;
    }
    
    let leftWallSec = currentSector;
    let leftSteps = 0;
    let leftWallCheck = (leftWallSec - 1 + currentSectorCount) % currentSectorCount;
    while (!currentMaze.radialWalls[ring][leftWallCheck] && leftSteps < currentSectorCount) {
        leftWallSec = (leftWallSec - 1 + currentSectorCount) % currentSectorCount;
        leftWallCheck = (leftWallSec - 1 + currentSectorCount) % currentSectorCount;
        leftSteps++;
    }

    if (rightSteps >= currentSectorCount) return { isClosed: true };

    let minBound = leftWallSec * SECTOR_ANGLE + stopDist;
    let maxBound = (rightWallSec + 1) * SECTOR_ANGLE - stopDist;

    return { min: minBound, max: maxBound, isClosed: false };
}

function clampAngleToArc(angle, minA, maxA) {
    let a = (angle % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    let mn = (minA % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    let mx = (maxA % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    
    let inside = false;
    if (mn <= mx) inside = (a >= mn && a <= mx);
    else inside = (a >= mn || a <= mx);
    
    if (inside) return a;
    
    let distToMin = angleDist(a, mn);
    let distToMax = angleDist(a, mx);
    return (distToMin < distToMax) ? mn : mx;
}

function getConstrainedPos(rawAngle, rawRadius, currentAngle, currentRadius) {
    if (!currentMaze) return { angle: rawAngle, radius: currentRadius };

    const ringWidth = maxRadius / currentRingCount;
    let currentRing = Math.floor(currentRadius / ringWidth);
    currentRing = Math.max(0, Math.min(currentRingCount - 1, currentRing));

    let airWallPadding = 2; 
    let stopDist = airWallPadding / currentRadius; 

    // --- 1. 处理磁吸意图 ---
    let mouseSector = Math.floor(rawAngle / SECTOR_ANGLE);
    let mouseMidA = (mouseSector + 0.5) * SECTOR_ANGLE;
    let isSnapped = angleDist(currentAngle, mouseMidA) < 0.01;
    let activeThreshold = isSnapped ? SNAP_EXIT_THRESHOLD : SNAP_ENTER_THRESHOLD;

    let intendedAngle = rawAngle;
    if (angleDist(rawAngle, mouseMidA) < activeThreshold) {
        intendedAngle = mouseMidA;
    }

    // --- 2. 绝对数据钳制 ---
    let bounds = getLogicalTrackBounds(currentRing, currentAngle, stopDist);
    let finalAngle = intendedAngle;

    if (!bounds.isClosed) finalAngle = clampAngleToArc(intendedAngle, bounds.min, bounds.max);

    // --- 3. 径向数据跳跃 ---
    let targetRing = Math.floor(rawRadius / ringWidth);
    targetRing = Math.max(0, Math.min(currentRingCount - 1, targetRing));
    
    let normFinalAngle = (finalAngle % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    let actualSector = Math.floor(normFinalAngle / SECTOR_ANGLE) % currentSectorCount;

    let finalRing = currentRing;
    let step = targetRing > currentRing ? 1 : -1;
    
    while (finalRing !== targetRing) {
        let nextR = finalRing + step;
        let wallToCheck = (step === 1) ? nextR : finalRing;
        
        if (currentMaze.ringWalls[wallToCheck][actualSector]) break; 

        let radiusAtWall = wallToCheck * ringWidth;
        let minGapPx = Math.max(35, playerDisk.dotSize * 3.5); 
        let doorHalfAngle = (minGapPx / 2) / radiusAtWall;

        let midAngle = (actualSector + 0.5) * SECTOR_ANGLE;
        let distToMid = angleDist(finalAngle, midAngle);
        
        if (distToMid > doorHalfAngle) break;
        finalRing = nextR;
    }

    finalAngle = (finalAngle % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    return { angle: finalAngle, radius: (finalRing + 0.5) * ringWidth };
}

/* ---------- 交互事件 ---------- */

function processInputs(mx, my) {
    if (uiState.isDraggingAngle) {
        let rawAngle = Math.atan2(my - cy, mx - cx);
        if (rawAngle < 0) rawAngle += Math.PI * 2;
        uiState.intendedAngle = rawAngle;
    }
    
    if (uiState.isDraggingRadius) {
        let t = (uiState.sliderYBottom - my) / (uiState.sliderYBottom - uiState.sliderYTop);
        t = Math.max(0, Math.min(1, t)); 
        let rawRing = t * (currentRingCount - 1);
        uiState.intendedRing = Math.round(rawRing);
    }
    
    const ringWidth = maxRadius / currentRingCount;
    let rawRadius = (uiState.intendedRing + 0.5) * ringWidth;
    
    const constrained = getConstrainedPos(uiState.intendedAngle, rawRadius, playerDisk.angle, playerDisk.radius);
    
    playerDisk.angle = constrained.angle;
    playerDisk.radius = constrained.radius;
    uiState.intendedRing = Math.floor(playerDisk.radius / ringWidth);

    needsRedraw2 = true;
    checkWin2();
}

canvas2.addEventListener("mousedown", (e) => {
    if (isGameWon2) return;
    const rect = canvas2.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const distToCenter = Math.hypot(mx - cx, my - cy);
    if (Math.abs(distToCenter - uiState.angleTrackRadius) < 25) uiState.isDraggingAngle = true;
    if (Math.abs(mx - uiState.sliderX) < 25 && my >= uiState.sliderYTop - 20 && my <= uiState.sliderYBottom + 20) uiState.isDraggingRadius = true;
    
    if (uiState.isDraggingAngle || uiState.isDraggingRadius) processInputs(mx, my);
});

canvas2.addEventListener("mousemove", (e) => {
    if (isGameWon2 || (!uiState.isDraggingAngle && !uiState.isDraggingRadius)) return;
    const rect = canvas2.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    processInputs(mx, my);
});

window.addEventListener("mouseup", () => { 
    uiState.isDraggingAngle = false; uiState.isDraggingRadius = false; needsRedraw2 = true; 
});
window.addEventListener("mouseleave", () => { 
    uiState.isDraggingAngle = false; uiState.isDraggingRadius = false; needsRedraw2 = true;
});

canvas2.addEventListener("wheel", (e) => {
    if (!gameStarted2 || isGameWon2) return;
    e.preventDefault(); 

    const ringWidth = maxRadius / currentRingCount;
    const currentPhysicalRing = Math.floor(playerDisk.radius / ringWidth);
    let targetRing = currentPhysicalRing;

    if (e.deltaY > 0 && currentPhysicalRing > 0) targetRing = currentPhysicalRing - 1; 
    else if (e.deltaY < 0 && currentPhysicalRing < currentRingCount - 1) targetRing = currentPhysicalRing + 1; 

    let targetRawRadius = (targetRing + 0.5) * ringWidth;
    const constrained = getConstrainedPos(uiState.intendedAngle, targetRawRadius, playerDisk.angle, playerDisk.radius);
    
    playerDisk.angle = constrained.angle;
    playerDisk.radius = constrained.radius;
    uiState.intendedRing = Math.floor(playerDisk.radius / ringWidth);

    needsRedraw2 = true;
    checkWin2();
}, { passive: false });

/* ---------- 分层绘图与碰撞判定 ---------- */
function checkWin2() {
    if (isGameWon2) return;
    const ringWidth = maxRadius / currentRingCount;
    
    if (playerDisk.radius <= ringWidth * 0.6) { 
        isGameWon2 = true;
        winTimer2 = setTimeout(() => {
            if(typeof showWinModal === 'function') showWinModal();
        }, 300);
    }
}

// === 渲染核心 1：将静态环境完全固化在离屏画布 ===
function updateBgCache2() {
    if (!currentMaze) return;
    const ctx = offscreenCtx; 
    const ringWidth = maxRadius / currentRingCount;
    
    ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    
    // 1. 绘制网格辅助线
    ctx.save();
    ctx.strokeStyle = window.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i < currentSectorCount; i++) {
        const a = (i + 0.5) * SECTOR_ANGLE;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * maxRadius, cy + Math.sin(a) * maxRadius);
        ctx.stroke();
    }
    ctx.restore();

    // 2. 绘制中心终点区域
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ringWidth * 0.5, 0, Math.PI * 2); 
    ctx.fillStyle = window.isDarkMode ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 0, 0, 0.1)"; 
    ctx.fill();
    ctx.strokeStyle = window.isDarkMode ? "rgba(16, 185, 129, 0.4)" : "rgba(139, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 3. 绘制迷宫墙壁
    ctx.save();
    ctx.strokeStyle = window.isDarkMode ? "#801e80ff" : "#2c2c2c"; 
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath(); 

    for (let r = 1; r < currentRingCount; r++) {
        const radius = r * ringWidth; 
        for (let s = 0; s < currentSectorCount; s++) {
            const startAngle = s * SECTOR_ANGLE;
            const endAngle = (s + 1) * SECTOR_ANGLE;
            if (currentMaze.ringWalls[r][s]) {
                ctx.moveTo(cx + Math.cos(startAngle) * radius, cy + Math.sin(startAngle) * radius);
                ctx.arc(cx, cy, radius, startAngle, endAngle);
            } else {
                let minGapPx = Math.max(22, playerDisk.dotSize * 2.5);
                let doorHalfAngle = Math.min((minGapPx / 2) / radius, SECTOR_ANGLE * 0.4);
                const midAngle = (s + 0.5) * SECTOR_ANGLE;
                ctx.moveTo(cx + Math.cos(startAngle) * radius, cy + Math.sin(startAngle) * radius);
                ctx.arc(cx, cy, radius, startAngle, midAngle - doorHalfAngle);
                ctx.moveTo(cx + Math.cos(midAngle + doorHalfAngle) * radius, cy + Math.sin(midAngle + doorHalfAngle) * radius);
                ctx.arc(cx, cy, radius, midAngle + doorHalfAngle, endAngle);
            }
        }
    }
    
    ctx.moveTo(cx + maxRadius, cy);
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    for (let r = 1; r < currentRingCount; r++) {
        const innerRadius = r * ringWidth;
        const outerRadius = (r + 1) * ringWidth;
        for (let s = 0; s < currentSectorCount; s++) {
            if (currentMaze.radialWalls[r][s]) {
                const angle = (s + 1) * SECTOR_ANGLE;
                ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
                ctx.lineTo(cx + Math.cos(angle) * outerRadius, cy + Math.sin(angle) * outerRadius);
            }
        }
    }
    ctx.stroke(); 
    ctx.restore();

    // 4. 绘制自定义控件静态 UI 轨道
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, uiState.angleTrackRadius, 0, Math.PI * 2);
    ctx.strokeStyle = window.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 6;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(uiState.sliderX, uiState.sliderYTop);
    ctx.lineTo(uiState.sliderX, uiState.sliderYBottom);
    ctx.strokeStyle = window.isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"; 
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();
    
    for(let i = 0; i < currentRingCount; i++) {
        let y = uiState.sliderYBottom - (i / (currentRingCount - 1)) * (uiState.sliderYBottom - uiState.sliderYTop);
        ctx.beginPath();
        ctx.moveTo(uiState.sliderX - 8, y);
        ctx.lineTo(uiState.sliderX + 8, y);
        ctx.strokeStyle = window.isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();

    needsBgCacheUpdate2 = false;
}

// === 渲染核心 2：动态把手（仅重绘变动部分）===
function drawDynamicUI() {
    ctx2.save();
    const activeColor = "#ff0055"; 
    const idleColor = "#00f0ff";   
    
    // 角度环形滑块把手
    let kx = cx + Math.cos(playerDisk.angle) * uiState.angleTrackRadius;
    let ky = cy + Math.sin(playerDisk.angle) * uiState.angleTrackRadius;
    ctx2.beginPath();
    ctx2.arc(kx, ky, 12, 0, Math.PI * 2);
    ctx2.fillStyle = uiState.isDraggingAngle ? activeColor : idleColor;
    ctx2.fill();
    ctx2.strokeStyle = window.isDarkMode ? "white" : "#333";
    ctx2.lineWidth = 2;
    ctx2.stroke();

    // 垂直半径滑块把手
    const ringWidth = maxRadius / currentRingCount;
    let currentRing = Math.floor(playerDisk.radius / ringWidth);
    currentRing = Math.max(0, Math.min(currentRingCount - 1, currentRing)); 
    let sy = uiState.sliderYBottom - (currentRing / (currentRingCount - 1)) * (uiState.sliderYBottom - uiState.sliderYTop);
    
    ctx2.beginPath();
    ctx2.arc(uiState.sliderX, sy, 12, 0, Math.PI * 2);
    ctx2.fillStyle = uiState.isDraggingRadius ? activeColor : idleColor;
    ctx2.fill();
    ctx2.strokeStyle = window.isDarkMode ? "white" : "#333";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    
    ctx2.restore();
}

function draw2() {
    if (!canvas2.width || !canvas2.height) return;

    // 自动侦测主题切换：无痛触发静态环境重绘
    if (lastThemeWasDark !== window.isDarkMode) {
        needsBgCacheUpdate2 = true;
        lastThemeWasDark = window.isDarkMode;
    }

    if (needsBgCacheUpdate2) {
        updateBgCache2();
    }

    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    
    // 1. 直接贴上已经画好的静态离屏画布（极其丝滑）
    ctx2.drawImage(offscreenCanvas, 0, 0);

    // 2. 玩家当前所在轨道的标识线（动态）
    ctx2.beginPath();
    ctx2.arc(cx, cy, playerDisk.radius, 0, Math.PI * 2);
    ctx2.strokeStyle = window.isDarkMode ? "rgba(255, 255, 0, 0.4)" : "rgba(0, 0, 0, 0.1)";
    ctx2.lineWidth = 2;
    ctx2.stroke();

    // 3. 动态控件手柄
    drawDynamicUI();

    // 4. 绘制玩家小球
    ctx2.save(); 
    const isInteracting = uiState.isDraggingAngle || uiState.isDraggingRadius;
    const dotX = cx + Math.cos(playerDisk.angle) * playerDisk.radius;
    const dotY = cy + Math.sin(playerDisk.angle) * playerDisk.radius;
    
    let coreColor, shadowColor;
    if (window.isDarkMode) {
        coreColor = isInteracting ? "#ff0055" : "#00f0ff";
        shadowColor = isInteracting ? "rgba(255, 0, 85, 0.8)" : "rgba(0, 240, 255, 0.8)";
    } else {
        coreColor = isInteracting ? "#8b0000" : "#2c2c2c";
        shadowColor = "rgba(0, 0, 0, 0.3)";
    }

    ctx2.beginPath();
    ctx2.arc(dotX, dotY, playerDisk.dotSize, 0, Math.PI * 2);
    ctx2.fillStyle = coreColor;
    
    if (window.isDarkMode) {
        ctx2.shadowBlur = 20;
        ctx2.shadowColor = shadowColor;
    } else {
        ctx2.shadowBlur = 8; 
        ctx2.shadowColor = shadowColor;
    }
    ctx2.fill();

    ctx2.lineWidth = window.isDarkMode ? 2 : 1;
    ctx2.strokeStyle = window.isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.5)";
    ctx2.stroke();
    
    ctx2.restore(); 
}

function mainLoop2() {
    if (needsRedraw2 && gameStarted2) {
        draw2();
        needsRedraw2 = false;
    }
    requestAnimationFrame(mainLoop2);
}
mainLoop2();

window.startGame2 = startGame2;
window.exitGame2 = exitGame2;
window.restartGame2 = restartGame2;
window.setDifficulty2 = setDifficulty2;