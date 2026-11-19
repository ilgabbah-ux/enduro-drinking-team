/* EDT — catalogo, carrello e ordine con PayPal.me */
const PAYPAL_ME = 'ilgabbah';
/* Codice commerciante PayPal. Se è compilato, il pagamento porta con sé l'ordine completo
   e il passaggio della mail non serve più. Vuoto = PayPal.me + mail. */
const PAYPAL_BUSINESS = 'F5MQUKZSPRACN';
const SITE_URL = 'https://endurodrinkingteam.com/';
const ORDER_EMAIL = 'ordini@endurodrinkingteam.com';
const SHIP_SMALL = 2;   // solo adesivi, spille, calamite, patch: in busta
const SHIP_FULL = 7;    // appena c'è un capo o un oggetto grande
const SW = { Bianca: '#f5f5f2', Nera: '#151515', Rossa: '#d0201a', Blu: '#1d3f8f', Arancio: '#f07d1a', Grigia: '#8a8a88' };
const GUIDE = {
  tee: { def: 'L', head: ['Taglia', 'Lunghezza', 'Larghezza'], rows: [['S', 70, 50], ['M', 72, 53], ['L', 74, 56], ['XL', 76, 59], ['XXL', 78, 62], ['3XL', 80, 65], ['4XL', 82, 68], ['5XL', 84, 71]], note: 'Misure della maglia stesa, in cm. Confrontale con una t-shirt che ti va bene.' },
  teeD: { def: 'M', head: ['Taglia', 'Lunghezza', 'Larghezza', 'Manica'], rows: [['XS', 61.8, 46.5, 15], ['S', 62.8, 48.5, 15.4], ['M', 64, 51, 16], ['L', 65.2, 53.5, 16.6], ['XL', 66.4, 56, 17.2], ['XXL', 67.9, 59, 18], ['3XL', 69.4, 62, 18.8], ['4XL', 70.9, 65, 19.6], ['5XL', 72.4, 68, 20.4]], note: 'Modello donna, più corto e sfiancato. Misure della maglia stesa, in cm.' },
  felpa: { def: 'L', head: ['Taglia', 'Lunghezza', 'Larghezza', 'Manica'], rows: [['XS', 69, 51.5, 67], ['S', 70, 53.5, 67.4], ['M', 72, 56, 68], ['L', 74, 58.5, 68.6], ['XL', 76, 61, 69.2], ['XXL', 78, 64, 70], ['3XL', 80, 67, 70.8], ['4XL', 82, 70.5, 71.8], ['5XL', 84, 74, 72.8]], note: 'Misure della felpa stesa, in cm. Confrontale con una felpa che ti va bene.' },
  lunga: { def: 'L', head: ['Taglia', 'Lunghezza', 'Larghezza', 'Manica'], rows: [['XS', 69.5, 47.5, 65], ['S', 70.5, 49.5, 65.4], ['M', 72.5, 52, 66], ['L', 74.5, 54.5, 66.6], ['XL', 76.5, 57, 67.2], ['XXL', 78.5, 60, 68], ['3XL', 80.5, 63, 68.8], ['4XL', 86, 75, 72], ['5XL', 88.5, 80, 73]], note: 'Misure della maglia stesa, in cm. Confrontale con una maglia che ti va bene.' },
  maglia: { def: 'L', head: ['Taglia', 'Larghezza torace'], rows: [['4XS', 35], ['3XS', 42], ['XXS', 45], ['XS', 50], ['S', 52], ['M', 54], ['L', 56], ['XL', 58], ['XXL', 60], ['3XL', 62], ['4XL', 64], ['5XL', 67]], note: 'Larghezza della maglia stesa, da ascella ad ascella, in cm. Se sotto metti la pettorina, prendi una taglia in più.' },
  pant: { def: '48/32', head: ['Taglia ITA/USA', 'Giro vita'], rows: [['40/24', 78], ['42/26', 81], ['44/28', 84], ['46/30', 87], ['48/32', 92], ['50/34', 95], ['52/36', 98], ['54/38', 101], ['56/40', 105]], note: 'Giro vita in cm.' },
  base: { def: 'L', rows: [['S'], ['M'], ['L'], ['XL'], ['XXL'], ['3XL']] },
};
const cm = v => typeof v === 'number' ? String(v).replace('.', ',') : v;
function sizeBlock(key, name, legend) {
  const g = GUIDE[key];
  const seg = `<fieldset class="opt"><legend>${legend}</legend><div class="seg seg--size">${g.rows.map(r =>
    `<label><input type="radio" name="${name}" value="${r[0]}" ${r[0] === g.def ? 'checked' : ''}><span>${r[0]}</span></label>`).join('')}</div></fieldset>`;
  const tab = g.head ? `<details class="guida"><summary>Guida taglie${legend === 'Taglia' ? '' : ': ' + legend.replace('Taglia ', '')}</summary><table><thead><tr>${g.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${g.rows.map(r =>
    `<tr>${r.map((c, i) => i ? `<td>${cm(c)}</td>` : `<th>${c}</th>`).join('')}</tr>`).join('')}</tbody></table><p>${g.note} Dubbi? Scrivici prima di ordinare.</p></details>`
    : `<p class="guida-no">Per questa maglia la tabella misure è in arrivo: se hai dubbi sulla taglia, scrivici prima di ordinare.</p>`;
  return seg + tab;
}
function sizesHtml(p, model) {
  if (p.guide === 'completo') return sizeBlock('maglia', 'size', 'Taglia maglia') + sizeBlock('pant', 'size2', 'Taglia pantalone');
  if (p.guide === 'tee') return sizeBlock(model === 'Donna' ? 'teeD' : 'tee', 'size', 'Taglia');
  return sizeBlock(p.guide || 'base', 'size', 'Taglia');
}

// cat: wear | gara | small | 4x4      small:true = entra in busta
const PRODUCTS = [
  { id: 'completo-gara', guide: 'completo', cat: 'gara', name: 'Completo da gara EDT', note: 'Maglia + pantalone con il cinghiale, il tuo nome e il numero.', price: 130, img: 'img/p/completo-svetlana.jpg', imgs: ['img/p/completo-svetlana.jpg', 'img/x/completo-azione.jpg'], sizes: true, nome: true, numero: true, tag: 'Novità' },
  { id: 'maglia-gara', guide: 'maglia', cat: 'gara', name: 'Maglia da gara EDT', note: 'Enduro Drinking Team davanti, il cinghiale e il tuo nome sulla schiena.', price: 30, img: 'img/s/maglia-gara2.jpg', imgs: ['img/s/maglia-gara2.jpg', 'img/x/maglia-fronte.jpg'], sizes: true, nome: true, numero: true },
  { id: 'pantalone-gara', guide: 'pant', cat: 'gara', name: 'Pantalone da gara EDT', note: 'Il pantalone del completo, con i cinghiali sulle cosce. Venduto da solo.', price: 110, img: 'img/x/pantalone-dettaglio.jpg', pos: '50% 40%', sizes: true },

  { id: 'endurista-semplice', guide: 'tee', cat: 'wear', name: 'Sono un endurista semplice', note: 'La t-shirt più onesta del Piemonte: scudetto EDT sulla manica e il tuo nome sulla schiena.', price: 18, img: 'img/p/endurista-svetlana.jpg', imgs: ['img/p/endurista-svetlana.jpg', 'img/p/endurista-mockup.jpg', 'img/x/endurista-birra.jpg'], sizes: true, colorImgs: { Bianca: 'img/p/endurista-svetlana.jpg', Nera: 'img/c/endurista-nera.jpg', Rossa: 'img/c/endurista-rossa.jpg', Blu: 'img/c/endurista-blu.jpg', Arancio: 'img/c/endurista-arancio.jpg' }, colors: ['Bianca', 'Nera', 'Rossa', 'Blu', 'Arancio'], nome: true, tag: 'Best seller' },
  { id: 'felpa-edt', guide: 'felpa', cat: 'wear', name: 'Felpa EDT con nome', note: 'Zip e cappuccio, il tuo nome sul petto.', price: 25, img: 'img/s/felpa.jpg', imgs: ['img/s/felpa.jpg', 'img/p/felpa-e-d-t.jpg', 'img/x/felpa-falo.jpg'], sizes: true, colorImgs: { Nera: 'img/s/felpa.jpg', Grigia: 'img/c/felpa-grigia.jpg' }, colors: ['Nera', 'Grigia'], nome: true },
  { id: 't-shirt-gev', guide: 'tee', cat: 'wear', name: 'T-shirt GEV', note: 'Cinque stelle e il tuo nome.', price: 18, img: 'img/s/gev.jpg', imgs: ['img/s/gev.jpg', 'img/x/gev-dettaglio.jpg'], sizes: true, colorImgs: { Nera: 'img/s/gev.jpg', Bianca: 'img/c/gev-bianca.jpg', Rossa: 'img/c/gev-rossa.jpg', Blu: 'img/c/gev-blu.jpg', Arancio: 'img/c/gev-arancio.jpg' }, colors: ['Nera', 'Bianca', 'Rossa', 'Blu', 'Arancio'], nome: true },
  { id: 'fuck-the-gev', guide: 'tee', cat: 'wear', name: 'Fuck the GEV', note: 'Il cinghiale anti-GEV. Per chi ha capito.', price: 18, img: 'img/s/fuckgev.jpg', imgs: ['img/s/fuckgev.jpg', 'img/p/fuck-the-gev-2026.jpg', 'img/x/fuckgev-fango.jpg'], sizes: true, colorImgs: { Nera: 'img/s/fuckgev.jpg', Bianca: 'img/c/fuckgev-bianca.jpg', Rossa: 'img/c/fuckgev-rossa.jpg', Blu: 'img/c/fuckgev-blu.jpg', Arancio: 'img/c/fuckgev-arancio.jpg' }, colors: ['Nera', 'Bianca', 'Rossa', 'Blu', 'Arancio'] },
  { id: 'fuck-the-gev-2026', guide: 'tee', cat: 'wear', name: 'Fuck the GEV 2026', note: 'La nuova grafica 2026 in rosso, bianco e verde, grande sul petto.', price: 18, img: 'img/x/fgev26-tee.jpg', imgs: ['img/x/fgev26-tee.jpg', 'img/x/fgev26-grafica.jpg'], sizes: true, colors: ['Nera'], tag: 'Novità' },
  { id: 't-shirt-2020', guide: 'tee', cat: 'wear', name: 'T-shirt EDT 2026', note: 'Il cinghiale vichingo 2026 sul rosso.', price: 15, img: 'img/s/tshirt2026.jpg', sizes: true, colorImgs: { Rossa: 'img/s/tshirt2026.jpg', Bianca: 'img/c/tshirt2026-bianca.jpg', Nera: 'img/c/tshirt2026-nera.jpg', Blu: 'img/c/tshirt2026-blu.jpg', Arancio: 'img/c/tshirt2026-arancio.jpg' }, colors: ['Rossa', 'Bianca', 'Nera', 'Blu', 'Arancio'] },
  { id: 'manica-lunga', guide: 'lunga', cat: 'wear', name: 'Manica lunga classica', note: 'Il cinghiale 2026 grande sul petto. Per le uscite di novembre.', price: 20, img: 'img/s/manica.jpg', sizes: true, colorImgs: { Nera: 'img/s/manica.jpg', Bianca: 'img/c/manica-bianca.jpg', Rossa: 'img/c/manica-rossa.jpg', Blu: 'img/c/manica-blu.jpg', Arancio: 'img/c/manica-arancio.jpg' }, colors: ['Nera', 'Bianca', 'Rossa', 'Blu', 'Arancio'] },
  { id: 't-shirt-serial-griller', guide: 'tee', cat: 'wear', name: 'T-shirt Serial Griller', note: 'Dopo il giro, la griglia.', price: 15, img: 'img/s/griller.jpg', imgs: ['img/s/griller.jpg', 'img/p/t-shirt-serial-griller.jpg'], sizes: true, colorImgs: { Nera: 'img/s/griller.jpg', Bianca: 'img/c/griller-bianca.jpg', Rossa: 'img/c/griller-rossa.jpg', Blu: 'img/c/griller-blu.jpg', Arancio: 'img/c/griller-arancio.jpg' }, colors: ['Nera', 'Bianca', 'Rossa', 'Blu', 'Arancio'] },
  { id: 'grembiule', cat: 'wear', name: 'Grembiule Serial Griller', note: 'Taglia unica, anche per chi brucia tutto.', price: 20, img: 'img/s/grembiule.jpg', imgs: ['img/s/grembiule.jpg', 'img/p/grembiule-serial-griller.jpg'] },
  { id: 'berretto-edt', cat: 'wear', name: 'Berretto EDT', note: 'Berretto in maglia con la patch del cinghiale 2026.', price: 20, img: 'img/s/berretto.jpg' },

  { id: 'fanqlo-trial-team', guide: 'tee', cat: '4x4', name: 'FAN Q LO Trial Team', note: 'La Q è una gomma tassellata con dentro il logo Trial Team 4x4. Si capisce al volo.', price: 18, img: 'img/x/fanqlo-tee.jpg', imgs: ['img/x/fanqlo-tee.jpg', 'img/x/fanqlo-grafica.jpg'], sizes: true, colors: ['Nera'], tag: 'Novità' },
  { id: 'cappello-4x4', cat: '4x4', name: 'Cappello 4x4 in lana', note: 'Con la patch 4x4 Off Road.', price: 12, img: 'img/s/4x4.jpg' },
  { id: 'cintura-4x4', cat: '4x4', name: 'Cintura 4x4 in cuoio', note: 'Cuoio nero con cuciture rosse, grafica 4x4 Off Road e battistrada. Personalizzabile col tuo nome.', price: 70, img: 'img/s/cintura.jpg', pos: '50% 62%', imgs: ['img/s/cintura.jpg', 'img/p/cintura-4x4-cuoio.jpg'], nome: true },

  { id: 'patch-edt', cat: 'small', name: 'Patch EDT', note: 'In stoffa, 8 × 7 cm.', price: 10, img: 'img/s/c-patch.jpg', imgs: ['img/s/c-patch.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'adesivo-classico', cat: 'small', name: 'Adesivo EDT grande', note: 'Il cinghiale 2026, 10 × 10 cm.', price: 1, img: 'img/s/c-classico.jpg', imgs: ['img/s/c-classico.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'adesivo-2020', cat: 'small', name: 'Adesivo EDT 2026', note: '7 × 7 cm.', price: 1, img: 'img/s/c-2020.jpg', imgs: ['img/s/c-2020.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'adesivo-olografico', cat: 'small', name: 'Adesivo olografico EDT', note: '7 × 7 cm, brilla al sole.', price: 1.5, img: 'img/s/c-olografico.jpg', imgs: ['img/s/c-olografico.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'stemma-2020', cat: 'small', name: 'Adesivo stemma EDT', note: '7 × 7 cm.', price: 1, img: 'img/s/c-stemma.jpg', imgs: ['img/s/c-stemma.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'adesivo-piemonte', cat: 'small', name: 'Adesivo Enduro Piemonte', note: '8 × 8 cm.', price: 1, img: 'img/s/q-adesivo-piemonte.jpg', imgs: ['img/s/q-adesivo-piemonte.jpg', 'img/x/adesivo-piemonte.jpg'], small: true },
  { id: 'adesivo-grigliare', cat: 'small', name: 'Adesivo Grigliare humanum est', note: '9 × 6 cm.', price: 1, img: 'img/s/q-adesivo-grigliare.jpg', imgs: ['img/s/q-adesivo-grigliare.jpg', 'img/x/adesivo-grigliare.jpg'], small: true },
  { id: 'adesivo-iwantyou', cat: 'small', name: 'Adesivo I want you for giri easy', note: 'Il reclutamento ufficiale EDT.', price: 1, img: 'img/s/q-adesivo-iwantyou.jpg', imgs: ['img/s/q-adesivo-iwantyou.jpg', 'img/x/adesivo-iwantyou.jpg'], small: true, tag: 'Novità' },
  { id: 'adesivo-sanmiti', cat: 'small', name: 'Adesivo San Miti', note: "Protettore dell'EDT. Attaccalo sul parafango, non si sa mai.", price: 1, img: 'img/s/q-adesivo-sanmiti.jpg', imgs: ['img/s/q-adesivo-sanmiti.jpg', 'img/x/adesivo-sanmiti.jpg'], small: true, tag: 'Novità' },
  { id: 'calamita-stemma', cat: 'small', name: 'Calamita stemma EDT', note: '65 × 76 mm.', price: 1.5, img: 'img/s/c-calamita-stemma.jpg', imgs: ['img/s/c-calamita-stemma.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'calamita-edt', cat: 'small', name: 'Calamita EDT', note: '8 × 8 cm.', price: 1.5, img: 'img/s/c-calamita.jpg', imgs: ['img/s/c-calamita.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'spilla-classica', cat: 'small', name: 'Spilla EDT classica', note: '3 × 3 cm.', price: 1.5, img: 'img/s/c-spilla.jpg', imgs: ['img/s/c-spilla.jpg', 'img/s/adesivi.jpg'], small: true },
  { id: 'spilla-piemonte', cat: 'small', name: 'Spilla Enduro Piemonte', note: '4 × 4 cm.', price: 1.5, img: 'img/s/q-spilla-piemonte.jpg', imgs: ['img/s/q-spilla-piemonte.jpg', 'img/x/spilla-piemonte.jpg'], small: true },
];

const CATS = [
  { id: 'all', label: 'Tutto' },
  { id: 'wear', label: 'Da indossare' },
  { id: 'gara', label: 'Da gara' },
  { id: '4x4', label: '4x4' },
  { id: 'small', label: 'Adesivi e piccoli' },
];

const eur = n => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- stato carrello ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('edt-cart') || '[]'); } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem('edt-cart', JSON.stringify(cart)); } catch (e) {} };
const byId = id => PRODUCTS.find(p => p.id === id);
const imgFor = (p, color) => (color && p.colorImgs && p.colorImgs[color.charAt(0) + color.slice(1).toLowerCase()]) || p.img;

function totals() {
  const sub = cart.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
  const onlySmall = cart.length > 0 && cart.every(l => byId(l.id).small);
  const ship = cart.length === 0 ? 0 : onlySmall ? SHIP_SMALL : SHIP_FULL;
  return { sub, ship, tot: Math.round((sub + ship) * 100) / 100, onlySmall };
}

/* ---------- shop ---------- */
let activeCat = 'all';
const inCat = (p, id) => p.cat === id || (p.also || []).includes(id);
function renderChips() {
  $('#chips').innerHTML = CATS.map(c => {
    const n = c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => inCat(p, c.id)).length;
    return `<button class="chip" type="button" aria-pressed="${c.id === activeCat}" data-cat="${c.id}">${c.label} <b>${n}</b></button>`;
  }).join('');
}
function placeholder(p) {
  return `<div class="ph"><img src="img/mascotte.png" alt=""><span>${esc(p.name)}</span></div>`;
}
const alt = p => p.colorImgs ? Object.values(p.colorImgs).find(s => s !== p.img) : (p.imgs && p.imgs[1]);
const GROUPS = [
  { id: 'gara', title: 'Da gara', sub: 'Completo, maglia e pantalone con il tuo nome e il tuo numero.' },
  { id: 'wear', title: 'Da indossare', sub: 'T-shirt, felpe e berretti per quando scendi dalla moto.' },
  { id: '4x4', title: '4x4', sub: 'Per chi gira su quattro ruote.' },
  { id: 'small', title: 'Adesivi e piccoli', sub: 'Da 1 €. Arrivano in busta con 2 € di spedizione.' },
];
function cardHtml(p, i) {
  return `
    <article class="card rv${p.small ? ' card--small' : ''}" style="--d:${(i % 4) * 60}ms">
      <button class="card__hit" type="button" data-open="${p.id}" aria-label="Scegli ${esc(p.name)}, ${eur(p.price)}">
        <div class="card__media">
          <div class="card__img">${p.img ? `<img loading="lazy" decoding="async" src="${p.img}" alt="${esc(p.name)}" loading="lazy"${p.pos ? ` style="object-position:${p.pos}"` : ''}>` : placeholder(p)}${alt(p) ? `<img class="alt" src="${alt(p)}" alt="" loading="lazy">` : ''}</div>
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
          <p class="card__price">${eur(p.price)}</p>
        </div>
        <div class="card__info">
          <h3 class="card__name">${esc(p.name)}</h3>
          ${p.small ? '' : `<p class="card__note">${esc(p.note)}</p>`}
          ${p.colors && p.colors.length > 1 ? `<span class="card__dots" aria-hidden="true">${p.colors.map(c => `<i style="background:${SW[c]}"></i>`).join('')}</span>` : ''}
        </div>
      </button>
    </article>`;
}
const SHORT = { small: 6, wear: matchMedia('(max-width: 759px)').matches ? 6 : 0 };   // nella vista "Tutto" questi gruppi mostrano solo i primi, il resto dietro un pulsante
function renderGrid() {
  const groups = GROUPS.filter(g => activeCat === 'all' || g.id === activeCat);
  $('#grid').innerHTML = groups.map(g => {
    const list = PRODUCTS.filter(p => inCat(p, g.id));
    const cut = activeCat === 'all' && SHORT[g.id] && list.length > SHORT[g.id] ? SHORT[g.id] : 0;
    return `<section class="grp grp--${g.id}${cut ? ' grp--short' : ''}" aria-label="${g.title}">
      <header class="grp__head rv"><h3>${g.title}</h3><p>${g.sub}</p><span class="grp__n">${list.length} ${list.length === 1 ? 'articolo' : 'articoli'}</span></header>
      <div class="grp__grid">${list.map((p, i) => cut && i >= cut ? cardHtml(p).replace('class="card', 'class="card card--extra') : cardHtml(p)).join('')}</div>
      ${cut ? `<button class="btn btn--ghost grp__more" type="button" data-more aria-expanded="false">Mostra tutti i ${list.length}</button>` : ''}
    </section>`;
  }).join('');
  if (window.revealAll) revealAll();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-more]'); if (!b) return;
  const s = b.closest('.grp'); s.classList.remove('grp--short'); b.remove();
  if (window.revealAll) revealAll();
});

/* ---------- vetrina: i pezzi forti in grande ---------- */
const VETRINA = [
  { id: 'completo-gara', img: 'img/x/completo-azione.jpg', cta: 'Scegli taglia, nome e numero' },
  { id: 'endurista-semplice', img: 'img/x/endurista-birra.jpg', cta: 'Scegli colore e taglia' },
  { id: 'fanqlo-trial-team', img: 'img/x/fanqlo-tee.jpg', cta: 'Scegli la taglia' },
  { id: 'felpa-edt', img: 'img/x/felpa-falo.jpg', cta: 'Scegli colore e taglia' },
  { id: 'fuck-the-gev', img: 'img/x/fuckgev-fango.jpg', cta: 'Scegli colore e taglia' },
];
function renderVetrina() {
  const box = $('#vetrina'); if (!box) return;
  box.innerHTML = `<div class="vetrina__track">${VETRINA.map((v, i) => {
    const p = byId(v.id);
    return `<article class="vslide${i ? '' : ' on'}">
      <div class="vslide__pic"><img ${i ? 'loading="lazy" ' : ''}decoding="async" src="${v.img}" alt="${esc(p.name)}"></div>
      ${p.tag ? `<span class="card__tag vslide__tag">${p.tag}</span>` : ''}
      <div class="vslide__txt">
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.note)}</p>
        <div class="vslide__row"><span class="vslide__price">${eur(p.price)}</span><span class="btn btn--beer">${v.cta}</span></div>
      </div>
      <button class="vslide__hit" type="button" data-open="${p.id}" aria-label="${esc(p.name)}, ${eur(p.price)}. ${v.cta}"></button>
    </article>`;
  }).join('')}</div>
  <div class="vetrina__dots">${VETRINA.map((v, i) => `<button type="button" data-go="${i}" aria-label="Vai a ${esc(byId(v.id).name)}"${i ? '' : ' aria-current="true"'}></button>`).join('')}</div>`;
  const track = $('.vetrina__track', box), slides = [...track.children], dots = [...box.querySelectorAll('[data-go]')];
  let cur = 0, timer = null;
  const mark = i => {
    if (i === cur) return; cur = i;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'));
  };
  const go = i => track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
  let q = false;
  track.addEventListener('scroll', () => {
    if (q) return; q = true;
    requestAnimationFrame(() => {
      q = false;
      const step = slides[1].offsetLeft - slides[0].offsetLeft;
      mark(Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / step))));
    });
  }, { passive: true });
  const stop = () => { clearInterval(timer); timer = null; box.classList.remove('auto'); };
  box.addEventListener('click', e => { const d = e.target.closest('[data-go]'); if (d) { stop(); go(+d.dataset.go); } });
  ['pointerdown', 'touchstart', 'wheel', 'keydown', 'focusin'].forEach(ev => box.addEventListener(ev, stop, { passive: true }));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    box.classList.add('auto');
    timer = setInterval(() => {
      const r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || document.hidden) return;
      go((cur + 1) % slides.length);
    }, 5000);
  }
}

/* ---------- scheda prodotto ---------- */
const dlg = $('#product');
let current = null;
function openProduct(id) {
  const p = current = byId(id);
  const imgs = p.imgs || (p.img ? [p.img] : []);
  $('#pd-media').innerHTML = imgs.length ? `<img id="pd-main" src="${imgs[0]}" alt="${esc(p.name)}">` +
    (imgs.length > 1 ? `<div class="thumbs">${imgs.map((s, i) => `<button type="button" data-img="${s}" aria-label="Foto ${i + 1}" aria-pressed="${!i}"><img loading="lazy" decoding="async" src="${s}" alt=""></button>`).join('')}</div>` : '') : placeholder(p);
  $('#pd-name').textContent = p.name;
  $('#pd-price').textContent = eur(p.price);
  $('#pd-note').textContent = p.note;
  let f = '';
  if (p.colors) f += `<fieldset class="opt"><legend>Colore</legend><div class="seg">${p.colors.map((c, i) =>
    `<label><input type="radio" name="color" value="${c}" ${i ? '' : 'checked'}><span><i class="sw" style="background:${SW[c] || '#888'}"></i>${c}</span></label>`).join('')}</div></fieldset>`;
  if (p.sizes && p.guide === 'tee') f += `<fieldset class="opt"><legend>Modello</legend><div class="seg">${['Uomo', 'Donna'].map((m, i) =>
    `<label><input type="radio" name="model" value="${m}" ${i ? '' : 'checked'}><span>${m}</span></label>`).join('')}</div></fieldset>`;
  if (p.sizes) f += `<div id="pd-size">${sizesHtml(p, 'Uomo')}</div>`;
  if (p.nome) f += `<label class="field"><span>Nome da stampare</span><input name="nome" maxlength="14" placeholder="Es. GABBAH" autocomplete="off" required></label>`;
  if (p.numero) f += `<label class="field"><span>Numero</span><input name="numero" inputmode="numeric" pattern="[0-9]{1,3}" maxlength="3" placeholder="Es. 14" required></label>`;
  f += `<div class="field field--qty"><span id="pd-qty-l">Quantità</span><div class="qty"><button type="button" data-q="-1" aria-label="Uno in meno">−</button><input name="qty" type="number" min="1" max="50" value="1" required aria-labelledby="pd-qty-l"><button type="button" data-q="1" aria-label="Uno in più">+</button></div></div>`;
  $('#pd-fields').innerHTML = f;
  $('#pd-ship').textContent = (p.small ? 'Spedizione 2 € in busta, se ordini solo adesivi e piccoli.' : 'Spedizione 7 € in tutta Italia.') +
    ' Spediamo in 3-4 giorni.' + (p.nome || p.numero ? ' Prodotto personalizzato: non si può rendere.' : '');
  pdTotal();
  history.replaceState(null, '', '#p=' + p.id);
  dlg.showModal();
  dlg.scrollTop = 0;
}
$('#pd-form').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const line = { id: current.id, qty: Math.max(1, parseInt(fd.get('qty'), 10) || 1) };
  ['color', 'model', 'size', 'size2', 'nome', 'numero'].forEach(k => { if (fd.get(k)) line[k] = String(fd.get(k)).trim().toUpperCase(); });
  const same = cart.find(l => ['id', 'color', 'model', 'size', 'size2', 'nome', 'numero'].every(k => l[k] === line[k]));
  same ? same.qty += line.qty : cart.push(line);
  const flyFrom = $('#pd-main'), flyRect = flyFrom && flyFrom.getBoundingClientRect(), flySrc = flyFrom && flyFrom.src;
  save(); renderCart(); dlg.close();
  flyToCart(flySrc, flyRect);
  toast(`${current.name} è nel carrello`);
});
function pdTotal() {
  const q = $('#pd-form [name="qty"]');
  const n = Math.max(1, Math.min(50, parseInt(q && q.value, 10) || 1));
  $('#pd-tot').textContent = eur(current.price * n);
}
$('#pd-fields').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const q = $('#pd-form [name="qty"]');
  q.value = Math.max(1, Math.min(50, (parseInt(q.value, 10) || 1) + +b.dataset.q));
  pdTotal();
});
$('#pd-fields').addEventListener('input', e => { if (e.target.name === 'qty') pdTotal(); });
$('#pd-close').addEventListener('click', () => dlg.close());
/* link diretto al prodotto: endurodrinkingteam.com/#p=<id> apre la sua scheda */
dlg.addEventListener('close', () => history.replaceState(null, '', location.pathname + location.search));
$('#pd-share').addEventListener('click', async () => {
  const url = SITE_URL + '#p=' + current.id;
  try {
    if (navigator.share) await navigator.share({ title: current.name + ' · Enduro Drinking Team', url });
    else { await navigator.clipboard.writeText(url); toast('Link copiato'); }
  } catch (err) { if (err && err.name !== 'AbortError') { try { await navigator.clipboard.writeText(url); toast('Link copiato'); } catch (e2) { toast(url); } } }
});
function openFromHash() {
  const m = location.hash.match(/^#p=([\w-]+)$/); if (!m) return;
  const p = PRODUCTS.find(x => x.id === m[1]); if (!p) return;
  const shop = document.querySelector('#shop'); if (shop) shop.scrollIntoView({ block: 'start' });
  openProduct(p.id);
}
window.addEventListener('hashchange', openFromHash);
window.addEventListener('load', () => setTimeout(openFromHash, 400));
$('#pd-fields').addEventListener('change', e => {
  if (e.target.name === 'model') { $('#pd-size').innerHTML = sizesHtml(current, e.target.value); return; }
  if (e.target.name !== 'color' || !current.colorImgs) return;
  const src = current.colorImgs[e.target.value]; if (!src) return;
  const m = $('#pd-main'); m.classList.add('swap'); m.src = src;
  m.onload = () => m.classList.remove('swap');
  const th = $('#pd-media .thumbs button'); if (th) { th.dataset.img = src; th.querySelector('img').src = src; }
});
$('#pd-media').addEventListener('click', e => {
  if (e.target.id === 'pd-main') {
    const ts = [...$('#pd-media').querySelectorAll('[data-img]')]; if (ts.length < 2) return;
    const i = ts.findIndex(x => x.getAttribute('aria-pressed') === 'true');
    return ts[(i + 1) % ts.length].click();
  }
  const b = e.target.closest('[data-img]'); if (!b) return;
  $('#pd-main').src = b.dataset.img;
  b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
});
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

/* ---------- carrello ---------- */
const drawer = $('#cart');
function lineDesc(l) {
  return [l.color, l.model && `modello ${l.model.toLowerCase()}`, l.size && (l.size2 ? `maglia ${l.size}, pantalone ${l.size2}` : `taglia ${l.size}`), l.nome && `nome ${l.nome}`, l.numero && `n° ${l.numero}`].filter(Boolean).join(', ');
}
function renderCart() {
  const n = cart.reduce((s, l) => s + l.qty, 0);
  $('#cart-count').textContent = n;
  $('#cart-count').hidden = n === 0;
  const { sub, ship, tot, onlySmall } = totals();
  if (!cart.length) {
    $('#cart-lines').innerHTML = `<p class="empty">Il carrello è vuoto. Parti dagli adesivi: costano meno di una birra.</p>`;
  } else {
    $('#cart-lines').innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      return `<li class="line">
        <div class="line__img"><img loading="lazy" decoding="async" src="${imgFor(p, l.color) || 'img/mascotte.png'}" alt=""></div>
        <div class="line__txt"><strong>${esc(p.name)}</strong><span>${esc(lineDesc(l))}</span>
          <div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="Togli uno">−</button><output>${l.qty}</output><button type="button" data-q="${i}" data-d="1" aria-label="Aggiungi uno">+</button></div>
        </div>
        <div class="line__price">${eur(p.price * l.qty)}</div>
      </li>`;
    }).join('');
  }
  $('#t-sub').textContent = eur(sub);
  $('#t-ship').textContent = cart.length ? eur(ship) : '—';
  $('#t-ship-note').textContent = !cart.length ? '' : onlySmall ? 'In busta: solo adesivi, spille, calamite e patch.' : 'Spedizione con corriere.';
  $('#t-tot').textContent = eur(tot);
  $('#checkout').hidden = !cart.length;
}
$('#cart-lines').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const l = cart[+b.dataset.q]; l.qty += +b.dataset.d;
  if (l.qty <= 0) cart.splice(+b.dataset.q, 1);
  save(); renderCart();
});
const openCart = () => { $('#done').hidden = true; $('#checkout-form').hidden = false; renderCart(); drawer.showModal(); };
$('#cart-btn').addEventListener('click', openCart);
$('#cart-close').addEventListener('click', () => drawer.close());
drawer.addEventListener('click', e => { if (e.target === drawer) drawer.close(); });

/* ---------- ordine ---------- */
function orderText(code, f) {
  const { sub, ship, tot } = totals();
  const rows = cart.map(l => {
    const p = byId(l.id);
    return `- ${l.qty} × ${p.name}${lineDesc(l) ? ` (${lineDesc(l)})` : ''}: ${eur(p.price * l.qty)}`;
  }).join('\n');
  return `ORDINE ${code}\n\n${rows}\n\nSubtotale: ${eur(sub)}\nSpedizione: ${eur(ship)}\nTOTALE: ${eur(tot)}\n\n` +
    `Nome: ${f.nome}\nIndirizzo: ${f.indirizzo}\nTelefono: ${f.telefono}\nEmail: ${f.email}\n` +
    (f.note ? `Note: ${f.note}\n` : '') + `\nPagamento: PayPal.me/${PAYPAL_ME}`;
}
/* carrello PayPal: ogni riga con taglia e personalizzazioni, spedizione, codice ordine e recapiti */
function paypalCart(code, f) {
  const { ship } = totals();
  const q = new URLSearchParams({ cmd: '_cart', upload: '1', business: PAYPAL_BUSINESS, currency_code: 'EUR', lc: 'IT',
    charset: 'utf-8', no_shipping: '2', no_note: '0', invoice: code,
    custom: [code, f.nome, f.telefono, f.email].join(' | ').slice(0, 255), return: SITE_URL, cancel_return: SITE_URL });
  cart.forEach((l, i) => {
    const p = byId(l.id), n = i + 1, d = lineDesc(l);
    q.set('item_name_' + n, (p.name + (d ? ` (${d})` : '')).slice(0, 127));
    q.set('amount_' + n, p.price.toFixed(2));
    q.set('quantity_' + n, String(l.qty));
    q.set('shipping_' + n, n === 1 ? ship.toFixed(2) : '0.00');
  });
  return 'https://www.paypal.com/cgi-bin/webscr?' + q.toString();
}
let lastMail = '';
$('#checkout-form').addEventListener('submit', e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target).entries());
  const code = 'EDT-' + Date.now().toString(36).slice(-5).toUpperCase();
  const { tot } = totals();
  const body = orderText(code, f);
  lastMail = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('Ordine shop ' + code)}&body=${encodeURIComponent(body)}`;
  $('#done-code').textContent = code;
  document.querySelectorAll('.done-tot').forEach(n => n.textContent = eur(tot));
  $('#done-pay').href = `https://paypal.me/${PAYPAL_ME}/${tot.toFixed(2)}EUR`;
  $('#done-uno').hidden = !PAYPAL_BUSINESS;
  $('#done-due').hidden = !!PAYPAL_BUSINESS;
  if (PAYPAL_BUSINESS) $('#done-pay1').href = paypalCart(code, f);
  $('#done-mail').href = lastMail;
  $('#done-text').value = body;
  e.target.hidden = true;
  $('#done').hidden = false;
  $('#done').scrollIntoView({ block: 'start' });
});
$('#done-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#done-text').value); toast('Riepilogo copiato'); }
  catch (err) { $('#done-text').select(); }
});
$('#done-new').addEventListener('click', () => { cart = []; save(); renderCart(); drawer.close(); toast('Grazie! Ti scriviamo appena spediamo.'); });

/* ---------- varie ---------- */
let tt;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(tt); tt = setTimeout(() => (t.hidden = true), 2600);
}
$('#chips').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  activeCat = b.dataset.cat; renderChips(); renderGrid();
  const g = $('#grid'), top = g.getBoundingClientRect().top;
  if (top < 0) scrollTo({ top: scrollY + top - 130 });
});
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]'); if (o) openProduct(o.dataset.open);
});
$('#menu-btn').addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  $('#menu-btn').setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
  document.body.classList.remove('nav-open'); $('#menu-btn').setAttribute('aria-expanded', 'false');
}));

/* la foto del prodotto vola nel carrello, che risponde con un colpo */
function flyToCart(src, from) {
  const btn = $('#cart-btn');
  const bump = () => { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); };
  if (!src || !from || !btn.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return bump();
  const to = btn.getBoundingClientRect();
  const w = Math.min(from.width, 220), h = w * 1.25;
  const x0 = from.left + from.width / 2 - w / 2, y0 = from.top + Math.min(from.height, innerHeight) / 2 - h / 2;
  const im = document.createElement('img');
  im.src = src; im.alt = ''; im.className = 'fly';
  im.style.cssText = `left:${x0}px;top:${Math.max(0, y0)}px;width:${w}px;height:${h}px`;
  document.body.appendChild(im);
  const dx = to.left + to.width / 2 - (x0 + w / 2), dy = to.top + to.height / 2 - (Math.max(0, y0) + h / 2);
  im.animate([
    { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate(${dx * .5}px,${dy * .5 - 70}px) scale(.55) rotate(-14deg)`, opacity: 1, offset: .55 },
    { transform: `translate(${dx}px,${dy}px) scale(.08) rotate(20deg)`, opacity: .5 },
  ], { duration: 650, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { im.remove(); bump(); };
}

renderChips(); renderVetrina(); renderGrid(); renderCart();

/* header pieno quando si scorre */
const topBar = $('.top');
const onScroll = () => topBar.classList.toggle('solid', scrollY > 60);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- effetti: comparsa allo scroll, contatori, traccia gomma, fango ---------- */
(() => {
  const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  // comparsa: controllo diretto delle posizioni (funziona anche dentro anteprime e iframe)
  const check = () => {
    const vh = innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.rv:not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * .94 && r.bottom > 0) {
        el.classList.add('in');
        const n = el.querySelector('[data-count]'); if (n) count(n);
      }
    });
  };
  window.revealAll = () => requestAnimationFrame(check);
  addEventListener('scroll', () => requestAnimationFrame(check), { passive: true, capture: true });
  addEventListener('resize', check);
  setInterval(check, 400);
  if (!motionOk) document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
  revealAll();
  function count(el) {
    if (!motionOk) return;
    const to = +el.dataset.count, from = to - 60, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const bar = document.querySelector('.trackbar i'), root = document.documentElement;
  let ticking = false;
  const upd = () => {
    const h = root.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    root.style.setProperty('--sy', Math.min(scrollY, 1200));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true, capture: true });
  upd();
  // galleria a nastro infinito
  const run = document.getElementById('gal-run');
  if (run) run.innerHTML += run.innerHTML.replace(/<img /g, '<img aria-hidden="true" ');
  // schizzo di fango sui bottoni gialli
  if (motionOk) document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn--beer, .cart-btn'); if (!b) return;
    const s = document.createElement('i');
    s.className = 'mudpop'; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
    s.style.setProperty('--r', Math.round(Math.random() * 360) + 'deg');
    document.body.appendChild(s); setTimeout(() => s.remove(), 700);
  });
})();

/* figurine: se esiste la foto del pilota la mostra, altrimenti resta la mascotte */
document.querySelectorAll('.fig__pic[data-foto]').forEach(box => {
  const im = new Image();
  im.onload = () => { im.alt = ''; im.className = 'fig__img'; box.prepend(im); box.classList.add('has'); };
  im.src = box.dataset.foto;
});

/* video di apertura: compare solo quando è davvero pronto a partire */
(() => {
  const v = document.querySelector('.hero__vid'); if (!v) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.remove(); return; }
  v.addEventListener('playing', () => v.classList.add('on'), { once: true });
  v.querySelector('source').addEventListener('error', () => v.remove());
})();

/* ---------- grafica v5: intro, percorso, frasi, 3D, GoPro ---------- */
(() => {
  const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  // intro solo alla prima visita della sessione
  const intro = document.getElementById('intro');
  if (intro) {
    let seen = false;
    try { seen = sessionStorage.getItem('edt-intro') === '1'; sessionStorage.setItem('edt-intro', '1'); } catch (e) {}
    if (seen || !motionOk) intro.classList.add('skip');
    setTimeout(() => intro.remove(), 1700);
  }
  // percorso GPS e frasi giganti legate allo scroll
  const route = document.getElementById('route');
  const shouts = [...document.querySelectorAll('.shout')];
  const tick = () => {
    const vh = innerHeight;
    if (route) {
      const r = route.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * .8 - r.top) / r.height));
      route.style.setProperty('--rp', (p * 100).toFixed(1) + '%');
    }
    shouts.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      s.style.setProperty('--sx', ((vh - r.top) * .45).toFixed(0));
    });
  };
  let q = false;
  const onS = () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; tick(); }); } };
  addEventListener('scroll', onS, { passive: true, capture: true });
  addEventListener('resize', onS);
  setInterval(tick, 500); tick();
  // effetto 3D sulle schede prodotto
  if (motionOk && matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', e => {
      const b = e.target.closest && e.target.closest('.card__hit'); if (!b) return;
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      b.style.setProperty('--ry', (x * 14).toFixed(1) + 'deg');
      b.style.setProperty('--rx', (-y * 12).toFixed(1) + 'deg');
    });
  }
  // GoPro: orologio che scorre e anteprima a fotogrammi al passaggio
  const t0 = Date.now();
  const pad = n => String(n).padStart(2, '0');
  setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000) + 754;
    const txt = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
    document.querySelectorAll('.gp__t').forEach(t => t.textContent = txt);
  }, 1000);
  document.querySelectorAll('.gp[data-frames]').forEach(gp => {
    const id = gp.dataset.frames, img = gp.previousElementSibling, link = gp.closest('a');
    if (!img || !link) return;
    const orig = img.src; let timer = null, k = 0;
    const frames = [1, 2, 3].map(n => `img/v/f/${id}_${n}.jpg`);
    link.addEventListener('pointerenter', () => {
      frames.forEach(f => { const i = new Image(); i.src = f; });
      timer = setInterval(() => { img.src = frames[k++ % 3]; }, 650);
    });
    link.addEventListener('pointerleave', () => { clearInterval(timer); img.src = orig; k = 0; });
  });
})();

/* ---------- grafica v6: polvere, velocità, frasi in corsa ---------- */
(() => {
  const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // frasi giganti: abbastanza testo da riempire anche gli schermi larghi
  document.querySelectorAll('.shout p').forEach(p => { p.textContent = (p.textContent.trim() + ' ').repeat(3); });

  if (!motionOk) return;

  // la pagina "sente" la velocità dello scroll: frasi e nastri si piegano
  let lastY = scrollY, vel = 0, live = false;
  const loop = () => {
    const y = scrollY, d = y - lastY; lastY = y;
    vel += (Math.max(-60, Math.min(60, d)) / 60 - vel) * .18;
    if (Math.abs(vel) < .002) { vel = 0; live = false; }
    root.style.setProperty('--vel', vel.toFixed(3));
    if (live) requestAnimationFrame(loop);
  };
  addEventListener('scroll', () => { if (!live) { live = true; lastY = scrollY; requestAnimationFrame(loop); } }, { passive: true, capture: true });

  // polvere e scintille controluce sull'apertura
  const c = document.querySelector('.hero__dust');
  if (c && c.getContext) {
    const ctx = c.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, ps = [], on = false, mx = 0;
    const size = () => { const r = c.getBoundingClientRect(); w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const mk = start => ({ x: Math.random() * w, y: start ? Math.random() * h : h + 8, r: .6 + Math.random() * 2.4, vx: .15 + Math.random() * .8, vy: -(.12 + Math.random() * .55), a: .15 + Math.random() * .5, ph: Math.random() * 6.28 });
    const draw = t => {
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx + mx * .7; p.y += p.vy + Math.sin(t / 900 + p.ph) * .18;
        if (p.y < -10 || p.x > w + 10 || p.x < -10) Object.assign(p, mk(false));
        ctx.globalAlpha = p.a * (.6 + .4 * Math.sin(t / 700 + p.ph));
        ctx.fillStyle = p.r > 2.1 ? '#f7b500' : '#ecd3ad';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    const wake = () => {
      const vis = scrollY < h && !document.hidden;
      if (vis && !on) { on = true; requestAnimationFrame(draw); } else if (!vis) on = false;
    };
    size(); ps = Array.from({ length: w < 700 ? 45 : 90 }, () => mk(true));
    addEventListener('resize', size);
    addEventListener('scroll', wake, { passive: true, capture: true });
    document.addEventListener('visibilitychange', wake);
    addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5) * 2; }, { passive: true });
    wake();
  }
})();

/* ---------- video verticali: partono da soli senza audio quando entrano in vista, un tocco per sentirli ---------- */
(() => {
  const vids = [...document.querySelectorAll('.spot__vid video')];
  const lite = (navigator.connection && navigator.connection.saveData) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let loud = null;
  const muto = (v, box) => {
    if (lite || loud) return;
    v.muted = true; v.loop = true; v.controls = false;
    const p = v.play(); if (p && p.then) p.then(() => box.classList.add('auto')).catch(() => {});
  };
  const zitto = (v, box) => { loud = null; v.controls = false; box.classList.remove('on'); };
  vids.forEach(v => {
    const box = v.parentElement, btn = box.querySelector('.spot__play');
    btn.addEventListener('click', () => {
      vids.forEach(o => { if (o !== v) { o.pause(); o.parentElement.classList.remove('auto', 'on'); o.controls = false; } });
      loud = v; v.muted = false; v.loop = false; v.currentTime = 0; v.controls = true;
      box.classList.remove('auto'); box.classList.add('on');
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    });
    v.addEventListener('ended', () => { if (loud === v) { zitto(v, box); if (box.dataset.vis) muto(v, box); } });
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target, box = v.parentElement;
      if (e.isIntersecting) { box.dataset.vis = '1'; if (loud !== v) muto(v, box); }
      else { delete box.dataset.vis; v.pause(); if (loud === v) zitto(v, box); box.classList.remove('auto'); }
    }), { threshold: .6 });
    vids.forEach(v => io.observe(v));
  }
})();

/* ---------- barra "Vai allo shop" su telefono: compare dopo l'apertura, sparisce dentro lo shop e in fondo ---------- */
(() => {
  const fab = document.getElementById('gofab'); if (!fab || !('IntersectionObserver' in window)) return;
  const viste = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? viste.add(e.target) : viste.delete(e.target));
    fab.hidden = viste.size > 0;
  }, { threshold: 0 });
  ['.hero', '#shop', '#contatti'].forEach(q => { const el = document.querySelector(q); if (el) io.observe(el); });
})();

/* ---------- galleria: tocca una foto per vederla grande ---------- */
(() => {
  const z = document.getElementById('zoom'); if (!z || !z.showModal) return;
  const im = document.getElementById('zoom-img');
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-zoom]'); if (!b) return;
    im.src = b.dataset.zoom; im.alt = b.querySelector('img').alt; z.showModal();
  });
  z.addEventListener('click', () => z.close());
})();
