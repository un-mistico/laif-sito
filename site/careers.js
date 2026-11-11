window.mountLaifCareers = function (mount, privacy, back) {
  const en = document.documentElement.lang.startsWith('en');
  const t = (it, english) => en ? english : it;
  const title = mount.parentElement.querySelector('h2');
  const intro = mount.parentElement.querySelector('.contact-intro');
  const roles = [t('Software e cloud','Software and cloud'), t('Dati e AI','Data and AI'), 'Product design', 'Sales', t('Legale','Legal'), t('Candidatura spontanea / Altro','Open application / Other')];
  const labels = [t('Nome', 'First name'), t('Cognome', 'Last name'), 'Email', t('Telefono', 'Phone')];
  const consent = t('Ho letto l’informativa sul trattamento dei miei dati personali e autorizzo LAIF a contattarmi, anche via email, per comunicazioni sulle sue future iniziative.', 'I have read the privacy notice and authorise LAIF to contact me, including by email, about its future initiatives.');
  const titles = [t('Quale area ti interessa?', 'Which area interests you?'), t('Come ti contattiamo?', 'How can we reach you?'), t('Il tuo curriculum.', 'Your CV.'), (window.LAIF_WOLICO?t('Candidatura inviata.', 'Application sent.'):t('Riepilogo candidatura.', 'Application summary.'))];
  const intros = [t('Scegli una sola area.', 'Choose one area.'), t('Compila tutti e quattro i campi.', 'Complete all four fields.'), t('Allega il CV in PDF o Word (massimo 12 MB) e conferma il consenso.', 'Attach your CV as PDF or Word (up to 12 MB) and confirm your consent.'), (window.LAIF_WOLICO?t('La tua candidatura è arrivata al team LAIF, che ti risponderà all’indirizzo che ci hai dato.', 'Your application reached the LAIF team, who will reply to the address you gave us.'):t('Compilazione conclusa. I dati restano in questa finestra e non sono stati inviati a LAIF.', 'Form completed. Your details remain in this window and have not been sent to LAIF.'))];
  const form = document.createElement('form');
  const fieldNames = ['given-name', 'family-name', 'email', 'tel'];
  form.innerHTML = `
    <div data-panel class="career-roles" role="radiogroup" aria-labelledby="contact-title">${roles.map(role=>`<label><input type="radio" name="role" required value="${role}">${role}</label>`).join('')}</div>
    <div data-panel class="contact-fields">${labels.map((label,i)=>`<label>${label}<input type="${i<2?'text':fieldNames[i]}" name="${fieldNames[i]}" autocomplete="${fieldNames[i]}" required maxlength="254"></label>`).join('')}</div>
    <div data-panel class="career-docs"><label>${t('Allega CV', 'Attach CV')}<input type="file" name="cv" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label>
    <label><input type="checkbox" name="consent" required>${consent} <a target="_blank" rel="noopener">${t('Informativa privacy', 'Privacy notice')}</a> <span>(${t('obbligatorio','required')})</span></label></div>
    <dl data-panel class="contact-summary"></dl><input type="text" name="sito" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px">
    <div class="contact-actions"><button class="contact-back" type="button">${t('Indietro','Back')}</button><button class="cta" type="submit"></button></div>
`;
  mount.append(form);
  form.querySelector('a').href=privacy;
  const panels=[...form.querySelectorAll('[data-panel]')];
  const next=form.querySelector('[type=submit]');
  let page=0;
  function show(){
    panels.forEach((panel,index)=>{
      panel.hidden=index!==page;
      panel.querySelectorAll('input').forEach(input=>{input.disabled=panel.hidden});
    });
    title.textContent=titles[page];
    intro.textContent=intros[page];
    next.hidden=page===3;
    next.textContent=page===2?t('Concludi','Finish'):t('Continua','Continue');
    if(page===3){
      const summary=panels[3];
      summary.replaceChildren();
      const entries=[
        [t('Area','Area'),form.elements.role.value],
        ...fieldNames.map((name,i)=>[labels[i],form.elements.namedItem(name).value]),
        ['CV',cv.files[0].name],
        [t('Consenso privacy','Privacy consent'),t('Confermato','Confirmed')]
      ];
      for(const [label,value] of entries){
        const row=document.createElement('div');
        const term=document.createElement('dt'), detail=document.createElement('dd');
        term.textContent=label;
        detail.textContent=value;
        row.append(term,detail);
        summary.append(row);
      }
    }
    title.focus();
    title.closest('dialog').scrollTop=0;
  }
  form.querySelector('.contact-back').onclick=()=>{if(page===0)back();else{page--;show()}};
  const cv=form.elements.cv;
  cv.onchange=()=>{cv.setCustomValidity(cv.files[0]?.size>12*1024*1024?t('Scegli un file di massimo 12 MB.','Choose a file up to 12 MB.'):'');cv.reportValidity()};
  // L'invio a Wolico al «Concludi»: il riepilogo compare solo se la candidatura è arrivata.
  function invia(){
    const dati=new FormData();
    dati.append('area',form.elements.role.value);
    [['given-name','nome'],['family-name','cognome'],['email','email'],['tel','telefono']].forEach(([campo,nome])=>dati.append(nome,form.elements.namedItem(campo).value.trim()));
    dati.append('consenso',form.elements.consent.checked?'si':'');
    dati.append('cv',cv.files[0]);
    dati.append('sito',form.elements.sito.value);
    dati.append('url',location.href.split('#')[0]);
    next.disabled=true;next.textContent=t('Invio…','Sending…');
    fetch((window.LAIF_WOLICO||'')+'/public/sito/candidature',{method:'POST',body:dati,credentials:'omit'})
      .then(r=>r.json().catch(()=>({})).then(j=>{if(!r.ok||j.esito!=='ok')throw new Error(j.messaggio||'');page=3;show();form.querySelector('.contact-back').hidden=true}))
      .catch(e=>{intro.textContent=e.message||t('Invio non riuscito: riprova o scrivi a info@laifgroup.com.','Sending failed: try again or write to info@laifgroup.com.');intro.setAttribute('role','alert')})
      .finally(()=>{next.disabled=false;if(page!==3)next.textContent=t('Concludi','Finish')});
  }
  form.onsubmit=event=>{
    event.preventDefault();
    if(page===1){
      for(const name of fieldNames){
        const field=form.elements.namedItem(name);
        field.value=field.value.trim();
        if(!field.reportValidity())return;
      }
    }
    if(page===2&&window.LAIF_WOLICO){if(form.reportValidity())invia();return}
    if(page<3 && form.reportValidity()){page++;show()}
  };
  show();
};
