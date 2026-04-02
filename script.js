// script.js
// 导航切换功能
// 多语言支持

// 语言数据
const translations = {
    zh: {
        logo: '圆 · 几何',
        'nav.home': '首页',
        'nav.teach': '教学',
        'nav.search': '搜索',
        'nav.quiz': '检测',
        'nav.game': '游戏',
        'nav.settings': '设置',
        'nav.login': '登录',
        'hero.title': '探索几何的无限魅力',
        'hero.subtitle': '专业的数学几何学习平台，让抽象的几何概念变得直观易懂',
        'hero.startLearning': '检测',
        'hero.geometryGames': '游戏',
        'features.title': '平台特色',
        'features.systematic': '系统教学',
        'features.systematicDesc': '从基础到进阶，系统化学习几何知识',
        'features.intelligent': '智能搜索',
        'features.intelligentDesc': '快速找到你需要的几何知识点',
        'features.quiz': '随堂检测',
        'features.quizDesc': '实时检验学习成果，巩固知识点',
        'features.games': '几何游戏',
        'features.gamesDesc': '通过游戏化方式加深几何概念理解',
        'login.title': '用户登录',
        'login.username': '用户名',
        'login.password': '密码',
        'login.privacy': '我已阅读并同意<a href="#" onclick="alert(\'隐私政策：我们尊重您的隐私，不会收集任何个人信息。\')">隐私政策</a>',
        'login.enter': '进入',
        'hero.searchPlaceholder': '搜索知识点，如：垂径定理、圆周角...',
        'quiz.title': '随堂检测',
        'quiz.question1': '1. 垂径定理的内容是？',
        'quiz.question2': '2. 圆的标准方程是什么？',
        'quiz.answer': '请输入您的答案...',
        'quiz.submit': '提交答卷',
        'game.title': '几何挑战游戏',
        'game.loading': '几何拼图游戏加载中...',
        'game.start': '开始游戏',
        'knowledge.title': '圆的重要知识点',
        'knowledge.verticalTheorem': '垂径定理',
        'knowledge.verticalTheoremDesc': '垂直于弦的直径平分弦且平分弦所对的两条弧',
        'knowledge.circumferentialAngle': '圆周角定理',
        'knowledge.circumferentialAngleDesc': '同弧或等弧所对的圆周角相等，等于圆心角的一半',
        'knowledge.standardEquation': '圆的标准方程',
        'knowledge.standardEquationDesc': '(x-a)² + (y-b)² = r²，其中(a,b)为圆心坐标，r为半径',
        'knowledge.tangentProperty': '切线性质',
        'knowledge.tangentPropertyDesc': '圆的切线垂直于经过切点的半径',
        'settings.title': '设置',
        'settings.appearance': '外观',
        'settings.language': '语言',
        'settings.fontSize': '字体大小',
        'settings.fontSizeSmall': '小',
        'settings.fontSizeMedium': '中',
        'settings.fontSizeLarge': '大',
        'settings.fontSizeXLarge': '特大',
        'settings.colorblindMode': '色盲模式',
        'settings.eyeProtectionMode': '护眼模式',
        'settings.displayLanguage': '显示语言',
        'settings.autoTranslate': '自动翻译',
        'settings.parentMode': '家长模式',
        'settings.account': '账户',
        'settings.username': '用户名',
        'settings.usernamePlaceholder': '请输入用户名',
        'settings.email': '邮箱',
        'settings.emailPlaceholder': '请输入邮箱',
        'settings.volume': '音量',
        'settings.changePassword': '修改密码',
        'settings.deleteAccount': '删除账户',
        'settings.learning': '学习',
        'settings.autoSave': '自动保存学习进度',
        'settings.dailyGoal': '每日学习目标（分钟）',
        'settings.studyReminder': '学习提醒',
        'settings.privacy': '隐私和安全',
        'settings.notifications': '通知',
        'settings.dataCollection': '数据收集',
        'settings.cookies': 'Cookie',
        'settings.advanced': '高级',
        'settings.sound': '音效',
        'settings.clearCache': '清除缓存',
        'settings.resetSettings': '重置所有设置',
        'settings.save': '应用设置',
        'footer.about': '关于我们',
        'footer.aboutDesc': '专业的数学几何学习平台，致力于让几何学习变得简单有趣',
        'footer.links': '快速链接',
        'footer.contact': '联系我们',
        'footer.email': '邮箱：contact@yuangeometry.com',
        'footer.phone': '电话：400-123-4567',
        'footer.copyright': '© 2026 圆数学教学平台. 万物皆数.'
    },
    en: {
        logo: 'Circle · Geometry',
        'nav.home': 'Home',
        'nav.teach': 'Teaching',
        'nav.search': 'Search',
        'nav.quiz': 'Quiz',
        'nav.game': 'Game',
        'nav.settings': 'Settings',
        'nav.login': 'Login',
        'hero.title': 'Explore the Infinite Charm of Geometry',
        'hero.subtitle': 'A professional mathematics geometry learning platform that makes abstract geometric concepts intuitive and easy to understand',
        'hero.startLearning': 'Quiz',
        'hero.geometryGames': 'Game',
        'features.title': 'Platform Features',
        'features.systematic': 'Systematic Teaching',
        'features.systematicDesc': 'From basic to advanced, systematically learn geometry knowledge',
        'features.intelligent': 'Intelligent Search',
        'features.intelligentDesc': 'Quickly find the geometry knowledge points you need',
        'features.quiz': 'In-class Quiz',
        'features.quizDesc': 'Real-time inspection of learning outcomes, consolidate knowledge points',
        'features.games': 'Geometry Games',
        'features.gamesDesc': 'Deepen geometric concept understanding through gamification',
        'login.title': 'User Login',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.privacy': 'I have read and agree to the <a href="#" onclick="alert(\'Privacy Policy: We respect your privacy and will not collect any personal information.\')">Privacy Policy</a>',
        'login.enter': 'Enter',
        'hero.searchPlaceholder': 'Search knowledge points, e.g.: Vertical Diameter Theorem...',
        'quiz.title': 'In-class Quiz',
        'quiz.question1': '1. What is the content of the Vertical Diameter Theorem?',
        'quiz.question2': '2. What is the standard equation of a circle?',
        'quiz.answer': 'Please enter your answer...',
        'quiz.submit': 'Submit Quiz',
        'game.title': 'Geometry Challenge Games',
        'game.loading': 'Geometry puzzle game loading...',
        'game.start': 'Start Game',
        'knowledge.title': 'Important Circle Knowledge',
        'knowledge.verticalTheorem': 'Vertical Diameter Theorem',
        'knowledge.verticalTheoremDesc': 'A diameter perpendicular to a chord bisects the chord and its arcs',
        'knowledge.circumferentialAngle': 'Circumferential Angle Theorem',
        'knowledge.circumferentialAngleDesc': 'Angles subtended by the same arc are equal, half the central angle',
        'knowledge.standardEquation': 'Standard Equation of a Circle',
        'knowledge.standardEquationDesc': '(x-a)² + (y-b)² = r², where (a,b) is center and r is radius',
        'knowledge.tangentProperty': 'Tangent Property',
        'knowledge.tangentPropertyDesc': 'The tangent to a circle is perpendicular to the radius at the point of contact',
        'settings.title': 'Settings',
        'settings.appearance': 'Appearance',
        'settings.language': 'Language',
        'settings.fontSize': 'Font Size',
        'settings.fontSizeSmall': 'Small',
        'settings.fontSizeMedium': 'Medium',
        'settings.fontSizeLarge': 'Large',
        'settings.fontSizeXLarge': 'Extra Large',
        'settings.colorblindMode': 'Colorblind Mode',
        'settings.eyeProtectionMode': 'Eye Protection Mode',
        'settings.displayLanguage': 'Display Language',
        'settings.autoTranslate': 'Auto Translate',
        'settings.parentMode': 'Parent Mode',
        'settings.account': 'Account',
        'settings.username': 'Username',
        'settings.usernamePlaceholder': 'Enter username',
        'settings.email': 'Email',
        'settings.emailPlaceholder': 'Enter email',
        'settings.volume': 'Volume',
        'settings.changePassword': 'Change Password',
        'settings.deleteAccount': 'Delete Account',
        'settings.learning': 'Learning',
        'settings.autoSave': 'Auto Save Progress',
        'settings.dailyGoal': 'Daily Goal (minutes)',
        'settings.studyReminder': 'Study Reminder',
        'settings.privacy': 'Privacy & Security',
        'settings.notifications': 'Notifications',
        'settings.dataCollection': 'Data Collection',
        'settings.cookies': 'Cookies',
        'settings.advanced': 'Advanced',
        'settings.sound': 'Sound',
        'settings.clearCache': 'Clear Cache',
        'settings.resetSettings': 'Reset All Settings',
        'settings.save': 'Apply Settings',
        'footer.about': 'About Us',
        'footer.aboutDesc': 'A professional mathematics geometry learning platform dedicated to making geometry learning simple and fun',
        'footer.links': 'Quick Links',
        'footer.contact': 'Contact Us',
        'footer.email': 'Email: contact@yuangeometry.com',
        'footer.phone': 'Phone: 400-123-4567',
        'footer.copyright': '© 2026 Circle Mathematics Teaching Platform. Everything is number.'
    }
};

// 当前语言
let currentLang = 'en';

// 设置元素变量（全局）
let settingsLanguage, settingsFontSize, settingsColorblindMode, settingsEyeProtectionMode,
    settingsParentMode, settingsAutoTranslate, settingsAutoSave, settingsDailyGoal,
    settingsStudyReminder, settingsNotifications, settingsDataCollection, settingsCookies,
    settingsSound, settingsVolume, settingsUsername, settingsEmail;

// 更新页面语言
function updateLanguage(lang) {
    currentLang = lang;

    // 更新所有带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // 更新所有带有data-i18n-placeholder属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // 更新游戏模块文本
    updateGameLanguage();

    // Update breadcrumbs based on active module
    const activeModule = document.querySelector('.module.active');
    if (activeModule && typeof updateIndexBreadcrumbs === 'function') {
        updateIndexBreadcrumbs(activeModule.id);
    }
}

// 游戏状态标记
let gameStarted = false;

// 更新游戏模块语言
function updateGameLanguage() {
    const gameCanvas = document.querySelector('.game-canvas');
    if (!gameCanvas) return;

    // 根据游戏状态重新生成HTML
    if (gameStarted) {
        gameCanvas.innerHTML = `<p>${getGameText('started')}</p><button class="submit-btn" onclick="resetGame()">${getGameText('restart')}</button>`;
    } else {
        gameCanvas.innerHTML = `<p>${getGameText('loading')}</p><button class="submit-btn" onclick="startGame()">${getGameText('start')}</button>`;
    }
}

// 获取游戏相关文本
function getGameText(key) {
    const gameTexts = {
        zh: {
            loading: '几何拼图游戏加载中...',
            started: '游戏已开始',
            start: '开始游戏',
            restart: '重新开始'
        },
        en: {
            loading: 'Geometry puzzle game loading...',
            started: 'Game started',
            start: 'Start Game',
            restart: 'Restart'
        }
    };
    return gameTexts[currentLang] && gameTexts[currentLang][key] ? gameTexts[currentLang][key] : gameTexts['zh'][key];
}

function resetGame() {
    gameStarted = false;
    const gameCanvas = document.querySelector('.game-canvas');
    if (gameCanvas) {
        gameCanvas.innerHTML = `<p>${getGameText('loading')}</p><button class="submit-btn" onclick="startGame()">${getGameText('start')}</button>`;
    }
}

function startGame() {
    gameStarted = true;
    const gameCanvas = document.querySelector('.game-canvas');
    if (gameCanvas) {
        gameCanvas.innerHTML = `<p>${getGameText('started')}</p><button class="submit-btn" onclick="resetGame()">${getGameText('restart')}</button>`;
    }
}

// 知识点幻灯片功能
let currentSlide = 0;
let slides = [];
let dots = [];
let slideInterval;

function initKnowledgeSlider() {
    slides = document.querySelectorAll('.knowledge-slide');
    dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.getElementById('knowledge-prev');
    const nextBtn = document.getElementById('knowledge-next');

    if (slides.length === 0) return;

    // 绑定按钮事件
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            changeSlide(currentSlide - 1);
            resetAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            changeSlide(currentSlide + 1);
            resetAutoPlay();
        });
    }

    // 绑定指示点事件
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            changeSlide(index);
            resetAutoPlay();
        });
    });

    // 自动播放
    startAutoPlay();

    // 鼠标悬停时暂停自动播放
    const slider = document.querySelector('.knowledge-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
    }
}

function changeSlide(index) {
    // 处理循环
    if (index < 0) {
        index = slides.length - 1;
    } else if (index >= slides.length) {
        index = 0;
    }

    // 移除当前激活状态
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    // 添加新的激活状态
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(() => {
        changeSlide(currentSlide + 1);
    }, 5000); // 每5秒自动切换
}

function stopAutoPlay() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

// 应用字体大小
function applyFontSize(size) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    document.body.classList.add('font-' + size);
}

// 应用色盲模式
function applyColorblindMode(enabled) {
    if (enabled) {
        document.body.classList.add('colorblind-mode');
    } else {
        document.body.classList.remove('colorblind-mode');
    }
}

// 应用护眼模式
function applyEyeProtectionMode(enabled) {
    if (enabled) {
        document.body.classList.add('eye-protection-mode');
    } else {
        document.body.classList.remove('eye-protection-mode');
    }
}

// 应用家长模式
function applyParentMode(enabled) {
    if (enabled) {
        document.body.classList.add('parent-mode');
    } else {
        document.body.classList.remove('parent-mode');
    }
}

// 应用音量
function applyVolume(value) {
    console.log('Volume set to:', value);
}

function applyAutoTranslate(enabled) {
    console.log('Auto translate:', enabled);
}

function applyAutoSave(enabled) {
    console.log('Auto save:', enabled);
}

function applyDailyGoal(value) {
    console.log('Daily goal:', value, 'minutes');
}

function applyStudyReminder(enabled) {
    console.log('Study reminder:', enabled);
}

function applyNotifications(enabled) {
    console.log('Notifications:', enabled);
}

function applyDataCollection(enabled) {
    console.log('Data collection:', enabled);
}

function applyCookies(enabled) {
    console.log('Cookies:', enabled);
}

function applySound(enabled) {
    console.log('Sound:', enabled);
}

function applyUsername(value) {
    console.log('Username:', value);
}

function applyEmail(value) {
    console.log('Email:', value);
}

function clearCache() {
    console.log('Cache cleared');
    alert(currentLang === 'zh' ? '缓存已清除！' : 'Cache cleared!');
}

function resetAllSettings() {
    console.log('All settings reset');
    if (settingsLanguage) settingsLanguage.value = 'zh';
    if (settingsFontSize) settingsFontSize.value = 'medium';
    if (settingsColorblindMode) settingsColorblindMode.checked = false;
    if (settingsEyeProtectionMode) settingsEyeProtectionMode.checked = false;
    if (settingsParentMode) settingsParentMode.checked = false;
    if (settingsAutoTranslate) settingsAutoTranslate.checked = false;
    if (settingsAutoSave) settingsAutoSave.checked = true;
    if (settingsDailyGoal) settingsDailyGoal.value = 30;
    if (settingsStudyReminder) settingsStudyReminder.checked = false;
    if (settingsNotifications) settingsNotifications.checked = true;
    if (settingsDataCollection) settingsDataCollection.checked = false;
    if (settingsCookies) settingsCookies.checked = true;
    if (settingsSound) settingsSound.checked = true;
    if (settingsVolume) {
        settingsVolume.value = 80;
        const volumeValue = settingsVolume.nextElementSibling;
        if (volumeValue) volumeValue.textContent = '80%';
    }
    if (settingsUsername) settingsUsername.value = '';
    if (settingsEmail) settingsEmail.value = '';

    applyFontSize('medium');
    applyColorblindMode(false);
    applyEyeProtectionMode(false);
    applyParentMode(false);
    applyVolume(80);
    updateLanguage('zh');

    alert(currentLang === 'zh' ? '所有设置已重置！' : 'All settings have been reset!');
}

document.addEventListener('DOMContentLoaded', function () {
    // 导航切换功能已重构为全局的 changeModule

    // 默认执行一下面包屑更新
    if (typeof updateIndexBreadcrumbs === 'function') {
        updateIndexBreadcrumbs('home');
    }

    // 表单提交处理
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('提交成功！');
        });
    });

    // 游戏开始按钮
    const gameButton = document.querySelector('#game .submit-btn');
    if (gameButton) {
        gameButton.addEventListener('click', function () {
            startGame();
        });
    }

    // 初始化知识点幻灯片
    initKnowledgeSlider();

    // 设置功能
    settingsLanguage = document.getElementById('settings-language');
    settingsFontSize = document.getElementById('settings-font-size');
    settingsColorblindMode = document.getElementById('settings-colorblind-mode');
    settingsEyeProtectionMode = document.getElementById('settings-eye-protection-mode');
    settingsParentMode = document.getElementById('settings-parent-mode');
    settingsAutoTranslate = document.getElementById('settings-auto-translate');
    settingsAutoSave = document.getElementById('settings-auto-save');
    settingsDailyGoal = document.getElementById('settings-daily-goal');
    settingsStudyReminder = document.getElementById('settings-study-reminder');
    settingsNotifications = document.getElementById('settings-notifications');
    settingsDataCollection = document.getElementById('settings-data-collection');
    settingsCookies = document.getElementById('settings-cookies');
    settingsSound = document.getElementById('settings-sound');
    settingsVolume = document.getElementById('settings-volume');
    settingsUsername = document.getElementById('settings-username');
    settingsEmail = document.getElementById('settings-email');
    const settingsSaveBtn = document.querySelector('#settings .submit-btn');
    const settingsClearCacheBtn = document.querySelector('#settings button[data-i18n="settings.clearCache"]');
    const settingsResetBtn = document.querySelector('#settings button[data-i18n="settings.resetSettings"]');
    const settingsChangePasswordBtn = document.querySelector('#settings button[data-i18n="settings.changePassword"]');
    const settingsDeleteAccountBtn = document.querySelector('#settings button[data-i18n="settings.deleteAccount"]');

    // 初始化设置值
    if (settingsLanguage) {
        settingsLanguage.value = currentLang;
    }

    // 语言切换
    if (settingsLanguage) {
        settingsLanguage.addEventListener('change', function () {
            updateLanguage(this.value);
        });
    }

    // 字体大小切换
    if (settingsFontSize) {
        settingsFontSize.addEventListener('change', function () {
            applyFontSize(this.value);
        });
    }

    // 色盲模式切换
    if (settingsColorblindMode) {
        settingsColorblindMode.addEventListener('change', function () {
            applyColorblindMode(this.checked);
        });
    }

    // 护眼模式切换
    if (settingsEyeProtectionMode) {
        settingsEyeProtectionMode.addEventListener('change', function () {
            applyEyeProtectionMode(this.checked);
        });
    }

    // 家长模式切换
    if (settingsParentMode) {
        settingsParentMode.addEventListener('change', function () {
            applyParentMode(this.checked);
        });
    }

    // 自动翻译切换
    if (settingsAutoTranslate) {
        settingsAutoTranslate.addEventListener('change', function () {
            applyAutoTranslate(this.checked);
        });
    }

    // 自动保存切换
    if (settingsAutoSave) {
        settingsAutoSave.addEventListener('change', function () {
            applyAutoSave(this.checked);
        });
    }

    // 每日学习目标
    if (settingsDailyGoal) {
        settingsDailyGoal.addEventListener('change', function () {
            applyDailyGoal(this.value);
        });
    }

    // 学习提醒切换
    if (settingsStudyReminder) {
        settingsStudyReminder.addEventListener('change', function () {
            applyStudyReminder(this.checked);
        });
    }

    // 通知切换
    if (settingsNotifications) {
        settingsNotifications.addEventListener('change', function () {
            applyNotifications(this.checked);
        });
    }

    // 数据收集切换
    if (settingsDataCollection) {
        settingsDataCollection.addEventListener('change', function () {
            applyDataCollection(this.checked);
        });
    }

    // Cookie切换
    if (settingsCookies) {
        settingsCookies.addEventListener('change', function () {
            applyCookies(this.checked);
        });
    }

    // 音效切换
    if (settingsSound) {
        settingsSound.addEventListener('change', function () {
            applySound(this.checked);
        });
    }

    // 音量滑动条
    if (settingsVolume) {
        const volumeValue = settingsVolume.nextElementSibling;
        settingsVolume.addEventListener('input', function () {
            if (volumeValue) {
                volumeValue.textContent = this.value + '%';
            }
            applyVolume(this.value);
        });
    }

    // 用户名输入
    if (settingsUsername) {
        settingsUsername.addEventListener('change', function () {
            applyUsername(this.value);
        });
    }

    // 邮箱输入
    if (settingsEmail) {
        settingsEmail.addEventListener('change', function () {
            applyEmail(this.value);
        });
    }

    // 清除缓存按钮
    if (settingsClearCacheBtn) {
        settingsClearCacheBtn.addEventListener('click', function () {
            if (confirm(currentLang === 'zh' ? '确定要清除缓存吗？' : 'Are you sure you want to clear cache?')) {
                clearCache();
            }
        });
    }

    // 重置设置按钮
    if (settingsResetBtn) {
        settingsResetBtn.addEventListener('click', function () {
            if (confirm(currentLang === 'zh' ? '确定要重置所有设置吗？' : 'Are you sure you want to reset all settings?')) {
                resetAllSettings();
            }
        });
    }

    // 修改密码按钮
    if (settingsChangePasswordBtn) {
        settingsChangePasswordBtn.addEventListener('click', function () {
            alert(currentLang === 'zh' ? '修改密码功能（演示）' : 'Change password (demo)');
        });
    }

    // 删除账户按钮
    if (settingsDeleteAccountBtn) {
        settingsDeleteAccountBtn.addEventListener('click', function () {
            if (confirm(currentLang === 'zh' ? '确定要删除账户吗？此操作不可恢复！' : 'Are you sure you want to delete your account? This action cannot be undone!')) {
                alert(currentLang === 'zh' ? '账户删除功能（演示）' : 'Delete account (demo)');
            }
        });
    }

    // 保存设置按钮（静态模式，不保存）
    if (settingsSaveBtn) {
        settingsSaveBtn.addEventListener('click', function () {
            alert(currentLang === 'zh' ? '设置已应用（当前会话有效）！' : 'Settings applied (current session only)!');
        });
    }

    // 初始化语言
    updateLanguage(currentLang);
});

// 全局导航功能与面包屑更新
window.changeModule = function (targetId) {
    const modules = document.querySelectorAll('.module');
    modules.forEach(module => {
        module.classList.remove('active');
    });
    const targetModule = document.getElementById(targetId);
    if (targetModule) {
        targetModule.classList.add('active');
    }

    // 更新面包屑
    updateIndexBreadcrumbs(targetId);
};

window.updateIndexBreadcrumbs = function (targetId) {
    const bc = document.getElementById('breadcrumb');
    if (!bc) return;

    const homeText = translations[currentLang]['nav.home'] || '首页';
    const homeLink = `<span class="bc-item" onclick="changeModule('home')">${homeText}</span>`;

    if (targetId === 'home') {
        bc.innerHTML = `<span class="bc-item" style="cursor:default; opacity:1;">${homeText}</span>`;
    } else {
        let pageText = '';
        if (targetId === 'settings') {
            pageText = translations[currentLang]['nav.settings'] || '设置';
        } else if (targetId === 'game') {
            pageText = translations[currentLang]['nav.game'] || '游戏';
        } else if (targetId === 'login') {
            pageText = translations[currentLang]['nav.login'] || '登录';
        }
        bc.innerHTML = `${homeLink} <span class="bc-separator">/</span> <span class="bc-item" style="cursor:default; opacity:1;">${pageText}</span>`;
    }
};

window.toggleLanguageBtn = function () {
    updateLanguage(currentLang === 'en' ? 'zh' : 'en');
};