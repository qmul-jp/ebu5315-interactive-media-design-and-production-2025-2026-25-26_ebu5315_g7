/* =========================
   Game 2 - Circular Maze (Solid Physics & Narrow Doors)
   ========================= */

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

let gameStarted2 = false;
let isGameWon2 = false;

let cx = 0; 
let cy = 0; 
let maxRadius = 0; 

// 配置：6圈，12个分区
const RING_COUNT = 6; 
const SECTOR_COUNT = 12; 
const SECTOR_ANGLE = (Math.PI * 2) / SECTOR_COUNT; 

// 磁吸滞回参数
const SNAP_ENTER_THRESHOLD = 0.06;
const SNAP_EXIT_THRESHOLD = 0.20;

let playerDisk = {
    angle: 0,      
    radius: 0,     
    dotSize: 10,   
    isDragging: false
};

const angleSlider = document.getElementById("angleSlider");
const radiusSlider = document.getElementById("radiusSlider");
let currentMaze = null;

/* ---------- 迷宫生成逻辑 ---------- */
function generateMazeMap(ringCount = 6, sectorCount = 12) {
    const ringWalls = Array.from({ length: ringCount }, () => Array(sectorCount).fill(true));
    const radialWalls = Array.from({ length: ringCount }, () => Array(sectorCount).fill(false));

    let inDoors = [];       
    let outDoors = [];      
    let correctPaths = [];  

    inDoors[ringCount - 1] = Math.floor(Math.random() * sectorCount);

    for (let r = ringCount - 1; r >= 1; r--) {
        let region = Math.floor(Math.random() * 4); 
        let subSector = Math.floor(Math.random() * 3);
        let outDoor = region * 3 + subSector;

        outDoors[r] = outDoor;
        inDoors[r - 1] = outDoor;

        let dir = Math.random() < 0.5 ? 1 : -1;
        let path = [];
        let curr = inDoors[r];
        path.push(curr);
        
        while (curr !== outDoor) {
            curr = (curr + dir + sectorCount) % sectorCount;
            path.push(curr);
        }
        correctPaths[r] = { path, dir, inDoor: inDoors[r], outDoor };
    }

    for (let r = ringCount - 1; r >= 1; r--) {
        let cp = correctPaths[r];
        for (let s = 0; s < sectorCount; s++) {
            radialWalls[r][s] = Math.random() < 0.45; 
        }
        for (let i = 0; i < cp.path.length - 1; i++) {
            let s1 = cp.path[i];
            let s2 = cp.path[i + 1];
            let wallIndex = (cp.dir === 1) ? s1 : s2;
            radialWalls[r][wallIndex] = false; 
        }

        if (cp.dir === 1) { 
            radialWalls[r][(cp.inDoor - 1 + sectorCount) % sectorCount] = true; 
            radialWalls[r][cp.outDoor] = true; 
        } else { 
            radialWalls[r][cp.inDoor] = true;  
            radialWalls[r][(cp.outDoor - 1 + sectorCount) % sectorCount] = true;
        }

        ringWalls[r][cp.outDoor] = false; 

        let outRegion = Math.floor(cp.outDoor / 3);
        for (let s = 0; s < sectorCount; s++) {
            let currentRegion = Math.floor(s / 3);
            if (currentRegion !== outRegion) {
                let safeToPunchHole = true;
                if (r > 1 && correctPaths[r - 1].path.includes(s)) safeToPunchHole = false;
                if (safeToPunchHole && Math.random() < 0.3) {
                    ringWalls[r][s] = false;
                }
            }
        }
    }
    return { ringWalls, radialWalls, startSector: inDoors[ringCount - 1] };
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
        currentMaze = generateMazeMap(RING_COUNT, SECTOR_COUNT); 
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
    currentMaze = generateMazeMap(RING_COUNT, SECTOR_COUNT);
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
    if (radiusSlider) {
        radiusSlider.min = 0;
        radiusSlider.max = RING_COUNT - 1; 
        radiusSlider.step = 1;             
    }
    const ringWidth = maxRadius / RING_COUNT;
    playerDisk.radius = (RING_COUNT - 0.5) * ringWidth; 
    playerDisk.angle = (currentMaze.startSector + 0.5) * SECTOR_ANGLE; 
    updateSlidersFromPlayer();
}

/* ---------- 核心逻辑：绝对防穿模物理引擎 ---------- */
/* ---------- 核心逻辑：绝对防穿模物理引擎 ---------- */
function getConstrainedPos(rawAngle, rawRadius, currentAngle, currentRadius) {
    if (!currentMaze) return { angle: rawAngle, radius: currentRadius };

    const ringWidth = maxRadius / RING_COUNT;
    let currentRing = Math.floor(currentRadius / ringWidth);
    currentRing = Math.max(0, Math.min(RING_COUNT - 1, currentRing));

    let currentR_px = (currentRing + 0.5) * ringWidth;
    
    // 【轨道切断器】：定义空气墙。到达墙壁前保留一点缝隙，这就是轨道的尽头
    let airWallPadding = 8; 
    let stopDist = (playerDisk.dotSize + airWallPadding) / currentR_px; 

    function angleDist(a1, a2) {
        let d = a1 - a2;
        while(d > Math.PI) d -= Math.PI*2;
        while(d < -Math.PI) d += Math.PI*2;
        return Math.abs(d);
    }

    // 步进检测：像沿着轨道摸索一样，遇到墙就“切断轨道”并停留在切断处
    function safeRaycast(startA, targetA, ring) {
        if (ring === 0) return targetA; 
        
        let delta = targetA - startA;
        while(delta > Math.PI) delta -= Math.PI * 2;
        while(delta < -Math.PI) delta += Math.PI * 2;
        
        let steps = Math.ceil(Math.abs(delta) / 0.02); 
        if (steps === 0) return targetA;
        
        let stepAngle = delta / steps;
        let currentA = startA;
        
        for(let i = 0; i < steps; i++) {
            let nextA = currentA + stepAngle;
            let normCur = (currentA % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
            let normNext = (nextA % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
            
            // 防止 0 和 2PI 处的浮点数误差
            if (Math.abs(normCur - Math.PI*2) < 0.0001) normCur = 0;
            if (Math.abs(normNext - Math.PI*2) < 0.0001) normNext = 0;
            
            let secCur = Math.floor(normCur / SECTOR_ANGLE) % SECTOR_COUNT;
            let secNext = Math.floor(normNext / SECTOR_ANGLE) % SECTOR_COUNT;
            
            if (secCur !== secNext) {
                let crossedWall = (delta > 0) ? secCur : secNext;
                if (currentMaze.radialWalls[ring][crossedWall]) {
                    // 撞到墙壁！返回空气墙位置（切断轨道）
                    let wallAngle = (crossedWall + 1) * SECTOR_ANGLE;
                    return wallAngle + (delta > 0 ? -stopDist : stopDist);
                }
            }
            currentA = nextA;
        }
        return targetA; // 如果一路没撞墙，就到达鼠标目标位置
    }

    function safeJump(startRing, targetRing, sector) {
        let r = startRing;
        let step = targetRing > startRing ? 1 : -1;
        while (r !== targetRing) {
            let nextR = r + step;
            let wallToCheck = (step === 1) ? nextR : r;
            if (currentMaze.ringWalls[wallToCheck][sector]) {
                break; // 遇到环形墙，阻断跨环跳跃
            }
            r = nextR;
        }
        return r;
    }

    // 1. 目标环
    let targetRing = Math.floor(rawRadius / ringWidth);
    targetRing = Math.max(0, Math.min(RING_COUNT - 1, targetRing));

    // 2. 磁吸目标处理
    let mouseSector = Math.floor(rawAngle / SECTOR_ANGLE);
    let mouseMidA = (mouseSector + 0.5) * SECTOR_ANGLE;

    let distToMid = angleDist(rawAngle, mouseMidA);
    let isSnapped = angleDist(currentAngle, mouseMidA) < 0.01;
    let activeThreshold = isSnapped ? SNAP_EXIT_THRESHOLD : SNAP_ENTER_THRESHOLD;

    let intendedAngle = rawAngle;
    if (distToMid < activeThreshold) {
        intendedAngle = mouseMidA;
    }

    // 3. 执行切向移动（如果隔着墙，这里会自动把 intendedAngle 拦截并停在空气墙处）
    let finalAngle = safeRaycast(currentAngle, intendedAngle, currentRing);

    // 4. 获取拦截后真实的落脚扇区
    let normFinalAngle = (finalAngle % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    let actualSector = Math.floor(normFinalAngle / SECTOR_ANGLE) % SECTOR_COUNT;

    // 5. 执行径向移动
    let finalRing = safeJump(currentRing, targetRing, actualSector);

    finalAngle = (finalAngle % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    return { angle: finalAngle, radius: (finalRing + 0.5) * ringWidth };
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

    // 直接获取鼠标的极坐标，不加任何距离限制
    let rawAngle = Math.atan2(my - cy, mx - cx);
    if (rawAngle < 0) rawAngle += Math.PI * 2;
    let rawRadius = Math.hypot(mx - cx, my - cy);

    // 将鼠标坐标送入物理引擎进行“轨道钳制”
    const constrained = getConstrainedPos(rawAngle, rawRadius, playerDisk.angle, playerDisk.radius);
    
    // 更新小球坐标
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
    let ringIndex = parseInt(radiusSlider.value, 10);
    let rawRadius = (ringIndex + 0.5) * (maxRadius / RING_COUNT);

    const constrained = getConstrainedPos(rawAngle, rawRadius, playerDisk.angle, playerDisk.radius);
    playerDisk.angle = constrained.angle;
    playerDisk.radius = constrained.radius;
    updateSlidersFromPlayer(); 
    draw2();
    checkWin2();
}

function updateSlidersFromPlayer() {
    if (!angleSlider || !radiusSlider) return;
    angleSlider.value = (playerDisk.angle * 180) / Math.PI;
    let ringIndex = Math.floor(playerDisk.radius / (maxRadius / RING_COUNT));
    ringIndex = Math.max(0, Math.min(RING_COUNT - 1, ringIndex));
    radiusSlider.value = ringIndex;
}

if (angleSlider) angleSlider.addEventListener("input", updatePlayerFromSliders);
if (radiusSlider) radiusSlider.addEventListener("input", updatePlayerFromSliders);

/* ---------- 绘图与碰撞判定 ---------- */
function checkWin2() {
    if (isGameWon2) return;
    const ringWidth = maxRadius / RING_COUNT;
    if (playerDisk.radius <= ringWidth * 0.8) { 
        isGameWon2 = true;
        if(typeof showWinModal === 'function') showWinModal();
    }
}

function drawMazeWalls() {
    if (!currentMaze) return;
    const ringWidth = maxRadius / RING_COUNT;
    
    ctx2.save();
    ctx2.strokeStyle = "#1e293b"; 
    ctx2.lineWidth = 4;
    ctx2.lineCap = "round";

    // 1. 绘制环向墙 (圆弧)
    for (let r = 1; r < RING_COUNT; r++) {
        const radius = r * ringWidth; 
        for (let s = 0; s < SECTOR_COUNT; s++) {
            const startAngle = s * SECTOR_ANGLE;
            const endAngle = (s + 1) * SECTOR_ANGLE;

            if (currentMaze.ringWalls[r][s]) {
                // 如果有墙，画一整条实心弧线
                ctx2.beginPath();
                ctx2.arc(cx, cy, radius, startAngle, endAngle);
                ctx2.stroke();
            } else {
                // 【关键修改 2：狭窄入口】
                // 如果没有墙(有门)，则在扇区中间留出一个略宽于小球的缺口
                const midAngle = (s + 0.5) * SECTOR_ANGLE;
                
                // 门的一半宽度 (1.5 倍的球半径，即刚好能让球松弛通过)
                const doorHalfAngle = (playerDisk.dotSize * 1.5) / radius; 

                // 只有当门的尺寸小于整个扇区时才分开画
                if (doorHalfAngle < SECTOR_ANGLE / 2) {
                    // 画缺口左边的墙
                    ctx2.beginPath();
                    ctx2.arc(cx, cy, radius, startAngle, midAngle - doorHalfAngle);
                    ctx2.stroke();

                    // 画缺口右边的墙
                    ctx2.beginPath();
                    ctx2.arc(cx, cy, radius, midAngle + doorHalfAngle, endAngle);
                    ctx2.stroke();
                }
            }
        }
    }
    
    // 最外圈封闭墙
    ctx2.beginPath();
    ctx2.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx2.stroke();

    // 2. 绘制径向墙 (直线)
    for (let r = 1; r < RING_COUNT; r++) {
        const innerRadius = r * ringWidth;
        const outerRadius = (r + 1) * ringWidth;
        for (let s = 0; s < SECTOR_COUNT; s++) {
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

function draw2() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    const ringWidth = maxRadius / RING_COUNT;

    ctx2.save();
    ctx2.strokeStyle = "rgba(0,0,0,0.04)";
    ctx2.lineWidth = 1;
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
    ctx2.restore();
    
    ctx2.beginPath();
    ctx2.arc(cx, cy, ringWidth, 0, Math.PI * 2);
    ctx2.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx2.fill();

    drawMazeWalls();

    ctx2.beginPath();
    ctx2.arc(cx, cy, playerDisk.radius, 0, Math.PI * 2);
    ctx2.strokeStyle = "rgba(79, 70, 229, 0.4)";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    ctx2.fillStyle = "rgba(79, 70, 229, 0.08)";
    ctx2.fill();

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

window.startGame2 = startGame2;
window.exitGame2 = exitGame2;
window.restartGame2 = restartGame2;