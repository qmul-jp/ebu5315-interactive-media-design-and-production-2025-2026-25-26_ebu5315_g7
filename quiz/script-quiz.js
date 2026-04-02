// State Management for individual levels
        const levelState = {
            1: { score: 0, max: 3, done: false, userAnswers: {} },
            2: { score: 0, max: 1, done: false, selectedBtn: null },
            3: { score: 0, max: 1, done: false, selectedAns: null, isCorrect: false }
        };
        let currentLevelNum = null;

        // DOM Elements
        const homeView = document.getElementById('home-view');
        const testView = document.getElementById('test-view');
        const scoreDisplay = document.getElementById('score-display');
        const progressBar = document.getElementById('progress-bar');

        // Navigation
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
            const state = levelState[currentLevelNum];
            scoreDisplay.innerText = `Score: ${state.score}/${state.max}`;
            progressBar.style.width = state.done ? '100%' : '0%';
        }

        function updateHomeMenu() {
            for(let i=1; i<=3; i++) {
                const badge = document.getElementById(`status-l${i}`);
                if (levelState[i].done) {
                    badge.innerText = `Done: ${levelState[i].score}/${levelState[i].max}`;
                    badge.classList.add('done');
                }
            }
        }

        // --- LEVEL 1 Logic ---
        const draggables = document.querySelectorAll('.drag-item');
        const dropZones = document.querySelectorAll('.drop-zone:not(.static-demo)');
        let draggedItem = null;

        draggables.forEach(item => {
            item.addEventListener('dragstart', function() { draggedItem = this; });
            item.addEventListener('dragend', function() { draggedItem = null; });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('drag-over'); });
            zone.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
            zone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                if (!draggedItem || levelState[1].done) return;

                // If zone already has item, return old item to bank
                if (this.dataset.placedId) {
                    document.getElementById(this.dataset.placedId).classList.remove('hidden');
                }

                const droppedId = draggedItem.id;
                const text = draggedItem.innerText.trim();
                
                this.dataset.placedId = droppedId;
                this.dataset.placedTarget = draggedItem.dataset.id;
                this.innerHTML = `<div class="placed-item" onclick="returnItemL1(this.parentElement)">${text}</div>`;
                this.classList.add('filled-temp');
                
                draggedItem.classList.add('hidden');
                checkL1Ready();
            });
        });

        // Click placed item to return to bank
        window.returnItemL1 = function(zone) {
            if (levelState[1].done) return;
            const originalId = zone.dataset.placedId;
            document.getElementById(originalId).classList.remove('hidden');
            
            // Reset zone
            delete zone.dataset.placedId;
            delete zone.dataset.placedTarget;
            const target = zone.dataset.target;
            const placeholders = { "same-seg": "Angles in same segment", "centre": "Angle at centre", "semi": "Angle in semicircle" };
            zone.innerHTML = `<div class="diagram-placeholder">[Diagram: ${placeholders[target]}]</div>`;
            zone.classList.remove('filled-temp');
            
            checkL1Ready();
        };

        function checkL1Ready() {
            const btn = document.getElementById('btn-l1');
            const placedCount = document.querySelectorAll('.drop-zone.filled-temp').length;
            btn.disabled = placedCount !== 3; // Enable when all 3 are placed
        }

        window.submitL1 = function() {
            levelState[1].done = true;
            let currentScore = 0;
            
            dropZones.forEach(zone => {
                const expected = zone.dataset.target;
                const actual = zone.dataset.placedTarget;
                zone.classList.remove('filled-temp');
                
                if (expected === actual) {
                    zone.classList.add('filled-correct');
                    currentScore++;
                } else {
                    zone.classList.add('filled-incorrect');
                }
            });

            levelState[1].score = currentScore;
            document.getElementById('btn-l1').style.display = 'none';
            document.getElementById('exp-l1').classList.add('show');
            updateUI();
        };

        // --- LEVEL 2 Logic ---
        window.selectL2 = function(btn) {
            if (levelState[2].done) return;
            document.querySelectorAll('#l2-options .option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            levelState[2].selectedBtn = btn;
            document.getElementById('btn-l2').disabled = false;
        };

        window.submitL2 = function() {
            levelState[2].done = true;
            const btn = levelState[2].selectedBtn;
            const isCorrect = btn.dataset.correct === 'true';
            
            btn.classList.remove('selected');
            if (isCorrect) {
                btn.classList.add('correct');
                levelState[2].score = 1;
                document.getElementById('exp-title-l2').innerText = "Correct! Explanation";
                document.getElementById('exp-title-l2').style.color = "#1A7B2E";
            } else {
                btn.classList.add('incorrect');
                btn.classList.add('shake');
                document.getElementById('exp-title-l2').innerText = "Incorrect. Explanation";
                document.getElementById('exp-title-l2').style.color = "var(--accent-red)";
                
                // Highlight the correct one
                document.querySelector('#l2-options .option-btn[data-correct="true"]').style.border = "2px solid var(--accent-green)";
            }
            
            document.querySelectorAll('#l2-options .option-btn').forEach(b => b.style.pointerEvents = 'none');
            document.getElementById('btn-l2').style.display = 'none';
            document.getElementById('exp-l2').classList.add('show');
            updateUI();
        };

        // --- LEVEL 3 Logic ---
        window.toggleSheet = function(event) {
            if(event) event.stopPropagation();
            if(!levelState[3].done) document.getElementById('bottom-sheet').classList.toggle('open');
        };

        window.selectL3 = function(isCorrect, text) {
            const blankBtn = document.getElementById('l3-blank');
            blankBtn.innerText = text;
            blankBtn.classList.add('selected');

            levelState[3].selectedAns = text;
            levelState[3].isCorrect = isCorrect;

            document.getElementById('btn-l3').disabled = false;
    
            // 关键修复：明确移除 'open' 状态，关闭毛玻璃菜单
            document.getElementById('bottom-sheet').classList.remove('open');
        };

        window.submitL3 = function() {
            levelState[3].done = true;
            const blankBtn = document.getElementById('l3-blank');
            blankBtn.classList.remove('selected');
            
            if (levelState[3].isCorrect) {
                blankBtn.classList.add('correct');
                levelState[3].score = 1;
                document.getElementById('exp-title-l3').innerText = "Correct! Explanation";
                document.getElementById('exp-title-l3').style.color = "#1A7B2E";
            } else {
                blankBtn.classList.add('incorrect');
                blankBtn.classList.add('shake');
                document.getElementById('exp-title-l3').innerText = "Incorrect. Explanation";
                document.getElementById('exp-title-l3').style.color = "var(--accent-red)";
                blankBtn.innerText = "Alternate Segment Theorem"; // Auto-correct visually
                blankBtn.style.textDecoration = "line-through";
            }
            
            document.getElementById('btn-l3').style.display = 'none';
            document.getElementById('exp-l3').classList.add('show');
            updateUI();
        };

        // Close bottom sheet if clicked outside
        document.getElementById('level-3-content').addEventListener('click', function(e) {
            const sheet = document.getElementById('bottom-sheet');
            if (!sheet.contains(e.target) && e.target.id !== 'l3-blank') {
                sheet.classList.remove('open');
            }
        });