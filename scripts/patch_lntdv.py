from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")

# Il mio ordine: fisso in basso a sinistra
s=s.replace('.order-bar{position:fixed;right:22px;left:auto;', '.order-bar{position:fixed;left:22px;right:auto;', 1)

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
.tracking-section{max-width:1050px;margin:70px auto 110px;padding:34px 24px;background:#f4eadf;border:1px solid #d8c6b4;border-radius:24px;box-shadow:0 14px 40px rgba(75,47,34,.08)}.tracking-intro{text-align:center;max-width:720px;margin:0 auto 25px}.tracking-intro h2{margin:7px 0 10px;font:400 clamp(28px,5vw,46px) Georgia,serif;color:#4b2f22}.tracking-intro p{margin:0;color:#6b4734;font:13px/1.6 Arial,sans-serif}.tracking-form{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}.tracking-form label{display:flex;flex-direction:column;gap:6px;font:700 10px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#6b4734}.tracking-form input{padding:13px 14px;border:1px solid #d8c6b4;border-radius:11px;background:#fff;color:#4b2f22;font:13px Arial,sans-serif}.tracking-form button{padding:14px 17px;border:0;border-radius:11px;background:#3f8f5a;color:#fff;font:bold 10px Arial,sans-serif;letter-spacing:1px;cursor:pointer}.tracking-message{min-height:20px;margin:14px 0;text-align:center;font:12px Arial,sans-serif;color:#6b4734}.tracking-result{margin-top:15px;padding:20px;background:#fff;border:1px solid #d8c6b4;border-radius:17px}.tracking-order-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:24px;color:#4b2f22;font:12px Arial,sans-serif}.tracking-order-head span{padding:7px 10px;border-radius:999px;background:#e4efe6;color:#2f7045;font-weight:700}.tracking-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.tracking-step{text-align:center;padding:14px 8px 12px;border:1px solid #d8c6b4;border-radius:13px;background:#fbf8f3;color:#8b796d;transition:all .35s ease}.tracking-step span{display:flex;width:30px;height:30px;margin:0 auto 8px;align-items:center;justify-content:center;border-radius:50%;border:1px solid #cbb7a4;background:#fff;font:700 11px Arial}.tracking-step strong{font:700 10px Arial,sans-serif}.tracking-step.done,.tracking-step.current{border-color:#3f8f5a;background:#e4efe6;color:#2f7045;box-shadow:0 0 0 2px rgba(63,143,90,.12)}.tracking-step.done span,.tracking-step.current span{background:#3f8f5a;border-color:#3f8f5a;color:#fff}.tracking-step.current{animation:trackingPulse 1.8s ease-in-out infinite}@keyframes trackingPulse{0%,100%{box-shadow:0 0 0 2px rgba(63,143,90,.12)}50%{box-shadow:0 0 0 6px rgba(63,143,90,.06)}}.tracking-total{margin-top:18px;padding-top:15px;border-top:1px solid #eadfd5;text-align:right;color:#6b4734;font:12px Arial,sans-serif}.tracking-total strong{color:#4b2f22;font-size:18px}@media(max-width:760px){.tracking-form{grid-template-columns:1fr}.tracking-steps{grid-template-columns:1fr 1fr}.tracking-section{margin-left:14px;margin-right:14px;padding:25px 16px}.order-bar{left:12px;right:auto;max-width:calc(100% - 24px);min-width:0}}@media(max-width:430px){.order-bar{left:10px;bottom:10px;width:calc(100% - 20px)}.tracking-steps{grid-template-columns:1fr}}
</style>
'''
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
  const endpoint="https://script.google.com/macros/s/AKfycbybuGw5n1qyD0gKYdUm6nSYzimId6akDmKCeULqA5J7zRWB9Tr280N4oo92kX/exec";
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
    sc.src=endpoint+"?action=track&ordine="+encodeURIComponent(order)+"&token="+encodeURIComponent(token)+"&callback="+cb;
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

p.write_text(s,encoding="utf-8")
print("Published source prepared:",len(s),"bytes",s.count("<article"),"articles",s.count("<img"),"images")
