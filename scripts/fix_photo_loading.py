from pathlib import Path
import re

p = Path("index.html")
s = p.read_text(encoding="utf-8")

ORIENTATION = {
    "001": "horizontal", "002": "horizontal", "003": "vertical",
    "004": "horizontal", "005": "horizontal", "006": "vertical",
    "007": "vertical", "008": "vertical", "009": "vertical",
    "010": "horizontal", "011": "vertical", "012": "horizontal",
    "013": "vertical", "014": "vertical", "015": "vertical",
    "016": "vertical", "017": "horizontal", "018": "vertical",
    "019": "horizontal", "020": "horizontal", "021": "horizontal",
    "022": "horizontal", "023": "horizontal", "024": "horizontal",
    "025": "horizontal",
}

def photo_src(code):
    n = str(int(code)).zfill(2)
    return f"./images/natura-{n}.jpg"

def default_choice(code):
    return f'''<div class="print-choice">
<label for="format-{int(code)}">Modalità di stampa</label>
<select id="format-{int(code)}" class="format-select" aria-label="Scegli il formato per questa fotografia">
<option value="">Seleziona formato</option>
<option value="Stampa fotografica">Stampa fotografica — €40</option>
<option value="Forex">Forex — €50</option>
<option value="File digitale in alta risoluzione">Stampa digitale ad alta definizione — €25</option>
</select>
</div>'''

# Rimuove preload e vecchi blocchi Base64: le fotografie pubblicate devono essere JPG reali.
s = re.sub(r'<link[^>]+rel=["\']preload["\'][^>]+photo\d{2}\.js[^>]*>', '', s, flags=re.I)
s = re.sub(
    r'<script[^>]*>\s*window\.LNTDV_PHOTO_\d{2}\s*=\s*["\']data:image/[^"\']*["\']\s*;?\s*</script>',
    '',
    s,
    flags=re.I,
)
s = re.sub(r'window\.LNTDV_PHOTO_\d{2}\s*=\s*["\']data:image/[^"\']*["\']\s*;?', '', s, flags=re.I)

# Elimina qualunque data-URI immagine rimasto nell'HTML prima di ricostruire le schede.
s = re.sub(r'data:image/[^;\s"\']+;base64,[A-Za-z0-9+/=]+', '', s, flags=re.I)

# Elimina le vecchie regole CSS di rotazione automatica.
s = re.sub(r'transform\s*:\s*rotate\([^;}]*(?:;|})', 'transform:none;', s, flags=re.I)

def normalize_card(m):
    block = m.group(0)
    code_m = re.search(r'LNTDV-(\d{3})', block, flags=re.I)
    if not code_m:
        return block
    code = code_m.group(1)
    orientation = ORIENTATION.get(code, "horizontal")

    # Recupera il contenuto utile della scheda prima di sostituirne la struttura.
    strong = f"LNTDV-{code}"
    category = ""
    cat_m = re.search(r'<strong>\s*LNTDV-\d{3}\s*</strong>\s*<span>([\s\S]*?)</span>', block, re.I)
    if cat_m:
        category = cat_m.group(1).strip()

    orient_text = "verticale" if orientation == "vertical" else "orizzontale"

    # Riutilizza il selettore originale quando esiste; altrimenti ne crea uno standard.
    choice_m = re.search(r'<div\b[^>]*class=["\'][^"\']*\bprint-choice\b[^"\']*["\'][\s\S]*?</div>', block, re.I)
    choice = choice_m.group(0) if choice_m else default_choice(code)

    # Normalizza sempre il selettore con un ID univoco e le tre opzioni definitive.
    choice = default_choice(code)

    return f'''<article class="card" data-orientation="{orientation}">
<span class="selection-check" aria-hidden="true">✓</span>
<div class="lntdv-photo-stage" data-photo-orientation="{orientation}">
<img src="{photo_src(code)}" alt="{strong}" data-orientation="{orientation}" loading="{"eager" if int(code) <= 2 else "lazy"}" decoding="async" draggable="false">
</div>
<div class="meta">
{choice}
<strong>{strong}</strong>
<span>{category}</span>
<small>Orientamento: {orient_text}</small>
</div>
</article>'''

# Ricostruzione deterministica di OGNI scheda: foto -> formato -> metadati.
# Questo elimina definitivamente le vecchie schede con foto sopra/sotto il formato,
# tag corrotti, src Base64 e immagini mancanti.
s = re.sub(r'<article\b[\s\S]*?</article>', normalize_card, s, flags=re.I)

# Se una scheda è rimasta fuori dalla regex precedente, riparala per codice.
for code, orientation in ORIENTATION.items():
    if not re.search(r'<img\b[^>]*\balt=["\']LNTDV-' + code + r'["\']', s, re.I):
        marker = re.search(r'LNTDV-' + code + r'\b', s, re.I)
        if not marker:
            raise SystemExit(f"Codice foto mancante: {code}")
        start = s.rfind('<article', 0, marker.start())
        end = s.find('</article>', marker.end())
        if start >= 0 and end >= 0:
            block = s[start:end + len('</article>')]
            m = re.match(r'LNTDV-' + code + r'\b', s[marker.start():], re.I)
            fixed = normalize_card(type("M", (), {"group": lambda self, _=0: block})())
            s = s[:start] + fixed + s[end + len('</article>'):]

# Nessuna rotazione CSS deve essere lasciata nel documento pubblicato.
s = re.sub(r'transform\s*:\s*rotate\([^;}]*(?:;|})', 'transform:none;', s, flags=re.I)

final_css = r'''<style id="lntdv-final-photo-rendering">
/* Catalogo fotografico definitivo: struttura e geometria stabili su Android/iPhone. */
.grid .card{
  display:flex!important;
  flex-direction:column!important;
  align-items:stretch!important;
  min-width:0!important;
  overflow:hidden!important;
}
.lntdv-photo-stage{
  order:1!important;
  width:100%!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  overflow:hidden!important;
  box-sizing:border-box!important;
  margin:0!important;
  background:transparent!important;
}
.lntdv-photo-stage[data-photo-orientation="horizontal"]{aspect-ratio:auto!important;height:auto!important}
.lntdv-photo-stage[data-photo-orientation="vertical"]{aspect-ratio:auto!important;height:auto!important}
.lntdv-photo-stage img{
  display:block!important;
  max-width:100%!important;
  max-height:100%!important;
  object-fit:contain!important;
  object-position:center center!important;
  width:100%!important;
  height:auto!important;
  margin:0 auto!important;
  padding:0!important;
  border:0!important;
  filter:none!important;
  -webkit-filter:none!important;
  opacity:1!important;
  mix-blend-mode:normal!important;
  image-orientation:none!important;
  transition:none!important;
  background:transparent!important;
}
.lntdv-photo-stage[data-photo-orientation="vertical"] img{
  width:auto!important;
  height:auto!important;
  max-width:100%!important;
  max-height:100%!important;
  rotate:0deg!important;
  transform:none!important;
  transform-origin:center center!important;
}
.lntdv-photo-stage[data-photo-orientation="horizontal"] img{transform:none!important}
.grid .card .meta{
  order:2!important;
  width:100%!important;
  min-width:0!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:stretch!important;
  box-sizing:border-box!important;
  position:relative!important;
  z-index:2!important;
  overflow:visible!important;
}
.grid .card .print-choice{
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:0 0 10px!important;
  padding:10px 11px!important;
  position:relative!important;
  z-index:3!important;
  background:#fcfaf7!important;
  border:1px solid #d8c6b4!important;
  border-radius:11px!important;
}
.grid .card .print-choice label{
  display:block!important;
  width:100%!important;
  margin:0 0 7px!important;
}
.grid .card .format-select{
  display:block!important;
  width:100%!important;
  min-width:0!important;
  min-height:48px!important;
  height:48px!important;
  box-sizing:border-box!important;
  padding:11px 12px!important;
  margin:0!important;
  appearance:auto!important;
  -webkit-appearance:auto!important;
  background:#fffaf3!important;
  color:#4b3022!important;
  border:1px solid #b99a7d!important;
  border-radius:10px!important;
  opacity:1!important;
  transform:none!important;
}
.grid .card .format-select option{background:#fffaf3!important;color:#3d281d!important}
@media(max-width:700px){
  .grid{grid-template-columns:1fr!important;gap:18px!important}
  .grid .card{width:100%!important}
  .lntdv-photo-stage[data-photo-orientation="horizontal"]{aspect-ratio:4/3!important}
  .lntdv-photo-stage[data-photo-orientation="vertical"]{aspect-ratio:3/4!important}
  .lntdv-photo-stage img{max-width:100%!important;max-height:100%!important}
  .grid .card .format-select{font-size:16px!important}
}
</style>'''

# Inserimento prima di <style id="lntdv-photo-frame-natural-final-20260919">
s = re.sub(r'<style id="lntdv-final-photo-rendering">[\s\S]*?</style>', '', s, flags=re.I)
if '</head>' not in s.lower():
    raise SystemExit("index.html senza </head>")
s = s.replace('</head>', final_css + '</head>', 1)

p.write_text(s, encoding="utf-8")
print("Catalogo normalizzato definitivamente: 25 schede, JPG canonici, formato sotto ogni foto, orientamento deterministico.")
