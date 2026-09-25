/* LNTDV — FINAL HEADER CONTROLLER — 2026-09-25 */
(function(){
  "use strict";

  function installFinalStyle(){
    if(document.getElementById("lntdv-final-header-fix")) return;
    const style=document.createElement("style");
    style.id="lntdv-final-header-fix";
    style.textContent=`
      /* Remove every legacy QR/header pseudo-element. */
      header h1::before,header h1::after,
      header .lntdv-project-heading::before,header .lntdv-project-heading::after,
      header .lntdv-title-description::before,header .lntdv-title-description::after,
      .lntdv-title-description::before,.lntdv-title-description::after,
      header::before,header::after{content:none!important;display:none!important;background:none!important}

      /* Hamburger: always upper-right inside the brown header. */
      header{position:relative!important}
      #infoMenuButton.info-menu-button{
        position:absolute!important;top:14px!important;right:16px!important;left:auto!important;bottom:auto!important;
        width:34px!important;height:30px!important;min-width:34px!important;min-height:30px!important;
        margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;
        box-shadow:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;
        justify-content:center!important;gap:5px!important;z-index:2147483000!important
      }
      #infoMenuButton.info-menu-button span{
        display:block!important;width:24px!important;height:2px!important;min-width:24px!important;min-height:2px!important;
        margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#fffaf3!important;
        box-shadow:none!important;opacity:1!important
      }
      #infoMenuButton.info-menu-button.open span:nth-child(1){transform:translateY(7px) rotate(45deg)!important}
      #infoMenuButton.info-menu-button.open span:nth-child(2){opacity:0!important}
      #infoMenuButton.info-menu-button.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)!important}

      /* QR: after the complete title/description block, never above the title. */
      #lntdv-final-story-qr{
        display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;
        width:100%!important;margin:18px auto 0!important;padding:0!important;text-align:center!important;box-sizing:border-box!important
      }
      #lntdv-final-story-qr img{
        display:block!important;width:136px!important;height:136px!important;max-width:136px!important;object-fit:contain!important;
        margin:0 auto 8px!important;padding:0!important;border:4px solid #fff!important;border-radius:4px!important;
        background:#fff!important;box-shadow:0 2px 8px rgba(0,0,0,.18)!important;box-sizing:border-box!important
      }
      #lntdv-final-story-qr .qr-label{font:600 11px/1.3 Arial,sans-serif!important;letter-spacing:.7px!important;color:#fffaf3!important}
      @media(max-width:700px){
        #infoMenuButton.info-menu-button{top:12px!important;right:14px!important;left:auto!important}
        #lntdv-final-story-qr{margin-top:18px!important}
        #lntdv-final-story-qr img{width:136px!important;height:136px!important;max-width:136px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function removeStrayNewline(){
    Array.from(document.body.childNodes).forEach(function(node){
      if(node.nodeType===3 && (node.textContent.trim()==="\\n" || node.textContent.trim()==="\\\\n")) node.remove();
    });
  }

  function moveQr(){
    document.querySelectorAll("#lntdv-show-qr,#lntdv-story-qr-block,#lntdv-final-story-qr").forEach(function(el){
      if(el.id!=="lntdv-final-story-qr") el.remove();
    });

    /* Prefer the complete project-description container. */
    const description=document.querySelector(".lntdv-title-description");
    if(!description) return;

    const qr=document.createElement("div");
    qr.id="lntdv-final-story-qr";
    qr.innerHTML='<img src="./assets/qr/lntdv-story-qr.svg?v=20260925-final-qr" alt="QR code — Segui la storia nella mostra"><div class="qr-label">Segui la storia nella mostra</div>';
    description.insertAdjacentElement("afterend",qr);
  }

  function init(){
    installFinalStyle();
    removeStrayNewline();

    const btn=document.getElementById("infoMenuButton");
    const header=document.querySelector("header");
    if(btn && header){
      header.style.position="relative";
      btn.style.position="absolute";
      btn.style.top="14px";
      btn.style.right="16px";
      btn.style.left="auto";
      btn.style.bottom="auto";
    }

    moveQr();

    const drawer=document.getElementById("infoDrawer");
    const close=document.getElementById("infoDrawerClose");
    if(!btn||!drawer) return;
    const shut=()=>{drawer.classList.remove("open");btn.classList.remove("open");btn.setAttribute("aria-expanded","false");drawer.setAttribute("aria-hidden","true")};
    btn.addEventListener("click",()=>drawer.classList.contains("open")?shut():(drawer.classList.add("open"),btn.classList.add("open"),btn.setAttribute("aria-expanded","true"),drawer.setAttribute("aria-hidden","false")));
    if(close) close.addEventListener("click",shut);
    drawer.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>setTimeout(shut,180)));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")shut()},{passive:true});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
  window.addEventListener("load",function(){removeStrayNewline();moveQr()},{once:true});
})();
