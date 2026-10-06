'use strict';
/* Basic consent: no Google script, connection, cookie or event before opt-in.
   No form contents, link URLs, query strings, hashes, user IDs or CRM data. */
(()=>{
 const node=document.querySelector('#wh-analytics-config');
 if(!node)return;
 let config;try{config=JSON.parse(node.textContent);}catch{return;}
 if(!/^G-[A-Z0-9]{6,20}$/.test(config.id)||!Array.isArray(config.paths))return;
 const canonical=document.querySelector('link[rel="canonical"]');
 let page;try{page=new URL(canonical.href);}catch{return;}
 const production=location.protocol==='https:'&&location.hostname==='wissenshandwerk.de';
 if(!production||page.origin!=='https://wissenshandwerk.de'||!config.paths.includes(page.pathname))return;
 const panel=document.querySelector('#analytics-choice'),settings=document.querySelector('#analytics-settings');
 const accept=document.querySelector('#analytics-accept'),decline=document.querySelector('#analytics-decline'),close=document.querySelector('#analytics-close'),status=document.querySelector('#analytics-status');
 if(!panel||!settings||!accept||!decline||!close||!status)return;
 const KEY='wh_analytics_consent_v1',MAX_AGE=180*24*60*60*1000;
 let allowed=false,started=false,script=null,scriptLoaded=false,configured=false,pageSent=false,lastFocus=null,volatileGrant=false,grantedAt=0;
 window['ga-disable-'+config.id]=true;
 function readChoice(){try{const c=JSON.parse(localStorage.getItem(KEY));return c&&c.version===1&&['granted','denied'].includes(c.choice)&&Number.isFinite(c.at)&&c.at<=Date.now()&&Date.now()-c.at<MAX_AGE?c.choice:null;}catch{return null;}}
 function saveChoice(choice){try{localStorage.setItem(KEY,JSON.stringify({version:1,choice,at:Date.now()}));return true;}catch{return false;}}
 function show(){lastFocus=document.activeElement;panel.hidden=false;close.hidden=!readChoice()&&!allowed;document.documentElement.classList.add('analytics-choice-open');status.textContent=allowed?'Die freiwillige Analyse ist derzeit erlaubt.':'Die freiwillige Analyse ist ausgeschaltet.';}
 function hide(){panel.hidden=true;document.documentElement.classList.remove('analytics-choice-open');if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();}
 function eraseCookies(){for(const c of document.cookie.split(';')){const name=c.trim().split('=')[0];if(!/^_ga(?:_|$)/.test(name))continue;for(const domain of ['', '; Domain=wissenshandwerk.de','; Domain=.wissenshandwerk.de'])document.cookie=name+'=; Max-Age=0; Path=/; SameSite=Lax; Secure'+domain;}}
 function push(){window.dataLayer.push(arguments);}
 const referrer=(()=>{try{const u=new URL(document.referrer);return ['https:','http:'].includes(u.protocol)?u.origin+'/':'';}catch{return '';}})();
 const base={send_to:config.id,page_location:page.origin+page.pathname,page_title:document.title,page_referrer:referrer};
 function revalidate(){if(allowed&&((volatileGrant&&Date.now()-grantedAt>=MAX_AGE)||(!volatileGrant&&readChoice()!=='granted'))){stop();show();return false;}return allowed;}
 function event(name,params={}){if(!revalidate()||!started||panel.dataset.measure!=='true')return;push('event',name,Object.assign({},base,params));}
 function activate(){
  if(!scriptLoaded||started||!revalidate()||panel.dataset.measure!=='true')return;
  started=true;window['ga-disable-'+config.id]=false;
  push('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(!configured){
   configured=true;push('js',new Date());
   push('config',config.id,Object.assign({},base,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_domain:'wissenshandwerk.de',cookie_expires:5184000,cookie_update:false,cookie_flags:'SameSite=Lax;Secure'}));
  }
  if(!pageSent){event('page_view');pageSent=true;}
 }
 function start(){
  allowed=true;
  if(started||panel.dataset.measure!=='true')return;
  if(scriptLoaded){activate();return;}
  if(script)return;
  window.dataLayer=window.dataLayer||[];
  // Do not queue page views or interactions while the library is still loading.
  // A revoked, slow load must never replay events after a later opt-in.
  push('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  push('set','ads_data_redaction',true);push('set','url_passthrough',false);
  const pending=document.createElement('script');script=pending;
  pending.async=true;pending.referrerPolicy='strict-origin';pending.src='https://www.googletagmanager.com/gtag/js?id='+config.id;
  pending.onload=()=>{if(script!==pending)return;scriptLoaded=true;activate();};
  pending.onerror=()=>{if(script!==pending)return;pending.remove();script=null;scriptLoaded=false;started=false;window['ga-disable-'+config.id]=true;};
  document.head.appendChild(pending);
 }
 function stop(){
  allowed=false;started=false;volatileGrant=false;window['ga-disable-'+config.id]=true;eraseCookies();
  // Removing an executed script does not unload its library; keep this single
  // instance disabled so an in-page opt-in can safely resume without duplicates.
 }
 accept.addEventListener('click',()=>{volatileGrant=!saveChoice('granted');grantedAt=Date.now();start();hide();});
 decline.addEventListener('click',()=>{const hadStarted=started;stop();const persisted=saveChoice('denied');hide();if(hadStarted&&persisted)location.reload();});
 settings.addEventListener('click',()=>{show();decline.focus();});
 close.addEventListener('click',hide);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden&&(readChoice()||allowed))hide();});
 window.addEventListener('storage',e=>{if((e.key===KEY||e.key===null)&&(!e.storageArea||e.storageArea===localStorage)&&readChoice()!=='granted'){stop();location.reload();}});
 window.addEventListener('focus',revalidate);
 document.addEventListener('visibilitychange',revalidate);
 // Also stop long-lived tabs when consent expires, including automatic GA events.
 function expiryCheck(){revalidate();if(typeof setTimeout==='function')setTimeout(expiryCheck,60000);}
 if(typeof setTimeout==='function')setTimeout(expiryCheck,60000);
 settings.hidden=false;
 if(readChoice()==='granted')start();else if(!readChoice())show();
 // Only fixed enums are observed. Never read the prepared mailto URI or inputs.
 document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a');if(!a)return;
  if(a.id==='open-mail-draft'){event('mail_draft_open_click');return;}
  const raw=a.getAttribute('href')||'';
  if(raw==='kurs.html'||raw==='kurs.html#kurspreis')event('course_cta_click');
  else if(raw==='unternehmen.html'||raw==='kontakt.html?anliegen=Firmenschulung')event('company_cta_click');
  else if(raw==='kontakt.html'||raw==='kontakt.html?anliegen=Kursinteresse')event('contact_cta_click');
 });
 document.addEventListener('wh-contact-draft-prepared',e=>{const kind=e.detail&&e.detail.kind;if(['course','company','partner'].includes(kind))event('contact_draft_prepared',{inquiry_type:kind});});
 document.addEventListener('wh-contact-copy',e=>{const part=e.detail&&e.detail.part;if(['message','recipient','subject'].includes(part))event('contact_copy',{copy_part:part});});
})();
