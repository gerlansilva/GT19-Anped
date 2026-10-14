const pages=[...document.querySelectorAll('.page')];
const navLinks=[...document.querySelectorAll('[data-page]')];
const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let tagFilter='';

function showPage(id){
  pages.forEach(p=>p.classList.toggle('active-page',p.id===id));
  document.querySelectorAll('nav [data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===id));
  document.querySelector('#main-nav').classList.remove('open');
  document.querySelector('.menu-button').setAttribute('aria-expanded','false');
  history.replaceState(null,'',`#${id}`); window.scrollTo({top:0,behavior:'smooth'});
  if(id==='acervo') renderArchive();
}
navLinks.forEach(el=>el.addEventListener('click',e=>{e.preventDefault();showPage(el.dataset.page)}));
document.querySelectorAll('[data-open-edition]').forEach(el=>el.addEventListener('click',()=>showPage('edicao-42')));
document.querySelectorAll('.edition-logo-card').forEach(card=>{
  const copy=card.querySelector('.edition-card-copy');
  const title=copy&&copy.querySelector(':scope > h3');
  if(!title)return;
  const heading=document.createElement('div'); heading.className='edition-card-heading';
  const button=document.createElement('button'); button.className='text-link'; const editionId=title.textContent.startsWith('39ª')?'edicao-39':title.textContent.startsWith('37ª')?'edicao-37':title.textContent.startsWith('29ª')?'edicao-29':title.textContent.startsWith('28ª')?'edicao-28':title.textContent.startsWith('27ª')?'edicao-27':title.textContent.startsWith('26ª')?'edicao-26':title.textContent.startsWith('25ª')?'edicao-25':title.textContent.startsWith('24ª')?'edicao-24':title.textContent.startsWith('23ª')?'edicao-23':title.textContent.startsWith('22ª')?'edicao-22':'acervo'; button.dataset.page=editionId; button.innerHTML='Consultar a edição <span>→</span>';
  button.addEventListener('click',()=>showPage(editionId));
  heading.append(title,button); copy.prepend(heading);
});
document.querySelector('.menu-button').addEventListener('click',e=>{const nav=document.querySelector('#main-nav');const open=nav.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});

function icon(kind){
 const shapes={
 person:'<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
 institution:'<path d="m3 9 9-6 9 6M3 10h18M5 10v9m7-9v9m7-9v9M3 21h18"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6"/>',
 play:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>'};
 return '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shapes[kind]+'</svg>';
}

function tag(text,kind){return `<button class="tag ${kind}" data-tag="${text.replace(/"/g,'&quot;')}">${text}</button>`}
function authorAffiliations(item){
  const ies=item.authorInstitutions||item.authors.map((_,index)=>item.institutions.length===1?item.institutions[0]:item.institutions[index]);
  return item.authors.map((author,index)=>[author,ies[index]||'IES não informada']);
}
function peopleTags(item){
  if(!item.authors||!item.authors.length)return `<span class="person-tag">${icon('person')}<span class="tag author">Pesquisador não informado</span>${icon('institution')}<span class="tag institution">IES não informada</span></span>`;
  return authorAffiliations(item).map(([author,ies])=>`<span class="person-tag">${icon('person')}${tag(author,'author')}${icon('institution')}${ies==='IES não informada'?`<span class="tag institution">${ies}</span>`:tag(ies,'institution')}</span>`).join('')
}
function recordMeta(w){return `<div class="people-list">${peopleTags(w)}</div><div class="record-details"><span>${icon('calendar')}${w.meeting} · ${w.year}</span><span>${icon('file')}${w.type}</span></div>`}
function recordExtra(w){
  if(!w.abstract&&!(w.keywords||[]).length)return '';
  const keywords=(w.keywords||[]).map(k=>tag(k,'keyword')).join('');
  return `<details class="record-extra"><summary>Resumo e palavras-chave</summary>${w.abstract?`<p>${w.abstract}</p>`:''}${keywords?`<div class="keyword-list">${keywords}</div>`:''}</details>`;
}
function documentLink(w){
  if(!w.drive)return `<span class="unavailable-link">Documento ainda não localizado</span>`;
  const label=w.drive.includes('youtube.com/')?'Assistir no YouTube':'Baixar';
  return `<a href="${w.drive}" target="_blank" rel="noopener">${icon(w.drive.includes('youtube.com/')?'play':'download')}${label}</a>`;
}

function attachTags(root){root.querySelectorAll('[data-tag]').forEach(b=>b.addEventListener('click',()=>{tagFilter=b.dataset.tag;document.querySelector('#archive-search').value='';document.querySelector('#type-filter').value='';showPage('acervo')}))}
function renderEdition(rootId,meeting,type){
  const root=document.querySelector(rootId);
  root.innerHTML=works.filter(w=>w.meeting===meeting&&(!type||(type==='Trabalhos'?w.type!=='Minicurso'&&w.type!=='Trabalho encomendado':type==='Trabalhos sem pôsteres'?w.type!=='Minicurso'&&w.type!=='Trabalho encomendado'&&w.type!=='Pôster':w.type===type))).map(w=>`<article class="compact-record"><div><h3>${w.title}</h3>${recordMeta(w)}${recordExtra(w)}</div><div class="record-links">${documentLink(w)}</div></article>`).join('');
  attachTags(root);
}
function renderActivities(){
  const root=document.querySelector('#activity-list');
  root.innerHTML=activities.filter(w=>w.meeting==="42ª Reunião"&&w.type==='Minicurso').map(w=>`<article class="activity-card"><div><span class="activity-type">${w.type}</span><h3>${w.title}</h3></div>${recordMeta(w)}<div class="record-links">${documentLink(w)}</div></article>`).join('');
  attachTags(root);
}
function renderLives(){
  const root=document.querySelector('#live-list');
  root.innerHTML=lives.map(w=>`<article class="live-card"><div class="video-frame"><iframe src="${w.embed}" title="${w.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="live-card-body"><span class="activity-type">${w.status||'Live'}</span><h2>${w.title}</h2>${w.date?`<div class="live-date">${icon('calendar')}${w.date}</div>`:''}<div class="people-list">${peopleTags(w)}</div><a class="video-link" href="${w.url}" target="_blank" rel="noopener">${icon('play')}${w.status==='Programada'?'Abrir no YouTube':'Assistir no YouTube'}</a></div></article>`).join('');
  attachTags(root);
}
function renderArchive(){
  const meeting=document.querySelector('#meeting-filter').value;
  const q=normalize(document.querySelector('#archive-search').value);const type=document.querySelector('#type-filter').value;
  const filtered=[...activities,...works].filter(w=>{const hay=normalize([w.id,w.title,...w.authors,...w.institutions,w.type,w.abstract||'',...(w.keywords||[])].join(' '));return (!q||hay.includes(q))&&(!meeting||w.meeting===meeting)&&(!type||w.type===type)&&(!tagFilter||[...w.authors,...w.institutions,...(w.keywords||[])].includes(tagFilter))});
  const active=document.querySelector('#active-filter');active.hidden=!tagFilter;active.textContent=tagFilter?`Filtro: ${tagFilter} ×`:'';active.onclick=()=>{tagFilter='';renderArchive()};
  document.querySelector('#result-count').textContent=filtered.length;
  const root=document.querySelector('#archive-list');
  root.innerHTML=filtered.map(w=>`<article class="record"><div><h2>${w.title}</h2>${recordMeta(w)}${recordExtra(w)}</div><div class="record-links">${documentLink(w)}</div></article>`).join('');
  document.querySelector('#empty-state').hidden=filtered.length>0;attachTags(root);
}
document.querySelector('#archive-search').addEventListener('input',()=>{tagFilter='';renderArchive()});
document.querySelector('#type-filter').addEventListener('change',()=>{tagFilter='';renderArchive()});
document.querySelector('#meeting-filter').addEventListener('change',renderArchive);
document.querySelector('#clear-filters').addEventListener('click',()=>{document.querySelector('#meeting-filter').value='';tagFilter='';document.querySelector('#archive-search').value='';document.querySelector('#type-filter').value='';renderArchive()});
const homeSearchButton=document.querySelector('#home-search-button');
const homeSearch=document.querySelector('#home-search');
if(homeSearchButton&&homeSearch){
  homeSearchButton.addEventListener('click',()=>{document.querySelector('#archive-search').value=homeSearch.value;tagFilter='';showPage('acervo')});
  homeSearch.addEventListener('keydown',e=>{if(e.key==='Enter')homeSearchButton.click()});
}

function renderData(){
  const records=[...works,...activities];
  const authors={};const institutions={};const types={};const years={};
  records.forEach(item=>{
    (item.authors||[]).forEach(name=>authors[name]=(authors[name]||0)+1);
    authorAffiliations(item).forEach(([,ies])=>{if(ies&&ies!=='IES não informada')institutions[ies]=(institutions[ies]||0)+1});
    types[item.type]=(types[item.type]||0)+1;
    years[item.year]??={};years[item.year][item.type]=(years[item.year][item.type]||0)+1;
  });
  document.querySelector('#record-total').textContent=records.length;
  document.querySelector('#author-total').textContent=Object.keys(authors).length;
  document.querySelector('#institution-total').textContent=Object.keys(institutions).length;
  const typeOrder=Object.keys(types).sort((a,b)=>types[b]-types[a]||a.localeCompare(b));
  const typeClass=new Map(typeOrder.map((type,index)=>[type,`type-${index%5+1}`]));
  const legend=typeOrder.map(type=>`<span><i class="${typeClass.get(type)}"></i>${type}</span>`).join('');
  const yearTotals=Object.fromEntries(Object.entries(years).map(([year,values])=>[year,Object.values(values).reduce((a,b)=>a+b,0)]));
  const maxYear=Math.max(...Object.values(yearTotals));
  document.querySelector('#year-type-bars').innerHTML=`<div class="type-legend">${legend}</div>`+Object.keys(years).sort((a,b)=>b-a).map(year=>{
    const segments=typeOrder.filter(type=>years[year][type]).map(type=>`<span class="year-segment ${typeClass.get(type)}" style="width:${years[year][type]/maxYear*100}%" title="${type}: ${years[year][type]}"></span>`).join('');
    return `<div class="year-type-row"><strong>${year}</strong><div class="year-stack" aria-label="${year}: ${yearTotals[year]} registros">${segments}</div><span class="year-type-total">${yearTotals[year]}</span></div>`;
  }).join('');
  const renderBars=(selector,counts,limit=Infinity,classes=false)=>{
    const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,limit);const max=entries[0]?.[1]||1;
    document.querySelector(selector).innerHTML=entries.map(([name,n],index)=>`<div class="bar-row"><span>${name}</span><div class="bar-track"><div class="bar-fill ${classes?typeClass.get(name)||`type-${index%5+1}`:''}" style="width:${n/max*100}%"></div></div><strong>${n}</strong></div>`).join('');
  };
  renderBars('#type-bars',types,Infinity,true);
  renderBars('#author-bars',authors,15);
  renderBars('#institution-bars',institutions,15);
}
document.querySelector('#meeting-filter').innerHTML+=[...new Set([...works,...activities].map(w=>w.meeting))].map(m=>`<option value="${m}">${m}</option>`).join('');
renderLives();renderActivities();renderEdition('#edition-list','42ª Reunião');renderEdition('#edition-courses-41','41ª Reunião','Minicurso');renderEdition('#edition-list-41','41ª Reunião','Trabalhos');renderEdition('#edition-courses-39','39ª Reunião','Minicurso');renderEdition('#edition-list-39','39ª Reunião','Trabalhos');renderEdition('#edition-courses-37','37ª Reunião','Minicurso');renderEdition('#edition-encomendada-37','37ª Reunião','Trabalho encomendado');renderEdition('#edition-list-37','37ª Reunião','Trabalhos');renderEdition('#edition-encomendada-28','28ª Reunião','Trabalho encomendado');renderEdition('#edition-courses-28','28ª Reunião','Minicurso');renderEdition('#edition-posters-28','28ª Reunião','Pôster');renderEdition('#edition-list-28','28ª Reunião','Trabalhos sem pôsteres');renderEdition('#edition-encomendada-27','27ª Reunião','Trabalho encomendado');renderEdition('#edition-posters-27','27ª Reunião','Pôster');renderEdition('#edition-list-27','27ª Reunião','Trabalhos sem pôsteres');renderEdition('#edition-encomendada-26','26ª Reunião','Trabalho encomendado');renderEdition('#edition-posters-26','26ª Reunião','Pôster');renderEdition('#edition-list-26','26ª Reunião','Trabalhos sem pôsteres');renderEdition('#edition-encomendada-25','25ª Reunião','Trabalho encomendado');renderEdition('#edition-courses-25','25ª Reunião','Minicurso');renderEdition('#edition-posters-25','25ª Reunião','Pôster');renderEdition('#edition-list-25','25ª Reunião','Trabalhos sem pôsteres');renderEdition('#edition-courses-24','24ª Reunião','Minicurso');renderEdition('#edition-posters-24','24ª Reunião','Pôster');renderEdition('#edition-list-24','24ª Reunião','Trabalhos sem pôsteres');renderEdition('#edition-posters-23','23ª Reunião','Pôster');renderEdition('#edition-list-23','23ª Reunião','Trabalhos sem pôsteres');renderEdition('#edition-list-22','22ª Reunião (GE19)');renderArchive();renderData();
renderEdition('#edition-encomendada-29','29ª Reunião','Trabalho encomendado');renderEdition('#edition-courses-29','29ª Reunião','Minicurso');renderEdition('#edition-posters-29','29ª Reunião','Pôster');renderEdition('#edition-list-29','29ª Reunião','Trabalhos sem pôsteres');
const initial=location.hash.slice(1);if(pages.some(p=>p.id===initial))showPage(initial);
