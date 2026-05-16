const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// remove scene 1
html = html.replace(/<!-- ── SCENE 1: I & M ── -->[\s\S]*?<!-- ── SCENE 2: Bismillah ── -->/, '<!-- ── SCENE 1: Bismillah ── -->');

// Re-index remaining scenes from scene-2 to scene-11
for (let i = 2; i <= 11; i++) {
  html = html.replace(new RegExp('SCENE ' + i + ':', 'g'), 'SCENE ' + (i - 1) + ':');
  html = html.replace(new RegExp('id="scene-' + i + '"', 'g'), 'id="scene-' + (i - 1) + '"');
}

fs.writeFileSync('index.html', html);
