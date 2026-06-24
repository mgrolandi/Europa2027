/* BRUSELAS — 6 → 7 feb */
const CITY = {
  id: 'bruselas',
  name: 'Bruselas',
  country: 'Bélgica',
  dates: '6 – 7 feb',
  center: [50.8580, 4.3640],
  zoom: 12,
  zones: [
    { name: 'Grand-Place', blurb: 'el casco viejo',
      polygon: [[50.8505,4.3450],[50.8510,4.3590],[50.8420,4.3585],[50.8415,4.3455]] },
    { name: 'Mont des Arts', blurb: 'museos y palacios',
      polygon: [[50.8490,4.3580],[50.8495,4.3690],[50.8400,4.3685],[50.8395,4.3585]] },
    { name: 'Cincuentenario', blurb: 'el barrio europeo',
      polygon: [[50.8450,4.3830],[50.8455,4.3990],[50.8360,4.3985],[50.8355,4.3835]] },
    { name: 'Laeken', blurb: 'el norte futurista',
      polygon: [[50.8985,4.3360],[50.8990,4.3480],[50.8905,4.3475],[50.8900,4.3365]] }
  ],
  monuments: [
    { name: 'Grand-Place', zone: 'Grand-Place', coords: [50.8467,4.3525],
      kicker: 'La plaza más bella de Europa',
      desc: 'Plaza mayor rodeada de casas gremiales doradas y el ayuntamiento gótico. Patrimonio de la Humanidad y corazón de la ciudad.',
      hours: 'Siempre abierta', price: 'Gratis', metro: 'Gare Centrale, De Brouckère' },
    { name: 'Manneken Pis', zone: 'Grand-Place', coords: [50.8450,4.3499],
      kicker: 'El niño más famoso de Bélgica',
      desc: 'La diminuta fuente del niño que orina, símbolo travieso de Bruselas. A menudo lo visten con trajes distintos para las fiestas.',
      hours: 'Siempre visible', price: 'Gratis', metro: 'Bourse, Gare Centrale' },
    { name: 'Galerías Saint-Hubert', zone: 'Grand-Place', coords: [50.8479,4.3541],
      kicker: 'Chocolate bajo cristal',
      desc: 'Una de las galerías comerciales cubiertas más antiguas de Europa (1847), con chocolaterías históricas y cafés elegantes.',
      hours: 'Tiendas 10:00–19:00', price: 'Entrada libre', metro: 'Gare Centrale' },
    { name: 'Catedral de San Miguel', zone: 'Mont des Arts', coords: [50.8479,4.3601],
      kicker: 'El gótico de Bruselas',
      desc: 'Catedral gótica de dos torres dedicada a los patronos de la ciudad, con magníficas vidrieras del siglo XVI.',
      hours: 'Todos los días 8:00–18:00', price: 'Gratis · cripta €1', metro: 'Gare Centrale, Parc' },
    { name: 'Atomium', zone: 'Laeken', coords: [50.8949,4.3415],
      kicker: 'Un átomo de 102 metros',
      desc: 'La estructura más icónica de la ciudad: nueve esferas de acero de la Expo del 58. Sube a la esfera superior para ver Bruselas.',
      hours: 'Todos los días 10:00–18:00', price: '€16 adultos · €8,50 niños', metro: 'Heysel/Heizel (línea 6)' },
    { name: 'Parque del Cincuentenario', zone: 'Cincuentenario', coords: [50.8402,4.3927],
      kicker: 'El arco triunfal',
      desc: 'Gran parque con un arco de triunfo monumental y museos de arte e historia, en pleno barrio de las instituciones europeas.',
      hours: 'Parque 24 h', price: 'Parque gratis', metro: 'Merode, Schuman' }
  ],
  spots: [
    /* ---- tus lugares · Bruselas ---- */
    { name: 'NH Brussels Carrefour de l\'Europe', type: 'hotel', coords: [50.8466,4.3556], note: 'Hotel a un paso de la Grand-Place y la Gare Centrale.' },
    { name: 'Delirium Café (Tremens)', type: 'comida', coords: [50.8487,4.3537], note: 'El bar del récord Guinness: +2.000 cervezas. Impasse de la Fidélité 4.' }
  ]
};
export default CITY
