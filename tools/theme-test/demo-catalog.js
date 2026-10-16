/* Demo catalog used by the static demo store: the real Team Butti pieces (still life photos), example prices and stock. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TB_CATALOG = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  var vid = 4100;
  function sized(price, sold) {
    return SIZES.map(function (s) { return { id: vid++, options: [s], available: !(sold === true || (sold || []).indexOf(s) > -1), price: price }; });
  }
  // real Team Butti still lifes (Drive "STILL LIFE TB"); prices are examples until the real list arrives
  var raw = [
    { handle: 'hockey-merde-x-nero-arancio', title: 'Hockey "MERDE X" nero/arancio', type: 'Hockey', price: 8500, images: ['tb-maglia-hockey-merdex-nero-arancio-front.png', 'tb-maglia-hockey-merdex-nero-arancio-back.png'], bg: '#ffd400', tags: ['badge:Nuovo'], description: '<p>Arancio pista e nero, strisce a punta sulle maniche. Davanti TEAM BUTTI, dietro la X. Mesh pesante, taglio largo da pista.</p>' },
    { handle: 'cross-merde-62-bluette-giallo', title: 'Motocross "MERDE 62" bluette/giallo', type: 'Motocross', price: 8900, images: ['tb-maglia-cross-merde62-bluette-giallo-front.png', 'tb-maglia-cross-merde62-bluette-giallo-back.png'], bg: '#ff2e93', tags: ['badge:Market'], sold: ['XXL'], description: '<p>Bluette e giallo come le maglie da cross dei primi 2000. Spalle nere, maniche lunghe, 62 enorme sulla schiena.</p>' },
    { handle: 'pettorina-team-butti', title: 'Pettorina TEAM BUTTI', type: 'Accessori', price: 12900, images: ['tb-maglia-pettorina-front.png'], bg: '#39ff14', tags: ['badge:Ultimi'], sold: ['S', 'M'], description: '<p>La pettorina da cross con TEAM BUTTI davanti. Sopra la t-shirt bianca per girare, sopra tutto per il Market.</p>' },
    { handle: 'hockey-00-merde-verde', title: 'Hockey "00 MERDE" verde neon', type: 'Hockey', price: 7900, images: ['tb-maglia-hockey-merde00-verde-front.png', 'tb-maglia-hockey-merde00-verde-back.png'], bg: '#0d0d0d', tags: [], description: '<p>Verde neon, si vede da tre colline di distanza. TEAM BUTTI davanti, MERDE 00 dietro.</p>' },
    { handle: 'cross-merde-62-bianco-rosso', title: 'Motocross "MERDE 62" bianco/rosso', type: 'Motocross', price: 8900, images: ['tb-maglia-cross-merde62-bianco-rosso-front.png', 'tb-maglia-cross-merde62-bianco-rosso-back.png'], bg: '#1d3fbf', tags: [], description: '<p>Bianca con le bande rosse da gara e il collo a contrasto. Numero 62 sulla schiena.</p>' },
    { handle: 'hockey-merde-x-nero-bianco', title: 'Hockey "MERDE X" nero/bianco', type: 'Hockey', price: 8500, images: ['tb-maglia-hockey-merdex-nero-bianco-front.png', 'tb-maglia-hockey-merdex-nero-bianco-back.png'], bg: '#ff2e93', tags: [], sold: true, description: '<p>Nero e bianco, la X sulla schiena. Andata al Market, torna al prossimo drop.</p>' },
    { handle: 'tee-team-butti-merde-bianca', title: 'T-shirt "TEAM BUTTI MERDE" bianca', type: 'T-shirt', price: 3900, images: ['tb-maglia-tee-merde-bianco-back.png', 'tb-maglia-tee-merde-bianco-front.png'], bg: '#ffd400', tags: ['badge:Best'], description: '<p>Davanti pulita, dietro il coro: TEAM BUTTI MERDE a tutta schiena. Cotone pesante, taglio boxy.</p>' },
    { handle: 'hockey-00-merde-giallo', title: 'Hockey "00 MERDE" giallo', type: 'Hockey', price: 7900, images: ['tb-maglia-hockey-merde00-giallo-front.png', 'tb-maglia-hockey-merde00-giallo-back.png'], bg: '#1d3fbf', tags: [], compare_at_price: 9900, description: '<p>Giallo burro, numeri neri. In saldo finché ci sono taglie.</p>' },
    { handle: 'hockey-00-merde-bianco', title: 'Hockey "00 MERDE" bianco', type: 'Hockey', price: 7900, images: ['tb-maglia-hockey-merde00-bianco-front.png', 'tb-maglia-hockey-merde00-bianco-back.png'], bg: '#ff2e93', tags: [], description: '<p>La bianca: TEAM BUTTI davanti, MERDE 00 dietro. Va con tutto, anche col fango.</p>' },
    { handle: 'hockey-00-merde-bluette', title: 'Hockey "00 MERDE" bluette', type: 'Hockey', price: 7900, images: ['tb-maglia-hockey-merde00-bluette-front.png', 'tb-maglia-hockey-merde00-bluette-back.png'], bg: '#ffd400', tags: [], description: '<p>Bluette pieno, scritte bianche. La più da pista del drop.</p>' },
    { handle: 'hockey-00-merde-nero', title: 'Hockey "00 MERDE" nero', type: 'Hockey', price: 7900, images: ['tb-maglia-hockey-merde00-nero-front.png', 'tb-maglia-hockey-merde00-nero-back.png'], bg: '#39ff14', tags: [], description: '<p>Nera, scritte bianche. Per la sera al Market.</p>' },
    { handle: 'cross-merde-62-camo', title: 'Motocross "MERDE 62" camo', type: 'Motocross', price: 8900, images: ['tb-maglia-cross-merde62-bianco-front.png', 'tb-maglia-cross-merde62-bianco-back.png'], bg: '#e0a54a', tags: [], description: '<p>Bianca con le maniche mimetiche grigie e i fianchi neri. Il 62 dietro.</p>' },
    { handle: 'cross-merde-62-nero', title: 'Motocross "MERDE 62" nero', type: 'Motocross', price: 8900, images: ['tb-maglia-cross-merde62-nero-front.png', 'tb-maglia-cross-merde62-nero-back.png'], bg: '#ffd400', tags: [], description: '<p>Nera con le bande bianche sulle maniche. Sta bene impolverata.</p>' },
    { handle: 'tee-tabacchi-bianca', title: 'T-shirt "Tabacchi" ricamo bianca', type: 'T-shirt', price: 4500, images: ['tb-maglia-tee-tabacchi-bianco-back.png', 'tb-maglia-tee-tabacchi-bianco-front.png'], bg: '#1d3fbf', tags: [], description: '<p>Il cartello del tabacchi ricamato sul petto, TEAM BUTTI blu a tutta schiena.</p>' },
    { handle: 'tee-tabacchi-nera', title: 'T-shirt "Tabacchi" ricamo nera', type: 'T-shirt', price: 4500, images: ['tb-maglia-tee-tabacchi-nero-back.png', 'tb-maglia-tee-tabacchi-nero-front.png'], bg: '#ff2e93', tags: [], description: '<p>Nera, ricamo tabacchi davanti, TEAM BUTTI giallo dietro.</p>' },
    { handle: 'tee-team-butti-bianca', title: 'T-shirt TEAM BUTTI bianca', type: 'T-shirt', price: 3500, images: ['tb-maglia-tee-teambutti-bianco-back.png', 'tb-maglia-tee-teambutti-bianco-front.png'], bg: '#39ff14', tags: [], description: '<p>Quella base: TEAM BUTTI dietro, niente davanti.</p>' },
    { handle: 'tee-team-butti-nera', title: 'T-shirt TEAM BUTTI nera', type: 'T-shirt', price: 3500, images: ['tb-maglia-tee-teambutti-nero-back.png', 'tb-maglia-tee-teambutti-nero-front.png'], bg: '#ffd400', tags: [], description: '<p>Nera, scritta grande dietro. La divisa del team.</p>' }
  ];
  var products = raw.map(function (p, i) {
    return Object.assign({ id: 1000 + i, options: ['Taglia'], variants: sized(p.price, p.sold) }, p);
  });
  var menus = {
    'main-menu': { title: 'Shop', links: [
      { title: 'Shop', url: '/collections/all' }, { title: 'Drop 01', url: '/collections/drop-01' }, { title: 'Chi siamo', url: '/pages/chi-siamo' }, { title: 'Spedizioni', url: '/pages/spedizioni' }
    ] },
    footer: { title: 'Info', links: [
      { title: 'Chi siamo', url: '/pages/chi-siamo' }, { title: 'Spedizioni e resi', url: '/pages/spedizioni' }, { title: 'Guida taglie', url: '/pages/spedizioni' }, { title: 'Cerca', url: '/search' }
    ] }
  };
  return { products: products, menus: menus };
});
