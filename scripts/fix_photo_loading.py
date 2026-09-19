from pathlib import Path
import re

p = Path("index.html")
s = p.read_text(encoding="utf-8")

orientation_map = {
    "001":"horizontal","002":"horizontal","003":"vertical","004":"horizontal","005":"horizontal",
    "006":"vertical","007":"vertical","008":"vertical","009":"vertical","010":"horizontal",
    "011":"vertical","012":"horizontal","013":"vertical","014":"vertical","015":"vertical",
    "016":"vertical","017":"horizontal","018":"vertical","019":"horizontal","020":"horizontal",
    "021":"horizontal","022":"horizontal","023":"horizontal","024":"horizontal","025":"horizontal",
}

# Elimina preload massivi e vecchi src Base64: il browser deve caricare veri JPG.
s = re.sub(r'\n?\s*<link[^>]+rel=["\']preload["\'][^>]+photo\d{2}\.js[^>]*>', '', s, flags=re.I)

# Elimina definitivamente le vecchie regole di rotazione automatica e i src Base64.
s = re.sub(r'transform\s*:\s*rotate\([^;}]*(?:\);?)', '', s, flags=re.I)
s = re.sub(r'\s+src=["\']data:image/[^"\']+["\']', '', s, flags=re.I)

# Ogni fotografia usa esclusivamente il proprio JPG, prima per codice alt.
for n in range(1, 26):
    code = f"{n:03d}"
    jpg = f"./images/natura-{n:02d}.jpg"
    pattern = rf'(<img\b[^>]*)(>)'
    def repl(m, code=code, jpg=jpg):
        tag = m.group(1)
        if re.search(rf'\balt=["\']LNTDV-{code}["\']', tag, re.I):
            tag = re.sub(r'\s+src=["\'][^"\']*["\']', '', tag, flags=re.I)
            tag += f' src="{jpg}"'
        return tag + m.group(2)
    s = re.sub(pattern, repl, s)

# Fallback robusto: assegna i JPG in ordine ai primi 25 elementi .card che contengono un img.
# Questo copre le parti storiche in cui l'attributo alt non era coerente.
card_pattern = re.compile(r'(<(?:div|article|section)[^>]*class=["\'][^"\']*\bcard\b[^"\']*["\'][^>]*>.*?<img\b)([^>]*)(>)', re.I | re.S)
card_index = 0
def card_img_fix(m):
    global card_index
    if card_index >= 25:
        return m.group(0)
    card_index += 1
    tag_start, attrs, close = m.group(1), m.group(2), m.group(3)
    attrs = re.sub(r'\s+src=["\'][^"\']*["\']', '', attrs, flags=re.I)
    attrs = re.sub(r'\s+alt=["\'][^"\']*["\']', '', attrs, flags=re.I)
    attrs += f' alt="LNTDV-{card_index:03d}" src="./images/natura-{card_index:02d}.jpg"'
    return tag_start + attrs + close
s = card_pattern.sub(card_img_fix, s)

# Loading: prime due subito, le altre lazy. Decoding asincrono evita blocchi del rendering.
def imgfix(m):
    tag = m.group(0)
    code = re.search(r'alt=["\']LNTDV-(\d{3})["\']', tag, re.I)
    if not code:
        return tag
    n = int(code.group(1))
    tag = re.sub(r'\s+loading=["\'][^"\']*["\']', '', tag, flags=re.I)
    tag = re.sub(r'\s+decoding=["\'][^"\']*["\']', '', tag, flags=re.I)
    tag = re.sub(r'\s+fetchpriority=["\'][^"\']*["\']', '', tag, flags=re.I)
    load = "eager" if n <= 2 else "lazy"
    priority = ' fetchpriority="high"' if n == 1 else ''
    return tag[:-1] + f' loading="{load}" decoding="async"{priority}>'
s = re.sub(r'<img\b[^>]*alt=["\']LNTDV-\d{3}["\'][^>]*>', imgfix, s, flags=re.I)

# Rimuove le vecchie opzioni di pagamento che non fanno parte del flusso definitivo.
s = re.sub(r'<label[^>]*>[^<]*(?:<[^>]+>)*[^<]*(?:Apple Pay|Google Pay)[^<]*(?:</[^>]+>)*</label>', '', s, flags=re.I)

# Una sola regola di orientamento: nessuna rotazione CSS; la foto mantiene la propria geometria.
final_css = """<style id="lntdv-final-photo-rendering">
.card,.photo-card,.photo-wrap,.photo-image{overflow:hidden}
.card img,.photo-card img,.photo-wrap img,.photo-image img,img[alt^="LNTDV-"]{
  width:100%!important;height:auto!important;aspect-ratio:auto!important;
  object-fit:contain!important;object-position:center center!important;
  display:block!important;transform:none!important;filter:none!important;
  -webkit-filter:none!important;opacity:1!important;mix-blend-mode:normal!important;
  background:transparent!important;transition:none!important;
}
.card::before,.card::after,.photo-card::before,.photo-card::after,
.photo-wrap::before,.photo-wrap::after,.photo-image::before,.photo-image::after{
  content:none!important;display:none!important;background:none!important;
  opacity:0!important;box-shadow:none!important;filter:none!important;
}
@media(max-width:700px){
  .card img,.photo-card img,.photo-wrap img,.photo-image img,img[alt^="LNTDV-"]{
    width:100%!important;height:auto!important;object-fit:contain!important;
  }
}
</style>"""
s = re.sub(r'<style id="lntdv-final-photo-rendering">.*?</style>', '', s, flags=re.S | re.I)
if "</head>" not in s:
    raise SystemExit("index.html senza </head>")
s = s.replace("</head>", final_css + "</head>", 1)

p.write_text(s, encoding="utf-8")
print("Foto normalizzate: 25 JPG, nessun Base64, nessuna rotazione CSS.")
