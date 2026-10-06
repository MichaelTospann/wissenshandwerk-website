'use strict';
// Optional visual controls. Content and links remain usable without JavaScript.
(()=>{
 const toggle=document.querySelector('.menu-toggle');
 if(toggle){
  const nav=document.querySelector('#main-nav');
  document.documentElement.classList.add('nav-enhanced');
  const mobile=window.matchMedia('(max-width:680px)');
  const resetMenu=()=>{toggle.hidden=!mobile.matches;toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
  resetMenu();mobile.addEventListener('change',resetMenu);
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){resetMenu();toggle.focus();}});
 }
 const motion=document.querySelector('.motion-toggle');
 if(motion){
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  const setPaused=paused=>{document.documentElement.classList.toggle('motion-paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Animation starten':'Animation pausieren';};
  const syncPreference=()=>{setPaused(reduced.matches);motion.hidden=reduced.matches;};
  syncPreference();reduced.addEventListener('change',syncPreference);
  motion.addEventListener('click',()=>setPaused(motion.getAttribute('aria-pressed')!=='true'));
 }
 // Elements are never hidden before observation; failure leaves a readable page.
 if(typeof window!=='undefined'&&'IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('reveal-in');observer.unobserve(entry.target);}}},{threshold:.12});
  document.querySelectorAll('.introduction,.section-head,.capability-grid,.project-visual,.mentor,.cta').forEach(el=>observer.observe(el));
 }
})();
const form=document.querySelector('#contact-form');
if(form){
 const companyHelp=document.querySelector('#company-request-help');
 const syncCompanyHelp=()=>{
  const company=document.querySelector('#interest').value==='Firmenschulung';
  if(companyHelp)companyHelp.hidden=!company;
  document.querySelector('#contact-name-label').textContent=company?'Ihr Name oder Unternehmen':'Dein Name oder Unternehmen';
  document.querySelector('#contact-goal-label').textContent=company?'Was braucht Ihr Team?':'Was möchtest du mit Agenten erreichen?';
  document.querySelector('#contact-experience-label').textContent=company?'Welche KI-Erfahrung hat Ihr Team?':'Welche Erfahrung bringst du mit?';
  document.querySelector('#contact-source-label').textContent=company?'Wie sind Sie auf uns aufmerksam geworden?':'Wie bist du auf uns aufmerksam geworden?';
  document.querySelector('#contact-goal').setAttribute('aria-describedby',company?'company-request-help contact-goal-help':'contact-goal-help');
 };
 const invalidatePrepared=()=>{document.querySelector('#prepared-request').hidden=true;document.querySelector('#open-mail-draft').removeAttribute('href');document.querySelector('#contact-status').textContent='';for(const id of ['request-recipient','request-subject','request-text'])document.querySelector('#'+id).value='';};
 form.addEventListener('input',invalidatePrepared);
 form.addEventListener('change',()=>{invalidatePrepared();syncCompanyHelp();});
 const params=new URLSearchParams(location.search);
 const requestedTopic=params.get('anliegen');
 if(['Kursinteresse','Kooperation','Firmenschulung'].includes(requestedTopic))document.querySelector('#interest').value=requestedTopic;
 syncCompanyHelp();
 form.addEventListener('submit',e=>{
  e.preventDefault();
  const topic=document.querySelector('#interest').value;
  const name=document.querySelector('#contact-name').value.trim();
  const goal=document.querySelector('#contact-goal').value.trim();
  const experience=document.querySelector('#contact-experience').value.trim();
  if(!goal){document.querySelector('#contact-status').textContent=topic==='Firmenschulung'?'Beschreiben Sie bitte kurz Ihren Schulungsbedarf.':'Beschreibe bitte kurz dein Vorhaben.';document.querySelector('#contact-goal').focus();return;}
  const source=document.querySelector('#contact-source').value.trim();
  const closing=topic==='Firmenschulung'?'Bitte kontaktieren Sie uns zu einer passenden KI-Schulung für unsere Mitarbeitenden. Inhalte, Umfang, Termine und Konditionen möchten wir gemeinsam besprechen. Unsere Anfrage ist unverbindlich.':'Bitte sendet mir Informationen zum passenden Kurs bzw. zu einer möglichen Zusammenarbeit. Meine Anfrage ist unverbindlich.';
  const body=`Hallo Wissenshandwerk,\n\nAnliegen: ${topic}\n${name?`Name/Unternehmen: ${name}\n`:''}\n${topic==='Firmenschulung'?'Unternehmen, Team und Schulungsbedarf':'Mein Vorhaben'}:\n${goal}\n${experience?`\nBisherige Erfahrung:\n${experience}\n`:''}${source?`\nAufmerksam geworden durch:\n${source}\n`:''}\n${closing}\n`;
  const subject=`${form.dataset.brand || 'Wissenshandwerk'} – ${topic}`;
  document.querySelector('#request-text').value=body;
  document.querySelector('#request-subject').value=subject;
  document.querySelector('#prepared-request').hidden=false;
  const recipient=form.dataset.recipient;
  const mailLink=document.querySelector('#open-mail-draft');
  const validRecipient=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient||'');
  document.querySelector('#request-recipient').value=validRecipient?recipient:'';
  document.querySelector('#copy-recipient').disabled=!validRecipient;
  document.querySelector('#contact-status').textContent=validRecipient?'Dein Text ist vorbereitet. Öffne jetzt den E-Mail-Entwurf oder kopiere den Text in deinen Maildienst. Hier wurde nichts versendet.':'Dein Text ist vorbereitet. Es ist noch keine Empfängeradresse eingerichtet; hier wurde nichts versendet.';
  mailLink.hidden=!validRecipient;
  // RFC 6068 section 5 requires CRLF line breaks in the encoded mailto body.
  if(validRecipient)mailLink.href=`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g,'\r\n'))}`;
  else mailLink.removeAttribute('href');
  document.querySelector('#request-text').focus();
 });
 document.querySelector('#copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.querySelector('#request-text').value);document.querySelector('#contact-status').textContent='Anfragetext kopiert. Bitte in deinen Maildienst einfügen und dort versenden. Hier wurde nichts versendet.';}catch{document.querySelector('#request-text').focus();document.querySelector('#request-text').select();document.querySelector('#contact-status').textContent='Text markiert. Mit Strg+C kopieren und in deinem Maildienst versenden. Hier wurde nichts versendet.';}});
 for(const [buttonId,inputId,label] of [['copy-recipient','request-recipient','Empfänger'],['copy-subject','request-subject','Betreff']]){
  document.querySelector('#'+buttonId).addEventListener('click',async()=>{
   const input=document.querySelector('#'+inputId);if(!input.value)return;
   try{await navigator.clipboard.writeText(input.value);document.querySelector('#contact-status').textContent=label+' kopiert. Bitte im eigenen Maildienst einfügen. Hier wurde nichts versendet.';}
   catch{input.focus();input.select();document.querySelector('#contact-status').textContent=label+' markiert. Mit Strg+C kopieren. Hier wurde nichts versendet.';}
  });
 }
 // Enable only after the local draft handlers are ready; no server submission exists.
 document.querySelector('#prepare-request').disabled=false;
}
