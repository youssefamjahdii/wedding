/* main.js — Master cinematic timeline (GSAP) */

const Film = (() => {

  const SCENES = 10;
  let currentScene = 0;
  const dots = [];
  let tl = null;  // master GSAP timeline
  let sceneTimelines = [];
  let musicPaused = false; // flag: waiting for user at music scene

  /* ─── Scene durations (seconds each scene is fully visible) ─── */
  const HOLD = [
    3.0,  // 0 Bismillah
    4.0,  // 2 Verset
    1.0,  // 3 Music prompt
    3.5,  // 4 Familles
    4.0,  // 5 Couple
    4.0,  // 6 Save the Date
    4.0,  // 7 Dar El Ghalia
    4.0,  // 8 Countdown
    5.0,  // 9 Programme
    0,    // 10 Merci (stays)
  ];

  const IN  = 1.0; // transition in duration
  const OUT = 0.8; // transition out duration
  const GAP = 0.1; // gap between out and next in

  /* ─── Background colors per scene ─── */
  const BG_COLORS = [
    '#fdf6ec', // 0 cream
    '#f2e8d8', // 2 lighter linen
    '#fdf6ec', // 3 music prompt
    '#ede0cd', // 4 linen
    '#fdf6ec', // 5 cream
    '#f5ebe0', // 6 parchment
    '#f0e6d8', // 7 warm
    '#fdf6ec', // 8 cream
    '#f5ebe0', // 9 parchment
    '#f2e8d8', // 10 warm linen
  ];

  /* ─── Build progress dots ─── */
  function buildDots() {
    const container = document.getElementById('progress-dots');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < SCENES; i++) {
      const d = document.createElement('div');
      d.className = 'pdot' + (i === 0 ? ' active' : '');
      container.appendChild(d);
      dots.push(d);
    }
  }

  function setDot(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  /* ─── Verse word animation ─── */
  function animateVerseWords() {
    const el = document.getElementById('quran-ar');
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = '';
    words.forEach((w, i) => {
      const sp = document.createElement('span');
      sp.className = 'w';
      sp.textContent = w + (i < words.length - 1 ? ' ' : '');
      el.appendChild(sp);
    });
  }

  function lightVerseWords(delay = 0) {
    const words = document.querySelectorAll('#quran-ar .w');
    words.forEach((w, i) => {
      setTimeout(() => w.classList.add('lit'), delay * 1000 + i * 200);
    });
  }

  function unlightVerseWords() {
    document.querySelectorAll('#quran-ar .w').forEach(w => w.classList.remove('lit'));
  }

  /* ─── Palace draw ─── */
  function drawPalace() {
    const v = document.getElementById('venue-palace');
    if (v && !v.classList.contains('draw')) v.classList.add('draw');
  }

  /* ─── SCENE IN/OUT transitions ─── */

  function sceneIn(idx, tl, at) {
    const sel  = `#scene-${idx + 1}`;
    const sc   = document.querySelector(sel);
    if (!sc) return;

    // Shared: fade scene in
    tl.to(sel, { opacity: 1, duration: IN, ease: 'power2.inOut' }, at);

    // Background color
    tl.to('#bg-color', {
      backgroundColor: BG_COLORS[idx],
      duration: IN * 1.2,
      ease: 'power1.inOut',
    }, at);

    // Update dot
    tl.call(() => { currentScene = idx; setDot(idx); }, [], at + IN * 0.5);

    // Per-scene animations
    switch (idx) {

      case 0: // Bismillah
        tl.to(`${sel} .bismillah-text`, { opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' }, at)
          .from(`${sel} .bismillah-sub`, { opacity: 0, y: 14, duration: 0.8, ease: 'power2.out' }, at + 0.5)
          .to(`${sel} .bismillah-sub`, { opacity: 1, duration: 0.8 }, at + 0.5);
        break;

      case 1: // Verset
        tl.to(`${sel} .arch-bg`, { opacity: 1, duration: 1.5, ease: 'power2.inOut' }, at)
          .call(() => { const a = document.querySelector(`${sel} .arch-bg`); if(a) a.classList.add('draw'); }, [], at + 0.1)
          .from(`${sel} .verse-source-top`, { opacity: 0, y: 10, duration: 0.7 }, at + 0.4)
          .to(`${sel} .verse-source-top`, { opacity: 1, duration: 0.7 }, at + 0.4)
          .call(() => lightVerseWords(0.3), [], at + 0.7)
          .from(`${sel} .verse-french`, { opacity: 0, y: 16, duration: 1, ease: 'power2.out' }, at + 2.5)
          .to(`${sel} .verse-french`, { opacity: 1, duration: 1 }, at + 2.5)
          .from(`${sel} .verse-source`, { opacity: 0, duration: 0.6 }, at + 3.5)
          .to(`${sel} .verse-source`, { opacity: 1, duration: 0.6 }, at + 3.5)
          .from(`${sel} #secret-music-btn`, { opacity: 0, duration: 1 }, at + 4.0)
          .to(`${sel} #secret-music-btn`, { opacity: 1, duration: 1 }, at + 4.0);
        break;

      case 2: // Music Prompt
        tl.from(`${sel} .couple-pre`, { opacity: 0, y: 10, duration: 0.6 }, at + 0.1)
          .from(`${sel} .scene-ornament`, { opacity: 0, scale: 0.5, duration: 0.6 }, at + 0.3)
          .from(`${sel} .families-sub`, { opacity: 0, y: 10, duration: 0.6 }, at + 0.5)
          .from(`${sel} .btn-wrap`, { opacity: 0, y: 10, duration: 0.6 }, at + 0.8)
          .call(() => {
            const film = document.getElementById('film');
            if (film) film.style.pointerEvents = 'auto';
            musicPaused = true;
            setTimeout(() => { if (musicPaused) tl.pause(); }, 50);
          }, [], at + 0.9);
        break;

      case 3: // Familles
        tl.call(() => { Particles.startPetals(); }, [], at + 0.1)
          .from(`${sel} .families-pre`, { opacity: 0, y: 10, duration: 0.6 }, at + 0.1)
          .to(`${sel} .families-pre`, { opacity: 1, duration: 0.6 }, at + 0.1)
          // SLAM
          .from(`${sel} .families-names`, {
            opacity: 0, y: 55, scale: 0.88,
            duration: 0.7, ease: 'power4.out',
          }, at + 0.75)
          .to(`${sel} .families-names`, { opacity: 1, duration: 0.7 }, at + 0.75)
          .call(() => { Particles.flash('rgba(193,103,79,0.12)', 300); }, [], at + 0.75)
          .from(`${sel} .families-amp`, {
            opacity: 0, scale: 0.5, duration: 0.6, ease: 'back.out(2)',
          }, at + 1.15)
          .to(`${sel} .families-amp`, { opacity: 1, duration: 0.6 }, at + 1.15)
          .from(`${sel} .families-sub`, { opacity: 0, y: 12, duration: 0.7 }, at + 1.5)
          .to(`${sel} .families-sub`, { opacity: 1, duration: 0.7 }, at + 1.5);
        break;

      case 4: // Couple
        tl.from(`${sel} .couple-pre`, { opacity: 0, y: 10, duration: 0.6 }, at + 0.1)
          .to(`${sel} .couple-pre`, { opacity: 1, duration: 0.6 }, at + 0.1)
          .to(`${sel} #name-svg-wrap`, {
            opacity: 1, duration: 0.3,
          }, at + 0.3)
          .from(`${sel} .couple-names-text`, {
            opacity: 0, filter: 'blur(10px)', y: 20, duration: 1.2, ease: 'power2.out',
          }, at + 0.3)
          .to(`${sel} .couple-names-text`, { opacity: 1, duration: 1.2 }, at + 0.3)
          .to(`${sel} .couple-ornament`, { opacity: 1, duration: 0.8 }, at + 1.2)
          .from(`${sel} .couple-phrase`, {
            opacity: 0, y: 14, duration: 1, ease: 'power2.out',
          }, at + 1.5)
          .to(`${sel} .couple-phrase`, { opacity: 1, duration: 1 }, at + 1.5);
        break;

      case 5: // Save the Date
        tl.from(`${sel} .std-eyebrow`, { opacity: 0, y: 10, duration: 0.5 }, at + 0.1)
          .to(`${sel} .std-eyebrow`, { opacity: 1, duration: 0.5 }, at + 0.1)
          .from(`${sel} .std-save`, { opacity: 0, y: 8, duration: 0.5 }, at + 0.3)
          .to(`${sel} .std-save`, { opacity: 1, duration: 0.5 }, at + 0.3)
          // Card drops in
          .from(`${sel} .std-card`, { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out' }, at + 0.55)
          .to(`${sel} .std-card`, { opacity: 1, duration: 0.8 }, at + 0.55)
          .to(`${sel} .std-divider`, { width: '180px', duration: 1, ease: 'power2.out' }, at + 1.0)
          .from(`${sel} .std-phrase`, { opacity: 0, y: 12, duration: 0.8 }, at + 1.6)
          .to(`${sel} .std-phrase`, { opacity: 1, duration: 0.8 }, at + 1.6)
          .from(`${sel} .std-cal`, { opacity: 0, y: 12, duration: 0.7 }, at + 2.1)
          .to(`${sel} .std-cal`, { opacity: 1, duration: 0.7 }, at + 2.1);
        break;

      case 6: // Dar El Ghalia
        tl.from(`${sel} .venue-eyebrow`, { opacity: 0, y: 8, duration: 0.5 }, at + 0.1)
          .to(`${sel} .venue-eyebrow`, { opacity: 1, duration: 0.5 }, at + 0.1)
          .from(`${sel} .venue-name`, { opacity: 0, y: 24, filter: 'blur(8px)', duration: 1.1, ease: 'power2.out' }, at + 0.3)
          .to(`${sel} .venue-name`, { opacity: 1, duration: 1.1 }, at + 0.3)
          .from(`${sel} .venue-addr`, { opacity: 0, y: 10, duration: 0.6 }, at + 0.9)
          .to(`${sel} .venue-addr`, { opacity: 1, duration: 0.6 }, at + 0.9)
          .to(`${sel} .venue-palace`, { opacity: 1, duration: 0.8 }, at + 1.1)
          .call(() => drawPalace(), [], at + 1.2)
          .from(`${sel} .venue-waze`, { opacity: 0, y: 10, duration: 0.7 }, at + 2.2)
          .to(`${sel} .venue-waze`, { opacity: 1, duration: 0.7 }, at + 2.2);
        break;

      case 7: // Countdown
        tl.from(`${sel} .cd-eyebrow`, { opacity: 0, y: 8, duration: 0.5 }, at + 0.1)
          .to(`${sel} .cd-eyebrow`, { opacity: 1, duration: 0.5 }, at + 0.1)
          .from(`${sel} .cd-title`, { opacity: 0, y: 16, duration: 0.8 }, at + 0.3)
          .to(`${sel} .cd-title`, { opacity: 1, duration: 0.8 }, at + 0.3);
        // Tiles drop in one by one
        document.querySelectorAll('.cd-tile').forEach((tile, i) => {
          tl.from(tile, { y: 40, opacity: 0, duration: 0.6, ease: 'back.out(1.8)' }, at + 0.7 + i * 0.15)
            .to(tile, { opacity: 1, duration: 0.6 }, at + 0.7 + i * 0.15);
        });
        tl.from(`${sel} .cd-info`, { opacity: 0, duration: 0.6 }, at + 1.7)
          .to(`${sel} .cd-info`, { opacity: 1, duration: 0.6 }, at + 1.7)
          .call(() => Countdown.start(), [], at + 0.5);
        break;

      case 8: // Programme
        tl.from(`${sel} .prog-eyebrow`, { opacity: 0, y: 8, duration: 0.5 }, at + 0.1)
          .to(`${sel} .prog-eyebrow`, { opacity: 1, duration: 0.5 }, at + 0.1)
          .from(`${sel} .prog-title`, { opacity: 0, y: 16, duration: 0.8 }, at + 0.3)
          .to(`${sel} .prog-title`, { opacity: 1, duration: 0.8 }, at + 0.3);
        // Programme items fly in alternating sides
        document.querySelectorAll('.prog-item').forEach((item, i) => {
          const fromX = i % 2 === 0 ? -60 : 60;
          tl.from(item, { x: fromX, opacity: 0, duration: 0.7, ease: 'power3.out' }, at + 0.7 + i * 0.2)
            .to(item, { opacity: 1, duration: 0.7 }, at + 0.7 + i * 0.2);
        });
        break;

      case 9: // Merci
        tl.call(() => { Particles.launchConfetti(); }, [], at + 0.3)
          .to(`${sel} .merci-big`, {
            opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power2.out',
          }, at + 0.2)
          .to(`${sel} .merci-divider`, { opacity: 1, duration: 0.8 }, at + 1.0)
          .from(`${sel} .merci-sub`, { opacity: 0, y: 14, duration: 0.9 }, at + 1.2)
          .to(`${sel} .merci-sub`, { opacity: 1, duration: 0.9 }, at + 1.2)
          .from(`${sel} .merci-recap`, { opacity: 0, duration: 0.7 }, at + 1.8)
          .to(`${sel} .merci-recap`, { opacity: 1, duration: 0.7 }, at + 1.8)
          .from(`${sel} .merci-replay`, { opacity: 0, y: 10, duration: 0.7 }, at + 2.4)
          .to(`${sel} .merci-replay`, { opacity: 1, duration: 0.7 }, at + 2.4);
        break;
    }
  }

  function sceneOut(idx, tl, at) {
    const sel = `#scene-${idx + 1}`;
    // Each scene has a unique exit
    switch (idx) {
      case 0: // Bismillah — float up and fade
        tl.to(`${sel} .bismillah-text`, { y: -20, opacity: 0, filter: 'blur(8px)', duration: OUT * 0.9 }, at);
        tl.to(sel, { opacity: 0, duration: OUT, ease: 'power2.in' }, at + 0.1);
        break;
      case 1: // Verset — slide up
        tl.call(() => unlightVerseWords(), [], at);
        tl.to(sel, { opacity: 0, y: -20, duration: OUT, ease: 'power2.in' }, at + 0.1);
        break;
      case 2: // Music prompt
        tl.to(sel, { opacity: 0, duration: OUT, ease: 'power2.in' }, at);
        break;
      case 3: // Familles — scale down
        tl.to(`${sel} .families-names`, { scale: 1.08, opacity: 0, duration: OUT * 0.8 }, at);
        tl.to(sel, { opacity: 0, duration: OUT, ease: 'power2.in' }, at + 0.1);
        break;
      default:
        tl.to(sel, { opacity: 0, duration: OUT, ease: 'power2.in' }, at);
        break;
    }
    // Reset element transforms/opacity after scene is invisible
    tl.set(sel, { clearProps: 'filter,y,scale' }, at + OUT + 0.2);
  }

  /* ─── BUILD MASTER TIMELINE ─── */
  function buildTimeline() {
    tl = gsap.timeline({ paused: true });

    let cursor = 0; // time cursor

    for (let i = 0; i < SCENES; i++) {
      sceneIn(i, tl, cursor);
      cursor += IN + HOLD[i];
      if (i < SCENES - 1) {
        sceneOut(i, tl, cursor);
        cursor += OUT + GAP;
      }
    }

    return tl;
  }

  /* ─── START ─── */
  function start() {
    animateVerseWords();
    buildDots();

    const film = document.getElementById('film');
    if (film) film.classList.add('running');

    const dotsEl = document.getElementById('progress-dots');
    if (dotsEl) dotsEl.classList.add('on');

    const mplayer = document.getElementById('mplayer');
    if (mplayer) mplayer.style.display = 'flex';

    tl = buildTimeline();
    tl.play();
  }

  /* ─── REPLAY ─── */
  function replay() {
    if (!tl) return;
    // Stop music and reset it
    Music.stop();
    // Re-enable film pointer events (in case paused on music scene)
    const film = document.getElementById('film');
    if (film) film.style.pointerEvents = 'none';
    // Reset all scenes
    document.querySelectorAll('.scene').forEach(s => {
      gsap.set(s, { opacity: 0, clearProps: 'filter,y,scale,x' });
    });
    gsap.set('#bg-color', { backgroundColor: BG_COLORS[0] });
    setDot(0); currentScene = 0;
    const v = document.getElementById('venue-palace');
    if (v) v.classList.remove('draw');
    const a = document.querySelector('.arch-bg');
    if (a) a.classList.remove('draw');
    Countdown.start();
    tl.restart();
  }

  function resumeAndPlay() {
    const film = document.getElementById('film');
    if (film) film.style.pointerEvents = 'none';
    musicPaused = false;
    if (tl) tl.play();
  }

  return { start, replay, resumeAndPlay };
})();
