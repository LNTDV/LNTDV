// LNTDV — sistema ordine/carrello lato cliente
(function(){
  const KEY="lntdv_cart_v3";
  const ORDER_KEY="lntdv_last_order_v3";
  const prices={"Stampa fotografica":40,"Forex":50,"File digitale in alta risoluzione":25};
  const ORIENTATIONS={};
  const SCRIPT_URL="https://script.google.com/macros/s/AKfycbybuGw5n1qyD0gKYdUm6nSYzimId6akDmKCeULqA5J7zRWB9Tr280N4oo92kX/exec";
  const $=id=>document.getElementById(id);
  const euro=n=>"€"+Number(n||0).toFixed(2).replace(".",",");
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function read(k){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch(e){return[]}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function items(){
    return [...document.querySelectorAll(".card.selected")].map(card=>{
      const code=card.querySelector(".meta strong")?.textContent.trim()||"Fotografia";
      const select=card.querySelector(".format-select");
      const format=select?.value||"";
      const orientation=(card.querySelector("[data-orientation]")?.dataset.value||card.querySelector("[data-orientation]")?.textContent||"").trim();
      return {code,format,price:prices[format]||0,image:card.querySelector("img")?.src||"",orientation};
    });
  }
  function total(a){return a.reduce((s,x)=>s+x.price,0)}
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
    const a=items(),t=total(a), payment=document.querySelector('input[name="checkoutPayment"]:checked')?.value||"";
    if($("summaryCount"))$("summaryCount").textContent=a.length;
    if($("orderBarCount"))$("orderBarCount").textContent=a.length+" foto";
    if($("orderBarTotal"))$("orderBarTotal").textContent=euro(t);
    if($("orderTotal"))$("orderTotal").textContent=euro(t);
    if($("orderList"))$("orderList").innerHTML=a.length?a.map((x,i)=>'<div class="checkout-photo-row"><div class="checkout-photo-num">'+String(i+1).padStart(2,"0")+'</div><div class="checkout-photo-thumb">'+(x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.code)+'">':"")+'</div><div class="checkout-photo-info"><div class="checkout-photo-title">'+esc(x.code)+'</div><div class="checkout-photo-detail">'+esc(x.format||"Modalità non selezionata")+'</div></div><div class="checkout-photo-price">'+euro(x.price)+'</div></div>').join(""):'<div class="checkout-empty">Nessuna fotografia selezionata.</div>';
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
    const orderId="LNTDV-"+Date.now().toString(36).toUpperCase(),t=total(a),button=$("completePayment");
    const payload={orderId,paymentMethod:p,paymentStatus:"DA_VERIFICARE",orderStatus:"ORDINE RICEVUTO",customer:{name:$("customerName").value.trim(),email,street:$("customerStreet").value.trim(),zip:$("customerZip").value.trim(),city:$("customerCity").value.trim(),note:$("customerNote").value.trim()},items:a.map(x=>({title:x.code,format:x.format,orientation:x.orientation,price:x.price})),total:t,deliveryType:"Ritiro gratuito presso Milano",requestedTracking:true};
    button.disabled=true;$("paymentStatus").textContent="Invio ordine in corso…";
    try{
      await fetch(SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:"payload="+encodeURIComponent(JSON.stringify(payload))});
      write(ORDER_KEY,{orderId,status:"ORDINE RICEVUTO",message:"Ordine inviato. Conserva l'ID ordine per la verifica."});
      $("paymentStatus").innerHTML="<strong>Ordine inviato.</strong><br>ID ordine: <strong>"+esc(orderId)+"</strong><br>Riceverai la conferma via email. Il pagamento viene considerato effettuato solo dopo verifica.";
      document.querySelectorAll(".card.selected").forEach(c=>{c.classList.remove("selected");c.setAttribute("aria-pressed","false")});write(KEY,[]);refresh();
    }catch(err){button.disabled=false;$("paymentStatus").textContent="Errore nell'invio dell'ordine. Riprova."}
  });
  restore();refresh();
})();