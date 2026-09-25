/* LNTDV — compatibilità Windows / Edge / Chrome / Firefox
   Isolato dal checkout principale: pointer, tastiera e fallback click. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fn,{once:true}); else fn(); }
  ready(function(){
    document.documentElement.classList.add("lntdv-windows");
    var btn=document.getElementById("openOrder");
    if(!btn) return;

    btn.style.touchAction="manipulation";
    btn.addEventListener("pointerup",function(e){
      if(e.pointerType==="mouse" || e.pointerType==="pen"){
        btn.focus();
      }
    });
  });
})();