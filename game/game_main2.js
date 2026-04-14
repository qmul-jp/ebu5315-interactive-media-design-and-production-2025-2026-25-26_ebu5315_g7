/* =========================
   Game 2 - Circular Maze (Solid Physics & Remote Controls)
   ========================= */

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

let gameStarted2 = false;
let isGameWon2 = false;
let winTimer2 = null;

let cx = 0; 
let cy = 0; 
let maxRadius = 0; 

// --- 新增：难度配置 ---
const DIFFICULTIES = {
    easy: { rings: 6, sectors: 12 },
    hard: { rings: 9, sectors: 20 } // 困难模式：9层，20个分区
};

let currentDifficulty = 'easy';
let currentRingCount = DIFFICULTIES[currentDifficulty].rings;
let currentSectorCount = DIFFICULTIES[currentDifficulty].sectors;
let SECTOR_ANGLE = (Math.PI * 2) / currentSectorCount; 

// 磁吸滞回参数
const SNAP_ENTER_THRESHOLD = 0.06;
const SNAP_EXIT_THRESHOLD = 0.20;

let playerDisk = {
    angle: 0,      
    radius: 0,     
    dotSize: 10    // 现在会在 initPlayer 中动态调整
};

// 独立的 UI 控制器状态
let uiState = {
    isDraggingAngle: false,
    isDraggingRadius: false,
    intendedAngle: 0,   
    intendedRing: 0,    
    
    // UI 布局参数（在 resize 时计算）
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
            restartGame2(); // 切换后自动重新生成并重置
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
            
            if (next.dir === 'in') {
                ringWalls[current.r][current.s] = false; 
            } else if (next.dir === 'out') {
                ringWalls[next.r][current.s] = false;
            } else if (next.dir === 'cw') {
                radialWalls[current.r][current.s] = false;
            } else if (next.dir === 'ccw') {
                radialWalls[current.r][next.s] = false; 
            }
            
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
            if (radialWalls[r][s] && Math.random() < 0.05) { 
                radialWalls[r][s] = false;
            }
        }
    }
    
    return { ringWalls, radialWalls, startSector };
}

/* ---------- 生命周期 ---------- */
function startGame2() {
    if (gameStarted2) return;
    gameStarted2 = true;
    isGameWon2 = false;
    
    const gameArea2 = document.getElementById("gameArea2");
    if (gameArea2) {
        gameArea2.classList.remove("hidden");
        void gameArea2.offsetWidth; 
    }
    setTimeout(() => {
        resizeCanvas2();
        currentMaze = generateMazeMap(currentRingCount, currentSectorCount); 
        initPlayer();
        draw2();
    }, 50);
}

function exitGame2() {
    gameStarted2 = false;
    if (winTimer2) clearTimeout(winTimer2);
    const gameArea2 = document.getElementById("gameArea2");
    if (gameArea2) gameArea2.classList.add("hidden");
    if (typeof hideWinModal === 'function') hideWinModal();
}

function restartGame2() {
    isGameWon2 = false;
    if (winTimer2) clearTimeout(winTimer2);
    if (typeof hideWinModal === 'function') hideWinModal();
    resizeCanvas2();
    currentMaze = generateMazeMap(currentRingCount, currentSectorCount);
    initPlayer();
    draw2();
}

function resizeCanvas2() {
    // 获取容器大小，如果没有则给定一个更大的默认回退尺寸 (1000x800)
    canvas2.width = canvas2.clientWidth || 1000;
    canvas2.height = canvas2.clientHeight || 800;
    
    // 如果想要迷宫偏左边一点给右侧滑块留空间，可以微调 cx，比如：
    // cx = canvas2.width / 2 - 30;
    cx = canvas2.width / 2;
    cy = canvas2.height / 2;
    
    // 【核心修改 1】：减小边距（从 90 缩小到 50），让迷宫圆盘变大
    maxRadius = Math.max(10, Math.min(cx, cy) - 50); 
    
    // 【核心修改 2】：UI 控件往里收紧，防止迷宫变大后 UI 被挤出屏幕边界
    uiState.angleTrackRadius = maxRadius + 20;  // 环形滑块轨道紧贴外墙
    uiState.sliderX = cx + maxRadius + 45;      // 竖向滑块贴近右侧
    uiState.sliderYTop = cy - maxRadius;        
    uiState.sliderYBottom = cy + maxRadius;     
}

function initPlayer() {
    uiState.intendedRing = currentRingCount - 1;
    uiState.intendedAngle = (currentMaze.startSector + 0.5) * SECTOR_ANGLE;
    
    const ringWidth = maxRadius / currentRingCount;
    
    // 【修改】：保证小球视觉上足够大（最小 6 像素，最大 12 像素），不再无限缩小
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
    if (mn <= mx) {
        inside = (a >= mn && a <= mx);
    } else { 
        inside = (a >= mn || a <= mx);
    }
    
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

    // 【核心修改】：碰撞判定不再计算小球的物理体积 (dotSize)，仅算中心点。
    // 保留 2 像素的极小空气墙，防止圆心正好压在墙壁线上引发逻辑抖动
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

    if (!bounds.isClosed) {
        finalAngle = clampAngleToArc(intendedAngle, bounds.min, bounds.max);
    }

    // --- 3. 径向数据跳跃 ---
    let targetRing = Math.floor(rawRadius / ringWidth);
    targetRing = Math.max(0, Math.min(currentRingCount - 1, targetRing));
    
    let normFinalAngle = (finalAngle % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    let actualSector = Math.floor(normFinalAngle / SECTOR_ANGLE) % currentSectorCount;

    let finalRing = currentRing;
    let step = targetRing > currentRing ? 1 : -1;
    
    // 跳跃判定的逻辑本来就是只看实际所在的扇区(actualSector)，现在配合质点碰撞，可以丝滑过门
    while (finalRing !== targetRing) {
        let nextR = finalRing + step;
        let wallToCheck = (step === 1) ? nextR : finalRing;
        if (currentMaze.ringWalls[wallToCheck][actualSector]) {
            break; 
        }
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

    draw2();
    checkWin2();
}

canvas2.addEventListener("mousedown", (e) => {
    if (isGameWon2) return;
    const rect = canvas2.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const distToCenter = Math.hypot(mx - cx, my - cy);
    if (Math.abs(distToCenter - uiState.angleTrackRadius) < 25) {
        uiState.isDraggingAngle = true;
    }
    
    if (Math.abs(mx - uiState.sliderX) < 25 && my >= uiState.sliderYTop - 20 && my <= uiState.sliderYBottom + 20) {
        uiState.isDraggingRadius = true;
    }
    
    if (uiState.isDraggingAngle || uiState.isDraggingRadius) {
        processInputs(mx, my);
    }
});

canvas2.addEventListener("mousemove", (e) => {
    if (isGameWon2 || (!uiState.isDraggingAngle && !uiState.isDraggingRadius)) return;
    const rect = canvas2.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    processInputs(mx, my);
});

window.addEventListener("mouseup", () => { 
    uiState.isDraggingAngle = false; 
    uiState.isDraggingRadius = false; 
    draw2(); 
});
window.addEventListener("mouseleave", () => { 
    uiState.isDraggingAngle = false; 
    uiState.isDraggingRadius = false; 
    draw2(); 
});

/* ---------- 绘图与碰撞判定 ---------- */
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

function drawMazeWalls() {
    if (!currentMaze) return;
    const ringWidth = maxRadius / currentRingCount;
    
    ctx2.save();
    ctx2.strokeStyle = "#1e293b"; 
    ctx2.lineWidth = 4;
    ctx2.lineCap = "round";

    for (let r = 1; r < currentRingCount; r++) {
        const radius = r * ringWidth; 
        for (let s = 0; s < currentSectorCount; s++) {
            const startAngle = s * SECTOR_ANGLE;
            const endAngle = (s + 1) * SECTOR_ANGLE;

            if (currentMaze.ringWalls[r][s]) {
                // 画完整的墙
                ctx2.beginPath();
                ctx2.arc(cx, cy, radius, startAngle, endAngle);
                ctx2.stroke();
            } else {
                // 画带缺口的墙
                const midAngle = (s + 0.5) * SECTOR_ANGLE;
                
                // 【核心修改】：设定门的绝对像素宽度，保证门不会随着半径缩小而完全闭合
                // 缺口的物理跨度至少为 22 像素，或者小球直径的 2.5 倍
                let minGapPx = Math.max(22, playerDisk.dotSize * 2.5);
                let doorHalfAngle = (minGapPx / 2) / radius; 

                // 防止内层缺口太大，把整个扇形的墙壁都“吃掉”。最大开口限制在扇形角度的 40% (保留首尾各 10% 的墙根)
                doorHalfAngle = Math.min(doorHalfAngle, SECTOR_ANGLE * 0.4);

                ctx2.beginPath();
                ctx2.arc(cx, cy, radius, startAngle, midAngle - doorHalfAngle);
                ctx2.stroke();

                ctx2.beginPath();
                ctx2.arc(cx, cy, radius, midAngle + doorHalfAngle, endAngle);
                ctx2.stroke();
            }
        }
    }
    
    // 最外层大圆墙壁
    ctx2.beginPath();
    ctx2.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx2.stroke();

    // 画径向墙
    for (let r = 1; r < currentRingCount; r++) {
        const innerRadius = r * ringWidth;
        const outerRadius = (r + 1) * ringWidth;
        for (let s = 0; s < currentSectorCount; s++) {
            if (currentMaze.radialWalls[r][s]) {
                const angle = (s + 1) * SECTOR_ANGLE;
                const startX = cx + Math.cos(angle) * innerRadius;
                const startY = cy + Math.sin(angle) * innerRadius;
                const endX = cx + Math.cos(angle) * outerRadius;
                const endY = cy + Math.sin(angle) * outerRadius;
                
                ctx2.beginPath();
                ctx2.moveTo(startX, startY);
                ctx2.lineTo(endX, endY);
                ctx2.stroke();
            }
        }
    }
    ctx2.restore();
}

function drawCustomUI() {
    ctx2.save();
    const activeColor = "#ef4444"; 
    const idleColor = "#4f46e5";   
    
    ctx2.beginPath();
    ctx2.arc(cx, cy, uiState.angleTrackRadius, 0, Math.PI * 2);
    ctx2.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx2.lineWidth = 6;
    ctx2.stroke();
    
    let kx = cx + Math.cos(playerDisk.angle) * uiState.angleTrackRadius;
    let ky = cy + Math.sin(playerDisk.angle) * uiState.angleTrackRadius;
    ctx2.beginPath();
    ctx2.arc(kx, ky, 12, 0, Math.PI * 2);
    ctx2.fillStyle = uiState.isDraggingAngle ? activeColor : idleColor;
    ctx2.fill();
    ctx2.strokeStyle = "white";
    ctx2.lineWidth = 2;
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.moveTo(uiState.sliderX, uiState.sliderYTop);
    ctx2.lineTo(uiState.sliderX, uiState.sliderYBottom);
    ctx2.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx2.lineWidth = 6;
    ctx2.lineCap = "round";
    ctx2.stroke();
    
    for(let i = 0; i < currentRingCount; i++) {
        let y = uiState.sliderYBottom - (i / (currentRingCount - 1)) * (uiState.sliderYBottom - uiState.sliderYTop);
        ctx2.beginPath();
        ctx2.moveTo(uiState.sliderX - 8, y);
        ctx2.lineTo(uiState.sliderX + 8, y);
        ctx2.strokeStyle = "rgba(0,0,0,0.15)";
        ctx2.lineWidth = 2;
        ctx2.stroke();
    }

    const ringWidth = maxRadius / currentRingCount;
    let currentRing = Math.floor(playerDisk.radius / ringWidth);
    currentRing = Math.max(0, Math.min(currentRingCount - 1, currentRing)); 
    
    let sy = uiState.sliderYBottom - (currentRing / (currentRingCount - 1)) * (uiState.sliderYBottom - uiState.sliderYTop);
    
    ctx2.beginPath();
    ctx2.arc(uiState.sliderX, sy, 12, 0, Math.PI * 2);
    ctx2.fillStyle = uiState.isDraggingRadius ? activeColor : idleColor;
    ctx2.fill();
    ctx2.strokeStyle = "white";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    
    ctx2.restore();
}

function draw2() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    const ringWidth = maxRadius / currentRingCount;

    ctx2.save();
    
    ctx2.strokeStyle = "rgba(0,0,0,0.04)";
    ctx2.lineWidth = 1;
    for (let i = 0; i < currentSectorCount; i++) {
        const a = (i + 0.5) * SECTOR_ANGLE;
        ctx2.beginPath();
        ctx2.moveTo(cx, cy);
        ctx2.lineTo(cx + Math.cos(a) * maxRadius, cy + Math.sin(a) * maxRadius);
        ctx2.stroke();
    }
    ctx2.restore();
    
    ctx2.beginPath();
    ctx2.arc(cx, cy, ringWidth * 0.5, 0, Math.PI * 2); 
    ctx2.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx2.fill();
    ctx2.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx2.lineWidth = 2;
    ctx2.stroke();

    drawMazeWalls();
    
    drawCustomUI();

    ctx2.beginPath();
    ctx2.arc(cx, cy, playerDisk.radius, 0, Math.PI * 2);
    ctx2.strokeStyle = "rgba(79, 70, 229, 0.4)";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    ctx2.fillStyle = "rgba(79, 70, 229, 0.08)";
    ctx2.fill();

    ctx2.save(); 
    
    const isInteracting = uiState.isDraggingAngle || uiState.isDraggingRadius;
    const dotX = cx + Math.cos(playerDisk.angle) * playerDisk.radius;
    const dotY = cy + Math.sin(playerDisk.angle) * playerDisk.radius;
    ctx2.beginPath();
    ctx2.arc(dotX, dotY, playerDisk.dotSize, 0, Math.PI * 2);
    ctx2.fillStyle = isInteracting ? "#ef4444" : "#4f46e5";
    
    ctx2.shadowBlur = 8;
    ctx2.shadowColor = isInteracting ? "rgba(239,68,68,0.5)" : "rgba(79,70,229,0.5)";
    
    ctx2.fill();
    ctx2.strokeStyle = "white";
    ctx2.stroke();
    
    ctx2.restore(); 
}

window.startGame2 = startGame2;
window.exitGame2 = exitGame2;
window.restartGame2 = restartGame2;
// 暴露给 HTML 的难度切换接口
window.setDifficulty2 = setDifficulty2;