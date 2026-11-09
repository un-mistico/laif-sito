window.mountLaifCareers = function (mount, privacy, back) {
  const en = document.documentElement.lang.startsWith('en');
  const t = (it, english) => en ? english : it;
  const title = mount.parentElement.querySelector('h2');
  const intro = mount.parentElement.querySelector('.contact-intro');
  const roles = [t('Software e cloud','Software and cloud'), t('Dati e AI','Data and AI'), 'Product design', 'Sales', t('Legale','Legal'), t('Candidatura spontanea / Altro','Open application / Other')];
  const labels = [t('Nome', 'First name'), t('Cognome', 'Last name'), 'Email', t('Telefono', 'Phone')];
  const consent = t('Ho letto l’informativa sul trattamento dei miei dati personali e autorizzo LAIF a contattarmi, anche via email, per comunicazioni sulle sue future iniziative.', 'I have read the privacy notice and authorise LAIF to contact me, including by email, about its future initiatives.');
  const titles = [t('Quale area ti interessa?', 'Which area interests you?'), t('Come ti contattiamo?', 'How can we reach you?'), t('Il tuo curriculum.', 'Your CV.'), t('Riepilogo candidatura.', 'Application summary.')];
  const intros = [t('Scegli una sola area.', 'Choose one area.'), t('Compila tutti e quattro i campi.', 'Complete all four fields.'), t('Allega il CV (massimo 12 MB) e conferma il consenso.', 'Attach your CV (up to 12 MB) and confirm your consent.'), t('Compilazione conclusa. I dati restano in questa finestra e non sono stati inviati a LAIF.', 'Form completed. Your details remain in this window and have not been sent to LAIF.')];
  const form = document.createElement('form');
  const fieldNames = ['given-name', 'family-name', 'email', 'tel'];
  form.innerHTML = `
    <div data-panel class="career-roles" role="radiogroup" aria-labelledby="contact-title">${roles.map(role=>`<label><input type="radio" name="role" required value="${role}">${role}</label>`).join('')}</div>
    <div data-panel class="contact-fields">${labels.map((label,i)=>`<label>${label}<input type="${i<2?'text':fieldNames[i]}" name="${fieldNames[i]}" autocomplete="${fieldNames[i]}" required maxlength="254"></label>`).join('')}</div>
    <div data-panel class="career-docs"><label>${t('Allega CV', 'Attach CV')}<input type="file" name="cv" required></label>
    <label><input type="checkbox" name="consent" required>${consent} <a target="_blank" rel="noopener">${t('Informativa privacy', 'Privacy notice')}</a> <span>(${t('obbligatorio','required')})</span></label></div>
    <dl data-panel class="contact-summary"></dl>
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
  form.onsubmit=event=>{
    event.preventDefault();
    if(page===1){
      for(const name of fieldNames){
        const field=form.elements.namedItem(name);
        field.value=field.value.trim();
        if(!field.reportValidity())return;
      }
    }
    if(page<3 && form.reportValidity()){page++;show()}
  };
  show();
};
