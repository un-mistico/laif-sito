  (() => {
    const root=document.documentElement, reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const word=document.getElementById('hero-word'), toggle=document.getElementById('motion-toggle');
    const words=['Data','Software','AI','Automation']; let wordIndex=0, paused=reduced.matches, timer, swap;
    function rotation(){clearInterval(timer);clearTimeout(swap);word.classList.remove('out');toggle.textContent=paused?'Attiva animazioni':'Pausa animazioni';toggle.setAttribute('aria-pressed',String(paused));root.classList.toggle('motion-paused',paused);if(!paused){timer=setInterval(()=>{if(document.hidden)return;word.classList.add('out');swap=setTimeout(()=>{wordIndex=(wordIndex+1)%words.length;word.textContent=words[wordIndex];word.classList.remove('out')},220)},3000)}}
    toggle.addEventListener('click',()=>{paused=!paused;rotation()});reduced.addEventListener('change',()=>{paused=reduced.matches;rotation()});rotation();
    const ns='http://www.w3.org/2000/svg', keys=document.getElementById('keyboard-keys');
    for(let row=0;row<4;row++)for(let col=0;col<12;col++){const k=document.createElementNS(ns,'rect');k.setAttribute('x',String(col*15));k.setAttribute('y',String(row*16));k.setAttribute('width','12');k.setAttribute('height','12');k.setAttribute('rx','1');k.setAttribute('class','key-top');keys.appendChild(k)}
    const steps=[...document.querySelectorAll('.step')],buttons=[...document.querySelectorAll('.step-controls button')],machine=document.getElementById('machine'),caption=document.getElementById('machine-caption');
    const captions=['01 / Si parte dalle tue persone.','02 / Le idee diventano visibili.','03 / Ogni parte trova la sua connessione.','04 / Il valore continua a crescere.'];let current=-1,queued=false;
    function setStage(i){if(i===current)return;current=i;machine.dataset.stage=String(i);caption.textContent=captions[i];buttons.forEach((b,j)=>j===i?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'))}
    function update(){queued=false;const mobile=window.innerWidth<=700,focus=mobile?330+(window.innerHeight-330)*.5:window.innerHeight*.5;let best=0,distance=Infinity;steps.forEach((s,i)=>{const r=s.getBoundingClientRect();const d=Math.abs((r.top+r.bottom)/2-focus);if(d<distance){distance=d;best=i}});setStage(best)}
    function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}
    window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);buttons.forEach((b,i)=>b.addEventListener('click',()=>steps[i].scrollIntoView({behavior:paused?'instant':'smooth',block:'start'})));update();
  })();
