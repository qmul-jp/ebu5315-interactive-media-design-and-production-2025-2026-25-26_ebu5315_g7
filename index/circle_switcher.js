/**
 * 圆形物品切换器 - 首页交互组件
 * 顺序：渐变圆 → 篮球 → 足球 → 网球 → 太阳 → 月亮 → 渐变圆（循环）
 */
(function () {
    'use strict';

    // 物品配置：index 对应 data-index, glow 对应光晕 data-glow, label 是显示名
    const ITEMS = [
        { index: 0, glow: '' },           // 原始渐变圆
        { index: 1, glow: 'basketball' },
        { index: 2, glow: 'football' },
        { index: 3, glow: 'tennis' },
        { index: 4, glow: 'sun' },
        { index: 5, glow: 'moon' },
    ];

    let currentIndex = 0;
    let isAnimating = false;

    function init() {
        const container = document.getElementById('circle-switcher');
        if (!container) return;

        container.addEventListener('click', function (e) {
            // 防止动画期间重复点击
            if (isAnimating) return;
            isAnimating = true;

            const prevIndex = currentIndex;
            currentIndex = (currentIndex + 1) % ITEMS.length;

            switchTo(container, prevIndex, currentIndex);
        });
    }

    function switchTo(container, fromIdx, toIdx) {
        const fromLayer = container.querySelector(`.circle-layer[data-index="${ITEMS[fromIdx].index}"]`);
        const toLayer = container.querySelector(`.circle-layer[data-index="${ITEMS[toIdx].index}"]`);

        if (!fromLayer || !toLayer) {
            isAnimating = false;
            return;
        }

        // 1. 退出当前图层
        fromLayer.classList.remove('active');
        fromLayer.classList.add('exiting');

        // 2. 进入新图层（稍延迟让退出动画先行一点）
        setTimeout(() => {
            toLayer.classList.add('active');
        }, 80);

        // 3. 更新光晕颜色
        const glowKey = ITEMS[toIdx].glow;
        if (glowKey) {
            container.setAttribute('data-glow', glowKey);
        } else {
            container.removeAttribute('data-glow');
        }

        // 4. 在过渡结束后清理 exiting 类
        setTimeout(() => {
            fromLayer.classList.remove('exiting');
            isAnimating = false;
        }, 550);
    }

    // DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
