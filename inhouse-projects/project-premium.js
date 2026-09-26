
(function(){
'use strict';
document.body.classList.add('project-premium');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const F='<svg viewBox="0 0 24 20" aria-hidden="true"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H10l2 2.5h7.5A2.5 2.5 0 0 1 22 7v8.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 15.5z"/></svg>';
const L='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3M6 10h12v10H6z"/></svg>';
const D='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5"/></svg>';
const Q='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
const P='<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
const B='<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>';
const C='<svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg>';
const U='<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>';
const E='<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';

function routeClass(){
  let h=(location.hash||'#dashboard').slice(1).split('/');
  let k=h[0]||'dashboard'; if(k==='p')k=h[2]||'home'; if(k==='vault')k='docs-vault';
  [...document.body.classList].filter(x=>x.startsWith('zp-route-')).forEach(x=>document.body.classList.remove(x));
  document.body.classList.add('project-premium','zp-route-'+k.replace(/[^a-z0-9-]/gi,'-'));
}
addEventListener('hashchange',()=>setTimeout(routeClass,0)); routeClass();

function starPreview(row,n,on){
  row.classList.toggle('zp-previewing',!!on);
  row.querySelectorAll('.star-btn[data-star]').forEach(b=>b.classList.toggle('zp-preview',!!on&&Number(b.dataset.star)<=n));
}
document.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('.star-btn[data-star]');if(!b)return;const r=b.closest('.stars-radio,.gate-stars');if(r)starPreview(r,+b.dataset.star,true)});
document.addEventListener('mouseout',e=>{const b=e.target.closest&&e.target.closest('.star-btn[data-star]');if(!b)return;const r=b.closest('.stars-radio,.gate-stars');if(r&&!r.contains(e.relatedTarget))starPreview(r,0,false)});

function chain(id,list,path){
  list=list||vTree();path=path||[];
  for(const n of list){if(n.id===id)return path.concat(n);if(n.children){const x=chain(id,n.children,path.concat(n));if(x)return x}}
  return [];
}
function parentKey(id){const a=chain(id);return a.length>1?a[a.length-2].id:'root'}
function href(n){return n.kind==='folder'?'#p/'+currentProjectId+'/vault/'+n.id:'#p/'+currentProjectId+'/doc-editor/'+n.id}

function folderCard(n,pk){
  const locked=!!n.locked,k=n.children||[],enrich=n.id==='project-enrich'||/ENRICH/i.test(n.name||'');
  return `<article class="zv-folder${locked?' locked':''}${enrich?' enrich':''}" data-zv-search="${esc((n.name||'').toLowerCase())}">
    <div class="zv-folder-top"><div class="zv-folder-main" onclick="location.hash='${href(n)}'"><div class="zv-folder-icon">${F}${locked?`<span class="zv-folder-lock">${L}</span>`:''}</div><div style="min-width:0"><h3 title="${esc(n.name)}">${esc(n.name)}</h3><p>${k.length} item${k.length===1?'':'s'}${locked?' · Mentor controlled':''}</p></div></div>
    ${locked?'':`<button class="zv-more" onclick="event.stopPropagation();window._toggleItemMenu(event,'${esc(n.id)}')">⋮</button>`}</div>
    <div class="zv-folder-foot"><span class="zv-folder-status"><i class="zv-dot${locked?' locked':''}"></i>${locked?'Read only':'Writable folder'}</span><button class="zv-open" onclick="location.hash='${href(n)}'">Open →</button></div>
    ${locked?'':`<div class="zv-item-menu item-action-menu" id="item-menu-${esc(n.id)}" onclick="event.stopPropagation()"><button onclick="window._renameItem('${esc(pk)}','${esc(n.id)}')">Rename</button><button onclick="window._copyItem('${esc(pk)}','${esc(n.id)}')">Duplicate</button><button onclick="window._moveItem('${esc(pk)}','${esc(n.id)}')">Move</button><button class="delete-btn" onclick="window._deleteItem('${esc(pk)}','${esc(n.id)}')">Delete</button></div>`}
  </article>`;
}
function fileRow(n){return `<div class="zv-file-row" data-zv-search="${esc((n.name||'').toLowerCase())}"><div class="zv-file-ico">${D}</div><div><strong>${esc(n.name)}</strong><span>${esc(n.meta||'Project document')}</span></div><button class="zv-file-open" onclick="location.hash='${href(n)}'">Open</button></div>`}
function newMenu(ok,key){return ok?`<div class="zv-new-wrap"><button class="zv-btn primary" onclick="event.stopPropagation();window._toggleNewItemMenu(event)">${P} New ${C}</button><div class="zv-menu new-item-menu vmenu" id="new-item-menu"><div class="zv-menu-label">CREATE / UPLOAD</div><button onclick="window._newItemAction('folder')">${F}New Folder</button><button onclick="window._newItemAction('doc')">${D}New Document</button><button onclick="window._newItemAction('local')">${U}Upload from Device</button><button onclick="window._newItemAction('drive')">${D}Google Drive</button><button onclick="window._newItemAction('dropbox')">${D}Dropbox</button></div><input id="local-picker-${esc(key)}" type="file" multiple hidden onchange="window._localFilesPicked(this.files)"></div>`:''}
function pathMenu(id){
  const a=id?chain(id):[], rows=[`<button class="${!id?'current':''}" onclick="event.stopPropagation();location.hash='#p/${currentProjectId}/docs-vault';window._zpClosePath()">${F}<span>Docs &amp; Files</span></button>`];
  a.forEach((n,i)=>rows.push(`<button class="${i===a.length-1?'current':''}" onclick="event.stopPropagation();location.hash='#p/${currentProjectId}/vault/${esc(n.id)}';window._zpClosePath()">${F}<span>${esc(n.name)}</span></button>`));
  return `<div class="zv-path-wrap"><button class="zv-btn" onclick="event.stopPropagation();window._zpTogglePath()">${B}<span>${id?esc(a[a.length-1]?.name||'Parent Folders'):'Parent Folders'}</span>${C}</button><div class="zv-menu zv-path-menu" id="zvPathMenu"><div class="zv-menu-label">FOLDER NAVIGATION</div>${rows.join('')}</div></div>`;
}
window._zpTogglePath=()=>document.getElementById('zvPathMenu')?.classList.toggle('open');
window._zpClosePath=()=>document.getElementById('zvPathMenu')?.classList.remove('open');
window._zpVaultFilter=v=>{const q=String(v||'').trim().toLowerCase();document.querySelectorAll('[data-zv-search]').forEach(el=>el.style.display=!q||el.dataset.zvSearch.includes(q)?'':'none')};

function premiumVault(id){
  currentVaultFolderId=id||'root';
  const node=id?(vFind(id)||{}).node:null;
  if(id&&(!node||node.kind!=='folder'))return `<div class="zv"><div class="zv-work"><main class="zv-main"><div class="zv-card zv-hero"><div><h1>Folder not found</h1><p>It may have been deleted or moved.</p></div><button class="zv-btn primary" onclick="location.hash='#p/${currentProjectId}/docs-vault'">Parent Folders</button></div></main></div></div>`;
  const key=id||'root',kids=id?(node.children||[]):vTree(),folders=kids.filter(x=>x.kind==='folder'),files=kids.filter(x=>x.kind!=='folder'),locked=!!(node&&(node.locked||node.sealed)),title=node?node.name:'Docs & Files',pk=id?parentKey(id):'root';
  const subtitle=node?`Viewing contents inside ${chain(id).map(x=>x.name).join(' / ')}. Create nested folders and project documents here.`:'Organized project vault containing all phase deliverables, working documents and reference materials.';
  return `<div class="zv">
    <div class="zv-status"><div class="zv-status-left">${D}<span>Docs &amp; Files</span></div><div class="zv-status-right"><span class="zv-chip">Vault System</span><span class="zv-chip gold">${id?'Folder Explorer':'Parent Folders'}</span></div></div>
    <div class="zv-work"><main class="zv-main">
      <section class="zv-card zv-hero"><div style="min-width:0;flex:1"><label class="zv-search">${Q}<input placeholder="Search files and folders in this location..." oninput="window._zpVaultFilter(this.value)"></label><div class="zv-eyebrow">PROJECT FILE SYSTEM</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="zv-actions">${pathMenu(id)}${newMenu(!locked,key)}</div></section>
      <div class="zv-toolbar"><div class="zv-tabs"><span class="zv-tab active">All items</span><span class="zv-tab">Folders</span><span class="zv-tab">Documents</span><span class="zv-tab">Recently updated</span></div></div>
      <div class="zv-section-head"><div><span>${id?'SUBFOLDERS':'PARENT FOLDERS'}</span><h2>${id?'Folders in this location':'Project vault'}</h2></div><small>${folders.length} folder${folders.length===1?'':'s'}</small></div>
      <section class="zv-grid">${folders.length?folders.map(n=>folderCard(n,pk)).join(''):`<div class="zv-empty" style="grid-column:1/-1"><strong>No folders here yet</strong><span>${locked?'This location is read only.':'Use New → New Folder to create a nested folder.'}</span></div>`}</section>
      <section class="zv-card zv-files"><div class="zv-section-head" style="margin-top:0"><div><span>FILES</span><h2>Documents in this folder</h2></div><small>${files.length} document${files.length===1?'':'s'}</small></div>${files.length?files.map(fileRow).join(''):`<div class="zv-empty"><strong>No documents in this folder</strong><span>${locked?'Reference documents will appear here when available.':'Create a document or upload files from your device.'}</span></div>`}</section>
      ${id&&!locked?`<div class="zv-drop" id="vault-dropzone"><strong>Drop files here to upload into “${esc(title)}”</strong><span>or click to browse · Max file size 25MB</span></div>`:''}
    </main><aside class="zv-side">
      <section class="zv-side-card"><span class="zv-side-label">VAULT NAVIGATION</span><h3>Project folders</h3><p>Move between parent folders without losing the project vault structure.</p><div class="zv-tree"><button class="${!id?'active':''}" onclick="location.hash='#p/${currentProjectId}/docs-vault'">Docs &amp; Files</button>${vTree().filter(x=>x.kind==='folder').map(x=>`<button class="${id===x.id?'active':''}" onclick="location.hash='#p/${currentProjectId}/vault/${esc(x.id)}'">${esc(x.name)}</button>`).join('')}</div></section>
      <section class="zv-side-card"><span class="zv-side-label">CURRENT FOLDER</span><h3>${esc(title)}</h3><div class="zv-kpis"><div class="zv-kpi"><b>${folders.length}</b><span>Folders</span></div><div class="zv-kpi"><b>${files.length}</b><span>Documents</span></div></div></section>
      <section class="zv-side-card"><span class="zv-side-label">FILE SYSTEM CONTROLS</span><h3>Project vault controls</h3><p>${locked?'This mentor-controlled folder is read only.':'Create nested folders or documents. Use each folder action menu to rename, duplicate, move or delete.'}</p></section>
      <button class="zv-proceed" onclick="location.hash='#p/${currentProjectId}/workspace'">Proceed to Tool Workspace →</button>
    </aside></div>
  </div>`;
}

if(typeof vTree==='function'&&typeof vFind==='function'){
  window.viewVault=()=>premiumVault(null); window.viewFolder=id=>premiumVault(id);
  try{viewVault=window.viewVault;viewFolder=window.viewFolder}catch(_){}
}

function premiumDashboard(){
  if(typeof catalog!=='function'||!catalog()||typeof myProjects!=='function')return null;
  const c=catalog(), list=myProjects(), p=list[0]||c.getCatalogProject(c.DEFAULT_PROJECT_ID), cat=p?c.getCategory(p.category):null;
  let docs=0;try{docs=typeof vCountDocs==='function'?vCountDocs(vTree()):0}catch(_){}
  const owner=typeof projOwner==='function'?projOwner():'JOHN', streak=(typeof state!=='undefined'&&state.streak)||7, img=(p&&p.thumbnail)||(cat&&cat.cover)||'assets/cards/brief.jpg', price=p&&Number(p.price)>0?'£'+p.price:'Free';
  const stats=[
    ['<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="m8 13-1 8 5-3 5 3-1-8"/></svg>','#fff4d4','#806000','3,450','XP Total · +120 this week'],
    ['<svg viewBox="0 0 24 24"><path d="m13 2-8 12h7l-1 8 8-12h-7z"/></svg>','#fff1e4','#b46900',streak+' Days','Current streak'],
    ['<svg viewBox="0 0 24 24"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-3v10l-4-3"/></svg>','#edf3ff','#2f66c8',String(list.length),'Projects owned'],
    ['<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/></svg>','#e9f8f2','#15956f',String(docs),'Docs posted']
  ];
  const project=p?`<article class="we-project-card"><div class="we-project-image"><img src="${esc(img)}" alt="${esc(p.title)}" onerror="this.style.display='none'"><div class="we-image-badges"><span>${esc(cat?cat.short:p.categoryName||'Project')}</span><span>${esc(p.jobRole||'Project')}</span></div><div class="we-learners">★ ${esc(p.rating||'4.4')} · ${esc(p.learners||437)} learners</div></div><div class="we-project-body"><div><div class="we-kicker">ACTIVE WORK EXPERIENCE PROJECT</div><h2>${esc(p.title)}</h2><p>${esc(p.desc||'Complete your work experience project modes inside this workspace.')}</p><div class="we-mode-chips"><span>Supported inside</span><span>Mandate inside</span><span>Group inside</span></div><div class="we-project-foot"><div><small>Level</small><b>${esc(p.difficulty||'Foundation')}</b></div><div><small>Length</small><b>${esc(p.duration||'2 weeks')}</b></div><div><small>Price</small><b>${esc(price)}</b></div></div></div><button class="we-open" onclick="location.hash='#p/${esc(p.id)}/home'">Open Project →</button></div></article>`:'';
  return `<div class="we-dash"><header class="we-dash-top"><div class="we-dash-brand"><img src="assets/logo.png" alt="Zeelin Academy"><strong>ZEELIN WORK EXPERIENCE PORTAL</strong></div><div class="we-dash-actions"><button class="we-pill" onclick="location.href='/portal.html'">◆ Portals</button><span class="we-pill gold">XP <b>3,450</b></span><span class="we-pill">Level 5</span><button class="we-pill" onclick="typeof toast==='function'&&toast('3 project notifications')">Notifications <b>3</b></button><div class="we-profile"><button class="we-profile-btn" onclick="event.stopPropagation();document.getElementById('weProfileMenu').classList.toggle('open')"><span class="we-avatar">JD</span><span>John Doe</span><span>⌄</span></button><div class="we-profile-menu" id="weProfileMenu"><button>Profile & Insights</button><button>Account Settings</button><button onclick="location.href='/portal.html'">Switch Portal</button></div></div></div></header><main class="we-dash-main"><div class="we-intro"><div><div class="we-kicker">MY PROJECT COLLECTION</div><h1>PROJECT <span>${esc(owner)}</span> <button class="we-rename" onclick="window._zpRenameOwner()">${E}</button></h1><p>Each project contains Supported + Mandate + Group modes. Add more projects from the marketplace as your work-experience portfolio grows.</p></div></div><section class="we-stats">${stats.map(x=>`<article class="we-stat"><div class="we-stat-ico" style="background:${x[1]};color:${x[2]}">${x[0]}</div><div><b>${x[3]}</b><span>${x[4]}</span></div></article>`).join('')}</section><section class="we-project-grid">${project}<article class="we-more-card"><div><div class="we-more-icon">${P}</div><div class="we-kicker" style="margin-top:18px">PROJECT MARKETPLACE</div><h2>Get More Project</h2><p>Browse 7 categories by job role and add practical work-experience projects to this dashboard.</p></div><div><div class="we-market-stat"><div><b>${c.MARKETPLACE_PROJECTS.length}</b><span> projects available</span></div><span>7 categories</span></div><button class="we-open" onclick="location.hash='#catalog'">Explore Project Shop →</button></div></article></section></main></div>`;
}
window._zpRenameOwner=function(){if(typeof projOwnerSave!=='function'||typeof projOwner!=='function')return;const v=prompt('Project collection name',projOwner());if(v&&v.trim())projOwnerSave(v.trim())};
if(typeof catalog==='function'&&catalog()&&typeof myProjects==='function'){window.viewDashboard=()=>premiumDashboard()||'';try{viewDashboard=window.viewDashboard}catch(_){}}

document.addEventListener('click',e=>{if(!e.target.closest('.zv-path-wrap'))window._zpClosePath();const p=document.getElementById('weProfileMenu');if(p&&!e.target.closest('.we-profile'))p.classList.remove('open')});
setTimeout(()=>{try{typeof route==='function'&&route()}catch(e){console.error('premium refresh',e)}},0);
})();
