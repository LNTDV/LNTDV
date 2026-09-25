/* LNTDV — stable menu + hero — 2026-09-25 */
(function(){
'use strict';
var HOME='https://lntdv.it/';
var links=[
 ['Home',HOME],
 ['Catalogo fotografico — 25 fotografie',HOME+'catalogo.html'],
 ['La mostra',HOME+'#mostra'],
 ['Il progetto',HOME+'#progetto'],
 ['Natura',HOME+'#natura'],
 ['Tempo',HOME+'#tempo'],
 ['Natura vs Città',HOME+'#natura-citta'],
 ['Uno sguardo lento',HOME+'#sguardo'],
 ['Chi sono — Edvinas Dragoni',HOME+'#edvinas'],
 ['Social — Instagram','https://www.instagram.com/edvinas_420.99/'],
 ['Contatti','mailto:info.lanostraterradavicino@gmail.com']
];
function css(){if(document.getElementById('lntdv-menu-css'))return;var s=document.createElement('style');s.id='lntdv-menu-css';s.textContent='#lntdvStableMenu{position:fixed;top:195px;right:12px;width:52px;height:48px;padding:7px;border:0;border-radius:8px;background:#fbf6ef;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;z-index:2147483647;cursor:pointer;box-shadow:0 2px 10px rgba(90,59,43,.12)}#lntdvStableMenu span{display:block;width:30px;height:3px;background:#5a3b2b;border-radius:2px}#lntdvStableDrawer{position:fixed;top:0;right:0;width:min(330px,88vw);height:100dvh;background:#fbf6ef;color:#5a3b2b;z-index:2147483646;transform:translateX(105%);transition:transform .25s ease;box-shadow:-8px 0 30px rgba(90,59,43,.18);padding:76px 24px 24px;box-sizing:border-box;overflow:auto}#lntdvStableDrawer.open{transform:translateX(0)}#lntdvStableDrawer h2{margin:0 0 24px;font:700 26px/1.15 Georgia,serif}#lntdvStableDrawer a{display:block;padding:14px 0;border-bottom:1px solid #d8c8bb;color:#5a3b2b;text-decoration:none;font:700 15px/1.3 Arial,sans-serif}#lntdvStableClose{position:absolute;top:16px;right:18px;border:0;background:transparent;color:#5a3b2b;font-size:30px;line-height:1}';document.head.appendChild(s)}
function menu(){var old=document.getElementById('lntdvStableMenu');if(old)old.remove();old=document.getElementById('lntdvStableDrawer');if(old)old.remove();var b=document.createElement('button');b.id='lntdvStableMenu';b.type='button';b.setAttribute('aria-label','Apri menu');b.setAttribute('aria-expanded','false');b.innerHTML='<span></span><span></span><span></span>';var d=document.createElement('aside');d.id='lntdvStableDrawer';d.setAttribute('aria-hidden','true');var close=document.createElement('button');close.id='lntdvStableClose';close.type='button';close.setAttribute('aria-label','Chiudi menu');close.textContent='×';d.appendChild(close);var h=document.createElement('h2');h.textContent='Esplora la mostra';d.appendChild(h);links.forEach(function(item){var a=document.createElement('a');a.href=item[1];a.textContent=item[0];if(item[1].indexOf('https://www.instagram.com/')===0){a.target='_blank';a.rel='noopener noreferrer'}a.addEventListener('click',function(){setTimeout(function(){closeMenu()},0)});d.appendChild(a)});function closeMenu(){d.classList.remove('open');b.setAttribute('aria-expanded','false');d.setAttribute('aria-hidden','true')}b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var open=!d.classList.contains('open');d.classList.toggle('open',open);b.setAttribute('aria-expanded',open?'true':'false');d.setAttribute('aria-hidden',open?'false':'true')});close.addEventListener('click',closeMenu);document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});document.body.appendChild(d);document.body.appendChild(b)}
function run(){css();menu()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();window.addEventListener('load',function(){setTimeout(run,100)});
})();