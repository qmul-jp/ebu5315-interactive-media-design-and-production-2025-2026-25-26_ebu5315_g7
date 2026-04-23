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
        'nav.font': '字体',
        'nav.language': '中文',
        'breadcrumb.home': '首页',
        'breadcrumb.geometry': '几何学习',
        'hero.title': '探索几何的无限魅力',
        'hero.subtitle': '专业的数学几何学习平台，让抽象的几何概念变得直观易懂',
        'hero.startLearning': '开始测验',
        'hero.geometryGames': '几何游戏',
        'features.title': '平台特色',
        'features.subtitle': '专业的数学几何学习平台，让抽象的几何概念变得直观易懂',
        'features.systematic': '记忆卡片',
        'features.systematicDesc': '包含圆的六个定理的知识翻转卡片，可交互',
        'features.intelligent': '智能搜索',
        'features.intelligentDesc': '快速找到你需要的几何知识点',
        'features.quiz': '在线检测',
        'features.quizDesc': '实时检验学习成果，巩固知识点',
        'features.games': '几何游戏',
        'features.gamesDesc': '通过游戏化方式加深几何概念理解',
        'features.learnMore': '了解更多',
        'login.title': '用户登录',
        'login.username': '用户名',
        'login.password': '密码',
        'login.privacy': '我已阅读并同意<a href="#" onclick="alert(\'隐私政策：我们尊重您的隐私，不会收集任何个人信息。\')">隐私政策</a>',
        'login.enter': '进入',
        'hero.searchPlaceholder': '向AI助手提问，如：什么是垂径定理？',
        'hero.askAi': '✨ 提问',
        'hero.aiThinking': '✨ AI 正在思考中...',
        'quiz.title': '在线检测',
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
        'knowledge.circumferentialAngleDesc': '同弧或等弧所对的圆周角相等。',
        'knowledge.standardEquation': '圆的标准方程',
        'knowledge.standardEquationDesc': '(x-a)² + (y-b)² = r²，其中(a,b)为圆心坐标，r为半径',
        'knowledge.tangentProperty': '切线与半径定理',
        'knowledge.tangentPropertyDesc': '圆的切线垂直于经过切点的半径。',
        'knowledge.centralAngle': '圆心角定理',
        'knowledge.centralAngleDesc': '圆心角的度数等于圆周角的二倍。',
        'knowledge.semiCircleAngle': '半圆上的圆周角',
        'knowledge.semiCircleAngleDesc': '半圆（或直径）所对的圆周角是直角（90°）。',
        'knowledge.cyclicQuadrilateral': '圆内接四边形定理',
        'knowledge.cyclicQuadrilateralDesc': '圆内接四边形的对角互补，并且任何一个外角等于它的内对角。',
        'knowledge.generalEquation': '圆的一般方程',
        'knowledge.generalEquationDesc': 'x² + y² + Dx + Ey + F = 0，其中D² + E² - 4F > 0',
        'knowledge.circleRelations': '两圆位置关系',
        'knowledge.circleRelationsDesc': '外离、外切、相交、内切、内含五种位置关系，由圆心距与两圆半径决定',
        'knowledge.chordTangentAngle': '弦切角定理',
        'knowledge.chordTangentAngleDesc': '弦切角的度数等于它所夹的弧对的圆周角的度数。',
        'quizIntro.title': '检测功能介绍',
        'quizIntro.RealTimeFeedback': '实时反馈',
        'quizIntro.RealTimeFeedbackDesc': '提交答案后立即获得反馈，了解自己的学习情况',
        'quizIntro.ProgressTracking': '进度追踪',
        'quizIntro.ProgressTrackingDesc': '记录学习进度，帮助你了解自己的薄弱环节',
        'quizIntro.TargetedPractice': '针对性练习',
        'quizIntro.TargetedPracticeDesc': '根据你的学习情况，提供个性化的练习题目',
        'quizIntro.AchievementSystem': '成就系统',
        'quizIntro.AchievementSystemDesc': '通过完成检测获得成就，激发学习动力',
        'database.title': '网页数据库介绍',
        'database.dataStorage': '数据存储',
        'database.dataStorageDesc': '安全存储用户学习数据和检测结果，确保数据不丢失',
        'database.dataSecurity': '数据安全',
        'database.dataSecurityDesc': '采用加密技术保护用户数据，确保隐私安全',
        'database.dataAnalysis': '数据分析',
        'database.dataAnalysisDesc': '通过数据分析为用户提供个性化学习建议',
        'database.dataSync': '数据同步',
        'database.dataSyncDesc': '多设备数据同步，随时随地继续学习',
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
        'footer.copyright': '© 2026 圆数学教学平台. 万物皆数.',
        'contact.title': '联系我们',
        'contact.subtitle': '有任何问题或建议？我们很乐意倾听。',
        'contact.demoNotice': '这是演示表单，填写信息不会被实际发送。',
        'contact.name': '您的姓名',
        'contact.namePlaceholder': '请输入您的姓名',
        'contact.required': '（必填）',
        'contact.pronouns': '代词（可选）',
        'contact.pronounsHint': '— 方便正确称呼您',
        'contact.pronounsSelect': '请选择或留空',
        'contact.pronounsHe': 'He / Him（他）',
        'contact.pronounsShe': 'She / Her（她）',
        'contact.pronounsThey': 'They / Them（TA）',
        'contact.pronounsPreferNot': '不透露',
        'contact.email': '电子邮箱',
        'contact.emailPlaceholder': 'your@email.com',
        'contact.subject': '主题',
        'contact.subjectSelect': '请选择主题',
        'contact.subjectFeedback': '产品反馈',
        'contact.subjectBug': '问题报告',
        'contact.subjectCollaboration': '合作咨询',
        'contact.subjectAccessibility': '无障碍反馈',
        'contact.subjectOther': '其他',
        'contact.message': '留言内容',
        'contact.messagePlaceholder': '请输入您的留言...',
        'contact.privacyNotice': '🔒 数据透明声明：您提交的信息仅用于回复本次来信，不会与第三方共享，保留期不超过 90 天。这是演示表单—数据不会实际发送。',
        'contact.consentLegend': '数据使用同意',
        'contact.consentReply': '我同意平台通过我填写的邮箱联系我，以回复本次留言',
        'contact.consentNewsletter': '我愿意接收平台学习资讯与更新通知',
        'contact.optional2': '— 可选，可随时取消',
        'contact.submit': '发送留言',
        'contact.successMsg': '留言已提交！我们将尽快与您联系。（演示模式）',
        'contact.toggleBtn': '反馈建议',
        'contact.toggleBtnHide': '收起表单',
        'contact.validationName': '请填写您的姓名。',
        'contact.validationEmail': '请填写有效的电子邮箱。',
        'contact.validationSubject': '请选择留言主题。',
        'contact.validationMessage': '请填写留言内容。',
        'contact.validationConsent': '请勾选同意条款以继续。',
        'knowledge.ExploreMoreGeometryMysteries': '探索更多几何奥秘',
        'knowledge.ExploreMoreGeometryMysteriesDesc': '加入我们的高级会员计划，解锁更多功能，让学习更高效。',
        'knowledge.ExploreMoreGeometryMysteriesBtn': '立即解锁'
    },
    en: {
        logo: 'Circle · Geometry',
        'nav.home': 'Home',
        'nav.teach': 'Teaching',
        'nav.search': 'Search',
        'nav.quiz': 'Quiz',
        'nav.game': 'Games',
        'nav.settings': 'Settings',
        'nav.login': 'Login',
        'nav.font': 'Font',
        'nav.language': 'English',
        'breadcrumb.home': 'Home',
        'breadcrumb.geometry': 'Geometry Learning',
        'hero.title': 'Explore the Infinite Charm of Geometry',
        'hero.subtitle': 'A professional mathematics geometry learning platform that makes abstract geometric concepts intuitive and easy to understand',
        'hero.startLearning': 'Start Quiz',
        'hero.geometryGames': 'Geometry Games',
        'features.title': 'Platform Features',
        'features.subtitle': 'Professional mathematics geometry learning platform, making abstract geometric concepts intuitive and easy to understand',
        'features.systematic': 'Memory Cards',
        'features.systematicDesc': 'Including interactive knowledge flip cards for the six theorems of circle',
        'features.intelligent': 'Intelligent Search',
        'features.intelligentDesc': 'Quickly find the geometry knowledge points you need',
        'features.quiz': 'Online Quiz',
        'features.quizDesc': 'Real-time inspection of learning outcomes, consolidate knowledge points',
        'features.games': 'Geometry Games',
        'features.gamesDesc': 'Deepen geometric concept understanding through gamification',
        'features.learnMore': 'Learn More',
        'login.title': 'User Login',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.privacy': 'I have read and agree to the <a href="#" onclick="alert(\'Privacy Policy: We respect your privacy and will not collect any personal information.\')">Privacy Policy</a>',
        'login.enter': 'Enter',
        'hero.searchPlaceholder': 'Ask AI assistant, e.g.: What is the Vertical Diameter Theorem?',
        'hero.askAi': '✨ Ask',
        'hero.aiThinking': '✨ AI is thinking...',
        'quiz.title': 'Online Quiz',
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
        'knowledge.circumferentialAngle': 'Inscribed Angle Theorem',
        'knowledge.circumferentialAngleDesc': 'Inscribed angles subtended by the same arc are equal.',
        'knowledge.standardEquation': 'Standard Equation of a Circle',
        'knowledge.standardEquationDesc': '(x-a)² + (y-b)² = r², where (a,b) is center and r is radius',
        'knowledge.tangentProperty': 'Tangent-Radius Theorem',
        'knowledge.tangentPropertyDesc': 'The tangent to a circle is perpendicular to the radius at the point of tangency.',
        'knowledge.centralAngle': 'Central Angle Theorem',
        'knowledge.centralAngleDesc': 'The measure of a central angle is twice the measure of the inscribed angle.',
        'knowledge.semiCircleAngle': 'Angle in a Semicircle',
        'knowledge.semiCircleAngleDesc': 'The angle subtended by a semicircle (or diameter) is a right angle (90°).',
        'knowledge.cyclicQuadrilateral': 'Cyclic Quadrilateral Theorem',
        'knowledge.cyclicQuadrilateralDesc': 'Opposite angles of a cyclic quadrilateral are supplementary, and any exterior angle is equal to the interior opposite angle.',
        'knowledge.generalEquation': 'General Equation of a Circle',
        'knowledge.generalEquationDesc': 'x² + y² + Dx + Ey + F = 0, where D² + E² - 4F > 0',
        'knowledge.circleRelations': 'Positional Relationships of Two Circles',
        'knowledge.circleRelationsDesc': 'Five positional relationships: separate, externally tangent, intersecting, internally tangent, and nested, determined by distance between centers and radii',
        'knowledge.chordTangentAngle': 'Tangent-Chord Theorem',
        'knowledge.chordTangentAngleDesc': 'The angle between a tangent and a chord is equal to the angle in the alternate segment.',
        'quizIntro.title': 'Quiz Feature Introduction',
        'quizIntro.RealTimeFeedback': 'Real-time Feedback',
        'quizIntro.RealTimeFeedbackDesc': 'Get immediate feedback after submitting answers to understand your learning status',
        'quizIntro.ProgressTracking': 'Progress Tracking',
        'quizIntro.ProgressTrackingDesc': 'Record learning progress to help you understand your weak areas',
        'quizIntro.TargetedPractice': 'Targeted Practice',
        'quizIntro.TargetedPracticeDesc': 'Provide personalized practice questions based on your learning situation',
        'quizIntro.AchievementSystem': 'Achievement System',
        'quizIntro.AchievementSystemDesc': 'Earn achievements by completing quizzes to motivate learning',
        'database.title': 'Web Database Introduction',
        'database.dataStorage': 'Data Storage',
        'database.dataStorageDesc': 'Securely store user learning data and quiz results to ensure data is not lost',
        'database.dataSecurity': 'Data Security',
        'database.dataSecurityDesc': 'Use encryption technology to protect user data and ensure privacy security',
        'database.dataAnalysis': 'Data Analysis',
        'database.dataAnalysisDesc': 'Provide personalized learning recommendations through data analysis',
        'database.dataSync': 'Data Synchronization',
        'database.dataSyncDesc': 'Multi-device data synchronization, continue learning anytime, anywhere',
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
        'footer.copyright': '© 2026 Circle Mathematics Teaching Platform. Everything is number.',
        'contact.title': 'Contact Us',
        'contact.subtitle': 'Have a question or suggestion? We would love to hear from you.',
        'contact.demoNotice': 'This is a demo form - information submitted will not actually be sent.',
        'contact.name': 'Your Name',
        'contact.namePlaceholder': 'Enter your name',
        'contact.required': '(required)',
        'contact.pronouns': 'Pronouns (optional)',
        'contact.pronounsHint': '- helps us address you correctly',
        'contact.pronounsSelect': 'Select or leave blank',
        'contact.pronounsHe': 'He / Him',
        'contact.pronounsShe': 'She / Her',
        'contact.pronounsThey': 'They / Them',
        'contact.pronounsPreferNot': 'Prefer not to say',
        'contact.email': 'Email Address',
        'contact.emailPlaceholder': 'your@email.com',
        'contact.subject': 'Subject',
        'contact.subjectSelect': 'Select a subject',
        'contact.subjectFeedback': 'Product Feedback',
        'contact.subjectBug': 'Bug Report',
        'contact.subjectCollaboration': 'Collaboration Inquiry',
        'contact.subjectAccessibility': 'Accessibility Feedback',
        'contact.subjectOther': 'Other',
        'contact.message': 'Message',
        'contact.messagePlaceholder': 'Write your message here...',
        'contact.privacyNotice': 'Transparency Notice: Information you submit is used solely to reply to your message, will not be shared with third parties, and retained for no longer than 90 days. This is a demo form - no data is actually sent.',
        'contact.consentLegend': 'Data Use Consent',
        'contact.consentReply': 'I agree to be contacted at the email address provided to receive a reply to this message',
        'contact.consentNewsletter': 'I would like to receive learning updates and news from the platform',
        'contact.optional2': '- optional, unsubscribe anytime',
        'contact.submit': 'Send Message',
        'contact.successMsg': 'Message submitted! We will get back to you as soon as possible. (Demo mode)',
        'contact.toggleBtn': 'Feedback & Suggestions',
        'contact.toggleBtnHide': 'Collapse Form',
        'contact.validationName': 'Please enter your name.',
        'contact.validationEmail': 'Please enter a valid email address.',
        'contact.validationSubject': 'Please select a subject.',
        'contact.validationMessage': 'Please write your message.',
        'contact.validationConsent': 'Please check the consent box to continue.',
        'knowledge.ExploreMoreGeometryMysteries': 'Explore More Geometry Mysteries',
        'knowledge.ExploreMoreGeometryMysteriesDesc': 'Join our advanced membership plan to unlock more features and make learning more efficient.',
        'knowledge.ExploreMoreGeometryMysteriesBtn': 'Unlock Now'
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
    // 导航切换功能
    const navLinks = document.querySelectorAll('.nav-link');
    const modules = document.querySelectorAll('.module');

    // 导航链接点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();

                if (href === '#quiz') {
                    window.location.href = '../quiz/quiz.html';
                    return;
                } else if (href === '#game') {
                    window.location.href = '../game/game_page.html';
                    return;
                }

                // 获取目标模块ID
                const targetId = href.substring(1);

                // 隐藏所有模块
                modules.forEach(module => {
                    module.classList.remove('active');
                });

                // 显示目标模块
                const targetModule = document.getElementById(targetId);
                if (targetModule) {
                    targetModule.classList.add('active');
                }

                // 更新导航链接激活状态
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // 表单提交处理（联系表单有专属验证，跳过；其余表单拦截默认提交）
    const forms = document.querySelectorAll('form:not(#contact-form)');
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

    // 导航栏字体滑块功能
    const navFontSlider = document.querySelector('.nav-slider');
    let originalFontSizes = new Map();

    function saveOriginalFontSizes() {
        document.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6').forEach(el => {
            originalFontSizes.set(el, parseFloat(getComputedStyle(el).fontSize));
        });
    }

    function applyFontSize(fontSize) {
        const scale = fontSize / 16;
        originalFontSizes.forEach((originalSize, el) => {
            if (el.isConnected) {
                el.style.fontSize = (originalSize * scale) + 'px';
            }
        });
    }

    if (navFontSlider) {
        saveOriginalFontSizes();
        navFontSlider.addEventListener('input', function () {
            const fontSize = this.value;
            applyFontSize(fontSize);
        });
    }

    // 导航栏按钮功能
    const navIconBtns = document.querySelectorAll('.nav-icon-btn');
    navIconBtns.forEach((btn, index) => {
        btn.addEventListener('click', function () {
            const emoji = this.textContent.trim();
            if (emoji === '🌙' || emoji === '☀️') {
                const isEyeProtection = document.body.classList.toggle('eye-protection-mode');
                this.textContent = isEyeProtection ? '☀️' : '🌙';
            } else if (emoji === '🔔') {
                alert(currentLang === 'zh' ? '暂无新通知' : 'No new notifications');
            } else if (emoji === '👤') {
                const settingsModule = document.getElementById('settings');
                const modules = document.querySelectorAll('.module');
                const navLinks = document.querySelectorAll('.nav-link');

                modules.forEach(m => m.classList.remove('active'));
                navLinks.forEach(n => n.classList.remove('active'));

                if (settingsModule) settingsModule.classList.add('active');
                const settingsNavLink = document.querySelector('[href="#settings"]');
                if (settingsNavLink) settingsNavLink.classList.add('active');

                setTimeout(() => {
                    const loginForm = settingsModule.querySelector('.login-form');
                    if (loginForm) {
                        loginForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        });
    });

    // 语言切换功能 (由导航栏 triggerLanguageToggle 调用)
    window.toggleLanguage = function () {
        const newLang = currentLang === 'zh' ? 'en' : 'zh';
        updateLanguage(newLang);
        localStorage.setItem('app_lang', newLang);
    };

    // 设置功能
    // 初始化语言：优先读取 localStorage 中保存的语言
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang && savedLang !== currentLang) {
        updateLanguage(savedLang);
    } else {
        updateLanguage(currentLang);
    }

    // 实现h2标题背景随滚动变化的效果 - 优化性能版本
    let h2Elements = null;
    let isTicking = false;

    function updateH2Backgrounds() {
        if (!h2Elements) h2Elements = document.querySelectorAll('h2');
        
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        const viewportCenter = scrollY + vh / 2;

        for (let i = 0; i < h2Elements.length; i++) {
            const h2 = h2Elements[i];
            const h2Rect = h2.getBoundingClientRect();
            const h2Top = h2Rect.top + scrollY;
            const h2Height = h2Rect.height;
            const h2Center = h2Top + h2Height / 2;

            // 计算滚动偏移量
            const offset = (viewportCenter - h2Center) / vh;

            // 更新样式
            const bgPositionX = 50 + offset * 20;
            h2.style.backgroundPosition = `${bgPositionX}% 50%`;

            const distance = Math.abs(viewportCenter - h2Center);
            const maxDistance = vh * 1.5;
            const opacity = Math.max(0.8, 1 - distance / maxDistance);
            h2.style.opacity = opacity;

            const scale = Math.max(0.9, 1 - Math.abs(offset) * 0.1);
            h2.style.transform = `scale(${scale})`;
        }
        
        isTicking = false;
    }

    // 初始调用一次
    updateH2Backgrounds();

    // 使用 requestAnimationFrame 节流滚动事件
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(updateH2Backgrounds);
            isTicking = true;
        }
    }, { passive: true });
});



// --- AI 模拟助手功能 ---
const aiDictionary = {
    zh: {
        "垂径定理": "垂径定理：垂直于弦的直径平分弦，并且平分弦所对的两条弧。这是圆的基本性质之一，常用于解决弦长和距离问题。",
        "圆周角": "圆周角定理：同弧或等弧所对的圆周角相等；半圆（或直径）所对的圆周角是直角（90°）。圆周角的度数等于它所对的弧的度数的一半。",
        "圆心角": "圆心角定理：在同圆或等圆中，相等的圆心角所对的弧相等，所对的弦也相等；圆心角的度数等于它所对的弧的度数。圆心角的度数是圆周角的两倍。",
        "切线": "切线性质：圆的切线垂直于经过切点的半径。推论：经过圆心且垂直于切线的直线必经过切点。过圆外一点引圆的两条切线，切线长相等。",
        "方程": "圆的标准方程：(x-a)² + (y-b)² = r²，其中(a,b)为圆心，r为半径。一般方程：x² + y² + Dx + Ey + F = 0 (D² + E² > 4F)。",
        "内接四边形": "圆内接四边形：它的对角互补（相加等于180°），并且任何一个外角等于它的内对角。",
        "弦切角": "弦切角定理：弦切角的度数等于它所夹的弧对的圆周角的度数。",
        "圆的定义": "圆的定义：平面内到一个定点的距离等于定长的点的集合。定点即圆心，定长即半径。",
        "面积": "圆的面积公式：S = πr²，其中r为半径。",
        "周长": "圆的周长公式：C = 2πr 或者 C = πd，其中r为半径，d为直径。",
        "你好": "你好！我是圆数学教学平台的人工智能助手，很高兴为您服务。",
        "默认": "抱歉，我目前的几何知识库中没有直接匹配该问题的答案，您可以尝试提问：什么是垂径定理？圆周角定理是什么？圆的标准方程等..."
    },
    en: {
        "vertical diameter": "Vertical Diameter Theorem: A diameter perpendicular to a chord bisects the chord and its arcs.",
        "inscribed angle": "Inscribed Angle Theorem: Inscribed angles subtended by the same arc are equal. The angle subtended by a semicircle is a right angle.",
        "central angle": "Central Angle Theorem: The measure of a central angle is twice the measure of the inscribed angle subtended by the same arc.",
        "tangent": "Tangent Property: The tangent to a circle is perpendicular to the radius at the point of tangency.",
        "equation": "Standard Equation: (x-a)² + (y-b)² = r², where (a,b) is the center and r is the radius.",
        "cyclic quadrilateral": "Cyclic Quadrilateral: Opposite angles of a cyclic quadrilateral are supplementary (sum to 180°).",
        "chord-tangent": "Tangent-Chord Theorem: The angle between a tangent and a chord is equal to the angle in the alternate segment.",
        "definition": "Definition of a Circle: The set of all points in a plane that are at a given distance from a given point, the center.",
        "area": "Area of a circle: A = πr².",
        "circumference": "Circumference of a circle: C = 2πr.",
        "hello": "Hello! I am the AI assistant of the Circle Mathematics Teaching Platform, happy to serve you.",
        "default": "Sorry, I couldn't find a direct match in my geometry knowledge base. Try asking about: central angle, tangent, vertical diameter, equation, etc."
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const aiSearchBtn = document.getElementById('ai-search-btn');
    const aiSearchInput = document.querySelector('.hero-search-input');
    const responseBox = document.getElementById('ai-chat-response');
    const loadingEl = responseBox ? responseBox.querySelector('.ai-loading') : null;
    const answerEl = responseBox ? responseBox.querySelector('.ai-answer') : null;

    if (!aiSearchBtn || !aiSearchInput || !responseBox) return;

    function triggerAI() {
        const query = aiSearchInput.value.trim().toLowerCase();
        if (!query) return;

        // 显示解答框和加载动画
        responseBox.style.display = 'block';
        loadingEl.style.display = 'flex';
        answerEl.style.display = 'none';
        answerEl.innerHTML = '';

        // 模拟 AI 思考延迟 1.5 - 2 秒
        setTimeout(() => {
            loadingEl.style.display = 'none';
            answerEl.style.display = 'block';

            const dict = aiDictionary[currentLang] || aiDictionary['zh'];
            let foundAnswer = dict['默认'] || dict['default'];

            const zhKeys = Object.keys(aiDictionary.zh);
            const enKeys = Object.keys(aiDictionary.en);
            let matchedIndex = -1;

            for (let i = 0; i < zhKeys.length; i++) {
                if (zhKeys[i] !== '默认' && query.includes(zhKeys[i].toLowerCase())) {
                    matchedIndex = i;
                    break;
                }
            }

            if (matchedIndex === -1) {
                for (let i = 0; i < enKeys.length; i++) {
                    if (enKeys[i] !== 'default' && query.includes(enKeys[i].toLowerCase())) {
                        matchedIndex = i;
                        break;
                    }
                }
            }

            if (matchedIndex !== -1) {
                const targetKeys = Object.keys(dict);
                if (matchedIndex < targetKeys.length) {
                    foundAnswer = dict[targetKeys[matchedIndex]];
                }
            }

            // 简单打字机效果显示文本
            answerEl.innerHTML = '';
            let i = 0;
            function typeWriter() {
                if (i < foundAnswer.length) {
                    answerEl.innerHTML += foundAnswer.charAt(i);
                    i++;
                    setTimeout(typeWriter, 15);
                }
            }
            typeWriter();

        }, 1500);
    }

    aiSearchBtn.addEventListener('click', triggerAI);
    aiSearchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            triggerAI();
        }
    });
});

// =============================
// Contact Us Form Handler
// =============================
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const validationMsg = document.getElementById('contact-validation-msg');
    const successToast = document.getElementById('contact-success-toast');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value.trim();
        const consentReply = document.getElementById('consent-reply').checked;

        const t = translations[currentLang] || translations['zh'];

        // Validate required fields
        if (!name) {
            showContactValidation(t['contact.validationName']);
            document.getElementById('contact-name').focus();
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showContactValidation(t['contact.validationEmail']);
            document.getElementById('contact-email').focus();
            return;
        }
        if (!subject) {
            showContactValidation(t['contact.validationSubject']);
            document.getElementById('contact-subject').focus();
            return;
        }
        if (!message) {
            showContactValidation(t['contact.validationMessage']);
            document.getElementById('contact-message').focus();
            return;
        }
        if (!consentReply) {
            showContactValidation(t['contact.validationConsent']);
            document.getElementById('consent-reply').focus();
            return;
        }

        // All valid — hide validation, show success
        hideContactValidation();
        contactForm.style.opacity = '0.5';
        contactForm.style.pointerEvents = 'none';

        setTimeout(function () {
            contactForm.style.display = 'none';
            if (successToast) {
                successToast.style.display = 'block';
                // Update toast text in case language was switched
                const toastSpan = successToast.querySelector('[data-i18n="contact.successMsg"]');
                if (toastSpan && t['contact.successMsg']) {
                    toastSpan.textContent = t['contact.successMsg'];
                }
            }
        }, 400);
    });

    function showContactValidation(msg) {
        if (!validationMsg) return;
        validationMsg.textContent = msg;
        validationMsg.style.display = 'block';
        validationMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideContactValidation() {
        if (!validationMsg) return;
        validationMsg.style.display = 'none';
        validationMsg.textContent = '';
    }

    // Toggle Form Visibility
    const toggleBtn = document.getElementById('toggle-feedback-btn');
    const collapsibleForm = document.getElementById('collapsible-contact-form');

    if (toggleBtn && collapsibleForm) {
        toggleBtn.addEventListener('click', function () {
            const isExpanded = collapsibleForm.classList.toggle('expanded');

            // Update button text using i18n key
            const key = isExpanded ? 'contact.toggleBtnHide' : 'contact.toggleBtn';
            toggleBtn.setAttribute('data-i18n', key);

            // Re-run i18n update for this button specifically
            const t = translations[currentLang] || translations['zh'];
            if (t[key]) {
                toggleBtn.textContent = t[key];
            }

            // If collapsing, scroll button into view if it moved
            if (!isExpanded) {
                toggleBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
});

// =============================
// Hero Button Ripple Effect
// =============================
document.addEventListener('DOMContentLoaded', function () {
    const heroButtons = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary');

    heroButtons.forEach(btn => {
        btn.addEventListener('mousedown', function (e) {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');

            // Position at click point relative to button
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - 5;
            const y = e.clientY - rect.top - 5;
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            btn.appendChild(ripple);

            // Remove after animation completes
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });
});