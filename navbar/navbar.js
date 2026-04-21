// navbar.js
// 通用导航栏的 Web Component 封装

class TopNavbar extends HTMLElement {
    connectedCallback() {
        // 读取外部传入的属性，或者提供默认值
        const homeLink = this.getAttribute('home-link') || 'index.html';
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
                <button class="nav-icon-btn" onclick="toggleColorblindMode()" title="Colorblind Mode">◑</button>
                <button class="nav-icon-btn" onclick="toggleThemeMode()" title="Toggle Theme">☾</button>
                <button class="nav-lang-btn" onclick="triggerLanguageToggle()">EN/中</button>
            </div>
        `;

        let navMenuHtml = '';

        let quizUrl = homeLink.replace('index.html', 'quiz/quiz.html');
        let gameUrl = homeLink.replace('index.html', 'game/game_page.html');

        // 首页专属的控制栏配置
        if (pageType === 'index') {
            navMenuHtml = `
                <div class="nav-menu">
                    <a href="#home" class="nav-link active" data-i18n="nav.home">首页</a>
                    <a href="#quiz" class="nav-link" data-i18n="nav.quiz">检测</a>
                    <a href="#game" class="nav-link" data-i18n="nav.game">游戏</a>
                    <a href="#settings" class="nav-link" data-i18n="nav.settings">设置</a>
                </div>
            `;
            rightControls = `
                <div class="nav-control">
                    <button class="nav-lang-btn" onclick="triggerLanguageToggle()" id="lang-toggle-btn">EN/中</button>
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

// 将导航栏相关的通用UI控制函数暴露到全局
window.changeFontSize = function (value) {
    document.documentElement.style.fontSize = value + 'px';
};

window.toggleColorblindMode = function () {
    document.documentElement.toggleAttribute('data-colorblind');
};

window.toggleThemeMode = function () {
    if (typeof toggleTheme === 'function') {
        toggleTheme(); // quiz里可能已经覆盖的功能
    } else {
        if (document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
};

window.triggerLanguageToggle = function () {
    // 兼容多种业务逻辑文件对语言切换的挂载情况
    if (typeof toggleLanguage === 'function') {
        toggleLanguage(); // quiz里可能已经覆盖的功能
    } else if (typeof toggleLanguageBtn === 'function') {
        toggleLanguageBtn(); // index.html 里的名称
    }
};
