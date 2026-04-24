// navbar.js
// 通用导航栏的 Web Component 封装

class TopNavbar extends HTMLElement {
    connectedCallback() {
        // 读取外部传入的属性，或者提供默认值
        const homeLink = this.getAttribute('home-link') || 'index/index.html';
        const pageType = this.getAttribute('page-type') || 'quiz'; // 默认为测试页，可传入 index 适配首页
        const i18nNavHome = this.getAttribute('i18n-nav-home') || 'bcHome';

        // 默认的完整功能控制栏（测试页面）
        let rightControls = `
            <div class="nav-control font-control">
                <span style="font-size: 0.75rem;">A</span>
                <input type="range" min="12" max="24" value="16" class="nav-slider" oninput="changeFontSize(this.value)">
                <span style="font-size: 1.125rem;">A</span>
            </div>
            <div class="nav-control">
                <button class="nav-icon-btn" id="mouse-fx-toggle-btn" onclick="toggleMouseEffect()" title="Toggle Click Effect">✦</button>
                <div class="nav-btn-wrapper" id="colorblind-btn-wrapper">
                    <button class="nav-icon-btn" id="colorblind-toggle-btn" onclick="toggleColorblindMode()" title="Colorblind Mode">◑</button>
                    <span class="nav-btn-status" id="colorblind-status">OFF</span>
                </div>
                <div class="nav-btn-wrapper" id="theme-btn-wrapper">
                    <button class="nav-icon-btn" id="theme-toggle-btn" onclick="toggleThemeMode()" title="Toggle Theme">☾</button>
                    <span class="nav-btn-status" id="theme-status">Light</span>
                </div>
                <div class="nav-lang-toggle" id="lang-toggle-btn" onclick="triggerLanguageToggle()" title="Switch Language">
                    <div class="lang-indicator"></div>
                    <span class="lang-label lang-label-zh active">中</span>
                    <span class="lang-label lang-label-en">EN</span>
                </div>
            </div>
        `;

        let navMenuHtml = '';

        let quizUrl = homeLink.replace('index/index.html', 'quiz/quiz.html').replace('index.html', 'quiz/quiz.html');
        let gameUrl = homeLink.replace('index/index.html', 'game/game_page.html').replace('index.html', 'game/game_page.html');

        // 首页专属的控制栏配置
        if (pageType === 'index') {
            navMenuHtml = `
                <div class="nav-menu">
                    <a href="#home" class="nav-link active" data-i18n="nav.home">首页</a>
                    <a href="../quiz/quiz.html" class="nav-link" data-i18n="nav.quiz">检测</a>
                    <a href="../game/game_page.html" class="nav-link" data-i18n="nav.game">游戏</a>
                </div>
            `;
            rightControls = `
                <div class="nav-control font-control">
                    <span style="font-size: 0.75rem;">A</span>
                    <input type="range" min="12" max="24" value="16" class="nav-slider" oninput="changeFontSize(this.value)">
                    <span style="font-size: 1.125rem;">A</span>
                </div>
                <div class="nav-control">
                    <button class="nav-icon-btn" id="mouse-fx-toggle-btn" onclick="toggleMouseEffect()" title="Toggle Click Effect">✦</button>
                    <div class="nav-btn-wrapper" id="colorblind-btn-wrapper">
                        <button class="nav-icon-btn" id="colorblind-toggle-btn" onclick="toggleColorblindMode()" title="Colorblind Mode">◑</button>
                        <span class="nav-btn-status" id="colorblind-status">OFF</span>
                    </div>
                    <div class="nav-btn-wrapper" id="theme-btn-wrapper">
                        <button class="nav-icon-btn" id="theme-toggle-btn" onclick="toggleThemeMode()" title="Toggle Theme">☾</button>
                        <span class="nav-btn-status" id="theme-status">Light</span>
                    </div>
                    <div class="nav-lang-toggle" id="lang-toggle-btn" onclick="triggerLanguageToggle()" title="Switch Language">
                        <div class="lang-indicator"></div>
                        <span class="lang-label lang-label-zh active">中</span>
                        <span class="lang-label lang-label-en">EN</span>
                    </div>
                </div>
            `;
        } else if (pageType === 'quiz' || pageType === 'game') {
            navMenuHtml = `
                <div class="nav-menu">
                    <a href="${homeLink}" class="nav-link" data-i18n="nav.home">首页</a>
                    <a href="${quizUrl}" class="nav-link ${pageType === 'quiz' ? 'active' : ''}" data-i18n="nav.quiz">检测</a>
                    <a href="${gameUrl}" class="nav-link ${pageType === 'game' ? 'active' : ''}" data-i18n="nav.game">游戏</a>
                </div>
            `;
        }

        let breadcrumbHtml = `<span class="bc-item" data-i18n="${i18nNavHome}" onclick="if(typeof changeModule === 'function') changeModule('home'); else if(document.querySelector('a[href=\\'#home\\']')) document.querySelector('a[href=\\'#home\\']').click(); else window.location.href='${homeLink}'" style="cursor:pointer;">Home</span>`;
        if (pageType === 'quiz') {
            breadcrumbHtml += ` <span class="bc-separator">/</span> <span class="bc-item" style="cursor:default; opacity:1;" data-i18n="nav.quiz">Quiz</span>`;
        } else if (pageType === 'game') {
            breadcrumbHtml += ` <span class="bc-separator">/</span> <span class="bc-item" style="cursor:default; opacity:1;" data-i18n="nav.game">Game</span>`;
        }

        // 渲染内部HTML
        this.innerHTML = `
            <nav class="top-navbar">
                <div class="nav-left">
                    <span class="breadcrumb" id="breadcrumb">
                        ${breadcrumbHtml}
                    </span>
                </div>
                ${navMenuHtml}
                <div class="nav-right">
                    ${rightControls}
                </div>
            </nav>
        `;
    }
}

// 注册 Web Component
customElements.define('top-navbar', TopNavbar);

// =============================================
// 跨页面状态持久化：主题 & 语言
// =============================================

// 立即执行：在页面渲染前恢复主题，避免闪烁
(function () {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
})();

// 页面加载后恢复语言
document.addEventListener('DOMContentLoaded', function () {
    const savedLang = localStorage.getItem('app_lang');
    if (!savedLang) return;
    // 延迟执行，确保各页面脚本已完成初始化
    setTimeout(function () {
        if (typeof currentLang !== 'undefined' && currentLang !== savedLang) {
            // quiz 页面使用 setLanguage()，首页使用 updateLanguage()
            if (typeof setLanguage === 'function') {
                setLanguage(savedLang);
            } else if (typeof updateLanguage === 'function') {
                updateLanguage(savedLang);
            }
        }
    }, 0);
});

// 将导航栏相关的通用UI控制函数暴露到全局
window.changeFontSize = function (value) {
    document.documentElement.style.fontSize = value + 'px';
};

window.isColorblindMode = false;

window.toggleColorblindMode = function () {
    window.isColorblindMode = !window.isColorblindMode;
    document.documentElement.toggleAttribute('data-colorblind');

    // Notify Game 2 to redraw
    if (typeof needsBgCacheUpdate2 !== 'undefined') {
        needsBgCacheUpdate2 = true;
        needsRedraw2 = true;
    }
    // Notify Game 1 to redraw if applicable
    if (typeof needsRedraw !== 'undefined') {
        needsRedraw = true;
    }
    updateColorblindBtn();
};

// 更新色盲模式按钮的视觉状态
window.updateColorblindBtn = function () {
    const btn = document.getElementById('colorblind-toggle-btn');
    const status = document.getElementById('colorblind-status');
    const wrapper = document.getElementById('colorblind-btn-wrapper');
    if (!btn) return;
    const isOn = window.isColorblindMode;
    btn.classList.toggle('nav-icon-btn--active', isOn);
    if (wrapper) wrapper.classList.toggle('nav-btn-wrapper--active', isOn);
    if (status) status.textContent = isOn ? 'ON' : 'OFF';
};

window.toggleThemeMode = function () {
    if (typeof toggleTheme === 'function') {
        toggleTheme(); // quiz 里可能已经覆盖的功能
    } else {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        // 持久化到 localStorage
        localStorage.setItem('app_theme', newTheme);
    }
    updateThemeBtn();
};

// 更新主题切换按钮的视觉状态
window.updateThemeBtn = function () {
    const btn = document.getElementById('theme-toggle-btn');
    const status = document.getElementById('theme-status');
    const wrapper = document.getElementById('theme-btn-wrapper');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.classList.toggle('nav-icon-btn--active', isDark);
    if (wrapper) wrapper.classList.toggle('nav-btn-wrapper--active', isDark);
    if (status) status.textContent = isDark ? 'Dark' : 'Light';
    btn.textContent = isDark ? '☀' : '☾';
};

window.triggerLanguageToggle = function () {
    // 兼容多种业务逻辑文件对语言切换的挂载情况
    if (typeof toggleLanguage === 'function') {
        toggleLanguage(); // quiz / game 里可能已经覆盖的功能
    } else if (typeof toggleLanguageBtn === 'function') {
        toggleLanguageBtn(); // index.html 里的名称
    }
    // 统一更新导航栏语言切换开关的视觉状态
    updateNavLangToggle();
};

// 通用的语言切换开关 UI 更新函数（供所有页面使用）
window.updateNavLangToggle = function () {
    const btn = document.getElementById('lang-toggle-btn');
    if (!btn) return;
    const lang = localStorage.getItem('app_lang') || (typeof currentLang !== 'undefined' ? currentLang : 'zh');
    const indicator = btn.querySelector('.lang-indicator');
    const zhLabel = btn.querySelector('.lang-label-zh');
    const enLabel = btn.querySelector('.lang-label-en');
    if (indicator) {
        indicator.style.transform = lang === 'zh' ? 'translateX(0)' : 'translateX(100%)';
    }
    if (zhLabel) zhLabel.classList.toggle('active', lang === 'zh');
    if (enLabel) enLabel.classList.toggle('active', lang === 'en');
};

// 页面加载后初始化语言切换开关的视觉状态
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        updateNavLangToggle();  // 语言开关
        updateColorblindBtn(); // 色盲模式按钮
        updateThemeBtn();      // 主题按钮
    }, 50); // 延迟确保组件已渲染
});
