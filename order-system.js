// LNTDV — sistema ordine/carrello lato cliente
(function(){
  const KEY="lntdv_cart_v3";
  const ORDER_KEY="lntdv_last_order_v3";
  const TRACKING_KEY="lntdv_tracking_orders_v1";
  const prices={"Stampa fotografica":40,"Forex":50,"File digitale in alta risoluzione":25};
  const ORIENTATIONS={};
  const SCRIPT_URL="https://script.google.com/macros/s/AKfycbybuGw5n1qyD0gKYdUm6nSYzimId6akDmKCeULqA5J7zRWB9Tr280N4oo92kX/exec";
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
      const orientation=(card.querySelector("[data-orientation]")?.dataset.value||card.querySelector("[data-orientation]")?.textContent||"").trim();
      return {code,format,price:prices[format]||0,image:card.querySelector("img")?.src||"",orientation};
    });
  }
  function pricing(a){
    const printOnly=a.length>0 && a.every(x=>x.format==="Stampa fotografica");
    const promo=a.length<=3 && printOnly ? ({1:50,2:80,3:120}[a.length]||0) : null;
    const base=totalBase(a);
    return {base,promo,total:promo!==null?promo:base};
  }
  function totalBase(a){return a.reduce((s,x)=>s+x.price,0)}
  function total(a){return pricing(a).total}
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
      <div id="lntdvPromo" style="margin-top:10px;padding:9px 11px;border-left:3px solid #54745a;background:rgba(84,116,90,.055);font-size:12px;line-height:1.4;font-weight:600">Promo: 1 foto €50 · 2 foto €80 · 3 foto €120</div>
    </div>`;
    button.parentNode.insertBefore(wrap,button);
  }
  function save(){write(KEY,items().map(x=>({code:x.code,format:x.format,orientation:x.orientation})))}
  function restore(){
    const saved=read(KEY); if(!Array.isArray(saved))return;
    document.querySelectorAll(".card").forEach(card=>{
      const code=card.querySelector(".meta strong")?.textContent.trim();
      const hit=saved.find(x=>x.code===code); if(!hit)return;
      card.classList.add("selected"); card.setAttribute("aria-pressed","true");
      const s=card.querySelector(".format-select"); if(s)s.value=hit.format||"";
      const o=card.querySelector("[data-orientation]"); if(o&&hit.orientation){o.textContent=hit.orientation==='verticale'?'Verticale':hit.orientation==='orizzontale'?'Orizzontale':hit.orientation;o.dataset.value=hit.orientation;}
    });
  }
  function refresh(){
    ensureCheckoutOptions();
    const a=items(),pinfo=pricing(a),t=pinfo.total, payment=document.querySelector('input[name="checkoutPayment"]:checked')?.value||"";
    if($("summaryCount"))$("summaryCount").textContent=a.length;
    if($("orderBarCount"))$("orderBarCount").textContent=a.length+" foto";
    if($("orderBarTotal"))$("orderBarTotal").textContent=euro(t);
    if($("orderTotal"))$("orderTotal").textContent=euro(t);
    const promoNote=pinfo.promo!==null && a.length>0 ? "Promo: "+a.length+" foto — "+euro(pinfo.promo) : "";
    const promoEl=$("lntdvPromo");
    if(promoEl) promoEl.textContent=pinfo.promo!==null && a.length>0 ? ("Promo applicata: "+a.length+" foto — "+euro(pinfo.promo)) : "Promo: 1 foto €50 · 2 foto €80 · 3 foto €120";
    if($("orderList"))$("orderList").innerHTML=a.length?a.map((x,i)=>'<div class="checkout-photo-row"><div class="checkout-photo-num">'+String(i+1).padStart(2,"0")+'</div><div class="checkout-photo-thumb">'+(x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.code)+'">':"")+'</div><div class="checkout-photo-info"><div class="checkout-photo-title">'+esc(x.code)+'</div><div class="checkout-photo-detail">'+esc(x.orientation?x.orientation+" · ":"")+esc(x.format||"Modalità non selezionata")+'</div></div><div class="checkout-photo-price">'+euro(x.price)+'</div></div>').join(""):'<div class="checkout-empty">Nessuna fotografia selezionata.</div>';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("customerEmail")?.value.trim()||"");
    const ok=a.length&&a.every(x=>x.format)&&payment&&$("customerName")?.value.trim()&&validEmail;
    if($("completePayment"))$("completePayment").disabled=!ok;
    if($("paymentStatus"))$("paymentStatus").textContent=!a.length?"Seleziona almeno una fotografia.":!a.every(x=>x.format)?"Scegli il formato per ogni fotografia.":!ok?"Completa nome, email e metodo di pagamento.":"Ordine pronto.";
    save();
  }
  function open(){refresh();$("orderPanel")?.classList.add("active");$("orderPanel")?.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
  function close(){ $("orderPanel")?.classList.remove("active");$("orderPanel")?.setAttribute("aria-hidden","true");document.body.style.overflow=""}
  document.addEventListener("click",e=>{if(e.target.closest(".card")&&!e.target.closest("select,option,input,button,a"))setTimeout(refresh,0)});
  document.addEventListener("change",e=>{if(e.target.classList.contains("format-select")){const c=e.target.closest(".card");c?.classList.add("selected");c?.setAttribute("aria-pressed","true");refresh()}else if(e.target.name==="checkoutPayment")refresh()});
  ["customerName","customerEmail","customerStreet","customerZip","customerCity","customerNote"].forEach(id=>$(id)?.addEventListener("input",refresh));
  $("openOrder")?.addEventListener("click",e=>{e.preventDefault();open()});
  $("closeOrder")?.addEventListener("click",close);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  $("completePayment")?.addEventListener("click",async()=>{
    const a=items(),p=document.querySelector('input[name="checkoutPayment"]:checked')?.value||"", email=$("customerEmail").value.trim();
    if(!a.length||a.some(x=>!x.format)||!p||!$("customerName").value.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){refresh();return}
    const orderId="LNTDV-"+Date.now().toString(36).toUpperCase(),trackingToken=makeToken(),pinfo=pricing(a),t=pinfo.total,button=$("completePayment");
    const payload={orderId,paymentMethod:p,paymentStatus:"DA_VERIFICARE",orderStatus:"ORDINE RICEVUTO",customer:{name:$("customerName").value.trim(),email,street:$("customerStreet").value.trim(),zip:$("customerZip").value.trim(),city:$("customerCity").value.trim(),note:$("customerNote").value.trim()},items:a.map(x=>({title:x.code,format:x.format,orientation:x.orientation,price:x.price})),total:t,baseTotal:pinfo.base,promotion:pinfo.promo!==null?"Promo "+a.length+" foto":null,deliveryType:$("lntdvDelivery")?.value||"Copisteria — Viale Romagna 43, 20133 Milano",requestedTracking:true,trackingToken:trackingToken};
    button.disabled=true;$("paymentStatus").textContent="Invio ordine in corso…";
    try{
      await fetch(SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:"payload="+encodeURIComponent(JSON.stringify(payload))});
      saveTracking(orderId,trackingToken);write(ORDER_KEY,{orderId,token:trackingToken,status:"ORDINE RICEVUTO",message:"Ordine inviato. ID e token sono stati salvati su questo dispositivo."});
      $("paymentStatus").innerHTML="<strong>Ordine inviato.</strong><br>ID ordine: <strong>"+esc(orderId)+"</strong><br>Riceverai la conferma via email. Il pagamento viene considerato effettuato solo dopo verifica.";
      document.querySelectorAll(".card.selected").forEach(c=>{c.classList.remove("selected");c.setAttribute("aria-pressed","false")});write(KEY,[]);refresh();
    }catch(err){button.disabled=false;$("paymentStatus").textContent="Errore nell'invio dell'ordine. Riprova."}
  });
  const observer=new MutationObserver(()=>ensureCheckoutOptions());
  observer.observe(document.body,{childList:true,subtree:true});
  rememberTrackingFromUrl();restore();refresh();
})();