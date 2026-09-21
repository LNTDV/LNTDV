/* LNTDV — PHOTO CENTER + READABLE PHOTO METADATA — 2026-09-21
   Centra la foto e rende leggibili titolo progetto, codice, percorso, orientamento, formato e selezione.
*/
(function(){
  function injectReadableCatalogStyle(){
    if(document.getElementById('lntdv-readable-catalog-style')) return;
    var style=document.createElement('style');
    style.id='lntdv-readable-catalog-style';
    style.textContent="\n.grid .card .meta{\n  width:min(100%,760px)!important;margin:0 auto!important;padding:18px 16px 28px!important;\n  box-sizing:border-box!important;display:flex!important;flex-direction:column!important;\n  align-items:center!important;justify-content:center!important;text-align:center!important;\n  gap:6px!important;color:#5a3b2b!important;\n}\n.grid .card .meta .photo-project-title{\n  display:block!important;width:100%!important;margin:0 0 2px!important;\n  font:700 11px/1.35 Arial,sans-serif!important;letter-spacing:1.8px!important;\n  text-transform:uppercase!important;color:#7b5a45!important;\n}\n.grid .card .meta .photo-code{\n  display:block!important;width:100%!important;margin:0!important;order:1!important;\n  font:800 19px/1.2 Arial,sans-serif!important;letter-spacing:1.4px!important;color:#5a3b2b!important;\n}\n.grid .card .meta .photo-path{\n  display:block!important;width:100%!important;margin:0!important;order:2!important;\n  font:600 12px/1.4 Arial,sans-serif!important;color:#6f5544!important;\n}\n.grid .card .meta .photo-specs{\n  display:flex!important;justify-content:center!important;align-items:center!important;order:3!important;\n  flex-wrap:wrap!important;gap:5px 12px!important;width:100%!important;margin:2px 0 7px!important;\n  font:500 12px/1.45 Arial,sans-serif!important;color:#6f5544!important;\n}\n.grid .card .meta .photo-specs span{white-space:nowrap!important}\n.grid .card .meta .print-choice{\n  width:min(100%,390px)!important;margin:8px auto 0!important;display:flex!important;\n  flex-direction:column!important;align-items:center!important;justify-content:center!important;\n  gap:6px!important;order:10!important;\n}\n.grid .card .meta .print-choice label{\n  display:block!important;width:100%!important;text-align:center!important;\n  font:700 11px/1.3 Arial,sans-serif!important;letter-spacing:1.1px!important;\n  text-transform:uppercase!important;color:#5a3b2b!important;\n}\n.grid .card .meta .print-choice select,.grid .card .meta .format-select{\n  display:block!important;width:100%!important;min-height:46px!important;margin:0 auto!important;\n  padding:10px 40px 10px 14px!important;box-sizing:border-box!important;border:1px solid #bda692!important;\n  border-radius:12px!important;background:#fffaf4!important;color:#4d3729!important;\n  font:600 13px/1.25 Arial,sans-serif!important;text-align:center!important;text-align-last:center!important;\n  box-shadow:0 3px 12px rgba(90,59,43,.08)!important;\n}\n.grid .card .meta .print-choice select:focus{outline:2px solid #8a674f!important;outline-offset:2px!important}\n.grid .card .lntdv-photo-stage{\n  margin-left:auto!important;margin-right:auto!important;display:flex!important;\n  align-items:center!important;justify-content:center!important;overflow:hidden!important;\n}\n.grid .card .lntdv-photo-stage img{display:block!important;margin:0 auto!important;object-position:center center!important}\n@media(max-width:600px){\n  .grid .card .meta{width:100%!important;padding:14px 14px 24px!important;gap:5px!important}\n  .grid .card .meta .photo-project-title{font-size:10px!important;letter-spacing:1.4px!important}\n  .grid .card .meta .photo-code{font-size:17px!important}\n  .grid .card .meta .photo-specs{font-size:11px!important;gap:3px 9px!important}\n  .grid .card .meta .print-choice{width:min(100%,360px)!important;margin-top:8px!important}\n  .grid .card .meta .print-choice select,.grid .card .meta .format-select{min-height:48px!important;font-size:13px!important}\n}\n.grid .card .meta{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important}\n.grid .card .meta .photo-project-title{order:1!important}\n.grid .card .meta .photo-code{order:2!important}\n.grid .card .meta .photo-path{order:3!important}\n.grid .card .meta .photo-specs{order:4!important}\n.grid .card .meta .print-choice{order:5!important;width:min(100%,360px)!important;margin:10px auto 0!important}\n.grid .card .meta .print-choice label{text-align:center!important}\n.grid .card .meta .print-choice select,.grid .card .meta .format-select{width:100%!important;margin:0 auto!important;text-align:center!important;text-align-last:center!important}\n";
    document.head.appendChild(style);
  }

  function setupCard(card){
    var meta=card.querySelector('.meta');
    var stage=card.querySelector('.lntdv-photo-stage');
    var img=stage && stage.querySelector('img');
    if(!meta || !img) return;

    var codeEl=meta.querySelector('strong');
    var pathEl=meta.querySelector('span:not(.selection-check)');
    var oldOrientationEl=meta.querySelector('small');
    var printChoice=meta.querySelector('.print-choice');

    var code=(codeEl && codeEl.textContent || '').trim().toUpperCase();
    var path=(pathEl && pathEl.textContent || '').trim();

    if(!meta.querySelector('.photo-project-title')){
      var project=document.createElement('div');
      project.className='photo-project-title';
      project.textContent='LNTDV · LA NOSTRA TERRA DA VICINO · EDVINAS DRAGONI';
      meta.insertBefore(project,meta.firstChild);
    }

    if(codeEl){
      codeEl.classList.add('photo-code');
      codeEl.setAttribute('aria-label','Codice fotografia '+code);
    }

    if(pathEl){
      pathEl.classList.add('photo-path');
      pathEl.textContent=path || 'Progetto fotografico';
    }

    if(oldOrientationEl) oldOrientationEl.style.display='none';

    var specs=meta.querySelector('.photo-specs');
    if(!specs){
      specs=document.createElement('div');
      specs.className='photo-specs';
      meta.insertBefore(specs,printChoice || null);
    }

    function setSpec(){
      var w=img.naturalWidth;
      var h=img.naturalHeight;
      if(!w || !h) return;

      var horizontal=w>=h;
      var orientation=horizontal?'Orizzontale':'Verticale';
      var ratio=(w/h).toFixed(2);

      card.dataset.orientation=horizontal?'horizontal':'vertical';
      stage.dataset.photoOrientation=horizontal?'horizontal':'vertical';
      img.dataset.orientation=horizontal?'orizzontale':'verticale';

      specs.innerHTML='';
      var a=document.createElement('span');
      a.textContent='Orientamento: '+orientation;
      var b=document.createElement('span');
      b.textContent='Formato: '+ratio+':1';
      specs.appendChild(a);
      specs.appendChild(b);

      card.dataset.photoCode=code;
      stage.dataset.photoCode=code;
      img.dataset.photoCode=code;
      img.dataset.photoOrientation=horizontal?'horizontal':'vertical';

      stage.style.marginLeft='auto';
      stage.style.marginRight='auto';
      stage.style.display='flex';
      stage.style.alignItems='center';
      stage.style.justifyContent='center';
      img.style.marginLeft='auto';
      img.style.marginRight='auto';
      img.style.objectPosition='center center';
    }

    if(img.complete) setSpec();
    else img.addEventListener('load',setSpec,{once:true});

    if(printChoice){
      printChoice.style.order='5';
      var label=printChoice.querySelector('label');
      if(label) label.textContent='Seleziona il formato';
    }
  }

  function centerPhotos(){
    injectReadableCatalogStyle();
    document.querySelectorAll('.grid .card').forEach(setupCard);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',centerPhotos);
  else centerPhotos();

  window.addEventListener('load',centerPhotos,{once:true});
})();