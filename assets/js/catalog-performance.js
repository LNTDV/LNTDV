/* LNTDV — catalog performance, fast progressive loading 2026-09-19 */
(function(){
  "use strict";

  const FORMAT_HTML =
    '<option value="">Seleziona formato</option>'+
    '<option value="Stampa fotografica">Stampa fotografica — €40</option>'+
    '<option value="Forex">Forex — €50</option>'+
    '<option value="File digitale in alta risoluzione">Stampa digitale ad alta definizione — €25</option>';

  function setupImage(img,index){
    img.loading = index < 3 ? "eager" : "lazy";
    img.decoding = "async";
    if(index === 0) img.fetchPriority = "high";
    img.setAttribute("width", img.getAttribute("width") || "1200");
    img.setAttribute("height", img.getAttribute("height") || "800");
    img.addEventListener("error",function(){ img.classList.add("image-load-error"); },{once:true});
  }

  function normalizeFormats(){
    document.querySelectorAll(".card").forEach(function(card,index){
      const img=card.querySelector("img");
      if(img) setupImage(img,index);

      let box=card.querySelector(".print-choice");
      if(!box){
        box=document.createElement("div");
        box.className="print-choice";
        const meta=card.querySelector(".meta");
        (meta||card).appendChild(box);
      }

      let label=box.querySelector("label");
      if(!label){
        label=document.createElement("label");
        label.textContent="Modalità di stampa";
        box.prepend(label);
      }

      let select=box.querySelector("select.format-select");
      if(!select){
        select=document.createElement("select");
        select.className="format-select";
        select.setAttribute("aria-label","Scegli il formato per questa fotografia");
        box.appendChild(select);
      }

      if(select.options.length<4) select.innerHTML=FORMAT_HTML;
      select.id=select.id || ("format-"+(index+1));
    });
  }

  function preloadNearViewport(){
    if(!("IntersectionObserver" in window)) return;
    const images=Array.from(document.querySelectorAll(".card img[loading='lazy']"));
    const io=new IntersectionObserver(function(entries,observer){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        const img=entry.target;
        img.loading="eager";
        if(img.dataset.src && !img.getAttribute("src")) img.src=img.dataset.src;
        observer.unobserve(img);
      });
    },{rootMargin:"1000px 0px",threshold:0.01});
    images.forEach(function(img){io.observe(img);});
  }

  function init(){
    normalizeFormats();
    preloadNearViewport();
    document.documentElement.classList.add("lntdv-catalog-ready");
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();