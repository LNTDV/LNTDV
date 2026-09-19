// LNTDV — sistema ordine/carrello lato cliente
(function(){
  const KEY="lntdv_cart_v3";
  const ORDER_KEY="lntdv_last_order_v3";
  const TRACKING_KEY="lntdv_tracking_orders_v1";
  const PAYMENT_KEY="lntdv_pending_payment_v1";
  const QTY_KEY="lntdv_order_quantities_v1";
  let BANK_IBAN="";
  const prices={"Stampa fotografica":40,"Forex":50,"File digitale in alta risoluzione":25};
  const SCRIPT_URL="https://script.google.com/macros/s/AKfycbzw1FGh5SVtWTb-20v6acj9IxUvB124dGiELWH-aZ70YuAKbYkaPmwX0ocf64/exec";
  const $=id=>document.getElementById(id);
  const euro=n=>"€"+Number(n||0).toFixed(2).replace(".",",");
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function read(k){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch(e){return[]}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function trackingList(){const v=read(TRACKING_KEY);return Array.isArray(v)?v:[]}
  function saveTracking(orderId,token){if(!orderId||!token)return;const list=trackingList().filter(x=>x&&x.orderId!==orderId);list.unshift({orderId:String(orderId),token:String(token).toUpperCase(),savedAt:new Date().toISOString()});write(TRACKING_KEY,list.slice(0,20))}
  function rememberTrackingFromUrl(){try{const p=new URLSearchParams(location.search);const orderId=(p.get("ordine")||"").trim();const token=(p.get("token")||"").trim();if(orderId&&token)saveTracking(orderId,token)}catch(e){}}
  function makeToken(){try{if(window.crypto&&crypto.randomUUID)return crypto.randomUUID().replace(/-/g,"").toUpperCase();if(window.crypto&&crypto.getRandomValues){const a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,b=>b.toString(16).padStart(2,"0")).join("").toUpperCase()}}catch(e){}return (Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)).replace(/[^A-Z0-9]/gi,"").toUpperCase()}
  function items(){
    return [...document.querySelectorAll(".card.selected")].map(card=>{
      const code=card.querySelector(".meta strong")?.textContent.trim()||"Fotografia";
      const select=card.querySelector(".format-select");
      const format=select?.value||"";
      const orientation=(card.dataset.orientation||"").trim();
      const quantity=Math.max(1,parseInt(card.dataset.quantity||"1",10)||1);
      return {code,format,price:prices[format]||0,image:card.querySelector("img")?.src||"",orientation,quantity};
    });
  }
  // PREZZI FISSI, SENZA BUNDLE:
  // Stampa fotografica €40 · Forex €50 · Digitale €25.
  // Ogni riga viene calcolata come prezzo del formato × quantità.
  // Esempio obbligatorio: Forex €50 + Digitale €25 = €75.
  function totalBase(a){return a.reduce((s,x)=>s+((Number(prices[x.format])||0)*Math.max(1,Number(x.quantity)||1)),0)}
  function pricing(a){
    const base=totalBase(a);
    return {base,promo:null,total:base};
  }
  function ensureCheckoutOptions(){
    const panel=$("orderPanel"), button=$("completePayment");
    if(!panel||!button||$("lntdvCheckoutOptions"))return;
    const wrap=document.createElement("div");
    wrap.id="lntdvCheckoutOptions";
    wrap.innerHTML=`<div style="margin:18px 0 10px;padding-top:14px;border-top:1px solid rgba(90,59,43,.16)">
      <div style="font-weight:700;margin-bottom:8px">Ritiro</div>
      <select id="lntdvDelivery" style="width:100%;padding:11px;border:1px solid #d8c5ae;border-radius:8px;background:#fffaf3;color:#3d281d">
        <option value="Copisteria — Viale Romagna 43, 20133 Milano">Copisteria — Viale Romagna 43, 20133 Milano</option>
        <option value="Biblioteca di Arese — data da concordare">Biblioteca di Arese — data da concordare</option>
      </select>
      <div style="font-size:12px;line-height:1.45;margin-top:7px;opacity:.78">Ritiro gratuito. Quando l'ordine sarà pronto riceverai una email con la conferma e le indicazioni per il ritiro.</div>
      <div id="lntdvBankBox" style="margin-top:12px;padding:12px;border:1px solid #d8c5ae;border-radius:10px;background:#fff"><div style="font-weight:700;margin-bottom:7px">Pagamento tramite bonifico</div><div style="font-size:13px;line-height:1.55">IBAN: <strong id="lntdvBankIban">Caricamento…</strong><br>Causale: <strong id="lntdvBankCausale">verrà indicata dopo l’invio dell’ordine</strong></div><div style="font-size:12px;opacity:.78;margin-top:7px">Prima registriamo l’ordine. Subito dopo riceverai la ricevuta dell’ordine e i dati per il bonifico.</div></div>
    </div>`;
    button.parentNode.insertBefore(wrap,button);
  }
  function save(){write(KEY,items().map(x=>({code:x.code,format:x.format,orientation:x.orientation,quantity:x.quantity})))}
  function restore(){
    const saved=read(KEY); if(!Array.isArray(saved))return;
    document.querySelectorAll(".card").forEach(card=>{
      const code=card.querySelector(".meta strong")?.textContent.trim();
      const hit=saved.find(x=>x.code===code); if(!hit)return;
      card.classList.add("selected"); card.setAttribute("aria-pressed","true");
      if(hit.quantity)card.dataset.quantity=Math.max(1,parseInt(hit.quantity,10)||1);
      const s=card.querySelector(".format-select"); if(s)s.value=hit.format||"";
    });
  }
  function refresh(){
    ensureCheckoutOptions();
    const a=items(),pinfo=pricing(a),t=pinfo.total;
    const orderBar=$("orderBar");
    if(orderBar){ orderBar.classList.toggle("show", a.length>0); orderBar.setAttribute("aria-hidden", a.length>0 ? "false" : "true"); }
    if($("summaryCount"))$("summaryCount").textContent=a.length;
    if($("orderBarCount"))$("orderBarCount").textContent=a.length+" foto";
    if($("orderBarTotal"))$("orderBarTotal").textContent=euro(t);
    if($("orderTotal"))$("orderTotal").textContent=euro(t);
    if($("orderList"))$("orderList").innerHTML=a.length?a.map((x,i)=>'<div class="checkout-photo-row"><div class="checkout-photo-num">'+String(i+1).padStart(2,"0")+'</div><div class="checkout-photo-thumb">'+(x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.code)+'">':"")+'</div><div class="checkout-photo-info"><div class="checkout-photo-title">'+esc(x.code)+'</div><div class="checkout-photo-detail">'+esc(x.orientation?x.orientation+" · ":"")+esc(x.format||"Modalità non selezionata")+'</div></div><div class="checkout-photo-price">'+euro(x.price)+'</div></div>').join(""):'<div class="checkout-empty">Nessuna fotografia selezionata.</div>';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("customerEmail")?.value.trim()||"");
    const ok=a.length&&a.every(x=>x.format)&&$("customerName")?.value.trim()&&validEmail;
    if($("completePayment"))$("completePayment").disabled=!ok;
    if($("paymentStatus"))$("paymentStatus").textContent=!a.length?"Seleziona almeno una fotografia.":!a.every(x=>x.format)?"Scegli il formato per ogni fotografia.":!ok?"Completa nome ed email.":"Ordine pronto.";
    save();
  }
  function open(){refresh();$("orderPanel")?.classList.add("active");$("orderPanel")?.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
  function close(){$("orderPanel")?.classList.remove("active");$("orderPanel")?.setAttribute("aria-hidden","true");document.body.style.overflow=""}
  document.addEventListener("click",e=>{if(e.target.closest(".card")&&!e.target.closest("select,option,input,button,a"))setTimeout(refresh,0)});
  document.addEventListener("click",e=>{const q=e.target.closest(".lntdv-qty");if(!q)return;const code=q.dataset.code||"";const delta=parseInt(q.dataset.delta||"0",10)||0;const card=[...document.querySelectorAll(".card.selected")].find(x=>(x.querySelector(".meta strong")?.textContent.trim()||"")===code);if(card){card.dataset.quantity=Math.max(1,(parseInt(card.dataset.quantity||"1",10)||1)+delta);refresh()}});
  document.addEventListener("change",e=>{if(e.target.classList.contains("format-select")){const c=e.target.closest(".card");c?.classList.add("selected");c?.setAttribute("aria-pressed","true");refresh()}});
  ["customerName","customerEmail","customerStreet","customerZip","customerCity","customerNote"].forEach(id=>$(id)?.addEventListener("input",refresh));
  $("openOrder")?.addEventListener("click",e=>{e.preventDefault();open()});
  $("closeOrder")?.addEventListener("click",close);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  $("completePayment")?.addEventListener("click",async()=>{
    const a=items(),email=$("customerEmail").value.trim();
    if(!a.length||a.some(x=>!x.format)||!$("customerName").value.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){refresh();return}
    const orderId="LNTDV-"+Date.now().toString(36).toUpperCase(),trackingToken=makeToken(),pinfo=pricing(a),t=pinfo.total,button=$("completePayment");
    const payload={orderId,paymentMethod:"BONIFICO",paymentStatus:"IN_ATTESA_DI_PAGAMENTO",orderStatus:"ORDINE RICEVUTO",customer:{name:$("customerName").value.trim(),email,street:$("customerStreet").value.trim(),zip:$("customerZip").value.trim(),city:$("customerCity").value.trim(),note:$("customerNote").value.trim()},items:a.map(x=>({title:x.code,format:x.format,orientation:x.orientation,price:Number(prices[x.format])||0,quantity:Math.max(1,Number(x.quantity)||1)})),total:t,baseTotal:t,promotion:null,deliveryType:$("lntdvDelivery")?.value||"Copisteria — Viale Romagna 43, 20133 Milano",requestedTracking:true,trackingToken};
    button.disabled=true;$("paymentStatus").textContent="Invio ordine in corso…";
    try{
      // Invio diretto al Web App Apps Script senza aprire Gmail/Mail.
      // Usiamo un normale POST tramite iframe: evita problemi CORS/no-cors del fetch
      // e lascia che Apps Script esegua doPost() sul server.
      await new Promise((resolve,reject)=>{
        const iframe=document.createElement("iframe");
        iframe.name="lntdv-order-submit";
        iframe.style.display="none";
        document.body.appendChild(iframe);
        const form=document.createElement("form");
        form.method="POST";
        form.action=SCRIPT_URL;
        form.target=iframe.name;
        form.style.display="none";
        const input=document.createElement("input");
        input.type="hidden";
        input.name="payload";
        input.value=JSON.stringify(payload);
        form.appendChild(input);
        document.body.appendChild(form);
        let finished=false;
        const done=()=>{if(finished)return;finished=true;setTimeout(()=>{try{form.remove();iframe.remove()}catch(e){}},1500);resolve()};
        iframe.addEventListener("load",done,{once:true});
        document.body.appendChild(form);
        form.submit();
        setTimeout(done,8000);
      });
      saveTracking(orderId,trackingToken);write(ORDER_KEY,{orderId,token:trackingToken,status:"ORDINE RICEVUTO"});write(PAYMENT_KEY,{orderId,token:trackingToken,email,status:"IN_ATTESA_DI_PAGAMENTO"});
      $("paymentStatus").innerHTML="<strong>Ordine ricevuto.</strong><br>ID ordine: <strong>"+esc(orderId)+"</strong><br><br>Ti abbiamo inviato via email i dati per il bonifico. Totale ordine: <strong>"+euro(t)+"</strong>.";
      document.querySelectorAll(".card.selected").forEach(c=>{c.classList.remove("selected");c.setAttribute("aria-pressed","false")});write(KEY,[]);refresh();
    }catch(err){button.disabled=false;$("paymentStatus").textContent="Errore nell'invio dell'ordine. Riprova."}
  });
  const observer=new MutationObserver(()=>ensureCheckoutOptions());
  observer.observe(document.body,{childList:true,subtree:true});
  fetch(SCRIPT_URL+"?action=config").then(r=>r.json()).then(x=>{if(x&&x.ok)BANK_IBAN=String(x.iban||"")}).catch(()=>{}).finally(()=>{rememberTrackingFromUrl();restore();refresh()});
})();