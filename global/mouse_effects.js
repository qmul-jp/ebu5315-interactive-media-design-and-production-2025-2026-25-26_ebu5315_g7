// mouse_effects.js
// 全局鼠标特效管理器 —— 统一控制 Cyber / iOS 两种点击特效
// 由导航栏按钮调用，跨所有页面生效

(function () {
    // 特效开关状态，持久化到 localStorage
    const STORAGE_KEY = 'mouse_effect_enabled';

    // 读取持久化状态（默认开启）
    let isEnabled = localStorage.getItem(STORAGE_KEY) !== 'false';

    /**
     * 根据当前主题选择对应的特效模块
     * dark -> CyberMouseEffect | light -> IOSMouseEffect
     */
    function getActiveEffect() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light' && window.IOSMouseEffect) return window.IOSMouseEffect;
        if (window.CyberMouseEffect) return window.CyberMouseEffect;
        return null;
    }

    /** 停止所有特效 */
    function stopAll() {
        if (window.CyberMouseEffect) window.CyberMouseEffect.stop();
        if (window.IOSMouseEffect) window.IOSMouseEffect.stop();
    }

    /** 根据 isEnabled 和当前主题启动/停止特效 */
    function applyState() {
        stopAll();
        if (isEnabled) {
            const fx = getActiveEffect();
            if (fx) fx.start();
        }
    }

    /**
     * 切换特效开关（导航栏按钮调用）
     */
    window.toggleMouseEffect = function () {
        isEnabled = !isEnabled;
        localStorage.setItem(STORAGE_KEY, isEnabled);
        applyState();
        // 更新按钮外观
        updateToggleBtn();
    };

    /**
     * 主题切换后需要刷新特效（旧主题停、新主题启）
     * 由 game_page.html 的 toggleTheme 内部调用
     */
    window.refreshMouseEffectOnThemeChange = function () {
        applyState();
    };

    /** 更新导航栏按钮的视觉反馈 */
    function updateToggleBtn() {
        const btn = document.getElementById('mouse-fx-toggle-btn');
        if (!btn) return;
        btn.textContent = isEnabled ? '✦' : '✧';
        btn.title = isEnabled ? 'Disable Click Effect' : 'Enable Click Effect';
        btn.style.opacity = isEnabled ? '1' : '0.5';
    }

    // DOM 就绪后：初始化特效 & 按钮状态
    document.addEventListener('DOMContentLoaded', function () {
        applyState();
        updateToggleBtn();
    });
})();
