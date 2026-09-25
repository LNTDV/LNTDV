/* LNTDV — compatibilità Android / Chrome / Firefox / WebView
   Spazio di lavoro isolato: touch, pointer, tastiera e apertura riepilogo. */
(function(){
  "use strict";
  function ready(fn){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});else fn();}
  ready(function(){
    document.documentElement.classList.add("lntdv-android");
    var btn=document.getElementById("openOrder");
    var panel=document.getElementById("orderPanel");
    var bar=document.getElementById("orderBar");
    if(!btn)return;
    btn.style.touchAction="manipulation";
    function open(){
      if(typeof window.refreshOrder==="function")window.refreshOrder();
      if(panel){
        panel.classList.add("active");
        panel.setAttribute("aria-hidden","false");
        if(bar)bar.classList.add("order-summary-hidden");
        document.body.style.overflow="hidden";
      }
    }
    btn.addEventListener("pointerup",function(e){
      if(e.pointerType==="touch"){e.preventDefault();e.stopPropagation();open();}
    },{passive:false});
    btn.addEventListener("keydown",function(e){
      if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}
    });
    document.querySelectorAll("#orderPanel button,#orderPanel input,#orderPanel select").forEach(function(el){
      el.style.touchAction="manipulation";
    });
  });
})();
