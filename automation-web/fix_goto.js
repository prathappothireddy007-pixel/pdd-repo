const fs = require('fs');
let code = fs.readFileSync('runner.js', 'utf8');

// First mark the one we want to KEEP
code = code.replace(/\/\/ Ensure every test starts from a loaded page\r?\n\s+await page\.goto\(BASE_URL, \{ waitUntil: 'domcontentloaded', timeout: 15000 \}\);/, '/* MARKER_KEEP_GOTO */');

// Then remove all others
code = code.replace(/^\s*await page\.goto\(BASE_URL, \{ waitUntil: 'domcontentloaded', timeout: 15000 \}\);\r?\n/gm, '');

// Restore the kept one
code = code.replace(/\/\* MARKER_KEEP_GOTO \*\//, `// Ensure every test starts from a loaded page\n    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });`);

fs.writeFileSync('runner.js', code);
console.log('Done');
