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
  const SHIPPING=10;
  const BANK_TRANSFER={accountHolder:"Giulia Principi",iban:"LU538100SATI55551718",reasonPrefix:"LNTDV"};
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
    const materialNote=card.querySelector('.material-note')?.textContent.trim()||'';
    return {card,code,format,image,orientation,quantity,materialNote,price:PRICES[format]};
  }

  function items(){ return selected().map(itemFromCard); }

  function totals(list){
    const count=list.reduce((n,x)=>n+x.quantity,0);
    const normal=list.reduce((n,x)=>n+x.price*x.quantity,0);
    const promo=null;
    const subtotal=normal;
    const shipping=deliveryFee();
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
        ? list.map((x,i)=>{
          const formatOptions=Object.keys(PRICES).map(f=>'<option value="'+esc(f)+'" '+(x.format===f?'selected':'')+'>'+esc(f)+' — '+money(PRICES[f])+'</option>').join('');
          return '<article class="checkout-photo-card" data-code="'+esc(x.code)+'">'+
            '<div class="checkout-photo-visual">'+
              (x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.code)+'" draggable="false">':'')+
              '<span class="checkout-photo-index">'+String(i+1).padStart(2,'0')+'</span>'+
              '<button type="button" class="checkout-remove" data-code="'+esc(x.code)+'" aria-label="Rimuovi '+esc(x.code)+'">×</button>'+
            '</div>'+
            '<div class="checkout-photo-copy">'+
              '<div class="checkout-photo-title">'+esc(x.code)+'</div>'+
              '<div class="checkout-photo-detail">'+esc(x.orientation||'')+'</div>'+
              '<label class="checkout-format-label">FORMATO<select class="checkout-format-select" data-code="'+esc(x.code)+'" aria-label="Formato '+esc(x.code)+'">'+formatOptions+'</select></label>'+
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
        : 'Ordine pronto per l’invio.';
    }

    saveCart();
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
    return document.querySelector('input[name="deliveryType"]:checked')?.value ||
      document.querySelector('input[name="checkoutDelivery"]:checked')?.value ||
      'Ritiro';
  }

  function deliveryFee(){
    return deliveryValue()==='Spedizione' ? SHIPPING : 0;
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

  // The catalog's existing card handler selects/deselects cards.
  // This listener only refreshes the order state; it never toggles the card twice.
  document.addEventListener('click',e=>{
    if(e.target.closest('#openOrder') || e.target.closest('#closeOrder')) return;
    if(e.target.closest('.card') && !e.target.closest('select,option,input,button,a')){
      setTimeout(()=>{
        render();
        if(selected().length && !$('orderPanel')?.classList.contains('active')){
          openPanel();
        }
      },0);
    }
  },false);

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
      render();
      updateMaterialNotes();
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
    if(open){ e.preventDefault(); e.stopImmediatePropagation(); openPanel(); return; }
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
    const phone=$('customerPhone')?.value.trim()||'';
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const delivery=deliveryValue();
    const addressReady=delivery!=='Spedizione' || (!!$('customerStreet')?.value.trim() && !!$('customerZip')?.value.trim() && !!$('customerCity')?.value.trim());
    if(!list.length || list.some(x=>!x.format) || !name || !validEmail || !addressReady){
      render();
      return;
    }

    const t=totals(list);
    const id=orderId();
    const trackingToken=token();
    const payload={
      orderId:id,
      paymentMethod:'BONIFICO BANCARIO',
      paymentStatus:'IN_ATTESA_DI_BONIFICO',
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
      promotion:'',
      deliveryType:deliveryValue(),
      requestedTracking:true,
      notificationEmail:'info.lanostraterradavicino@gmail.com',
      notificationClients:['Gmail','Apple Mail'],
      replyTo:email,
      trackingToken
    };

    busy=true;
    if($('completePayment')) $('completePayment').disabled=true;
    if($('paymentStatus')) $('paymentStatus').textContent='Invio ordine in corso…';

    let sent=false;
    try{
      await postPayload(payload);
      // A form/iframe load only proves that the browser navigated to Apps Script.
      // Confirm against the order endpoint before telling the customer the order is registered.
      await confirmSubmittedOrder(id,trackingToken,email);
      sent=true;
      rememberTracking(id,trackingToken);
      write('lntdv_last_order_v5',{orderId:id,token:trackingToken,email,total:t.total,createdAt:new Date().toISOString()});

      if($('paymentStatus')){
        $('paymentStatus').innerHTML='<strong>Ordine ricevuto.</strong><br>ID ordine: <strong>'+esc(id)+'</strong><br><br>Le istruzioni per il pagamento vengono inviate tramite la mail predisposta.';
      }

      resetSelection(false);
      if($('paymentStatus')){
        const mailSubject=encodeURIComponent('Richiesta ordine '+id+' — La Nostra Terra da Vicino');
        const orderLines=list.map((x,i)=>(String(i+1).padStart(2,'0')+' - '+x.code+' | '+(x.orientation||'')+' | '+x.format+' | '+money(x.price*x.quantity))).join('\\n');
        const mailBody=encodeURIComponent('BUONGIORNO,\\n\\nRICHIESTA ORDINE '+id+' INVIATA DAL SITO LNTDV.\\n\\nRIEPILOGO DELL’ORDINE\\n'+orderLines+'\\n\\nTOTALE: '+money(t.total)+'\\n\\nPAGAMENTO TRAMITE BONIFICO BANCARIO\\nINTESTATARIO: '+BANK_TRANSFER.accountHolder+'\\nIBAN: '+BANK_TRANSFER.iban+'\\nCAUSALE: '+BANK_TRANSFER.reasonPrefix+' '+id+'\\n\\nPER COMUNICAZIONI RELATIVE AL PAGAMENTO, UTILIZZARE QUESTA MAIL: INFO.LANOSTRATERRADAVICINO@GMAIL.COM.\\n\\nIL RIEPILOGO COMPLETO DELL’ORDINE È STATO REGISTRATO NEL SISTEMA GOOGLE FOGLI.\\n\\nCORDIALI SALUTI.');
        const gmailUrl='https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=info.lanostraterradavicino@gmail.com&su='+mailSubject+'&body='+mailBody;
        const appleUrl='mailto:info.lanostraterradavicino@gmail.com?subject='+mailSubject+'&body='+mailBody;
        const chooser='<div id="lntdvMailChooser" role="dialog" aria-modal="true" aria-label="Scegli app email" style="position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(38,24,16,.58);font-family:Arial,sans-serif;"><div style="position:relative;width:min(440px,100%);box-sizing:border-box;padding:28px;border-radius:24px;background:#fbf6ef;color:#5a3b2b;box-shadow:0 24px 80px rgba(0,0,0,.28);text-align:center;"><button type="button" class="lntdv-mail-close" aria-label="Chiudi" style="position:absolute;right:14px;top:10px;border:0;background:none;font-size:30px;color:#5a3b2b;cursor:pointer;">×</button><div style="font-size:10px;letter-spacing:2px;font-weight:700;margin-bottom:8px;">ORDINE '+esc(id)+'</div><h3 style="margin:0 0 10px;font-size:25px;">Ordine registrato</h3><p style="margin:0 0 22px;line-height:1.55;">La richiesta è stata registrata. Scegli come aprire la mail precompilata.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><a href="'+gmailUrl+'" target="_blank" rel="noopener" class="lntdv-mail-btn" style="display:inline-flex;align-items:center;justify-content:center;min-width:130px;padding:14px 20px;border-radius:999px;background:#5a3b2b;color:#fff;text-decoration:none;font-weight:700;">Gmail</a><a href="'+appleUrl+'" class="lntdv-mail-btn" style="display:inline-flex;align-items:center;justify-content:center;min-width:130px;padding:14px 20px;border-radius:999px;background:#cdb8a5;color:#3d281d;text-decoration:none;font-weight:700;">Apple Mail</a></div><p style="margin:18px 0 0;font-size:11px;opacity:.75;">Se Gmail o Apple Mail non si apre, verifica l'app email predefinita del dispositivo.</p></div></div>';
        document.getElementById('lntdvMailChooser')?.remove();
        document.body.insertAdjacentHTML('beforeend',chooser);
        const chooserEl=document.getElementById('lntdvMailChooser');
        chooserEl.querySelector('.lntdv-mail-close').addEventListener('click',()=>chooserEl.remove());
        chooserEl.addEventListener('click',e=>{if(e.target===chooserEl)chooserEl.remove();});
        $('paymentStatus').innerHTML='<strong>Ordine confermato.</strong><br>ID ordine: <strong>'+esc(id)+'</strong><br><br>La richiesta è stata registrata. Scegli l’app per inviare la mail con le istruzioni di pagamento.';
      }
      document.querySelectorAll('#orderPanel .checkout-head,#orderPanel .checkout-selected,#orderPanel .checkout-grid,#orderPanel .checkout-bottom').forEach(function(el){el.hidden=true;});
      if($('orderBar')) $('orderBar').classList.remove('show','active');

      if($('orderPanel')){
        const panel=$('orderPanel');
        panel.classList.add('active');
        panel.setAttribute('aria-hidden','false');
        panel.dataset.state='confirmed';
        const submit=$('completePayment');
        if(submit) submit.style.display='none';
        const title=panel.querySelector('.modal-title');
        if(title) title.textContent='Ordine confermato';
        const intro=panel.querySelector('.checkout-head p');
        if(intro) intro.textContent='La richiesta è stata registrata. Ora puoi scegliere l’app per inviare la mail predisposta.';
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
  normalizeCheckoutLayer();
  updateMaterialNotes();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',render,{once:true});
  }else{
    render();
  }
})();
