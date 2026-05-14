/* intro.js — Ribbon pull interaction */

const Intro = (() => {

  const ribbonScreen = document.getElementById('ribbon-screen');
  const ribbonSvg    = document.getElementById('ribbon-svg');
  const hintEl       = document.getElementById('ribbon-hint');
  const envelopeFlapPath = document.getElementById('envelope-flap');

  let startY   = 0;
  let currentY = 0;
  let isDragging = false;
  let pullProgress = 0; // 0 → 1
  const PULL_THRESHOLD = 130; // px to pull to trigger
  let triggered = false;
  let onComplete = null;

  function init(callback) {
    onComplete = callback;
    if (!ribbonSvg) { callback && callback(); return; }

    // Touch events
    ribbonSvg.addEventListener('touchstart',  onTouchStart, { passive: false });
    window.addEventListener('touchmove',   onTouchMove,  { passive: false });
    window.addEventListener('touchend',    onTouchEnd,   { passive: false });

    // Mouse events (desktop)
    ribbonSvg.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove',   onMouseMove);
    window.addEventListener('mouseup',     onMouseUp);
  }

  function onTouchStart(e) {
    e.preventDefault();
    if (triggered) return;
    isDragging = true;
    startY = e.touches[0].clientY;
    Cursor.setGrab(true);
    hintEl && (hintEl.style.opacity = '0');
  }

  function onMouseDown(e) {
    if (triggered) return;
    isDragging = true;
    startY = e.clientY;
    Cursor.setGrab(true);
    hintEl && (hintEl.style.opacity = '0');
  }

  function onTouchMove(e) {
    if (!isDragging || triggered) return;
    e.preventDefault();
    currentY = e.touches[0].clientY;
    updatePull(currentY - startY);
  }

  function onMouseMove(e) {
    if (!isDragging || triggered) return;
    currentY = e.clientY;
    updatePull(currentY - startY);
  }

  function updatePull(dy) {
    if (dy < 0) dy = 0;
    pullProgress = Math.min(dy / PULL_THRESHOLD, 1);

    // Move ribbon downward
    if (ribbonSvg) {
      ribbonSvg.style.transform = `translateX(-50%) translateY(${pullProgress * PULL_THRESHOLD}px)`;
      ribbonSvg.style.opacity   = String(1 - pullProgress * 0.4);
    }

    // Rotate bow lobes as ribbon pulls
    const bowLeft  = document.getElementById('bow-left');
    const bowRight = document.getElementById('bow-right');
    const bowKnot  = document.getElementById('bow-knot');
    if (bowLeft)  bowLeft.style.transform  = `rotate(${-pullProgress * 35}deg)`;
    if (bowRight) bowRight.style.transform = `rotate(${pullProgress * 35}deg)`;
    if (bowKnot)  bowKnot.style.transform  = `scale(${1 - pullProgress * 0.4})`;

    // Open envelope flap slightly
    const flap = document.getElementById('envelope-flap-group');
    if (flap) flap.style.transform = `rotateX(${-pullProgress * 60}deg)`;

    if (pullProgress >= 1) trigger();
  }

  function onTouchEnd() { endDrag(); }
  function onMouseUp()   { endDrag(); }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    Cursor.setGrab(false);
    if (pullProgress < 1 && !triggered) {
      // Snap back
      if (ribbonSvg) {
        ribbonSvg.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s';
        ribbonSvg.style.transform  = 'translateX(-50%) translateY(0)';
        ribbonSvg.style.opacity    = '1';
        setTimeout(() => { if(ribbonSvg) ribbonSvg.style.transition = ''; }, 500);
      }
      hintEl && (hintEl.style.opacity = '1');
      pullProgress = 0;
    }
  }

  function trigger() {
    if (triggered) return;
    triggered = true;
    isDragging = false;

    // Candle sound
    playCandleSound();

    // Burst sparks at ribbon
    if (ribbonSvg) {
      const r = ribbonSvg.getBoundingClientRect();
      Particles.burstSparks(r.left + r.width / 2, r.top + r.height / 2, 28);
    }

    // Flash
    Particles.flash('rgba(245,235,224,0.9)', 400);

    // Fly ribbon away
    if (ribbonSvg) {
      ribbonSvg.animate([
        { transform: 'translateX(-50%) translateY(130px)', opacity: 0.6 },
        { transform: 'translateX(-50%) translateY(300px)', opacity: 0 },
      ], { duration: 600, easing: 'ease-in', fill: 'forwards' });
    }

    // Open envelope fully then dissolve
    setTimeout(() => {
      const flap = document.getElementById('envelope-flap-group');
      if (flap) {
        flap.style.transition = 'transform 0.8s cubic-bezier(0.4,0,0.2,1)';
        flap.style.transform  = 'rotateX(-180deg)';
      }
    }, 100);

    setTimeout(() => {
      if (ribbonScreen) {
        ribbonScreen.style.transition = 'opacity 1s ease, visibility 1s';
        ribbonScreen.style.opacity    = '0';
        ribbonScreen.style.visibility = 'hidden';
      }
      setTimeout(() => {
        if (ribbonScreen) ribbonScreen.style.display = 'none';
        onComplete && onComplete();
      }, 1000);
    }, 700);
  }

  function playCandleSound() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ac.createBuffer(1, ac.sampleRate * 0.7, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.8) * 0.16;
      }
      const src  = ac.createBufferSource();
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.4, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, 0.7);
      src.buffer = buf;
      src.connect(gain);
      gain.connect(ac.destination);
      src.start();
    } catch (e) {}
  }

  return { init };
})();
