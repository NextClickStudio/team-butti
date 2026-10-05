/* Demo catalog used by the static demo store (no real products, prices or stock). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TB_CATALOG = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  var vid = 4100;
  function sized(price, sold) {
    return SIZES.map(function (s) { return { id: vid++, options: [s], available: !(sold === true || (sold || []).indexOf(s) > -1), price: price }; });
  }
  var raw = [
    { handle: 'hockey-jersey-kings', title: 'Hockey Jersey "Kings"', type: 'Hockey', price: 8900, jersey: ['hockey', '#f4f1ea,#0d0d0d,#9a9a9a,#0d0d0d', '00'], bg: '#e8e4da', tags: ['badge:Nuovo'],
      description: '<p>La maglia da capitano. Mesh pesante, scollo a V con lacci, numeri e scritte ricamati in twill. Vestibilità oversize da pista.</p>' },
    { handle: 'mx-jersey-hawaii-2003', title: 'MX Jersey "Hawaii 2003"', type: 'Motocross', price: 7900, jersey: ['mx', '#f4f1ea,#e3191b,#1d3fbf,#e3191b', '03'], bg: '#ffd400', tags: ['badge:Best'], sold: ['XXL'],
      description: '<p>Omaggio al Thanksgiving Weekend del 2003. Maniche lunghe con pannelli diagonali e sponsor finti. Testata sullo sterrato toscano.</p>' },
    { handle: 'football-jersey-merde-00', title: 'Football Jersey "Merde 00"', type: 'Football', price: 8500, jersey: ['football', '#0d0d0d,#ff6a13,#f4f1ea,#ff6a13', '00'], bg: '#f4f1ea',
      description: '<p>Il doppio zero più famoso del Market di Milano. Numeri giganti, spalle squadrate, inserti laterali a contrasto.</p>' },
    { handle: 'hockey-jersey-rosa-butti', title: 'Hockey Jersey "Rosa Butti"', type: 'Hockey', price: 8900, jersey: ['hockey', '#ff2e93,#0d0d0d,#f4f1ea,#0d0d0d', '69'], bg: '#ffd400', tags: ['badge:Market'],
      description: '<p>Rosa poster, maniche nere, strisce panna. La maglia che è finita su metà dei TikTok del Market.</p>' },
    { handle: 'mx-jersey-toscana-dirt', title: 'MX Jersey "Toscana Dirt"', type: 'Motocross', price: 7900, jersey: ['mx', '#39ff14,#ff2e93,#0d0d0d,#ff2e93', '91'], bg: '#0d0d0d',
      description: '<p>Verde neon e fucsia, come la nostra prima maglia MX. Si vede da tre colline di distanza.</p>' },
    { handle: 'hockey-jersey-navy-x', title: 'Hockey Jersey "Navy X"', type: 'Hockey', price: 8900, jersey: ['hockey', '#1d3fbf,#1d3fbf,#e3191b,#f4f1ea', '10'], bg: '#ff2e93', sold: true,
      description: '<p>Andata in 40 minuti al Market. Torna al prossimo drop, forse.</p>' },
    { handle: 'football-jersey-giallo', title: 'Football Jersey "Giallo"', type: 'Football', price: 8500, compare_at_price: 9900, jersey: ['football', '#ffd400,#e3191b,#0d0d0d,#e3191b', '68'], bg: '#1d3fbf',
      description: '<p>Giallo MX e rosso poster. In saldo finché ci sono taglie.</p>' },
    { handle: 'mx-jersey-desert', title: 'MX Jersey "Desert"', type: 'Motocross', price: 7900, jersey: ['mx', '#c9a46a,#7a5a2c,#f4f1ea,#0d0d0d', '25'], bg: '#39ff14', tags: ['badge:Ultimi'], sold: ['S', 'M'],
      description: '<p>Color sabbia come il gilet camo. Ultime taglie rimaste.</p>' }
  ];
  var products = raw.map(function (p, i) {
    return Object.assign({ id: 1000 + i, options: ['Taglia'], variants: sized(p.price, p.sold) }, p);
  });
  var models = ['Hockey', 'Motocross', 'Football'];
  products.push({
    id: 2001, handle: 'maglia-custom', title: 'Maglia custom', type: 'Custom', jersey: ['hockey', '#ff2e93,#0d0d0d,#f4f1ea,#0d0d0d', '00'], bg: '#ffd400',
    description: '<p>Scegli modello, colori, nome e numero. Stampati e ricamati a mano.</p>',
    options: ['Modello', 'Taglia'],
    variants: models.reduce(function (acc, m) { return acc.concat(SIZES.map(function (s) { return { id: vid++, options: [m, s], available: !(m === 'Football' && s === 'XXL'), price: 9900 }; })); }, [])
  });
  products.push({
    id: 2002, handle: 'targa-socal', title: 'Targa SoCal custom', type: 'Accessori',
    description: '<p>Targa in alluminio stampata con la tua scritta. 30×15 cm.</p>',
    options: null, variants: [{ id: vid++, options: ['Default Title'], available: true, price: 3900 }]
  });
  var menus = {
    'main-menu': { title: 'Shop', links: [
      { title: 'Shop', url: '/collections/all' }, { title: 'Drop 01', url: '/collections/drop-01' }, { title: 'Custom', url: '/#custom' }, { title: 'Spedizioni', url: '/pages/spedizioni' }
    ] },
    footer: { title: 'Info', links: [
      { title: 'Spedizioni e resi', url: '/pages/spedizioni' }, { title: 'Guida taglie', url: '/pages/spedizioni' }, { title: 'Cerca', url: '/search' }
    ] }
  };
  return { products: products, menus: menus };
});
