// Generates the tiny index.html that boots the CDN-hosted demo (deployed to Vercel with an SPA rewrite).
// Usage: node demo-shell.js <assetBase ending with /> [liquidUrl] > index.html
const base = process.argv[2], liq = process.argv[3] || 'https://cdn.jsdelivr.net/npm/liquidjs@10.30.0/dist/liquid.browser.min.js';
if (!base) { console.error('usage: node demo-shell.js <assetBase/> [liquidUrl]'); process.exit(1); }
const s = f => `<script src="${base}${f}"></script>`;
process.stdout.write(`<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Team Butti — Demo</title>
<style>html,body{margin:0;background:#ff2e93;height:100%}body{display:grid;place-items:center;font:700 12px monospace;letter-spacing:.2em;color:#0d0d0d}</style>
<script>window.TB_ASSET_BASE=${JSON.stringify(base)};window.TB_LIQUID_URL=${JSON.stringify(liq)};</script>
<script src="${liq}"></script>
${['tools/theme-test/liquid-shopify.js', 'tools/theme-test/demo-catalog.js', 'demo/demo-data.js', 'tools/theme-test/demo-pages.js', 'tools/theme-test/demo-app.js'].map(s).join('\n')}
</head>
<body>TEAM BUTTI · CARICAMENTO…</body>
</html>
`);
