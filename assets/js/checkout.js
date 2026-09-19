(function(){
  function init(){
    // Keep only the supported payment method in the checkout UI.
    document.querySelectorAll('input[name="checkoutPayment"]').forEach(function(input){
      var value=(input.value||'').trim().toLowerCase();
      if(value==='apple pay'||value==='google pay'){
        var label=input.closest('label');
        if(label) label.remove(); else input.remove();
      }
    });

    // The delivery note and the delivery selector status must have unique IDs.
    var statuses=document.querySelectorAll('#deliveryStatus');
    if(statuses.length>1){
      statuses[0].removeAttribute('id');
      statuses[0].setAttribute('data-delivery-note','true');
    }

    document.querySelectorAll('input[name="deliveryType"]').forEach(function(i){
      i.addEventListener('change',function(){
        var s=document.getElementById('deliveryStatus');
        if(s)s.textContent=i.checked?(i.value==='Spedizione'?'Spedizione selezionata.':'Ritiro selezionato.'):'';
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
