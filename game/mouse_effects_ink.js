// mouse_effects_ink.js
window.InkMouseEffect = (function() {
    let rippleCanvas = null;
    let ctx = null;
    let width, height;
    let inks = [];
    let animationId = null;
    let isRunning = false;

    // 水墨涟漪类
    class InkRipple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.age = 0;
            this.maxAge = 60; // 水墨扩散缓慢，存活时间较长
            this.radius = 5;
            this.baseAlpha = Math.random() * 0.3 + 0.2; // 透明度较低
        }

        update() {
            this.age++;
            // 缓动扩散
            this.radius += 1.5 * (1 - this.age / this.maxAge);
        }

        draw(ctx) {
            const progress = this.age / this.maxAge;
            const alpha = this.baseAlpha * (1 - progress);
            
            // 绘制径向渐变模拟水墨晕开
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, `rgba(40, 40, 40, ${alpha})`); // 中心较浓
            gradient.addColorStop(0.5, `rgba(40, 40, 40, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(40, 40, 40, 0)`); // 边缘消散

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    function resize() {
        if(!rippleCanvas) return;
        width = window.innerWidth; height = window.innerHeight;
        rippleCanvas.width = width; rippleCanvas.height = height;
    }

    function onClick(e) {
        if(isRunning) {
            // 一次点击产生两圈轻微的时间差晕染
            inks.push(new InkRipple(e.clientX, e.clientY));
            setTimeout(() => {
                if(isRunning) inks.push(new InkRipple(e.clientX, e.clientY));
            }, 100);
        }
    }

    function animate() {
        if(!isRunning) return;
        ctx.clearRect(0, 0, width, height);
        for (let i = inks.length - 1; i >= 0; i--) {
            inks[i].update();
            inks[i].draw(ctx);
            if (inks[i].age >= inks[i].maxAge) inks.splice(i, 1);
        }
        animationId = requestAnimationFrame(animate);
    }

    return {
        start: function() {
            if(isRunning) return;
            isRunning = true;
            if(!rippleCanvas) {
                rippleCanvas = document.createElement('canvas');
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
            inks = [];
        }
    };
})();