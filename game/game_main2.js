/* =========================
   Game 2 - Circular Maze (Sticky Track & Discrete Slider)
   ========================= */

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

let gameStarted2 = false;
let isGameWon2 = false;

let cx = 0; 
let cy = 0; 
let maxRadius = 0; 

// 配置：6圈，12个分区（每区30度）
const RING_COUNT = 6; 
const SECTOR_COUNT = 12; 
const SECTOR_ANGLE = (Math.PI * 2) / SECTOR_COUNT; 

// --- 磁吸滞回参数 ---
const SNAP_ENTER_THRESHOLD = 0.06; // 进入跳跃通道的严格阈值 (~3.5度)
const SNAP_EXIT_THRESHOLD = 0.20;  // 挣脱跳跃通道的宽松阈值 (~11.5度)

let playerDisk = {
    angle: 0,      
    radius: 0,     
    dotSize: 10,   
    isDragging: false
};

const angleSlider = document.getElementById("angleSlider");
const radiusSlider = document.getElementById("radiusSlider");

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
        initPlayer();
        draw2();
    }, 50);
}

function exitGame2() {
    gameStarted2 = false;
    const gameArea2 = document.getElementById("gameArea2");
    if (gameArea2) gameArea2.classList.add("hidden");
    if (typeof hideWinModal === 'function') hideWinModal();
}

function restartGame2() {
    isGameWon2 = false;
    if (typeof hideWinModal === 'function') hideWinModal();
    resizeCanvas2();
    initPlayer();
    draw2();
}

function resizeCanvas2() {
    canvas2.width = canvas2.clientWidth || 800;
    canvas2.height = canvas2.clientHeight || 600;
    cx = canvas2.width / 2;
    cy = canvas2.height / 2;
    maxRadius = Math.max(10, Math.min(cx, cy) - 50);
}

function initPlayer() {
    // 【关键修改 1】：在初始化时，将半径滑块强行改造为“离散的阶梯滑块”
    if (radiusSlider) {
        radiusSlider.min = 0;
        radiusSlider.max = RING_COUNT - 1; // 6圈对应 0~5 档
        radiusSlider.step = 1;             // 每次只能走 1 档
    }

    const ringWidth = maxRadius / RING_COUNT;
    playerDisk.radius = (RING_COUNT - 0.5) * ringWidth; // 放在最外圈
    playerDisk.angle = SECTOR_ANGLE / 2; 
    updateSlidersFromPlayer();
}

/* ---------- 核心逻辑：黏性轨道与层级跳跃 ---------- */

function getConstrainedPos(rawAngle, rawRadius, currentAngle, currentRadius) {
    const ringWidth = maxRadius / RING_COUNT;
    
    let sectorIndex = Math.floor(rawAngle / SECTOR_ANGLE);
    const midSectorA = (sectorIndex + 0.5) * SECTOR_ANGLE;

    let angleDiff = Math.abs(rawAngle - midSectorA);
    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

    let diffToCurrent = Math.abs(currentAngle - midSectorA);
    if (diffToCurrent > Math.PI) diffToCurrent = Math.PI * 2 - diffToCurrent;
    let isCurrentlySnapped = (diffToCurrent < 0.01);

    let activeThreshold = isCurrentlySnapped ? SNAP_EXIT_THRESHOLD : SNAP_ENTER_THRESHOLD;

    if (angleDiff < activeThreshold) {
        // --- 处于跳跃通道内 ---
        let ringIndex = Math.floor(rawRadius / ringWidth);
        ringIndex = Math.max(0, Math.min(RING_COUNT - 1, ringIndex));
        const midRingR = (ringIndex + 0.5) * ringWidth;
        return { angle: midSectorA, radius: midRingR };
    } else {
        // --- 处于普通层级环上 ---
        return { angle: rawAngle, radius: currentRadius }; // 半径死锁
    }
}

/* ---------- 交互事件 ---------- */

canvas2.addEventListener("mousedown", (e) => {
    if (isGameWon2) return;
    const rect = canvas2.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dotX = cx + Math.cos(playerDisk.angle) * playerDisk.radius;
    const dotY = cy + Math.sin(playerDisk.angle) * playerDisk.radius;

    if (Math.hypot(mx - dotX, my - dotY) < playerDisk.dotSize * 3) {
        playerDisk.isDragging = true;
    }
});

canvas2.addEventListener("mousemove", (e) => {
    if (!playerDisk.isDragging || isGameWon2) return;

    const rect = canvas2.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let rawAngle = Math.atan2(my - cy, mx - cx);
    if (rawAngle < 0) rawAngle += Math.PI * 2;
    let rawRadius = Math.hypot(mx - cx, my - cy);

    const constrained = getConstrainedPos(rawAngle, rawRadius, playerDisk.angle, playerDisk.radius);
    playerDisk.angle = constrained.angle;
    playerDisk.radius = constrained.radius;

    updateSlidersFromPlayer();
    draw2();
    checkWin2();
});

window.addEventListener("mouseup", () => { playerDisk.isDragging = false; draw2(); });
window.addEventListener("mouseleave", () => { playerDisk.isDragging = false; draw2(); });

function updatePlayerFromSliders() {
    if (isGameWon2 || playerDisk.isDragging) return;
    
    let rawAngle = (parseFloat(angleSlider.value) * Math.PI) / 180;
    
    // 【关键修改 2】：直接读取阶梯滑块的 0~5 档位，将其转化为精确的半径像素
    let ringIndex = parseInt(radiusSlider.value, 10);
    let rawRadius = (ringIndex + 0.5) * (maxRadius / RING_COUNT);

    const constrained = getConstrainedPos(rawAngle, rawRadius, playerDisk.angle, playerDisk.radius);
    playerDisk.angle = constrained.angle;
    playerDisk.radius = constrained.radius;
    
    // 【关键修改 3】：如果当前不能跳跃层级（比如没对准灰线），强行把滑块弹回原位！
    updateSlidersFromPlayer(); 
    
    draw2();
    checkWin2();
}

function updateSlidersFromPlayer() {
    if (!angleSlider || !radiusSlider) return;
    
    angleSlider.value = (playerDisk.angle * 180) / Math.PI;
    
    // 【关键修改 4】：将当前的实际半径重新算回 0~5 的档位，反馈给滑块
    let ringIndex = Math.floor(playerDisk.radius / (maxRadius / RING_COUNT));
    ringIndex = Math.max(0, Math.min(RING_COUNT - 1, ringIndex));
    radiusSlider.value = ringIndex;
}

if (angleSlider) angleSlider.addEventListener("input", updatePlayerFromSliders);
if (radiusSlider) radiusSlider.addEventListener("input", updatePlayerFromSliders);

/* ---------- 核心判定与绘图 ---------- */

function checkWin2() {
    if (isGameWon2) return;
    const ringWidth = maxRadius / RING_COUNT;
    if (playerDisk.radius <= ringWidth) { 
        isGameWon2 = true;
        if(typeof showWinModal === 'function') showWinModal();
    }
}

function draw2() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    
    // 绘制隐形参考线
    const ringWidth = maxRadius / RING_COUNT;
    ctx2.strokeStyle = "rgba(0,0,0,0.05)";
    for (let i = 0; i < RING_COUNT; i++) {
        ctx2.beginPath();
        ctx2.arc(cx, cy, (i + 0.5) * ringWidth, 0, Math.PI * 2);
        ctx2.stroke();
    }
    for (let i = 0; i < SECTOR_COUNT; i++) {
        const a = (i + 0.5) * SECTOR_ANGLE;
        ctx2.beginPath();
        ctx2.moveTo(cx, cy);
        ctx2.lineTo(cx + Math.cos(a) * maxRadius, cy + Math.sin(a) * maxRadius);
        ctx2.stroke();
    }
    
    // 绘制终点
    ctx2.beginPath();
    ctx2.arc(cx, cy, ringWidth, 0, Math.PI * 2);
    ctx2.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx2.fill();

    // 绘制半透明圆盘
    ctx2.beginPath();
    ctx2.arc(cx, cy, playerDisk.radius, 0, Math.PI * 2);
    ctx2.strokeStyle = "rgba(79, 70, 229, 0.3)";
    ctx2.lineWidth = 2;
    ctx2.stroke();

    // 绘制玩家圆点
    const dotX = cx + Math.cos(playerDisk.angle) * playerDisk.radius;
    const dotY = cy + Math.sin(playerDisk.angle) * playerDisk.radius;
    ctx2.beginPath();
    ctx2.arc(dotX, dotY, playerDisk.dotSize, 0, Math.PI * 2);
    ctx2.fillStyle = playerDisk.isDragging ? "#ef4444" : "#4f46e5";
    ctx2.shadowBlur = 8;
    ctx2.shadowColor = playerDisk.isDragging ? "rgba(239,68,68,0.5)" : "rgba(79,70,229,0.5)";
    ctx2.fill();
    ctx2.strokeStyle = "white";
    ctx2.stroke();
}

// 暴露全局函数
window.startGame2 = startGame2;
window.exitGame2 = exitGame2;
window.restartGame2 = restartGame2;