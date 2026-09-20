/* LNTDV — catalog performance, fast progressive loading 2026-09-19 */
(function(){
  "use strict";

  const FORMAT_HTML =
    '<option value="">Seleziona formato</option>'+
    '<option value="Stampa fotografica">Stampa fotografica — €40</option>'+
    '<option value="Forex">Pannello – Forex — €50</option>'+
    '<option value="File digitale in alta risoluzione">Stampa digitale ad alta definizione — €25</option>';

  function setupImage(img,index){
    img.loading = index < 2 ? "eager" : "lazy";
    img.decoding = "async";
    img.style.setProperty("transform","none","important");
    img.style.setProperty("rotate","none","important");
    img.style.setProperty("image-orientation","from-image","important");
    img.fetchPriority = index === 0 ? "high" : "auto";
    if(!img.getAttribute("width") || !img.getAttribute("height")){
      const vertical=img.dataset.orientation==="vertical";
      img.setAttribute("width",vertical?"800":"1200");
      img.setAttribute("height",vertical?"1200":"800");
    }
    img.addEventListener("error",function(){ img.classList.add("image-load-error"); },{once:true});
  }

  function enforceSingleCatalog(){
    // The published catalog is already authoritative and contains exactly 25 cards.
    // Never remove cards at runtime: a transient parsing/DOM issue must not blank the gallery.
    const all=Array.from(document.querySelectorAll('.grid .card'));
    if(all.length !== 25){
      console.warn('LNTDV: catalog cards detected:', all.length, 'expected 25.');
    }
    all.forEach(function(card){
      card.style.setProperty('display','block','important');
      card.style.setProperty('visibility','visible','important');
      card.style.setProperty('opacity','1','important');
    });
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
    // Carica subito solo le prime immagini; il browser gestisce il lazy-loading delle altre.
    document.querySelectorAll(".card img").forEach(function(img,index){
      img.loading = index < 2 ? "eager" : "lazy";
      if(img.dataset.src && !img.getAttribute("src")) img.src=img.dataset.src;
    });
  }

  function updateSelectionSummary(){
    const n=document.querySelectorAll(".card.selected").length;
    const box=document.getElementById("selectionSummary");
    if(!box) return;
    box.querySelector("span")?.replaceChildren(document.createTextNode(
      n ? (n===1 ? "1 fotografia selezionata" : n+" fotografie selezionate") : "Seleziona la foto e il formato desiderato"
    ));
  }

  function init(){
    enforceSingleCatalog();
    normalizeFormats();
    preloadNearViewport();
    updateSelectionSummary();
    document.addEventListener("click",function(e){
      if(e.target.closest(".card") && !e.target.closest("select,option,input,button,a")){
        requestAnimationFrame(updateSelectionSummary);
      }
    },{passive:true});
    document.addEventListener("change",function(e){
      if(e.target.matches(".format-select")) requestAnimationFrame(updateSelectionSummary);
    },{passive:true});
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      document.documentElement.classList.add("reduce-motion");
    }
    document.documentElement.classList.add("lntdv-catalog-ready");
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();