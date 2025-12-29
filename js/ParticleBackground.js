// js/ParticleBackground.js
export class ParticleBackground {
  constructor({ canvasId, count = 70, maxLinkDist = 140 } = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas not found: ${canvasId}`);
    this.ctx = this.canvas.getContext("2d");

    this.count = count;
    this.maxLinkDist = maxLinkDist;

    this.W = 0;
    this.H = 0;
    this.dpr = 1;

    this.pastel = [
      "rgba(255, 173, 214, 0.55)",
      "rgba(170, 216, 255, 0.55)",
      "rgba(255, 231, 170, 0.55)",
      "rgba(196, 255, 214, 0.55)",
      "rgba(212, 192, 255, 0.55)",
    ];

    this.particles = [];
    this._raf = null;

    this._onResize = this._onResize.bind(this);
    window.addEventListener("resize", this._onResize);
    this._onResize();
    this._initParticles();
  }

  _onResize() {
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.W = this.canvas.width = Math.floor(window.innerWidth * this.dpr);
    this.H = this.canvas.height = Math.floor(window.innerHeight * this.dpr);
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
  }

  _initParticles() {
    const pick = () => this.pastel[(Math.random() * this.pastel.length) | 0];
    this.particles = Array.from({ length: this.count }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * this.H,
      r: (Math.random() * 3 + 1) * this.dpr,
      vx: (Math.random() * 0.6 - 0.3) * this.dpr,
      vy: (Math.random() * 0.6 - 0.3) * this.dpr,
      c: pick(),
    }));
  }

  start() {
    const tick = () => {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.W, this.H);

      // 浅色雾化底
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(0, 0, this.W, this.H);

      // 粒子
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;

        const pad = 20 * this.dpr;
        if (p.x < -pad) p.x = this.W + pad;
        if (p.x > this.W + pad) p.x = -pad;
        if (p.y < -pad) p.y = this.H + pad;
        if (p.y > this.H + pad) p.y = -pad;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      }

      // 连接线
      const max = this.maxLinkDist * this.dpr;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const a = this.particles[i], b = this.particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < max) {
            const alpha = (1 - dist / max) * 0.12;
            ctx.strokeStyle = `rgba(120,120,140,${alpha})`;
            ctx.lineWidth = 1 * this.dpr;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      this._raf = requestAnimationFrame(tick);
    };

    if (!this._raf) tick();
    return this;
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    return this;
  }
}
