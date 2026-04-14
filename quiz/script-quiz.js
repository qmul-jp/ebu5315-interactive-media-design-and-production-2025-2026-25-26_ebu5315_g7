// --- 1. i18n Data ---
const i18nData = {
    en: {
        appTitle: "Circle Theorems", appSubtitle: "Select a difficulty level to begin",
        l1Title: "Level 1 • Easy", l1Desc: "Foundational concepts & matching",
        l2Title: "Level 2 • Medium", l2Desc: "Calculate missing angles & properties",
        l3Title: "Level 3 • Advanced", l3Desc: "Proofs & complex theorem combinations",
        statusNotStarted: "Not Started", statusInProgress: "In Progress", statusDone: "Done",
        btnBack: "Back", progressLabel: "Level Progress", scoreLabel: "Score",
        btnCheck: "Check Answer", btnNext: "Next Question",
        expTitle: "Explanation", expCorrect: "Correct! Outstanding.", expIncorrect: "Incorrect. Let's review.",
        l3Blank: "Tap to select reason", l3SheetTitle: "Select a Reason", l3Cancel: "Cancel",
        diagramA: "Diagram 1", diagramB: "Diagram 2", diagramC: "Diagram 3",
        allDoneTitle: "Level Completed!", allDoneDesc: "You have finished all questions in this level.",
        btnReview: "Review Answers", lblCorrect: "Correct", lblIncorrect: "Incorrect",
        fibPlaceholder: "Type your answer here..."
    },
    zh: {
        appTitle: "圆的定理练习", appSubtitle: "选择难度级别开始练习",
        l1Title: "第一关 • 简单", l1Desc: "基础概念与视觉匹配",
        l2Title: "第二关 • 中等", l2Desc: "计算未知角度及定理应用",
        l3Title: "第三关 • 进阶", l3Desc: "完成几何证明及复杂组合",
        statusNotStarted: "未开始", statusInProgress: "进行中", statusDone: "已完成",
        btnBack: "返回", progressLabel: "关卡进度", scoreLabel: "得分",
        btnCheck: "确认答案", btnNext: "下一题",
        expTitle: "答案解析", expCorrect: "正确！做得好。", expIncorrect: "错误。一起来看下解析。",
        l3Blank: "点击选择理由", l3SheetTitle: "选择一个理由", l3Cancel: "取消",
        diagramA: "放置区 1", diagramB: "放置区 2", diagramC: "放置区 3",
        allDoneTitle: "关卡已完成！", allDoneDesc: "您已经做完了该关卡的所有题目。",
        btnReview: "回顾题目", lblCorrect: "正确", lblIncorrect: "错误",
        fibPlaceholder: "在此输入您的答案..."
    }
};

// --- 2. State Variables ---
let currentLang = 'en';
let currentLevelNum = null;
let currentQuestion = null;
let isAnswered = false;
let selectedAnswerId = null;
let draggedItem = null;

const levelState = {
    // 新增 activeQuestion: null，用于保存还没答完的题目
    1: { score: 0, max: 4, answeredCount: 0, history: [], activeQuestion: null },
    2: { score: 0, max: 4, answeredCount: 0, history: [], activeQuestion: null },
    3: { score: 0, max: 4, answeredCount: 0, history: [], activeQuestion: null }
};

const homeView = document.getElementById('home-view');
const testView = document.getElementById('test-view');
const container = document.getElementById('dynamic-content');

// --- 3. Core Engine ---
function setLanguage(lang) {
    currentLang = lang;
    const dict = i18nData[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
    });

    if (testView.classList.contains('active')) {
        if (container.querySelector('.review-list')) {
            renderReviewScreen();
        } else if (!currentQuestion) {
            renderDoneScreen();
        } else if (!isAnswered) {
            renderQuestion();
        } else {
            document.getElementById('exp-title').innerText = document.querySelector('.correct') ? dict.expCorrect : dict.expIncorrect;
            document.getElementById('exp-text').innerHTML = currentQuestion.explanation[lang];
            document.getElementById('btn-next').innerText = dict.btnNext;
        }
    }

    updateScoreUI();
    updateHomeMenu();
}

function openLevel(num) {
    currentLevelNum = num;
    homeView.classList.remove('active');
    testView.classList.add('active');

    if (typeof questionManager === 'undefined') {
        container.innerHTML = `<h3 style="color:var(--accent-red); padding: 2rem; text-align:center;">Error: questionBank.js not found.</h3>`;
        return;
    }

    // 如果已经答满了最大题数，直接显示结算页
    if (levelState[num].answeredCount >= levelState[num].max) {
        currentQuestion = null;
        renderDoneScreen();
        return;
    }

    // 核心修复：优先检查是否有“未答完被中断”的题目
    if (levelState[num].activeQuestion) {
        currentQuestion = levelState[num].activeQuestion;
    } else {
        // 如果没有，再从题库抽新题，并立刻存入记忆位
        currentQuestion = questionManager.getRandomQuestion('level' + num);
        levelState[num].activeQuestion = currentQuestion;
    }

    // 如果题库真的空了
    if (!currentQuestion) {
        renderDoneScreen();
        return;
    }

    isAnswered = false;
    renderQuestion();
    updateScoreUI();
}

function nextQuestion() {
    openLevel(currentLevelNum);
}

function goHome() {
    testView.classList.remove('active');
    homeView.classList.add('active');
    document.getElementById('bottom-sheet')?.classList.remove('open');
    updateHomeMenu();
}

function updateScoreUI() {
    if (!currentLevelNum) return;
    const state = levelState[currentLevelNum];
    const dict = i18nData[currentLang];
    document.getElementById('score-display').innerText = `${dict.scoreLabel}: ${state.score}/${state.max}`;
    document.getElementById('progress-bar').style.width = `${(state.answeredCount / state.max) * 100}%`;
}

function updateHomeMenu() {
    const dict = i18nData[currentLang];
    for (let i = 1; i <= 3; i++) {
        const badge = document.getElementById(`status-l${i}`);

        if (levelState[i].answeredCount >= levelState[i].max) {
            // 已完成
            badge.innerText = `${dict.statusDone}: ${levelState[i].score}/${levelState[i].max}`;
            badge.classList.remove('in-progress');
            badge.classList.add('done');
        } else if (levelState[i].answeredCount > 0) {
            // 进行中：只要答题数量大于 0 且小于 max
            badge.innerText = `${dict.statusInProgress}: ${levelState[i].answeredCount}/${levelState[i].max}`;
            badge.classList.remove('done');
            badge.classList.add('in-progress');
        } else {
            // 未开始
            badge.innerText = dict.statusNotStarted;
            badge.classList.remove('done', 'in-progress');
        }
    }
}

// --- 4. Dynamic Renderer ---
function renderQuestion() {
    const q = currentQuestion;
    const dict = i18nData[currentLang];
    selectedAnswerId = null;

    // 判断当前题目是否包含了真实图片路径
    const hasImage = q.imageSrc && q.imageSrc.trim() !== "";

    // 渲染头部标签和题目文本
    let html = `
                <span class="level-badge badge-${currentLevelNum}">${dict['l' + currentLevelNum + 'Title']}</span>
                <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.75rem; line-height: 1.5; color: var(--text-primary);">${q.question[currentLang]}</p>
            `;

    // 🌟 核心判断：根据有无图片决定布局结构
    if (hasImage) {
        // 有图片：使用左右双栏布局
        html += `
                    <div class="question-layout-grid">
                        <div class="question-left">
                            <div class="image-container" style="background:transparent; border:none; padding:0;">
                                <img src="${q.imageSrc}" alt="${q.imageDesc ? q.imageDesc[currentLang] : 'Question Image'}" 
                                     style="width: 100%; height: 100%; object-fit: contain; border-radius: 16px; border: 1px solid var(--border-light); background: var(--card-bg);">
                            </div>
                        </div>
                        <div class="question-right">
                `;
    } else {
        // 无图片：使用单栏垂直布局
        html += `<div style="display:flex; flex-direction:column; width:100%;">`;
    }

    // --- 渲染交互组件（选择、填空、拖拽等，这部分保持不变）---
    if (q.type === 'mcq') {
        html += `<div class="options-list" id="mcq-options">`;
        q.options.forEach(opt => {
            html += `<button class="option-btn" data-id="${opt.id}" onclick="selectMCQ(this, '${opt.id}')">${opt[currentLang]}</button>`;
        });
        html += `</div>`;
    }
    else if (q.type === 'fib') {
        html += `<input type="text" id="fib-input" class="fib-input" placeholder="${dict.fibPlaceholder}" oninput="checkSubmitReady()" style="margin-top: 0;">`;
    }
    else if (q.type === 'drag') {
        html += `<div class="match-grid"><div class="drag-col">`;
        q.options.forEach(opt => {
            html += `<div class="drag-item" draggable="true" id="drag-${opt.id}" data-id="${opt.id}"><div class="drag-handle"></div><span>${opt[currentLang]}</span></div>`;
        });
        html += `</div><div class="drop-col">`;
        const dropLabels = [dict.diagramA, dict.diagramB, dict.diagramC];
        Object.keys(q.answer).forEach((zoneKey, idx) => {
            html += `<div class="drop-zone" data-target="${zoneKey}"><div class="diagram-placeholder">${dropLabels[idx]}</div></div>`;
        });
        html += `</div></div>`;
    }
    else if (q.type === 'proof') {
        html += `
                    <div class="proof-box">
                        <p style="margin-bottom:0;"><strong>Reason:</strong> <button class="blank-btn" id="l3-blank" onclick="toggleSheet(event)">${dict.l3Blank}</button></p>
                    </div>
                `;
    }

    // 🌟 闭合之前的布局
    if (hasImage) {
        html += `</div></div>`; // 闭合 question-right 和 question-layout-grid
    } else {
        html += `</div>`; // 闭合单栏 div
    }

    // --- 处理 Bottom Sheet、提交按钮和解析（这部分保持不变）---
    if (q.type === 'proof') {
        html += `
                    <div class="bottom-sheet" id="bottom-sheet">
                        <div class="sheet-handle"></div>
                        <h3 class="sheet-title">${dict.l3SheetTitle}</h3>
                        <div class="sheet-options">
                `;
        q.options.forEach(opt => {
            html += `<button class="sheet-opt-btn" onclick="selectProof('${opt.id}', '${opt[currentLang]}')">${opt[currentLang]}</button>`;
        });
        html += `
                            <button class="sheet-opt-btn" onclick="toggleSheet()" style="color: var(--color-incorrect);">${dict.l3Cancel}</button>
                        </div>
                    </div>
                `;
    }

    html += `
                <button class="action-btn" id="btn-submit" onclick="submitAnswer()" disabled>${dict.btnCheck}</button>
                <button class="action-btn" id="btn-next" onclick="nextQuestion()" style="display:none; background:var(--bg-color); color:var(--text-primary); border:1px solid var(--border-strong); box-shadow:none;">${dict.btnNext}</button>
                
                <div class="explanation-box" id="exp-box">
                    <div class="exp-title" id="exp-title">${dict.expTitle}</div>
                    <div class="exp-text" id="exp-text"></div>
                </div>
            `;

    container.innerHTML = html;
    if (q.type === 'drag') attachDragEvents();
}

function renderDoneScreen() {
    const dict = i18nData[currentLang];
    const state = levelState[currentLevelNum];
    container.innerHTML = `
                <div style="text-align:center; padding: 3rem 1rem;">
                    <h2 style="font-size:2rem; font-weight:800; letter-spacing:-0.03em;">${dict.allDoneTitle}</h2>
                    <p style="margin-top:1rem; color:var(--text-secondary); font-size:1.0625rem;">${dict.allDoneDesc}</p>
                    <div style="font-size: 3.5rem; font-weight:800; color:var(--accent-blue); margin-top:2rem; margin-bottom: 2.5rem; letter-spacing:-0.05em;">${state.score} <span style="font-size:2rem; color:var(--text-secondary);">/ ${state.max}</span></div>
                    
                    <button class="action-btn" onclick="renderReviewScreen()" style="background:var(--bg-blue); color:var(--accent-blue); margin-bottom: 1rem; margin-top:0; box-shadow:none;">${dict.btnReview}</button>
                    <button class="action-btn" onclick="goHome()" style="background:transparent; color:var(--text-primary); border: 1px solid var(--border-strong); margin-top:0; box-shadow:none;">${dict.btnBack}</button>
                </div>
            `;
    updateScoreUI();
}

window.renderReviewScreen = function () {
    const state = levelState[currentLevelNum];
    const dict = i18nData[currentLang];
    let html = `
                <div style="text-align:center;">
                    <h2 style="margin-bottom: 0.5rem; font-weight:800; letter-spacing:-0.02em;">${dict.btnReview}</h2>
                </div>
                <div class="review-list">
            `;

    state.history.forEach((item, index) => {
        const q = item.question;
        const statusColor = item.isCorrect ? 'var(--color-correct)' : 'var(--color-incorrect)';
        const statusText = item.isCorrect ? dict.lblCorrect : dict.lblIncorrect;

        html += `
                    <div class="review-card">
                        <div class="review-header">
                            <span style="color:var(--text-secondary);">Q${index + 1}</span>
                            <span style="color: ${statusColor}; background: color-mix(in srgb, ${statusColor} 10%, transparent); padding: 4px 12px; border-radius: 12px; font-size:0.9375rem;">${statusText}</span>
                        </div>
                        <p style="margin-bottom: 1.5rem; font-weight: 600; font-size: 1.0625rem; color: var(--text-primary);">${q.question[currentLang]}</p>
                        
                        <div class="explanation-box show" style="margin-top: 0; background: var(--card-bg); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                            <div class="exp-title">${dict.expTitle}</div>
                            <div class="exp-text">${q.explanation[currentLang]}</div>
                        </div>
                    </div>
                `;
    });

    html += `
                </div>
                <button class="action-btn" onclick="goHome()" style="margin-top:2.5rem; background:var(--bg-color); color:var(--text-primary); border:1px solid var(--border-strong); box-shadow:none;">${dict.btnBack}</button>
            `;
    container.innerHTML = html;
};

// --- 5. Interaction Handlers ---
window.selectMCQ = function (btn, id) {
    if (isAnswered) return;
    document.querySelectorAll('#mcq-options .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedAnswerId = id;
    checkSubmitReady();
};

window.toggleSheet = function (event) {
    if (event) event.stopPropagation();
    if (!isAnswered) document.getElementById('bottom-sheet').classList.toggle('open');
};

window.selectProof = function (id, text) {
    if (isAnswered) return;
    const blankBtn = document.getElementById('l3-blank');
    blankBtn.innerText = text;
    blankBtn.classList.add('selected');
    selectedAnswerId = id;
    document.getElementById('bottom-sheet').classList.remove('open');
    checkSubmitReady();
};

document.addEventListener('click', function (e) {
    const sheet = document.getElementById('bottom-sheet');
    if (sheet && !sheet.contains(e.target) && e.target.id !== 'l3-blank') sheet.classList.remove('open');
});

function checkSubmitReady() {
    const btn = document.getElementById('btn-submit');
    if (!btn) return;
    const q = currentQuestion;

    if (q.type === 'mcq' || q.type === 'proof') {
        btn.disabled = !selectedAnswerId;
    } else if (q.type === 'fib') {
        const val = document.getElementById('fib-input').value.trim();
        btn.disabled = val.length === 0;
    } else if (q.type === 'drag') {
        const placedCount = document.querySelectorAll('.drop-zone.filled-temp').length;
        btn.disabled = placedCount !== Object.keys(q.answer).length;
    }
}

// --- Drag Logic Subsystem ---
function attachDragEvents() {
    const draggables = document.querySelectorAll('.drag-item');
    const dropZones = document.querySelectorAll('.drop-zone');

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
            if (!draggedItem || isAnswered) return;

            if (this.dataset.placedId) document.getElementById(this.dataset.placedId).classList.remove('hidden');

            const droppedId = draggedItem.id;
            const targetId = draggedItem.dataset.id;

            this.dataset.placedId = droppedId;
            this.dataset.placedTarget = targetId;
            this.innerHTML = `<div class="placed-item" onclick="returnItemL1(this.parentElement)">${draggedItem.innerText}</div>`;
            this.classList.add('filled-temp');

            draggedItem.classList.add('hidden');
            checkSubmitReady();
        });
    });
}

window.returnItemL1 = function (zone) {
    if (isAnswered) return;
    document.getElementById(zone.dataset.placedId).classList.remove('hidden');

    delete zone.dataset.placedId;
    delete zone.dataset.placedTarget;
    const target = zone.dataset.target;
    const dict = i18nData[currentLang];

    const labelMap = { 'zone1': dict.diagramA, 'zone2': dict.diagramB, 'zone3': dict.diagramC };
    zone.innerHTML = `<div class="diagram-placeholder">${labelMap[target]}</div>`;
    zone.classList.remove('filled-temp');
    checkSubmitReady();
};

// --- 6. Evaluator ---
window.submitAnswer = function () {
    isAnswered = true;
    const q = currentQuestion;
    let isCorrect = false;

    if (q.type === 'mcq') {
        isCorrect = (selectedAnswerId === q.answer);
        const selectedBtn = document.querySelector('.option-btn.selected');
        if (isCorrect) {
            selectedBtn.classList.add('correct');
        } else {
            selectedBtn.classList.add('incorrect', 'shake');
            const correctBtn = document.querySelector(`.option-btn[data-id="${q.answer}"]`);
            if (correctBtn) correctBtn.style.border = "2px var(--border-correct-style) var(--color-correct)";
        }
    }
    else if (q.type === 'fib') {
        const input = document.getElementById('fib-input');
        const val = input.value.trim().toLowerCase();
        const expectedEn = q.answer.en.toLowerCase();
        const expectedZh = q.answer.zh.toLowerCase();

        if (val === expectedEn || val === expectedZh) {
            isCorrect = true;
            input.style.borderColor = "var(--color-correct)";
            input.style.backgroundColor = "var(--bg-correct)";
            input.style.color = "var(--color-correct)";
        } else {
            input.style.borderColor = "var(--color-incorrect)";
            input.style.backgroundColor = "var(--bg-incorrect)";
            input.style.color = "var(--color-incorrect)";
            input.classList.add('shake');
            input.value = `${val} (Correct: ${q.answer[currentLang]})`;
        }
        input.disabled = true;
    }
    else if (q.type === 'drag') {
        let allCorrect = true;
        document.querySelectorAll('.drop-zone').forEach(zone => {
            const expected = q.answer[zone.dataset.target];
            const actual = zone.dataset.placedTarget;
            zone.classList.remove('filled-temp');
            if (expected === actual) {
                zone.classList.add('filled-correct');
            } else {
                zone.classList.add('filled-incorrect');
                allCorrect = false;
            }
        });
        isCorrect = allCorrect;
    }
    else if (q.type === 'proof') {
        isCorrect = (selectedAnswerId === q.answer);
        const blankBtn = document.getElementById('l3-blank');
        if (isCorrect) {
            blankBtn.classList.add('correct');
        } else {
            blankBtn.classList.add('incorrect', 'shake');
            const correctOpt = q.options.find(o => o.id === q.answer);
            blankBtn.innerText = correctOpt[currentLang];
            blankBtn.style.textDecoration = "line-through";
        }
    }

    if (isCorrect) levelState[currentLevelNum].score++;
    levelState[currentLevelNum].answeredCount++;
    levelState[currentLevelNum].history.push({
        question: q,
        isCorrect: isCorrect
    });

    levelState[currentLevelNum].activeQuestion = null;

    document.getElementById('btn-submit').style.display = 'none';
    document.getElementById('btn-next').style.display = 'block';

    const dict = i18nData[currentLang];
    const expTitle = document.getElementById('exp-title');
    expTitle.innerText = isCorrect ? dict.expCorrect : dict.expIncorrect;
    expTitle.style.color = isCorrect ? "var(--color-correct)" : "var(--color-incorrect)";
    document.getElementById('exp-text').innerHTML = q.explanation[currentLang];
    document.getElementById('exp-box').classList.add('show');

    updateScoreUI();
};
window.toggleLanguage = function () {
    setLanguage(currentLang == 'en' ? 'zh' : 'en');
}
// Init
setLanguage('en');