// mouse_effects_ios.js
window.IOSMouseEffect = (function() {
    let rippleCanvas = null;
    let ctx = null;
    let width, height;
    let ripples = [];
    let animationId = null;
    let isRunning = false;

    // 清透水波纹类
    class WaterRipple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.age = 0;
            this.maxAge = 45; // 动画持续帧数，干净利落
            this.radius = 2;  // 初始半径
            // 使用 iOS 系统蓝作为水波颜色
            this.color = '0, 122, 255'; 
        }

        update() {
            this.age++;
            // 使用减速曲线扩散 (Ease-out)
            const progress = this.age / this.maxAge;
            this.radius += 1.5 * (1 - Math.pow(progress, 3)); 
        }

        draw(ctx) {
            const progress = this.age / this.maxAge;
            // 透明度从 0.6 线性衰减到 0
            const alpha = 0.6 * (1 - progress);
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${this.color}, ${alpha})`;
            // 边缘随着扩散稍微变粗然后消失
            ctx.lineWidth = Math.max(1, 3 * (1 - progress));
            ctx.stroke();
        }
    }

    function resize() {
        if(!rippleCanvas) return;
        width = window.innerWidth; height = window.innerHeight;
        rippleCanvas.width = width; rippleCanvas.height = height;
    }

    function onClick(e) {
        if(isRunning) {
            // 点击产生单层干脆的水波
            ripples.push(new WaterRipple(e.clientX, e.clientY));
        }
    }

    function animate() {
        if(!isRunning) return;
        ctx.clearRect(0, 0, width, height);
        for (let i = ripples.length - 1; i >= 0; i--) {
            ripples[i].update();
            ripples[i].draw(ctx);
            if (ripples[i].age >= ripples[i].maxAge) ripples.splice(i, 1);
        }
        animationId = requestAnimationFrame(animate);
    }

    return {
        start: function() {
            if(isRunning) return;
            isRunning = true;
            if(!rippleCanvas) {
                rippleCanvas = document.createElement('canvas');
                // 禁止拦截任何鼠标事件
                rippleCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
                document.body.appendChild(rippleCanvas);
                ctx = rippleCanvas.getContext('2d');
                window.addEventListener('resize', resize);
                window.addEventListener('mousedown', onClick);
                resize();
            }
            animate();
        },
        stop: function() {
            if(!isRunning) return;
            isRunning = false;
            if(animationId) cancelAnimationFrame(animationId);
            if(ctx) ctx.clearRect(0, 0, width, height);
            ripples = [];
        }
    };
})();