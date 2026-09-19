/* LNTDV — catalog rendering/performance 2026-09-19 */
(function(){
  "use strict";
  const FORMAT_HTML =
    '<option value="">Seleziona formato</option>'+
    '<option value="Stampa fotografica">Stampa fotografica — €40</option>'+
    '<option value="Forex">Forex — €50</option>'+
    '<option value="File digitale in alta risoluzione">Stampa digitale ad alta definizione — €25</option>';

  function normalizeFormats(){
    document.querySelectorAll(".card").forEach((card,index)=>{
      const img=card.querySelector("img");
      if(!img) return;

      img.loading = index<3 ? "eager" : "lazy";
      img.decoding = "async";
      if(index===0) img.fetchPriority="high";

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
        label.textContent="Seleziona formato";
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

  function init(){
    normalizeFormats();
    if("IntersectionObserver" in window){
      const io=new IntersectionObserver((entries,observer)=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting) return;
          const img=entry.target;
          if(img.dataset.src && !img.src) img.src=img.dataset.src;
          observer.unobserve(img);
        });
      },{rootMargin:"1200px 0px"});
      document.querySelectorAll(".card img[loading='lazy']").forEach(img=>io.observe(img));
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();