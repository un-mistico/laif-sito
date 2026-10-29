const siteHeader=document.querySelector('.site-header');
if(siteHeader){let headerQueued=false;const updateHeader=()=>{siteHeader.classList.toggle('is-scrolled',window.scrollY>8);headerQueued=false};window.addEventListener('scroll',()=>{if(!headerQueued){headerQueued=true;requestAnimationFrame(updateHeader)}},{passive:true});updateHeader()}
document.querySelectorAll('.menu-toggle').forEach(button=>{const nav=document.getElementById(button.getAttribute('aria-controls'));const close=()=>{button.setAttribute('aria-expanded','false');nav.classList.remove('open')};button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus()}});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close))});
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('in-view',entry.isIntersecting)),{threshold:.15});document.querySelectorAll('.product-scene,.intent-scene,.team-composition').forEach(el=>observer.observe(el));}
(() => {
 const controls=[...document.querySelectorAll('[data-filter-group]')];
 if(!controls.length)return;
 const params=new URLSearchParams(location.search), selected={service:params.get('servizio')||'Tutti',industry:'Tutti',kind:'Tutti'},cards=[...document.querySelectorAll('.work-card[data-industry]')],status=document.getElementById('filter-status'),empty=document.getElementById('empty-results');
 function update(){let count=0;cards.forEach(card=>{card.hidden=(selected.service!=='Tutti'&&!(card.dataset.services||card.dataset.category).split(' ').includes(selected.service))||(selected.industry!=='Tutti'&&card.dataset.industry!==selected.industry)||(selected.kind!=='Tutti'&&(card.dataset.kind||'concept')!==selected.kind);if(!card.hidden)count++});controls.forEach(button=>button.setAttribute('aria-pressed',String(selected[button.dataset.filterGroup]===button.dataset.filter)));status.textContent=count===1?'1 progetto reale':count+' progetti reali';empty.hidden=count!==0;}
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

/* UI prototype only. No request, storage, tracking or third-party form is used. */
(() => {
 const triggers=[...document.querySelectorAll('a.cta[href="mailto:info@laifgroup.com"], a[data-contact-path]')];
 if(!triggers.length)return;
 const dialog=document.createElement('dialog');dialog.className='contact-dialog';dialog.setAttribute('aria-labelledby','contact-title');
 dialog.innerHTML='<div class="contact-shell"><div class="contact-top"><span class="contact-logo" aria-label="LAIF">LAIF</span><button class="contact-close" type="button" aria-label="Chiudi il modulo">Chiudi <span aria-hidden="true">×</span></button></div><div class="contact-progress" role="progressbar" aria-label="Avanzamento del contatto" aria-valuemin="1" aria-valuemax="4"><span></span></div><div class="contact-content" tabindex="-1"></div><div class="contact-bottom"><span><a href="mailto:info@laifgroup.com">info@laifgroup.com</a></span><a href="'+(document.querySelector('footer a[href*="privacy-policy"]')?.getAttribute('href')||'privacy-policy/index.html')+'">Informativa privacy</a></div></div>';
 document.body.appendChild(dialog);
 const brand=document.querySelector('header .logo-window');if(brand)dialog.querySelector('.contact-logo').replaceChildren(brand.cloneNode(true));
 const content=dialog.querySelector('.contact-content'),progress=dialog.querySelector('[role="progressbar"]'),bar=progress.querySelector('span');
 const audiences=[['azienda','Per la mia azienda'],['cliente','Per un mio cliente'],['collaborazione','Collaborazioni o candidature'],['personale','Per un progetto personale']];
 const needs=[['software','Software su misura'],['ai','Intelligenza artificiale'],['dati','Dati e integrazioni'],['cloud','Cloud e infrastrutture'],['insieme','Capiamolo insieme']];
 let step=0,answers={},opener=null,timer=null,rapid=false,mcpReturnStep=0;
 const clearTimer=()=>{if(timer!==null){clearTimeout(timer);timer=null}};
 const choice=(name,items)=>'<fieldset class="contact-options"><legend class="sr-only">'+(name==='audience'?'Per chi ci scrivi?':'Di cosa hai bisogno?')+'</legend>'+items.map(([value,label],i)=>'<label class="contact-option"><input type="radio" name="'+name+'" value="'+value+'"><span class="contact-key" aria-hidden="true">'+String.fromCharCode(65+i)+'</span><span>'+label+'</span></label>').join('')+'</fieldset>';
 const heading=(title,intro)=>'<h2 class="contact-title" id="contact-title" tabindex="-1">'+title+'</h2><p class="contact-intro">'+intro+'</p>';
 const actions=(label,back=true)=>'<div class="contact-actions">'+(back?'<button class="contact-back" type="button" data-contact-back>Indietro</button>':'')+'<button class="cta" type="submit">'+label+'</button></div><p class="contact-error" id="contact-error" role="alert"></p>';
 // UI preview only. The team's MCP endpoint is not available yet.
const mcpHeading=heading('LAIF, nel tuo chatbot.','Un percorso facoltativo per esplorare un’idea, capire come la affronteremmo e chiarire i tuoi dubbi. Il confronto con il team resta sempre disponibile.');
const mcpPrompt='Vorrei ragionare su un progetto per la mia azienda.\n\nIl problema che voglio risolvere è: …\nLe persone coinvolte sono: …\nI sistemi che usiamo oggi sono: …\n\nAiutami a chiarire obiettivi, vincoli e domande da portare al team LAIF. Non inventare prezzi, tempi o funzionalità non confermati.';
const mcpPanel=()=>'<p class="mcp-preview-state">Connettore MCP · Disponibile prossimamente</p>'+mcpHeading+'<ol class="mcp-steps"><li><div><strong>Collega LAIF al tuo assistente.</strong><p>Quando sarà disponibile, troverai qui l’indirizzo del connettore MCP LAIF, da aggiungere a un chatbot compatibile.</p></div></li><li><div><strong>Parti dal problema, anche con una bozza.</strong><p>Esplora approccio, informazioni da raccogliere e possibili passi successivi. Nessun preventivo automatico.</p></div></li><li><div><strong>Porta la conversazione al team.</strong><p>Se vuoi proseguire, scegli tu cosa condividere e lasciaci un recapito.</p></div></li></ol><details class="mcp-prompt"><summary>Prepara già la tua idea</summary><label for="mcp-project-prompt">Una traccia da usare nel tuo chatbot, anche senza il connettore</label><textarea id="mcp-project-prompt" readonly rows="6"></textarea><button type="button" class="contact-back" data-copy-prompt>Copia la traccia</button><p class="mcp-copy-status" role="status"></p></details><div class="contact-actions"><button class="contact-back" type="button" data-mcp-back>Torna al modulo</button><button class="cta" type="button" data-contact-quick>Preferisco parlare con il team</button></div>';

 function remember(){
  const form=content.querySelector('form');if(!form)return;
  if(step===0||step===1){const selected=form.querySelector('input:checked');if(selected)answers[selected.name]=selected.value}
  if(step===2)answers.brief=form.elements.brief.value;
  if(step===3)for(const key of ['name','email','company','phone'])answers[key]=form.elements[key].value;
 }
 function focusTitle(){content.querySelector('#contact-title').focus({preventScroll:true});dialog.scrollTop=0}
 function render(){
  clearTimer();let body='';const terminal=typeof step==='string';progress.hidden=terminal;progress.setAttribute('aria-valuenow',String(terminal?4:step+1));progress.setAttribute('aria-valuetext',terminal?'Percorso concluso':`Passaggio ${step+1} di 4`);bar.style.width=(terminal?100:(step+1)*25)+'%';
  if(step===0)body=heading('Partiamo da te.','Per chi ci scrivi? Scegli un punto di partenza, oppure lasciaci subito un recapito.')+choice('audience',audiences)+actions('Continua',false);
  if(step===1)body=heading('Che cosa hai in mente?','Scegli il punto di partenza. Non serve conoscere già la soluzione.')+choice('need',needs)+actions('Continua');
  if(step===2)body=heading('Che cosa vorresti cambiare?','Un’attività da semplificare, un’idea da costruire, qualcosa che oggi non funziona. Anche due righe bastano.')+'<label class="contact-brief-label" for="contact-brief">Il tuo progetto <span>(facoltativo)</span></label><textarea class="contact-brief" id="contact-brief" name="brief" maxlength="1200" placeholder="Scrivi qualche parola qui…" aria-describedby="contact-limit"></textarea><span class="contact-limit" id="contact-limit">Massimo 1.200 caratteri</span>'+actions('Continua');
  if(step===3)body=heading('Come ti ricontattiamo?','Nome ed email sono sufficienti. Se preferisci una chiamata, aggiungi il telefono.')+'<div class="contact-fields"><label>Il tuo nome<input name="name" autocomplete="name" maxlength="100" required placeholder="Nome e cognome" aria-describedby="contact-error"></label><label>Email di lavoro<input type="email" name="email" autocomplete="email" maxlength="254" required placeholder="nome@azienda.it" aria-describedby="contact-error"></label><label class="full">'+(answers.audience==='cliente'?'La tua azienda o agenzia':'La tua azienda')+'<input name="company" autocomplete="organization" maxlength="120" placeholder="Nome dell’azienda (facoltativo)" aria-describedby="contact-error"></label><label class="full">Telefono <span>(facoltativo)</span><input name="phone" type="tel" autocomplete="tel" maxlength="30" placeholder="Il numero a cui richiamarti"></label></div>'+actions('Vedi il riepilogo');
  if(!terminal)body='<p class="contact-count">'+(rapid?'Solo i tuoi recapiti':String(step+1).padStart(2,'0')+' / 04')+'</p><form novalidate>'+body+'</form>';
  if(step===0)body+='<div class="contact-secondary-paths"><div class="contact-mcp-teaser"><span aria-hidden="true">✳</span><p>Hai un tuo chatbot AI?<button type="button" class="contact-mcp-link" data-contact-mcp>Esplora il tuo progetto con il connettore MCP di LAIF</button></p></div></div>';
  if(step==='mcp')body=mcpPanel();
  if(step==='personale')body='<span class="contact-outcome" aria-hidden="true">✳</span>'+heading('Lavoriamo con le aziende.','Per ora ci concentriamo su software, dati e AI per le aziende. Per questo non ti chiediamo altri dati per un progetto personale.')+'<div class="contact-actions"><button class="contact-back" type="button" data-contact-start>Rivedi la risposta</button><button class="cta" type="button" data-contact-close>Chiudi</button></div>';
  if(step==='collaborazione')body='<span class="contact-outcome" aria-hidden="true">✳</span>'+heading('Scrivici direttamente.','Per collaborazioni e candidature puoi scriverci direttamente. Questo percorso è dedicato ai progetti per le aziende.')+'<a class="footer-email" href="mailto:info@laifgroup.com">info@laifgroup.com</a><div class="contact-actions"><button class="contact-back" type="button" data-contact-start>Rivedi la risposta</button><button class="cta" type="button" data-contact-close>Chiudi</button></div>';
  if(step==='riepilogo')body='<span class="contact-outcome" aria-hidden="true">✓</span>'+heading('Ci siamo. Questo è il riepilogo.','Controlla i dettagli e apri la tua email per inviarli al team LAIF.')+'<dl class="contact-summary"><div><dt>Per chi scrivi</dt><dd data-answer="audience"></dd></div><div><dt>Di cosa hai bisogno</dt><dd data-answer="need"></dd></div><div><dt>Nome</dt><dd data-answer="name"></dd></div><div><dt>Email</dt><dd data-answer="email"></dd></div><div><dt>Azienda</dt><dd data-answer="company"></dd></div><div><dt>Telefono</dt><dd data-answer="phone"></dd></div><div class="wide"><dt>Il progetto</dt><dd data-answer="brief"></dd></div></dl><div class="contact-actions"><button class="contact-back" type="button" data-contact-edit>Modifica le risposte</button><a class="cta" data-contact-email>Apri email e invia il riepilogo</a></div>';
  content.innerHTML=body;
  const form=content.querySelector('form');
  if(form){for(const input of form.querySelectorAll('input,textarea')){if(input.type==='radio')input.checked=answers[input.name]===input.value;else input.value=answers[input.name]||''}form.addEventListener('submit',event=>{event.preventDefault();next()});form.addEventListener('change',event=>{if(event.target.type==='radio')remember()});form.addEventListener('click',event=>{if(event.target.type==='radio'&&event.detail>0){remember();clearTimer();timer=setTimeout(next,220)}})}
  if(step==='mcp')content.querySelector('#mcp-project-prompt').value=mcpPrompt;
  if(step==='riepilogo')for(const item of content.querySelectorAll('[data-answer]')){let value=answers[item.dataset.answer];if(item.dataset.answer==='audience')value=audiences.find(a=>a[0]===value)?.[1];if(item.dataset.answer==='need')value=needs.find(a=>a[0]===value)?.[1];item.textContent=value?.trim()||'Da definire insieme'}
  if(step==='riepilogo'){
   const labels={audience:'Per chi scrivi',need:'Di cosa hai bisogno',name:'Nome',email:'Email',company:'Azienda',phone:'Telefono',brief:'Il progetto'};
   const text=[...content.querySelectorAll('[data-answer]')].map(item=>labels[item.dataset.answer]+': '+item.textContent).join('\n');
   content.querySelector('[data-contact-email]').href='mailto:info@laifgroup.com?subject='+encodeURIComponent('Un nuovo progetto con LAIF')+'&body='+encodeURIComponent(text);
  }
  focusTitle();
 }
 function next(){
  clearTimer();remember();const error=content.querySelector('#contact-error');
  if(step===0&&!answers.audience){error.textContent='Scegli per chi ci scrivi.';content.querySelector('input').focus();return}
  if(step===1&&!answers.need){error.textContent='Scegli un punto di partenza, anche «Capiamolo insieme».';content.querySelector('input').focus();return}
  if(step===0&&['personale','collaborazione'].includes(answers.audience)){step=answers.audience;render();return}
  if(step===3){const form=content.querySelector('form');for(const key of ['name','email']){const field=form.elements[key];field.removeAttribute('aria-invalid');if(!field.value.trim()||!field.validity.valid){field.setAttribute('aria-invalid','true');error.textContent=key==='email'?'Inserisci un indirizzo email valido.':key==='name'?'Inserisci il tuo nome.':'Inserisci il nome dell’azienda.';field.focus();return}}step='riepilogo'}else step++;
  render();
 }
 function open(trigger){if(dialog.open)return;opener=trigger||document.activeElement;step=0;answers={};rapid=false;if(trigger?.dataset?.contactPath==='work'||location.hash==='#lavora-con-noi'){answers={audience:'collaborazione'};step='collaborazione'}document.documentElement.classList.add('contact-open');dialog.showModal();render()}
 function close(){clearTimer();dialog.close()}
 dialog.querySelector('.contact-close').addEventListener('click',close);
 content.addEventListener('click',event=>{if(event.target.closest('[data-contact-quick]')){clearTimer();remember();rapid=true;step=3;render();return}if(event.target.closest('[data-contact-mcp]')){clearTimer();remember();mcpReturnStep=step;step='mcp';render();return}if(event.target.closest('[data-mcp-back]')){step=mcpReturnStep;render();content.querySelector('[data-contact-mcp]')?.focus();return}if(event.target.closest('[data-copy-prompt]')){const field=content.querySelector('#mcp-project-prompt'),status=content.querySelector('.mcp-copy-status');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(field.value).then(()=>{status.textContent='Traccia copiata. Puoi incollarla nel tuo chatbot.'}).catch(()=>{field.select();status.textContent='Seleziona e copia la traccia.'});else{field.select();status.textContent='Seleziona e copia la traccia.'}return}if(event.target.closest('[data-contact-close]'))close();if(event.target.closest('[data-contact-back]')){remember();step=rapid?0:Math.max(0,step-1);rapid=false;render()}if(event.target.closest('[data-contact-start]')){answers={};step=0;render()}if(event.target.closest('[data-contact-edit]')){step=3;render()}});
 dialog.addEventListener('close',()=>{clearTimer();answers={};content.replaceChildren();document.documentElement.classList.remove('contact-open');if(location.hash==='#parliamoci'||location.hash==='#lavora-con-noi')history.replaceState(null,'',location.pathname+location.search);opener?.focus({preventScroll:true})});
 dialog.addEventListener('keydown',event=>{if(!['INPUT','TEXTAREA','BUTTON','A'].includes(event.target.tagName)&&/^[a-e]$/i.test(event.key)){const inputs=[...content.querySelectorAll('input[type="radio"]')],input=inputs[event.key.toLowerCase().charCodeAt(0)-97];if(input){event.preventDefault();input.click();next()}}});
 triggers.forEach(trigger=>{trigger.setAttribute('aria-haspopup','dialog');trigger.addEventListener('click',event=>{event.preventDefault();open(trigger)})});
 window.addEventListener('hashchange',()=>{if(location.hash==='#parliamoci'||location.hash==='#lavora-con-noi')open();else if(dialog.open)close()});
 if(location.hash==='#parliamoci'||location.hash==='#lavora-con-noi')open();
})();
(() => {
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-embed]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const frame = document.createElement('iframe');
    frame.src = link.dataset.embed;
    frame.title = link.getAttribute('aria-label') || 'Video';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.loading = 'lazy';
    const box = document.createElement('div');
    box.className = 'video-embed video-embed-' + (link.dataset.embedKind || 'youtube');
    box.appendChild(frame);
    const thumb = link.querySelector('.value-video-thumb');
    if (thumb) { thumb.replaceWith(box); link.removeAttribute('data-embed'); link.addEventListener('click', ev => ev.preventDefault()); }
    else link.replaceWith(box);
  });
})();
