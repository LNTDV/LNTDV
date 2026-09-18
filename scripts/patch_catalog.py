from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf-8", errors="ignore")
if len(s)<6_000_000 or len(re.findall(r"<article\\b",s,re.I))<20 or len(re.findall(r"<img\\b",s,re.I))<20:
    raise SystemExit("Catalog download does not look like the supplied 25-photo catalog")

css=r'''<style id="lntdv-final-functions-style">
:root{--lntdv-green:#6f8f72;--lntdv-green-dark:#4f6d54;--lntdv-maroon:#542d2b;--lntdv-brown:#2f211a}
.order-bar{z-index:9999!important;left:18px!important;right:auto!important;bottom:18px!important;max-width:min(520px,calc(100vw - 36px));box-shadow:0 18px 45px rgba(47,33,26,.24)!important;animation:lntdvFloat .55s ease both}
.order-button,.tracking-submit{transition:.2s}.order-button:hover,.tracking-submit:hover{transform:translateY(-2px)}
.card.selected{outline:3px solid var(--lntdv-green)!important;outline-offset:3px;box-shadow:0 0 0 8px rgba(111,143,114,.14)!important}
.card.selected:after{content:"✓ SELEZIONATA";position:absolute;top:12px;right:12px;background:var(--lntdv-green);color:#fff;padding:6px 10px;border-radius:999px;font-size:10px;font-weight:800;z-index:5}
.delivery-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.delivery-choice label,.payment-choice label{display:flex;align-items:center;gap:9px;padding:12px;border:1px solid rgba(84,45,43,.18);border-radius:12px;background:#fffaf2;cursor:pointer}
.delivery-choice label:has(input:checked),.payment-choice label:has(input:checked){border-color:var(--lntdv-green);background:rgba(111,143,114,.1)}
.delivery-note{margin-top:8px;font-size:12px;opacity:.72}
.tracking-section{margin:70px auto 130px;max-width:1100px;padding:34px;background:linear-gradient(145deg,#f5ead7,#eadbc4);border:1px solid rgba(84,45,43,.18);border-radius:24px;box-shadow:0 18px 55px rgba(47,33,26,.12)}
.tracking-kicker{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--lntdv-maroon);font-weight:800}.tracking-title{color:var(--lntdv-brown)}
.tracking-form{display:grid;grid-template-columns:1fr 1fr auto;gap:12px}.tracking-form input{box-sizing:border-box;padding:14px;border:1px solid rgba(84,45,43,.2);border-radius:12px;background:#fffdf8}
.tracking-submit{border:0;border-radius:12px;padding:14px 18px;background:var(--lntdv-maroon);color:#fff;font-weight:800;cursor:pointer}.tracking-message{margin-top:15px;min-height:20px}.tracking-result{margin-top:25px;display:none}
.tracking-order-meta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px}.tracking-chip{padding:8px 11px;border-radius:999px;background:#fffdf8;border:1px solid rgba(84,45,43,.15);font-size:12px}
.tracking-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.tracking-step{padding:18px 12px;border-top:4px solid #cbbda8;color:#7d6b5f;transition:.3s}
.tracking-step.done,.tracking-step.active{border-color:var(--lntdv-green);color:var(--lntdv-green-dark);background:rgba(111,143,114,.08);border-radius:12px}
.tracking-step.done .step-dot,.tracking-step.active .step-dot{background:var(--lntdv-green);color:#fff}.step-dot{width:28px;height:28px;border-radius:50%;background:#cbbda8;color:#fff;display:grid;place-items:center;font-weight:800;margin-bottom:9px}.step-name{font-weight:800;font-size:12px}.step-date{font-size:11px;margin-top:5px;opacity:.72}
@keyframes lntdvFloat{from{transform:translateY(15px);opacity:0}to{transform:none;opacity:1}}
@media(max-width:760px){.order-bar{left:10px!important;right:10px!important;max-width:none}.tracking-form{grid-template-columns:1fr}.tracking-steps{grid-template-columns:1fr 1fr}.delivery-choice{grid-template-columns:1fr}.tracking-section{margin:45px 12px 120px;padding:22px}}
</style>'''
if "lntdv-final-functions-style" not in s:
    s=s.replace("</head>",css+"</head>",1)

marker='<section class="checkout-block">\n        <div class="checkout-section-title">Pagamento</div>'
delivery='''<section class="checkout-block"><div class="checkout-section-title">Consegna</div><div class="delivery-choice">
<label><input type="radio" name="checkoutDelivery" value="Ritiro" checked> <span><strong>Ritiro</strong><br><small>Da concordare a Milano · €0</small></span></label>
<label><input type="radio" name="checkoutDelivery" value="Spedizione"> <span><strong>Spedizione</strong><br><small>Italia · €10</small></span></label></div>
<div class="delivery-note" id="deliveryStatus">Ritiro gratuito da concordare a Milano.</div></section>
<section class="checkout-block"><div class="checkout-section-title">Pagamento</div>'''
if 'name="checkoutDelivery"' not in s and marker in s:
    s=s.replace(marker,delivery,1)

tracking='''<section class="tracking-section" id="tracking"><div class="tracking-kicker">IL TUO ORDINE</div><h2 class="tracking-title">Segui la tua fotografia</h2>
<p>Inserisci l’ID ordine e il token personale ricevuti nella email.</p>
<form class="tracking-form" id="trackingForm"><input id="trackingOrderId" placeholder="ID ordine · LNTDV-..." required><input id="trackingToken" placeholder="Token personale" required><button class="tracking-submit" type="submit">VERIFICA ORDINE →</button></form>
<div class="tracking-message" id="trackingMessage"></div><div class="tracking-result" id="trackingResult"><div class="tracking-order-meta" id="trackingMeta"></div>
<div class="tracking-steps"><div class="tracking-step" data-step="RICEVUTO"><div class="step-dot">1</div><div class="step-name">RICEVUTO</div><div class="step-date"></div></div>
<div class="tracking-step" data-step="IN_LAVORAZIONE"><div class="step-dot">2</div><div class="step-name">IN LAVORAZIONE</div><div class="step-date"></div></div>
<div class="tracking-step" data-step="PRONTO_AL_RITIRO"><div class="step-dot">3</div><div class="step-name">PRONTO AL RITIRO</div><div class="step-date"></div></div>
<div class="tracking-step" data-step="CONSEGNATO"><div class="step-dot">4</div><div class="step-name">CONSEGNATO</div><div class="step-date"></div></div></div></div></section>'''
if 'id="trackingForm"' not in s:
    s=s.replace('<script id="info-menu-script">',tracking+'<script id="info-menu-script">',1)

js='''<script id="lntdv-final-functions-script">(function(){const A="https://script.google.com/macros/s/AKfycbybuGw5n1qyD0gKYdUm6nSYzimId6akDmKCeULqA5J7zRWB9Tr280N4oo92kX/exec",dn=document.getElementById("deliveryStatus");
document.addEventListener("change",e=>{if(e.target?.name==="checkoutDelivery"&&dn)dn.textContent=e.target.value==="Spedizione"?"Spedizione in Italia · €10.":"Ritiro gratuito da concordare a Milano."});
const c=document.getElementById("completePayment");if(c)c.addEventListener("click",()=>{window.LNTDV_SELECTED_DELIVERY=document.querySelector('input[name="checkoutDelivery"]:checked')?.value||"Ritiro"},true);
const f=document.getElementById("trackingForm"),m=document.getElementById("trackingMessage"),r=document.getElementById("trackingResult"),meta=document.getElementById("trackingMeta"),oi=document.getElementById("trackingOrderId"),ti=document.getElementById("trackingToken");if(!f)return;
const esc=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
function draw(d){if(!d||d.ok===false){r.style.display="none";m.textContent=d?.error||"Ordine non trovato o credenziali non valide.";return}const o=d.order||d,st=String(o.status||o.stato||"RICEVUTO").toUpperCase(),ss=["RICEVUTO","IN_LAVORAZIONE","PRONTO_AL_RITIRO","CONSEGNATO"],ix=ss.indexOf(st);
meta.innerHTML='<span class="tracking-chip"><strong>Ordine:</strong> '+esc(o.orderId||oi.value)+'</span>' +(o.deliveryType?'<span class="tracking-chip"><strong>Consegna:</strong> '+esc(o.deliveryType)+'</span>':'') +(o.paymentStatus?'<span class="tracking-chip"><strong>Pagamento:</strong> '+esc(o.paymentStatus)+'</span>':'');
document.querySelectorAll(".tracking-step").forEach((e,i)=>{e.classList.toggle("done",ix>=0&&i<ix);e.classList.toggle("active",ix===i);e.querySelector(".step-date").textContent=ix===i?"Stato attuale":ix>i?"Completato":"In attesa"});r.style.display="block";m.textContent=""}
function jp(u){return new Promise((ok,no)=>{const b="lntdv_"+Date.now(),s=document.createElement("script"),t=setTimeout(()=>{cl();no(0)},12000);function cl(){clearTimeout(t);delete window[b];s.remove()}window[b]=d=>{cl();ok(d)};s.onerror=()=>{cl();no(0)};s.src=u+"&callback="+b;document.body.appendChild(s)})}
async function go(){const id=oi.value.trim(),tk=ti.value.trim();if(!id||!tk){m.textContent="Inserisci sia ID ordine sia token personale.";return}m.textContent="Verifica dell’ordine in corso…";try{draw(await jp(A+"?ordine="+encodeURIComponent(id)+"&token="+encodeURIComponent(tk)))}catch(e){m.textContent="Non è stato possibile verificare l’ordine. Riprova tra poco."}}
f.addEventListener("submit",e=>{e.preventDefault();go()});const q=new URLSearchParams(location.search),id=q.get("ordine"),tk=q.get("token");if(id&&tk){oi.value=id;ti.value=tk;setTimeout(go,250);document.getElementById("tracking")?.scrollIntoView({behavior:"smooth"})}})();</script>'''
if "lntdv-final-functions-script" not in s:
    s=s.replace('<script id="info-menu-script">',js+'<script id="info-menu-script">',1)
s=s.replace('deliveryType:"Ritiro gratuito presso Milano"','deliveryType:(window.LNTDV_SELECTED_DELIVERY==="Spedizione"?"Spedizione · €10":"Ritiro gratuito presso Milano")',1)
p.write_text(s,encoding="utf-8")
print("patched",len(s))
