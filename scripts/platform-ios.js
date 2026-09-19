/* LNTDV — compatibilità iOS / iPadOS / Safari / Chrome iOS
   Isolato dal checkout principale: migliora touch, tap e apertura del riepilogo. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fn,{once:true}); else fn(); }
  ready(function(){
    document.documentElement.classList.add("lntdv-ios");
    var btn=document.getElementById("openOrder");
    if(!btn) return;

    function open(){
      if(typeof window.refreshOrder==="function") window.refreshOrder();
      var panel=document.getElementById("orderPanel");
      var bar=document.getElementById("orderBar");
      if(panel){
        panel.classList.add("active");
        panel.setAttribute("aria-hidden","false");
        if(bar) bar.classList.add("order-summary-hidden");
        document.body.style.overflow="hidden";
      }
    }

    /* iOS: un solo handler touch, senza doppio click. */
    btn.addEventListener("touchend",function(e){
      e.preventDefault();
      e.stopPropagation();
      open();
    },{passive:false});

    /* Evita zoom accidentale sui controlli del checkout. */
    document.querySelectorAll("#orderPanel button,#orderPanel input,#orderPanel select").forEach(function(el){
      el.style.touchAction="manipulation";
    });
  });
})();