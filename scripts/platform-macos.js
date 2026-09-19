/* LNTDV — compatibilità macOS / Safari / Chrome / Firefox
   Isolato dal checkout principale: tastiera, focus e apertura riepilogo. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fn,{once:true}); else fn(); }
  ready(function(){
    document.documentElement.classList.add("lntdv-macos");
    var btn=document.getElementById("openOrder");
    if(!btn) return;

    btn.addEventListener("keydown",function(e){
      if(e.key==="Enter" || e.key===" "){
        e.preventDefault();
        btn.click();
      }
    });

    var panel=document.getElementById("orderPanel");
    if(panel){
      panel.addEventListener("transitionend",function(){
        if(panel.classList.contains("active")){
          var first=panel.querySelector("input,select,button");
          if(first) first.focus({preventScroll:true});
        }
      });
    }
  });
})();