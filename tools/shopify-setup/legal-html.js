// Turns legal/compilato/*.md into HTML (same converter as the demo store, tools/theme-test/build-demo.js) in legal/compilato/html/.
// Usage: node tools/shopify-setup/legal-html.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const src = fs.readFileSync(path.join(root, 'tools/theme-test/build-demo.js'), 'utf8');
const code = src.slice(src.indexOf('const esc ='), src.indexOf('const legal ='));
const md = new Function(code + '\nreturn md;')();
const dir = path.join(root, 'legal/compilato'), out = path.join(dir, 'html');
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(dir).filter(f => /^\d\d-.*\.md$/.test(f))) {
  const html = md(fs.readFileSync(path.join(dir, f), 'utf8'));
  fs.writeFileSync(path.join(out, f.replace(/\.md$/, '.html')), html + '\n');
  console.log(f, html.length, /<mark>/.test(html) ? 'SEGNAPOSTO!' : 'ok');
}
