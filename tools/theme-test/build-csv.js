// Writes import/prodotti-team-butti.csv (Shopify product CSV) from the demo catalog.
// Jersey drawings come from tags (jersey:, colors:, num:, bg:) so no metafield setup is needed.
const fs = require('fs'), path = require('path');
const CAT = require('./demo-catalog');
const OUT = path.resolve(__dirname, '../../import/prodotti-team-butti.csv');
const H = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service',
  'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Gift Card', 'Status'];
const q = v => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
const money = c => (c / 100).toFixed(2);
const rows = [H];
for (const p of CAT.products) {
  const tags = [...(p.tags || [])];
  if (p.jersey) {
    tags.push('jersey:' + p.jersey[0], 'colors:' + p.jersey[1].replace(/#/g, '').split(',').join('-'), 'num:' + p.jersey[2]);
  }
  if (p.bg) tags.push('bg:' + p.bg.replace('#', ''));
  const opts = p.options || ['Title'];
  p.variants.forEach((v, i) => {
    const first = i === 0;
    const sku = (p.handle.split('-').map(w => w[0]).join('') + '-' + v.options.join('-')).toUpperCase().replace(/\s+/g, '');
    rows.push([
      p.handle, first ? p.title : '', first ? (p.description || '') : '', first ? 'Team Butti' : '', first ? p.type : '', first ? tags.join(', ') : '', first ? 'TRUE' : '',
      first ? opts[0] : '', v.options[0], first && opts[1] ? opts[1] : '', v.options[1] || '',
      sku, 350, 'shopify', v.available ? 20 : 0, 'deny', 'manual',
      money(v.price), p.compare_at_price ? money(p.compare_at_price) : '', 'TRUE', 'TRUE', first ? 'FALSE' : '', first ? 'active' : ''
    ]);
  });
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, rows.map(r => r.map(q).join(',')).join('\n') + '\n');
console.log('csv:', rows.length - 1, 'variant rows →', OUT);
