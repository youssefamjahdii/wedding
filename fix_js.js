const fs = require('fs');
let js = fs.readFileSync('js/main.js', 'utf8');

// Update SCENES count to 10
js = js.replace(/const SCENES = 11;/, 'const SCENES = 10;');

// Update HOLD array (remove index 0)
js = js.replace(/const HOLD = \[\s+1.5,  \/\/ 0 I&M \(reduced delay\)\s+3.0,  \/\/ 1 Bismillah/, 'const HOLD = [\n    3.0,  // 0 Bismillah');

// Update BG_COLORS array (remove index 0)
js = js.replace(/const BG_COLORS = \[\s+'#f5ebe0', \/\/ 0 warm parchment\s+'#fdf6ec', \/\/ 1 cream/, "const BG_COLORS = [\n    '#fdf6ec', // 0 cream");

// Update sceneIn switch: remove case 0
js = js.replace(/case 0: \/\/ I & M[\s\S]*?break;\s+case 1: \/\/ Bismillah/, 'case 0: // Bismillah');

// Re-index sceneIn cases
for (let i = 2; i <= 10; i++) {
  js = js.replace(new RegExp('case ' + i + ':', 'g'), 'case ' + (i - 1) + ':');
}

// Update sceneOut switch: remove case 0
js = js.replace(/case 0: \/\/ I&M — dissolve into dust \(handled by opacity\)\s+tl\.to\(sel, \{ opacity: 0, filter: 'blur\(6px\)', duration: OUT, ease: 'power2\.in' \}, at\);\s+break;\s+case 1: \/\/ Bismillah — float up and fade/, 'case 0: // Bismillah — float up and fade');

fs.writeFileSync('js/main.js', js);
