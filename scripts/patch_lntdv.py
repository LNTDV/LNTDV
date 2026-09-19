from pathlib import Path
import re

# LNTDV MODULAR PERFORMANCE MODULES 2026-09-19

p=Path("index.html")
s=p.read_text(encoding="utf-8")

# Rimuove ogni riferimento alla vecchia scadenza del 15 ottobre dal catalogo e dalla conferma.
s = re.sub(r'<div class="collection-notice"[^>]*>[\\s\\S]*?</div>', '', s, flags=re.I)
s = re.sub(r'IL BONIFICO DEVE ESSERE EFFETTUATO ENTRO IL 15 OTTOBRE 2026\\\\n\\\\n', '', s, flags=re.I)

# Rimuove i metodi di pagamento non utilizzati dal checkout LNTDV.
# Il flusso attivo usa il metodo Carta e la conferma server-side dell'ordine.
s = re.sub(r"<label[^>]*>\s*<input[^>]*value=[\"'](?:Apple Pay|Google Pay)[\"'][\s\S]*?</label>", "", s, flags=re.I)
s = re.sub(r'<option[^>]*>\s*(?:Apple Pay|Google Pay)\s*</option>', '', s, flags=re.I)

# Remove legacy inline checkout/tracking implementations.
# The external order-system.js + tracking.js are the single runtime engines.
s = re.sub(
    r'<script>\s*\(function\(\)\{\s*const prices=\{\s*"Stampa fotografica":40,[\s\S]*?</script>\s*(?=<script>document\.addEventListener\(\'contextmenu\')',
    '',
    s,
    count=1,
    flags=re.I,
)
s = re.sub(
    r'<section class="tracking-section" id="tracking">[\s\S]*?</section>\s*<script id="lntdv-final-functions-script">[\s\S]*?</script>\s*',
    '',
    s,
    count=1,
    flags=re.I,
)


# Il mio ordine: fisso in basso a destra, anche su smartphone
s=s.replace('.order-bar{position:fixed;left:22px;right:auto;', '.order-bar{position:fixed;right:22px;left:auto;', 1)
s=s.replace('.order-bar{position:fixed;right:22px;left:auto;', '.order-bar{position:fixed;right:22px;left:auto;', 1)

# Normalizza la sezione Consegna: una sola sezione, senza duplicati.
s = re.sub(r'<section class="checkout-block">\\s*<div class="checkout-section-title">Consegna</div>[\\s\\S]*?<input type="radio" name="deliveryType" value="Spedizione"[\\s\\S]*?</section>\\s*', '', s, flags=re.I)
# Ritiro / spedizione
if 'name="deliveryType"' not in s:
    needle='''      <section class="checkout-block">
        <div class="checkout-section-title">Pagamento</div>'''
    delivery='''      <section class="checkout-block">
        <div class="checkout-section-title">Consegna</div>
        <div class="delivery-choice">
          <label class="delivery-option">
            <input type="radio" name="deliveryType" value="Ritiro" checked>
            <span><strong>Ritiro gratuito</strong><small>Da concordare a Milano</small></span>
          </label>
          <label class="delivery-option">
            <input type="radio" name="deliveryType" value="Spedizione">
            <span><strong>Spedizione</strong><small>€10,00</small></span>
          </label>
        </div>
        <div id="deliveryStatus" class="payment-status">Ritiro selezionato.</div>
      </section>

      <section class="checkout-block">
        <div class="checkout-section-title">Pagamento</div>'''
    s=s.replace(needle,delivery,1)

# Tracking
if 'id="trackingSection"' not in s:
    tracking='''<section id="trackingSection" class="tracking-section" aria-labelledby="trackingTitle">
  <div class="tracking-intro">
    <div class="section-label">TRACCIABILITÀ ORDINE</div>
    <h2 id="trackingTitle">Segui il tuo ordine</h2>
    <p>Inserisci l'ID ordine e il token personale ricevuti via email. Il collegamento dell'email può aprire automaticamente questa sezione.</p>
  </div>
  <div class="tracking-form">
    <label><span>ID ordine</span><input id="trackingOrderId" type="text" autocomplete="off" placeholder="LNTDV-..."></label>
    <label><span>Token personale</span><input id="trackingToken" type="text" autocomplete="off" placeholder="TOKEN PERSONALE"></label>
    <button id="trackingButton" type="button">VERIFICA ORDINE →</button>
  </div>
  <div id="trackingMessage" class="tracking-message" role="status"></div>
  <div id="trackingResult" class="tracking-result" hidden>
    <div class="tracking-order-head"><strong id="trackingResultId"></strong><span id="trackingResultLabel"></span></div>
    <div class="tracking-steps">
      <div class="tracking-step" data-state="RICEVUTO"><span>1</span><strong>Ricevuto</strong></div>
      <div class="tracking-step" data-state="IN_LAVORAZIONE"><span>2</span><strong>In lavorazione</strong></div>
      <div class="tracking-step" data-state="PRONTO_AL_RITIRO"><span>3</span><strong>Pronto al ritiro</strong></div>
      <div class="tracking-step" data-state="CONSEGNATO"><span>4</span><strong>Consegnato</strong></div>
    </div>
    <div class="tracking-total">Totale ordine: <strong id="trackingTotal">€0,00</strong></div>
  </div>
</section>

'''
    s=s.replace("<footer>",tracking+"<footer>",1)

# Modular checkout/tracking assets: no inline phase CSS/JS.
if 'assets/css/tracking.css' not in s:
    s=s.replace("</head>",'<link rel="stylesheet" href="./assets/css/tracking.css?v=20260919">\n</head>',1)
if 'assets/css/checkout.css' not in s:
    s=s.replace("</head>",'<link rel="stylesheet" href="./assets/css/checkout.css?v=20260919">\n</head>',1)

# Il carrello unico resta nell'engine esterno order-system.js.
# Il tracking resta nel modulo esterno tracking.js.
if 'assets/js/tracking.js' not in s:
    s=s.replace("</body>",'<script src="./assets/js/tracking.js?v=20260919" defer></script>\n</body>',1)
if 'assets/js/checkout.js' not in s:
    s=s.replace("</body>",'<script src="./assets/js/checkout.js?v=20260919" defer></script>\n</body>',1)

# Delivery value into payload when the legacy payload exists.
s=s.replace('''      total:total,
      deliveryType:"Ritiro gratuito presso Milano"
    };''','''      total:total,
      deliveryType:(document.querySelector('input[name="deliveryType"]:checked')||{}).value || "Ritiro"
    };''',1)

# Rimuove definitivamente la vecchia regola che ruotava le foto verticali di 90°.
s=re.sub(r'\\.card\\.photo-vertical>img\\s*\\{[^}]*transform\\s*:\\s*rotate\\([^}]*\\)[^}]*\\}', '', s, flags=re.I)

# Mantiene un solo elemento di stato consegna: ID duplicati rompono querySelector/getElementById su alcuni flussi.
delivery_seen=0
def _unique_delivery_id(m):
    global delivery_seen
    tag=m.group(0)
    delivery_seen += 1
    if delivery_seen==1:
        return tag
    return re.sub(r'\s+id=["\\\']deliveryStatus["\\\']', '', tag, count=1, flags=re.I)
s=re.sub(r'<div\\b[^>]*\\bid=["\\\']deliveryStatus["\\\'][^>]*>', _unique_delivery_id, s, flags=re.I)

# Ultimo override: append the final rendering rules after all earlier catalog CSS.
# Remove all filters/veils from catalog photographs and preserve their native orientation.
s += """
<style id="lntdv-photo-final-clean">
.catalog img,.card img,.pic img,img[id^="photo-"]{
  filter:none!important;-webkit-filter:none!important;opacity:1!important;
  mix-blend-mode:normal!important;background:transparent!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  width:100%!important;height:auto!important;aspect-ratio:auto!important;
  object-fit:contain!important;object-position:center!important;
  image-orientation:from-image!important;
  display:block!important;transform:none!important;
}
.catalog .pic::before,.catalog .pic::after,.card .pic::before,.card .pic::after{
  content:none!important;display:none!important;opacity:0!important;
  background:transparent!important;background-image:none!important;
  box-shadow:none!important;backdrop-filter:none!important;
}
.card:hover img,.photo-card:hover img,.pic:hover img,.catalog img:hover{
  transform:none!important;filter:none!important;-webkit-filter:none!important;
}
</style>
"""

# Load exactly one external order engine after the generated catalog.
# Deduplica gli asset dell'ordine prima di inserirli: Safari/iOS non deve eseguire il motore due volte.
s = re.sub(r'<link id="lntdv-external-order-css"[^>]*>\\s*', '', s, flags=re.I)
s = re.sub(r'<script id="lntdv-external-order-system"[^>]*></script>\\s*', '', s, flags=re.I)
assets='''<link id="lntdv-external-order-css" rel="stylesheet" href="./order-system.css?v=20260919i">
<script id="lntdv-external-order-system" src="./order-system.js?v=20260919g"></script>'''
if '</body>' not in s:
    raise SystemExit("index.html senza </body>")
s=s.replace('</body>', assets+'</body>', 1)

# FINAL CATALOG RENDERING FIX 2026-09-19
# Appended last so it overrides older catalog rules.
s += """\n
<style id="lntdv-photo-and-format-final-20260919">
.card img,.photo-card img,.photo-image img{
  opacity:1!important;filter:none!important;-webkit-filter:none!important;
  mix-blend-mode:normal!important;background:transparent!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  width:100%!important;height:auto!important;aspect-ratio:auto!important;
  object-fit:contain!important;object-position:center!important;display:block!important;
  transform:none!important;
}
.card:hover img,.photo-card:hover img,.photo-image img{
  transform:none!important;filter:none!important;-webkit-filter:none!important;
}
.card::before,.card::after,.photo-card::before,.photo-card::after,
.photo-image::before,.photo-image::after,.photo-wrap::before,.photo-wrap::after{
  content:none!important;display:none!important;opacity:0!important;
  background:transparent!important;background-image:none!important;
  box-shadow:none!important;backdrop-filter:none!important;
}
.print-choice{
  position:relative!important;z-index:6!important;display:block!important;
  width:100%!important;margin:0 0 3px!important;padding:10px 11px!important;
  box-sizing:border-box!important;overflow:visible!important;
  background:#fcfaf7!important;border:1px solid #d8c6b4!important;
  border-radius:11px!important;
}
.print-choice label{display:block!important;width:100%!important;margin:0 0 7px!important;}
.format-select{
  position:relative!important;z-index:7!important;display:block!important;
  width:100%!important;min-width:0!important;min-height:48px!important;
  height:auto!important;box-sizing:border-box!important;
  padding:11px 12px!important;margin:0!important;
  border:1px solid #b99a7d!important;border-radius:10px!important;
  background:#fffaf3!important;color:#4b3022!important;opacity:1!important;
  font:15px/1.25 Arial,sans-serif!important;white-space:normal!important;
  overflow:visible!important;appearance:auto!important;-webkit-appearance:auto!important;
  transform:none!important;
}
.format-select:focus{
  outline:none!important;border-color:#5a3b2b!important;
  box-shadow:0 0 0 3px rgba(90,59,43,.12)!important;
}
.format-select option{background:#fffaf3!important;color:#3d281d!important;}
.meta{position:relative!important;z-index:5!important;overflow:visible!important;}
@media(max-width:700px){
  .print-choice{padding:10px!important;}
  .format-select{min-height:48px!important;font-size:16px!important;padding:11px 12px!important;}
}
</style>
"""

# FINAL STATIC CATALOG OVERRIDE 2026-09-19
# Disable scroll-driven reveal effects on the catalog cards. They change the
# opacity/transform of the whole card while scrolling and can make later
# photographs and their format selectors look washed out on mobile browsers.
s += """
<style id="lntdv-static-catalog-rendering-20260919">
section.catalog, section.grid, .grid,
.card, .photo-card, .photo-wrap, .photo-image, .meta, .print-choice,
.format-select, .card img, .photo-card img, .photo-image img{
  animation:none!important;
  animation-timeline:none!important;
  animation-range:none!important;
  opacity:1!important;
  visibility:visible!important;
  transform:none!important;
}
.card, .photo-card, .photo-wrap, .photo-image{
  filter:none!important;
  -webkit-filter:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  mix-blend-mode:normal!important;
  background-image:none!important;
}
.card::before,.card::after,
.photo-card::before,.photo-card::after,
.photo-wrap::before,.photo-wrap::after,
.photo-image::before,.photo-image::after,
.meta::before,.meta::after,
.print-choice::before,.print-choice::after{
  content:none!important;
  display:none!important;
  opacity:0!important;
  visibility:hidden!important;
  background:none!important;
  background-image:none!important;
  filter:none!important;
  backdrop-filter:none!important;
  box-shadow:none!important;
  pointer-events:none!important;
}
.card img,.photo-card img,.photo-wrap img,.photo-image img,
img[alt^="LNTDV-"]{
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  -webkit-filter:none!important;
  mix-blend-mode:normal!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  background:transparent!important;
  background-image:none!important;
  width:100%!important;
  height:auto!important;
  aspect-ratio:auto!important;
  object-fit:contain!important;
  object-position:center!important;
  transform:none!important;
  display:block!important;
}
.print-choice{
  position:relative!important;
  z-index:20!important;
  display:block!important;
  visibility:visible!important;
  opacity:1!important;
  overflow:visible!important;
}
.print-choice label{
  display:block!important;
  visibility:visible!important;
  opacity:1!important;
}
.format-select{
  position:relative!important;
  z-index:21!important;
  display:block!important;
  visibility:visible!important;
  opacity:1!important;
  width:100%!important;
  min-width:0!important;
  min-height:48px!important;
  height:48px!important;
  box-sizing:border-box!important;
  appearance:auto!important;
  -webkit-appearance:auto!important;
  background:#fffaf3!important;
  background-image:none!important;
  color:#4b3022!important;
  border:1px solid #b99a7d!important;
  border-radius:10px!important;
  padding:11px 12px!important;
  overflow:visible!important;
}
.meta{
  position:relative!important;
  z-index:10!important;
  overflow:visible!important;
  opacity:1!important;
  visibility:visible!important;
}
</style>
"""



# FINAL PHOTO CODE / ORIENTATION LABEL STYLE 2026-09-19
# High-visibility brown labels for LNTDV-001..025, responsive on every platform.
s += """
<style id="lntdv-photo-code-label-final-20260919">
.grid .card .meta>strong{
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:9px 0 0!important;
  padding:9px 12px!important;
  background:#4b2f22!important;
  color:#fffaf3!important;
  border:2px solid #6b4734!important;
  border-radius:8px 8px 0 0!important;
  font:800 15px/1.2 Arial,sans-serif!important;
  letter-spacing:1.35px!important;
  text-align:left!important;
  text-shadow:none!important;
  box-shadow:0 2px 8px rgba(75,47,34,.10)!important;
}
.grid .card .meta>small{
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:0!important;
  padding:7px 12px 9px!important;
  background:#efe4d0!important;
  color:#4b2f22!important;
  border:2px solid #6b4734!important;
  border-top:0!important;
  border-radius:0 0 8px 8px!important;
  font:700 12px/1.35 Arial,sans-serif!important;
  letter-spacing:.25px!important;
  text-align:left!important;
}
.grid .card .meta>span{
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:0!important;
  padding:5px 12px!important;
  background:#f4eadf!important;
  color:#5a3b2b!important;
  border-left:2px solid #6b4734!important;
  border-right:2px solid #6b4734!important;
  font:600 11px/1.25 Arial,sans-serif!important;
  letter-spacing:.35px!important;
}
@media(max-width:700px){
  .grid .card .meta>strong{
    font-size:16px!important;
    padding:10px 12px!important;
    letter-spacing:1.4px!important;
  }
  .grid .card .meta>span{
    font-size:11px!important;
    padding:5px 12px!important;
  }
  .grid .card .meta>small{
    font-size:13px!important;
    padding:8px 12px 10px!important;
  }
}
</style>
"""

# FINAL PHOTO ORIENTATION OVERRIDE 2026-09-19
# Preserve the catalog sequence exactly as authored in catalog/part-01..14.
# Only the requested orientation is applied to each photo.
orientation_css = r'''
<style id="lntdv-photo-orientation-final-20260919">
/* Orientamento deterministico: nessuna rotazione CSS. L'orientamento reale della foto viene preservato. */
.card:has(img[data-orientation="vertical"]) .photo-wrap,
.card:has(img[data-orientation="horizontal"]) .photo-wrap{
  overflow:hidden!important;
}
.card img[data-orientation="vertical"],
.card img[data-orientation="horizontal"]{
  width:100%!important;
  height:auto!important;
  object-fit:contain!important;
  object-position:center center!important;
  image-orientation:from-image!important;
  transform:none!important;
  rotate:0deg!important;
  transform-origin:center center!important;
  filter:none!important;
  opacity:1!important;
}
</style>
'''
s += "\n" + orientation_css
# Performance: make image decoding non-blocking at build time. First four images stay eager.
img_count=0
def _img_attrs(m):
    global img_count
    tag=m.group(0)
    if re.search(r'\\bloading=',tag,re.I):
        return tag
    i=img_count; img_count+=1
    tag=tag[:-1] + (' loading="eager" fetchpriority="high" decoding="async">' if i==0 else ' loading="eager" decoding="async">' if i<4 else ' loading="lazy" fetchpriority="low" decoding="async">')
    return tag
s=re.sub(r'<img\\b[^>]*>',_img_attrs,s,flags=re.I)

# External modules: CSS and JS are intentionally separate from the catalog markup.
module_css='''<link rel="stylesheet" href="./assets/css/performance.css?v=20260919"><link rel="stylesheet" href="./assets/css/responsive.css?v=20260919">'''
module_js='''<script defer src="./assets/js/performance.js?v=20260919"></script><script defer src="./assets/js/catalog-performance.js?v=20260919"></script>'''
if 'assets/css/performance.css' not in s:
    s=s.replace('</head>',module_css+'</head>',1)
if 'assets/js/performance.js' not in s:
    s=s.replace('</body>',module_js+'</body>',1)

p.write_text(s,encoding="utf-8")
print("Final rendering overrides written:",len(s),"bytes")

# PRINT ORIENTATION HARD FIX 2026-09-19\n# The external CSS now forces natural image dimensions and print-safe orientation.\n