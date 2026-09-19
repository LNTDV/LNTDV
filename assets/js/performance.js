/* LNTDV — performance module */
(function(){
"use strict";
function init(){
 const imgs=[...document.images];
 imgs.forEach((img,i)=>{img.decoding="async";if(i>3){img.loading="lazy";img.fetchPriority="low"}else{img.loading="eager";img.fetchPriority=i===0?"high":"auto"}});
 if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("reduce-motion");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();