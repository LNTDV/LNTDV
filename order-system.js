// LNTDV — ordine/catalogo, motore unico cross-device — 2026-09-19
(function(){
  'use strict';

  const ENDPOINT='https://script.google.com/macros/s/AKfycbwYI8raiMQ830nMMtRm3FQueXv2a9vbrdH3SJkg7csqGEdnd1vIKS1Y1-jwjJvCPBA/exec';
  const CART_KEY='lntdv_cart_v5';
  const TRACK_KEY='lntdv_tracking_v5';
  const PRICES={
    'Stampa fotografica':40,
    'Forex':50,
    'File digitale in alta risoluzione':25
  };
  const SHIPPING=10;
  let busy=false;

  const $=id=>document.getElementById(id);
  const money=n=>'€'+Number(n||0).toFixed(2).replace('.',',');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function read(key,fallback){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'null');
      return value==null?fallback:value;
    }catch(e){ return fallback; }
  }
  function write(key,value){
    try{ localStorage.setItem(key,JSON.stringify(value)); }catch(e){}
  }
  function cards(){ return Array.from(document.querySelectorAll('.card')); }
  function selected(){ return cards().filter(c=>c.classList.contains('selected')); }

  function itemFromCard(card){
    const code=card.querySelector('.meta strong')?.textContent.trim()||'Fotografia';
    const select=card.querySelector('.format-select');
    const format=select?.value||'';
    const image=card.querySelector('img')?.getAttribute('src')||'';
    const small=(card.querySelector('.meta small')?.textContent||'').trim();
    const orientation=(card.dataset.orientation||small.replace(/^Orientamento:\s*/i,'')).trim();
    const quantity=Math.max(1,parseInt(card.dataset.quantity||'1',10)||1);
    return {card,code,format,image,orientation,quantity,price:Number(PRICES[format]||0)};
  }

  function items(){ return selected().map(itemFromCard); }

  function totals(list){
    const count=list.reduce((n,x)=>n+x.quantity,0);
    const normal=list.reduce((n,x)=>n+x.price*x.quantity,0);
    let promo=null;
    if(count===1) promo=50;
    else if(count===2) promo=80;
    else if(count===3) promo=120;
    const subtotal=promo==null?normal:promo;
    const shipping=count>2?SHIPPING:0;
    return {count,normal,subtotal,promo,shipping,total:subtotal+shipping};
  }

  function saveCart(){
    write(CART_KEY,items().map(x=>({code:x.code,format:x.format,quantity:x.quantity})));
  }

  function clearOldCarts(){
    ['lntdv_cart_v3','lntdv_cart_v4','lntdv_order_quantities_v1'].forEach(k=>{
      try{localStorage.removeItem(k);}catch(e){}
    });
    write(CART_KEY,[]);
  }

  function render(){
    const list=items(), t=totals(list);
    const bar=$('orderBar');

    if(bar){
      const visible=list.length>0;
      bar.classList.toggle('show',visible);
      bar.classList.toggle('active',visible);
      bar.setAttribute('aria-hidden',visible?'false':'true');
    }
    if($('summaryCount')) $('summaryCount').textContent=String(t.count);
    if($('orderBarCount')) $('orderBarCount').textContent=t.count+' foto';
    if($('orderBarTotal')) $('orderBarTotal').textContent=money(t.total);
    if($('orderTotal')) $('orderTotal').textContent=money(t.total);

    const orderList=$('orderList');
    if(orderList){
      orderList.innerHTML=list.length
        ? list.map((x,i)=>'<div class="checkout-photo-row">'+
          '<div class="checkout-photo-num">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="checkout-photo-thumb">'+(x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.code)+'" draggable="false">':'')+'</div>'+
          '<div class="checkout-photo-info"><div class="checkout-photo-title">'+esc(x.code)+'</div>'+
          '<div class="checkout-photo-detail">'+esc(x.orientation?x.orientation+' · ':'')+esc(x.format||'Formato da selezionare')+'</div></div>'+
          '<div class="checkout-photo-price">'+money(x.price*x.quantity)+'</div></div>').join('')
        : '<div class="checkout-empty">Nessuna fotografia selezionata.</div>';
    }

    const name=$('customerName')?.value.trim()||'';
    const email=$('customerEmail')?.value.trim()||'';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const complete=list.length>0 && list.every(x=>!!x.format);
    const ready=complete && !!name && validEmail;

    if($('completePayment')) $('completePayment').disabled=!ready||busy;
    if($('paymentStatus')){
      $('paymentStatus').textContent=!list.length
        ? 'Seleziona almeno una fotografia.'
        : !complete
        ? 'Scegli il formato per ogni fotografia.'
        : !ready
        ? 'Inserisci nome e un indirizzo email valido.'
        : 'Ordine pronto per l’invio.';
    }

    saveCart();
  }

  function openPanel(){
    render();
    const panel=$('orderPanel');
    if(!panel) return;
    panel.classList.add('active');
    panel.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('lntdv-order-open');
    document.body.classList.add('lntdv-order-open');
    const close=$('closeOrder');
    if(close) setTimeout(()=>close.focus(),0);
  }

  function closePanel(){
    const panel=$('orderPanel');
    if(!panel) return;
    panel.classList.remove('active','show','open');
    panel.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('lntdv-order-open');
    document.body.classList.remove('lntdv-order-open');
    document.body.style.overflow='';
  }

  function token(){
    try{
      if(window.crypto?.randomUUID) return crypto.randomUUID().replace(/-/g,'').toUpperCase();
      const a=new Uint8Array(24);
      crypto.getRandomValues(a);
      return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();
    }catch(e){
      return (Date.now().toString(36)+Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/gi,'').toUpperCase();
    }
  }

  function orderId(){ return 'LNTDV-'+Date.now().toString(36).toUpperCase(); }

  function deliveryValue(){
    return $('lntdvDelivery')?.value ||
      document.querySelector('input[name="deliveryType"]:checked')?.value ||
      document.querySelector('input[name="checkoutDelivery"]:checked')?.value ||
      'Ritiro';
  }

  function postPayload(payload){
    return new Promise((resolve,reject)=>{
      const frame=document.createElement('iframe');
      const name='lntdv-submit-'+Date.now();
      frame.name=name;
      frame.setAttribute('aria-hidden','true');
      frame.style.cssText='position:absolute;width:1px;height:1px;border:0;opacity:0;left:-9999px;top:-9999px;';
      const form=document.createElement('form');
      form.method='POST';
      form.action=ENDPOINT;
      form.target=name;
      form.style.display='none';
      const input=document.createElement('input');
      input.type='hidden';
      input.name='payload';
      input.value=JSON.stringify(payload);
      form.appendChild(input);
      document.body.append(frame,form);
      let done=false;
      const finish=ok=>{
        if(done)return;
        done=true;
        setTimeout(()=>{try{frame.remove();form.remove();}catch(e){}},1000);
        ok?resolve():reject(new Error('timeout'));
      };
      frame.addEventListener('load',()=>finish(true),{once:true});
      form.submit();
      setTimeout(()=>finish(true),9000);
    });
  }

  function rememberTracking(id,t){
    const old=read(TRACK_KEY,[]);
    const list=Array.isArray(old)?old.filter(x=>x&&x.orderId!==id):[];
    list.unshift({orderId:id,token:t,savedAt:new Date().toISOString()});
    write(TRACK_KEY,list.slice(0,20));
  }

  function resetSelection(shouldRender=true){
    cards().forEach(card=>{
      card.classList.remove('selected','lntdv-format-selected');
      card.setAttribute('aria-pressed','false');
      delete card.dataset.quantity;
    });
    write(CART_KEY,[]);
    if(shouldRender) render();
  }

  // The catalog's existing card handler selects/deselects cards.
  // This listener only refreshes the order state; it never toggles the card twice.
  document.addEventListener('click',e=>{
    if(e.target.closest('#openOrder') || e.target.closest('#closeOrder')) return;
    if(e.target.closest('.card') && !e.target.closest('select,option,input,button,a')){
      setTimeout(render,0);
    }
  },false);

  document.addEventListener('change',e=>{
    const select=e.target.closest?.('.format-select');
    if(select){
      const card=select.closest('.card');
      if(card){
        if(select.value){
          card.classList.add('selected');
          card.setAttribute('aria-pressed','true');
        }else{
          card.classList.remove('selected');
          card.setAttribute('aria-pressed','false');
        }
      }
      render();
    }
    if(e.target.matches?.('input[name="deliveryType"],input[name="checkoutDelivery"]')) render();
  },false);

  document.addEventListener('input',e=>{
    if(e.target.matches?.('#customerName,#customerEmail,#customerStreet,#customerZip,#customerCity,#customerNote')) render();
  },false);

  // iPhone/Safari HARD FALLBACK: handle checkout controls in capture phase so
  // another catalog listener cannot cancel the tap before the order system sees it.
  document.addEventListener('click',function(e){
    const open=e.target.closest?.('#openOrder');
    const close=e.target.closest?.('#closeOrder');
    if(open){ e.preventDefault(); e.stopImmediatePropagation(); openPanel(); return; }
    if(close){ e.preventDefault(); e.stopImmediatePropagation(); closePanel(); return; }
  },true);

  document.addEventListener('change',function(e){
    const select=e.target.closest?.('.format-select');
    if(!select) return;
    const card=select.closest('.card');
    if(!card) return;
    if(select.value){
      card.classList.add('selected');
      card.setAttribute('aria-pressed','true');
    }else{
      card.classList.remove('selected');
      card.setAttribute('aria-pressed','false');
    }
    render();
  },true);

  // Native click works with mouse, keyboard and touch on iPhone/Android.
  $('openOrder')?.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    openPanel();
  });

  $('closeOrder')?.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    closePanel();
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') closePanel();
  });

  $('completePayment')?.addEventListener('click',async e=>{
    e.preventDefault();
    if(busy)return;

    const list=items();
    const name=$('customerName')?.value.trim()||'';
    const email=$('customerEmail')?.value.trim()||'';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if(!list.length || list.some(x=>!x.format) || !name || !validEmail){
      render();
      return;
    }

    const t=totals(list);
    const id=orderId();
    const trackingToken=token();
    const payload={
      orderId:id,
      paymentMethod:'Bonifico bancario',
      paymentStatus:'IN_ATTESA_DI_PAGAMENTO',
      orderStatus:'ORDINE RICEVUTO',
      customer:{
        name,
        email,
        street:$('customerStreet')?.value.trim()||'',
        zip:$('customerZip')?.value.trim()||'',
        city:$('customerCity')?.value.trim()||'',
        note:$('customerNote')?.value.trim()||''
      },
      items:list.map(x=>({
        title:x.code,
        format:x.format,
        orientation:x.orientation,
        price:x.price,
        quantity:x.quantity
      })),
      subtotal:t.subtotal,
      baseTotal:t.subtotal,
      shippingFee:t.shipping,
      total:t.total,
      promotion:t.promo!==null?'Promozione dedicata: 1 foto €50, 2 foto €80, 3 foto €120':'',
      deliveryType:deliveryValue(),
      requestedTracking:true,
      trackingToken
    };

    busy=true;
    if($('completePayment')) $('completePayment').disabled=true;
    if($('paymentStatus')) $('paymentStatus').textContent='Invio ordine in corso…';

    let sent=false;
    try{
      await postPayload(payload);
      sent=true;
      rememberTracking(id,trackingToken);
      write('lntdv_last_order_v5',{orderId:id,token:trackingToken,email,total:t.total,createdAt:new Date().toISOString()});

      if($('paymentStatus')){
        $('paymentStatus').innerHTML='<strong>Ordine ricevuto.</strong><br>ID ordine: <strong>'+esc(id)+'</strong><br><br>Riceverai via email le indicazioni per il pagamento e la conferma dell’ordine.';
      }

      resetSelection(false);
      if($('paymentStatus')){
        $('paymentStatus').innerHTML='<strong>Ordine ricevuto.</strong><br>ID ordine: <strong>'+esc(id)+'</strong><br><br>Riceverai via email le indicazioni per il pagamento e la conferma dell’ordine.';
      }
      if($('orderPanel')){
        $('orderPanel').classList.add('active');
        $('orderPanel').setAttribute('aria-hidden','false');
      }
    }catch(err){
      if($('paymentStatus')) $('paymentStatus').textContent='Non è stato possibile inviare l’ordine. Controlla la connessione e riprova.';
    }finally{
      busy=false;
      if(!sent) render();
    }
  });

  // Start clean on every catalog entry: no stale selection from a previous visit.
  clearOldCarts();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',render,{once:true});
  }else{
    render();
  }
})();
