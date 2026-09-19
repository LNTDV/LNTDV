/* LNTDV — performance module 2026-09-19 */
(function(){
  "use strict";
  function prepareImages(){
    const imgs=[...document.querySelectorAll("img")];
    imgs.forEach((img,i)=>{
      img.decoding="async";
      img.setAttribute("draggable","false");
      if(!img.hasAttribute("loading")) img.loading = i<3 ? "eager" : "lazy";
      if(i===0) img.fetchPriority="high";
      else if(!img.fetchPriority) img.fetchPriority="auto";
      img.addEventListener("error",function(){
        this.classList.add("image-load-error");
        /* Retry once after a short delay for slow mobile/CDN connections. */
        if(!this.dataset.retry){
          this.dataset.retry="1";
          const src=this.currentSrc || this.src;
          setTimeout(()=>{ this.src=src.split("#")[0]+"#retry"; },250);
        }
      },{once:false});
    });
  }
  function init(){
    prepareImages();
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      document.documentElement.classList.add("reduce-motion");
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();