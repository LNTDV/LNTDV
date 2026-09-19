document.documentElement.classList.add('js');
const root=document.querySelector('#catalog-root');
const content={
 title:'La Nostra Terra da Vicino',
 intro:'Un viaggio fotografico nel territorio, nella materia e nei dettagli della natura. Guardare da vicino significa rallentare, ascoltare e riconoscere ciò che spesso passa inosservato.',
 sections:[
  {title:'La terra',text:'Superfici, tracce, forme e piccoli mutamenti raccontano il paesaggio attraverso una distanza diversa: quella dello sguardo ravvicinato.'},
  {title:'Il tempo',text:'La natura conserva il tempo. Ogni dettaglio diventa memoria di una stagione, di una trasformazione, di qualcosa che nasce e qualcosa che cambia.'},
  {title:'La cura',text:'Avvicinarsi alla natura significa anche imparare a proteggerla. La fotografia diventa uno spazio di attenzione, sensibilità e consapevolezza.'}
 ]
};
root.innerHTML=`<section class="hero"><div class="fade"><h1>${content.title}</h1><p>${content.intro}</p></div></section>`+content.sections.map(s=>`<section class="section fade"><h2 class="section-title">${s.title}</h2><p class="quote">${s.text}</p></section>`).join('')+`<footer class="footer"><span>${content.title}</span><span>Fotografia · Natura · Territorio</span></footer>`;
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));
window.addEventListener('load',()=>document.body.classList.add('ready'));
