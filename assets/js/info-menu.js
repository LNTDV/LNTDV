/* LNTDV — FINAL HEADER CONTROLLER — 2026-09-25 */
(function(){
  "use strict";

  function installFinalStyle(){
    if(document.getElementById("lntdv-final-header-fix")) return;
    const style=document.createElement("style");
    style.id="lntdv-final-header-fix";
    style.textContent=`
      header h1::before,header h1::after,
      header .lntdv-project-heading::before,header .lntdv-project-heading::after,
      header .lntdv-title-description::before,header .lntdv-title-description::after,
      .lntdv-title-description::before,.lntdv-title-description::after,
      header::before,header::after{content:none!important;display:none!important;background:none!important}
      header{position:relative!important}
      #infoMenuButton.info-menu-button{position:absolute!important;top:14px!important;right:16px!important;left:auto!important;bottom:auto!important;width:34px!important;height:30px!important;min-width:34px!important;min-height:30px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;z-index:2147483000!important}
      #infoMenuButton.info-menu-button span{display:block!important;width:24px!important;height:2px!important;min-width:24px!important;min-height:2px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#fffaf3!important;box-shadow:none!important;opacity:1!important}
      #infoMenuButton.info-menu-button.open span:nth-child(1){transform:translateY(7px) rotate(45deg)!important}
      #infoMenuButton.info-menu-button.open span:nth-child(2){opacity:0!important}
      #infoMenuButton.info-menu-button.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)!important}
      header #lntdv-home-project-description{display:block!important;width:min(820px,calc(100% - 28px))!important;margin:16px auto 0!important;padding:0!important;box-sizing:border-box!important;text-align:center!important;color:#fffaf3!important}
      header #lntdv-home-project-description h2{margin:0 0 9px!important;font:700 clamp(24px,6vw,31px)/1.15 Georgia,serif!important;color:#fffaf3!important}
      header #lntdv-home-project-description p{margin:0!important;font:400 16px/1.55 Georgia,serif!important;color:#fffaf3!important}
      #lntdv-final-story-qr{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;margin:18px auto 14px!important;padding:0!important;text-align:center!important;box-sizing:border-box!important}
      #lntdv-final-story-qr img{display:block!important;width:136px!important;height:136px!important;max-width:136px!important;object-fit:contain!important;margin:0 auto 8px!important;padding:0!important;border:4px solid #fff!important;border-radius:4px!important;background:#fff!important;box-shadow:0 2px 8px rgba(0,0,0,.18)!important;box-sizing:border-box!important}
      #lntdv-final-story-qr .qr-label{font:600 11px/1.3 Arial,sans-serif!important;letter-spacing:.7px!important;color:#fffaf3!important}
      @media(max-width:700px){
        #infoMenuButton.info-menu-button{top:12px!important;right:14px!important;left:auto!important}
        header #lntdv-home-project-description{width:calc(100% - 28px)!important;margin-top:14px!important}
        header #lntdv-home-project-description h2{font-size:25px!important;margin-bottom:8px!important}
        header #lntdv-home-project-description p{font-size:16px!important;line-height:1.5!important}
        #lntdv-final-story-qr{margin-top:16px!important;margin-bottom:12px!important}
        #lntdv-final-story-qr img{width:136px!important;height:136px!important;max-width:136px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function removeStrayNewline(){
    Array.from(document.body.childNodes).forEach(function(node){
      if(node.nodeType===3 && (node.textContent.trim()==="\\n" || node.textContent.trim()==="\\\\n")) node.remove();
    });
    document.querySelectorAll("body > br").forEach(function(br){br.remove()});
  }

  function removeEveryLegacyQr(){
    document.querySelectorAll("#lntdv-show-qr,#lntdv-story-qr-block,#lntdv-final-story-qr").forEach(function(el){el.remove()});
    document.querySelectorAll('img[src*="lntdv-story-qr.svg"]').forEach(function(img){
      const parent=img.parentElement;
      if(parent && parent.tagName.toLowerCase()!=="header" && parent.children.length<=3) parent.remove();
      else img.remove();
    });
    document.querySelectorAll("*").forEach(function(el){
      const bg=getComputedStyle(el).backgroundImage||"";
      if(bg.includes("lntdv-story-qr.svg")) el.style.setProperty("background-image","none","important");
    });
  }

  function buildProjectDescription(){
    const old=document.getElementById("lntdv-home-project-description");
    if(old) old.remove();
    const source=document.querySelector("#info-project");
    const heading=source && source.querySelector("h3");
    const paragraph=source && source.querySelector("p");
    if(!source || !heading || !paragraph) return null;
    const block=document.createElement("section");
    block.id="lntdv-home-project-description";
    block.setAttribute("aria-label","Descrizione del progetto La Nostra Terra Da Vicino");
    const h2=document.createElement("h2");
    h2.textContent="La Nostra Terra Da Vicino";
    const p=document.createElement("p");
    p.textContent=paragraph.textContent.trim();
    block.appendChild(h2);
    block.appendChild(p);
    return block;
  }

  function moveQr(){
    removeEveryLegacyQr();
    const heading=document.querySelector("header .lntdv-project-heading, header h1.lntdv-project-heading, .lntdv-project-heading");
    const description=document.querySelector("header .lntdv-title-description, .lntdv-title-description");
    if(!heading) return;

    const project=buildProjectDescription();
    if(project) heading.insertAdjacentElement("afterend",project);

    const qr=document.createElement("div");
    qr.id="lntdv-final-story-qr";
    qr.innerHTML='<img src="./assets/qr/lntdv-story-qr.svg?v=20260925-finalorder2" alt="QR code — Segui la storia della mostra"><div class="qr-label">Segui la storia della mostra</div>';

    if(project) project.insertAdjacentElement("afterend",qr);
    else heading.insertAdjacentElement("afterend",qr);

    if(description) qr.insertAdjacentElement("afterend",description);
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
