/* LNTDV — FINAL HEADER + MENU — 2026-09-25 */
(function () {
  "use strict";

  var PROJECT = "Un invito a fermarsi, osservare e tornare vicino a ciò che ci circonda: la terra, la luce, le tracce del tempo e quei piccoli dettagli che spesso attraversiamo senza guardarli davvero. La fotografia diventa un modo per ascoltare il paesaggio e riscoprire il legame silenzioso tra natura, luoghi e presenza umana.";
  var SHOW = "La mostra nasce da uno sguardo lento sul territorio: un percorso tra natura, tempo e città, dove ogni immagine cerca ciò che rimane quando smettiamo di passare oltre. Un racconto fatto di luce, materia, stagioni e memoria, per lasciare che il paesaggio non sia soltanto visto, ma sentito.";
  var AUTHOR = "Edvinas Dragoni racconta il territorio attraverso uno sguardo attento e personale. La sua fotografia cerca ciò che normalmente sfugge: una luce che cambia, una traccia, una materia, un dettaglio capace di fermare per un istante il ritmo quotidiano. In questo progetto l’autore invita chi guarda a rallentare e a riconoscere nella natura e nei luoghi attraversati una parte della propria esperienza.";

  function addStyle() {
    if (document.getElementById("lntdv-final-header-style")) return;
    var s = document.createElement("style");
    s.id = "lntdv-final-header-style";
    s.textContent = `
      html,body{background:#fbf6ef!important;color:#5a3b2b!important}
      header#lntdv-main-header,body>header{position:relative!important;background:#fbf6ef!important;color:#5a3b2b!important;padding:54px 16px 30px!important;text-align:center!important;box-sizing:border-box!important;min-height:0!important;border:0!important;box-shadow:none!important}
      header#lntdv-main-header .lntdv-project-heading,body>header .lntdv-project-heading{display:block!important;margin:0 auto!important;color:#5a3b2b!important;background:transparent!important;font:700 clamp(34px,7vw,56px)/1.08 Georgia,serif!important;max-width:900px!important}
      .lntdv-project-copy,.lntdv-exhibition-copy,.lntdv-author-copy{display:block!important;width:min(820px,calc(100% - 28px))!important;margin:18px auto 0!important;color:#5a3b2b!important;background:transparent!important;text-align:center!important}
      .lntdv-project-copy p,.lntdv-exhibition-copy p,.lntdv-author-copy p{margin:0!important;color:#5a3b2b!important;font:400 16px/1.55 Georgia,serif!important}
      .lntdv-qr{display:flex!important;flex-direction:column!important;align-items:center!important;width:100%!important;margin:24px auto 0!important;color:#5a3b2b!important}
      .lntdv-qr img{display:block!important;width:150px!important;height:150px!important;margin:0 auto 9px!important;background:#fff!important;border:4px solid #fff!important;border-radius:5px!important;object-fit:contain!important;box-sizing:border-box!important}
      .lntdv-qr-label{color:#5a3b2b!important;font:700 14px/1.3 Arial,sans-serif!important;letter-spacing:.5px!important}
      .lntdv-exhibition-copy{margin-top:24px!important}
      .lntdv-exhibition-copy strong,.lntdv-author-copy strong{display:block!important;color:#5a3b2b!important;font:800 13px/1.3 Arial,sans-serif!important;letter-spacing:1.2px!important;margin-bottom:7px!important}
      .lntdv-author-copy{margin-top:24px!important;padding-bottom:4px!important}
      #lntdvStableMenu{position:fixed!important;top:195px!important;right:18px!important;width:46px!important;height:42px!important;padding:4px!important;margin:0!important;border:0!important;background:transparent!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;z-index:2147483647!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important}
      #lntdvStableMenu span{display:block!important;width:30px!important;height:3px!important;background:#5a3b2b!important;border-radius:2px!important}
      #lntdvStableDrawer{position:fixed!important;top:0!important;right:0!important;width:min(330px,88vw)!important;height:100dvh!important;background:#fbf6ef!important;color:#5a3b2b!important;z-index:2147483646!important;transform:translateX(105%)!important;transition:transform .25s ease!important;box-shadow:-8px 0 30px rgba(90,59,43,.18)!important;padding:76px 24px 24px!important;box-sizing:border-box!important;overflow:auto!important}
      #lntdvStableDrawer.open{transform:translateX(0)!important}
      #lntdvStableDrawer h2{margin:0 0 24px!important;color:#5a3b2b!important;font:700 26px/1.15 Georgia,serif!important}
      #lntdvStableDrawer a{display:block!important;padding:14px 0!important;border-bottom:1px solid #d8c8bb!important;color:#5a3b2b!important;text-decoration:none!important;font:700 15px/1.3 Arial,sans-serif!important}
      #lntdvStableClose{position:absolute!important;top:16px!important;right:18px!important;border:0!important;background:transparent!important;color:#5a3b2b!important;font-size:30px!important;line-height:1!important}
      @media(max-width:600px){
        header#lntdv-main-header,body>header{padding:50px 12px 26px!important}
        header#lntdv-main-header .lntdv-project-heading,body>header .lntdv-project-heading{font-size:clamp(31px,8.5vw,44px)!important}
        .lntdv-project-copy,.lntdv-exhibition-copy,.lntdv-author-copy{width:calc(100% - 24px)!important}
        .lntdv-project-copy p,.lntdv-exhibition-copy p,.lntdv-author-copy p{font-size:16px!important;line-height:1.5!important}
        .lntdv-qr img{width:150px!important;height:150px!important}
        #lntdvStableMenu{top:196px!important;right:12px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function buildHeader() {
    var header = document.querySelector("header");
    if (!header) {
      header = document.createElement("header");
      document.body.insertBefore(header, document.body.firstChild);
    }
    header.id = "lntdv-main-header";
    header.innerHTML = "";

    var heading = document.createElement("div");
    heading.className = "lntdv-project-heading";
    heading.textContent = "La Nostra Terra Da Vicino";
    header.appendChild(heading);

    var copy = document.createElement("section");
    copy.className = "lntdv-project-copy";
    copy.setAttribute("aria-label", "Descrizione di La Nostra Terra Da Vicino");
    copy.innerHTML = "<p>" + PROJECT + "</p>";
    header.appendChild(copy);

    var qr = document.createElement("div");
    qr.className = "lntdv-qr";
    qr.innerHTML = '<img src="./assets/qr/lntdv-story-qr.svg?v=20260925-final" alt="QR code — Scopri la storia della mostra"><div class="lntdv-qr-label">Scopri la storia della mostra</div>';
    header.appendChild(qr);

    var exhibition = document.createElement("section");
    exhibition.className = "lntdv-exhibition-copy";
    exhibition.innerHTML = "<strong>MOSTRA FOTOGRAFICA DI EDVINAS DRAGONI</strong><p>" + SHOW + "</p>";
    header.appendChild(exhibition);

    var author = document.createElement("section");
    author.className = "lntdv-author-copy";
    author.innerHTML = "<strong>EDVINAS DRAGONI</strong><p>" + AUTHOR + "</p>";
    header.appendChild(author);
  }

  function buildMenu() {
    var old = document.getElementById("lntdvStableMenu");
    if (old) old.remove();
    var oldDrawer = document.getElementById("lntdvStableDrawer");
    if (oldDrawer) oldDrawer.remove();

    var btn = document.createElement("button");
    btn.id = "lntdvStableMenu";
    btn.type = "button";
    btn.setAttribute("aria-label", "Apri menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";

    var drawer = document.createElement("aside");
    drawer.id = "lntdvStableDrawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = '<button id="lntdvStableClose" type="button" aria-label="Chiudi menu">×</button><h2>La Nostra Terra Da Vicino</h2><a href="#catalogo">Il catalogo</a><a href="#progetto">Il progetto</a><a href="#mostre">Le mostre</a><a href="#contatti">Contatti</a>';

    function closeMenu(){drawer.classList.remove("open");btn.setAttribute("aria-expanded","false");drawer.setAttribute("aria-hidden","true");}
    function toggleMenu(e){e.preventDefault();e.stopPropagation();var open=drawer.classList.toggle("open");btn.setAttribute("aria-expanded",open?"true":"false");drawer.setAttribute("aria-hidden",open?"false":"true");}
    btn.addEventListener("click",toggleMenu);
    drawer.querySelector("#lntdvStableClose").addEventListener("click",closeMenu);
    drawer.querySelectorAll("a").forEach(function(a){a.addEventListener("click",closeMenu);});
    document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMenu();});
    document.body.appendChild(drawer);
    document.body.appendChild(btn);
  }

  function init(){addStyle();buildHeader();buildMenu();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();