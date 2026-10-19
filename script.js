function normalizeArrows(root=document.body){
 const paths={'↗':'M5 19 19 5M5 5h14v14','→':'M4 12h16M13 5l7 7-7 7','←':'M20 12H4m7-7-7 7 7 7','↑':'M12 20V4m-7 7 7-7 7 7','↓':'M12 4v16m-7-7 7 7 7-7','↔':'M3 12h18M8 7l-5 5 5 5m8-10 5 5-5 5'};
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode()){const node=walker.currentNode;if(!node.parentElement.closest('svg,script,style,textarea')&&/[↗→←↑↓↔]/.test(node.nodeValue))nodes.push(node);}
 for(const node of nodes){
 const fragment=document.createDocumentFragment();
 for(const piece of node.nodeValue.split(/([↗→←↑↓↔]\uFE0F?)/g)){
 const direction=piece[0];if(paths[direction]&&piece.length<=2){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','icon-arrow');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[direction]);svg.append(path);fragment.append(svg);
 }else fragment.append(document.createTextNode(piece));
 }node.replaceWith(fragment);
 }
}

let language='es',filter='all',photoIndex=0,lastFocus=null,detailType=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const page=document.body.dataset.page;
const photos=[{src:'grid',alt:'gridAlt',title:'gallery1',category:'paddock'},{src:'porsche',alt:'porscheAlt',title:'gallery2',category:'track'},{src:'pitlane',alt:'pitlaneAlt',title:'gallery3',category:'paddock'},{src:'convoy',alt:'convoyAlt',title:'gallery4',category:'track'},{src:'hero',alt:'heroAlt',title:'gallery5',category:'track'},{src:'record',alt:'recordAlt',title:'eventGalleryRecord',category:'events'},{src:'circuits',alt:'eventGalleryCircuits',title:'eventGalleryCircuits',category:'events'},{src:'partners',alt:'eventGalleryPartners',title:'eventGalleryPartners',category:'events'},{src:'mini-track',ext:'png',alt:'miniAlt',title:'miniAlt',category:'track'},{src:'lamborghini-paddock',ext:'png',alt:'lamboAlt',title:'lamboAlt',category:'paddock'},{src:'porsche-track',ext:'png',alt:'porscheTrackAlt',title:'porscheTrackAlt',category:'track'}];
function updateCount(){const counter=$('#photo-count');if(counter)counter.textContent=String($$('.photo-card:not([hidden])').length).padStart(2,'0')+(language==='es'?' FOTOS':' PHOTOS');}
function setLanguage(next){
language=next;const t=translations[next];document.documentElement.lang=next;
const names={home:t.homeNav,contact:t.navContact,news:'Breaking News',calendar:'Calendar',gallery:'Photo Galleries',championship:t.navChamp,partners:'Partners',article:'SEMA Show 2026'};
document.title=names[page]+' | Trackday VIP';
$('meta[name="description"]').content=names[page]+(next==='es'?' — El mundo Trackday VIP Motorsport Series.':' — The world of Trackday VIP Motorsport Series.');
$$('[data-t]').forEach(el=>{if(t[el.dataset.t])el.innerHTML=t[el.dataset.t]});
$$('[data-alt]').forEach(el=>{el.alt=t[el.dataset.alt]});
$$('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===next)));
if($('#article-content'))$('#article-content').innerHTML=article[next];
$$('[data-contact]').forEach(el=>{const platform=el.dataset.contact;el.setAttribute('aria-label',platform==='instagram'?'Instagram @trackday.vip':platform==='email'?'Email direcciongral@trackdayvip.com':'WhatsApp +52 443 945 7617')});
updateCount();if($('#photo-dialog').open)renderPhoto();if($('#detail-dialog').open)renderDetail();updateContactContext();normalizeArrows();
}
$$('[data-lang]').forEach(button=>button.addEventListener('click',()=>{setLanguage(button.dataset.lang);try{localStorage.setItem('trackday-language',language)}catch{}}));
let saved;try{saved=localStorage.getItem('trackday-language')}catch{}setLanguage(saved==='en'?'en':'es');
$('#year').textContent=new Date().getFullYear();
const menuToggle=$('.menu-toggle');
function closeMenu(){menuToggle.setAttribute('aria-expanded','false');$('#menu').hidden=true;document.body.classList.remove('menu-open');}
menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));$('#menu').hidden=!open;document.body.classList.toggle('menu-open',open)});
$$('#menu a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#menu').hidden){closeMenu();menuToggle.focus()}});
$('#menu').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const items=[...$$('.header-controls button'),...$$('#menu a')],first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
filter=button.dataset.filter;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$$('.photo-card').forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter);updateCount();
}));
function openDialog(dialog){lastFocus=document.activeElement;dialog.showModal();document.body.classList.add('no-scroll')}
$$('dialog').forEach(dialog=>{
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');if(lastFocus)lastFocus.focus()});
});
function visiblePhotos(){return photos.map((p,i)=>i).filter(i=>filter==='all'||photos[i].category===filter)}
function renderPhoto(){const p=photos[photoIndex],t=translations[language];$('#viewer-image').src='assets/'+p.src+'.'+(p.ext||'webp');$('#viewer-image').alt=t[p.alt];$('#viewer-caption').textContent=t[p.title];const visible=visiblePhotos();$('#viewer-count').textContent=String(visible.indexOf(photoIndex)+1).padStart(2,'0')+' / '+String(visible.length).padStart(2,'0')}
function photoMove(dir){const visible=visiblePhotos();photoIndex=visible[(visible.indexOf(photoIndex)+dir+visible.length)%visible.length];renderPhoto()}
$$('[data-photo]').forEach(card=>card.addEventListener('click',()=>{photoIndex=Number(card.dataset.photo);renderPhoto();openDialog($('#photo-dialog'))}));
$('#viewer-prev').addEventListener('click',()=>photoMove(-1));$('#viewer-next').addEventListener('click',()=>photoMove(1));
$('#photo-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft')photoMove(-1);if(e.key==='ArrowRight')photoMove(1)});
let touchStart=null;$('#viewer-image').addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX},{passive:true});$('#viewer-image').addEventListener('touchend',e=>{if(touchStart===null)return;const dx=e.changedTouches[0].clientX-touchStart;if(Math.abs(dx)>50)photoMove(dx<0?1:-1);touchStart=null},{passive:true});
function renderDetail(){const t=translations[language],isRecord=detailType==='record';$('#detail-content').innerHTML='<img class="article-image" src="assets/'+(isRecord?'record':'partners')+'.webp" alt="'+(isRecord?t.recordAlt:'Trackday VIP Partners')+'"><p class="poster-note">'+(language==='es'?'Arte original compartido por Trackday VIP.':'Original artwork supplied by Trackday VIP.')+'</p>'}
$$('[data-open]').forEach(button=>button.addEventListener('click',()=>{detailType=button.dataset.open;renderDetail();openDialog($('#detail-dialog'))}));
if('IntersectionObserver' in window){const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal-in');reveal.unobserve(entry.target)}}),{threshold:.12});$$('.news-layout,.calendar-layout,.gallery-heading,.champ-layout,.partners-heading').forEach(el=>reveal.observe(el))}

const contacts=window.TRACKDAY_CONTACTS||{};
$$('[data-contact]').forEach(link=>{
const value=contacts[link.dataset.contact];
if(value){link.href=value;link.removeAttribute('aria-disabled');if(value.startsWith('mailto:'))link.removeAttribute('target');else link.setAttribute('target','_blank');link.setAttribute('rel','noopener noreferrer');}
else {const notify=e=>{e.preventDefault();$('#contact-status').textContent=translations[language].contactUnavailable;};link.addEventListener('click',notify);link.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){notify(e)}});}
});

function updateContactContext(){
 if(page!=='contact')return;
 const t=translations[language],topic=new URLSearchParams(location.search).get('topic');
 const topicName=t['topic_'+topic];
 const context=$('#inquiry-context');
 context.hidden=!topicName;
 if(topicName)context.textContent=t.inquiryPrefix+' '+topicName;
 const message=topicName?t.topicWaPrefix+topicName+t.topicWaSuffix:t.defaultWa;
 $('[data-channel="whatsapp"]').href='https://wa.me/524439457617?text='+encodeURIComponent(message);
 $('[data-channel="email"]').href='mailto:direcciongral@trackdayvip.com?subject='+encodeURIComponent('Trackday VIP | '+(topicName||t.navContact));
}
