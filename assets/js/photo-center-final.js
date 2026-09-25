/* LNTDV — PHOTO CENTER + READABLE PHOTO METADATA — 2026-09-21
   Centra la foto e rende leggibili titolo progetto, codice, percorso, orientamento, formato e selezione.
*/
(function(){
  function injectReadableCatalogStyle(){
    if(document.getElementById('lntdv-readable-catalog-style')) return;
    var style=document.createElement('style');
    style.id='lntdv-readable-catalog-style';
    style.textContent="\n.grid .card .meta{\n  width:min(100%,760px)!important;margin:0 auto!important;padding:18px 16px 28px!important;\n  box-sizing:border-box!important;display:flex!important;flex-direction:column!important;\n  align-items:center!important;justify-content:center!important;text-align:center!important;\n  gap:6px!important;color:#5a3b2b!important;\n}\n.grid .card .meta .photo-project-title{\n  display:block!important;width:100%!important;margin:0 0 2px!important;\n  font:700 11px/1.35 Arial,sans-serif!important;letter-spacing:1.8px!important;\n  text-transform:uppercase!important;color:#7b5a45!important;\n}\n.grid .card .meta .photo-code{\n  display:block!important;width:100%!important;margin:0!important;order:1!important;\n  font:800 19px/1.2 Arial,sans-serif!important;letter-spacing:1.4px!important;color:#5a3b2b!important;\n}\n.grid .card .meta .photo-path{\n  display:block!important;width:100%!important;margin:0!important;order:2!important;\n  font:600 12px/1.4 Arial,sans-serif!important;color:#6f5544!important;\n}\n.grid .card .meta .photo-specs{\n  display:flex!important;justify-content:center!important;align-items:center!important;order:3!important;\n  flex-wrap:wrap!important;gap:5px 12px!important;width:100%!important;margin:2px 0 7px!important;\n  font:500 12px/1.45 Arial,sans-serif!important;color:#6f5544!important;\n}\n.grid .card .meta .photo-specs span{white-space:nowrap!important}\n.grid .card .meta .print-choice{\n  width:min(100%,390px)!important;margin:8px auto 0!important;display:flex!important;\n  flex-direction:column!important;align-items:center!important;justify-content:center!important;\n  gap:6px!important;order:10!important;\n}\n.grid .card .meta .print-choice label{\n  display:block!important;width:100%!important;text-align:center!important;\n  font:700 11px/1.3 Arial,sans-serif!important;letter-spacing:1.1px!important;\n  text-transform:uppercase!important;color:#5a3b2b!important;\n}\n.grid .card .meta .print-choice select,.grid .card .meta .format-select{\n  display:block!important;width:100%!important;min-height:46px!important;margin:0 auto!important;\n  padding:10px 40px 10px 14px!important;box-sizing:border-box!important;border:1px solid #bda692!important;\n  border-radius:12px!important;background:#fffaf4!important;color:#4d3729!important;\n  font:600 13px/1.25 Arial,sans-serif!important;text-align:center!important;text-align-last:center!important;\n  box-shadow:0 3px 12px rgba(90,59,43,.08)!important;\n}\n.grid .card .meta .print-choice select:focus{outline:2px solid #8a674f!important;outline-offset:2px!important}\n.grid .card .lntdv-photo-stage{\n  margin-left:auto!important;margin-right:auto!important;display:flex!important;\n  align-items:center!important;justify-content:center!important;overflow:hidden!important;\n}\n.grid .card .lntdv-photo-stage img{display:block!important;margin:0 auto!important;object-position:center center!important}\n@media(max-width:600px){\n  .grid .card .meta{width:100%!important;padding:14px 14px 24px!important;gap:5px!important}\n  .grid .card .meta .photo-project-title{font-size:10px!important;letter-spacing:1.4px!important}\n  .grid .card .meta .photo-code{font-size:17px!important}\n  .grid .card .meta .photo-specs{font-size:11px!important;gap:3px 9px!important}\n  .grid .card .meta .print-choice{width:min(100%,360px)!important;margin-top:8px!important}\n  .grid .card .meta .print-choice select,.grid .card .meta .format-select{min-height:48px!important;font-size:13px!important}\n}\n.grid .card .meta{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important}\n.grid .card .meta .photo-project-title{order:1!important}\n.grid .card .meta .photo-code{order:2!important}\n.grid .card .meta .photo-path{order:3!important}\n.grid .card .meta .photo-specs{order:4!important}\n.grid .card .meta .print-choice{order:5!important;width:min(100%,360px)!important;margin:10px auto 0!important}\n.grid .card .meta .print-choice label{text-align:center!important}\n.grid .card .meta .print-choice select,.grid .card .meta .format-select{width:100%!important;margin:0 auto!important;text-align:center!important;text-align-last:center!important}\n";
    style.textContent += '\n.grid .card .meta .photo-format-label{display:none!important}\n';
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
    if(!meta.querySelector('.photo-project-title')){var project=document.createElement('div');project.className='photo-project-title';project.textContent='LNTDV · LA NOSTRA TERRA DA VICINO · EDVINAS DRAGONI';meta.insertBefore(project,meta.firstChild)}
    if(codeEl){codeEl.classList.add('photo-code');codeEl.setAttribute('aria-label','Codice fotografia '+code)}
    if(pathEl){pathEl.classList.add('photo-path');pathEl.textContent=path || 'Progetto fotografico'}
    if(oldOrientationEl) oldOrientationEl.style.display='none';
    var specs=meta.querySelector('.photo-specs');
    if(!specs){specs=document.createElement('div');specs.className='photo-specs';meta.insertBefore(specs,printChoice || null)}
    function setSpec(){
      var w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return;
      var horizontal=w>=h,orientation=horizontal?'Orizzontale':'Verticale';
      card.dataset.orientation=horizontal?'horizontal':'vertical';stage.dataset.photoOrientation=horizontal?'horizontal':'vertical';img.dataset.orientation=horizontal?'orizzontale':'verticale';
      specs.innerHTML='';var a=document.createElement('span');a.textContent='Orientamento: '+orientation;var b=document.createElement('span');b.textContent='Formato standard: 50 × 70 cm';specs.appendChild(a);specs.appendChild(b);
      card.dataset.photoCode=code;stage.dataset.photoCode=code;img.dataset.photoCode=code;img.dataset.photoOrientation=horizontal?'horizontal':'vertical';
      stage.style.marginLeft='auto';stage.style.marginRight='auto';stage.style.display='flex';stage.style.alignItems='center';stage.style.justifyContent='center';img.style.marginLeft='auto';img.style.marginRight='auto';img.style.objectPosition='center center';
    }
    if(img.complete)setSpec();else img.addEventListener('load',setSpec,{once:true});
    if(printChoice){printChoice.style.order='5';var label=printChoice.querySelector('label');if(label)label.textContent='Seleziona il formato'}
  }
  function centerPhotos(){injectReadableCatalogStyle();document.querySelectorAll('.grid .card').forEach(setupCard)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',centerPhotos);else centerPhotos();
  window.addEventListener('load',centerPhotos,{once:true});
  function injectProjectDescriptions(){
    if(document.getElementById('lntdv-project-description-block'))return;
    var summary=document.getElementById('selectionSummary');if(!summary||!summary.parentNode)return;
    var box=document.createElement('section');box.id='lntdv-project-description-block';box.setAttribute('aria-labelledby','lntdv-project-description-title');
    box.innerHTML='<div class="lntdv-project-description-inner"><div class="lntdv-project-description-kicker">IL PROGETTO</div><h2 id="lntdv-project-description-title">La Nostra Terra Da Vicino</h2><p>Il progetto nasce dall\'osservazione della terra e dei luoghi che attraversiamo ogni giorno, cercando dettagli, contrasti e atmosfere che spesso passano inosservati.</p><p>Il lavoro nasce dal desiderio di fermare lo sguardo sul territorio e costruire, attraverso la fotografia, una memoria visiva del rapporto tra ambiente e presenza umana.</p><div class="lntdv-project-description-grid"><article><span>01 · LA MOSTRA</span><h3>Uno sguardo sul territorio</h3><p>La mostra fotografica racconta il rapporto tra territorio, natura, tempo e trasformazione del paesaggio attraverso uno sguardo ravvicinato sui luoghi e sui dettagli che li caratterizzano.</p></article><article><span>02 · IL PERCORSO</span><h3>Natura · Tempo · Natura vs Città</h3><p>La ricerca ha portato alla realizzazione e alla selezione di 25 fotografie, organizzate attorno a tre direzioni: <strong>Natura</strong>, <strong>Tempo</strong> e <strong>Natura vs Città</strong>. Ogni immagine è parte di un racconto più ampio sul modo in cui osserviamo e viviamo il territorio.</p></article></div></div>';
    var style=document.createElement('style');style.id='lntdv-project-description-style';style.textContent='#lntdv-project-description-block{width:100%;box-sizing:border-box;margin:0 auto 26px;padding:0 14px;background:#fbf6ef;color:#5a3b2b}.lntdv-project-description-inner{width:min(920px,100%);margin:0 auto;padding:24px 20px 22px;box-sizing:border-box;border:1px solid #cdb8a5;border-radius:16px;background:#fffaf4;box-shadow:0 6px 22px rgba(90,59,43,.07)}.lntdv-project-description-kicker{font:800 10px/1.2 Arial,sans-serif;letter-spacing:2px;color:#7b5a45;text-align:center}#lntdv-project-description-block h2{margin:6px 0 10px;text-align:center;font:700 27px/1.15 Georgia,serif;color:#5a3b2b}#lntdv-project-description-block p{margin:8px auto;max-width:800px;font:14px/1.65 Arial,sans-serif;color:#6f5544;text-align:center}.lntdv-project-description-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}.lntdv-project-description-grid article{padding:15px 16px;border:1px solid #d8c6b4;border-radius:12px;background:#fbf6ef}.lntdv-project-description-grid article>span{display:block;margin-bottom:5px;font:800 9px/1.2 Arial,sans-serif;letter-spacing:1.5px;color:#7b5a45}.lntdv-project-description-grid h3{margin:0 0 5px;font:700 18px/1.25 Georgia,serif;color:#5a3b2b;text-align:center}.lntdv-project-description-grid p{font-size:12px;line-height:1.55;margin:0;text-align:center}@media(max-width:600px){#lntdv-project-description-block{padding:0 10px;margin-bottom:20px}.lntdv-project-description-inner{padding:19px 14px 17px;border-radius:13px}#lntdv-project-description-block h2{font-size:23px}.lntdv-project-description-block p{font-size:12px}.lntdv-project-description-grid{grid-template-columns:1fr;gap:10px;margin-top:14px}.lntdv-project-description-grid article{padding:13px 12px}.lntdv-project-description-grid h3{font-size:16px}.lntdv-project-description-grid p{font-size:11px}}';document.head.appendChild(style);summary.parentNode.insertBefore(box,summary);
  }

  function fixLntdvHeader(){
    Array.from(document.body.childNodes).forEach(function(node){if(node.nodeType===3&&node.textContent.trim()==='\\n')node.remove()});
    var menu=document.getElementById('infoMenuButton'),header=document.querySelector('header');
    if(menu&&header){header.style.position='relative';menu.style.position='absolute';menu.style.top='14px';menu.style.right='16px';menu.style.left='auto';menu.style.bottom='auto'}
    var oldQr=document.getElementById('lntdv-story-qr-block');if(oldQr)oldQr.remove();
    var description=document.querySelector('.lntdv-title-description');
    if(description){
      var qr=document.createElement('div');qr.id='lntdv-story-qr-block';
      qr.innerHTML='<img src="./assets/qr/lntdv-story-qr.svg?v=20260925final3" alt="QR code — Segui la storia nella mostra"><div>Segui la storia nella mostra</div>';
      qr.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:flex-start;width:100%;margin:20px auto 0;padding:0;text-align:center;box-sizing:border-box';
      var img=qr.querySelector('img');img.style.cssText='display:block;width:136px;height:136px;max-width:136px;object-fit:contain;margin:0 auto 8px;border:4px solid #fff;border-radius:4px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.18);box-sizing:border-box';
      qr.querySelector('div').style.cssText='font:600 11px/1.3 Arial,sans-serif;letter-spacing:.7px;color:#fffaf3';
      description.insertAdjacentElement('afterend',qr);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fixLntdvHeader);else fixLntdvHeader();
  window.addEventListener('load',fixLntdvHeader,{once:true});
  injectProjectDescriptions();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectProjectDescriptions);
})();