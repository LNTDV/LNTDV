/* LNTDV — lightweight info menu controller */
(function(){
  "use strict";
  function installNoCircleStyle(){
    if(document.getElementById("lntdv-menu-no-circle-style")) return;
    const style=document.createElement("style");
    style.id="lntdv-menu-no-circle-style";
    style.textContent="#infoMenuButton.info-menu-button{position:fixed!important;top:18px!important;left:18px!important;right:auto!important;bottom:auto!important;width:34px!important;height:30px!important;min-width:34px!important;min-height:30px!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;background-image:none!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;color:#4b2f22!important;outline:none!important;z-index:2147483000!important}#infoMenuButton.info-menu-button span{display:block!important;width:24px!important;height:2px!important;min-width:24px!important;min-height:2px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#4b2f22!important;box-shadow:none!important;opacity:1!important;transform:none!important}#infoMenuButton.info-menu-button.open span:nth-child(1){transform:translateY(7px) rotate(45deg)!important}#infoMenuButton.info-menu-button.open span:nth-child(2){opacity:0!important}#infoMenuButton.info-menu-button.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)!important}@media(max-width:700px){#infoMenuButton.info-menu-button{top:12px!important;left:14px!important;right:auto!important;width:30px!important;height:28px!important}#infoMenuButton.info-menu-button span{width:23px!important;min-width:23px!important}}";
    document.head.appendChild(style);
  }
  function init(){
    installNoCircleStyle();
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