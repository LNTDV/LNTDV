// LNTDV — sistema ordine/carrello lato cliente
(function(){
  const KEY="lntdv_cart_v3";
  const ORDER_KEY="lntdv_last_order_v3";
  const TRACKING_KEY="lntdv_tracking_orders_v1";
  const PAYMENT_KEY="lntdv_pending_payment_v1";
  const QTY_KEY="lntdv_order_quantities_v1";
  let BANK_IBAN="";
  const prices={"Stampa fotografica":40,"Forex":50,"File digitale in alta risoluzione":25};
  const SCRIPT_URL="https://script.google.com/macros/s/AKfycbwYI8raiMQ830nMMtRm3FQueXv2a9vbrdH3SJkg7csqGEdnd1vIKS1Y1-jwjJvCPBA/exec";
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
      <div style="font-size:12px;line-height:1.45;margin-top:7px;opacity:.78">Ritiro gratuito. Quando l'ordine sarà pronto riceverai una email con la conferma e le indicazioni per il ritiro.</div></div>`;
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

/* LNTDV MOBILE/WORKFLOW OVERRIDE v4
   One capture handler owns the mobile cart and checkout.
   It also verifies the order through the Apps Script JSONP endpoint
   so the UI does not claim success before the row exists in Sheets.
*/
(function(){
  'use strict';
  const CART_KEY='lntdv_cart_v4';
  const LAST_ORDER_KEY='lntdv_last_order_v4';
  const TRACKING_KEY='lntdv_tracking_orders_v2';
  const ENDPOINT='https://script.google.com/macros/s/AKfycbwYI8raiMQ830nMMtRm3FQueXv2a9vbrdH3SJkg7csqGEdnd1vIKS1Y1-jwjJvCPBA/exec';
  const PRICES={'Stampa fotografica':40,'Forex':50,'File digitale in alta risoluzione':25};
  const COUNT_FIX_VERSION='20260919f';
  const SHIPPING=10;
  let BANK_IBAN='';
  let BANK_HOLDER='Edvinas Dragoni';
  let busy=false;
  const $=id=>document.getElementById(id);
  const money=n=>'€'+Number(n||0).toFixed(2).replace('.',',');
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(k,f){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(e){return f}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function cards(){return [...document.querySelectorAll('.card')]}
  function selected(){return cards().filter(c=>c.classList.contains('selected'))}
  function delivery(){return $('lntdvDelivery')?.value||document.querySelector('input[name="checkoutDelivery"]:checked')?.value||document.querySelector('input[name="deliveryType"]:checked')?.value||'Biblioteca di Arese — data da concordare'}
  function items(){return selected().map(card=>{
    const code=card.querySelector('.meta strong')?.textContent.trim()||'Fotografia';
    const format=card.querySelector('.format-select')?.value||'';
    const image=card.querySelector('img')?.getAttribute('src')||'';
    const orientation=card.querySelector('.meta small')?.textContent.replace(/^Orientamento:\s*/i,'').trim()||'';
    const quantity=Math.max(1,parseInt(card.dataset.quantity||'1',10)||1);
    return {card,code,format,image,orientation,price:Number(PRICES[format]||0),quantity};
  })}
  function promoTotal(a){
    const count=a.reduce((n,x)=>n+Math.max(1,Number(x.quantity)||1),0);
    if(count===1)return 50;
    if(count===2)return 80;
    if(count===3)return 120;
    return null;
  }
  function totals(a){
    const normalSubtotal=a.reduce((s,x)=>s+x.price*x.quantity,0);
    const promo=promoTotal(a);
    const subtotal=promo!==null?promo:normalSubtotal;
    const photoCount=a.reduce((n,x)=>n+Math.max(1,Number(x.quantity)||1),0); const shipping=photoCount>2?SHIPPING:0;
    return{subtotal,normalSubtotal,promo,shipping,total:subtotal+shipping}
  }
  function saveCart(){write(CART_KEY,items().map(x=>({code:x.code,format:x.format,quantity:x.quantity})))}
  function restore(){
    const saved=read(CART_KEY,[]);
    if(!Array.isArray(saved))return;
    cards().forEach(card=>{
      const code=card.querySelector('.meta strong')?.textContent.trim();
      const hit=saved.find(x=>x&&x.code===code);
      if(!hit)return;
      card.classList.add('selected');card.setAttribute('aria-pressed','true');
      const s=card.querySelector('.format-select');if(s)s.value=hit.format||'';
      if(hit.quantity)card.dataset.quantity=Math.max(1,parseInt(hit.quantity,10)||1);
    });
  }
  function paymentInfo(){
    const box=document.getElementById('lntdvPaymentDetails');
    if(box)box.remove();
  }
  function normalizePayment(){
    // I metodi di pagamento non vengono mostrati nel riepilogo.
  }
  function render(){
    normalizePayment();
    paymentInfo();
    const a=items(),p=totals(a),bar=$('orderBar');
    if(bar){const show=a.length>0;bar.classList.toggle('show',show);bar.classList.toggle('active',show);bar.setAttribute('aria-hidden',show?'false':'true')}
    if($('orderBarCount'))$('orderBarCount').textContent=a.reduce((n,x)=>n+Math.max(1,x.quantity||1),0)+' foto';
    if($('orderBarTotal'))$('orderBarTotal').textContent=money(p.total);
    if($('summaryCount'))$('summaryCount').textContent=String(a.reduce((n,x)=>n+Math.max(1,x.quantity||1),0));
    if($('orderTotal'))$('orderTotal').textContent=money(p.total);
    const promoNote=$('lntdvPromoNote');
    if(promoNote){
      promoNote.innerHTML=a.length
        ? '<strong>Promozione dedicata:</strong> 1 foto €50 · 2 foto €80 · 3 foto €120'+(p.promo!==null?'<br><span style="opacity:.8">Totale promozionale applicato alla selezione.</span>':'<br><span style="opacity:.8">Per più di 3 foto si applicano i normali prezzi del catalogo.</span>')
        : '';
      promoNote.style.display=a.length?'block':'none';
    }
    if($('orderList'))$('orderList').innerHTML=a.length?a.map((x,i)=>'<div class="checkout-photo-row"><div class="checkout-photo-num">'+String(i+1).padStart(2,'0')+'</div><div class="checkout-photo-thumb">'+(x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.code)+'" draggable="false">':'')+'</div><div class="checkout-photo-info"><div class="checkout-photo-title">'+esc(x.code)+'</div><div class="checkout-photo-detail">'+esc(x.orientation?x.orientation+' · ':'')+esc(x.format||'Formato da selezionare')+'</div></div><div class="checkout-photo-price">'+money(x.price)+'</div></div>').join(''):'<div class="checkout-empty">Nessuna fotografia selezionata.</div>';
    const name=$('customerName')?.value.trim()||'',email=$('customerEmail')?.value.trim()||'';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const complete=a.length>0&&a.every(x=>!!x.format);
    const ready=complete&&!!name&&validEmail;
    if($('completePayment'))$('completePayment').disabled=!ready||busy;
    if($('paymentStatus')){
      if(!a.length)$('paymentStatus').textContent='Seleziona almeno una fotografia.';
      else if(!complete)$('paymentStatus').textContent='Scegli il formato per ogni fotografia.';
      else if(!name||!validEmail)$('paymentStatus').textContent='Inserisci nome e un indirizzo email valido.';
      else $('paymentStatus').textContent='Ordine pronto per l’invio. Dopo il riepilogo riceverai ID, causale, IBAN e intestatario.';
    }
    saveCart();
  }
  function openPanel(){render();const p=$('orderPanel');if(!p)return;p.classList.add('active');p.setAttribute('aria-hidden','false');document.documentElement.classList.add('lntdv-order-open');document.body.classList.add('lntdv-order-open')}
  function closePanel(){const p=$('orderPanel');if(!p)return;p.classList.remove('active');p.setAttribute('aria-hidden','true');document.documentElement.classList.remove('lntdv-order-open');document.body.classList.remove('lntdv-order-open')}
  function token(){try{if(window.crypto?.randomUUID)return crypto.randomUUID().replace(/-/g,'').toUpperCase();const a=new Uint8Array(24);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()}catch(e){return(Date.now().toString(36)+Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/gi,'').toUpperCase()}}
  function orderId(){return'LNTDV-'+Date.now().toString(36).toUpperCase()}
  function track(id,t){const old=read(TRACKING_KEY,[]);const a=Array.isArray(old)?old.filter(x=>x&&x.orderId!==id):[];a.unshift({orderId:id,token:t,savedAt:new Date().toISOString()});write(TRACKING_KEY,a.slice(0,20))}
  function jsonpConfirm(id,t,ms){return new Promise((resolve,reject)=>{
    const cb='__lntdv_confirm_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;
    const timer=setTimeout(()=>finish(new Error('timeout')),ms||5000);
    function cleanup(){clearTimeout(timer);try{delete window[cb]}catch(e){window[cb]=undefined}s.remove()}
    function finish(err,data){if(done)return;done=true;cleanup();err?reject(err):resolve(data)}
    window[cb]=data=>finish(null,data);s.onerror=()=>finish(new Error('network'));
    s.src=ENDPOINT+'?action=confirm&orderId='+encodeURIComponent(id)+'&token='+encodeURIComponent(t)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
    document.head.appendChild(s);
  })}
  async function verify(id,t){
    for(const wait of [1200,2500,4500,7000]){
      await new Promise(r=>setTimeout(r,wait));
      try{const x=await jsonpConfirm(id,t,5000);if(x&&x.ok)return x}catch(e){}
    }
    return null;
  }
  function post(payload){return new Promise((resolve,reject)=>{
    const name='lntdv-order-'+Date.now(),iframe=document.createElement('iframe'),form=document.createElement('form');
    iframe.name=name;iframe.setAttribute('aria-hidden','true');iframe.style.cssText='position:fixed;width:1px;height:1px;border:0;opacity:0;pointer-events:none;left:-9999px;top:-9999px';
    form.method='POST';form.action=ENDPOINT;form.target=name;form.style.display='none';
    const input=document.createElement('input');input.type='hidden';input.name='payload';input.value=JSON.stringify(payload);form.appendChild(input);
    document.body.appendChild(iframe);document.body.appendChild(form);
    let finished=false;
    const finish=ok=>{if(finished)return;finished=true;setTimeout(()=>{iframe.remove();form.remove()},1200);ok?resolve():reject(new Error('timeout'))};
    iframe.addEventListener('load',()=>finish(true),{once:true});form.submit();setTimeout(()=>finish(true),9000);
  })}
  async function submit(){
    if(busy)return;
    render();
    const a=items(),name=$('customerName')?.value.trim()||'',email=$('customerEmail')?.value.trim()||'';
    if(!a.length||a.some(x=>!x.format)||!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return;
    if(a.length>=2 && !(sessionStorage.getItem(PROMO_KEY)==='shown')){
      const promoAction=await showThirdPhotoPromotion();
      if(promoAction==='add'){
        closePanel();
        if($('paymentStatus'))$('paymentStatus').textContent='Puoi aggiungere la terza fotografia. Il riepilogo resterà disponibile in basso a destra.';
        busy=false;
        render();
        return;
      }
    }
    const p=totals(a),id=orderId(),t=token();
    const payload={orderId:id,paymentMethod:'Bonifico bancario',paymentStatus:'IN_ATTESA_DI_PAGAMENTO',orderStatus:'ORDINE RICEVUTO',customer:{name,email,street:$('customerStreet')?.value.trim()||'',zip:$('customerZip')?.value.trim()||'',city:$('customerCity')?.value.trim()||'',note:$('customerNote')?.value.trim()||''},items:a.map(x=>({title:x.code,format:x.format,orientation:x.orientation,price:x.price,quantity:Math.max(1,Number(x.quantity)||1)})),subtotal:p.subtotal,baseTotal:p.subtotal,shippingFee:p.shipping,total:p.total,promotion:p.promo!==null?'Promozione dedicata: 1 foto €50, 2 foto €80, 3 foto €120':'',deliveryType:delivery(),requestedTracking:true,trackingToken:t};
    busy=true;write(LAST_ORDER_KEY,{orderId:id,token:t,email,total:p.total,pending:true,createdAt:new Date().toISOString()});
    if($('completePayment'))$('completePayment').disabled=true;
    if($('paymentStatus'))$('paymentStatus').innerHTML='<strong>Invio ordine in corso…</strong><br>Verifica della registrazione sul sistema ordini.';
    try{
      await post(payload);
      const confirmed=await verify(id,t);
      if(!confirmed){
        busy=false;
        if($('paymentStatus'))$('paymentStatus').innerHTML='<strong>Invio effettuato.</strong><br>La verifica automatica sta ancora attendendo la registrazione. Non premere nuovamente il pulsante.';
        return;
      }
      track(id,t);write(LAST_ORDER_KEY,{...payload,confirmedAt:new Date().toISOString(),pending:false});write(CART_KEY,[]);
      selected().forEach(c=>{c.classList.remove('selected');c.setAttribute('aria-pressed','false')});
      if($('paymentStatus'))$('paymentStatus').innerHTML='<strong>Ordine ricevuto.</strong><br>ID ordine: <strong>'+esc(id)+'</strong><br>Token tracking: <strong>'+esc(t)+'</strong><br><br>Riceverai via email i dati per il bonifico, la causale e il collegamento diretto al tracking. Totale: <strong>'+money(p.total)+'</strong>.';
      busy=false;render();
    }catch(e){
      busy=false;
      if($('paymentStatus'))$('paymentStatus').textContent='Non è stato possibile inviare l’ordine. Le fotografie restano nel carrello: riprova.';
      render();
    }
  }
  function rememberUrl(){try{const p=new URLSearchParams(location.search),id=(p.get('ordine')||'').trim(),t=(p.get('token')||'').trim();if(id&&t)track(id,t)}catch(e){}}
  function init(){
    ensureCopyright();
    document.addEventListener('click',e=>{
      const open=e.target.closest('#openOrder'),close=e.target.closest('#closeOrder'),send=e.target.closest('#completePayment');
      if(open){e.preventDefault();e.stopImmediatePropagation();openPanel();return}
      if(close){e.preventDefault();e.stopImmediatePropagation();closePanel();return}
      if(send){e.preventDefault();e.stopImmediatePropagation();submit();return}
      if(e.target.closest('.card')&&!e.target.closest('select,option,input,button,a'))setTimeout(render,0);
    },true);
    document.addEventListener('change',e=>{if(e.target.matches('.format-select,input[name="checkoutDelivery"],input[name="deliveryType"],input[name="checkoutPayment"]'))setTimeout(render,0)});
    document.addEventListener('click',e=>{const q=e.target.closest('.lntdv-qty');if(!q)return;const code=q.dataset.code||'';const delta=parseInt(q.dataset.delta||'0',10)||0;const card=cards().find(c=>(c.querySelector('.meta strong')?.textContent.trim()||'')===code);if(card){card.dataset.quantity=Math.max(1,(parseInt(card.dataset.quantity||'1',10)||1)+delta);render()}},true);
    ['customerName','customerEmail','customerStreet','customerZip','customerCity','customerNote'].forEach(id=>$(id)?.addEventListener('input',render));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
    $('orderPanel')?.addEventListener('click',e=>{if(e.target===$('orderPanel'))closePanel()});
    // Elimina l'aggiunta dinamica precedente che duplicava le opzioni di ritiro.
    $('lntdvCheckoutOptions')?.remove();
    fetch(ENDPOINT+'?action=config').then(r=>r.json()).then(x=>{if(x&&x.ok){BANK_IBAN=String(x.iban||'');BANK_HOLDER=String(x.accountHolder||'Edvinas Dragoni')}}).catch(()=>{}).finally(()=>{restore();rememberUrl();render()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


/* LNTDV FINAL UX FIX 2026-09-19
   - Never open the order summary automatically on normal page load.
   - Keep the order summary as a compact control in the lower-right corner.
   - Add "Tracking ordine" to the site's existing hamburger/navigation menu.
   - Preserve tracking links (?ordine=...&token=...) and open tracking automatically only
     when a customer follows a valid tracking link.
*/
(function(){
  'use strict';
  function closeOrderOnNormalLoad(){
    try{
      const q=new URLSearchParams(location.search);
      const hasTracking=!!(q.get('ordine')&&q.get('token'));
      const panel=document.getElementById('orderPanel');
      if(!hasTracking && panel){
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden','true');
        document.documentElement.classList.remove('lntdv-order-open');
        document.body.classList.remove('lntdv-order-open');
        document.body.style.overflow='';
      }
    }catch(e){}
  }
  function addTrackingMenuLink(){
    if(document.getElementById('lntdv-menu-tracking')) return;
    const selectors=[
      'header nav','header .nav','header .menu','header .mobile-menu',
      'header .nav-menu','header .menu-links','nav','[role="navigation"]',
      '.mobile-menu','.nav-menu','.menu-links','.menu'
    ];
    let host=null;
    for(const sel of selectors){
      const el=document.querySelector(sel);
      if(el){host=el;break;}
    }
    if(!host) return;
    const link=document.createElement('a');
    link.id='lntdv-menu-tracking';
    link.href='#trackingSection';
    link.textContent='Tracking ordine';
    link.setAttribute('aria-label','Tracking ordine');
    link.style.cssText='display:block!important;';
    link.addEventListener('click',function(e){
      e.preventDefault();
      const section=document.getElementById('trackingSection');
      if(section) section.scrollIntoView({behavior:'smooth',block:'start'});
      const menuButton=document.querySelector(
        '[aria-expanded="true"][aria-controls], .menu-toggle.active, .hamburger.active, .hamburger.is-open'
      );
      if(menuButton && typeof menuButton.click==='function') menuButton.click();
    });
    const list=host.matches('ul,ol') ? host : host.querySelector('ul,ol');
    if(list){
      const li=document.createElement('li');
      li.appendChild(link);
      list.appendChild(li);
    }else{
      host.appendChild(link);
    }
  }
  function initFinalUx(){
    closeOrderOnNormalLoad();
    addTrackingMenuLink();
    setTimeout(addTrackingMenuLink,500);
    setTimeout(addTrackingMenuLink,1500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initFinalUx,{once:true});
  else initFinalUx();
})();


/* LNTDV — ANTI ACCIDENTAL CHECKOUT OPEN v2026-09-19
   Il riepilogo ordine si apre SOLO dopo una pressione intenzionale sul pulsante.
   Scorrimento/touch/swipe sulla pagina non può aprirlo.
*/
(function(){
  'use strict';
  let intentionalOpen=false;
  let downX=0, downY=0, downTarget=null, moved=false;

  function isOpenButton(el){
    return !!(el && el.closest && el.closest('#openOrder'));
  }
  function panel(){
    return document.getElementById('orderPanel');
  }
  function trackingUrl(){
    try{
      const q=new URLSearchParams(location.search);
      return !!(q.get('ordine') && q.get('token'));
    }catch(e){ return false; }
  }
  function forceClosed(){
    if(trackingUrl()) return;
    const p=panel();
    if(!p) return;
    p.classList.remove('active');
    p.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('lntdv-order-open');
    document.body.classList.remove('lntdv-order-open');
    document.body.style.overflow='';
  }

  document.addEventListener('pointerdown',function(e){
    downTarget=e.target;
    downX=e.clientX;
    downY=e.clientY;
    moved=false;
    if(!isOpenButton(e.target)) intentionalOpen=false;
  },true);

  document.addEventListener('pointermove',function(e){
    if(Math.abs(e.clientX-downX)>8 || Math.abs(e.clientY-downY)>8) moved=true;
  },true);

  document.addEventListener('pointerup',function(e){
    if(!isOpenButton(downTarget) || moved || e.pointerType==='touch'){
      intentionalOpen=false;
      return;
    }
    intentionalOpen=true;
  },true);

  document.addEventListener('click',function(e){
    const btn=e.target.closest?.('#openOrder');
    if(!btn) return;
    if(!intentionalOpen || moved){
      e.preventDefault();
      e.stopImmediatePropagation();
      forceClosed();
      return;
    }
    intentionalOpen=true;
    setTimeout(()=>{intentionalOpen=false;},1200);
  },true);

  // Qualunque apertura non associata al pulsante viene chiusa.
  const obs=new MutationObserver(function(){
    const p=panel();
    if(p && p.classList.contains('active') && !trackingUrl() && !intentionalOpen){
      forceClosed();
    }
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['class'],subtree:true});
  obs.observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});
  window.addEventListener('scroll',function(){
    if(!trackingUrl()) forceClosed();
  },{passive:true});
  window.addEventListener('touchmove',function(){
    if(!trackingUrl()) forceClosed();
  },{passive:true});
  window.addEventListener('pageshow',forceClosed);
  setTimeout(forceClosed,0);
  setTimeout(forceClosed,250);
  setTimeout(forceClosed,1000);
})();


/* LNTDV FINAL ORDER UI — 2026-09-19 06:00
   Il riepilogo NON deve mai aprirsi automaticamente.
   Prima della selezione di una fotografia non deve comparire alcuna scheda.
   Dopo la prima selezione compare soltanto un pulsante/pill discreto;
   il checkout completo si apre esclusivamente con un tocco/click intenzionale
   sul pulsante "Riepilogo ordine".
*/
(function(){
  'use strict';

  function hasTrackingLink(){
    try{
      const q=new URLSearchParams(location.search);
      return !!(q.get('ordine') && q.get('token'));
    }catch(e){ return false; }
  }

  function closeCheckoutOnEntry(){
    if(hasTrackingLink()) return;
    const panel=document.getElementById('orderPanel');
    if(!panel) return;
    panel.classList.remove('active','open','show');
    panel.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('lntdv-order-open');
    document.body.classList.remove('lntdv-order-open');
    document.body.style.overflow='';
    document.body.style.position='';
  }

  function syncOrderControl(){
    const panel=document.getElementById('orderPanel');
    const bar=document.getElementById('orderBar');
    if(panel && !hasTrackingLink() && !bar?.classList.contains('active')){
      panel.classList.remove('active','open','show');
      panel.setAttribute('aria-hidden','true');
    }
    if(bar){
      const count=document.querySelectorAll('.card.selected').length;
      const visible=count>0;
      bar.setAttribute('aria-hidden',visible?'false':'true');
      bar.classList.toggle('show',visible);
      bar.classList.toggle('active',visible);
    }
  }

  // Esegui subito e di nuovo dopo che eventuali script inline hanno terminato.
  closeCheckoutOnEntry();
  syncOrderControl();
  setTimeout(closeCheckoutOnEntry,0);
  setTimeout(closeCheckoutOnEntry,100);
  setTimeout(closeCheckoutOnEntry,500);
  setTimeout(syncOrderControl,0);
  setTimeout(syncOrderControl,100);
  setTimeout(syncOrderControl,500);

  window.addEventListener('pageshow',closeCheckoutOnEntry);
  window.addEventListener('load',function(){
    closeCheckoutOnEntry();
    syncOrderControl();
  });

  // Uno scroll, swipe o caricamento non può aprire il checkout.
  window.addEventListener('scroll',function(){
    if(!hasTrackingLink()) closeCheckoutOnEntry();
  },{passive:true});

  // Se un vecchio handler aggiunge "active" senza il pulsante, lo richiudiamo.
  const panel=document.getElementById('orderPanel');
  if(panel){
    const observer=new MutationObserver(function(){
      if(!hasTrackingLink() && panel.classList.contains('active')){
        const btn=document.getElementById('openOrder');
        if(!btn || !window.__lntdvIntentionalOrderOpen){
          panel.classList.remove('active','open','show');
          panel.setAttribute('aria-hidden','true');
          document.documentElement.classList.remove('lntdv-order-open');
          document.body.classList.remove('lntdv-order-open');
          document.body.style.overflow='';
        }
      }
    });
    observer.observe(panel,{attributes:true,attributeFilter:['class','aria-hidden']});
  }

  // Stato esplicito: il solo pulsante di riepilogo può autorizzare l'apertura.
  document.addEventListener('click',function(e){
    const btn=e.target.closest?.('#openOrder');
    if(!btn) return;
    window.__lntdvIntentionalOrderOpen=true;
    setTimeout(function(){window.__lntdvIntentionalOrderOpen=false;},1200);
  },true);
})();


/* LNTDV PHOTO 1 CACHE-BUST — 2026-09-19 */
(function(){
  try{
    const first=document.querySelector('.grid .card:first-child img');
    if(first && /\/images\/natura-01\.jpg(?:[?#]|$)/i.test(first.getAttribute('src')||'')){
      const src=first.getAttribute('src').split('#')[0].split('?')[0];
      first.setAttribute('src',src+'?v=20260919-photo01-original');
    }
  }catch(e){}
})();


/* LNTDV — ORIENTAMENTO FOTO PER STAMPA — 2026-09-19 */
(function(){
  'use strict';
  function apply(){
    document.querySelectorAll('.card img').forEach(img=>{
      img.style.transform='none';
      img.style.objectFit='contain';
      img.style.width='100%';
      img.style.height='auto';
      img.style.aspectRatio='auto';
      img.style.imageOrientation='from-image';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();


/* LNTDV — FIRST PHOTO RENDER REFRESH — 2026-09-19 */
(function(){
  function refreshFirstPhoto(){
    const card=[...document.querySelectorAll('.card')].find(c=>(c.querySelector('.meta strong')?.textContent||'').trim()==='LNTDV-001');
    const img=card?.querySelector('img');
    if(!img||img.dataset.lntdvFirstRefresh==='1')return;
    img.loading='eager';img.decoding='sync';img.fetchPriority='high';
    const src=img.getAttribute('src')||'';
    if(src.startsWith('./images/natura-01.jpg')&&!/[?&]v=/.test(src)){
      img.dataset.lntdvFirstRefresh='1';
      img.src=src+(src.includes('?')?'&':'?')+'v=20260919';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshFirstPhoto,{once:true});else refreshFirstPhoto();
  window.addEventListener('load',refreshFirstPhoto,{once:true});
})();


/* LNTDV — FORMAT SELECTION UX v2026-09-19 */
(function(){
  'use strict';
  const ORDER=['Forex','Stampa fotografica','File digitale in alta risoluzione'];
  const LABELS={
    'Forex':'Forex — €50',
    'Stampa fotografica':'Stampa fotografica — €40',
    'File digitale in alta risoluzione':'Stampa digitale ad alta definizione — €25'
  };
  function apply(){
    document.querySelectorAll('.format-select').forEach(select=>{
      const placeholder=select.querySelector('option[value=""]');
      const opts=ORDER.map(v=>select.querySelector('option[value="'+v+'"]')).filter(Boolean);
      opts.forEach(o=>{o.textContent=LABELS[o.value];select.appendChild(o)});
      if(placeholder)select.insertBefore(placeholder,select.firstChild);
      select.setAttribute('aria-label','Scegli il formato per questa fotografia');
    });
  }
  function softSelect(card){
    if(!card)return;
    card.classList.add('lntdv-format-selected');
    clearTimeout(card.__lntdvSoftTimer);
    card.__lntdvSoftTimer=setTimeout(()=>card.classList.remove('lntdv-format-selected'),900);
  }
  document.addEventListener('change',function(e){
    const select=e.target.closest?.('.format-select');
    if(!select)return;
    const card=select.closest('.card');
    if(!select.value){
      if(card){card.classList.remove('selected','lntdv-format-selected');card.setAttribute('aria-pressed','false');}
      return;
    }
    if(card){
      card.classList.add('selected');
      card.setAttribute('aria-pressed','true');
      softSelect(card);
    }
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('load',apply,{once:true});
  // NON usare MutationObserver qui: apply() sposta le option con appendChild() e
  // osservare il body crea un ciclo continuo di mutazioni che può bloccare il renderer.
  // L'aggiornamento viene già eseguito su DOMContentLoaded e load.

})();

/* LNTDV FINAL PHOTO/FORMAT STABILITY FIX — 2026-09-19 07:54 */
(function(){
  'use strict';

  // RENDERING CATALOGO DEFINITIVO:
  // - una sola immagine per scheda, sempre collegata al JPG del relativo codice
  // - contenitore con rapporto coerente (4:3 orizzontale / 3:4 verticale)
  // - nessun crop
  // - verticale ruotata una sola volta, via CSS, dentro un contenitore dedicato
  // - selettore formato sempre sotto la fotografia
  // - niente Base64, niente filtri, niente effetti scroll-driven

  const ORIENTATION_VERTICAL=new Set();

  function getCode(card){
    const strong=card.querySelector('.meta strong');
    const raw=(strong?.textContent||card.querySelector('img')?.alt||'').trim();
    const m=raw.match(/LNTDV-(\d{3})/i);
    return m?m[1]:'';
  }

  function getOrientation(card,code){
    const small=(card.querySelector('.meta small')?.textContent||'').trim().toLowerCase();
    const img=card.querySelector('img');
    const explicit=(card.dataset.orientation||img?.dataset.orientation||'').trim().toLowerCase();
    if(explicit==='vertical'||explicit==='horizontal') return explicit;
    if(/verticale|vertical/.test(small)) return 'vertical';
    if(img && img.naturalWidth && img.naturalHeight) return img.naturalHeight>img.naturalWidth?'vertical':'horizontal';
    return 'horizontal';
  }

  function ensureImage(card,code){
    if(!code)return null;
    let img=card.querySelector('img');
    const expected='./images/natura-'+code.replace(/^0/,'').padStart(2,'0')+'.jpg';
    // Build the filename from the three-digit catalog code.
    const n=String(parseInt(code,10)).padStart(2,'0');
    const expectedSrc='./images/natura-'+n+'.jpg';
    if(!img){
      img=document.createElement('img');
      img.alt='LNTDV-'+code;
      card.insertBefore(img,card.querySelector('.meta')||null);
    }
    img.alt='LNTDV-'+code;
    img.draggable=false;
    img.loading=parseInt(code,10)<=2?'eager':'lazy';
    img.decoding='async';
    img.setAttribute('data-orientation',getOrientation(card,code));
    const current=img.getAttribute('src')||'';
    const clean=current.split('?')[0];
    if(clean!==expectedSrc){
      img.setAttribute('src',expectedSrc+'?v=20260919-final-photo');
      delete img.dataset.lntdvImageError;
    }else if(!/[?&]v=20260919-final-photo(?:&|$)/.test(current)){
      img.setAttribute('src',expectedSrc+'?v=20260919-final-photo');
    }
    return img;
  }

  function setImportant(el,prop,value){
    el.style.setProperty(prop,value,'important');
  }

  function renderCard(card){
    if(!(card instanceof HTMLElement))return;
    const code=getCode(card);
    if(!code)return;

    const orientation=getOrientation(card,code);
    card.dataset.orientation=orientation;

    const img=ensureImage(card,code);
    if(!img)return;

    let stage=img.parentElement;
    if(!stage||!stage.classList.contains('lntdv-photo-stage')){
      stage=document.createElement('div');
      stage.className='lntdv-photo-stage';
      img.parentNode?.insertBefore(stage,img);
      stage.appendChild(img);
    }

    const meta=card.querySelector('.meta');
    const choice=card.querySelector('.print-choice');

    // The card is a strict vertical stack: photo -> format -> metadata.
    setImportant(card,'display','flex');
    setImportant(card,'flex-direction','column');
    setImportant(card,'align-items','stretch');
    setImportant(card,'min-width','0');
    setImportant(stage,'order','1');
    setImportant(stage,'width','100%');
    setImportant(stage,'box-sizing','border-box');
    setImportant(stage,'display','flex');
    setImportant(stage,'align-items','center');
    setImportant(stage,'justify-content','center');
    setImportant(stage,'overflow','visible');
    setImportant(stage,'margin','0');
    setImportant(stage,'border-radius','14px');
    setImportant(stage,'background','transparent');
    setImportant(stage,'aspect-ratio','auto');
    setImportant(stage,'height','auto');
    setImportant(stage,'line-height','0');
    setImportant(stage,'border','2px solid #6b4734');
    setImportant(stage,'box-sizing','border-box');

    // Neutral image defaults: no crop, no stretch, no filters.
    setImportant(img,'display','block');
    setImportant(img,'object-fit','contain');
    setImportant(img,'object-position','center center');
    setImportant(img,'filter','none');
    setImportant(img,'-webkit-filter','none');
    setImportant(img,'opacity','1');
    setImportant(img,'mix-blend-mode','normal');
    setImportant(img,'image-orientation','from-image');
    setImportant(img,'transition','none');
    setImportant(img,'margin','0 auto');
    if(orientation==='vertical'){
      setImportant(img,'width','100%');
      setImportant(img,'height','auto');
      setImportant(img,'max-width','100%');
      setImportant(img,'max-height','none');
      setImportant(img,'transform','none');
      setImportant(img,'transform-origin','center center');
    }else{
      setImportant(img,'width','100%');
      setImportant(img,'height','auto');
      setImportant(img,'max-width','100%');
      setImportant(img,'max-height','none');
      setImportant(img,'transform','none');
      setImportant(img,'transform-origin','center center');
    }

    // Keep the format selector inside .meta, but force .meta itself below the photo.
    if(meta){
      setImportant(meta,'order','2');
      setImportant(meta,'width','100%');
      setImportant(meta,'min-width','0');
      setImportant(meta,'box-sizing','border-box');
      setImportant(meta,'display','flex');
      setImportant(meta,'flex-direction','column');
      setImportant(meta,'align-items','stretch');
      setImportant(meta,'overflow','visible');
      setImportant(meta,'position','relative');
      setImportant(meta,'z-index','2');
    }
    if(choice){
      setImportant(choice,'display','block');
      setImportant(choice,'visibility','visible');
      setImportant(choice,'width','100%');
      setImportant(choice,'box-sizing','border-box');
      setImportant(choice,'order','0');
      setImportant(choice,'position','relative');
      setImportant(choice,'z-index','3');
      setImportant(choice,'margin','0 0 12px');
      setImportant(choice,'padding','10px 11px');
      setImportant(choice,'border','1px solid #d8c6b4');
      setImportant(choice,'border-radius','11px');
      setImportant(choice,'background','#fcfaf7');
    }
    const select=card.querySelector('.format-select');
    if(select){
      setImportant(select,'display','block');
      setImportant(select,'visibility','visible');
      setImportant(select,'width','100%');
      setImportant(select,'min-width','0');
      setImportant(select,'min-height','48px');
      setImportant(select,'height','48px');
      setImportant(select,'box-sizing','border-box');
      setImportant(select,'appearance','auto');
      setImportant(select,'-webkit-appearance','auto');
      setImportant(select,'opacity','1');
      setImportant(select,'transform','none');
    }

    const check=card.querySelector('.selection-check');
    if(check){
      setImportant(check,'position','absolute');
      setImportant(check,'z-index','10');
    }
  }

  function renderAll(){
    const grids=document.querySelectorAll('.grid, section.grid, section.catalog');
    grids.forEach(grid=>{
      setImportant(grid,'display','grid');
      setImportant(grid,'grid-template-columns','1fr');
      setImportant(grid,'gap','22px');
      setImportant(grid,'width','100%');
    });
    document.querySelectorAll('.grid .card, .catalog .card, .card').forEach(renderCard);
  }

  function start(){
    renderAll();
    // Older catalog scripts observe child-list changes. Re-apply one frame later
    // so their legacy inline styles cannot leave a portrait rotated incorrectly.
    setTimeout(renderAll,0);
    requestAnimationFrame(renderAll);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
  window.addEventListener('load',renderAll,{once:true});

  // Nessun MutationObserver sul body: renderAll() modifica stili/attributi e
  // un observer globale creerebbe un ciclo di rendering continuo durante lo scroll.

})();
