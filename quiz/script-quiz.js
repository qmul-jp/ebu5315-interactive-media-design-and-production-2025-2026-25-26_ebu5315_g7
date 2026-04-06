/* =========================================
           1. i18n DICTIONARY
           ========================================= */
const i18nData = {
    en: {
        appTitle: "Circle Theorems", appSubtitle: "Select a difficulty level to begin your practice",
        l1Title: "Level 1 • Easy", l1Desc: "Drag & Drop visual matching",
        l2Title: "Level 2 • Medium", l2Desc: "Calculate missing angles",
        l3Title: "Level 3 • Advanced", l3Desc: "Fill in the blank proofs",
        statusNotStarted: "Not Started", statusDone: "Done",
        btnBack: "Back", progressLabel: "Level Progress", scoreLabel: "Score",
        l1Heading: "Match the Theorems",
        l1DragSameSeg: "Angles in same segment", l1DragCentre: "Angle at centre", l1DragSemi: "Semicircle is 90°",
        l1DropSameSeg: "[Diagram: Angles in same segment]", l1DropCentre: "[Diagram: Angle at centre]", l1DropSemi: "[Diagram: Angle in semicircle]",
        l1Demo: "Radius ⊥ to tangent", btnCheck: "Check Answer",
        expTitle: "Explanation", expCorrect: "Correct! Explanation", expIncorrect: "Incorrect. Explanation",
        l1ExpText: "<strong>Angles in same segment:</strong> Angles subtended by the same arc at the circumference are equal.<br><strong>Angle at centre:</strong> The angle subtended by an arc at the centre is double the angle subtended by it at any remaining part of the circle.<br><strong>Semicircle is 90°:</strong> The angle subtended by a diameter at the circumference is a right angle.",
        l2Heading: "Calculate the Angle", l2Question: "In the circle, if angle ABC = 30°, what is angle AOC?", l2Diagram: "[Diagram: Angle ABC at circumference and AOC at centre]",
        l2ExpText: "The angle at the centre (AOC) is twice the angle at the circumference (ABC) when both are subtended by the same arc. Therefore, 2 × 30° = 60°.",
        l3Heading: "Complete the Proof", l3Diagram: "[Diagram: Alternate segment theorem proof diagram]",
        l3Given: "<strong>Given:</strong> AT is a tangent to the circle at A.", l3Statement: "<strong>Statement:</strong> ∠BAT = ∠BCA", l3ReasonPrefix: "<strong>Reason:</strong>",
        l3Blank: "Tap to select reason", l3ExpText: "The <strong>Alternate Segment Theorem</strong> states that the angle between a tangent and a chord through the point of contact is equal to the angle in the alternate segment.",
        l3SheetTitle: "Select a Reason", l3Opt1: "Alternate Segment Theorem", l3Opt2: "Corresponding Angles", l3Opt3: "Angles in Same Segment", l3Cancel: "Cancel"
    },
    zh: {
        appTitle: "圆的定理练习", appSubtitle: "选择难度级别开始练习",
        l1Title: "第一关 • 简单", l1Desc: "拖拽视觉匹配",
        l2Title: "第二关 • 中等", l2Desc: "计算未知角度",
        l3Title: "第三关 • 进阶", l3Desc: "填空完成几何证明",
        statusNotStarted: "未开始", statusDone: "已完成",
        btnBack: "返回", progressLabel: "关卡进度", scoreLabel: "得分",
        l1Heading: "匹配定理",
        l1DragSameSeg: "同弧所对圆周角", l1DragCentre: "同弧所对圆心角", l1DragSemi: "半圆上的圆周角为90°",
        l1DropSameSeg: "[图示：同弧所对圆周角]", l1DropCentre: "[图示：圆心角]", l1DropSemi: "[图示：半圆上的圆周角]",
        l1Demo: "半径垂直于切线", btnCheck: "确认答案",
        expTitle: "答案解析", expCorrect: "正确！答案解析", expIncorrect: "错误。答案解析",
        l1ExpText: "<strong>同弧所对圆周角:</strong> 同一段弧在圆周上所对的角相等。<br><strong>圆心角:</strong> 同一段弧所对的圆心角是它所对圆周角的两倍。<br><strong>半圆圆周角:</strong> 直径所对的圆周角是直角(90°)。",
        l2Heading: "计算角度", l2Question: "如图，在圆中，如果角ABC = 30°，那么角AOC等于多少？", l2Diagram: "[图示：圆周角ABC与圆心角AOC]",
        l2ExpText: "同弧所对的圆心角（AOC）是圆周角（ABC）的两倍。因此，2 × 30° = 60°。",
        l3Heading: "完成证明", l3Diagram: "[图示：弦切角定理证明图]",
        l3Given: "<strong>已知:</strong> AT是圆在A点的切线。", l3Statement: "<strong>声明:</strong> ∠BAT = ∠BCA", l3ReasonPrefix: "<strong>理由:</strong>",
        l3Blank: "点击选择理由", l3ExpText: "<strong>弦切角定理</strong>指出，切线与过切点的弦所夹的角（弦切角）等于它所夹的弧对的圆周角。",
        l3SheetTitle: "选择一个理由", l3Opt1: "弦切角定理", l3Opt2: "同位角", l3Opt3: "同弧所对圆周角", l3Cancel: "取消"
    }
};

let currentLang = 'en'; // Inherits from parent site context

window.toggleLanguage = function () {
    setLanguage(currentLang === 'en' ? 'zh' : 'en');
};

function setLanguage(lang) {
    currentLang = lang;
    const dict = i18nData[lang];

    // 1. Update static DOM elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
    });

    // 2. Update dynamic state texts
    updateUI();
    updateHomeMenu();

    // 3. Update placed items in L1 if they exist
    document.querySelectorAll('.drop-zone.filled-temp, .drop-zone.filled-correct, .drop-zone.filled-incorrect').forEach(zone => {
        const targetId = zone.dataset.placedTarget;
        const i18nKeyMap = { "same-seg": "l1DragSameSeg", "centre": "l1DragCentre", "semi": "l1DragSemi" };
        const text = dict[i18nKeyMap[targetId]];
        zone.querySelector('.placed-item').innerText = text;
    });

    // 4. Update selected blank in L3 if it exists
    const l3Blank = document.getElementById('l3-blank');
    if (levelState[3].selectedAnsKey) {
        // If it's already incorrect, it defaults to opt1 visually
        const key = levelState[3].isCorrect === false && levelState[3].done ? 'l3Opt1' : levelState[3].selectedAnsKey;
        l3Blank.innerText = dict[key];
    } else if (!levelState[3].done) {
        l3Blank.innerText = dict.l3Blank;
    }

    // 5. Update Explanation Titles if currently shown
    if (levelState[2].done) {
        document.getElementById('exp-title-l2').innerText = levelState[2].score > 0 ? dict.expCorrect : dict.expIncorrect;
    }
    if (levelState[3].done) {
        document.getElementById('exp-title-l3').innerText = levelState[3].score > 0 ? dict.expCorrect : dict.expIncorrect;
    }
}

/* =========================================
   2. STATE MANAGEMENT & LOGIC
   ========================================= */
const levelState = {
    1: { score: 0, max: 3, done: false },
    2: { score: 0, max: 1, done: false, selectedBtn: null },
    3: { score: 0, max: 1, done: false, selectedAnsKey: null, isCorrect: false }
};
let currentLevelNum = null;

const homeView = document.getElementById('home-view');
const testView = document.getElementById('test-view');
const scoreDisplay = document.getElementById('score-display');
const progressBar = document.getElementById('progress-bar');

function openLevel(num) {
    currentLevelNum = num;
    homeView.classList.remove('active');
    testView.classList.add('active');
    document.querySelectorAll('.question-card').forEach(c => c.classList.remove('active'));
    document.getElementById(`level-${num}-content`).classList.add('active');
    updateUI();
}

function goHome() {
    testView.classList.remove('active');
    homeView.classList.add('active');
    document.getElementById('bottom-sheet').classList.remove('open');
    updateHomeMenu();
}

function updateUI() {
    if (!currentLevelNum) return;
    const state = levelState[currentLevelNum];
    const dict = i18nData[currentLang];
    scoreDisplay.innerText = `${dict.scoreLabel}: ${state.score}/${state.max}`;
    progressBar.style.width = state.done ? '100%' : '0%';
}

function updateHomeMenu() {
    const dict = i18nData[currentLang];
    for (let i = 1; i <= 3; i++) {
        const badge = document.getElementById(`status-l${i}`);
        if (levelState[i].done) {
            badge.innerText = `${dict.statusDone}: ${levelState[i].score}/${levelState[i].max}`;
            badge.classList.add('done');
        } else {
            badge.innerText = dict.statusNotStarted;
            badge.classList.remove('done');
        }
    }
}

// --- LEVEL 1 Logic ---
const draggables = document.querySelectorAll('.drag-item');
const dropZones = document.querySelectorAll('.drop-zone:not(.static-demo)');
let draggedItem = null;

draggables.forEach(item => {
    item.addEventListener('dragstart', function () { draggedItem = this; });
    item.addEventListener('dragend', function () { draggedItem = null; });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        if (!draggedItem || levelState[1].done) return;

        if (this.dataset.placedId) document.getElementById(this.dataset.placedId).classList.remove('hidden');

        const droppedId = draggedItem.id;
        const targetId = draggedItem.dataset.id;

        // Get current language text based on dropped item's ID
        const i18nKeyMap = { "same-seg": "l1DragSameSeg", "centre": "l1DragCentre", "semi": "l1DragSemi" };
        const text = i18nData[currentLang][i18nKeyMap[targetId]];

        this.dataset.placedId = droppedId;
        this.dataset.placedTarget = targetId;
        this.innerHTML = `<div class="placed-item" onclick="returnItemL1(this.parentElement)">${text}</div>`;
        this.classList.add('filled-temp');

        draggedItem.classList.add('hidden');
        checkL1Ready();
    });
});

window.returnItemL1 = function (zone) {
    if (levelState[1].done) return;
    document.getElementById(zone.dataset.placedId).classList.remove('hidden');

    delete zone.dataset.placedId;
    delete zone.dataset.placedTarget;
    const target = zone.dataset.target;

    // Map back to dictionary placeholder
    const i18nKeyMap = { "same-seg": "l1DropSameSeg", "centre": "l1DropCentre", "semi": "l1DropSemi" };
    zone.innerHTML = `<div class="diagram-placeholder" data-i18n="${i18nKeyMap[target]}">${i18nData[currentLang][i18nKeyMap[target]]}</div>`;
    zone.classList.remove('filled-temp');
    checkL1Ready();
};

function checkL1Ready() {
    document.getElementById('btn-l1').disabled = document.querySelectorAll('.drop-zone.filled-temp').length !== 3;
}

window.submitL1 = function () {
    levelState[1].done = true;
    let currentScore = 0;

    dropZones.forEach(zone => {
        const expected = zone.dataset.target;
        const actual = zone.dataset.placedTarget;
        zone.classList.remove('filled-temp');

        if (expected === actual) { zone.classList.add('filled-correct'); currentScore++; }
        else { zone.classList.add('filled-incorrect'); }
    });

    levelState[1].score = currentScore;
    document.getElementById('btn-l1').style.display = 'none';
    document.getElementById('exp-l1').classList.add('show');
    updateUI();
};

// --- LEVEL 2 Logic ---
window.selectL2 = function (btn) {
    if (levelState[2].done) return;
    document.querySelectorAll('#l2-options .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    levelState[2].selectedBtn = btn;
    document.getElementById('btn-l2').disabled = false;
};

window.submitL2 = function () {
    levelState[2].done = true;
    const btn = levelState[2].selectedBtn;
    const isCorrect = btn.dataset.correct === 'true';
    const dict = i18nData[currentLang];

    btn.classList.remove('selected');
    if (isCorrect) {
        btn.classList.add('correct');
        levelState[2].score = 1;
        document.getElementById('exp-title-l2').innerText = dict.expCorrect;
        document.getElementById('exp-title-l2').style.color = "var(--color-correct)";
    } else {
        btn.classList.add('incorrect', 'shake');
        document.getElementById('exp-title-l2').innerText = dict.expIncorrect;
        document.getElementById('exp-title-l2').style.color = "var(--color-incorrect)";
        document.querySelector('#l2-options .option-btn[data-correct="true"]').style.border = "2px var(--border-correct-style) var(--color-correct)";
    }

    document.querySelectorAll('#l2-options .option-btn').forEach(b => b.style.pointerEvents = 'none');
    document.getElementById('btn-l2').style.display = 'none';
    document.getElementById('exp-l2').classList.add('show');
    updateUI();
};

// --- LEVEL 3 Logic ---
window.toggleSheet = function (event) {
    if (event) event.stopPropagation();
    if (!levelState[3].done) document.getElementById('bottom-sheet').classList.toggle('open');
};

// Pass an i18n mapping key instead of raw text
window.selectL3 = function (isCorrect, optKey) {
    const dict = i18nData[currentLang];
    const blankBtn = document.getElementById('l3-blank');

    // Map the internal option key ('opt1', 'opt2', 'opt3') to the dictionary key ('l3Opt1', etc.)
    const dictKey = optKey === 'opt1' ? 'l3Opt1' : (optKey === 'opt2' ? 'l3Opt2' : 'l3Opt3');

    blankBtn.innerText = dict[dictKey];
    blankBtn.classList.add('selected');

    levelState[3].selectedAnsKey = dictKey;
    levelState[3].isCorrect = isCorrect;

    document.getElementById('btn-l3').disabled = false;
    document.getElementById('bottom-sheet').classList.remove('open');
};

window.submitL3 = function () {
    levelState[3].done = true;
    const blankBtn = document.getElementById('l3-blank');
    const dict = i18nData[currentLang];
    blankBtn.classList.remove('selected');

    if (levelState[3].isCorrect) {
        blankBtn.classList.add('correct');
        levelState[3].score = 1;
        document.getElementById('exp-title-l3').innerText = dict.expCorrect;
        document.getElementById('exp-title-l3').style.color = "var(--color-correct)";
    } else {
        blankBtn.classList.add('incorrect', 'shake');
        document.getElementById('exp-title-l3').innerText = dict.expIncorrect;
        document.getElementById('exp-title-l3').style.color = "var(--color-incorrect)";
        blankBtn.innerText = dict.l3Opt1; // Visually auto-correct to the first (correct) option
        blankBtn.style.textDecoration = "line-through";
    }

    document.getElementById('btn-l3').style.display = 'none';
    document.getElementById('exp-l3').classList.add('show');
    updateUI();
};

document.getElementById('level-3-content').addEventListener('click', function (e) {
    const sheet = document.getElementById('bottom-sheet');
    if (!sheet.contains(e.target) && e.target.id !== 'l3-blank') {
        sheet.classList.remove('open');
    }
});

// Initialize default language
setLanguage('en');