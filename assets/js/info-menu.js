/* LNTDV — FINAL HERO + MENU — 2026-09-25 — stable/no-flash */
(function(){
  'use strict';

  var PROJECT = 'Un invito a fermarsi, osservare e tornare vicino a ciò che ci circonda: la terra, la luce, le tracce del tempo e quei piccoli dettagli che spesso attraversiamo senza guardarli davvero. La fotografia diventa un modo per ascoltare il paesaggio e riscoprire il legame silenzioso tra natura, luoghi e presenza umana.';
  var SHOW = 'La mostra nasce da uno sguardo lento sul territorio: un percorso tra natura, tempo e città, dove ogni immagine cerca ciò che rimane quando smettiamo di passare oltre. Un racconto fatto di luce, materia, stagioni e memoria, per lasciare che il paesaggio non sia soltanto visto, ma sentito.';
  var AUTHOR = 'Edvinas Dragoni racconta il territorio attraverso uno sguardo attento e personale. La sua fotografia cerca ciò che normalmente sfugge: una luce che cambia, una traccia, una materia, un dettaglio capace di fermare per un istante il ritmo quotidiano. In questo progetto l’autore invita chi guarda a rallentare e a riconoscere nella natura e nei luoghi attraversati una parte della propria esperienza.';
  var building = false;

  function style(){
    if(document.getElementById('lntdv-final-hero-style')) return;
    var s=document.createElement('style'); s.id='lntdv-final-hero-style';
    s.textContent=''+
      'html,body{background:#fbf6ef!important;color:#5a3b2b!important}'+
      'body>header#lntdv-main-header{display:block!important;position:relative!important;width:100%!important;min-height:0!important;height:auto!important;margin:0!important;padding:0 16px 34px!important;background:#fbf6ef!important;color:#5a3b2b!important;border:0!important;box-shadow:none!important;text-align:center!important;box-sizing:border-box!important;visibility:hidden!important;opacity:0!important;transition:opacity .12s ease!important}'+
      'body>header#lntdv-main-header.lntdv-ready{visibility:visible!important;opacity:1!important}'+
      '#lntdv-main-header .lntdv-project-heading{display:block!important;width:calc(100% + 32px)!important;margin:0 -16px 18px!important;padding:15px 52px 14px 16px!important;box-sizing:border-box!important;color:#fbf6ef!important;background:#5a3b2b!important;border-bottom:2px solid #8a674f!important;font:700 clamp(30px,6.5vw,52px)/1.06 Georgia,serif!important;text-align:center!important;max-width:none!important}'+
      '#lntdv-main-header .lntdv-project-copy,#lntdv-main-header .lntdv-exhibition-copy,#lntdv-main-header .lntdv-author-copy{display:block!important;width:min(820px,calc(100% - 24px))!important;margin:18px auto 0!important;color:#5a3b2b!important;background:transparent!important;text-align:center!important}'+
      '#lntdv-main-header .lntdv-project-copy p,#lntdv-main-header .lntdv-exhibition-copy p,#lntdv-main-header .lntdv-author-copy p{margin:0!important;color:#5a3b2b!important;background:transparent!important;font:400 17px/1.55 Georgia,serif!important}'+
      '#lntdv-main-header .lntdv-qr{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;margin:25px auto 0!important;color:#5a3b2b!important}'+
      '#lntdv-main-header .lntdv-qr img{display:block!important;width:150px!important;height:150px!important;margin:0 auto 9px!important;padding:0!important;background:#fff!important;border:4px solid #fff!important;border-radius:6px!important;object-fit:contain!important;box-sizing:border-box!important}'+
      '#lntdv-main-header .lntdv-qr-label{display:block!important;color:#5a3b2b!important;font:700 14px/1.3 Arial,sans-serif!important;letter-spacing:.5px!important}'+
      '#lntdv-main-header .lntdv-exhibition-copy{margin-top:25px!important}'+
      '#lntdv-main-header .lntdv-exhibition-copy strong,#lntdv-main-header .lntdv-author-copy strong{display:block!important;margin:0 0 7px!important;color:#5a3b2b!important;font:800 13px/1.3 Arial,sans-serif!important;letter-spacing:1.2px!important}'+
      '#lntdv-main-header .lntdv-author-copy{margin-top:24px!important;padding-bottom:0!important}'+
      '#lntdvStableMenu{position:fixed!important;top:195px!important;right:14px!important;width:52px!important;height:48px!important;padding:7px!important;margin:0!important;border:0!important;border-radius:8px!important;background:rgba(251,246,239,.92)!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;z-index:2147483647!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important}'+
      '#lntdvStableMenu span{display:block!important;width:30px!important;height:3px!important;background:#5a3b2b!important;border-radius:2px!important}'+
      '#lntdvStableDrawer{position:fixed!important;top:0!important;right:0!important;width:min(330px,88vw)!important;height:100dvh!important;background:#fbf6ef!important;color:#5a3b2b!important;z-index:2147483646!important;transform:translateX(105%)!important;transition:transform .25s ease!important;box-shadow:-8px 0 30px rgba(90,59,43,.18)!important;padding:76px 24px 24px!important;box-sizing:border-box!important;overflow:auto!important}'+
      '#lntdvStableDrawer.open{transform:translateX(0)!important}'+
      '#lntdvStableDrawer h2{margin:0 0 24px!important;color:#5a3b2b!important;font:700 26px/1.15 Georgia,serif!important}'+
      '#lntdvStableDrawer a{display:block!important;padding:14px 0!important;border-bottom:1px solid #d8c8bb!important;color:#5a3b2b!important;text-decoration:none!important;font:700 15px/1.3 Arial,sans-serif!important}'+
      '#lntdvStableClose{position:absolute!important;top:16px!important;right:18px!important;border:0!important;background:transparent!important;color:#5a3b2b!important;font-size:30px!important;line-height:1!important}'+
      '@media(max-width:600px){body>header#lntdv-main-header{padding:0 12px 28px!important}#lntdv-main-header .lntdv-project-heading{width:calc(100% + 24px)!important;margin-left:-12px!important;margin-right:-12px!important;padding:12px 48px 12px 10px!important;font-size:clamp(29px,8vw,43px)!important;margin-bottom:17px!important}#lntdv-main-header .lntdv-project-copy,#lntdv-main-header .lntdv-exhibition-copy,#lntdv-main-header .lntdv-author-copy{width:calc(100% - 18px)!important}#lntdv-main-header .lntdv-project-copy p,#lntdv-main-header .lntdv-exhibition-copy p,#lntdv-main-header .lntdv-author-copy p{font-size:16px!important;line-height:1.5!important}#lntdv-main-header .lntdv-qr img{width:150px!important;height:150px!important}#lntdvStableMenu{top:195px!important;right:10px!important}}';
    document.head.appendChild(s);
  }

  function hero(){
    var h=document.querySelector('body>header');
    if(!h){h=document.createElement('header');document.body.insertBefore(h,document.body.firstChild);}
    if(building) return h;
    var complete=h.id==='lntdv-main-header' && h.getAttribute('data-lntdv-final')==='1' && h.querySelector('.lntdv-project-copy') && h.querySelector('.lntdv-qr') && h.querySelector('.lntdv-exhibition-copy') && h.querySelector('.lntdv-author-copy');
    if(complete){h.classList.add('lntdv-ready');return h;}
    building=true;
    h.id='lntdv-main-header';
    h.setAttribute('data-lntdv-final','1');
    h.classList.remove('lntdv-ready');
    h.innerHTML='';
    var title=document.createElement('div'); title.className='lntdv-project-heading'; title.textContent='La Nostra Terra Da Vicino'; h.appendChild(title);
    var project=document.createElement('section'); project.className='lntdv-project-copy'; project.innerHTML='<p>'+PROJECT+'</p>'; h.appendChild(project);
    var qr=document.createElement('div'); qr.className='lntdv-qr'; qr.innerHTML='<img src="./assets/qr/lntdv-story-qr.svg?v=20260925-final4" alt="QR code — Scopri la storia della mostra"><div class="lntdv-qr-label">Scopri la storia della mostra</div>'; h.appendChild(qr);
    var show=document.createElement('section'); show.className='lntdv-exhibition-copy'; show.innerHTML='<strong>MOSTRA FOTOGRAFICA DI EDVINAS DRAGONI</strong><p>'+SHOW+'</p>'; h.appendChild(show);
    var author=document.createElement('section'); author.className='lntdv-author-copy'; author.innerHTML='<strong>EDVINAS DRAGONI</strong><p>'+AUTHOR+'</p>'; h.appendChild(author);
    h.classList.add('lntdv-ready');
    building=false;
    return h;
  }

  function menu(){
    var b=document.getElementById('lntdvStableMenu');
    var d=document.getElementById('lntdvStableDrawer');
    if(b&&d) return;
    if(b)b.remove(); if(d)d.remove();
    b=document.createElement('button'); b.id='lntdvStableMenu'; b.type='button'; b.setAttribute('aria-label','Apri menu'); b.setAttribute('aria-expanded','false'); b.innerHTML='<span></span><span></span><span></span>';
    d=document.createElement('aside'); d.id='lntdvStableDrawer'; d.setAttribute('aria-hidden','true'); d.innerHTML='<button id="lntdvStableClose" type="button" aria-label="Chiudi menu">×</button><h2>La Nostra Terra Da Vicino</h2><a href="#catalogo">Il catalogo</a><a href="#progetto">Il progetto</a><a href="#mostre">Le mostre</a><a href="#contatti">Contatti</a>';
    function close(){d.classList.remove('open');b.setAttribute('aria-expanded','false');d.setAttribute('aria-hidden','true');}
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var o=!d.classList.contains('open');d.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');d.setAttribute('aria-hidden',o?'false':'true');});
    d.querySelector('#lntdvStableClose').addEventListener('click',close);
    d.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
    document.body.appendChild(d); document.body.appendChild(b);
  }

  function run(){style();hero();menu();}
  function finalRun(){run();setTimeout(run,100);setTimeout(run,500);setTimeout(run,1200);setTimeout(run,2500);setTimeout(run,5000);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',finalRun,{once:true}); else finalRun();
  window.addEventListener('load',function(){setTimeout(run,50);setTimeout(run,500);});

  var observerTarget=document.body;
  function observe(){
    if(!observerTarget||window.__lntdvHeroObserver) return;
    window.__lntdvHeroObserver=new MutationObserver(function(){
      if(building) return;
      var h=document.querySelector('body>header');
      var ok=h && h.id==='lntdv-main-header' && h.querySelector('.lntdv-project-copy') && h.querySelector('.lntdv-qr') && h.querySelector('.lntdv-exhibition-copy') && h.querySelector('.lntdv-author-copy');
      if(!ok){setTimeout(function(){run();},0);}
    });
    window.__lntdvHeroObserver.observe(observerTarget,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observe,{once:true}); else observe();
})();