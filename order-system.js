// LNTDV — ordine/catalogo, motore unico cross-device — 2026-09-19
(function(){
  'use strict';

  const ENDPOINT='https://script.google.com/macros/s/AKfycbzw1FGh5SVtWTb-20v6acj9IxUvB124dGiELWH-aZ70YuAKbYkaPmwX0ocf64/exec';
  const CART_KEY='lntdv_cart_v5';
  const TRACK_KEY='lntdv_tracking_v5';
  const PRICES={
    'Stampa fotografica':40,
    'Forex':50,
    'File digitale in alta risoluzione':25
  };
  const FORMAT_LABELS={
    'Stampa fotografica':'50 × 70 cm — Stampa fotografica',
    'Forex':'50 × 70 cm — Pannello Forex',
    'File digitale in alta risoluzione':'50 × 70 cm — File digitale alta risoluzione'
  };
  const SHIPPING=10;
  const BANK_TRANSFER={accountHolder:"Giulia Principi",iban:"LU538100SATI55551718",reasonPrefix:"LNTDV"};
  let busy=false;
  window.lntdvOrderSummaryUnlocked=false;

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
    const materialNote=card.querySelector('.material-note')?.textContent.trim()||'';
    return {card,code,format,image,orientation,quantity,materialNote,price:PRICES[format]};
  }

  function items(){ return selected().map(itemFromCard); }

  function totals(list){
    const count=list.reduce((n,x)=>n+x.quantity,0);
    const normal=list.reduce((n,x)=>n+x.price*x.quantity,0);
    const promo=0;
    const subtotal=Math.max(0,normal-promo);
    const shipping=deliveryFee(list);
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
    // Un solo comando visibile per il riepilogo: evita il doppio pulsante su iPhone, Android, Windows e macOS.
    const mailButton=$('orderMailSummary');
    if(mailButton){
      mailButton.hidden=true;
      mailButton.disabled=true;
    }
    const openButton=$('openOrder');
    const completeSelection=list.length>0 && list.every(x=>!!x.format && PRICES[x.format]!=null);
    if(openButton){
      openButton.disabled=!completeSelection;
      openButton.setAttribute('aria-disabled',completeSelection?'false':'true');
      openButton.textContent='RIEPILOGO ORDINE →';
    }
    if($('orderTotal')) $('orderTotal').textContent=money(t.total);

    const orderList=$('orderList');
    if(orderList){
      orderList.innerHTML=list.length
        ? list.map((x,i)=>{
          const formatOptions=Object.keys(PRICES).map(f=>'<option value="'+esc(f)+'" '+(x.format===f?'selected':'')+'>'+esc(FORMAT_LABELS[f]||f)+' — '+money(PRICES[f])+'</option>').join('');
          return '<article class="checkout-photo-card" data-code="'+esc(x.code)+'">'+
            '<div class="checkout-photo-visual">'+
              (x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.code)+'" draggable="false">':'')+
              '<span class="checkout-photo-index">'+String(i+1).padStart(2,'0')+'</span>'+
              '<button type="button" class="checkout-remove" data-code="'+esc(x.code)+'" aria-label="Rimuovi '+esc(x.code)+'">×</button>'+
            '</div>'+
            '<div class="checkout-photo-copy">'+
              '<div class="checkout-photo-title">'+esc(x.code)+'</div>'+
              '<div class="checkout-photo-detail">'+esc(x.orientation||'')+' · 50 × 70 cm</div>'+
              '<label class="checkout-format-label">FORMATO 50 × 70 cm<select class="checkout-format-select" data-code="'+esc(x.code)+'" aria-label="Formato '+esc(x.code)+'">'+formatOptions+'</select></label>'+
              '<div class="checkout-photo-footer"><strong>'+money(x.price*x.quantity)+'</strong><span>1 fotografia</span></div>'+
            '</div>'+
          '</article>';
        }).join('')
        : '<div class="checkout-empty">Nessuna fotografia selezionata.<br><button type="button" id="emptyAddPhotos" class="checkout-empty-action">+ AGGIUNGI FOTOGRAFIE</button></div>';
    }

    const name=$('customerName')?.value.trim()||'';
    const email=$('customerEmail')?.value.trim()||'';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const complete=list.length>0 && list.every(x=>!!x.format && PRICES[x.format]!=null);
    const delivery=deliveryValue();
    const addressReady=delivery!=='Spedizione' || (!!$('customerStreet')?.value.trim() && !!$('customerZip')?.value.trim() && !!$('customerCity')?.value.trim());
    const ready=complete && !!name && validEmail && addressReady;

    if($('completePayment')) $('completePayment').disabled=!ready||busy;
    if($('paymentStatus')){
      $('paymentStatus').textContent=!list.length
        ? 'Seleziona almeno una fotografia.'
        : !complete
        ? 'Scegli il formato per ogni fotografia.'
        : !ready
        ? 'Inserisci nome e un indirizzo email valido.'
        : 'Dati completi. Premi “CONFERMA E INVIA ORDINE” per registrare la richiesta.';
    }

    saveCart();
  }

  function syncCheckoutAccessibility(panel){
    if(!panel)return;
    const isOpen=panel.classList.contains('active');
    if(isOpen) panel.removeAttribute('inert');
    else panel.setAttribute('inert','');
    panel.setAttribute('aria-hidden',isOpen?'false':'true');
  }

  function normalizeCheckoutLayer(){
    const panel=$('orderPanel');
    if(panel && panel.parentElement !== document.body){
      document.body.appendChild(panel);
    }
    if(panel && !panel.classList.contains('active')){
      panel.classList.remove('show','open');
      panel.setAttribute('aria-hidden','true');
    }
    syncCheckoutAccessibility(panel);
  }

  function openPanel(){
    render();
    const panel=$('orderPanel');
    if(panel) {
      panel.dataset.state='summary';
      const submit=$('completePayment');
      if(submit) submit.style.display='';
      const title=panel.querySelector('.modal-title');
      if(title) title.textContent='Riepilogo ordine';
      const intro=panel.querySelector('.checkout-head p');
      if(intro) intro.textContent="Controlla le tue scelte e completa i dati per inviare l'ordine.";
    }
    if(!panel) return;
    panel.classList.add('active');
    syncCheckoutAccessibility(panel);
    document.documentElement.classList.add('lntdv-order-open');
    document.body.classList.add('lntdv-order-open');
    const close=$('closeOrder');
    if(close) setTimeout(()=>close.focus(),0);
  }

  function closePanel(){
    const panel=$('orderPanel');
    if(!panel) return;
    panel.classList.remove('active','show','open');
    syncCheckoutAccessibility(panel);
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
    return document.querySelector('input[name="deliveryType"]:checked')?.value ||
      document.querySelector('input[name="checkoutDelivery"]:checked')?.value ||
      'Ritiro';
  }

  function deliveryFee(list){
    if(deliveryValue()!=='Spedizione') return 0;
    const subtotal=(list||[]).reduce((n,x)=>n+(Number(x.price)||0)*(Number(x.quantity)||1),0);
    return subtotal>=150 ? 0 : SHIPPING;
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
      const finish=(ok,error)=>{
        if(done)return;
        done=true;
        setTimeout(()=>{try{frame.remove();form.remove();}catch(e){}},1500);
        ok?resolve():reject(error||new Error('timeout'));
      };

      // Il caricamento dell'iframe di Google Apps Script non è affidabile
      // su Safari, Android WebView, Windows e alcuni browser desktop:
      // il POST può essere ricevuto correttamente ma l'evento "load" può
      // non arrivare. Non usiamo quindi il load dell'iframe per bloccare
      // l'apertura della scelta email.
      form.submit();
      setTimeout(()=>finish(true),900);
    });
  }

  function confirmSubmittedOrder(id, token, email){
    return new Promise((resolve,reject)=>{
      const cb='lntdvConfirm_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let finished=false;
      const cleanup=()=>{try{delete window[cb]}catch(e){};try{script.remove()}catch(e){}};
      const finish=(ok,data)=>{
        if(finished)return;
        finished=true;
        cleanup();
        ok ? resolve(data) : reject(new Error((data&&data.error)||'Ordine non verificato'));
      };
      window[cb]=function(data){
        if(data && data.ok && data.received) finish(true,data);
        else finish(false,data||{error:'Ordine non trovato'});
      };
      script.src=ENDPOINT+'?action=confirm&orderId='+encodeURIComponent(id)+'&token='+encodeURIComponent(token)+'&email='+encodeURIComponent(email)+'&callback='+encodeURIComponent(cb);
      script.onerror=()=>finish(false,{error:'Impossibile verificare la registrazione dell’ordine'});
      document.body.appendChild(script);
      setTimeout(()=>finish(false,{error:'Timeout nella verifica dell’ordine'}),7000);
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

  // Selecting a photograph must NEVER open the order summary automatically.
  // The customer reviews the entire catalog first, then uses the dedicated box
  // at the end of the catalog to reach the order summary.
  function ensureOrderSummary(){
    render();
  }

  window.addEventListener('lntdv-selection-changed',function(){
    setTimeout(render,0);
    setTimeout(render,80);
  });

  function updateMaterialNotes(){
    document.querySelectorAll('.card').forEach(card=>{
      const select=card.querySelector('.format-select');
      const note=card.querySelector('.material-note');
      if(!select||!note)return;
      const v=select.value;
      note.textContent = v==='Forex'
        ? 'Pannello – Forex · pannello rigido in PVC espanso, leggero e resistente.'
        : v==='Stampa fotografica'
        ? 'Stampa fotografica · carta fotografica.'
        : v==='File digitale in alta risoluzione'
        ? 'File digitale · alta risoluzione.'
        : 'Scegli il supporto e il formato desiderato.';
    });
  }

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
      updateMaterialNotes();
      setTimeout(ensureOrderSummary,0);
      setTimeout(ensureOrderSummary,80);
    }
    if(e.target.matches?.('input[name="deliveryType"],input[name="checkoutDelivery"]')) render();
  },false);

  document.addEventListener('input',e=>{
    if(e.target.matches?.('#customerName,#customerEmail,#customerPhone,#customerStreet,#customerZip,#customerCity,#customerNote')) render();
  },false);

  // iPhone/Safari HARD FALLBACK: handle checkout controls in capture phase so
  // another catalog listener cannot cancel the tap before the order system sees it.
  document.addEventListener('click',function(e){
    const remove=e.target.closest?.('.checkout-remove');
    const add=e.target.closest?.('#continueCatalog,#emptyAddPhotos');
    if(remove){
      e.preventDefault();
      const code=remove.dataset.code;
      const card=cards().find(c=>(c.querySelector('.meta strong')?.textContent.trim()||'')===code);
      if(card){
        card.classList.remove('selected','lntdv-format-selected');
        card.setAttribute('aria-pressed','false');
        delete card.dataset.quantity;
        const select=card.querySelector('.format-select');
        if(select) select.value='';
      }
      render();
      return;
    }
    if(add){
      e.preventDefault();
      closePanel();
      const grid=document.querySelector('.grid');
      if(grid) setTimeout(()=>grid.scrollIntoView({behavior:'smooth',block:'start'}),80);
      return;
    }
    const format=e.target.closest?.('.checkout-format-select');
    if(format){
      e.preventDefault();
      const code=format.dataset.code;
      const card=cards().find(c=>(c.querySelector('.meta strong')?.textContent.trim()||'')===code);
      if(card){
        const mainSelect=card.querySelector('.format-select');
        if(mainSelect){
          mainSelect.value=format.value;
          card.classList.add('selected');
          card.setAttribute('aria-pressed','true');
        }
      }
      render();
      return;
    }
    const open=e.target.closest?.('#openOrder');
    const close=e.target.closest?.('#closeOrder');
    if(open){
      e.preventDefault(); e.stopImmediatePropagation();
      const list=items();
      if(!list.length || !list.every(x=>!!x.format && PRICES[x.format]!=null)) return;
      openPanel();
      return;
    }
    if(close){ e.preventDefault(); e.stopImmediatePropagation(); closePanel(); return; }
  },true);

  document.addEventListener('change',function(e){
    const checkoutFormat=e.target.closest?.('.checkout-format-select');
    if(checkoutFormat){
      const code=checkoutFormat.dataset.code;
      const card=cards().find(c=>(c.querySelector('.meta strong')?.textContent.trim()||'')===code);
      if(card){
        const mainSelect=card.querySelector('.format-select');
        if(mainSelect){
          mainSelect.value=checkoutFormat.value;
          card.classList.add('selected');
          card.setAttribute('aria-pressed','true');
        }
      }
      render();
      return;
    }
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
    const list=items();
    if(!list.length || !list.every(x=>!!x.format && PRICES[x.format]!=null)) return;
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

  function showMailChooser(id,list,total,trackingToken,customer={}){
    const to='info.lanostraterradavicino@gmail.com';
    const subject='Richiesta ordine '+id+' — La Nostra Terra da Vicino';
    const lines=list.map((x,i)=>(String(i+1).padStart(2,'0')+' - '+x.code+' | '+(x.orientation||'')+' | '+x.format+' | '+money(x.price*x.quantity))).join('\n');
    const tokenText=trackingToken ? '\n\nDATI PER LA TRACCIABILITÀ\nID ORDINE: '+id+'\nTOKEN: '+trackingToken+'\nLINK TRACCIAMENTO: '+('https://lntdv.it/?ordine='+encodeURIComponent(id)+'&token='+encodeURIComponent(trackingToken)) : '';
    const customerLines='DATI CLIENTE\nNOME: '+(customer.name||'')+'\nEMAIL: '+(customer.email||'')+'\nTELEFONO: '+(customer.phone||'')+'\nINDIRIZZO: '+(customer.street||'')+' — '+(customer.zip||'')+' '+(customer.city||'')+'\nNOTE: '+(customer.note||'')+'\n\n';
    const body='BUONGIORNO,\n\nRICHIESTA ORDINE '+id+' INVIATA DAL SITO LNTDV.\n\n'+customerLines+'RIEPILOGO DELL’ORDINE\n'+lines+'\n\nTOTALE: '+money(total)+tokenText+'\n\nPAGAMENTO TRAMITE BONIFICO BANCARIO\nINTESTATARIO: '+BANK_TRANSFER.accountHolder+'\nIBAN: '+BANK_TRANSFER.iban+'\nCAUSALE: '+BANK_TRANSFER.reasonPrefix+' '+id+'\n\nCORDIALI SALUTI.';
    const gmail='https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to='+encodeURIComponent(to)+'&su='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    const mailto='mailto:'+to+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    const isIOS=!!window.LNTDVPlatform?.ios || /iPhone|iPad|iPod/i.test(navigator.userAgent||'');
    const isAndroid=!!window.LNTDVPlatform?.android || /Android/i.test(navigator.userAgent||'');
    const primaryText=isAndroid?'Gmail':isIOS?'Gmail':'Gmail';
    const secondaryText=isIOS?'Apple Mail':(isAndroid?'App email':'App Mail');
    document.getElementById('lntdvMailChooser')?.remove();
    const el=document.createElement('div');
    el.id='lntdvMailChooser'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
    el.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(38,24,16,.58);font-family:Arial,sans-serif;';
    el.innerHTML='<div class="lntdv-mail-chooser-card" style="position:relative;width:min(440px,100%);box-sizing:border-box;padding:28px;border-radius:24px;background:#fbf6ef;color:#5a3b2b;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.28)"><button type="button" id="lntdvMailClose" class="lntdv-mail-close" style="position:absolute;right:14px;top:8px;border:0;background:none;font-size:30px;color:#5a3b2b">×</button><div style="font-size:10px;letter-spacing:2px;font-weight:700">ORDINE '+esc(id)+'</div><h3 style="margin:8px 0 10px;font-size:25px">Ordine registrato</h3><p style="line-height:1.55;margin:0 0 22px">La richiesta è stata registrata. Scegli il servizio email da usare per aprire la richiesta già compilata.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a id="lntdvGmailBtn" href="'+esc(gmail)+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;min-width:130px;padding:14px 20px;border-radius:999px;background:#5a3b2b;color:#fff;text-decoration:none;font-weight:700">'+primaryText+'</a><a id="lntdvAppleMailBtn" href="'+esc(mailto)+'" style="display:inline-flex;align-items:center;justify-content:center;min-width:130px;padding:14px 20px;border-radius:999px;background:#cdb8a5;color:#3d281d;text-decoration:none;font-weight:700">'+secondaryText+'</a></div></div>';
    if(trackingToken){ const info=el.querySelector('p'); if(info) info.insertAdjacentHTML('afterend','<div style="margin:0 0 18px;padding:12px 14px;border-radius:14px;background:#efe2d4;text-align:left;font-size:13px;line-height:1.55"><strong>ID ordine:</strong> '+esc(id)+'<br><strong>Token:</strong> '+esc(trackingToken)+'</div>'); }
    document.body.appendChild(el);
    el.querySelector('#lntdvMailClose').onclick=()=>el.remove();
    el.onclick=e=>{if(e.target===el)el.remove();};
    // Nessuna apertura automatica: il cliente sceglie esplicitamente
    // Gmail oppure Apple Mail/App Mail dal popup. Questo evita blocchi
    // di Safari e rende il comportamento coerente su iPhone, Android,
    // Windows e macOS.
    const gmailBtn=el.querySelector('#lntdvGmailBtn');
    const mailBtn=el.querySelector('#lntdvAppleMailBtn');
    [gmailBtn,mailBtn].forEach(btn=>{
      if(btn) btn.addEventListener('click',()=>setTimeout(()=>el.remove(),500));
    });
  }

  // Il riepilogo dell'ordine deve essere sempre mostrato PRIMA della scelta
  // del client email. Il pulsante non apre più direttamente Gmail/Apple Mail:
  // porta prima al riepilogo completo, dove il cliente controlla fotografie,
  // formati, dati e totale. La scelta dell'email avviene solo dopo la conferma.
  $('orderMailSummary')?.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    const list=items();
    if(!list.length)return;
    openPanel();
  });

  async function submitOrder(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    if(busy)return;
    const list=items();
    const name=$('customerName')?.value.trim()||'';
    const email=$('customerEmail')?.value.trim()||'';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const delivery=deliveryValue();
    const addressReady=delivery!=='Spedizione' || (!!$('customerStreet')?.value.trim() && !!$('customerZip')?.value.trim() && !!$('customerCity')?.value.trim());
    if(!list.length || list.some(x=>!x.format) || !name || !validEmail || !addressReady){ render(); return; }
    const t=totals(list), id=orderId(), trackingToken=token();
    const payload={orderId:id,paymentMethod:'BONIFICO BANCARIO',paymentStatus:'IN_ATTESA_DI_BONIFICO',orderStatus:'ORDINE RICEVUTO',customer:{name,email,phone:$('customerPhone')?.value.trim()||'',street:$('customerStreet')?.value.trim()||'',zip:$('customerZip')?.value.trim()||'',city:$('customerCity')?.value.trim()||'',note:$('customerNote')?.value.trim()||''},items:list.map(x=>({title:x.code,format:x.format,orientation:x.orientation,price:x.price,quantity:x.quantity})),subtotal:t.subtotal,baseTotal:t.subtotal,shippingFee:t.shipping,total:t.total,promotion:'',deliveryType:delivery,requestedTracking:true,notificationEmail:'info.lanostraterradavicino@gmail.com',notificationClients:['Gmail','Apple Mail'],replyTo:email,trackingToken};
    busy=true;
    if($('completePayment')) $('completePayment').disabled=true;
    if($('paymentStatus')) $('paymentStatus').textContent='Invio ordine…';
    try{
      await postPayload(payload);
      // L'invio al sistema ordini è riuscito. Non blocchiamo il popup email
      // sulla seconda verifica JSONP: Safari/iPhone può bloccare o ritardare
      // quel controllo anche quando la registrazione POST è già avvenuta.
      // La verifica resta utile ma viene eseguita in background.
      confirmSubmittedOrder(id,trackingToken,email).then(()=>{
        rememberTracking(id,trackingToken);
      }).catch(err=>{
        console.warn('LNTDV: verifica ordine differita non riuscita',err);
        rememberTracking(id,trackingToken);
      });
      rememberTracking(id,trackingToken);
      write('lntdv_last_order_v5',{orderId:id,token:trackingToken,email,total:t.total,createdAt:new Date().toISOString()});
      showMailChooser(id,list,t.total,trackingToken,{name,email,phone:$('customerPhone')?.value.trim()||'',street:$('customerStreet')?.value.trim()||'',zip:$('customerZip')?.value.trim()||'',city:$('customerCity')?.value.trim()||'',note:$('customerNote')?.value.trim()||''});
      resetSelection(false);
      if($('paymentStatus')) $('paymentStatus').innerHTML='<strong>Ordine confermato.</strong><br>ID ordine: <strong>'+esc(id)+'</strong><br><br>La richiesta è stata registrata. Scegli Gmail o Apple Mail.';
      document.querySelectorAll('#orderPanel .checkout-head,#orderPanel .checkout-selected,#orderPanel .checkout-grid,#orderPanel .checkout-bottom').forEach(el=>el.hidden=true);
      if($('orderBar')) $('orderBar').classList.remove('show','active');
      const mailButton=$('orderMailSummary');
      if(mailButton){ mailButton.hidden=true; mailButton.disabled=true; }
      if($('orderPanel')){
        const panel=$('orderPanel'); panel.classList.add('active'); panel.setAttribute('aria-hidden','false'); panel.dataset.state='confirmed';
        const submit=$('completePayment'); if(submit) submit.style.display='none';
        const title=panel.querySelector('.modal-title'); if(title) title.textContent='Ordine confermato';
      }
    }catch(err){
      console.warn('LNTDV: invio ordine fallito',err);
      if($('paymentStatus')) $('paymentStatus').innerHTML='<strong>Non è stato possibile registrare l’ordine.</strong><br>Controlla la connessione e riprova.';
      if($('completePayment')) $('completePayment').disabled=false;
    }finally{
      busy=false;
      render();
    }
  }

  $('completePayment')?.addEventListener('click',submitOrder);
  document.addEventListener('click',function(e){
    const button=e.target.closest?.('#completePayment');
    if(!button)return;
    e.preventDefault();
    e.stopPropagation();
    submitOrder(e);
  },true);

  // Start clean on every catalog entry: no stale selection from a previous visit.
  clearOldCarts();
  normalizeCheckoutLayer();
  updateMaterialNotes();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',render,{once:true});
  }else{
    render();
  }
})();
