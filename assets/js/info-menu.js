/* LNTDV — FINAL HEADER CONTROLLER — 2026-09-25 */
(function(){
  "use strict";

  const evocativeProject="Un invito a fermarsi, osservare e tornare vicino a ciò che ci circonda: la terra, la luce, le tracce del tempo e quei piccoli dettagli che spesso attraversiamo senza guardarli davvero. La fotografia diventa un modo per ascoltare il paesaggio e riscoprire il legame silenzioso tra natura, luoghi e presenza umana.";
  const evocativeShow="La mostra nasce da uno sguardo lento sul territorio: un percorso tra natura, tempo e città, dove ogni immagine cerca ciò che rimane quando smettiamo di passare oltre. Un racconto fatto di luce, materia, stagioni e memoria, per lasciare che il paesaggio non sia soltanto visto, ma sentito.";

  function installFinalStyle(){
    if(document.getElementById("lntdv-final-header-fix"))return;
    const style=document.createElement("style");
    style.id="lntdv-final-header-fix";
    style.textContent=`
      html body{background:#fbf6ef!important;color:#5a3b2b!important}
      header,header *{box-sizing:border-box}
      header{position:relative!important;background:#fbf6ef!important;color:#5a3b2b!important}
      header .brand,header h1,header .lntdv-project-heading,header .lntdv-author-heading,header .lntdv-heading-subtitle{background:transparent!important}
      header h1,header h1.lntdv-project-heading,header .lntdv-project-heading,header .lntdv-author-heading,header .lntdv-heading-subtitle,header .intro,header .lntdv-title-description{color:#5a3b2b!important}
      header h1::before,header h1::after,header .lntdv-project-heading::before,header .lntdv-project-heading::after,header .lntdv-title-description::before,header .lntdv-title-description::after,header::before,header::after{content:none!important;display:none!important;background:none!important}
      #infoMenuButton.info-menu-button{position:absolute!important;top:14px!important;right:16px!important;left:auto!important;bottom:auto!important;width:40px!important;height:36px!important;min-width:40px!important;min-height:36px!important;margin:0!important;padding:4px!important;border:0!important;border-radius:4px!important;background:transparent!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;z-index:2147483000!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important}
      #infoMenuButton.info-menu-button span{display:block!important;width:25px!important;height:3px!important;min-width:25px!important;min-height:3px!important;margin:0!important;padding:0!important;border:0!important;border-radius:2px!important;background:#5a3b2b!important;box-shadow:none!important;opacity:1!important;pointer-events:none!important}
      #infoMenuButton.info-menu-button.open span:nth-child(1){transform:translateY(8px) rotate(45deg)!important}
      #infoMenuButton.info-menu-button.open span:nth-child(2){opacity:0!important}
      #infoMenuButton.info-menu-button.open span:nth-child(3){transform:translateY(-8px) rotate(-45deg)!important}
      #infoDrawer.info-drawer{z-index:2147482999!important}
      #infoDrawer.info-drawer.open{transform:translateX(0)!important;pointer-events:auto!important}
      header #lntdv-home-project-description{display:block!important;width:min(820px,calc(100% - 28px))!important;margin:16px auto 0!important;padding:0!important;box-sizing:border-box!important;text-align:center!important;color:#5a3b2b!important;background:transparent!important}
      header #lntdv-home-project-description p{margin:0!important;font:400 16px/1.55 Georgia,serif!important;color:#5a3b2b!important;background:transparent!important}
      #lntdv-final-story-qr{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;margin:18px auto 14px!important;padding:0!important;text-align:center!important;box-sizing:border-box!important;background:transparent!important}
      #lntdv-final-story-qr img{display:block!important;width:136px!important;height:136px!important;max-width:136px!important;object-fit:contain!important;margin:0 auto 8px!important;padding:0!important;border:4px solid #fff!important;border-radius:4px!important;background:#fff!important;box-shadow:0 2px 8px rgba(0,0,0,.18)!important;box-sizing:border-box!important}
      #lntdv-final-story-qr .qr-label{font:600 11px/1.3 Arial,sans-serif!important;letter-spacing:.7px!important;color:#5a3b2b!important;background:transparent!important}
      @media(max-width:700px){
        #infoMenuButton.info-menu-button{top:12px!important;right:14px!important;left:auto!important}
        header #lntdv-home-project-description{width:calc(100% - 28px)!important;margin-top:14px!important}
        header #lntdv-home-project-description p{font-size:16px!important;line-height:1.5!important}
        #lntdv-final-story-qr{margin-top:16px!important;margin-bottom:12px!important}
        #lntdv-final-story-qr img{width:136px!important;height:136px!important;max-width:136px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function removeStrayNewline(){
    Array.from(document.body.childNodes).forEach(function(node){
      if(node.nodeType===3&&(node.textContent.trim()==="\\n"||node.textContent.trim()==="\\\\n"))node.remove();
    });
    document.querySelectorAll("body > br").forEach(function(br){br.remove()});
  }

  function removeEveryLegacyQr(){
    document.querySelectorAll("#lntdv-show-qr,#lntdv-story-qr-block,#lntdv-final-story-qr").forEach(function(el){el.remove()});
    document.querySelectorAll('img[src*="lntdv-story-qr.svg"]').forEach(function(img){
      const parent=img.parentElement;
      if(parent&&parent.tagName.toLowerCase()!=="header"&&parent.children.length<=3)parent.remove();else img.remove();
    });
    document.querySelectorAll("*").forEach(function(el){
      const bg=getComputedStyle(el).backgroundImage||"";
      if(bg.includes("lntdv-story-qr.svg"))el.style.setProperty("background-image","none","important");
    });
  }

  function buildProjectDescription(){
    const old=document.getElementById("lntdv-home-project-description");
    if(old)old.remove();
    const source=document.querySelector("#info-project");
    if(!source)return null;
    const block=document.createElement("section");
    block.id="lntdv-home-project-description";
    block.setAttribute("aria-label","Descrizione del progetto La Nostra Terra Da Vicino");
    const p=document.createElement("p");
    p.textContent=evocativeProject;
    block.appendChild(p);
    return block;
  }

  function moveQr(){
    removeEveryLegacyQr();
    const heading=document.querySelector("header .lntdv-project-heading, header h1.lntdv-project-heading, .lntdv-project-heading");
    const description=document.querySelector("header .lntdv-title-description, .lntdv-title-description");
    if(!heading)return;
    const project=buildProjectDescription();
    if(project)heading.insertAdjacentElement("afterend",project);
    const qr=document.createElement("div");
    qr.id="lntdv-final-story-qr";
    qr.innerHTML='<img src="./assets/qr/lntdv-story-qr.svg?v=20260925-finalorder4" alt="QR code — Scopri la storia della mostra"><div class="qr-label">Scopri la storia della mostra</div>';
    if(project)project.insertAdjacentElement("afterend",qr);else heading.insertAdjacentElement("afterend",qr);
    if(description){
      description.textContent=evocativeShow;
      qr.insertAdjacentElement("afterend",description);
    }
  }

  function wireMenu(){
    const btn=document.getElementById("infoMenuButton"),drawer=document.getElementById("infoDrawer"),close=document.getElementById("infoDrawerClose");
    if(!btn||!drawer)return false;
    if(btn.dataset.lntdvMenuWired==="1")return true;
    btn.dataset.lntdvMenuWired="1";
    const shut=function(){drawer.classList.remove("open");btn.classList.remove("open");btn.setAttribute("aria-expanded","false");drawer.setAttribute("aria-hidden","true")};
    const toggle=function(e){if(e){e.preventDefault();e.stopPropagation()}if(drawer.classList.contains("open"))shut();else{drawer.classList.add("open");btn.classList.add("open");btn.setAttribute("aria-expanded","true");drawer.setAttribute("aria-hidden","false")}};
    btn.addEventListener("click",toggle,false);
    if(close)close.addEventListener("click",shut,false);
    drawer.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener("click",function(){setTimeout(shut,180)},false)});
    document.addEventListener("keydown",function(e){if(e.key==="Escape")shut()});
    return true;
  }

  function init(){
    installFinalStyle();
    removeStrayNewline();
    const header=document.querySelector("header"),btn=document.getElementById("infoMenuButton");
    if(btn&&header){
      header.style.position="relative";
      header.style.background="#fbf6ef";
      header.style.color="#5a3b2b";
      btn.style.position="absolute";
      btn.style.top="14px";
      btn.style.right="16px";
      btn.style.left="auto";
      btn.style.bottom="auto";
      btn.style.pointerEvents="auto";
    }
    moveQr();
    wireMenu();
    setTimeout(wireMenu,100);
    setTimeout(wireMenu,500);
    setTimeout(wireMenu,1200);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  window.addEventListener("load",function(){removeStrayNewline();moveQr();wireMenu();setTimeout(wireMenu,300)},{once:true});
})();