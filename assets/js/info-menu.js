/* LNTDV — lightweight info menu controller */
(function(){
  "use strict";
  function init(){
    const btn=document.getElementById("infoMenuButton");
    const drawer=document.getElementById("infoDrawer");
    const close=document.getElementById("infoDrawerClose");
    if(!btn||!drawer)return;
    const shut=()=>{drawer.classList.remove("open");btn.classList.remove("open");btn.setAttribute("aria-expanded","false");drawer.setAttribute("aria-hidden","true");};
    btn.addEventListener("click",()=>drawer.classList.contains("open")?shut():(drawer.classList.add("open"),btn.classList.add("open"),btn.setAttribute("aria-expanded","true"),drawer.setAttribute("aria-hidden","false")));
    close?.addEventListener("click",shut);
    drawer.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>setTimeout(shut,180)));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")shut();},{passive:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
