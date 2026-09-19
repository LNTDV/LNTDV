from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")

# Il mio ordine: fisso in basso a destra, anche su smartphone
s=s.replace('.order-bar{position:fixed;left:22px;right:auto;', '.order-bar{position:fixed;right:22px;left:auto;', 1)
s=s.replace('.order-bar{position:fixed;right:22px;left:auto;', '.order-bar{position:fixed;right:22px;left:auto;', 1)

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

css='''<style id="lntdv-order-tracking">
.delivery-choice{display:grid;gap:8px}.delivery-option{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid rgba(91,64,50,.14);border-radius:10px;background:#fff;font:12px Arial,sans-serif;color:#3d281d;cursor:pointer}.delivery-option:has(input:checked){border-color:#3f8f5a;background:#e4efe6}.delivery-option input{accent-color:#3f8f5a}.delivery-option span{display:flex;flex-direction:column;gap:3px}.delivery-option small{font-size:10px;color:#756357}
.tracking-section{max-width:1050px;margin:70px auto 110px;padding:34px 24px;background:#f4eadf;border:1px solid #d8c6b4;border-radius:24px;box-shadow:0 14px 40px rgba(75,47,34,.08)}.tracking-intro{text-align:center;max-width:720px;margin:0 auto 25px}.tracking-intro h2{margin:7px 0 10px;font:400 clamp(28px,5vw,46px) Georgia,serif;color:#4b2f22}.tracking-intro p{margin:0;color:#6b4734;font:13px/1.6 Arial,sans-serif}.tracking-form{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}.tracking-form label{display:flex;flex-direction:column;gap:6px;font:700 10px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#6b4734}.tracking-form input{padding:13px 14px;border:1px solid #d8c6b4;border-radius:11px;background:#fff;color:#4b2f22;font:13px Arial,sans-serif}.tracking-form button{padding:14px 17px;border:0;border-radius:11px;background:#3f8f5a;color:#fff;font:bold 10px Arial,sans-serif;letter-spacing:1px;cursor:pointer}.tracking-message{min-height:20px;margin:14px 0;text-align:center;font:12px Arial,sans-serif;color:#6b4734}.tracking-result{margin-top:15px;padding:20px;background:#fff;border:1px solid #d8c6b4;border-radius:17px}.tracking-order-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:24px;color:#4b2f22;font:12px Arial,sans-serif}.tracking-order-head span{padding:7px 10px;border-radius:999px;background:#e4efe6;color:#2f7045;font-weight:700}.tracking-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.tracking-step{text-align:center;padding:14px 8px 12px;border:1px solid #d8c6b4;border-radius:13px;background:#fbf8f3;color:#8b796d;transition:all .35s ease}.tracking-step span{display:flex;width:30px;height:30px;margin:0 auto 8px;align-items:center;justify-content:center;border-radius:50%;border:1px solid #cbb7a4;background:#fff;font:700 11px Arial}.tracking-step strong{font:700 10px Arial,sans-serif}.tracking-step.done,.tracking-step.current{border-color:#3f8f5a;background:#e4efe6;color:#2f7045;box-shadow:0 0 0 2px rgba(63,143,90,.12)}.tracking-step.done span,.tracking-step.current span{background:#3f8f5a;border-color:#3f8f5a;color:#fff}.tracking-step.current{animation:trackingPulse 1.8s ease-in-out infinite}@keyframes trackingPulse{0%,100%{box-shadow:0 0 0 2px rgba(63,143,90,.12)}50%{box-shadow:0 0 0 6px rgba(63,143,90,.06)}}.tracking-total{margin-top:18px;padding-top:15px;border-top:1px solid #eadfd5;text-align:right;color:#6b4734;font:12px Arial,sans-serif}.tracking-total strong{color:#4b2f22;font-size:18px}@media(max-width:760px){.tracking-form{grid-template-columns:1fr}.tracking-steps{grid-template-columns:1fr 1fr}.tracking-section{margin-left:14px;margin-right:14px;padding:25px 16px}.order-bar{right:12px;left:auto;max-width:calc(100% - 24px);min-width:0}}@media(max-width:430px){.order-bar{right:10px;left:auto;bottom:10px;width:calc(100% - 20px)}.tracking-steps{grid-template-columns:1fr}}
</style>
'''
# Il vecchio submit-fix inline viene volutamente disattivato:
# il carrello unico è gestito da order-system.js, caricato in fondo alla pagina.
if 'id="lntdv-order-tracking"' not in s:
    s=s.replace("</head>",css+"</head>",1)

# Delivery value into payload
s=s.replace('''      total:total,
      deliveryType:"Ritiro gratuito presso Milano"
    };''','''      total:total,
      deliveryType:(document.querySelector('input[name="deliveryType"]:checked')||{}).value || "Ritiro"
    };''',1)

# Tracking client: JSONP + URL autoload
if 'id="lntdv-tracking-script"' not in s:
    js='''<script id="lntdv-tracking-script">
(function(){
  const endpoint="https://script.google.com/macros/s/AKfycbzw1FGh5SVtWTb-20v6acj9IxUvB124dGiELWH-aZ70YuAKbYkaPmwX0ocf64/exec";
  const oi=document.getElementById("trackingOrderId"),ti=document.getElementById("trackingToken"),b=document.getElementById("trackingButton"),m=document.getElementById("trackingMessage"),r=document.getElementById("trackingResult"),rid=document.getElementById("trackingResultId"),rl=document.getElementById("trackingResultLabel"),tot=document.getElementById("trackingTotal"),states=["RICEVUTO","IN_LAVORAZIONE","PRONTO_AL_RITIRO","CONSEGNATO"];
  function verify(){
    const order=(oi?.value||"").trim(),token=(ti?.value||"").trim();
    if(!order||!token){if(m)m.textContent="Inserisci sia l'ID ordine sia il token personale.";return}
    if(m)m.textContent="Verifica in corso…";
    const cb="lntdvTrack_"+Date.now(),sc=document.createElement("script");
    window[cb]=function(d){
      if(!d?.ok){if(r)r.hidden=true;if(m)m.textContent=d?.error||"Ordine non trovato.";delete window[cb];sc.remove();return}
      if(r)r.hidden=false;if(rid)rid.textContent=d.orderId||"";if(rl)rl.textContent=d.label||d.status||"";if(tot)tot.textContent="€"+Number(d.total||0).toFixed(2).replace(".",",");
      const idx=states.indexOf(String(d.status||"").toUpperCase());
      document.querySelectorAll(".tracking-step").forEach(e=>{const si=states.indexOf(e.dataset.state);e.classList.toggle("done",idx>=0&&si<=idx);e.classList.toggle("current",e.dataset.state===String(d.status||"").toUpperCase())});
      if(m)m.textContent="Ordine verificato. Ultimo stato: "+(d.label||d.status)+".";delete window[cb];sc.remove()
    };
    sc.src=endpoint+"?action=track&orderId="+encodeURIComponent(order)+"&token="+encodeURIComponent(token)+"&callback="+cb;
    document.body.appendChild(sc)
  }
  b?.addEventListener("click",verify);[oi,ti].forEach(e=>e?.addEventListener("keydown",x=>{if(x.key==="Enter")verify()}));
  const q=new URLSearchParams(location.search),qo=q.get("ordine"),qt=q.get("token");
  if(qo&&oi)oi.value=qo;if(qt&&ti)ti.value=qt;
  if(qo&&qt)setTimeout(()=>{document.getElementById("trackingSection")?.scrollIntoView({behavior:"smooth",block:"start"});verify()},350)
})();
</script>
'''
    s=s.replace("<script>document.addEventListener('contextmenu'",js+"<script>document.addEventListener('contextmenu'",1)

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
assets='''<link id="lntdv-external-order-css" rel="stylesheet" href="./order-system.css?v=20260919g">
<script id="lntdv-external-order-system" src="./order-system.js?v=20260919e"></script>'''
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


# FINAL PHOTO ORIENTATION OVERRIDE 2026-09-19
# Preserve the catalog sequence exactly as authored in catalog/part-01..14.
# Only the requested orientation is applied to each photo.
orientation_css = r'''
<style id="lntdv-photo-orientation-final-20260919">
.card:has(img[data-orientation="vertical"]) .photo-wrap{
  aspect-ratio:3/4!important;
}
.card:has(img[data-orientation="horizontal"]) .photo-wrap{
  aspect-ratio:4/3!important;
}
.card img[data-orientation="vertical"]{
  width:100%!important;
  height:100%!important;
  object-fit:contain!important;
  object-position:center!important;
  transform:rotate(90deg)!important;
  transform-origin:center center!important;
  filter:none!important;
  opacity:1!important;
}
.card img[data-orientation="horizontal"]{
  width:100%!important;
  height:100%!important;
  object-fit:contain!important;
  object-position:center!important;
  transform:none!important;
  filter:none!important;
  opacity:1!important;
}
.card:hover img[data-orientation="vertical"],
.card:hover img[data-orientation="horizontal"]{
  transform:rotate(90deg)!important;
}
.card:hover img[data-orientation="horizontal"]{
  transform:none!important;
}
</style>
'''
s += "\n" + orientation_css
p.write_text(s,encoding="utf-8")
print("Final rendering overrides written:",len(s),"bytes")

# PRINT ORIENTATION HARD FIX 2026-09-19\n# The external CSS now forces natural image dimensions and print-safe orientation.\n