/* LNTDV — FINAL HEADER CONTROLLER — 2026-09-25 */
(function(){
  "use strict";

  const projectText="Un invito a fermarsi, osservare e tornare vicino a ciò che ci circonda: la terra, la luce, le tracce del tempo e quei piccoli dettagli che spesso attraversiamo senza guardarli davvero. La fotografia diventa un modo per ascoltare il paesaggio e riscoprire il legame silenzioso tra natura, luoghi e presenza umana.";
  const showText="La mostra nasce da uno sguardo lento sul territorio: un percorso tra natura, tempo e città, dove ogni immagine cerca ciò che rimane quando smettiamo di passare oltre. Un racconto fatto di luce, materia, stagioni e memoria, per lasciare che il paesaggio non sia soltanto visto, ma sentito.";

  function style(){
    if(document.getElementById('lntdv-final-layout-style')) return;
    const s=document.createElement('style');
    s.id='lntdv-final-layout-style';
    s.textContent=`
      html,body{background:#fbf6ef!important;color:#5a3b2b!important}
      header{position:relative!important;background:#fbf6ef!important;color:#5a3b2b!important;padding:56px 16px 28px!important;text-align:center!important;box-sizing:border-box!important}
      header.lntdv-brown-title-only{background:#fbf6ef!important;color:#5a3b2b!important}
      header .lntdv-project-heading{display:block!important;margin:0 auto!important;background:transparent!important;color:#5a3b2b!important;font:700 clamp(34px,7vw,56px)/1.08 Georgia,serif!important;max-width:900px!important}
      #lntdv-home-project-description{display:block!important;width:min(820px,calc(100% - 28px))!important;margin:18px auto 0!important;color:#5a3b2b!important;background:transparent!important;text-align:center!important}
      #lntdv-home-project-description p{margin:0!important;color:#5a3b2b!important;font:400 16px/1.55 Georgia,serif!important}
      #lntdv-final-story-qr{display:flex!important;flex-direction:column!important;align-items:center!important;width:100%!important;margin:22px auto 0!important;background:transparent!important;color:#5a3b2b!important}
      #lntdv-final-story-qr img{display:block!important;width:136px!important;height:136px!important;margin:0 auto 8px!important;background:#fff!important;border:4px solid #fff!important;border-radius:4px!important;box-sizing:border-box!important;object-fit:contain!important}
      #lntdv-final-story-qr .qr-label{color:#5a3b2b!important;font:700 12px/1.3 Arial,sans-serif!important;letter-spacing:.5px!important}
      #lntdv-final-exhibition{display:block!important;width:min(820px,calc(100% - 28px))!important;margin:18px auto 0!important;background:transparent!important;color:#5a3b2b!important;text-align:center!important}
      #lntdv-final-exhibition strong{display:block!important;color:#5a3b2b!important;font:800 12px/1.3 Arial,sans-serif!important;letter-spacing:1.2px!important}
      #lntdv-final-exhibition p{margin:8px 0 0!important;color:#5a3b2b!important;font:400 16px/1.55 Georgia,serif!important}
      #infoMenuButton.info-menu-button{position:absolute!important;top:14px!important;right:16px!important;left:auto!important;bottom:auto!important;width:40px!important;height:36px!important;min-width:40px!important;padding:4px!important;margin:0!important;border:0!important;background:transparent!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;z-index:2147483000!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important}
      #infoMenuButton.info-menu-button span{display:block!important;width:25px!important;height:3px!important;margin:0!important;background:#5a3b2b!important;border:0!important;border-radius:2px!important;opacity:1!important;pointer-events:none!important}
      #infoMenuButton.info-menu-button.open span:nth-child(1){transform:translateY(8px) rotate(45deg)!important}
      #infoMenuButton.info-menu-button.open span:nth-child(2){opacity:0!important}
      #infoMenuButton.info-menu-button.open span:nth-child(3){transform:translateY(-8px) rotate(-45deg)!important}
      #infoDrawer.info-drawer.open{transform:translateX(0)!important;pointer-events:auto!important}
      @media(max-width:600px){
        header{padding:52px 12px 25px!important}
        #infoMenuButton.info-menu-button{top:12px!important;right:14px!important}
        #lntdv-home-project-description,#lntdv-final-exhibition{width:calc(100% - 28px)!important}
        #lntdv-home-project-description p,#lntdv-final-exhibition p{font-size:16px!important;line-height:1.5!important}
      }
    `;
    document.head.appendChild(s);
  }

  function cleanNewline(){
    Array.from(document.body.childNodes).forEach(function(n){if(n.nodeType===3 && (n.textContent.trim()==='\\n'||n.textContent.trim()==='\\\\n')) n.remove();});
  }

  function removeLegacyQr(){
    document.querySelectorAll('#lntdv-show-qr,#lntdv-story-qr-block,.lntdv-story-qr,#lntdv-final-story-qr').forEach(function(e){e.remove();});
    document.querySelectorAll('img[src*="lntdv-story-qr.svg"]').forEach(function(img){img.remove();});
  }

  function rebuildHeader(){
    const header=document.querySelector('header');
    if(!header) return;
    const oldButton=document.getElementById('infoMenuButton');
    const button=oldButton ? oldButton : document.createElement('button');
    button.id='infoMenuButton';
    button.className='info-menu-button';
    button.type='button';
    button.setAttribute('aria-label','Apri menu');
    button.setAttribute('aria-expanded','false');
    button.innerHTML='<span></span><span></span><span></span>';

    header.innerHTML='';
    header.appendChild(button);

    const h1=document.createElement('div');
    h1.className='lntdv-project-heading';
    h1.textContent='La Nostra Terra Da Vicino';
    header.appendChild(h1);

    const project=document.createElement('section');
    project.id='lntdv-home-project-description';
    project.setAttribute('aria-label','Descrizione del progetto La Nostra Terra Da Vicino');
    project.innerHTML='<p>'+projectText+'</p>';
    header.appendChild(project);

    const qr=document.createElement('div');
    qr.id='lntdv-final-story-qr';
    qr.innerHTML='<img src="./assets/qr/lntdv-story-qr.svg?v=20260925-final" alt="QR code — Scopri la storia della mostra"><div class="qr-label">Scopri la storia della mostra</div>';
    header.appendChild(qr);

    const exhibition=document.createElement('section');
    exhibition.id='lntdv-final-exhibition';
    exhibition.innerHTML='<strong>MOSTRA FOTOGRAFICA DI EDVINAS DRAGONI</strong><p>'+showText+'</p>';
    header.appendChild(exhibition);
  }

  function wireMenu(){
    const btn=document.getElementById('infoMenuButton');
    const drawer=document.getElementById('infoDrawer');
    const close=document.getElementById('infoDrawerClose');
    if(!btn||!drawer) return;
    if(btn.dataset.lntdvMenuWired==='1') return;
    btn.dataset.lntdvMenuWired='1';
    function shut(){drawer.classList.remove('open');btn.classList.remove('open');btn.setAttribute('aria-expanded','false');drawer.setAttribute('aria-hidden','true');}
    function toggle(e){if(e){e.preventDefault();e.stopPropagation();}if(drawer.classList.contains('open'))shut();else{drawer.classList.add('open');btn.classList.add('open');btn.setAttribute('aria-expanded','true');drawer.setAttribute('aria-hidden','false');}}
    btn.addEventListener('click',toggle,false);
    if(close) close.addEventListener('click',shut,false);
    drawer.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(){setTimeout(shut,180);},false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')shut();});
  }

  function init(){
    style();
    cleanNewline();
    rebuildHeader();
    wireMenu();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  window.addEventListener('load',function(){setTimeout(function(){style();rebuildHeader();wireMenu();},50);},{once:true});
})();