// mouse_effects_cyber.js
window.CyberMouseEffect = (function() {
    let rippleCanvas = null;
    let ctx = null;
    let width, height;
    let ripples = [];
    let animationId = null;
    let isRunning = false;

    const cyberColors = ['#00f0ff', '#b026ff', '#00ff66', '#ff0055', '#ffd700'];

    class CyberArc {
        constructor(baseRadius) {
            this.radius = baseRadius;
            this.color = cyberColors[Math.floor(Math.random() * cyberColors.length)];
            this.lineWidth = 2;
            this.startAngle = Math.random() * Math.PI * 2;
            let arcSpan = Math.random() < 0.8 ? (Math.PI + Math.random() * Math.PI * 0.8) : (Math.PI * 0.2 + Math.random() * Math.PI * 0.8);
            this.endAngle = this.startAngle + arcSpan;
            this.speed = Math.random() * 1.5 + 1; 
        }
        update() { this.radius += this.speed; }
        draw(ctx, x, y, alpha) {
            ctx.beginPath();
            ctx.arc(x, y, this.radius, this.startAngle, this.endAngle);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.lineWidth;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 12;
            ctx.shadowColor = this.color;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.stroke();
        }
    }

    class Ripple {
        constructor(x, y) {
            this.x = x; this.y = y; this.age = 0; this.maxAge = 25 + Math.random() * 15;
            this.arcs = [];
            let numArcs = Math.floor(Math.random() * 3) + 2; 
            for (let i = 0; i < numArcs; i++) { this.arcs.push(new CyberArc(i * 12)); }
        }
        update() { this.age++; this.arcs.forEach(arc => arc.update()); }
        draw(ctx) {
            let progress = this.age / this.maxAge;
            let alpha = Math.max(0, 1 - Math.pow(progress, 2));
            this.arcs.forEach(arc => arc.draw(ctx, this.x, this.y, alpha));
            ctx.globalAlpha = 1.0;
        }
    }

    function resize() {
        if(!rippleCanvas) return;
        width = window.innerWidth; height = window.innerHeight;
        rippleCanvas.width = width; rippleCanvas.height = height;
    }

    function onClick(e) {
        if(isRunning) ripples.push(new Ripple(e.clientX, e.clientY));
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