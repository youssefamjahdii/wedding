/* utils.js — Countdown, Music, Cursor */

/* ── CURSOR ── */
const Cursor = (() => {
  const cur   = document.getElementById('cursor');
  const cring = document.getElementById('cring');
  if (!cur || !cring) return { init() {} };
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function tick() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    cring.style.left = rx + 'px';
    cring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  function setGrab(on) {
    cur.classList.toggle('grab', on);
    cring.classList.toggle('grab', on);
  }

  return { setGrab };
})();

/* ── COUNTDOWN ── */
const Countdown = (() => {
  const TARGET = new Date('2026-08-29T17:00:00');
  let interval = null;

  function pad(n, len=2) { return String(n).padStart(len,'0'); }

  function tick() {
    const diff = TARGET - new Date();
    if (diff <= 0) {
      ['cdd','cdh','cdm','cds'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const dd = document.getElementById('cdd'); if(dd) dd.textContent = pad(d, 3);
    const dh = document.getElementById('cdh'); if(dh) dh.textContent = pad(h);
    const dm = document.getElementById('cdm'); if(dm) dm.textContent = pad(m);
    const ds = document.getElementById('cds'); if(ds) ds.textContent = pad(s);
  }

  function start() {
    tick();
    interval = setInterval(tick, 1000);
  }

  return { start };
})();

/* ── MUSIC ── */
const Music = (() => {
  let player = null;
  let playing = false;
  let stopTimer = null;
  const VIDEO_ID = 'Jj5QIPnTMZE';
  const STOP_AT  = 51; // seconds

  // Inject YT API
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('yt-player', {
      videoId: VIDEO_ID,
      playerVars: { autoplay: 0, controls: 0, loop: 0, start: 0, rel: 0 },
      events: {
        onStateChange: e => {
          playing = e.data === YT.PlayerState.PLAYING;
          const v = document.getElementById('vinyl');
          const l = document.getElementById('mlabel');
          const mp = document.getElementById('mplayer');
          if (v) v.classList.toggle('spin', playing);
          if (l) l.textContent = playing ? 'En cours ♪' : 'Musique';
          if (mp) mp.style.display = 'flex';
        }
      }
    });
  };

  function fadeIn(duration = 3000) {
    if (!player || typeof player.setVolume !== 'function') return;
    try {
      player.setVolume(0);
      player.playVideo();
      const steps = 40;
      const step  = duration / steps;
      let i = 0;
      const t = setInterval(() => {
        i++;
        try { player.setVolume(Math.round((i / steps) * 70)); } catch(e) {}
        if (i >= steps) clearInterval(t);
      }, step);
      // Schedule stop
      if (stopTimer) clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        try { player.pauseVideo(); } catch(e) {}
      }, STOP_AT * 1000);
    } catch (e) {}
  }

  function toggle() {
    if (!player) return;
    try {
      if (playing) player.pauseVideo();
      else         player.playVideo();
    } catch(e) {}
  }

  return { fadeIn, toggle };
})();
