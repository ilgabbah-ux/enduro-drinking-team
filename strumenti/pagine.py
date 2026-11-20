#!/usr/bin/env python3
"""Rigenera tutto quello che dipende dall'elenco PRODUCTS di app.js:
  - una pagina per prodotto in p/<id>/index.html (con anteprima propria per WhatsApp e Google)
  - le immagini di anteprima 1200x630 in img/og/<id>.jpg
  - l'elenco prodotti per Google dentro index.html (blocco ld-prodotti)
  - sitemap.xml
Uso, dalla cartella del sito:  python3 strumenti/pagine.py
Serve node (per leggere app.js) e Pillow (per le immagini)."""
import json, subprocess, html, re, datetime, pathlib, shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://endurodrinkingteam.com/'
FONT = ROOT / 'strumenti' / 'font'
VER = re.search(r'style\.css\?v=(\d+)', (ROOT / 'index.html').read_text(encoding='utf-8')).group(1)
TODAY = datetime.date.today().isoformat()

src = (ROOT / 'app.js').read_text(encoding='utf-8')
head = src[:src.index('const eur =')]
data = json.loads(subprocess.run(['node', '-e', head + ';console.log(JSON.stringify({P:PRODUCTS,G:GUIDE,FREE:SHIP_FREE_FROM,S:SHIP_SMALL,F:SHIP_FULL}))'],
                                 capture_output=True, text=True, check=True).stdout)
P, GUIDE, FREE = data['P'], data['G'], data['FREE']
CAT = {'gara': 'Da gara', 'wear': 'Da indossare', '4x4': '4x4', 'small': 'Adesivi e piccoli'}
e = lambda s: html.escape(str(s), quote=True)
eur = lambda n: ('%.2f' % n).replace('.', ',') + ' €'
url = lambda p: f"{SITE}p/{p['id']}/"

# ---------- immagini di anteprima ----------
def font(name, size, wght=None):
    f = ImageFont.truetype(str(FONT / name), size)
    if wght:
        try: f.set_variation_by_axes([wght if b'eight' in (x['name'] if isinstance(x['name'], bytes) else x['name'].encode()) else 100 for x in f.get_variation_axes()])
        except Exception: pass
    return f

def cover(im, w, h, pos=(50, 22)):
    r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r + .5), round(im.height * r + .5)), Image.LANCZOS)
    x = round((im.width - w) * pos[0] / 100); y = round((im.height - h) * pos[1] / 100)
    return im.crop((x, y, x + w, y + h))

def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for word in text.split():
        t = (cur + ' ' + word).strip()
        if d.textlength(t, font=f) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = word
    return lines + [cur]

def og(p):
    W, H, PW = 1200, 630, 560
    im = Image.new('RGB', (W, H), (15, 13, 11))
    pos = (50, 50) if p.get('small') else (50, 22)
    if p.get('pos'):
        pos = tuple(int(float(x.strip('%'))) for x in p['pos'].split())
    im.paste(cover(Image.open(ROOT / p['img']).convert('RGB'), PW, H, pos), (0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((PW, 0, PW + 10, H), fill=(247, 181, 0))
    x, maxw = PW + 60, W - PW - 110
    d.text((x, 62), 'SHOP UFFICIALE EDT', font=font('Archivo.ttf', 26, 800), fill=(247, 181, 0))
    size = 76
    while True:
        f = font('BowlbyOne-Regular.ttf', size); lines = wrap(d, p['name'].upper(), f, maxw)
        if (len(lines) <= 4 and max(d.textlength(l, font=f) for l in lines) <= maxw) or size <= 38: break
        size -= 4
    y = 118
    for l in lines:
        d.text((x, y), l, font=f, fill=(244, 236, 223)); y += round(size * 1.12)
    d.text((x, y + 18), eur(p['price']), font=font('BowlbyOne-Regular.ttf', 70), fill=(247, 181, 0))
    logo = Image.open(ROOT / 'img' / 'mascotte.png').convert('RGBA'); logo.thumbnail((110, 110))
    im.paste(logo, (W - 50 - logo.width, H - 44 - logo.height), logo)
    d.text((x, H - 78), 'endurodrinkingteam.com', font=font('Archivo.ttf', 28, 700), fill=(185, 174, 159))
    out = ROOT / 'img' / 'og' / f"{p['id']}.jpg"; out.parent.mkdir(exist_ok=True)
    im.save(out, quality=84, optimize=True, progressive=True)

# ---------- dati per Google ----------
def ld(p):
    return {"@type": "Product", "name": p['name'], "url": url(p), "image": SITE + p['img'], "description": p['note'],
            "brand": {"@type": "Brand", "name": "Enduro Drinking Team"},
            "offers": {"@type": "Offer", "price": '%.2f' % p['price'], "priceCurrency": "EUR",
                       "availability": "https://schema.org/InStock", "url": url(p)}}

# ---------- pagina ----------
def sizes(p):
    g = p.get('guide')
    if not p.get('sizes'): return ''
    if g == 'completo': return 'Maglia dalla %s alla %s, pantalone dalla %s alla %s.' % (GUIDE['maglia']['rows'][0][0], GUIDE['maglia']['rows'][-1][0], GUIDE['pant']['rows'][0][0], GUIDE['pant']['rows'][-1][0])
    rows = GUIDE[g or 'base']['rows']
    return 'Dalla %s alla %s%s.' % (rows[0][0], rows[-1][0], ', modello uomo e donna' if g == 'tee' else '')

def page(p):
    imgs = p.get('imgs') or [p['img']]
    custom = p.get('nome') or p.get('numero')
    ship = ('2 € in busta se ordini solo adesivi e piccoli, 7 € con corriere se c\'è anche un capo' if p.get('small') else '7 € con corriere in tutta Italia')
    if FREE: ship += f'. Gratuita sopra i {FREE} € di spesa'
    li = []
    if p.get('colors'): li.append(('Colori', ', '.join(p['colors']).lower()))
    if sizes(p): li.append(('Taglie', sizes(p) + ' Nella scheda trovi la guida con le misure in centimetri.'))
    if p.get('pick'): li.append(('Come funziona', f"Scegli {p['pick']} adesivi tra quelli da 1 € quando lo aggiungi al carrello."))
    if custom: li.append(('Personalizzazione', 'Con il tuo nome' + (' e il tuo numero' if p.get('numero') else '') + ', stampati apposta per te.'))
    li.append(('Spedizione', ship + '. Spediamo in 3-4 giorni.'))
    li.append(('Pagamento', 'PayPal, con conto o con carta. Non serve registrarsi.'))
    li.append(('Reso', 'Prodotto personalizzato: non si può rendere, salvo difetti.' if custom else 'Entro 14 giorni dalla consegna, se integro e non usato.'))
    altri = [x for x in P if x['cat'] == p['cat'] and x['id'] != p['id']]
    i = next(k for k, x in enumerate([x for x in P if x['cat'] == p['cat']]) if x['id'] == p['id'])
    altri = (altri[i:] + altri[:i])[:4]
    title = f"{p['name']} · {eur(p['price'])} · Enduro Drinking Team"
    desc = f"{p['note']} {eur(p['price'])} sullo shop ufficiale dell'Enduro Drinking Team. Spediamo in 3-4 giorni, paghi con PayPal."
    graph = {"@context": "https://schema.org", "@graph": [ld(p), {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Shop EDT", "item": SITE + '#shop'},
        {"@type": "ListItem", "position": 2, "name": p['name'], "item": url(p)}]}]}
    return f'''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url(p)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Enduro Drinking Team">
<meta property="og:locale" content="it_IT">
<meta property="og:url" content="{url(p)}">
<meta property="og:title" content="{e(p['name'])} · {eur(p['price'])}">
<meta property="og:description" content="{e(p['note'])}">
<meta property="og:image" content="{SITE}img/og/{p['id']}.jpg?v={VER}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(p['name'])}, {eur(p['price'])}">
<meta property="product:price:amount" content="{p['price']:.2f}">
<meta property="product:price:currency" content="EUR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(p['name'])} · {eur(p['price'])}">
<meta name="twitter:description" content="{e(p['note'])}">
<meta name="twitter:image" content="{SITE}img/og/{p['id']}.jpg?v={VER}">
<script type="application/ld+json">{json.dumps(graph, ensure_ascii=False)}</script>
<meta name="theme-color" content="#0f0d0b">
<link rel="icon" href="/img/mascotte.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Bowlby+One&family=Rubik+Dirt&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css?v={VER}">
</head>
<body class="legal-page">
<header class="top">
  <a class="brand" href="/" aria-label="Enduro Drinking Team, torna al sito">
    <img src="/img/mascotte.png" alt="" width="52" height="41">
    <span>Enduro<br>Drinking Team</span>
  </a>
  <a class="legal__back" href="/#shop">Tutto lo shop</a>
</header>
<main>
  <article class="prod wrap">
    <div class="prod__pics">
      {''.join(f'<img src="/{s}" alt="{e(p["name"]) if k == 0 else ""}"{"" if k == 0 else " loading=lazy"}>' for k, s in enumerate(imgs))}
    </div>
    <div>
      <p class="prod__kick"><a href="/#shop">Shop EDT</a> · {CAT[p['cat']]}</p>
      <h1>{e(p['name'])}</h1>
      <p class="prod__price">{eur(p['price'])}</p>
      <p class="prod__note">{e(p['note'])}</p>
      <ul class="prod__list">
        {''.join(f'<li><b>{k}.</b> {e(v)}</li>' for k, v in li)}
      </ul>
      <a class="btn btn--beer" href="/#p={p['id']}">Scegli e ordina</a>
    </div>
  </article>
  <section class="prod__more wrap" aria-labelledby="altri">
    <h2 id="altri">Dalla stessa linea</h2>
    <div class="prod__grid">
      {''.join(f'<a href="/p/{x["id"]}/"><img src="/{x["img"]}" alt="" loading="lazy">{e(x["name"])}<span>{eur(x["price"])}</span></a>' for x in altri)}
    </div>
  </section>
</main>
<footer class="wrap legal__foot">
  <p>Sterrare humanum est. © 2026 Enduro Drinking Team, Torino. <a href="/condizioni.html">Condizioni di vendita</a> · <a href="/privacy.html">Privacy</a></p>
</footer>
<script data-goatcounter="https://endurodrinkingteam.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</body>
</html>
'''

out = ROOT / 'p'
if out.exists(): shutil.rmtree(out)
for p in P:
    d = out / p['id']; d.mkdir(parents=True)
    (d / 'index.html').write_text(page(p), encoding='utf-8')
    og(p)
for f in (ROOT / 'img' / 'og').glob('*.jpg'):
    if f.stem not in {p['id'] for p in P}: f.unlink()

idx = ROOT / 'index.html'; s = idx.read_text(encoding='utf-8')
lst = {"@context": "https://schema.org", "@type": "ItemList", "name": "Shop Enduro Drinking Team",
       "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": ld(p)} for i, p in enumerate(P)]}
s, n = re.subn(r'(<script type="application/ld\+json" id="ld-prodotti">).*?(</script>)', lambda m: m.group(1) + json.dumps(lst, ensure_ascii=False) + m.group(2), s, flags=re.S)
assert n == 1
idx.write_text(s, encoding='utf-8')

urls = [SITE, SITE + 'condizioni.html', SITE + 'privacy.html'] + [url(p) for p in P]
(ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod></url>\n' for u in urls) + '</urlset>\n', encoding='utf-8')
print(len(P), 'prodotti: pagine, anteprime, elenco per Google e sitemap rigenerati')
