const siteHeader=document.querySelector('.site-header');
if(siteHeader){let headerQueued=false;const updateHeader=()=>{siteHeader.classList.toggle('is-scrolled',window.scrollY>8);headerQueued=false};window.addEventListener('scroll',()=>{if(!headerQueued){headerQueued=true;requestAnimationFrame(updateHeader)}},{passive:true});updateHeader()}
document.querySelectorAll('.menu-toggle').forEach(button=>{const nav=document.getElementById(button.getAttribute('aria-controls'));const close=()=>{button.setAttribute('aria-expanded','false');nav.classList.remove('open')};button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus()}});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close))});
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('in-view',entry.isIntersecting)),{threshold:.15});document.querySelectorAll('.product-scene,.intent-scene,.team-composition').forEach(el=>observer.observe(el));}
(() => {
 const controls=[...document.querySelectorAll('[data-filter-group]')];
 if(!controls.length)return;
 const params=new URLSearchParams(location.search), selected={service:params.get('servizio')||'Tutti',industry:'Tutti',kind:'Tutti'},cards=[...document.querySelectorAll('.work-card[data-industry]')],status=document.getElementById('filter-status'),empty=document.getElementById('empty-results');
 function update(){let count=0;cards.forEach(card=>{card.hidden=(selected.service!=='Tutti'&&!(card.dataset.services||card.dataset.category).split(' ').includes(selected.service))||(selected.industry!=='Tutti'&&card.dataset.industry!==selected.industry)||(selected.kind!=='Tutti'&&(card.dataset.kind||'concept')!==selected.kind);if(!card.hidden)count++});controls.forEach(button=>button.setAttribute('aria-pressed',String(selected[button.dataset.filterGroup]===button.dataset.filter)));const real=cards.filter(c=>!c.hidden&&c.dataset.kind==='real').length;status.textContent=count+' lavori: '+real+' progetti reali e '+(count-real)+' concept';empty.hidden=count!==0;}
 controls.forEach(button=>button.addEventListener('click',()=>{selected[button.dataset.filterGroup]=button.dataset.filter;update()}));update();
})();
  (() => {
    if(!document.getElementById('hero-word'))return;
    const root=document.documentElement, reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const word=document.getElementById('hero-word');
    const words=['Data','Software','AI','Automation'];
    let wordIndex=0, paused=reduced.matches, timer, deleting=false;
    const stop=()=>{clearTimeout(timer);timer=undefined};
    function tick(){
      if(paused||document.hidden)return;
      const target=words[wordIndex], current=word.textContent;
      if(deleting){
        if(current.length>0){word.textContent=current.slice(0,-1);timer=setTimeout(tick,48)}
        else{deleting=false;wordIndex=(wordIndex+1)%words.length;timer=setTimeout(tick,150)}
      }else if(current.length<target.length){word.textContent=target.slice(0,current.length+1);timer=setTimeout(tick,95)}
      else{deleting=true;timer=setTimeout(tick,1600)}
    }
    function rotation(){
      stop();word.classList.remove('out');
      root.classList.toggle('motion-paused',paused);
      if(paused){word.textContent=words[wordIndex];deleting=false}
      else if(!document.hidden){timer=setTimeout(tick,1200)}
    }
    reduced.addEventListener('change',()=>{paused=reduced.matches;rotation()});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(!paused)timer=setTimeout(tick,400)});
    rotation();
    const ns='http://www.w3.org/2000/svg', keys=document.getElementById('keyboard-keys');
    for(let row=0;row<4;row++)for(let col=0;col<12;col++){const k=document.createElementNS(ns,'rect');k.setAttribute('x',String(col*15));k.setAttribute('y',String(row*16));k.setAttribute('width','12');k.setAttribute('height','12');k.setAttribute('rx','1');k.setAttribute('class','key-top');keys.appendChild(k)}
    const steps=[...document.querySelectorAll('.step')],buttons=[...document.querySelectorAll('.step-controls button')],machine=document.getElementById('machine'),caption=document.getElementById('machine-caption');
    const captions=['01 / Si parte dalle tue persone.','02 / Le idee diventano visibili.','03 / Ogni parte trova la sua connessione.','04 / Il valore continua a crescere.'];let current=-1,queued=false;
    function setStage(i){if(i===current)return;current=i;machine.dataset.stage=String(i);caption.textContent=captions[i];buttons.forEach((b,j)=>j===i?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'))}
    function update(){queued=false;const mobile=window.innerWidth<=700,headerHeight=siteHeader?siteHeader.offsetHeight:0,focus=mobile?headerHeight+330+(window.innerHeight-headerHeight-330)*.5:headerHeight+(window.innerHeight-headerHeight)*.5;let best=0,distance=Infinity;steps.forEach((s,i)=>{const r=s.getBoundingClientRect();const d=Math.abs((r.top+r.bottom)/2-focus);if(d<distance){distance=d;best=i}});setStage(best)}
    function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}
    window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);buttons.forEach((b,i)=>b.addEventListener('click',()=>steps[i].scrollIntoView({behavior:paused?'instant':'smooth',block:'start'})));update();
  })();

// Natural scrolling only: the section pins a screen, never captures wheel input.
(() => {
 const stories=[...document.querySelectorAll('[data-pinned-story]')];
 if(!stories.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const shouldPin=()=>!reduced.matches&&window.innerHeight>=640;
 const canPin=story=>shouldPin()&&!(story.section.classList.contains('culture-story')&&(window.innerWidth<360||(window.innerWidth<=700&&window.innerHeight<820)));
 const header=document.querySelector('.site-header');
 let queued=false;
 const state=stories.map(section=>({section,screen:section.querySelector('.story-screen'),panels:[...section.querySelectorAll('.story-panel')],buttons:[...section.querySelectorAll('[data-story-go]')],active:-1}));
 function setActive(story,index){
  if(story.active===index)return;
  story.active=index;story.section.dataset.storyStage=String(index);
  story.panels.forEach((panel,i)=>{panel.classList.toggle('is-active',i===index);panel.setAttribute('aria-hidden',String(i!==index))});
  story.buttons.forEach((button,i)=>i===index?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current'));
 }
 function update(){
  queued=false;if(!shouldPin())return;
  const top=header?header.offsetHeight:0;
  state.forEach(story=>{if(!canPin(story))return;const rect=story.section.getBoundingClientRect(),distance=story.section.offsetHeight-story.screen.offsetHeight;const progress=Math.max(0,Math.min(1,(top-rect.top)/Math.max(1,distance)));story.section.style.setProperty('--story-progress',progress.toFixed(4));setActive(story,Math.min(story.panels.length-1,Math.floor(progress*story.panels.length)))});
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}
 function configure(){
  state.forEach(story=>{story.section.classList.toggle('scroll-ready',canPin(story));story.active=-1;
   if(!canPin(story)){delete story.section.dataset.storyStage;story.panels.forEach(panel=>{panel.removeAttribute('aria-hidden');panel.classList.remove('is-active')});story.buttons.forEach(button=>button.removeAttribute('aria-current'))}
  });update();
 }
 state.forEach(story=>story.buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  if(!canPin(story))return;
  const top=header?header.offsetHeight:0,distance=story.section.offsetHeight-story.screen.offsetHeight;
  // Land inside the phase, rather than on a rounding boundary.
  const fraction=i===0?0:(i+.15)/story.panels.length;
  window.scrollTo({top:window.scrollY+story.section.getBoundingClientRect().top-top+distance*fraction,behavior:'smooth'});
 })));
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',configure);reduced.addEventListener('change',configure);configure();
})();

/* Contact prototype: memory only; no backend or external submission. */
(() => {
 const triggers=[...document.querySelectorAll('a.cta[href="mailto:info@laifgroup.com"]')];
 if(!triggers.length)return;
 const dialog=document.createElement('dialog');dialog.className='contact-dialog';dialog.setAttribute('aria-labelledby','contact-title');
 dialog.innerHTML='<div class="contact-shell"><div class="contact-top"><span class="contact-logo">LAIF</span><button class="contact-close" type="button" aria-label="Chiudi il modulo">Chiudi <span aria-hidden="true">×</span></button></div><p class="contact-demo"><b>Versione di prova.</b> I dati inseriti non vengono salvati né inviati.</p><div class="contact-content" tabindex="-1"></div><div class="contact-bottom"><a href="mailto:info@laifgroup.com">info@laifgroup.com</a><a href="https://laifgroup.com/privacy-policy" target="_blank" rel="noopener">Informativa privacy</a></div></div>';
 document.body.append(dialog);
 const logo=document.querySelector('header .logo-window');if(logo)dialog.querySelector('.contact-logo').replaceChildren(logo.cloneNode(true));
 const content=dialog.querySelector('.contact-content');let step='start',answers={},opener;
 const heading=(title,intro)=>'<h2 class="contact-title" id="contact-title" tabindex="-1">'+title+'</h2><p class="contact-intro">'+intro+'</p>';
 const back='<button class="contact-back" type="button" data-back>Scegli un altro percorso</button>';
 function remember(){const form=content.querySelector('form');if(form)for(const k of ['brief','name','email','company'])answers[k]=form.elements[k].value}
 function render(){
  let body='';
  if(step==='start')body=heading('Parliamoci.','Un progetto da costruire o un percorso da fare insieme?')+'<div class="contact-paths"><button type="button" data-path="project"><span aria-hidden="true">01</span><strong>Hai un progetto?</strong><small>Raccontaci il punto di partenza. Anche se non sai ancora come risolverlo.</small></button><button type="button" data-path="work"><span aria-hidden="true">02</span><strong>Vuoi lavorare con noi?</strong><small>Candidature, collaborazioni e competenze da mettere in comune.</small></button></div><button class="contact-back contact-personal" type="button" data-path="personal">Si tratta di un progetto personale?</button>';
  if(step==='project')body='<form novalidate>'+heading('Cosa vorresti cambiare?','Descrivi cosa vuoi migliorare e lasciaci un recapito.')+'<label class="contact-brief-label" for="contact-brief">Il progetto <span>(facoltativo)</span></label><textarea class="contact-brief" id="contact-brief" name="brief" maxlength="2000" placeholder="Scrivi qualche parola qui…"></textarea><div class="contact-fields"><label>Nome<input name="name" autocomplete="name" maxlength="100" required placeholder="Nome e cognome" aria-describedby="contact-error"></label><label>Email<input name="email" type="email" autocomplete="email" maxlength="254" required placeholder="nome@azienda.it" aria-describedby="contact-error"></label><label class="full">Azienda <span>(facoltativo, anche del tuo cliente)</span><input name="company" autocomplete="organization" maxlength="120" placeholder="Nome dell’azienda"></label></div><div class="contact-actions">'+back+'<button class="cta" type="submit">Vedi il riepilogo</button></div><p class="contact-error" id="contact-error" role="alert"></p></form>';
  if(step==='work')body=heading('Le competenze si incontrano.','Per candidarti o proporre una collaborazione, scrivici chi sei e su cosa ti piacerebbe lavorare. Se vuoi, aggiungi un link al portfolio o il CV.')+'<a class="cta" href="mailto:info@laifgroup.com?subject=Candidatura%20o%20collaborazione%20LAIF">Scrivi al team LAIF</a><div class="contact-actions">'+back+'</div>';
  if(step==='personal')body=heading('Ci concentriamo sulle aziende.','Lavoriamo su software, dati e AI per imprese e organizzazioni. Per un progetto personale non ti chiediamo altri dati.')+'<div class="contact-actions">'+back+'</div>';
  if(step==='summary')body=heading('Il punto da cui partire.','Questa è una demo: la richiesta non è stata inviata. La raccolta dei contatti sarà attivata con il sito definitivo.')+'<dl class="contact-summary">'+[['name','Nome'],['email','Email'],['company','Azienda'],['brief','Il progetto']].map(([k,label])=>'<div class="'+(k==='brief'?'wide':'')+'"><dt>'+label+'</dt><dd data-answer="'+k+'"></dd></div>').join('')+'</dl><div class="contact-actions"><button type="button" class="contact-back" data-edit>Modifica</button><button type="button" class="cta" data-close>Chiudi anteprima</button></div>';
  content.innerHTML=body;
  const form=content.querySelector('form');
  if(form){for(const field of form.querySelectorAll('input,textarea'))field.value=answers[field.name]||'';form.addEventListener('submit',ev=>{ev.preventDefault();remember();const error=form.querySelector('#contact-error');for(const k of ['name','email']){const f=form.elements[k];f.removeAttribute('aria-invalid');if(!f.value.trim()||!f.validity.valid){error.textContent=k==='email'?'Inserisci un indirizzo email valido.':'Inserisci il tuo nome.';f.setAttribute('aria-invalid','true');f.focus();return}}step='summary';render()})}
  for(const dd of content.querySelectorAll('[data-answer]'))dd.textContent=answers[dd.dataset.answer]?.trim()||'Da definire insieme';
  content.querySelector('#contact-title').focus({preventScroll:true});dialog.scrollTop=0;
 }
 content.addEventListener('click',ev=>{const path=ev.target.closest('[data-path]');if(path){step=path.dataset.path;render()}if(ev.target.closest('[data-back]')){remember();step='start';render()}if(ev.target.closest('[data-edit]')){step='project';render()}if(ev.target.closest('[data-close]'))dialog.close()});
 function open(trigger){if(dialog.open)return;opener=trigger||document.activeElement;answers={};step='start';document.documentElement.classList.add('contact-open');dialog.showModal();render()}
 dialog.querySelector('.contact-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{answers={};content.replaceChildren();document.documentElement.classList.remove('contact-open');if(location.hash==='#parliamoci')history.replaceState(null,'',location.pathname+location.search);opener?.focus({preventScroll:true})});
 triggers.forEach(t=>{t.setAttribute('aria-haspopup','dialog');t.addEventListener('click',ev=>{ev.preventDefault();open(t)})});
 window.addEventListener('hashchange',()=>{if(location.hash==='#parliamoci')open();else if(dialog.open)dialog.close()});
 if(location.hash==='#parliamoci')open();
})();
