/* LNTDV — lightweight info menu controller */
(function(){
  "use strict";
  function installNoCircleStyle(){
    if(document.getElementById("lntdv-menu-no-circle-style")) return;
    const style=document.createElement("style");
    style.id="lntdv-menu-no-circle-style";
    style.textContent="#infoMenuButton.info-menu-button{position:fixed!important;top:18px!important;right:18px!important;left:auto!important;bottom:auto!important;width:34px!important;height:30px!important;min-width:34px!important;min-height:30px!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;background-image:none!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;color:#f4eadf!important;outline:none!important;z-index:2147483000!important}#infoMenuButton.info-menu-button span{display:block!important;width:24px!important;height:2px!important;min-width:24px!important;min-height:2px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#fffaf3!important;box-shadow:none!important;opacity:1!important;transform:none!important}#infoMenuButton.info-menu-button.open span:nth-child(1){transform:translateY(7px) rotate(45deg)!important}#infoMenuButton.info-menu-button.open span:nth-child(2){opacity:0!important}#infoMenuButton.info-menu-button.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)!important}@media(max-width:700px){#infoMenuButton.info-menu-button{top:12px!important;left:14px!important;right:auto!important;width:30px!important;height:28px!important}#infoMenuButton.info-menu-button span{width:23px!important;min-width:23px!important}}";
    document.head.appendChild(style);
  }
  function installShowQr(){
    if(document.getElementById("lntdv-show-qr")) return;
    const intro=document.querySelector("header .intro");
    if(!intro) return;
    const wrap=document.createElement("div");
    wrap.id="lntdv-show-qr";
    wrap.setAttribute("aria-label","Segui la mostra");
    wrap.innerHTML='<img alt="QR code per seguire la mostra La Nostra Terra Da Vicino" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUoAAAFKAQAAAABTUiuoAAAB/0lEQVR4nO2bQYrjMBBFX40MvbRhDpCjyFfLkeYG0VHmBvIyYPNnIcnuhmZIGBJroGqRmPgtPhRVqvp2TDwY6cejJDjqqKOOOuroK1GrMWDzMmDzYlY+zMxsfrkAR59BoyQpg66Xu5GmICBIkvQVfY0ARx+JoX4vE8RfYDFviOUnYgGDsL5UgKP/gOpqH7KZzU4S4OizqK5TkM3nCXD0+2idcBSU1jdmiKJ0ws+78+laHa1oMjOzCYi/98GQrYyE7xDg6CNRausoIbHsR9b41ZU6XaujlBk95lAneGlFN9qVclCZ72+na3W0oLpOm9k8rsBSjzKblwHS5e6dsBu01FZbgoOkHFTLSiuA11Y/aM3WbVyroXEjCMZqbdQrz1Yf6H5uAbW2AMb6W73r2eoJ1Y3a/yitL29GmgAOV6MTrY6aXe7Fgy+RbICYg0j24a5uN+g+ZaztBANKY4xa8XOrK5RjHKw5yqGNGlBS5tnqC6078SiRLu0JSWxptPnlAhx9Aj2eHcNiVptg25PfIMDRZ9Dj2bEk1XFwXAE2K2dZN1odZWmvX6RpM5vZjNTs93KjH62O7hFzKCZvWZFZBry2ekWrl1s2r81IlxWb3yjA0b/FJ29JOTTHMEM5t+Ju+voEfz6671tAXbqOfSuoTPXuE3aCmv9rwVFHHXXU0f8I/QMyzVcLgxuZ2AAAAABJRU5ErkJggg=="/><div>Segui la mostra</div>';
    const style=document.createElement("style");
    style.id="lntdv-show-qr-style";
    style.textContent="#lntdv-show-qr{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin:16px auto 4px;padding:0;text-align:center;color:#fffaf3;font:700 12px/1.2 Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase}#lntdv-show-qr img{display:block;width:128px;height:128px;max-width:34vw;min-width:104px;image-rendering:auto;background:#fff;padding:7px;border-radius:8px;box-sizing:content-box}@media(max-width:600px){#lntdv-show-qr{margin-top:13px;gap:7px;font-size:11px;letter-spacing:1.2px}#lntdv-show-qr img{width:112px;height:112px;min-width:100px;padding:6px}}";
    document.head.appendChild(style);
    intro.insertAdjacentElement("afterend",wrap);
  }
  function init(){
    installNoCircleStyle();
    installShowQr();
    const btn=document.getElementById("infoMenuButton");
    const drawer=document.getElementById("infoDrawer");
    const close=document.getElementById("infoDrawerClose");
    if(!btn||!drawer)return;
    const shut=()=>{drawer.classList.remove("open");btn.classList.remove("open");btn.setAttribute("aria-expanded","false");drawer.setAttribute("aria-hidden","true");};
    btn.addEventListener("click",()=>drawer.classList.contains("open")?shut():(drawer.classList.add("open"),btn.classList.add("open"),btn.setAttribute("aria-expanded","true"),drawer.setAttribute("aria-hidden","false")));
    close?.addEventListener("click",shut);
    drawer.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>setTimeout(shut,180)));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")shut();},{passive:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
