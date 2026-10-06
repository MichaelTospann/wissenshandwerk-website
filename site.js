'use strict';
const form=document.querySelector('#contact-form');
if(form){
 const invalidatePrepared=()=>{document.querySelector('#prepared-request').hidden=true;document.querySelector('#open-mail-draft').removeAttribute('href');document.querySelector('#contact-status').textContent='';};
 form.addEventListener('input',invalidatePrepared);
 form.addEventListener('change',invalidatePrepared);
 const params=new URLSearchParams(location.search);
 if(params.get('anliegen')==='Kooperation')document.querySelector('#interest').value='Kooperation';
 form.addEventListener('submit',e=>{
  e.preventDefault();
  const topic=document.querySelector('#interest').value;
  const name=document.querySelector('#contact-name').value.trim();
  const goal=document.querySelector('#contact-goal').value.trim();
  const experience=document.querySelector('#contact-experience').value.trim();
  if(!goal){document.querySelector('#contact-status').textContent='Beschreibe bitte kurz dein Vorhaben.';document.querySelector('#contact-goal').focus();return;}
  const source=document.querySelector('#contact-source').value.trim();
  const body=`Hallo Wissenshandwerk,\n\nAnliegen: ${topic}\n${name?`Name/Unternehmen: ${name}\n`:''}\nMein Vorhaben:\n${goal}\n${experience?`\nBisherige Erfahrung:\n${experience}\n`:''}${source?`\nAufmerksam geworden durch:\n${source}\n`:''}\nBitte sendet mir Informationen zum passenden Kurs bzw. zu einer möglichen Zusammenarbeit. Meine Anfrage ist unverbindlich.\n`;
  const subject=`${form.dataset.brand || 'Wissenshandwerk'} – ${topic}`;
  document.querySelector('#request-text').value=`Betreff: ${subject}\n\n${body}`;
  document.querySelector('#prepared-request').hidden=false;
  const recipient=form.dataset.recipient;
  const mailLink=document.querySelector('#open-mail-draft');
  const validRecipient=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient||'');
  document.querySelector('#contact-status').textContent=validRecipient?'Dein Text ist vorbereitet. Öffne jetzt den E-Mail-Entwurf oder kopiere den Text in deinen Maildienst. Hier wurde nichts versendet.':'Dein Text ist vorbereitet. Es ist noch keine Empfängeradresse eingerichtet; hier wurde nichts versendet.';
  mailLink.hidden=!validRecipient;
  if(validRecipient)mailLink.href=`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  else mailLink.removeAttribute('href');
 });
 document.querySelector('#copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.querySelector('#request-text').value);document.querySelector('#contact-status').textContent='Anfragetext kopiert.';}catch{document.querySelector('#request-text').select();document.querySelector('#contact-status').textContent='Text markiert. Mit Strg+C kopieren.';}});
}
