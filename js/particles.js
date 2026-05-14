/* particles.js — Petals, sparks, dust, confetti */

const Particles = (() => {

  /* ── Petal canvas ── */
  const pc = document.getElementById('petal-canvas');
  const pctx = pc.getContext('2d');
  let petals = [];
  let petalActive = false;
  let petalFrame = null;

  function resizePetals() {
    pc.width  = window.innerWidth;
    pc.height = window.innerHeight;
  }

  function initPetals() {
    resizePetals();
    petals = [];
    const colors = [
      'rgba(193,103,79,.32)',
      'rgba(212,133,110,.28)',
      'rgba(184,136,42,.22)',
      'rgba(232,176,154,.28)',
      'rgba(245,228,200,.20)',
    ];
    for (let i = 0; i < 42; i++) {
      petals.push({
        x:    Math.random() * pc.width,
        y:    Math.random() * pc.height * 1.5 - pc.height * 0.3,
        r:    3 + Math.random() * 8,
        vy:   0.25 + Math.random() * 0.45,
        vx:   (Math.random() - 0.5) * 0.3,
        rot:  Math.random() * 360,
        rotV: (Math.random() - 0.5) * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.02,
      });
    }
  }

  function drawPetalFrame() {
    if (!petalActive) return;
    pctx.clearRect(0, 0, pc.width, pc.height);
    petals.forEach(p => {
      p.y   += p.vy;
      p.rot += p.rotV;
      p.wobble += p.wobbleSpeed;
      p.x += Math.sin(p.wobble) * 0.4 + p.vx;
      if (p.y > pc.height + 20) {
        p.y = -20;
        p.x = Math.random() * pc.width;
      }
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate((p.rot * Math.PI) / 180);
      pctx.fillStyle = p.color;
      pctx.beginPath();
      pctx.ellipse(0, 0, p.r * 0.55, p.r * 1.4, 0, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    });
    petalFrame = requestAnimationFrame(drawPetalFrame);
  }

  function startPetals() {
    petalActive = true;
    pc.classList.add('on');
    if (!petalFrame) drawPetalFrame();
  }

  function stopPetals() {
    petalActive = false;
    pc.classList.remove('on');
    if (petalFrame) { cancelAnimationFrame(petalFrame); petalFrame = null; }
    pctx.clearRect(0, 0, pc.width, pc.height);
  }

  /* ── Sparks ── */
  function burstSparks(cx, cy, count = 24) {
    for (let i = 0; i < count; i++) {
      const sp = document.createElement('div');
      sp.style.cssText = `
        position:fixed; width:${3+Math.random()*4}px; height:${3+Math.random()*4}px;
        background:${Math.random()>.5?'var(--terra2)':'var(--gold2)'};
        border-radius:50%; pointer-events:none; z-index:9999;
        left:${cx}px; top:${cy}px;
      `;
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist  = 55 + Math.random() * 90;
      const dur   = 0.6 + Math.random() * 0.5;
      sp.animate([
        { transform: 'translate(-50%,-50%) translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`, opacity: 0 },
      ], { duration: dur * 1000, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards', delay: Math.random() * 120 });
      document.body.appendChild(sp);
      setTimeout(() => sp.remove(), (dur + 0.2) * 1000);
    }
  }

  /* ── Flash ── */
  function flash(color = 'rgba(255,245,235,0.9)', dur = 300) {
    const el = document.getElementById('flash');
    if (!el) return;
    el.style.background = color;
    el.animate([
      { opacity: 0.9 },
      { opacity: 0 },
    ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
  }

  /* ── Confetti ── */
  function launchConfetti() {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:850;';
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const colors = ['#c1674f','#d4856e','#e8b09a','#c9a84c','#e8c96e','#f5e4a8','#fdf6ec'];
    const ps = Array.from({ length: 140 }, () => ({
      x:   Math.random() * cv.width,
      y:   -20,
      r:   3 + Math.random() * 6,
      d:   2 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      ta:  0,
      ts:  0.04 + Math.random() * 0.07,
      shape: Math.random() > 0.5 ? 'r' : 'c',
    }));
    let f = 0;
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.shape === 'c') {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.ta);
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
          ctx.restore();
        }
        ctx.fill();
        p.y  += p.d;
        p.x  += Math.sin(f * 0.02 + p.tilt) * 1.6;
        p.ta += p.ts;
      });
      f++;
      if (f < 320) requestAnimationFrame(draw);
      else cv.remove();
    }
    draw();
  }

  /* ── Background dust on canvas ── */
  const bgc = document.getElementById('bg-canvas');
  const bgctx = bgc ? bgc.getContext('2d') : null;
  let dustParticles = [];
  let bgMx = 0, bgMy = 0;
  let bgFrame2 = null;

  function initDust() {
    if (!bgc || !bgctx) return;
    bgc.width  = window.innerWidth;
    bgc.height = window.innerHeight;
    dustParticles = [];
    for (let i = 0; i < 60; i++) {
      dustParticles.push({
        x:    Math.random() * bgc.width,
        y:    Math.random() * bgc.height,
        r:    0.3 + Math.random() * 1.2,
        vy:   -(0.1 + Math.random() * 0.3),
        vx:   (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.003 + Math.random() * 0.006,
        alpha: 0.08 + Math.random() * 0.25,
      });
    }
    if (!bgFrame2) drawDust();
  }

  document.addEventListener('mousemove', e => { bgMx = e.clientX; bgMy = e.clientY; });

  function drawDust() {
    if (!bgctx) return;
    bgctx.clearRect(0, 0, bgc.width, bgc.height);
    const cx = bgc.width / 2, cy = bgc.height / 2;
    const dx = (bgMx - cx) / cx * 0.012;
    const dy = (bgMy - cy) / cy * 0.012;
    dustParticles.forEach(p => {
      p.phase += p.phaseSpeed;
      p.y += p.vy; p.x += p.vx + dx;
      if (p.y < -10) { p.y = bgc.height + 10; p.x = Math.random() * bgc.width; }
      const alpha = p.alpha * (Math.sin(p.phase) * 0.4 + 0.7);
      bgctx.beginPath();
      bgctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bgctx.fillStyle = `rgba(184,136,42,${alpha})`;
      bgctx.fill();
    });
    bgFrame2 = requestAnimationFrame(drawDust);
  }

  window.addEventListener('resize', () => {
    resizePetals();
    if (bgc) { bgc.width = window.innerWidth; bgc.height = window.innerHeight; }
  });

  return { initPetals, startPetals, stopPetals, burstSparks, flash, launchConfetti, initDust };
})();
