/* LNTDV — PHOTO CENTER SCRIPT — 2026-09-20
   Legge il codice LNTDV-xxx e l'orientamento presenti in ogni scheda,
   li applica come metadati e forza il centraggio della fotografia.
*/
(function(){
  function centerPhotos(){
    document.querySelectorAll('.grid .card').forEach(function(card){
      var codeEl=card.querySelector('.meta>strong');
      var orientationEl=card.querySelector('.meta>small');
      var img=card.querySelector('.lntdv-photo-stage>img');
      if(!img) return;

      var code=(codeEl&&codeEl.textContent||'').trim().toUpperCase();
      var orientationText=(orientationEl&&orientationEl.textContent||'').toLowerCase();
      var orientation=orientationText.indexOf('vertical')!==-1 ? 'vertical' : 'horizontal';

      if(code) card.dataset.photoCode=code;
      card.dataset.photoOrientation=orientation;
      img.dataset.photoCode=code;
      img.dataset.photoOrientation=orientation;

      var stage=card.querySelector('.lntdv-photo-stage');
      if(stage){
        stage.dataset.photoCode=code;
        stage.dataset.photoOrientation=orientation;
        stage.style.marginLeft='auto';
        stage.style.marginRight='auto';
        stage.style.display='flex';
        stage.style.alignItems='center';
        stage.style.justifyContent='center';
      }

      img.style.marginLeft='auto';
      img.style.marginRight='auto';
      img.style.objectPosition='center center';
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',centerPhotos);
  }else{
    centerPhotos();
  }
  window.addEventListener('load',centerPhotos,{once:true});
})();
