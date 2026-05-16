/* intro.js — Video intro interaction */

const Intro = (() => {
  let onComplete = null;

  function init(callback) {
    onComplete = callback;
    
    const btn = document.getElementById('btn-open-invitation');
    const vid = document.getElementById('intro-video');
    const screen = document.getElementById('ribbon-screen');

    if (!btn || !vid || !screen) {
      if (onComplete) onComplete();
      return;
    }

    btn.addEventListener('click', () => {
      // Hide button
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';

      // Play video
      vid.play().catch(e => console.error("Video play failed", e));

      // Flash and transition when video ends
      vid.onended = () => {
        Particles.flash('rgba(245,235,224,0.9)', 400);

        screen.style.transition = 'opacity 1.5s ease, visibility 1.5s';
        screen.style.opacity = '0';
        screen.style.visibility = 'hidden';

        setTimeout(() => {
          screen.style.display = 'none';
          if (onComplete) onComplete();
        }, 1500);
      };
    });
  }

  return { init };
})();
