// Builds the three files deployed to the Vercel demo project for one commit:
//   node vercel/pack.js <commit> <out-dir>  →  index.html, vercel.json, api/v.js (the proxy only serves that commit)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [sha, out] = process.argv.slice(2);
if (!/^[0-9a-f]{40}$/.test(sha || '') || !out) { console.error('usage: node vercel/pack.js <40-char commit> <out-dir>'); process.exit(1); }
fs.mkdirSync(path.join(out, 'api'), { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), execFileSync('node', [path.join(__dirname, '..', 'demo-shell.js'), '/v/' + sha + '/', '/lib/liquid.js']));
fs.copyFileSync(path.join(__dirname, 'vercel.json'), path.join(out, 'vercel.json'));
fs.writeFileSync(path.join(out, 'api', 'v.js'), fs.readFileSync(path.join(__dirname, 'api', 'v.js'), 'utf8').replace('__DEMO_SHA__', sha));
console.log('packed', sha.slice(0, 7), '→', out);
