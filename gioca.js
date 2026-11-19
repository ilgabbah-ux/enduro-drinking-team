/* Sezione "Gioca": la tabella col tuo nome e il quiz "Che endurista sei?".
   Le immagini si disegnano su un canvas 1080 x 1350 (formato post e storie) e si condividono o si scaricano. */
(() => {
  const W = 1080, H = 1350;
  const SITE = 'https://endurodrinkingteam.com';
  const DISPLAY = "'Bowlby One', 'Arial Black', sans-serif";
  const BODY = "Archivo, Arial, sans-serif";
  const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const assets = Promise.all([load('img/ai/pozza-m.jpg'), load('img/wordmark.png'),
    document.fonts && document.fonts.load ? Promise.all([document.fonts.load("92px 'Bowlby One'"), document.fonts.load('800 30px Archivo')]).catch(() => {}) : null]);

  function sfondo(ctx, bg, wm) {
    ctx.fillStyle = '#0f0d0b'; ctx.fillRect(0, 0, W, H);
    if (bg) { const k = Math.max(W / bg.width, H / bg.height); ctx.drawImage(bg, (W - bg.width * k) / 2, (H - bg.height * k) / 2, bg.width * k, bg.height * k); }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(15,13,11,.82)'); g.addColorStop(.45, 'rgba(15,13,11,.55)'); g.addColorStop(1, 'rgba(15,13,11,.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (wm) { const w = 430, h = w * wm.height / wm.width; ctx.drawImage(wm, (W - w) / 2, 50, w, h); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f7b500'; ctx.font = `400 46px ${DISPLAY}`; ctx.fillText('ENDURODRINKINGTEAM.COM', W / 2, H - 62);
  }
  const adatta = (ctx, txt, font, max, size) => { do { ctx.font = font(size); size -= 2; } while (ctx.measureText(txt).width > max && size > 10); return size + 2; };

  /* ---------- la tabella ---------- */
  const P_OUT = 'M22 12Q100 -2 178 12Q194 15 191 33L176 152Q172 181 143 185Q100 192 57 185Q28 181 24 152L9 33Q6 15 22 12Z';
  const P_IN = 'M26 20Q100 8 174 20Q184 22 182 33L168 150Q165 172 142 176Q100 182 58 176Q35 172 32 150L18 33Q16 22 26 20Z';
  function tabella(ctx, bg, wm, nome, num) {
    sfondo(ctx, bg, wm);
    ctx.fillStyle = '#f4ecdf'; ctx.font = `800 34px ${BODY}`; ctx.fillText('T A B E L L A   U F F I C I A L E', W / 2, 318);
    const k = 3.9, ox = (W - 200 * k) / 2, oy = 372;
    ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26;
    ctx.fillStyle = '#15110d'; ctx.fill(new Path2D(P_OUT));
    ctx.shadowColor = 'transparent';
    const g = ctx.createLinearGradient(0, 0, 0, 196); g.addColorStop(0, '#ffd84a'); g.addColorStop(.55, '#f7b500'); g.addColorStop(1, '#cf8d00');
    ctx.fillStyle = g; ctx.fill(new Path2D(P_IN));
    ctx.save(); ctx.clip(new Path2D(P_IN));
    ctx.fillStyle = '#15110d'; ctx.fill(new Path2D('M0 0H200V52Q100 40 0 52Z'));
    ctx.fillStyle = '#e1140c'; ctx.fill(new Path2D('M0 52Q100 40 200 52V58Q100 46 0 58Z'));
    const s = ctx.createLinearGradient(0, 0, 200, 196); s.addColorStop(0, 'rgba(255,255,255,.5)'); s.addColorStop(.38, 'rgba(255,255,255,0)');
    ctx.fillStyle = s; ctx.fillRect(0, 0, 200, 196);
    ctx.fillStyle = '#5a3d24';
    [[163, 158, 13], [176, 138, 6], [146, 174, 5], [170, 116, 3], [30, 150, 6], [40, 166, 3], [24, 128, 2.5]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); });
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f7b500'; ctx.font = `400 25px ${DISPLAY}`; ctx.fillText('E D T', 100, 40);
    const n = (num || '17').slice(0, 3), big = n.length > 2 ? 66 : 88;
    ctx.save(); ctx.translate(100, n.length > 2 ? 126 : 132); ctx.transform(1, 0, -.14, 1, 0, 0);
    ctx.font = `400 ${big}px ${DISPLAY}`;
    ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.fillText(n, 3, 4);
    ctx.fillStyle = '#15110d'; ctx.fillText(n, 0, 0);
    ctx.restore();
    const t = (nome || 'IL TUO NOME').toUpperCase();
    adatta(ctx, t, z => `400 ${z}px ${DISPLAY}`, 122, 24);
    ctx.fillStyle = '#15110d'; ctx.fillText(t, 97, 166);
    ctx.fillStyle = '#2a2018'; ctx.strokeStyle = '#8a7a66'; ctx.lineWidth = 1.2;
    [[34, 31], [166, 31]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4.2, 0, 7); ctx.fill(); ctx.stroke(); });
    ctx.restore();
    ctx.fillStyle = '#f4ecdf'; ctx.font = `400 50px ${DISPLAY}`; ctx.fillText('Tranquilli, è un giro easy.', W / 2, 1200);
  }

  /* ---------- condividi / scarica ---------- */
  const toBlob = cv => new Promise(res => cv.toBlob(res, 'image/jpeg', .9));
  async function scarica(cv, nome) {
    const b = await toBlob(cv); if (!b) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function condividi(cv, nome, testo) {
    const b = await toBlob(cv);
    const f = b && window.File ? new File([b], nome, { type: 'image/jpeg' }) : null;
    try {
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) return await navigator.share({ files: [f], text: testo + ' ' + SITE });
      if (navigator.share) return await navigator.share({ text: testo, url: SITE });
    } catch (e) { if (e && e.name === 'AbortError') return; }
    /* computer senza condivisione: si scarica l'immagine e si apre WhatsApp col testo */
    await scarica(cv, nome);
    window.open('https://wa.me/?text=' + encodeURIComponent(testo + ' ' + SITE), '_blank', 'noopener');
  }

  const cv = document.getElementById('tab-cv');
  if (cv && cv.getContext) {
    const ctx = cv.getContext('2d'), iN = document.getElementById('tab-nome'), iNum = document.getElementById('tab-num');
    let pronti = null;
    const pulito = () => ({ nome: iN.value.trim().slice(0, 12), num: iNum.value.replace(/\D/g, '').slice(0, 3) });
    const ridisegna = () => { const v = pulito(); tabella(ctx, pronti && pronti[0], pronti && pronti[1], v.nome, v.num); };
    try { const m = JSON.parse(localStorage.getItem('edt-tabella') || 'null'); if (m) { iN.value = m.nome || ''; iNum.value = m.num || ''; } } catch (e) {}
    ridisegna();
    assets.then(a => { pronti = a; ridisegna(); });
    [iN, iNum].forEach(i => i.addEventListener('input', () => {
      if (i === iNum) i.value = i.value.replace(/\D/g, '');
      ridisegna(); try { localStorage.setItem('edt-tabella', JSON.stringify(pulito())); } catch (e) {}
    }));
    const file = () => 'tabella-edt-' + (pulito().nome || 'tua').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.jpg';
    document.getElementById('tab-dl').addEventListener('click', () => scarica(cv, file()));
    document.getElementById('tab-share').addEventListener('click', () => condividi(cv, file(), 'La mia tabella EDT. Fatti la tua:'));
    document.getElementById('tab-maglia').addEventListener('click', () => {
      if (typeof openProduct !== 'function') return;
      openProduct('maglia-gara');
      const v = pulito(), f = document.getElementById('pd-fields'); if (!f) return;
      const a = f.querySelector('[name="nome"]'), b = f.querySelector('[name="numero"]');
      if (a && v.nome) a.value = v.nome.toUpperCase(); if (b && v.num) b.value = v.num;
    });
  }

  /* ---------- il quiz ---------- */
  const TIPI = {
    t: { nome: 'Il Tagliatore', chi: 'come Angelo', txt: 'Se c’è una strada, tu prendi l’altra. Di solito in salita, di solito sbagliata.', pid: 'endurista-semplice', cta: 'La maglia che ti assolve' },
    i: { nome: 'L’Ingroppatore', chi: 'come Purcello', txt: 'Appena uno è in difficoltà gli arrivi alle spalle. Poi, con calma, lo aiuti.', pid: 'fuck-the-gev-2026', cta: 'La maglia per chi ha capito' },
    s: { nome: 'Il Sergente Maggiore', chi: 'come il Gabbah', txt: 'Se passi tu, passano tutti. O almeno questa è la teoria che racconti al bar.', pid: 'maglia-gara', cta: 'La maglia da gara col tuo nome' },
    p: { nome: 'Pausa Panino', chi: 'come Andrea', txt: 'Primo in cima, soprattutto se in cima si mangia. Il giro è una scusa.', pid: 'grembiule', cta: 'Il grembiule Serial Griller' },
  };
  const DOMANDE = [
    ['Il gruppo si ferma davanti a un bivio. Tu:', ['Prendo quello senza tracce', 't'], ['Aspetto di vedere chi si pianta', 'i'], ['Vado avanti io, seguitemi', 's'], ['Chiedo quanto manca al rifugio', 'p']],
    ['Un amico è piantato nel fango fino al mozzo.', ['Lo supero passando dal bosco', 't'], ['Gli arrivo dietro. Molto dietro', 'i'], ['Gli spiego come si faceva', 's'], ['Gli tengo la birra mentre spinge', 'p']],
    ['«Tranquilli, è un giro easy» per te vuol dire:', ['Che conosco una scorciatoia', 't'], ['Che qualcuno si farà male, non io', 'i'], ['Che l’ho deciso io ieri sera', 's'], ['Che a pranzo siamo seduti', 'p']],
    ['Cosa non manca mai nel tuo zaino?', ['Una traccia che non ha provato nessuno', 't'], ['La cinghia per tirare fuori gli altri', 'i'], ['Il telefono per riprendere tutto', 's'], ['Salame, pane e apribottiglie', 'p']],
    ['Fine giro. La moto è:', ['Rimasta in un posto che so solo io', 't'], ['Pulita: il fango l’hanno preso gli altri', 'i'], ['Sporca, ma il video è venuto bene', 's'], ['Parcheggiata davanti alla griglia', 'p']],
  ];
  const corpo = document.getElementById('quiz-body');
  if (corpo) {
    const html0 = corpo.innerHTML; let passo = 0, punti = {}, ultimo = null;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const domanda = () => {
      const d = DOMANDE[passo];
      corpo.innerHTML = `<p class="quiz__n">Domanda ${passo + 1} di ${DOMANDE.length}</p><p class="quiz__q">${esc(d[0])}</p><div class="quiz__a">` +
        d.slice(1).map(a => `<button type="button" data-quiz="${a[1]}">${esc(a[0])}</button>`).join('') + '</div>';
    };
    const esito = () => {
      const k = Object.keys(TIPI).sort((a, b) => (punti[b] || 0) - (punti[a] || 0))[0], t = ultimo = TIPI[k];
      corpo.innerHTML = `<p class="quiz__n">Sei</p><p class="quiz__r">${esc(t.nome)}</p><p class="quiz__chi">${esc(t.chi)}</p><p>${esc(t.txt)}</p>
        <div class="tab__btns"><button class="btn btn--beer" type="button" data-quiz="share">Condividi</button><button class="btn btn--ghost" type="button" data-open="${t.pid}">${esc(t.cta)}</button></div>
        <button class="tab__link" type="button" data-quiz="start">Rifai il quiz</button>`;
    };
    const card = async () => {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), a = await assets, t = ultimo;
      sfondo(x, a[0], a[1]);
      x.fillStyle = '#f4ecdf'; x.font = `800 34px ${BODY}`; x.fillText('C H E   E N D U R I S T A   S E I ?', W / 2, 330);
      x.fillStyle = '#f4ecdf'; x.font = `400 60px ${DISPLAY}`; x.fillText('Sono', W / 2, 520);
      const z = adatta(x, t.nome, s => `400 ${s}px ${DISPLAY}`, W - 120, 150);
      x.fillStyle = '#f7b500'; x.fillText(t.nome, W / 2, 520 + z * 1.05);
      x.fillStyle = '#e1140c'; x.font = `400 44px ${DISPLAY}`; x.fillText(t.chi, W / 2, 520 + z * 1.05 + 90);
      x.fillStyle = '#f4ecdf'; x.font = `600 44px ${BODY}`;
      let riga = '', y = 520 + z * 1.05 + 210;
      t.txt.split(' ').forEach(p => { if (x.measureText(riga + p).width > W - 200) { x.fillText(riga.trim(), W / 2, y); y += 62; riga = ''; } riga += p + ' '; });
      x.fillText(riga.trim(), W / 2, y);
      x.fillStyle = '#f4ecdf'; x.font = `400 44px ${DISPLAY}`; x.fillText('E tu chi sei? Fai il quiz su', W / 2, H - 140);
      return c;
    };
    corpo.addEventListener('click', async e => {
      const b = e.target.closest('[data-quiz]'); if (!b) return;
      const v = b.dataset.quiz;
      if (v === 'start') { passo = 0; punti = {}; return domanda(); }
      if (v === 'share') { const c = await card(); return condividi(c, 'che-endurista-sei.jpg', `Sono «${ultimo.nome}» dell'Enduro Drinking Team. E tu chi sei?`); }
      punti[v] = (punti[v] || 0) + 1; passo++;
      passo < DOMANDE.length ? domanda() : esito();
    });
    corpo.dataset.inizio = html0;
  }
})();
