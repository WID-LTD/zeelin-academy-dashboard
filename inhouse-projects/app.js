/* ─── In-House Project Portal — SPA Engine ─── */
(function(){
'use strict';

const STORE_KEY = 'zdash_project_v1';
let state = loadState();
let currentTrackId = state.selectedTrack || 'inhouse';
if(typeof TRACKS !== 'undefined' && TRACKS.length && !TRACKS.some(t=>t.id===currentTrackId)) currentTrackId = TRACKS[0].id;
let currentProjectId = state.currentProject || 'supported';
let currentVaultFolderId = null;
let quizState = null;
let gateProjectId = null;

function loadState(){
  try{ const s = JSON.parse(localStorage.getItem(STORE_KEY)) || defaultState(); return migrateState(s); }
  catch(e){ return defaultState(); }
}
function defaultState(){
  return {selectedTrack:'inhouse',checkins:[],xp:0,streak:0,lastCheckin:null,quizResults:{},consistency:85,metrics:{checkins:12,reviews:4,score:92},currentProject:'supported',chats:{supported:chatSeedMap('supported'),mandate:chatSeedMap('mandate'),group:chatSeedMap('group')},vaultTrees:{supported:null,mandate:null,group:null},customTasks:[],groupTasks:{},mandateDone:{},currentRoomId:{supported:'campfire',group:'daily-standup',mandate:'log'}};
}
/* One-time migration from the pre-project-era shape */
function migrateState(s){
  let changed = false;
  if(!s.vaultTrees){
    s.vaultTrees = { supported:seedTree('supported'), mandate:seedTree('mandate'), group:seedTree('group') };
    changed = true;
  }
  ['supported','mandate','group'].forEach(k=>{ if(!Array.isArray(s.vaultTrees[k])){ s.vaultTrees[k]=seedTree(k); changed=true; } });
  if(!s.chats){
    s.chats = {
      supported: s.chat ? JSON.parse(JSON.stringify(s.chat)) : CHAT_SEED.map(m=>Object.assign({},m)),
      mandate: MANDATE_LOG_SEED.map(m=>Object.assign({},m)),
      group: GROUP_CHAT_SEED.map(m=>Object.assign({},m))
    };
    changed = true;
  }
  if(!s.currentProject){ s.currentProject='supported'; changed=true; }
  delete s.vault; delete s.chat;
  if(changed) persist(s);
  // Convert chat arrays to per-project room maps
  const roomMap = {supported:'campfire',group:'daily-standup',mandate:'log'};
  Object.keys(s.chats).forEach(pid=>{
    if(Array.isArray(s.chats[pid])){
      const arr = s.chats[pid];
      s.chats[pid] = {};
      s.chats[pid][roomMap[pid]] = arr.map(m=>Object.assign({},m));
      changed = true;
    }
  });
  return s;
}
function persist(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s)); }
function saveState(){ persist(state); }
function uid(){ return 'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function fmtSize(b){ return b>1048576 ? (b/1048576).toFixed(1)+' MB' : Math.max(1,Math.round(b/1024))+' KB'; }
function vDate(){ return (new Date()).toLocaleDateString([], {year:'numeric',month:'short',day:'numeric'}); }

/* SVG icon constants — replaces all emojis */
var ICO = {
  folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
  doc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
  lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>',
  pencil: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
  copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
  box: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/></svg>',
  trash: '<svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  upload: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>',
  cloud: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>',
  attachment: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>',
  link: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
  image: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  laptop: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>'
};

/* Per-project vault TREE: array of nodes; folder={id,name,kind:'folder',children:[]} */
function tplDoc(id,name,meta){
  return {id:id,name:name,kind:'doc',locked:true,body:'',meta:meta+' \u2022 Added by Mentor'};
}
function seedTree(pid){
  return [
    {id:'mandate-analysis',name:'MANDATE ANALYSIS',kind:'folder',locked:true,children:[]},
    {id:'initiate',name:'INITIATE',kind:'folder',children:[
      {id:'init-charter',name:'Project Charter.docx',kind:'doc',body:'',meta:'DOCX \u2022 In draft'},
      {id:'init-stakeholders',name:'Stakeholder Register.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 In draft'},
      {id:'init-scope',name:'Scope Statement.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'init-risk',name:'Risk Assessment.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'},
      {id:'init-plan',name:'Communication Plan.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'init-req',name:'Requirements Log.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'},
      {id:'init-notes',name:'Initiation Meeting Notes.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'}
    ]},
    {id:'define',name:'DEFINE',kind:'folder',children:[
      {id:'def-brd',name:'Business Requirements Document.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'def-process',name:'Process Flow Maps.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'},
      {id:'def-data',name:'Data Dictionary.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'},
      {id:'def-gap',name:'Gap Analysis Report.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'def-solution',name:'Solution Design Document.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'def-accept',name:'Acceptance Criteria.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'}
    ]},
    {id:'execute',name:'EXECUTE',kind:'folder',children:[
      {id:'exec-status',name:'Weekly Status Report.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'exec-raid',name:'RAID Log.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'},
      {id:'exec-test',name:'Test Cases Register.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'},
      {id:'exec-uc',name:'Use Case Document.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'exec-demo',name:'Demo Presentation.pptx',kind:'file',meta:'PPTX \u2022 Not started'},
      {id:'exec-minutes',name:'Sprint Review Minutes.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'exec-deploy',name:'Deployment Checklist.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'}
    ]},
    {id:'closure',name:'CLOSURE',kind:'folder',children:[
      {id:'close-final',name:'Final Deliverable Package.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'close-lessons',name:'Lessons Learned Document.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'close-handover',name:'Handover Document.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'close-eval',name:'Project Evaluation Report.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'close-signoff',name:'Sign-Off Certificate.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'},
      {id:'close-arch',name:'Archive Package.zip',kind:'file',meta:'ZIP \u2022 Not started'},
      {id:'close-feedback',name:'Stakeholder Feedback.xlsx',kind:'doc',body:'',meta:'XLSX \u2022 Not started'},
      {id:'close-closure',name:'Project Closure Report.docx',kind:'doc',body:'',meta:'DOCX \u2022 Not started'}
    ]},
    {id:'project-enrich',name:'PROJECT ENRICH DOCUMENTS',kind:'folder',children:[
      {id:'pe-toolkit',name:'BA Toolkit Reference.docx',kind:'doc',body:'',meta:'DOCX \u2022 Reference'}
    ]}
  ];
}
function vTree(pid){
  pid = pid || currentProjectId;
  if(!state.vaultTrees) state.vaultTrees = {};
  if(!Array.isArray(state.vaultTrees[pid])){ state.vaultTrees[pid] = seedTree(pid); return state.vaultTrees[pid]; }
  const t = state.vaultTrees[pid];
  const legacy = t.findIndex(n=>n.id==='project-mandate');
  if(legacy>-1 && !t.some(n=>n.id==='mandate-analysis')) t.splice(legacy,1);
  const tplIdx = t.findIndex(n=>n.id==='templates');
  if(tplIdx>-1) t.splice(tplIdx,1);
  const tplReqIdx = t.findIndex(n=>n.id==='required-deliverables');
  if(tplReqIdx>-1) t.splice(tplReqIdx,1);
  t.forEach(n=>{ if(n.children) n.children = n.children.filter(c=>c.id!=='templates' && c.id!=='required-deliverables' && !String(c.id).startsWith('tpl-')); });
  if(!t.some(n=>n.id==='mandate-analysis')){
    const src = seedTree(pid).find(n=>n.id==='mandate-analysis');
    if(src) t.unshift(JSON.parse(JSON.stringify(src)));
  }
  const ma = t.find(n=>n.id==='mandate-analysis');
  const rest = t.filter(n=>n.id!=='mandate-analysis');
  state.vaultTrees[pid] = [ma].concat(rest);
  persist(state);
  return state.vaultTrees[pid];
}
function vFind(id, list, parent){
  list = list || vTree();
  for(let i=0;i<list.length;i++){
    const n = list[i];
    if(n.id===id) return {node:n,list:list,parent:parent||null,index:i};
    if(n.children){ const r=vFind(id,n.children,n); if(r) return r; }
  }
  return null;
}
function vKids(key){
  if(key==='root'||!key) return vTree();
  const hit = vFind(key);
  return hit && hit.node.children ? hit.node.children : null;
}
function vClone(n){
  const c = Object.assign({}, n);
  c.id = uid();
  if(c.children) c.children = c.children.map(vClone);
  if(c.name && c.name.indexOf('(Copy)')===-1) c.name = c.name+' (Copy)';
  return c;
}
function vCountDocs(list){
  return (list||[]).reduce((a,n)=>a+(n.kind==='doc'?1:0)+(n.children?vCountDocs(n.children):0),0);
}
function vFolders(list,out,depth){
  out=out||[]; depth=depth||0;
  (list||[]).forEach(n=>{ if(n.kind==='folder'){ out.push({id:n.id,name:n.name,depth:depth}); vFolders(n.children,out,depth+1); } });
  return out;
}

function getTrack(id){ return TRACKS.find(t=>t.id===id)||TRACKS[0]; }
function getProject(id){ return PROJECTS.find(p=>p.id===id)||PROJECTS[0]; }
function today(){ return new Date().toISOString().slice(0,10); }

/* ─── Per-project Vault + Chat access ─── */
function chatSeedMap(pid){
  const def = pid==='group' ? 'daily-standup' : pid==='mandate' ? 'log' : 'campfire';
  const src = pid==='group' ? GROUP_CHAT_SEED : pid==='mandate' ? MANDATE_LOG_SEED : CHAT_SEED;
  const m = {}; m[def] = (src||[]).map(x=>Object.assign({},x)); return m;
}
function projChat(pid){
  pid = pid || currentProjectId;
  if(!state.chats[pid] || Array.isArray(state.chats[pid])){
    state.chats[pid] = chatSeedMap(pid);
    saveState();
  }
  return state.chats[pid];
}
function curRoom(pid){
  pid = pid || currentProjectId;
  return (state.currentRoomId && state.currentRoomId[pid]) || (pid==='group'?'daily-standup':pid==='mandate'?'log':'campfire');
}
function roomMsgs(pid){
  const c = projChat(pid), r = curRoom(pid);
  if(!Array.isArray(c[r])) c[r] = [];
  return c[r];
}
function fmtSize(bytes){
  if(bytes>=1048576) return (bytes/1048576).toFixed(1)+' MB';
  return Math.max(1,Math.round(bytes/1024))+' KB';
}

/* ─── Toast ─── */
let toastTimer = null;
function toast(msg){
  let el = document.getElementById('app-toast');
  if(!el){ el=document.createElement('div'); el.id='app-toast'; el.className='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  requestAnimationFrame(()=>el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'),2600);
}
window._toast = toast;
window._state = function(){ return state; };

/* ─── Router ─── */
function navigate(hash){
  window.location.hash = hash;
}
const PROJECT_PAGES = ['brief','workspace','collaboration','docs-vault','home'];
function route(){
  const h = location.hash.slice(1);
  let parts = h ? h.split('/') : [];
  let view = parts[0];

  /* Default */
  if(!view){ render('dashboard'); return; }
  if(view==='dashboard'){ render('dashboard'); return; }

  /* Project-scoped routes: #p/:project/:page/... */
  if(view==='p'){
    const pid = parts[1];
    if(!getProject(pid)){ location.replace('#dashboard'); return; }
    if(currentProjectId!==pid){ currentProjectId = pid; state.currentProject = pid; saveState(); }
    const page = parts[2] || getProject(pid).entry;
    render(page, parts[3]||null, parts[4]||null);
    return;
  }

  /* Legacy + bare project pages → route through current project ("in connection") */
  if(view==='deliverables'){ location.replace('#p/'+currentProjectId+'/docs-vault'); return; }
  if(PROJECT_PAGES.includes(view)){
    location.replace('#p/'+currentProjectId+'/'+view+(parts[1]?'/'+parts.slice(1).join('/'):''));
    return;
  }

  /* Cohort-level legacy redirect */
  if(view==='evaluation' && !parts[1]){ location.replace('#mentorship'); return; }

  /* Marketplace routes */
  if(view==='catalog'){ render('catalog'); return; }
  if(view==='cart'){ render('cart'); return; }
  if(view==='checkout'){ render('checkout'); return; }

  render(view, parts[1]||null, parts[2]||null);
}

/* ─── SVG helper ─── */
function svg(path, cls){
  return `<svg viewBox="0 0 24 24" ${cls?`class="${cls}"`:''} width="16" height="16"><path d="${path}"/></svg>`;
}

/* ─── Sidebar (restructured: project links + Mentorship group) ─── */
const ICON_FOLDER = 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z';
const ICON_BRIEF = 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z';
const ICON_WRENCH = 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.5-.4.5-1.1 0-1.3z';
const ICON_PEOPLE = 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z';
const ICON_GRID = 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z';
const ICON_CAL = 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z';
const ICON_PLAY = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l7 4.5-7 4.5z';
const ICON_CHART = 'M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z';
const ICO_CLIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>';
const ICO_SMILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
const ICO_LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>';
const ICO_LIST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
const ICO_BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="#b5b5b5" stroke-width="2" width="26" height="26"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>';
const ICO_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';
const ICO_BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="18" height="18"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>';
const ICO_ZAP = '<svg viewBox="0 0 24 24" fill="#f59e0b" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
const ICO_VIDEO = '<svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" width="20" height="20"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
const ICO_FILET = '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
const ICO_AWARD = '<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" width="20" height="20"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>';

function navLink(routeKey,label,icon,activeKey){
  return `<a href="#${routeKey}" data-route="${routeKey}" class="${activeKey===routeKey?'active':''}">${svg(icon)}<span>${label}</span></a>`;
}

function renderSidebar(activeKey){
  // Tailored marketplace sidebar - no other projects nav, just marketplace + back
  if(['catalog','cart','checkout'].includes(activeKey)){
    const cartCount = (typeof mpCart==='function'? mpCart().length : 0);
    return `
    <div class="sidebar-head">
      <img src="assets/logo.png" alt="Zeelin Academy Logo">
      <span class="sidebar-title">Project Marketplace</span>
    </div>
    <div class="sidebar-nav">
      <a href="#dashboard" style="display:flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:12px;border-radius:8px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-weight:700;text-decoration:none;font-size:13px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg> Back to Projects</a>
      <div class="sidebar-label">Marketplace</div>
      <a href="#catalog" data-route="catalog" class="${activeKey==='catalog'?'active':''}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h14v2zm-12-4h12V8H6v2z"/></svg><span>Project Shop</span><span class="count">42</span></a>
      <a href="#cart" data-route="cart" class="${activeKey==='cart'?'active':''}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.08 14h8.33c.74 0 1.36-.5 1.54-1.18l2.42-8.42H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11v-2H7l1.1-2z"/></svg><span>Cart</span><span class="count">${cartCount}</span></a>
      <a href="#checkout" data-route="checkout" class="${activeKey==='checkout'?'active':''}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 10z"/></svg><span>Checkout (Demo)</span></a>
      <div class="sidebar-label">Categories</div>
      <a href="javascript:void(0)" onclick="window._mpFilter={cat:'business-analysis',role:'all',q:'',sort:'name',arrange:'grid'};location.hash='#catalog'" style="display:flex;align-items:center;gap:8px;padding:8px 12px;color:#d4d4d4;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#d97706;"></span> Business Analysis</a>
      <a href="javascript:void(0)" onclick="window._mpFilter={cat:'software-engineering',role:'all',q:'',sort:'name',arrange:'grid'};location.hash='#catalog'" style="display:flex;align-items:center;gap:8px;padding:8px 12px;color:#d4d4d4;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#2563eb;"></span> Software Engineering</a>
    </div>`;
  }
  const proj = getProject(currentProjectId);
  let html = `
    <div class="sidebar-head">
      <img src="assets/logo.png" alt="Zeelin Academy Logo">
      <span class="sidebar-title">In-House Project Training Portal</span>
    </div>
    <div class="sidebar-nav">
      ${navLink('dashboard','Main Dashboard','M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',activeKey)}
      <a href="#portal" data-route="portal" class="${activeKey==='portal'?'active':''}">
        ${svg('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z')}
        <span>Portal Overview</span>
      </a>
      <div class="sidebar-label">Stage 2: In-House Projects</div>
  `;

  TRACKS.forEach(tr => {
    const isActive = tr.id === currentTrackId;
    html += `
      <div class="tree-lbl" data-track="${tr.id}" onclick="window._selectTrack('${tr.id}')">
        ${svg(tr.icon)}${tr.name}
      </div>
    `;
    if(isActive){
      const projLink = (page,label,icon)=>{
        const href = '#p/'+currentProjectId+'/'+page;
        return `<a href="${href}" data-route="p/${currentProjectId}/${page}" class="${activeKey===page?'active':''}">${svg(icon)}<span>${label}</span></a>`;
      };
      html += `<div class="sub-nav">
        <div class="cohort-label">
          <svg viewBox="0 0 24 24" fill="#a3a3a3" width="12" height="12"><path d="${ICON_FOLDER}"/></svg>
          Cohort 001 &bull; ${proj.name}
        </div>
        <div class="proj-chips">
          ${PROJECTS.map(p=>`<button class="proj-chip ${p.id===currentProjectId?'active':''}" onclick="_switchProject('${p.id}')" title="${p.name}">${p.name.split(' ')[0]}</button>`).join('')}
        </div>`;
      [
        {route:'home',name:'Portal Overview',icon:ICON_FOLDER},
        {route:'brief',name:'Brief & Objectives',icon:ICON_BRIEF},
        {route:'docs-vault',name:'Docs & Files',icon:ICON_FOLDER},
        {route:'workspace',name:'Tools &amp; Templates',icon:ICON_WRENCH},
        {route:'collaboration',name:'Community',icon:ICON_PEOPLE}
      ].forEach(l => { html += projLink(l.route,l.name,l.icon); });
      html += `<a href="javascript:void(0)" onclick="event.preventDefault();window._openGate();" data-route="gate-quiz" class="sub-link${activeKey==='gate'?' active':''}">${svg(ICO_AWARD)}<span>Final Assessment</span></a>`;
      html += `</div>`;
    }
  });

  html += `
    <div class="sidebar-label">Mentorship</div>
    ${navLink('mentorship','Mentorship Dashboard',ICON_GRID,activeKey)}
    ${navLink('mentorship/live-sessions','Live Sessions & Calendar',ICON_CAL,activeKey)}
    ${navLink('mentorship/recordings','Recordings Library',ICON_PLAY,activeKey)}
    ${navLink('mentorship/evaluation','Evaluation Log & Reviews',ICON_CHART,activeKey)}
    ${navLink('mentorship/support','Support Center',ICON_GRID,activeKey)}
    <div class="sidebar-label">Daily Routine</div>
    <a href="#checkin" data-route="checkin" class="${activeKey==='checkin'?'active':''}">
      ${svg('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z')}
      <span>Daily Check-In</span>
    </a>
    <a href="#accountability" data-route="accountability" class="${activeKey==='accountability'?'active':''}">
      ${svg('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z')}
      <span>Accountability</span>
    </a>
  </div>`;
  return html;
}

/* ─── Topbar ─── */
function renderTopbar(title, pct, phaseInfo){
  return `
    <div class="topbar">
      <svg viewBox="0 0 24 24" fill="#d97706" width="18" height="18"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
      <span class="topbar-title">${title}</span>
      <div class="topbar-bar"><i style="width:${pct}%"></i></div>
      <div class="topbar-right"><a href="/portal.html" style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:#1e1e1e;border:1px solid #3a3a3a;color:#f59e0b;font-size:11px;font-weight:800;text-decoration:none;margin-right:8px">⟡ Portals</a>${phaseInfo||''}</div>
    </div>`;
}

/* ─── Panel (right side) ─── */
function renderPanel(title, sub, items, btnText, btnHash){
  let checks = items.map(it =>
    `<label><input type="checkbox" ${it.checked?'checked':''} ${it.disabled?'disabled':''}/> ${it.text}</label>`
  ).join('');
  return `
    <div class="panel">
      <div class="panel-body">
        <h3>${title}</h3>
        <div class="sub">${sub}</div>
        <div class="checklist">${checks}</div>
      </div>
      <div class="panel-foot">
        <button class="btn btn-amber btn-block" onclick="window._nav('${btnHash}')">${btnText}</button>
      </div>
    </div>`;
}

/* ═══ MAIN DASHBOARD VIEW (reference/11) — renders without sidebar ═══ */
function dashTopbarHtml(){
  return `
  <header class="dash-topbar" style="height:70px;background-color:#181818;border-bottom:1px solid #3f3f3f;display:flex;align-items:center;justify-content:space-between;padding:0 32px;">
    <!-- Left: Branding -->
    <div style="display:flex;align-items:center;gap:12px;">
      <img src="assets/logo.png" alt="Zeelin Academy Logo" style="height:40px;width:auto;object-fit:contain;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;">In-House Project Dashboard</span>
    </div>

    <!-- Center: Page Title -->
    <div style="font-size:16px;font-weight:600;color:#e5e5e5;">Your Projects</div>

    <!-- Right: User Stats & Profile Mock -->
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="display:flex;flex-direction:column;align-items:flex-end;background-color:#26170b;border:1px solid #d97706;border-radius:8px;padding:4px 12px;line-height:1.2;">
        <span style="font-size:10px;text-transform:uppercase;color:#f59e0b;font-weight:bold;">XP</span>
        <span style="font-size:14px;font-weight:800;color:#fbbf24;">3,450</span>
      </div>
      <div style="background-color:#14532d;border:1px solid #16a34a;border-radius:8px;padding:8px 14px;">
        <span style="color:#4ade80;font-size:12px;font-weight:700;">Level 5</span>
      </div>
      <div class="notif-wrap">
        <button class="notif-btn" onclick="event.stopPropagation();window._toggleNotif()" aria-label="Notifications">
          ${ICO_BELL}
          <span class="notif-badge" id="notif-badge">3</span>
        </button>
        <div class="notif-panel" id="notif-panel" onclick="event.stopPropagation()">
          <div class="notif-head">Notifications <span style="font-size:11px;font-weight:600;color:#f59e0b;cursor:pointer;" onclick="window._clearNotifs()">Mark all read</span></div>
          <div class="notif-item"><span class="notif-dot" style="background-color:#4ade80;"></span><div><div style="font-size:13px;font-weight:700;color:#fff;">Evaluation scorecard ready</div><div style="font-size:12px;color:#a3a3a3;">Mentor Sarah Chen posted your Project Enrich review — 92/100.</div></div></div>
          <div class="notif-item"><span class="notif-dot" style="background-color:#f59e0b;"></span><div><div style="font-size:13px;font-weight:700;color:#fff;">Live session upcoming</div><div style="font-size:12px;color:#a3a3a3;">Group Workshop starts Aug 25 at 11:00 AM WAT.</div></div></div>
          <div class="notif-item"><span class="notif-dot" style="background-color:#60a5fa;"></span><div><div style="font-size:13px;font-weight:700;color:#fff;">New recording added</div><div style="font-size:12px;color:#a3a3a3;">"Client Communication &amp; Reporting" is now in the library.</div></div></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;border-left:1px solid #454545;padding-left:16px;">
        <div style="width:32px;height:32px;border-radius:50%;background-color:#d97706;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">JD</div>
        <div style="display:flex;flex-direction:column;">
          <span style="font-size:13px;font-weight:600;color:white;">John Doe</span>
          <span style="font-size:10px;color:#737373;">Active Learner</span>
        </div>
      </div>
    </div>
  </header>`;
}

/* ─── Project card generator (3 real projects, one shared style) ─── */
const PROJ_METRICS = {
  supported:['Readiness','Hours','Left'],
  mandate:['Readiness','Tasks','Due In'],
  group:['Members','Commits','Status']
};
const PROJ_BADGES = {supported:['#26170b','#f59e0b'],mandate:['#172554','#60a5fa'],group:['#14532d','#4ade80']};

function projCard(p){
  const m = PROJ_METRICS[p.id];
  const badge = PROJ_BADGES[p.id];
  return `
      <div class="card-cell" style="background-color:#181818;border-radius:12px;padding:32px;border:1px solid #3f3f3f;display:flex;flex-direction:column;justify-content:space-between;min-height:480px;">
        <div>
          <div style="width:52px;height:52px;background:${p.grad};border-radius:10px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" width="26" height="26">${p.icon}</svg>
          </div>
          <span style="display:inline-block;background-color:${badge[0]};color:${badge[1]};font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${p.badge}</span><br>
          <span style="display:inline-flex;align-items:center;background-color:${p.mode==='guided'?'#14532d':'#1e1e1e'};color:${p.mode==='guided'?'#4ade80':'#f59e0b'};font-size:10px;font-weight:800;padding:3px 9px;border-radius:6px;text-transform:uppercase;letter-spacing:.4px;margin-bottom:12px;">${p.mode==='guided'?'Mentor Guided':'On Your Own'}</span>
          <h3 style="margin:0 0 10px 0;font-size:22px;font-weight:800;color:#ffffff;">${p.name}</h3>
          <p style="margin:0 0 24px 0;font-size:13.5px;color:#c6c6c6;line-height:1.55;">${p.desc}</p>
          <div style="margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:12px;color:#b5b5b5;">Progress</span>
              <span style="font-size:12px;color:#ffffff;font-weight:700;">${p.progress}%</span>
            </div>
            <div style="width:100%;background-color:#262626;height:8px;border-radius:4px;overflow:hidden;">
              <div style="width:${p.progress}%;background:${p.grad};height:100%;"></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;border-top:1px solid #3a3a3a;padding-top:20px;">
            <div><p style="margin:0;font-size:10px;color:#8a8a8a;text-transform:uppercase;font-weight:600;">${m[0]}</p><p style="margin:4px 0 0 0;font-size:16px;font-weight:800;color:#ffffff;">${p.readiness}</p></div>
            <div><p style="margin:0;font-size:10px;color:#8a8a8a;text-transform:uppercase;font-weight:600;">${m[1]}</p><p style="margin:4px 0 0 0;font-size:16px;font-weight:800;color:#ffffff;">${p.stat2}</p></div>
            <div><p style="margin:0;font-size:10px;color:#8a8a8a;text-transform:uppercase;font-weight:600;">${m[2]}</p><p style="margin:4px 0 0 0;font-size:16px;font-weight:800;color:#ffffff;">${p.stat3}</p></div>
          </div>
        </div>
        <button onclick="_enterProject('${p.id}')" style="margin-top:28px;width:100%;padding:12px;border:none;border-radius:8px;background:${p.btnBg};color:#ffffff;font-size:13px;font-weight:800;cursor:pointer;transition:transform .15s;">${p.btnLabel}</button>
      </div>`;
}

/* ─── Daily Check-In gate: pops up before entering a project ─── */
window._enterProject = function(pid){
  if(state.lastCheckin === today()){
    navigate('#p/'+pid+'/'+getProject(pid).entry);
    return;
  }
  openCheckinGate(pid);
};

window._switchProject = function(pid){
  currentProjectId = pid;
  state.currentProject = pid;
  saveState();
  navigate('#p/'+pid+'/'+getProject(pid).entry);
};

function gateBlockHtml(b){
  if(b.type==='stars'){
    let stars=''; let branches='';
    for(let i=1;i<=5;i++){
      stars+=`<button type="button" class="star-btn" data-star="${i}" aria-label="${i} star${i>1?'s':''}" onclick="window._setStars(this,${i})">★</button>`;
      branches+=`<div class="star-branch" data-star="${i}"><label>${b.branches[i-1]}</label><textarea class="form-textarea" placeholder="Optional feedback..."></textarea></div>`;
    }
    return `<div class="gate-block"><label class="block-label">${b.label}</label><div class="gate-stars">${stars}</div>${branches}</div>`;
  }
  if(b.type==='textarea')
    return `<div class="gate-block"><label class="block-label">${b.label}</label><textarea rows="3" class="form-textarea" placeholder="${b.placeholder}"></textarea></div>`;
  return `<div class="gate-block"><label class="block-label">${b.label}</label><input class="form-input" type="text" placeholder="${b.placeholder}"/></div>`;
}

function openCheckinGate(pid){
  gateProjectId = pid;
  const proj = getProject(pid);
  let existing = document.getElementById('checkin-gate');
  if(existing) existing.remove();
  const ov = document.createElement('div');
  ov.id = 'checkin-gate';
  ov.className = 'gate-overlay';
  ov.innerHTML = `
    <div class="gate-modal" onclick="event.stopPropagation()">
      <div class="gate-head">
        <div>
          <div class="gate-title">Daily Check-In</div>
          <div class="gate-sub">Before you enter ${proj.name}</div>
        </div>
        <button class="gate-close" onclick="window._closeGate()" aria-label="Close">&#215;</button>
      </div>
      <div class="gate-body">
        ${CHECKIN_CONFIG.blocks.map(gateBlockHtml).join('')}
      </div>
      <div class="gate-foot">
        <span class="gate-xp">Complete to earn <b>+${CHECKIN_CONFIG.xpClaim} XP</b> &bull; streak ${state.streak||0}</span>
        <span class="gate-actions">
          <button class="gate-skip" onclick="window._skipGate()">Skip for now</button>
          <button class="btn btn-amber" style="padding:10px 20px;font-size:13px;" onclick="window._submitCheckinGate()">Submit &amp; Enter</button>
        </span>
      </div>
    </div>`;
  ov.addEventListener('click', e=>{ if(e.target===ov) window._skipGate(); });
  document.body.appendChild(ov);
}

window._closeGate = function(){
  const g = document.getElementById('checkin-gate');
  if(g) g.remove();
  gateProjectId = null;
};
window._skipGate = function(){
  const pid = gateProjectId;
  window._closeGate();
  if(pid) navigate('#p/'+pid+'/'+getProject(pid).entry);
};
window._gateStar = function(val){
  document.querySelectorAll('#checkin-gate .gate-star').forEach(b=>{
    b.classList.toggle('active', parseInt(b.dataset.val) <= val);
  });
};
window._submitCheckinGate = function(){
  const gained = applyCheckinRewards();
  const proj = getProject(gateProjectId || currentProjectId);
  const modal = document.querySelector('#checkin-gate .gate-modal');
  if(modal){
    modal.innerHTML = `
      <div class="gate-done">
        <div style="font-size:56px;">&#x2705;</div>
        <h2>${gained ? 'Checked in!' : 'Already checked in today'}</h2>
        <p style="font-size:13px;color:#a3a3a3;margin:0 0 6px;">${gained ? 'You earned <b style="color:#d97706">+'+CHECKIN_CONFIG.xpClaim+' XP</b>' : 'XP already claimed'} &bull; Streak: ${state.streak} day(s)</p>
        <p style="font-size:13px;color:#c6c6c6;margin:0 0 18px;">Entering <b style="color:#fff">${proj.name}</b>...</p>
      </div>`;
  }
  fireConfetti();
  setTimeout(()=>{
    const pid = gateProjectId;
    window._closeGate();
    navigate('#p/'+pid+'/'+getProject(pid).entry);
  }, 1400);
};

/* Shared reward logic used by gate and full-page check-in */
function applyCheckinRewards(){
  if(state.lastCheckin === today()) return false;
  state.lastCheckin = today();
  state.xp += CHECKIN_CONFIG.xpClaim;
  state.streak++;
  state.checkins.push({date:today()});
  saveState();
  return true;
}

function viewDashboard(){
  const docsPosted = vCountDocs(vTree());
  const streakDays = state.streak || 7;
  const statTile = (ico,bg,val,lbl,accent)=>`
        <div class="stat-tile">
          <div class="stat-ico" style="background-color:${bg};">${ico}</div>
          <div><div class="stat-val">${val}</div><div class="stat-lbl" style="color:${accent};">${lbl}</div></div>
        </div>`;
  return dashTopbarHtml() + `
  <!-- Main Content Area -->
  <main style="flex:1;padding:32px 48px;overflow-y:auto;">

    <!-- Welcome Banner -->
    <div style="margin-bottom:28px;">
      <p style="margin:0 0 6px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#8a8a8a;font-weight:700;">Welcome Back</p>
      <h1 style="margin:0 0 8px 0;font-size:30px;font-weight:800;color:#ffffff;">Welcome back, John</h1>
      <p style="margin:0;font-size:14px;color:#c6c6c6;">Pick up where you left off or explore new opportunities below.</p>
    </div>

    <!-- Stats Strip -->
    <div class="stat-strip">
      ${statTile(ICO_AWARD,'#26170b','3,450','XP Total &bull; +120 this week','#fbbf24')}
      ${statTile(ICO_ZAP,'#292524',streakDays+' Days','Current Streak','#f59e0b')}
      ${statTile(ICO_VIDEO,'#172554','9','Sessions Attended','#60a5fa')}
      ${statTile(ICO_FILET,'#14532d',docsPosted,'Docs Posted','#4ade80')}
    </div>

    <!-- Responsive Grid of Project Cards -->
    <div class="dash-grid">
      ${PROJECTS.map(p=>projCard(p)).join('')}

      <!-- Card 4: Get More Project (Catalog) -->
      <div class="card-cell" style="background-color:#181818;border-radius:12px;padding:32px;border:1px dashed #565656;display:flex;flex-direction:column;justify-content:space-between;min-height:480px;">
        <div>
          <div style="width:52px;height:52px;background-color:#262626;border-radius:10px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b5b5b5" stroke-width="2" width="26" height="26"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <span style="display:inline-block;background-color:#262626;color:#b5b5b5;font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Catalog</span>
          <h3 style="margin:0 0 10px 0;font-size:22px;font-weight:800;color:#ffffff;">Get More Project</h3>
          <p style="margin:0 0 24px 0;font-size:13.5px;color:#c6c6c6;line-height:1.55;">Browse the project catalog and unlock advanced challenges to accelerate your career growth.</p>
          <div style="border:1px dashed #555555;border-radius:8px;padding:16px;text-align:center;margin-top:auto;">
            <span style="display:flex;justify-content:center;margin-bottom:8px;">${ICO_BOOK}</span>
            <span style="font-size:13px;color:#c6c6c6;font-weight:600;">42 Projects Available</span>
          </div>
        </div>
        <button onclick="location.hash='#catalog'" style="margin-top:28px;width:100%;padding:12px;border:1px solid #d97706;background-color:#d97706;color:#fff;font-size:13px;font-weight:700;border-radius:8px;cursor:pointer;transition:all 0.2s;">Explore Project Shop</button>
      </div>

    </div>
    ${(() => {
      const enrolledIds = (function(){ try{return JSON.parse(localStorage.getItem('zeelin_mp_enrolled')||'[]')}catch{return []} })();
      if (!enrolledIds.length) return '';
      const enrolled = enrolledIds.map(id=> MARKETPLACE_PROJECTS.find(p=>p.id===id)).filter(Boolean);
      if (!enrolled.length) return '';
      const ba = enrolled.filter(p=>p.category==='business-analysis');
      const se = enrolled.filter(p=>p.category==='software-engineering');
      function miniCard(p){
        const c = p.category==='business-analysis' ? '#f59e0b' : '#60a5fa';
        return '<div style="background:#181818;border:2px solid #14532d;border-radius:12px;padding:18px;display:flex;flex-direction:column;"><div style="font-size:10px;font-weight:800;color:'+c+';text-transform:uppercase;">'+(p.category==='business-analysis'?'Business Analysis':'Software Engineering')+' - '+p.jobRole+'</div><div style="font-size:14px;font-weight:800;color:#fff;margin:6px 0;">'+p.title+'</div><div style="font-size:12px;color:#a3a3a3;flex:1;">'+p.desc+'</div><div style="margin-top:12px;padding:8px 10px;background:#14532d;color:#4ade80;border-radius:8px;font-size:11px;font-weight:800;text-align:center;">Enrolled - Grouped & Supported</div></div>';
      }
      return '<div style="margin-top:32px;">'
        + '<h2 style="font-size:16px;font-weight:800;color:#fff;margin-bottom:6px;">My Marketplace Projects - Added to In-House Dashboard</h2>'
        + '<p style="font-size:12px;color:#a3a3a3;margin-bottom:14px;">Purchased via demo checkout. Grouped by job role alongside your Supported / Mandate / Group projects and fully supported.</p>'
        + (ba.length?'<h3 style="font-size:13px;font-weight:800;color:#f59e0b;margin:14px 0 8px;">Business Analysis - '+ba.length+'</h3><div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));">'+ba.map(miniCard).join('')+'</div>':'')
        + (se.length?'<h3 style="font-size:13px;font-weight:800;color:#60a5fa;margin:14px 0 8px;">Software Engineering - '+se.length+'</h3><div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));">'+se.map(miniCard).join('')+'</div>':'')
        + '</div>';
    })()}

  </main>`;
}

/* --- Marketplace: helpers (cart + enrolled) --- */
function mpCart(){ try{return JSON.parse(localStorage.getItem('zeelin_mp_cart')||'[]')}catch{return []} }
function mpSetCart(a){ localStorage.setItem('zeelin_mp_cart', JSON.stringify(a)); window.dispatchEvent(new Event('mp-cart-changed')) }
function mpAdd(id){ const c=mpCart(); if(c.includes(id)) return false; c.push(id); mpSetCart(c); return true }
function mpRemove(id){ const c=mpCart().filter(x=>x!==id); mpSetCart(c) }
function mpEnrolled(){ try{return JSON.parse(localStorage.getItem('zeelin_mp_enrolled')||'[]')}catch{return []} }
function mpEnroll(ids){ const e=mpEnrolled(); const m=new Set([...e, ...ids]); localStorage.setItem('zeelin_mp_enrolled', JSON.stringify([...m])) }
function mpPrice(p){ return p.price===0?'Free':'GBP '+p.price }
function viewCatalog(){
  const enrolled = new Set(mpEnrolled());
  const cart = new Set(mpCart());
  window._mpFilter = window._mpFilter || {cat:'all', role:'all', q:''};
  const f = window._mpFilter;
  let list = MARKETPLACE_PROJECTS.slice();
  if(f.cat!=='all') list = list.filter(p=>p.category===f.cat);
  if(f.role!=='all') list = list.filter(p=>p.jobRole===f.role);
  if(f.q) { const q=f.q.toLowerCase(); list = list.filter(p=>p.title.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)); }
  const baCount = MARKETPLACE_PROJECTS.filter(p=>p.category==='business-analysis').length;
  const seCount = MARKETPLACE_PROJECTS.filter(p=>p.category==='software-engineering').length;
  const grouped = f.cat==='all';
  function card(p){
    const isEnrolled = enrolled.has(p.id);
    const inCart = cart.has(p.id);
    const badgeColor = p.category==='business-analysis' ? '#d97706' : '#2563eb';
    const badgeBg = p.category==='business-analysis' ? '#26170b' : '#172554';
    const badgeLabel = p.category==='business-analysis' ? 'Business Analysis' : 'Software Engineering';
    return '<div style="background:#181818;border:2px solid '+(isEnrolled?'#14532d':'#2a2a2a')+';border-radius:14px;padding:18px;display:flex;flex-direction:column;min-height:340px;position:relative;">'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;"><span style="background:'+badgeBg+';color:'+badgeColor+';font-size:10px;font-weight:800;padding:4px 8px;border-radius:999px;text-transform:uppercase;">'+badgeLabel+'</span><span style="background:#1a1a1a;color:#a3a3a3;font-size:10px;font-weight:700;padding:4px 8px;border-radius:999px;">'+p.jobRole+'</span>'+(p.price===0?'<span style="background:#14532d;color:#4ade80;font-size:10px;font-weight:800;padding:4px 8px;border-radius:999px;">FREE</span>':'')+'</div>'
      + '<h3 style="font-size:15px;font-weight:800;color:#fff;line-height:1.3;margin-bottom:6px;">'+p.title+'</h3>'
      + '<p style="font-size:12.5px;color:#a3a3a3;line-height:1.5;flex:1;">'+p.desc+'</p>'
      + '<div style="display:flex;gap:6px;margin:12px 0;font-size:11px;color:#737373;"><span>'+p.difficulty+'</span><span>-</span><span>'+p.duration+'</span></div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #2a2a2a;padding-top:12px;margin-top:auto;"><span style="font-weight:800;color:'+(p.price===0?'#4ade80':'#fbbf24')+';">'+mpPrice(p)+'</span>'+(isEnrolled?'<span style="background:#14532d;color:#4ade80;font-size:11px;font-weight:800;padding:6px 10px;border-radius:8px;">Enrolled</span>':(inCart?'<a href="#cart" style="background:#262626;color:#fff;font-size:11px;font-weight:800;padding:8px 12px;border-radius:8px;text-decoration:none;">In Cart</a>':'<button onclick="window._mpAdd(\''+p.id+'\')" style="background:#d97706;color:#fff;font-size:11px;font-weight:800;padding:8px 14px;border-radius:8px;border:none;cursor:pointer;">Add to Cart</button>'))+'</div>'
      + '</div>';
  }
  const categories = ['Business Analyst','Systems Analyst','Software Engineer','Data Analyst','Data Engineer','Change Manager','Product Owner'];
  return dashTopbarHtml() + ''
  + '<main style="flex:1;padding:24px 32px;overflow-y:auto;">'
  + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">'
  + '<div><div style="margin-bottom:8px;"><a href="#dashboard" style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-size:11px;font-weight:700;text-decoration:none;">← Back to Projects</a></div><h1 style="font-size:22px;font-weight:800;color:#fff;">Project Shop - Marketplace</h1><p style="font-size:12.5px;color:#a3a3a3;">42 Projects Available - Business Analysis & Software Engineering, classified by job role</p></div>'
  + '<a href="#cart" aria-label="Cart" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;border:2px solid #3a3a3a;background:#1a1a1a;color:#fff;position:relative;text-decoration:none;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.08 14h8.33c.74 0 1.36-.5 1.54-1.18l2.42-8.42H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11v-2H7l1.1-2z"/></svg><span id="mpCartCount" style="position:absolute;top:-6px;right:-6px;background:#d97706;color:#fff;border-radius:999px;padding:2px 6px;font-size:10px;font-weight:800;min-width:18px;text-align:center;">'+mpCart().length+'</span></a>'
  + '</div>'
  + '<div style="background:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:14px;margin-bottom:18px;">'
  + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">'
  + '<input id="mpSearch" placeholder="Search projects, e.g. BPMN, UML, API..." value="'+f.q.replace(/"/g,'&quot;')+'" style="flex:1;min-width:220px;padding:10px 14px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12.5px;" />'
  + '<select id="mpCat" style="padding:10px 12px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12.5px;"><option value="all">All Categories</option><option value="business-analysis" '+(f.cat==='business-analysis'?'selected':'')+'>Business Analysis ('+baCount+')</option><option value="software-engineering" '+(f.cat==='software-engineering'?'selected':'')+'>Software Engineering ('+seCount+')</option></select>'
  + '<select id="mpRole" style="padding:10px 12px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12.5px;"><option value="all">All Job Roles</option>'+categories.map(r=>'<option value="'+r+'" '+(f.role===r?'selected':'')+'>'+r+'</option>').join('')+'</select>'
  + '</div>'
  + '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button onclick="window._mpSetFilter(\'cat\',\'all\')" style="padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid '+(f.cat==='all'?'#d97706':'#3a3a3a')+';background:'+(f.cat==='all'?'#d97706':'transparent')+';color:'+(f.cat==='all'?'#fff':'#a3a3a3')+';cursor:pointer;">All</button><button onclick="window._mpSetFilter(\'cat\',\'business-analysis\')" style="padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid '+(f.cat==='business-analysis'?'#d97706':'#3a3a3a')+';background:'+(f.cat==='business-analysis'?'#d97706':'transparent')+';color:'+(f.cat==='business-analysis'?'#fff':'#a3a3a3')+';cursor:pointer;">Business Analysis</button><button onclick="window._mpSetFilter(\'cat\',\'software-engineering\')" style="padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid '+(f.cat==='software-engineering'?'#2563eb':'#3a3a3a')+';background:'+(f.cat==='software-engineering'?'#2563eb':'transparent')+';color:'+(f.cat==='software-engineering'?'#fff':'#a3a3a3')+';cursor:pointer;">Software Engineering</button></div>'
  + '</div>'
  + (list.length===0?'<p style="text-align:center;color:#737373;padding:40px;">No projects match this filter.</p>':(grouped?''
  + '<div style="margin-bottom:28px;"><h2 style="font-size:15px;font-weight:800;color:#f59e0b;margin-bottom:8px;">Business Analysis - '+list.filter(p=>p.category==='business-analysis').length+' projects</h2><p style="font-size:11.5px;color:#737373;margin-bottom:12px;">Stakeholder, requirements, process & change. Grouped by job role.</p><div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));">'+list.filter(p=>p.category==='business-analysis').map(card).join('')+'</div></div>'
  + '<div><h2 style="font-size:15px;font-weight:800;color:#60a5fa;margin-bottom:8px;">Software Engineering - '+list.filter(p=>p.category==='software-engineering').length+' projects</h2><p style="font-size:11.5px;color:#737373;margin-bottom:12px;">Systems modelling, SDLC, data & delivery - grouped by job role.</p><div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));">'+list.filter(p=>p.category==='software-engineering').map(card).join('')+'</div></div>'
  :'<div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));">'+list.map(card).join('')+'</div>'))
  + '</main>';
}
function bindCatalog(){
  const s=document.getElementById('mpSearch'), c=document.getElementById('mpCat'), r=document.getElementById('mpRole');
  if(s) s.addEventListener('input', e=>{ window._mpFilter.q=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewCatalog(); bindCatalog(); const inp=document.getElementById('mpSearch'); if(inp) inp.focus(); });
  if(c) c.addEventListener('change', e=>{ window._mpFilter.cat=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewCatalog(); bindCatalog(); });
  if(r) r.addEventListener('change', e=>{ window._mpFilter.role=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewCatalog(); bindCatalog(); });
}
window._mpSetFilter = (k,v)=>{ window._mpFilter[k]=v; if(k==='cat'&&v==='all') window._mpFilter.role='all'; const m=document.getElementById('main-content'); m.innerHTML=viewCatalog(); bindCatalog(); };
window._mpAdd = (id)=>{ mpAdd(id); const m=document.getElementById('main-content'); if(m) { m.innerHTML=viewCatalog(); bindCatalog(); } toast('Added to cart - view cart to checkout'); };
function viewCart(){
  const cartIds=mpCart(); const items=cartIds.map(id=>MARKETPLACE_PROJECTS.find(p=>p.id===id)).filter(Boolean);
  const total=items.reduce((s,p)=>s+(Number(p.price)||0),0);
  if(items.length===0) return dashTopbarHtml()+'<main style="flex:1;padding:40px;text-align:center;"><div style="display:flex;justify-content:center;gap:8px;margin-bottom:16px;"><a href="#dashboard" style="padding:8px 12px;border-radius:999px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-weight:700;text-decoration:none;font-size:12px;">← Back to Projects</a><a href="#catalog" style="padding:8px 12px;border-radius:999px;border:1px solid #d97706;background:#d97706;color:#fff;font-weight:700;text-decoration:none;font-size:12px;">← Back to Shop</a></div><div style="font-size:48px;margin-bottom:12px;"><svg width="48" height="48" viewBox="0 0 24 24" fill="#3a3a3a"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.08 14h8.33c.74 0 1.36-.5 1.54-1.18l2.42-8.42H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11v-2H7l1.1-2z"/></svg></div><h2 style="font-size:18px;font-weight:800;color:#fff;">Your cart is empty</h2><p style="font-size:12.5px;color:#a3a3a3;margin:8px 0 18px;">Browse the catalog and add Business Analysis or Software Engineering projects.</p><a href="#catalog" style="display:inline-block;padding:12px 22px;background:#d97706;color:#fff;border-radius:10px;font-weight:800;text-decoration:none;">Explore Project Shop</a></main>';
  return dashTopbarHtml()+'<main style="flex:1;padding:24px 32px;max-width:800px;margin:0 auto;width:100%;">'
  + '<div style="display:flex;gap:8px;margin-bottom:12px;"><a href="#dashboard" style="padding:8px 12px;border-radius:999px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-weight:700;text-decoration:none;font-size:12px;">← Back to Projects</a><a href="#catalog" style="padding:8px 12px;border-radius:999px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-weight:700;text-decoration:none;font-size:12px;">← Back to Shop</a></div>'
  + '<h1 style="font-size:18px;font-weight:800;color:#fff;margin-bottom:12px;">Your Cart - '+items.length+' projects</h1>'
  + '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">'+items.map(p=>'<div style="display:flex;gap:14px;align-items:center;padding:14px;background:#181818;border:1px solid #2a2a2a;border-radius:12px;"><div style="width:48px;height:48px;border-radius:8px;background:'+(p.category==='business-analysis'?'#26170b':'#172554')+';flex-shrink:0;"></div><div style="flex:1;min-width:0;"><div style="font-size:10px;font-weight:800;color:#a3a3a3;text-transform:uppercase;">'+(p.category==='business-analysis'?'Business Analysis':'Software Engineering')+' - '+p.jobRole+'</div><div style="font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.title+'</div><div style="font-size:11px;color:#737373;">'+p.duration+' - '+p.difficulty+'</div></div><div style="font-weight:800;color:'+(p.price===0?'#4ade80':'#fbbf24')+';">'+mpPrice(p)+'</div><button onclick="window._mpRemove(\''+p.id+'\')" style="padding:8px;border-radius:8px;border:1px solid #3a3a3a;background:transparent;color:#ef4444;font-size:11px;font-weight:700;cursor:pointer;">Remove</button></div>').join('')+'</div>'
  + '<div style="background:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:18px;">'
  + '<div style="display:flex;justify-content:space-between;font-weight:800;color:#fff;margin-bottom:6px;"><span>Subtotal (demo)</span><span>GBP '+total.toFixed(2)+'</span></div>'
  + '<p style="font-size:11px;color:#737373;margin-bottom:14px;">Demo checkout - no real charge. Projects will be added to In-House Projects and behave like your enrolled courses, grouped and supported.</p>'
  + '<div style="display:flex;gap:10px;"><button onclick="window._mpClear()" style="padding:12px 18px;border-radius:10px;border:1px solid #3a3a3a;background:transparent;color:#a3a3a3;font-weight:800;cursor:pointer;">Clear Cart</button><a href="#checkout" style="flex:1;text-align:center;padding:12px 18px;border-radius:10px;background:#d97706;color:#fff;font-weight:800;text-decoration:none;">Proceed to Checkout -></a></div>'
  + '</div></main>';
}
window._mpRemove = (id)=>{ mpRemove(id); const m=document.getElementById('main-content'); if(m) m.innerHTML=viewCart(); };
window._mpClear = ()=>{ mpSetCart([]); const m=document.getElementById('main-content'); if(m) m.innerHTML=viewCart(); };
function viewCheckout(){
  const cartIds=mpCart(); const items=cartIds.map(id=>MARKETPLACE_PROJECTS.find(p=>p.id===id)).filter(Boolean);
  const total=items.reduce((s,p)=>s+(Number(p.price)||0),0);
  if(items.length===0) return dashTopbarHtml()+'<main style="flex:1;padding:40px;text-align:center;"><div style="display:flex;justify-content:center;gap:8px;margin-bottom:16px;"><a href="#dashboard" style="padding:8px 12px;border-radius:999px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-weight:700;text-decoration:none;font-size:12px;">← Back to Projects</a><a href="#catalog" style="padding:8px 12px;border-radius:999px;border:1px solid #d97706;background:#d97706;color:#fff;font-weight:700;text-decoration:none;font-size:12px;">← Back to Shop</a></div><p style="color:#a3a3a3;">Cart is empty.</p><a href="#catalog" style="color:#d97706;font-weight:800;">Browse catalog</a></main>';
  return dashTopbarHtml()+'<main style="flex:1;padding:24px 32px;max-width:900px;margin:0 auto;width:100%;">'
  + '<div style="display:flex;gap:8px;margin-bottom:12px;"><a href="#dashboard" style="padding:8px 12px;border-radius:999px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-weight:700;text-decoration:none;font-size:12px;">← Back to Projects</a><a href="#cart" style="padding:8px 12px;border-radius:999px;border:1px solid #3a3a3a;background:#1a1a1a;color:#a3a3a3;font-weight:700;text-decoration:none;font-size:12px;">← Back to Cart</a></div>'
  + '<h1 style="font-size:18px;font-weight:800;color:#fff;margin-bottom:14px;">Checkout - Demo Payment</h1>'
  + '<div style="display:grid;grid-template-columns:1.6fr .9fr;gap:18px;">'
  + '<div><div style="background:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:16px;margin-bottom:14px;"><h3 style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px;">Order Summary - '+items.length+' projects</h3>'+items.map(p=>'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #262626;font-size:12.5px;"><span style="color:#a3a3a3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px;">'+p.title+'</span><span style="font-weight:800;color:'+(p.price===0?'#4ade80':'#fff')+';">'+mpPrice(p)+'</span></div>').join('')+'<div style="display:flex;justify-content:space-between;font-weight:800;color:#fff;margin-top:10px;"><span>Total (demo)</span><span>GBP '+total.toFixed(2)+'</span></div><p style="font-size:11px;color:#737373;margin-top:8px;">Selection -> Cart -> Checkout -> Payment Checkout (demo, no Stripe). Instantly added to My In-House Projects grouped by job role.</p></div>'
  + '<div style="background:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:16px;"><h3 style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px;">Payment - Demo Card (no real charge)</h3><input id="mpEmail" placeholder="Email for receipt" value="" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12.5px;margin-bottom:10px;" /><input value="4242 4242 4242 4242" disabled style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #2a2a2a;background:#0f0f0f;color:#737373;font-size:12.5px;margin-bottom:8px;" /><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;"><input value="12/34" disabled style="padding:10px 12px;border-radius:10px;border:1px solid #2a2a2a;background:#0f0f0f;color:#737373;font-size:12.5px;" /><input value="123" disabled style="padding:10px 12px;border-radius:10px;border:1px solid #2a2a2a;background:#0f0f0f;color:#737373;font-size:12.5px;" /></div><p style="font-size:11px;color:#737373;margin-bottom:12px;">Demo: card fields disabled, no money moves.</p><button onclick="window._mpPay()" style="width:100%;padding:12px;border-radius:10px;background:#16a34a;color:#fff;font-weight:800;border:none;cursor:pointer;">Pay GBP '+total.toFixed(2)+' (Demo) -> Enroll</button><div id="mpErr" style="color:#fca5a5;font-size:12px;margin-top:8px;display:none;"></div></div></div>'
  + '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:16px;height:max-content;"><div style="font-size:12px;font-weight:800;color:#fff;margin-bottom:8px;">How it works</div><ol style="font-size:11.5px;color:#a3a3a3;line-height:1.7;margin-left:16px;"><li>Select Business Analysis or Software Engineering projects from catalog</li><li>Add to cart, review, proceed</li><li>Demo checkout - projects instantly appear in In-House Projects, grouped by job role and supported like other courses.</li></ol></div>'
  + '</div></main>';
}
window._mpPay = ()=>{
  const cart=mpCart(); if(cart.length===0) return;
  mpEnroll(cart); mpSetCart([]);
  const enrolledBox=document.getElementById('main-content');
  enrolledBox.innerHTML = '<div style="text-align:center;padding:60px 20px;"><div style="width:80px;height:80px;border-radius:50%;background:#14532d;color:#4ade80;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:36px;">v</div><h2 style="font-size:18px;font-weight:800;color:#fff;">Demo Payment Successful!</h2><p style="font-size:12.5px;color:#a3a3a3;margin:8px 0 18px;">No real charge. Your projects are now in <b style="color:#fff">My In-House Projects</b> (grouped alongside your 3 existing projects).</p><a href="#dashboard" style="display:inline-block;padding:12px 22px;background:#d97706;color:#fff;border-radius:10px;font-weight:800;text-decoration:none;">Go to My Projects</a></div>';
  setTimeout(()=>{ location.hash='#dashboard'; }, 1400);
};

/* Notifications dropdown + outside-click close */
window._toggleNotif = function(){
  const p = document.getElementById('notif-panel');
  if(p) p.classList.toggle('open');
};
window._clearNotifs = function(){
  const b = document.getElementById('notif-badge');
  if(b) b.style.display='none';
  toast('All notifications marked as read');
};
function bindDashboard(){
  document.addEventListener('click', function onDocClick(e){
    const p = document.getElementById('notif-panel');
    if(!p){ document.removeEventListener('click', onDocClick); return; }
    if(!e.target.closest || !e.target.closest('.notif-wrap')) p.classList.remove('open');
  });
}

/* ─── Views ─── */

function viewPortal(){
  const t = getTrack(currentTrackId);
  const IMG_MAP = {
    'Brief & Objectives':'assets/cards/brief.jpg',
    'Docs & Files':'assets/cards/deliverables.jpg',
    'Docs & Files Vault':'assets/cards/deliverables.jpg',
    'Tools / Templates Workspace':'assets/cards/workspace.jpg',
    'Tool Workspace':'assets/cards/workspace.jpg',
    'Community':'assets/cards/collaboration.jpg',
    'Peer Collaboration & Review':'assets/cards/collaboration.jpg',
    'Mentorship':'assets/cards/evaluation.jpg',
    'Final Assessment':'assets/cards/quiz.jpg',
    'brief':'assets/cards/brief.jpg',
    'docs-vault':'assets/cards/deliverables.jpg',
    'workspace':'assets/cards/workspace.jpg',
    'collaboration':'assets/cards/collaboration.jpg',
    'mentorship':'assets/cards/evaluation.jpg',
    'quiz':'assets/cards/quiz.jpg'
  };
  const overallPct = Math.round(t.project.phases.reduce((a,p)=>a+p.progress,0)/t.project.phases.length);
  let cards = t.project.phases.map(p => {
    const color = p.progress>=75?'#16a34a':p.progress>=40?'#d97706':'#d97706';
    const img = IMG_MAP[p.name] || IMG_MAP[p.id] || IMG_MAP[p.route] || 'assets/cards/brief.jpg';
    const desc = p.name==='Brief & Objectives'?'Review the full project scope, objectives and professional standard requirements.':
            p.name.includes('Docs')?'Upload completed project artifacts for mentor evaluation. Store, create and manage documents across every stage folder.':
            p.name.includes('Tool')?'Interactive spreadsheet, code editor or wireframe sandbox for your track. Specialized workspace for hands-on practice.':
            p.name === 'Community' || p.name.includes('Peer')?'Share approaches, ask questions and review cohort peer work in the community feed.':
            p.name.includes('Mentor')?'Official assessment scorecard and qualitative feedback from your mentor. Access live sessions & recordings.':
            'Final 5-step assessment to validate your project knowledge and readiness. Earn certification on completion.';
    const barLabel = p.milestones?'Milestones':(p.name.includes('Docs')?'Uploaded':(p.name.includes('Peer')||p.name==='Community')?'Participation':p.name.includes('Mentor')?'Status':p.name.includes('Quiz')?'Quiz Progress':'Completion');
    const barValue = p.milestones?p.completed+'/'+p.milestones:(p.name.includes('Mentor')?(p.progress>=90?'Reviewed':p.progress+'%'):(p.name.includes('Quiz')?(p.progress>0?p.progress+'%':'Pending'):p.progress+'%'));
    const imageHtml = `<div style="width: 100%; height: 140px; background-color: #262626; position: relative; overflow: hidden;"><img src="${img}" alt="${p.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'"><div style="position: absolute; inset: 0; background: rgba(0,0,0,0.25);"></div>${p.id==='quiz'||p.route==='quiz'?`<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;"><div style="width: 40px; height: 40px; background-color: #d97706; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><svg style="width: 18px; height: 18px; fill: white; margin-left: 2px;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>`:''}</div>`;
    return `
        <div style="background-color: #181818; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            ${imageHtml}
            <div style="padding: 20px;">
              <div style="width: 48px; height: 48px; background-color: #26170b; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg style="width: 24px; height: 24px; fill: #d97706;" viewBox="0 0 24 24"><path d="${p.icon}"/></svg>
              </div>
              <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">${p.name}</h3>
              <p style="font-size: 13px; color: #a3a3a3; line-height: 1.5; margin: 0 0 16px 0;">${desc}</p>
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #a3a3a3; margin-bottom: 6px;">
                  <span>${barLabel}</span>
                  <span>${barValue}</span>
                </div>
                <div style="width: 100%; height: 4px; background-color: #2a2a2a; border-radius: 2px; overflow: hidden;">
                  <div style="width: ${p.progress}%; height: 100%; background-color: ${color};"></div>
                </div>
              </div>
            </div>
          </div>
          <div style="padding: 16px 20px; background-color: #161616; border-top: 1px solid #2a2a2a;">
            <button onclick="${p.route==='quiz'?'window._openGate()':`location.hash='#p/${currentProjectId}/${p.id||p.route}'`}" style="width: 100%; background-color: #16a34a; color: #ffffff; border: none; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">${p.route==='quiz'?'Start Quiz':'Open '+p.name.split(' ')[0]}</button>
          </div>
        </div>`;
  }).join('');

  return `
  <div style="flex: 1; display: flex; flex-direction: column; background-color: #121212; overflow-y: auto;">
    <div style="padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box;">
      <div style="margin-bottom: 24px; border-bottom: 1px solid #2a2a2a; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 4px 0;">${t.project.title}</h1>
          <p style="font-size: 13px; color: #a3a3a3; margin: 0;">${t.project.subtitle} &bull; ${t.project.phases.length} phases</p>
        </div>
        <div style="background-color: #181818; border: 1px solid #2a2a2a; padding: 8px 14px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 12px; color: #a3a3a3;">Overall Day Progress</span>
          <div style="width: 100px; height: 6px; background-color: #2a2a2a; border-radius: 3px; overflow: hidden;">
            <div style="width: ${overallPct}%; height: 100%; background-color: #d97706;"></div>
          </div>
          <span style="font-size: 12px; font-weight: 600; color: #d97706;">${overallPct}%</span>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        ${cards}
      </div>
    </div>
  </div>`;
}

function projModeChip(){
  const proj = getProject(currentProjectId);
  if(proj.mode==='guided') return '';
  return `<span style="display:inline-flex;align-items:center;gap:6px;background-color:#26170b;border:1px solid #d97706;color:#f59e0b;font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px;margin-left:10px;vertical-align:middle;">On Your Own</span>`;
}

function viewBrief(){
  const t = getTrack(currentTrackId);
  const proj = getProject(currentProjectId);
  const p = t.project.phases.find(x=>x.id==='brief');
  const solo = proj.mode!=='guided';
  const callout = solo
    ? `<div class="callout"><h4>Self-Directed Standard</h4><p>No mentor walkthroughs on this one — the professional standard is yours to enforce. Peer review is available in your project channel, and successful completion still unlocks direct entry into the Job Acquisition Portal (Stage 3).</p></div>`
    : `<div class="callout"><h4>Professional Standard Note</h4><p>All deliverables will be evaluated by your assigned mentor. Completing this project successfully unlocks direct entry into the Job Acquisition Portal (Stage 3).</p></div>`;
  return renderTopbar(proj.name+': Brief & Objectives', p.progress, `<span>${proj.modeLabel} &bull; ${proj.progress}% Project Progress</span><b>${p.progress}% Phase Complete</b>`)
    + `<div class="workspace"><div class="canvas">
      <div class="brief">
        <div class="brief-meta"><span class="brief-kicker">${proj.name}${projModeChip()} — In-House Training Project</span><span class="brief-deadline">Deadline: ${t.project.deadline}</span></div>
        <h1>${t.project.title}</h1>
        <p>${proj.stageDesc.brief} This practical assignment simulates real-world consulting${solo?' — fully self-directed':' with mentor support'}. You are tasked with analyzing the project domain, eliciting operational requirements from stakeholders, and modeling a comprehensive solution.</p>
        <h2>Core Project Objectives</h2>
        <ul>
          <li><strong>Stakeholder Mapping:</strong> Identify key actors, managers, and vendors.</li>
          <li><strong>Requirements Traceability:</strong> Document functional and non-functional requirements.</li>
          <li><strong>Domain Modeling:</strong> Build projections and analysis using specialized tools.</li>
        </ul>
        ${callout}
        <p>Review the checklist on the right, download your assigned workspace resources, and proceed to the interactive module once you have fully understood the project brief.</p>
      </div>
    </div>
    ${renderPanel(solo?'Self-Directed Checklist':'Brief Milestones','Phase 1 Action Items',[
      {text:'Read Project Overview & Scope',checked:true},
      {text:'Review Business Objectives',checked:true},
      {text:'Download Dataset & Templates',checked:false},
      {text:'Initialize Spreadsheet Workspace',checked:false}
    ],'Open Workspace','#p/'+currentProjectId+'/workspace')}
    </div>`;
}

function viewWorkspace(){
  const proj = getProject(currentProjectId);
  const tools = PROJECT_TOOLS[proj.id] || [];
  const tpls = typeof TOOL_TEMPLATES!=='undefined' ? TOOL_TEMPLATES : {};
  const LOGO = id => 'assets/logos/'+id+'.svg';
  const DL_URL = id => ({
    excel:'https://www.microsoft.com/microsoft-365/excel',
    word:'https://www.microsoft.com/microsoft-365/word',
    powerpoint:'https://www.microsoft.com/microsoft-365/powerpoint',
    visio:'https://www.microsoft.com/en-us/microsoft-365/visio/visio-for-web',
    project:'https://www.microsoft.com/microsoft-365/project/project-for-the-web'
  }[id] || '#');
  const toolHtml = tools.map(t => {
    const tList = tpls[t.id] || [];
    const opts = tList.map(tpl => '<option value="'+tpl.name+'">'+tpl.name+' ('+tpl.ext.toUpperCase()+' '+tpl.size+')</option>').join('');
    return `
    <div style="background:#181818;border:1px solid #333;border-radius:12px;padding:20px 24px;display:flex;align-items:center;gap:18px;margin-bottom:12px;">
      <img src="${LOGO(t.id)}" alt="${t.name}" style="width:44px;height:44px;border-radius:8px;background:#fff;padding:4px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="width:44px;height:44px;border-radius:8px;background:${t.grad||'#333'};display:none;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;font-weight:900;color:#fff;">${t.icon||t.name.charAt(0)}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:800;color:#ffffff;margin-bottom:2px;">${t.name}</div>
        <div style="font-size:12px;color:#a3a3a3;line-height:1.4;">${t.category||''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
        <a href="${DL_URL(t.id)}" target="_blank" rel="noopener noreferrer" style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(217,119,6,.3);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Tool
        </a>
        ${tList.length ? `<select id="ws-tpl-${t.id}" onchange="window._dlWorkspaceTemplate('${t.id}',this.value)" style="background:#2563eb;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;appearance:auto;">
          <option value="">Templates (${tList.length})</option>
          ${opts}
        </select>` : ''}
      </div>
    </div>`;
  }).join('');

  window._dlWorkspaceTemplate = window._dlWorkspaceTemplate || function(toolId, tplName){
    if(!tplName) return;
    toast('Downloading '+tplName+'...');
  };

  return `
  <div style="flex:1;display:flex;height:100vh;overflow:hidden;">
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">

      <div class="vault-statusbar">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
          <span style="font-size:14px;font-weight:800;color:#ffffff;">${proj.name} ${projModeChip()} &bull; Specialized Tools Workspace</span>
          <span style="font-size:11px;font-weight:700;color:#d97706;background:rgba(217,119,6,.15);padding:3px 10px;border-radius:100px;">Microsoft Enterprise Suite</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;font-size:13px;font-weight:700;color:#d4d4d4;">
          ${bookmarkStar()}
          <span style="color:#16a34a;font-weight:800;">Software Packages: ${tools.length}</span>
          <span style="color:#2563eb;font-weight:800;">Templates Active: ${Object.values(tpls).reduce((a,b)=>a+b.length,0)}</span>
        </div>
      </div>

      <div style="flex:1;display:flex;overflow:hidden;">

        <div style="flex:1;padding:36px 52px;overflow-y:auto;background-color:#121212;">
          <div style="max-width:860px;margin:0 auto;">

            <div style="border-bottom:2px solid #3a3a3a;padding-bottom:24px;margin-bottom:32px;">
              <h1 style="font-size:32px;font-weight:900;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;">Microsoft Tools &amp; Templates Repository</h1>
              <p style="font-size:14px;font-weight:700;color:#c0c0c0;margin:0;">Enterprise-grade Microsoft software packages for your project deliverables. Download tools and access project-specific templates below.</p>
            </div>

            ${toolHtml || '<div style="border:2px dashed #454545;border-radius:12px;padding:52px 24px;text-align:center;"><p style="color:#ffffff;font-size:16px;font-weight:800;margin:0 0 8px 0;">No tools assigned</p><p style="color:#8a8a8a;font-size:13px;margin:0;">Tools for this project will appear here once configured.</p></div>'}

          </div>
        </div>

        <div class="vault-right-panel">
          <div style="padding:24px;">
            <div style="margin-bottom:24px;">
              <h3 style="font-size:16px;font-weight:900;color:#ffffff;margin:0 0 6px 0;">Workspace Guidelines</h3>
              <p style="font-size:13px;font-weight:700;color:#c0c0c0;margin:0;">Follow these steps before proceeding</p>
            </div>
            <div class="vrp-checklist">
              <label><input type="checkbox" checked style="accent-color:#16a34a;width:16px;height:16px;"> Download Microsoft Office Suite</label>
              <label><input type="checkbox" checked style="accent-color:#16a34a;width:16px;height:16px;"> Download assigned tool templates</label>
              <label><input type="checkbox" style="accent-color:#d97706;width:16px;height:16px;"> Familiarize yourself with each tool</label>
              <label><input type="checkbox" style="accent-color:#d97706;width:16px;height:16px;"> Set up your project workspace</label>
            </div>
            <div style="border-top:2px solid #3a3a3a;padding-top:20px;margin-top:20px;">
              <h4 style="font-size:14px;font-weight:900;color:#ffffff;margin:0 0 8px 0;">How to Use</h4>
              <p style="font-size:13px;font-weight:700;color:#c0c0c0;line-height:1.6;margin:0;">
                Each tool is listed with its purpose and download link. Click "Download Tool" to open the official Microsoft product page and install. Use the Templates dropdown to download ready-to-use project files.
              </p>
            </div>
          </div>
          <div style="padding:24px;background-color:#161616;border-top:2px solid #3a3a3a;">
            <a href="#p/${currentProjectId}/docs-vault" style="display:block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:1px solid #f59e0b;text-align:center;padding:14px;border-radius:8px;font-size:14px;font-weight:900;text-decoration:none;box-shadow:0 4px 16px rgba(217,119,6,.4);">
              Proceed to Project Vault &rarr;
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

/* ═══ CAMPFIRE CHAT VIEW (reference/12) ═══ */
function chatMsgHtml(m){
  const own = m.init==='JD';
  return `
        <div class="group-msg ${own?'own':''}">
          ${own?'':`<div class="member-ava" style="background-color:${m.color};">${m.init}</div>`}
          <div class="group-bubble">
            <div class="group-meta"><span class="group-name">${m.name}</span><span>${m.time}</span></div>
            <p style="margin:0;font-size:13px;color:#e5e5e5;line-height:1.5;">${m.text}</p>
          </div>
          ${own?`<div class="member-ava" style="background-color:${m.color};">${m.init}</div>`:''}
        </div>`;
}

function viewCollaboration(){
  if(currentProjectId==='group') return viewGroupChat();
  if(currentProjectId==='mandate') return viewSoloLog();
  return viewCampfireCommunity();
}

/* Supported Project: community Campfire (reference/12) */
function bookmarkStar(){
  const on = !!((state||{}).bookmarkedRooms||{})[currentProjectId];
  return `<button class="bm-star ${on?'on':''}" onclick="window._toggleBookmark()" title="${on?'Bookmarked':'Bookmark this room'}">&#9733;</button>`;
}
window._toggleBookmark = function(){
  state.bookmarkedRooms = state.bookmarkedRooms || {};
  state.bookmarkedRooms[currentProjectId] = !state.bookmarkedRooms[currentProjectId];
  saveState();
  toast(state.bookmarkedRooms[currentProjectId] ? 'Room bookmarked' : 'Bookmark removed');
  route();
};

function viewCampfireCommunity(){
  const msgs = roomMsgs().map(chatMsgHtml).join('');
  return `
  <div style="flex:1;display:flex;height:100vh;overflow:hidden;">
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background-color:#121212;">

      <!-- Status Bar -->
      <div class="vault-statusbar">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span style="font-size:14px;font-weight:800;color:#ffffff;">Community (Campfire Room)</span>
          <div style="flex:1;max-width:200px;height:6px;background:#262626;border-radius:100px;overflow:hidden;margin-left:8px;">
            <div style="width:85%;height:100%;background:linear-gradient(90deg,#f59e0b 0%,#16a34a 100%);border-radius:100px;"></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:16px;font-size:13px;font-weight:700;color:#d4d4d4;">
          ${bookmarkStar()}
          <span style="color:#16a34a;font-weight:800;">Online Analysts: 24 active</span>
          <span style="background:rgba(217,119,6,.15);color:#d97706;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:800;">Community Forum</span>
        </div>
      </div>

      <!-- Inner split -->
      <div style="flex:1;display:flex;overflow:hidden;">

        <!-- Chat column -->
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">

          <!-- Intro Header -->
          <div style="padding:16px 28px;background:#1e1e1e;border-bottom:1px solid #333;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:10px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#d97706"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <span style="font-size:16px;font-weight:800;color:#ffffff;">Chat casually in the Campfire Room</span>
            </div>
            <p style="font-size:12px;color:#8a8a8a;margin:4px 0 0 0;padding-left:28px;">Ask questions, share insights with your independent project cohort. Stay active.</p>
          </div>

          <!-- Messages -->
          <div id="chat-scroll" style="flex:1;overflow-y:auto;padding:24px 28px;">
            <div id="campfire-stream" style="max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
              ${msgs}
            </div>
          </div>

          <!-- Input Bar -->
          <div style="padding:12px 28px;background:#1e1e1e;border-top:1px solid #333;flex-shrink:0;">
            <div style="max-width:720px;margin:0 auto;background:#121212;border:1px solid #454545;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:10px;">
              <span style="color:#737373;font-size:16px;cursor:pointer;" title="Attach file">&#128206;</span>
              <span style="color:#737373;font-size:16px;cursor:pointer;" title="Emoji">&#128578;</span>
              <span style="color:#737373;font-size:14px;cursor:pointer;font-weight:700;" title="Mention">@</span>
              <span style="color:#737373;font-size:14px;cursor:pointer;font-weight:800;" title="Bold">B</span>
              <input type="text" id="campfire-input" placeholder="Start by saying 'Hi' to your team..." style="flex:1;background:transparent;border:none;color:#ffffff;font-size:13px;outline:none;padding:6px 0;">
              <button onclick="window._campfireSend()" style="background-color:#d97706;color:#ffffff;border:none;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Send</button>
            </div>
          </div>
        </div>

        <!-- Right Panel: Guidelines -->
        <aside style="width:320px;background-color:#181818;border-left:1px solid #333;display:flex;flex-direction:column;flex-shrink:0;">
          <div style="padding:24px;flex:1;overflow-y:auto;">
            <div style="margin-bottom:24px;">
              <h3 style="font-size:16px;font-weight:900;color:#ffffff;margin:0 0 6px 0;">Community Guidelines</h3>
              <p style="font-size:13px;font-weight:700;color:#c0c0c0;margin:0;">Follow these steps to stay engaged and prepared</p>
            </div>
            <div class="vrp-checklist">
              <label><input type="checkbox" checked style="accent-color:#16a34a;width:16px;height:16px;"> Say Hello to your cohort</label>
              <label><input type="checkbox" checked style="accent-color:#16a34a;width:16px;height:16px;"> Share Insights with peers</label>
              <label><input type="checkbox" style="accent-color:#d97706;width:16px;height:16px;"> Ask Questions about project scope</label>
              <label><input type="checkbox" style="accent-color:#d97706;width:16px;height:16px;"> Prepare for Mentor Review</label>
            </div>
            <div style="border-top:2px solid #3a3a3a;padding-top:20px;margin-top:20px;">
              <p style="font-size:13px;font-weight:700;color:#c0c0c0;line-height:1.6;margin:0;">
                This forum connects independent project trainees. Discuss ideas freely while maintaining academic integrity.
              </p>
            </div>
          </div>
          <div style="padding:24px;background-color:#161616;border-top:2px solid #3a3a3a;">
            <a href="#p/${currentProjectId}/mentor-evaluation" style="display:block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:1px solid #f59e0b;text-align:center;padding:14px;border-radius:8px;font-size:14px;font-weight:900;text-decoration:none;box-shadow:0 4px 16px rgba(217,119,6,.4);">
              Proceed to Mentor Evaluation Log &rarr;
            </a>
          </div>
        </aside>

      </div>
    </div>
  </div>`;
}

function bindCampfire(){
  const inp = document.getElementById('campfire-input');
  if(inp){
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter') window._campfireSend(); });
  }
}

window._campfireSend = function(){
  const inp = document.getElementById('campfire-input');
  const text = inp ? (inp.value||'').trim() : '';
  if(!text){ toast('Type a message first'); return; }
  const chat = roomMsgs();
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2,'0');
  const ap = h>=12?'PM':'AM';
  h = h%12||12;
  chat.push({init:'JD',color:'#d97706',name:'John Doe (You)',time:h+':'+m+' '+ap,text});
  saveState();
  if(currentProjectId==='group'){
    route();
    setTimeout(()=>{ const s=document.getElementById('group-stream'); if(s) s.scrollTop=999999; },0);
    return;
  }
  const stream = document.getElementById('campfire-stream');
  if(stream){
    stream.insertAdjacentHTML('beforeend', chatMsgHtml(chat[chat.length-1]));
    const sc = document.getElementById('chat-scroll'); if(sc) sc.scrollTop = sc.scrollHeight;
  }
  if(inp) inp.value='';
};

/* ── Group Project: team channel (group-style, not community) ── */
function groupMsgHtml(m){
  const own = m.init==='JD';
  return `
        <div class="group-msg ${own?'own':''}">
          ${own?'':`<div class="member-ava" style="background-color:${m.color};">${m.init}</div>`}
          <div class="group-bubble">
            <div class="group-meta"><span class="group-name">${m.name}</span><span>${m.time}</span></div>
            <p style="margin:0;font-size:13px;color:#e5e5e5;line-height:1.5;">${m.text}</p>
          </div>
          ${own?`<div class="member-ava" style="background-color:${m.color};">${m.init}</div>`:''}
        </div>`;
}

function viewGroupChat(){
  const proj = getProject('group');
  const msgs = roomMsgs('group').map(groupMsgHtml).join('');
  return `
  <div style="flex:1;display:flex;overflow:hidden;background-color:#121212;">

    <!-- Team Channel Canvas -->
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:16px 32px;border-bottom:1px solid #3f3f3f;display:flex;align-items:center;justify-content:space-between;background-color:#181818;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:18px;font-weight:800;color:#ffffff;"><span style="color:#4ade80;">#</span> group-feed</span>
          <span style="font-size:12px;color:#8a8a8a;">${proj.name} &bull; Agency Simulation &bull; Standups daily 9:00 AM</span>
        </div>
        <span style="display:inline-flex;align-items:center;background-color:#1e1e1e;color:#f59e0b;font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px;">On Your Own</span>
      </div>

      <div id="group-stream" style="flex:1;overflow-y:auto;padding:24px 32px;display:flex;flex-direction:column;gap:16px;">
        <div style="text-align:center;margin-bottom:8px;">
          <span style="font-size:11px;color:#8a8a8a;background-color:#181818;border:1px solid #3a3a3a;padding:6px 14px;border-radius:999px;">Team channel &bull; only your 5-person squad can see this</span>
        </div>
        ${msgs}
      </div>

      <div style="padding:16px 32px;border-top:1px solid #3f3f3f;background-color:#181818;flex-shrink:0;">
        <div style="background-color:#121212;border:1px solid #454545;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:12px;">
          <input type="text" id="campfire-input" placeholder="Message #group-feed..." style="flex:1;background:transparent;border:none;color:#ffffff;font-size:13px;outline:none;">
          <button onclick="window._campfireSend()" style="background-color:#16a34a;color:#ffffff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Send</button>
        </div>
      </div>
    </div>

    <!-- Members + Hashtag To-Dos + Forums Panel — sticky, scrollable -->
    <aside style="width:320px;background-color:#181818;border-left:1px solid #3f3f3f;display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;">
      <div style="flex:1;overflow-y:auto;">
        <!-- Forums -->
        <div style="padding:20px;border-bottom:1px solid #3a3a3a;">
          <h3 style="font-size:11px;font-weight:800;color:#f59e0b;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:.8px;">Forums</h3>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${(typeof GROUP_ROOMS!=='undefined'?GROUP_ROOMS:[]).map(r=>`
            <a href="javascript:void(0)" onclick="toast('Switched to ${r.name}')" style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:${r.id==='daily-standup'?'#262626':'transparent'};border:1px solid ${r.id==='daily-standup'?'#3a3a3a':'transparent'};border-radius:6px;text-decoration:none;">
              <span style="color:${r.id==='daily-standup'?'#4ade80':'#a3a3a3'};font-size:13px;font-weight:800;">${r.name}</span>
              <span style="font-size:11px;color:#737373;margin-left:auto;">${r.id==='daily-standup'?'● live':''}</span>
            </a>
            <div style="font-size:11px;color:#737373;padding-left:10px;margin-top:-4px;margin-bottom:4px;">${r.desc}</div>
            `).join('')}
          </div>
        </div>
        <!-- Hashtag To-Dos moved from portal overview -->
        <div style="padding:20px;border-bottom:1px solid #3a3a3a;">
          <h3 style="font-size:11px;font-weight:800;color:#f59e0b;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:.8px;">Hashtag To-Dos</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            ${TODO_GROUPS.flatMap(g=>g.items).map(([k,label])=>{
              const done = (state.todoDone||{})[k];
              return `<button onclick="window._toggleTodo('${k}')" style="background:${done?'#14532d':'#262626'};border:1px solid ${done?'#16a34a':'#3a3a3a'};color:${done?'#4ade80':'#e5e5e5'};padding:6px 12px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;">#${k} ${done?'✓':''}</button>`;
            }).join('')}
          </div>
          <div style="font-size:11px;color:#8a8a8a;line-height:1.5;">Click a hashtag to mark deliverable complete. Hashtags appear in chat when you mention them.</div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;">
            ${TODO_GROUPS.map(g=>`
              <div style="font-size:12px;font-weight:700;color:${g.color};display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:${g.color};display:inline-block;"></span>${g.title}</div>
              <div style="display:flex;flex-direction:column;gap:4px;padding-left:14px;">
                ${g.items.map(([k,l])=>`<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#d4d4d4;cursor:pointer;"><input type="checkbox" ${((state.todoDone||{})[k]?'checked':'')} onchange="window._toggleTodo('${k}')" style="accent-color:#16a34a;width:14px;height:14px;"> #${k} — ${l}</label>`).join('')}
              </div>
            `).join('')}
          </div>
        </div>
        <!-- Members -->
        <div style="padding:20px;border-bottom:1px solid #3a3a3a;">
          <h3 style="font-size:11px;font-weight:800;color:#a3a3a3;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:.8px;">Members — 4/5 online</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${GROUP_MEMBERS.map(mem=>`
            <div class="member-row">
              <div class="member-ava" style="background-color:${mem.color};">${mem.init}<span class="member-dot" style="background-color:${mem.online?'#4ade80':'#525252'};"></span></div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#e5e5e5;">${mem.name}</div>
                <div style="font-size:11px;color:#8a8a8a;">${mem.role}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div style="padding:16px;border-top:1px solid #3a3a3a;flex-shrink:0;background:#181818;position:sticky;bottom:0;">
        <a href="#p/group/brief" style="display:block;background-color:#d97706;color:#ffffff;text-align:center;padding:12px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">Open Project Brief</a>
      </div>
    </aside>

  </div>`;
}

/* ── Mandate Project: private solo progress log ── */
function viewSoloLog(){
  const proj = getProject('mandate');
  const msgs = roomMsgs('mandate').map(chatMsgHtml).join('');
  return `
  <div style="flex:1;display:flex;overflow:hidden;background-color:#121212;">

    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:14px 32px;border-bottom:1px solid #3f3f3f;display:flex;align-items:center;justify-content:space-between;background-color:#181818;flex-shrink:0;gap:12px;">
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:17px;font-weight:800;color:#ffffff;">Personal Progress Log</span>
            ${bookmarkStar()}
          </div>
          <p style="font-size:12px;color:#8a8a8a;margin:2px 0 0 0;">${proj.name}${projModeChip()} &mdash; no team, no crowd. Log what you shipped today.</p>
        </div>
        <a href="#p/${currentProjectId}/home" style="font-size:11px;font-weight:800;color:#c6c6c6;text-decoration:none;border:1px solid #454545;padding:5px 10px;border-radius:6px;white-space:nowrap;">Main Portal</a>
      </div>

      <div id="chat-scroll" style="flex:1;overflow-y:auto;padding:24px 32px;">
        <div id="campfire-stream" style="max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
          ${msgs}
        </div>
      </div>

      <div style="padding:14px 32px;border-top:1px solid #3f3f3f;background-color:#181818;flex-shrink:0;">
        <div style="max-width:780px;margin:0 auto;background-color:#121212;border:1px solid #454545;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:12px;">
          <input type="text" id="campfire-input" placeholder="Log today's progress..." style="flex:1;background:transparent;border:none;color:#ffffff;font-size:13px;outline:none;">
          <button onclick="window._campfireSend()" style="background-color:#2563eb;color:#ffffff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Log Entry</button>
        </div>
      </div>
    </div>

    <aside style="width:300px;background-color:#181818;border-left:1px solid #3f3f3f;display:flex;flex-direction:column;flex-shrink:0;">
      <div style="padding:20px;border-bottom:1px solid #2e2e2e;">
        <h4 style="font-size:13px;font-weight:800;color:#ffffff;margin:0 0 8px 0;">Solo Discipline</h4>
        <p style="font-size:12px;color:#c6c6c6;line-height:1.5;margin:0;">Visible only to you and reviewed during final mandate evaluation. Consistent entries count toward your readiness score.</p>
      </div>
      <div style="padding:20px;">
        <a href="#p/mandate/docs-vault" style="display:block;background-color:#d97706;color:#ffffff;text-align:center;padding:12px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">Proceed to Docs &amp; Files</a>
      </div>
    </aside>

  </div>`;
}

function viewProjectHome(){
  const proj = getProject(currentProjectId);
  if(currentProjectId==='mandate') return viewMandateHome();
  if(currentProjectId==='group') return viewGroupHome();
  return viewSupportedHome();
}

/* ── Mandate Home: self-directed challenge ── */
/* ─── Portal Overview shell (Basecamp-style, dark theme) ─── */
function portalCard(title, actionHtml, bodyHtml){
  return `<div class="tool-card">
    <div class="card-header">
      <div class="card-title">${title}</div>
      ${actionHtml||''}
    </div>
    ${bodyHtml}
  </div>`;
}
function cardActionBtn(label, hash){
  return `<a class="card-action-btn" href="${hash}" style="text-decoration:none;">${label}</a>`;
}
function activityFeed(items){
  return `<div class="activity-feed">${items.map(a=>
    `<div class="activity-item"><div class="activity-dot"></div><div><span class="activity-date">${a.d}</span> ${a.t}</div></div>`
  ).join('')}</div>`;
}
/* ═══ PORTAL OVERVIEW HOME — Main Dashboard p-card Pattern ═══ */
const ICON_SVGS = {
  'user-check':'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3A4 4 0 0112.5 7a4 4 0 01-4 4A4 4 0 014.5 7 4 4 0 018.5 3zm12 18v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'users':'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'folder':'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  'clipboard':'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  'award':'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'check':'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'chart':'M18 20V10M12 20V4M6 20v-6',
  'compass':'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm9.5-9.5l-7.5 4.5-4.5-7.5',
  'book':'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z',
  'layers':'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'tools':'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  'zap':'M13 2L3 14h9l-1 8 10-12h-9l1-8z'
};

function pCardIcon(iconSvg, colorClass){
  return `<div class="icobox ${colorClass||''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON_SVGS[iconSvg]||ICON_SVGS['folder']}"/></svg></div>`;
}

function projectPeopleBadge(){
  if(currentProjectId==='group') return '44 people';
  if(currentProjectId==='mandate') return 'You &bull; Solo Mandate';
  return 'Mentor group &bull; Cohort 001';
}

function peerMsgRow(m){
  return `<div class="message-item" onclick="location.hash='#p/${currentProjectId}/collaboration'">
    <div class="msg-avatar" style="background:${m.color||'#7c4a12'};">${(m.init||'ME')}</div>
    <div class="msg-content">
      <div class="msg-author">${m.name||'You'} &bull; ${m.time||''}</div>
      <div class="msg-title">${(m.text||'').split('\n')[0]}</div>
    </div>
  </div>`;
}

function peerReviewCard(){
  const msgs = roomMsgs().slice(-3).reverse();
  const sub = msgs.length ? msgs.length+' recent messages' : 'No messages yet';
  return `<div class="p-card">
    <div class="p-top">
      ${pCardIcon('users','blue')}
      <div class="p-txt"><div class="pt-title">Community</div><div class="pt-sub">${sub}</div></div>
      <span class="pt-pct blue">${msgs.length}</span>
    </div>
    <div class="p-bar blue"><i style="width:${Math.min(msgs.length*33,100)}%"></i></div>
    <div class="p-foot"><button class="btn-grad" onclick="location.hash='#p/${currentProjectId}/collaboration'">Open Chat</button></div>
  </div>`;
}

const TODO_GROUPS = [
  {title:'Weekly Deliverables', color:'#16a34a', items:[['pmo','PMO Meeting Minutes'],['wsr','Weekly Status Report']]},
  {title:'RAIDs & Issues Log', color:'#2563eb', items:[['raid','RAID Log Entry'],['issues','Issues Report']]}
];
function todosCard(){
  const done = state.todoDone || {};
  const total = TODO_GROUPS.reduce((s,g)=>s+g.items.length,0);
  const doneCount = TODO_GROUPS.reduce((s,g)=>s+g.items.filter(([k])=>done[k]).length,0);
  const pct = total ? Math.round(doneCount/total*100) : 0;
  return `<div class="p-card">
    <div class="p-top">
      ${pCardIcon('check','green')}
      <div class="p-txt"><div class="pt-title">To-dos</div><div class="pt-sub">${doneCount} of ${total} deliverables completed</div></div>
      <span class="pt-pct ${pct===100?'green':'amber'}">${pct}%</span>
    </div>
    <div class="p-bar${pct===100?' green':''}"><i style="width:${pct}%"></i></div>
    <div class="p-foot"><button class="btn-grad" onclick="location.hash='#p/${currentProjectId}/workspace'">Full Board</button></div>
  </div>`;
}

function toolsCard(){
  const tools = (typeof PROJECT_TOOLS!=='undefined' && PROJECT_TOOLS[currentProjectId]) || [];
  const cnt = tools.length;
  return `<div class="p-card">
    <div class="p-top">
      ${pCardIcon('tools','amber')}
      <div class="p-txt"><div class="pt-title">Tools / Templates Workspace</div><div class="pt-sub">${cnt} tool${cnt===1?'':'s'} assigned</div></div>
      <span class="pt-pct amber">${cnt}</span>
    </div>
    <div class="p-bar"><i style="width:100%"></i></div>
    <div class="p-foot"><button class="btn-grad" onclick="location.hash='#p/${currentProjectId}/workspace'">Open Workspace</button></div>
  </div>`;
}

function docsFilesCard(){
  const tree = vTree();
  const cnt = tree.length;
  return `<div class="p-card">
    <div class="p-top">
      ${pCardIcon('folder','amber')}
      <div class="p-txt"><div class="pt-title">Docs &amp; Files</div><div class="pt-sub">${cnt} root folder${cnt===1?'':'s'} in vault</div></div>
      <span class="pt-pct amber">${cnt}</span>
    </div>
    <div class="p-bar"><i style="width:100%"></i></div>
    <div class="p-foot"><button class="btn-grad" onclick="location.hash='#p/${currentProjectId}/docs-vault'">Open Vault</button></div>
  </div>`;
}

function briefCard(t){
  return `<div class="p-card">
    <div class="p-top">
      ${pCardIcon('clipboard','purple')}
      <div class="p-txt"><div class="pt-title">Brief &amp; Objectives</div><div class="pt-sub">3 core objectives &bull; Deadline ${(t.project.deadline||'TBD')}</div></div>
      <span class="pt-pct purple">${t.progress||0}%</span>
    </div>
    <div class="p-bar purple"><i style="width:${t.progress||0}%"></i></div>
    <div class="p-foot"><button class="btn-grad" onclick="location.hash='#p/${currentProjectId}/brief'">Open Brief</button></div>
  </div>`;
}

function finalAssessmentCard(){
  return `<div class="p-card">
    <div class="p-top">
      ${pCardIcon('award','green')}
      <div class="p-txt"><div class="pt-title">Final Assessment</div><div class="pt-sub">Validate project knowledge and readiness</div></div>
      <span class="pt-pct green">0%</span>
    </div>
    <div class="p-bar green"><i style="width:0%"></i></div>
    <div class="p-foot"><button class="btn-green" onclick="window._openGate()">Start Final Assessment</button></div>
  </div>`;
}

/* ── Tool Workspace with Template Dropdowns ── */
function toolsTemplateRow(t){
  const tpls = (typeof TOOL_TEMPLATES!=='undefined' && TOOL_TEMPLATES[t.id]) || [];
  const toggleId = 'tpl-'+t.id;
  return `<div class="tool-row">
    <div class="tool-icon" style="background:linear-gradient(135deg,${t.grad||'#333,#555'});">${t.icon}</div>
    <div class="tool-info"><div class="tool-info-name">${t.name}</div><div class="tool-info-cat">${t.category||''}</div></div>
    ${tpls.length?`<button class="tpl-toggle" id="${toggleId}-btn" onclick="window._toggleToolTemplates('${t.id}')">Templates <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></button>`:''}
  </div>
  ${tpls.length?`<div class="tpl-dropdown" id="${toggleId}-list">
    ${tpls.map(tpl=>`<div class="tpl-item" onclick="toast('Downloading ${tpl.name}.${tpl.ext}')">
      <span class="tpl-badge ${tpl.ext}">${tpl.ext.toUpperCase()}</span>
      <span style="flex:1;">${tpl.name}.${tpl.ext}</span>
      <span style="color:#737373;font-size:11px;">${tpl.size}</span>
    </div>`).join('')}
  </div>`:''}`;
}
window._toggleToolTemplates = function(id){
  const list = document.getElementById('tpl-'+id+'-list');
  const btn = document.getElementById('tpl-'+id+'-btn');
  if(list) list.classList.toggle('open');
  if(btn) btn.classList.toggle('open');
};

function viewProjectHome(){
  const proj = getProject(currentProjectId);
  const t = getTrack(currentTrackId);
  const overallPct = Math.round(t.project.phases.reduce((a,p)=>a+p.progress,0)/t.project.phases.length);
  const msgs = roomMsgs().slice(-3).reverse();
  const docsCnt = vTree().length;
  const tools = (typeof PROJECT_TOOLS!=='undefined' && PROJECT_TOOLS[currentProjectId]) || [];
  // Card config keeping CONTENT but using EXACT Day 1 snippet design pixel-by-pixel
  const cards = [
    {
      img:'assets/cards/collaboration.jpg',
      icon:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      title:'Community',
      desc: msgs.length ? `Share approaches, ask questions and review cohort peer work. ${msgs.length} recent messages in community.` : 'Share approaches, ask questions and review cohort peer work in the community feed.',
      barLabel:'Participation',
      barValue: msgs.length ? msgs.length+' messages' : '80%',
      barPct: Math.min(msgs.length*33,100) || 80,
      barColor: '#16a34a',
      btnLabel:'Open Community',
      btnAction:`location.hash='#p/${currentProjectId}/collaboration'`
    },
    {
      img:'assets/cards/workspace.jpg',
      icon:'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.5-.4.5-1.1 0-1.3z',
      title:'Tools / Templates Workspace',
      desc:`Interactive spreadsheet, code editor or wireframe sandbox for your track. ${tools.length} tool${tools.length===1?'':'s'} assigned.`,
      barLabel:'Completion',
      barValue:'60%',
      barPct:60,
      barColor:'#16a34a',
      btnLabel:'Open Workspace',
      btnAction:`location.hash='#p/${currentProjectId}/workspace'`
    },
    {
      img:'assets/cards/deliverables.jpg',
      icon:'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
      title:'Docs & Files',
      desc:`Upload completed project artifacts for mentor evaluation. ${docsCnt} root folder${docsCnt===1?'':'s'} in vault.`,
      barLabel:'Uploaded',
      barValue: docsCnt+' folders',
      barPct:75,
      barColor:'#d97706',
      btnLabel:'Open Vault',
      btnAction:`location.hash='#p/${currentProjectId}/docs-vault'`
    },
    {
      img:'assets/cards/brief.jpg',
      icon:'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
      title:'Brief & Objectives',
      desc:'Review the full project scope, objectives and professional standard requirements. 3 core objectives.',
      barLabel:'Milestones',
      barValue:'2/4',
      barPct:50,
      barColor:'#d97706',
      btnLabel:'Open Brief',
      btnAction:`location.hash='#p/${currentProjectId}/brief'`
    },
    {
      img:'assets/cards/quiz.jpg',
      icon:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      title:'Final Assessment',
      desc:'Final 5-step assessment to validate your project knowledge and readiness. Earn certification on completion.',
      barLabel:'Quiz Progress',
      barValue:'Pending',
      barPct:0,
      barColor:'#d97706',
      btnLabel:'Start Quiz',
      btnAction:`window._openGate()`
    }
  ];

  const cardsHtml = cards.map(c=>`
        <div style="background-color: #181818; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="width: 100%; height: 140px; background-color: #262626; position: relative; overflow: hidden;">
              <img src="${c.img}" alt="${c.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
              <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.25);"></div>
            </div>
            <div style="padding: 20px;">
              <div style="width: 48px; height: 48px; background-color: #26170b; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg style="width: 24px; height: 24px; fill: #d97706;" viewBox="0 0 24 24"><path d="${c.icon}"/></svg>
              </div>
              <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">${c.title}</h3>
              <p style="font-size: 13px; color: #a3a3a3; line-height: 1.5; margin: 0 0 16px 0;">${c.desc}</p>
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #a3a3a3; margin-bottom: 6px;">
                  <span>${c.barLabel}</span>
                  <span>${c.barValue}</span>
                </div>
                <div style="width: 100%; height: 4px; background-color: #2a2a2a; border-radius: 2px; overflow: hidden;">
                  <div style="width: ${c.barPct}%; height: 100%; background-color: ${c.barColor};"></div>
                </div>
              </div>
            </div>
          </div>
          <div style="padding: 16px 20px; background-color: #161616; border-top: 1px solid #2a2a2a;">
            <button onclick="${c.btnAction}" style="width: 100%; background-color: #16a34a; color: #ffffff; border: none; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">${c.btnLabel}</button>
          </div>
        </div>`).join('');

  return `
  <div style="flex: 1; display: flex; flex-direction: column; background-color: #121212; overflow-y: auto;">
    <div style="padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box;">
      <div style="margin-bottom: 24px; border-bottom: 1px solid #2a2a2a; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 4px 0;">${proj.name} Overview</h1>
          <p style="font-size: 13px; color: #a3a3a3; margin: 0;">${proj.name} &bull; Cohort 001 &bull; In-House Project</p>
        </div>
        <div style="background-color: #181818; border: 1px solid #2a2a2a; padding: 8px 14px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 12px; color: #a3a3a3;">Overall Day Progress</span>
          <div style="width: 100px; height: 6px; background-color: #2a2a2a; border-radius: 3px; overflow: hidden;">
            <div style="width: ${overallPct}%; height: 100%; background-color: #d97706;"></div>
          </div>
          <span style="font-size: 12px; font-weight: 600; color: #d97706;">${overallPct}%</span>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        ${cardsHtml}
      </div>
    </div>
  </div>`;
}

function viewMandateHome(){ return viewProjectHome(); }
function viewGroupHome(){ return viewProjectHome(); }
function viewSupportedHome(){ return viewProjectHome(); }


function getNextStatus(status){
  const order = ['backlog','progress','review','done'];
  const i = order.indexOf(status);
  return i>=0 && i<order.length-1 ? order[i+1] : status;
}

/* ─── Live search filter helper ─── */
window._filterRows = function(listId, q){
  const norm = (q||'').trim().toLowerCase();
  const list = document.getElementById(listId);
  if(!list) return;
  let shown = 0;
  Array.from(list.children).forEach(el=>{
    const name = el.getAttribute('data-name');
    if(name===null) return;
    const show = !norm || name.indexOf(norm)>-1;
    el.style.display = show?'':'none';
    if(show) shown++;
  });
  const empty = document.getElementById(listId+'-empty');
  if(empty) empty.style.display = shown===0 ? '' : 'none';
};

/* ═══ DOCS & FILES VAULT — LONG FOLDER STRUCTURE TREE (reference/01 pattern) ═══ */
window._treeOpen = window._treeOpen || {};

function vaultTreeRow(node, parentKey, depth){
  const isFolder = node.kind==='folder';
  const isDoc = node.kind==='doc';
  const open = !!window._treeOpen[node.id];
  const iconPath = isFolder ? 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z'
    : isDoc ? 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z'
    : 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48';
  const openHash = isFolder ? ('#p/'+currentProjectId+'/vault/'+node.id)
    : isDoc ? ('#p/'+currentProjectId+'/doc-editor/'+node.id) : null;
  const kids = node.children || [];
  const sub = isFolder ? (kids.length===1?'1 item':kids.length+' items') : (node.meta||'File');
  const actions = node.locked
    ? `<span class="lock-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>LOCKED</span>`
    : `
      <button class="action-btn" title="Actions" onclick="event.stopPropagation();window._toggleItemMenu(event,'${node.id}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </button>
      <div class="item-action-menu" id="item-menu-${node.id}" onclick="event.stopPropagation();">
        <button onclick="window._renameItem('${parentKey}','${node.id}')"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Rename</button>
        <button onclick="window._copyItem('${parentKey}','${node.id}')"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</button>
        <button onclick="window._moveItem('${parentKey}','${node.id}')"><svg viewBox="0 0 24 24"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>Move</button>
        <button class="delete-btn" onclick="window._deleteItem('${parentKey}','${node.id}')"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>Delete</button>
      </div>`;
  const rowClick = isFolder
    ? `window._toggleTreeBranch('${node.id}')`
    : (openHash?`location.hash='${openHash}'`:'');
  const depthCls = depth===0?' d0':depth===1?' d1':' d2';
  const curHash = isFolder ? ('#p/'+currentProjectId+'/vault/'+node.id) : isDoc ? ('#p/'+currentProjectId+'/doc-editor/'+node.id) : null;
  const isActive = curHash && location.hash===curHash;
  const activeCls = isActive ? (isDoc?' active-doc':' active-folder') : '';
  return `
  <div class="tree-row${open?' expanded':''}${node.locked?' is-locked':''}${depthCls}${activeCls}" data-id="${node.id}" data-name="${(node.name||'').toLowerCase()}" style="margin-left:${depth*16}px;" onclick="${rowClick}">
    <div class="tree-main">
      ${isFolder?`<svg class="tw-chev${open?' rot':''}" viewBox="0 0 24 24" fill="#a3a3a3"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`:'<span class="tw-spacer"></span>'}
      <span class="tree-icon ti-${node.kind}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${iconPath}"/></svg></span>
      <span class="tree-name">${node.name}</span>
      <span class="tree-meta">${sub}</span>
    </div>
    <div class="tree-actions">${actions}</div>
  </div>
  ${isFolder?`<div class="tree-kids${open?'':' closed'}" id="tree-kids-${node.id}">${kids.map(k=>vaultTreeRow(k,node.id,depth+1)).join('')}</div>`:''}`;
}

window._toggleTreeBranch = function(id){
  window._treeOpen[id] = !window._treeOpen[id];
  route();
};

function vaultToolbar(showNew){
  const search = `<input type="text" placeholder="Filter structure..." oninput="window._filterVault(this.value)" style="background-color:#181818;border:1px solid #454545;color:#ffffff;padding:10px 14px;border-radius:8px;width:220px;font-size:13px;outline:none;">`;
  const newBtn = showNew===false ? '' : `
        <div style="position:relative;">
          <button onclick="event.stopPropagation(); window._toggleNewItemMenu(event);" style="background-color:#d97706;color:#ffffff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> New &#9662;
          </button>
          <div id="new-item-menu" class="new-item-menu vmenu">
            <div class="vmenu-label">Create / Upload</div>
            <button class="new-item-btn vmenu-btn" onclick="window._newItemAction('folder')"><svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>New Folder</button>
            <button class="new-item-btn vmenu-btn" onclick="window._newItemAction('doc')"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>New Document</button>
            <button class="new-item-btn vmenu-btn" onclick="window._newItemAction('local')"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Upload from Device</button>
            <button class="new-item-btn vmenu-btn" onclick="window._newItemAction('drive')"><svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>Google Drive</button>
            <button class="new-item-btn vmenu-btn" onclick="window._newItemAction('dropbox')"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8m-4-4h8"/></svg>Dropbox</button>
          </div>
        </div>`;
  return `<div style="display:flex;align-items:center;gap:12px;">${search}${newBtn}</div>`;
}

function viewVault(){
  currentVaultFolderId = 'root';
  const proj = getProject(currentProjectId);
  const rootItems = vTree();
  const folderIcons = rootItems.map((n,i)=>{
    const cnt = (n.children||[]).length;
    const isLocked = !!n.locked;
    const color = isLocked ? '#404040' : '#d97706';
    return `<div style="background-color: #181818; border: 2px solid #3a3a3a; border-radius: 10px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; position: relative;">
      <div style="display: flex; align-items: center; gap: 16px; cursor: pointer; flex: 1;" onclick="location.hash='#p/${currentProjectId}/vault/${n.id}'">
        <div style="width: 42px; height: 42px; background-color: ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">${ICO.folder}</div>
        <div>
          <h3 style="font-size: 16px; font-weight: 900; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;">${n.name} ${isLocked ? ICO.lock+' (Locked)' : ''}</h3>
          <span style="font-size: 13px; font-weight: 700; color: #c0c0c0;">${cnt} items</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <span style="font-size: 14px; color: #f59e0b; font-weight: 900; cursor: pointer;" onclick="location.hash='#p/${currentProjectId}/vault/${n.id}'">Open &gt;</span>
        ${!isLocked ? `<button style="background: none; border: none; color: #ffffff; font-size: 18px; font-weight: 900; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onclick="event.stopPropagation(); window._toggleVaultMenu && window._toggleVaultMenu('${n.id}') || (()=>{
          const m=document.getElementById('h-menu-${n.id}');
          if(m) m.style.display = m.style.display==='block'?'none':'block';
          document.querySelectorAll('[id^=&quot;h-menu-&quot;]').forEach(e=>{ if(e.id!=='h-menu-${n.id}') e.style.display='none'; });
        })()">⋮</button><div id="h-menu-${n.id}" style="display: none; position: absolute; right: 24px; top: 60px; background-color: #1c1c1c; border: 2px solid #3a3a3a; border-radius: 8px; width: 160px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 50;"><div onclick="window._renameItem('root','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display:flex;align-items:center;gap:8px;">${ICO.pencil} Rename</div><div onclick="window._copyItem('root','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display:flex;align-items:center;gap:8px;">${ICO.copy} Copy</div><div onclick="window._moveItem('root','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display:flex;align-items:center;gap:8px;">${ICO.box} Move</div><div onclick="window._deleteItem('root','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ef4444; cursor: pointer; display:flex;align-items:center;gap:8px;">${ICO.trash} Delete</div></div>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
  <div style="display: flex; height: 100vh; background-color: #121212; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; overflow: hidden; margin: 0;">

    <!-- MAIN VAULT FILE SYSTEM CANVAS — pixel-perfect from reference/13-docs-vault.html -->
    <div style="flex: 1; display: flex; flex-direction: column; background-color: #121212; overflow: hidden;">

      <!-- UTTERMOST TOP: Status Bar -->
      <div style="background-color: #181818; border-bottom: 2px solid #3a3a3a; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
          <svg style="width: 20px; height: 20px; fill: #d97706;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
          <span style="font-size: 14px; font-weight: 800; color: #ffffff; white-space: nowrap;" id="path-breadcrumb-top">Docs &amp; Files</span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; font-size: 13px; font-weight: 700; color: #d4d4d4;">
          <span>Vault System</span>
          <span style="color: #f59e0b; font-weight: 800;" id="breadcrumb-status">Parent Folders</span>
        </div>
      </div>

      <!-- INNER WORKSPACE SPLIT: Left File Explorer | Right Context Panel -->
      <div style="flex: 1; display: flex; overflow: hidden;">

        <!-- BIG CANVAS: File System View -->
        <div style="flex: 1; padding: 36px 52px; overflow-y: auto; background-color: #121212;">
          <div style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px;">

            <!-- Top Title & Toolbar Section -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #3a3a3a; padding-bottom: 24px;">
              <div>
                <div id="breadcrumb-display" style="font-size: 12px; font-weight: 800; color: #d97706; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.8px;">Docs &amp; Files</div>
                <h1 id="vault-title" style="font-size: 32px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.5px;">Docs &amp; Files</h1>
                <p id="vault-subtitle" style="font-size: 14px; font-weight: 700; color: #c0c0c0; margin: 0;">Organized project vault containing all phase deliverables and reference materials.</p>
              </div>
              <div style="position: relative; display: inline-block;">
                <button onclick="event.stopPropagation(); window._toggleNewItemMenu(event)" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-size: 14px; font-weight: 800; box-shadow: 0 4px 16px rgba(37,99,235,0.4); border: 1px solid #3b82f6; cursor: pointer;">
                  + New... ▼
                </button>
                <div id="new-item-menu" class="new-item-menu vmenu" style="display: none; position: absolute; right: 0; top: 50px; background-color: #1c1c1c; border: 2px solid #3a3a3a; border-radius: 8px; width: 220px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 100; overflow: hidden;">
                  <div onclick="window._newItemAction('folder')" style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; gap: 10px;">${ICO.folder} New Folder</div>
                  <div onclick="window._newItemAction('doc')" style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; gap: 10px;">${ICO.doc} New Document</div>
                  <div onclick="window._newItemAction('local')" style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; gap: 10px;">${ICO.laptop} Upload from Device</div>
                  <div onclick="window._newItemAction('drive')" style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; gap: 10px;">${ICO.cloud} Google Drive</div>
                  <div onclick="window._newItemAction('dropbox')" style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #ffffff; cursor: pointer; display: flex; align-items: center; gap: 10px;">${ICO.box} Dropbox</div>
                </div>
              </div>
            </div>

            <!-- Filter Toolbar Row -->
            <div id="subfolder-toolbar" style="display: none; gap: 14px; align-items: center; font-size: 13px; font-weight: 700; color: #d4d4d4; flex-wrap: wrap;">
              <span style="background-color: #262626; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-weight: 800; border: 1px solid #404040;">All files</span>
              <span style="padding: 6px 10px; cursor: pointer;">Images</span>
              <span style="padding: 6px 10px; cursor: pointer;">Docs</span>
              <span style="padding: 6px 10px; cursor: pointer;">File type v</span>
              <span style="padding: 6px 10px; cursor: pointer;">Sort manually v</span>
              <button onclick="location.hash='#p/${currentProjectId}/docs-vault'" style="margin-left: auto; background-color: #262626; color: #f59e0b; border: 1px solid #404040; padding: 6px 14px; border-radius: 6px; font-weight: 900; cursor: pointer;">&lt; Back to Parent Folders</button>
            </div>

            <!-- FOLDERS LIST CONTAINER -->
            <div id="folders-container" style="display: flex; flex-direction: column; gap: 10px;">
              ${folderIcons}
            </div>

          </div>
        </div>

        <!-- RIGHT HAND PANEL: Vault Guidelines & Navigation -->
        <div style="width: 340px; background-color: #181818; border-left: 2px solid #3a3a3a; display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto; flex-shrink: 0;">
          <div style="padding: 24px;">
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: 900; color: #ffffff; margin: 0 0 6px 0;">Vault Navigation</h3>
              <p id="right-panel-subtitle" style="font-size: 13px; font-weight: 700; color: #c0c0c0; margin: 0;">Parent Folders View</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; font-weight: 700; color: #d4d4d4; margin-bottom: 32px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" checked style="accent-color: #16a34a; width: 16px; height: 16px;"> Browse Parent Folders
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" id="chk-mandate" style="accent-color: #d97706; width: 16px; height: 16px;"> Open MANDATE ANALYSIS
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" id="chk-doc" style="accent-color: #d97706; width: 16px; height: 16px;"> Create/Rename Folder or Doc
              </label>
            </div>
            <div style="border-top: 2px solid #3a3a3a; padding-top: 20px;">
              <h4 style="font-size: 14px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0;">File System Controls</h4>
              <p style="font-size: 13px; font-weight: 700; color: #c0c0c0; line-height: 1.6; margin: 0;">Use the <strong>+ New...</strong> menu to create nested folders or documents. Click the 3-dot hamburger menu on any folder to rename, copy, move, or delete.</p>
            </div>
          </div>
          <div style="padding: 24px; background-color: #161616; border-top: 2px solid #3a3a3a;">
            <button onclick="location.hash='#p/${currentProjectId}/workspace'" style="width: 100%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; border: 1px solid #f59e0b; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(217, 119, 6, 0.4);">
              <span>Proceed to Tool Workspace</span>
              <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

/* ═══ SUBFOLDER VIEW — vault reference layout, rooted at current folder ═══ */
function viewFolder(folderId){
  currentVaultFolderId = folderId;
  const proj = getProject(currentProjectId);
  const hit = vFind(folderId);
  if(!hit || hit.node.kind!=='folder'){
    return `<div style="flex:1;display:flex;align-items:center;justify-content:center;height:100vh;background:#121212;">
      <div style="text-align:center;">
        <p style="color:#ffffff;font-size:18px;font-weight:800;margin:0 0 8px 0;">Folder not found</p>
        <p style="color:#8a8a8a;font-size:13px;margin:0 0 16px 0;">It may have been deleted or moved.</p>
        <a href="#p/${currentProjectId}/docs-vault" style="color:#f59e0b;font-weight:800;font-size:13px;">&larr; Back to Docs &amp; Files</a>
      </div></div>`;
  }
  const meta = hit.node;
  const locked = !!meta.locked;
  const sealed = !!meta.sealed;
  const kids = meta.children || [];

  /* build breadcrumb path — pixel-perfect from reference/13 */
  const crumbs = [{id:'root',name:'Docs &amp; Files'}];
  const chain = hit.chain || [];
  chain.forEach(n => { if(n.id !== folderId) crumbs.push({id:n.id,name:n.name}); });
  crumbs.push({id:folderId,name:meta.name});
  const fullPathStr = crumbs.map(c=>c.name.replace(/&amp;/g,'&')).join(' / ');
  const crumbHtml = crumbs.map((c,i)=>{
    if(i===crumbs.length-1) return `<span style="color:#f59e0b;font-weight:800;">${c.name}</span>`;
    const href = c.id==='root' ? `#p/${currentProjectId}/docs-vault` : `#p/${currentProjectId}/vault/${c.id}`;
    return `<a href="${href}" style="color:#a3a3a3;text-decoration:none;font-weight:600;">${c.name}</a>`;
  }).join('<span style="color:#404040;margin:0 4px;">/</span>');

  return `
  <div style="display: flex; height: 100vh; background-color: #121212; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; overflow: hidden; margin: 0;">

    <!-- MAIN VAULT FILE SYSTEM CANVAS — subfolder pixel-perfect from reference/13 -->
    <div style="flex: 1; display: flex; flex-direction: column; background-color: #121212; overflow: hidden;">

      <!-- UTTERMOST TOP: Status Bar -->
      <div style="background-color: #181818; border-bottom: 2px solid #3a3a3a; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
          <svg style="width: 20px; height: 20px; fill: #d97706;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
          <span style="font-size: 14px; font-weight: 800; color: #ffffff; white-space: nowrap;" id="path-breadcrumb-top">${fullPathStr}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; font-size: 13px; font-weight: 700; color: #d4d4d4;">
          <span>Vault System</span>
          <span style="color: #f59e0b; font-weight: 800;" id="breadcrumb-status">Subfolder View</span>
        </div>
      </div>

      <!-- INNER WORKSPACE SPLIT: Left File Explorer | Right Context Panel -->
      <div style="flex: 1; display: flex; overflow: hidden;">

        <!-- BIG CANVAS: File System View -->
        <div style="flex: 1; padding: 36px 52px; overflow-y: auto; background-color: #121212;">
          <div style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px;">

            <!-- Breadcrumb (secondary, for navigation) -->
            <div style="font-size:13px;color:#a3a3a3;display:flex;align-items:center;gap:4px;">${crumbHtml}</div>

            <!-- Top Title & Toolbar Section -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #3a3a3a; padding-bottom: 24px;">
              <div>
                <div id="breadcrumb-display" style="font-size: 12px; font-weight: 800; color: #d97706; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.8px;">${fullPathStr}</div>
                <h1 id="vault-title" style="font-size: 32px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.5px;">${meta.name}${locked?' <span style="font-size:12px;font-weight:800;color:#ef4444;vertical-align:middle;">'+ICO.lock+' LOCKED</span>':''}${sealed?' <span style="font-size:11px;font-weight:800;color:#f59e0b;background:#26170b;border:1px solid #7c4a12;padding:3px 8px;border-radius:999px;vertical-align:middle;">READ-ONLY</span>':''}</h1>
                <p id="vault-subtitle" style="font-size: 14px; font-weight: 700; color: #c0c0c0; margin: 0;">Viewing contents inside ${fullPathStr} &bull; ${kids.length} item${kids.length===1?'':'s'}</p>
              </div>
              ${vaultToolbar(!sealed)}
            </div>

            ${sealed?'':`<input type="file" multiple id="local-picker-${folderId}" style="display:none" onchange="window._localFilesPicked(this.files)">`}

            <!-- Filter Toolbar Row — visible in subfolder -->
            <div id="subfolder-toolbar" style="display: flex; gap: 14px; align-items: center; font-size: 13px; font-weight: 700; color: #d4d4d4; flex-wrap: wrap;">
              <span style="background-color: #262626; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-weight: 800; border: 1px solid #404040;">All files</span>
              <span style="padding: 6px 10px; cursor: pointer;">Images</span>
              <span style="padding: 6px 10px; cursor: pointer;">Docs</span>
              <span style="padding: 6px 10px; cursor: pointer;">File type v</span>
              <span style="padding: 6px 10px; cursor: pointer;">Sort manually v</span>
              <button onclick="location.hash='#p/${currentProjectId}/docs-vault'" style="margin-left: auto; background-color: #262626; color: #f59e0b; border: 1px solid #404040; padding: 6px 14px; border-radius: 6px; font-weight: 900; cursor: pointer;">&lt; Back to Parent Folders</button>
            </div>

            <!-- Children rows — pixel-perfect from reference/13: itemCard 181818/3a3a3a 10px 18px 24px -->
            <div id="folders-container" style="display: flex; flex-direction: column; gap: 10px;">
            ${kids.length ? kids.map((n, idx)=>{
              const isFolder = n.kind==='folder';
              const isLocked = !!n.locked;
              const childCount = isFolder ? (n.children||[]).length : 0;
              const color = isLocked ? '#404040' : (isFolder ? '#d97706' : '#2563eb');
              const icon = isFolder ? ICO.folder : ICO.doc;
              const metaText = isFolder ? childCount+' items' : (n.meta||'doc');
              const href = isFolder ? `#p/${currentProjectId}/vault/${n.id}` : `#p/${currentProjectId}/doc-editor/${n.id}`;
              return `<div style="background-color: #181818; border: 2px solid #3a3a3a; border-radius: 10px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; position: relative;">
                <div style="display: flex; align-items: center; gap: 16px; cursor: pointer; flex: 1;" onclick="location.hash='${href}'">
                  <div style="width: 42px; height: 42px; background-color: ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">${icon}</div>
                  <div>
                    <h3 style="font-size: 16px; font-weight: 900; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;">${n.name} ${isLocked ? ICO.lock : ''}</h3>
                    <span style="font-size: 13px; font-weight: 700; color: #c0c0c0;">${metaText}</span>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 14px;">
                  ${isFolder ? `<span style="font-size: 14px; color: #f59e0b; font-weight: 900; cursor: pointer;" onclick="location.hash='${href}'">Open &gt;</span>` : `<span style="font-size: 12px; color: #a3a3a3; font-weight: 700;">${n.meta||''}</span>`}
                  ${!isLocked ? `<button style="background: none; border: none; color: #ffffff; font-size: 18px; font-weight: 900; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onclick="event.stopPropagation(); (()=>{ const m=document.getElementById('h-menu-${idx}'); if(m) m.style.display=m.style.display==='block'?'none':'block'; document.querySelectorAll('[id^=&quot;h-menu-&quot;]').forEach(e=>{ if(e.id!=='h-menu-${idx}') e.style.display='none'; }); })()">⋮</button><div id="h-menu-${idx}" style="display: none; position: absolute; right: 24px; top: 60px; background-color: #1c1c1c; border: 2px solid #3a3a3a; border-radius: 8px; width: 160px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 50;"><div onclick="window._renameItem('${folderId}','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display:flex;align-items:center;gap:8px;">${ICO.pencil} Rename</div><div onclick="window._copyItem('${folderId}','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display:flex;align-items:center;gap:8px;">${ICO.copy} Copy</div><div onclick="window._moveItem('${folderId}','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ffffff; cursor: pointer; border-bottom: 1px solid #2a2a2a; display:flex;align-items:center;gap:8px;">${ICO.box} Move</div><div onclick="window._deleteItem('${folderId}','${n.id}')" style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #ef4444; cursor: pointer; display:flex;align-items:center;gap:8px;">${ICO.trash} Delete</div></div>` : ''}
                </div>
              </div>`;
            }).join('') : `<div style="background-color:#181818; border:2px dashed #3a3a3a; border-radius:10px; padding:32px; text-align:center; color:#a3a3a3; font-weight:700;">This folder is empty. Use <b>+ New...</b> above to add folders or documents.</div>`}
            </div>

            ${sealed?'':`
            <div id="dz-${folderId}" style="margin-top:12px;border:2px dashed #454545;border-radius:12px;padding:36px;text-align:center;background-color:#161616;transition:border-color .15s,background .15s;">
              <p style="color:#ffffff;font-size:14px;font-weight:800;margin:0 0 6px 0;">Drop files here to upload into "${meta.name}"</p>
              <p style="color:#737373;font-size:12px;font-weight:600;margin:0;">or browse &bull; Supports .xlsx, .csv, .docx, .pdf, .png (Max: 25MB)</p>
            </div>`}

          </div>
        </div>

        <!-- RIGHT HAND PANEL: Vault Guidelines & Navigation — subfolder -->
        <div style="width: 340px; background-color: #181818; border-left: 2px solid #3a3a3a; display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto; flex-shrink: 0;">
          <div style="padding: 24px;">
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: 900; color: #ffffff; margin: 0 0 6px 0;">Vault Navigation</h3>
              <p id="right-panel-subtitle" style="font-size: 13px; font-weight: 700; color: #c0c0c0; margin: 0;">Subfolder Explorer</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; font-weight: 700; color: #d4d4d4; margin-bottom: 32px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" checked style="accent-color: #16a34a; width: 16px; height: 16px;"> Browse folder contents
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" style="accent-color: #d97706; width: 16px; height: 16px;"> ${sealed?'View reference documents':'Create new document'}
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" style="accent-color: #d97706; width: 16px; height: 16px;"> ${sealed?'Copy template for use':'Upload files from device'}
              </label>
            </div>
            <div style="border-top: 2px solid #3a3a3a; padding-top: 20px;">
              <h4 style="font-size: 14px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0;">File System Controls</h4>
              <p style="font-size: 13px; font-weight: 700; color: #c0c0c0; line-height: 1.6; margin: 0;">Use the <strong>+ New...</strong> menu to create nested folders or documents. Click the 3-dot hamburger menu on any item to rename, copy, move, or delete.</p>
            </div>
          </div>
          <div style="padding: 24px; background-color: #161616; border-top: 2px solid #3a3a3a;">
            <button onclick="location.hash='#p/${currentProjectId}/docs-vault'" style="width: 100%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; border: 1px solid #f59e0b; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(217, 119, 6, 0.4);">
              <span>Back to Parent Folders</span>
              <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

function bindFolderDropzone(folderId){
  const dz = document.getElementById('vault-dropzone');
  if(!dz) return;
  const picker = document.createElement('input');
  picker.type='file';
  picker.style.display='none';
  picker.multiple=true;
  document.body.appendChild(picker);
  dz.addEventListener('click', ()=>picker.click());
  picker.addEventListener('change', ()=>{ handleVaultFiles(picker.files, folderId); picker.value=''; });
  dz.addEventListener('dragover', e=>{ e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', ()=>dz.classList.remove('dragover'));
  dz.addEventListener('drop', e=>{ e.preventDefault(); dz.classList.remove('dragover'); handleVaultFiles(e.dataTransfer.files, folderId); });
}

function handleVaultFiles(files, key){
  if(!files || !files.length) return;
  const arr = vKids(key||'root');
  if(!arr) return;
  const destNode = (!key || key==='root') ? null : (vFind(key)||{}).node;
  if(destNode && destNode.sealed){ toast('This folder is read-only'); return; }
  const now = new Date();
  const stamp = now.toLocaleDateString([], {year:'numeric',month:'short',day:'numeric'})+' \u2022 Added just now';
  let added = 0;
  Array.from(files).forEach(f=>{
    if(f.size > 25*1024*1024){ toast(f.name+' exceeds the 25MB limit'); return; }
    arr.push({id:uid(),kind:'file',name:f.name,meta:(f.name.split('.').pop()||'FILE').toUpperCase()+' \u2022 '+fmtSize(f.size)+' \u2022 '+stamp});
    added++;
  });
  saveState();
  if(added){ toast(added+' file'+(added>1?'s':'')+' uploaded'); route(); }
}

function viewDocEditor(docId){
  const proj = getProject(currentProjectId);
  const hit = docId ? vFind(docId) : null;
  if(!hit || hit.node.kind!=='doc'){
    return `<div style="flex:1;display:flex;align-items:center;justify-content:center;height:100vh;background:#121212;">
      <div style="text-align:center;">
        <p style="color:#ffffff;font-size:18px;font-weight:800;margin:0 0 8px 0;">Document not found</p>
        <a href="#p/${currentProjectId}/docs-vault" style="color:#f59e0b;font-weight:800;font-size:13px;">&larr; Back to Docs &amp; Files</a>
      </div></div>`;
  }
  const node = hit.node;
  const docName = (node.name||'Untitled').replace(/\.docx$/,'');
  const docBody = node.body||'';
  const ro = !!node.locked;
  window._editorCtx = {docId: docId};

  return `
  <div style="display: flex; height: 100vh; background-color: #121212; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; overflow: hidden; margin: 0; font-weight: 500;">

    <!-- MAIN DOCUMENT EDITING PAGE CONTAINER — pixel-perfect from reference/15-document-editor.html -->
    <div style="flex: 1; display: flex; flex-direction: column; background-color: #121212; overflow: hidden;">

      <!-- UTTERMOST TOP: Status Bar -->
      <div style="background-color: #181818; border-bottom: 2px solid #3f3f46; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
          <svg style="width: 18px; height: 18px; fill: #f59e0b;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
          <span style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap;">${proj.name} || COMPLETED &bull; Docs &amp; Files &bull; ${ro ? 'View Document' : 'New Document'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; font-size: 13px; font-weight: 700; color: #e5e7eb;">
          ${ro ? `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.5px;color:#f59e0b;background-color:#26170b;border:1px solid #7c4a12;padding:6px 14px;border-radius:20px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>TEMPLATE &bull; VIEW ONLY</span>`
            : `<span onclick="window._editorAction('draft')" style="cursor: pointer; padding: 6px 12px; border: 1px solid #52525b; border-radius: 6px; background-color: #1f2937;">Save a draft</span>
          <span onclick="window._editorAction('post')" style="background-color: #2563eb; color: #ffffff; padding: 6px 16px; border-radius: 6px; font-weight: 800; cursor: pointer; border: 1px solid #3b82f6;">Post this doc</span>`}
        </div>
      </div>

      <!-- INNER WORKSPACE SPLIT: Left Document Canvas | Right Context Panel -->
      <div style="flex: 1; display: flex; overflow: hidden;">

        <!-- BIG CANVAS: Document Editor (Scrollable) -->
        <div style="flex: 1; padding: 40px 60px; overflow-y: auto; background-color: #121212;">
          <div style="max-width: 820px; margin: 0 auto; background-color: #181818; border: 2px solid #3f3f46; border-radius: 12px; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">

            <!-- Breadcrumb Path -->
            <div style="font-size: 13px; font-weight: 700; color: #9ca3af;">
              ${proj.name} || COMPLETED <span style="color: #f59e0b;">&lsaquo;</span> Docs &amp; Files
            </div>

            <!-- Document Title Input Area -->
            <div>
              <input id="doc-title" type="text" placeholder="Type a title..." value="${docName}" ${ro?'disabled':''} style="width: 100%; background: transparent; border: none; color: #ffffff; font-size: 28px; font-weight: 900; outline: none; border-bottom: 2px solid #52525b; padding-bottom: 12px;">
            </div>

            <!-- Formatting Toolbar -->
            <div style="display: flex; gap: 16px; align-items: center; border-bottom: 2px solid #3f3f46; padding-bottom: 14px; font-size: 15px; font-weight: 700; color: #e5e7eb; flex-wrap: wrap;">
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a; display:flex;align-items:center;gap:6px;" title="Image">${ICO.image} Image</span>
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a; display:flex;align-items:center;gap:6px;" title="Attach File">${ICO.attachment} File</span>
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a; font-weight: 900; color: #ffffff;" title="Bold">B</span>
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a; font-style: italic; color: #ffffff;" title="Italic">I</span>
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a; text-decoration: line-through;" title="Strikethrough">S</span>
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a;" title="Heading">H1/H2</span>
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a; display:flex;align-items:center;gap:6px;" title="Link">${ICO.link} Link</span>
              <span style="cursor: pointer; padding: 4px 8px; border: 1px solid #3f3f46; border-radius: 4px; background-color: #27272a;" title="List">&#9776; List</span>
            </div>

            <!-- Document Body Text Area -->
            <div>
              <textarea id="doc-body" ${ro?'readonly':''} placeholder="Type your document here..." style="width: 100%; height: 220px; background: #121212; border: 2px solid #3f3f46; border-radius: 8px; padding: 16px; color: #ffffff; font-size: 15px; font-weight: 600; font-family: inherit; outline: none; resize: vertical; line-height: 1.6;">${docBody}</textarea>
            </div>

            <!-- Notification Settings Section -->
            <div style="border-top: 2px solid #3f3f46; padding-top: 20px; display: flex; flex-direction: column; gap: 12px;">
              <span style="font-size: 15px; font-weight: 800; color: #ffffff;">When I post this, notify...</span>
              <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #f3f4f6; cursor: pointer;">
                <input type="radio" name="notify" checked style="accent-color: #2563eb; width: 16px; height: 16px;"> Only the 34 people who asked to be notified about this project
              </label>
              <div style="display: flex; gap: 6px; padding-left: 26px; align-items: center;">
                <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #059669; font-size: 11px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 1px solid #ffffff;">AA</div>
                <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #2563eb; font-size: 11px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 1px solid #ffffff;">AK</div>
                <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #d97706; font-size: 11px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 1px solid #ffffff;">ZA</div>
                <span style="font-size: 12px; font-weight: 700; color: #d1d5db; margin-left: 6px;">+31 others</span>
              </div>
              <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #f3f4f6; cursor: pointer; margin-top: 4px;">
                <input type="radio" name="notify" style="accent-color: #2563eb; width: 16px; height: 16px;"> Everyone I select...
              </label>
              <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #f3f4f6; cursor: pointer;">
                <input type="radio" name="notify" style="accent-color: #2563eb; width: 16px; height: 16px;"> No one
              </label>
            </div>

            <!-- Post & Save Actions -->
            <div style="display: flex; gap: 16px; align-items: center; border-top: 2px solid #3f3f46; padding-top: 20px;">
              ${ro ? `<div style="font-size:13px;color:#a3a3a3;font-weight:700;">This template is view-only. Use <span style="color:#f59e0b;">Copy</span> from the vault to create an editable version.</div>`
                : `<button onclick="window._editorAction('post')" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; border: 1px solid #60a5fa; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(37,99,235,0.4);">
                Post this doc
              </button>
              <button onclick="window._editorAction('draft')" style="background-color: #27272a; color: #ffffff; border: 2px solid #52525b; padding: 14px 24px; border-radius: 8px; font-size: 15px; font-weight: 800; cursor: pointer;">
                Save a draft
              </button>`}
            </div>

          </div>
        </div>

        <!-- RIGHT HAND PANEL: Editor Guidelines -->
        <div style="width: 320px; background-color: #181818; border-left: 2px solid #3f3f46; display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto; flex-shrink: 0;">
          <div style="padding: 24px;">
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0;">Document Editor</h3>
              <p style="font-size: 13px; font-weight: 600; color: #9ca3af; margin: 0;">Publishing Workspace</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; font-weight: 700; color: #e5e7eb; margin-bottom: 28px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" checked style="accent-color: #16a34a; width: 16px; height: 16px;"> Enter Document Title
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" checked style="accent-color: #16a34a; width: 16px; height: 16px;"> Format Rich Text Body
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" style="accent-color: #d97706; width: 16px; height: 16px;"> Configure Notifications
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" style="accent-color: #d97706; width: 16px; height: 16px;"> Post to Vault Queue
              </label>
            </div>
            <div style="border-top: 2px solid #3f3f46; padding-top: 20px;">
              <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">Mentor Visibility</h4>
              <p style="font-size: 13px; font-weight: 600; color: #9ca3af; line-height: 1.5; margin: 0;">Once posted, your document becomes immediately accessible to assigned mentors for evaluation.</p>
            </div>
          </div>
          <div style="padding: 20px; background-color: #161616; border-top: 2px solid #3f3f46;">
            <button onclick="location.hash='#p/${currentProjectId}/docs-vault'" style="width: 100%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; border: 1px solid #fbbf24; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);">
              <span>Return to Vault</span>
              <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

window._editorAction = function(mode){
  const ctx = window._editorCtx;
  if(!ctx || !ctx.docId){ toast('No document open'); return; }
  const hit = vFind(ctx.docId);
  if(!hit){ toast('Document no longer exists'); return; }
  if(hit.node.locked){ toast('Templates are view-only'); return; }
  const tEl = document.getElementById('doc-title');
  const bEl = document.getElementById('doc-body');
  let name = ((tEl && tEl.value) || hit.node.name || 'Untitled').trim();
  if(name && !/\.docx$/.test(name)) name += '.docx';
  hit.node.name = name || 'Untitled.docx';
  hit.node.body = bEl ? bEl.value : (hit.node.body||'');
  hit.node.meta = (mode==='post' ? 'Posted' : 'Draft') + ' \u2022 John Doe \u2022 '+(new Date()).toLocaleDateString([],{year:'numeric',month:'short',day:'numeric'});
  hit.node.draft = mode!=='post';
  saveState();
  toast(mode==='post' ? 'Document saved to '+String(currentVaultFolderId||'home').replace(/[-_]/g,' ') : 'Draft saved');
  route();
};


/* ─── Gate Quiz Engine (copied from main dashboard) ─── */
function openGate(quizId, passCount){
  const bank = QUIZ_BANKS[quizId] || QUIZ_BANKS.ba;
  quizState = {bank, idx:0, answers:new Array(bank.length).fill(-1), passCount:passCount||4, done:false, passed:false};
  paintGate();
}
function closeGate(){
  quizState = null;
}
function paintGate(){
  if(!quizState) return;
  const q = quizState.bank[quizState.idx];
  const total = quizState.bank.length;
  const idx = quizState.idx;
  let dots = '';
  for(let i=0;i<total;i++){
    let cls = 'quiz-dot';
    if(i<idx) cls+=' done';
    else if(i===idx) cls+=' active';
    dots += `<div class="${cls}"></div>`;
  }
  const letters = ['A','B','C','D'];
  let opts = q.opts.map((o,i) =>
    `<div class="opt ${quizState.answers[idx]===i?'selected':''}" onclick="window._quizAnswer(${i})">
      <span class="letter">${letters[i]}</span><span>${o}</span>
    </div>`
  ).join('');

  const content = document.getElementById('main-content');
  if(content){
    content.innerHTML = `
      <div class="quiz-wrap">
        <div class="quiz-hero"><h1>Milestone Quiz</h1><p>Answer ${total} questions to confirm project readiness. Score ${quizState.passCount}/${total} or higher to pass.</p></div>
        <div class="quiz-progress">${dots}</div>
        <div class="quiz-card">
          <span class="qnum">Question ${idx+1} of ${total}</span>
          <h2>${q.q}</h2>
          <p>Select the most accurate answer.</p>
          <div class="options">${opts}</div>
          <div class="quiz-nav">
            <button class="btn btn-outline" onclick="window._quizPrev()" ${idx===0?'disabled':''}>Previous</button>
            <button class="btn btn-amber" onclick="window._quizNext()">${idx===total-1?'Submit':'Next Question'}</button>
          </div>
        </div>
      </div>`;
  }
  updateSidebar('quiz');
}
function resolveGate(){
  if(!quizState) return;
  const correct = quizState.bank.reduce((n,q,i)=>n+(quizState.answers[i]===q.correct?1:0),0);
  const passed = correct >= quizState.passCount;
  quizState.done = true;
  quizState.passed = passed;
  quizState.score = correct;

  const content = document.getElementById('main-content');
  if(!content) return;

  if(passed){
    fireConfetti();
    state.quizResults[currentTrackId] = {passed:true,score:correct,date:today()};
    saveState();
    content.innerHTML = `
      <div class="quiz-wrap" style="text-align:center;padding:80px 24px">
        <div style="font-size:64px;margin-bottom:16px">&#x1F389;</div>
        <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px">Quiz Passed!</h1>
        <p style="font-size:14px;color:#a3a3a3;margin:0 0 24px">You scored ${correct}/${quizState.bank.length}. Great work!</p>
        <button class="btn btn-amber" onclick="window._nav('portal')">Return to Project Hub</button>
      </div>`;
  } else {
    content.innerHTML = `
      <div class="quiz-wrap" style="text-align:center;padding:80px 24px">
        <div style="font-size:64px;margin-bottom:16px">&#x1F914;</div>
        <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px">Not Quite There</h1>
        <p style="font-size:14px;color:#a3a3a3;margin:0 0 24px">You scored ${correct}/${quizState.bank.length}. You need ${quizState.passCount}/${quizState.bank.length} to pass. Review your project brief and try again.</p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-outline" onclick="window._nav('portal')">Return to Hub</button>
          <button class="btn btn-amber" onclick="window._retryQuiz()">Retry Quiz</button>
        </div>
      </div>`;
  }
  updateSidebar('quiz');
}
window._quizAnswer = function(i){ if(quizState&&!quizState.done){quizState.answers[quizState.idx]=i;paintGate();}};
window._quizNext = function(){
  if(!quizState) return;
  if(quizState.idx < quizState.bank.length-1){quizState.idx++;paintGate();}
  else{resolveGate();}
};
window._quizPrev = function(){ if(quizState&&quizState.idx>0){quizState.idx--;paintGate();}};
window._retryQuiz = function(){ openGate(currentTrackId); };

/* ═══ MENTORSHIP DASHBOARD (reference/16) ═══ */
function viewMentorship(){
  const cards = [
    {route:'mentorship/live-sessions', icon:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', grad:'#9a3412,#c2410c', badge:'Next: Aug 25 &bull; 11:00 AM', badgeBg:'#431407', badgeC:' #fb923c', title:'Live Sessions & Calendar', desc:'Book 1-on-1 mentorship calls, attend weekly group reviews, and track all upcoming cohort events in one place.', foot:'Open Calendar'},
    {route:'mentorship/recordings', icon:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>', grad:'#334155,#64748b', badge:'24 Videos Available', badgeBg:'#1e293b', badgeC:'#94a3b8', title:'Recordings Library', desc:'Catch up on missed sessions or rewatch key moments. All workshops and Q&As are archived here.', foot:'Browse Recordings'},
    {route:'mentorship/evaluation', icon:'<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>', grad:'#166534,#16a34a', badge:'Scorecard Ready', badgeBg:'#14532d', badgeC:'#4ade80', title:'Evaluation Log & Reviews', desc:"Review your official scorecards, mentor feedback summaries, and track your performance history across the program.", foot:'View Evaluation'}
  ].map(c => `
      <a href="#${c.route}" style="text-decoration:none;">
        <div style="background-color:#181818;border-radius:12px;padding:28px;border:1px solid #3a3a3a;height:100%;display:flex;flex-direction:column;justify-content:space-between;transition:border-color .2s;" onmouseover="this.style.borderColor='#d97706'" onmouseout="this.style.borderColor='#262626'">
          <div>
            <div style="width:48px;height:48px;background:linear-gradient(135deg, ${c.grad});border-radius:10px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">${c.icon}</svg>
            </div>
            <span style="display:inline-block;background-color:${c.badgeBg};color:${c.badgeC};font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;">${c.badge}</span>
            <h3 style="margin:0 0 10px 0;font-size:22px;font-weight:800;color:#ffffff;">${c.title}</h3>
            <p style="margin:0;font-size:13px;color:#c6c6c6;line-height:1.6;">${c.desc}</p>
          </div>
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid #3a3a3a;display:flex;align-items:center;color:#d97706;font-size:13px;font-weight:700;">${c.foot}<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="margin-left:auto"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></div>
        </div>
      </a>`).join('');

  return `
  <!-- MAIN CONTENT AREA -->
  <main style="flex:1;padding:40px 48px;overflow-y:auto;background-color:#121212;">

    <!-- Header -->
    <div style="margin-bottom:36px;">
      <span style="display:inline-block;background-color:#181818;border:1px solid #3a3a3a;color:#a3a3a3;font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Stage 2 &bull; Cohort 001</span>
      <h1 style="font-size:32px;font-weight:800;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;">Your Mentorship Hub</h1>
      <p style="margin:0;color:#a3a3a3;font-size:14px;">Manage your sessions, catch up on recordings, and review your official feedback.</p>
    </div>

    <!-- Mentorship Cards Grid -->
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;">
      ${cards}
    </div>

    <!-- Mentor Profile Card -->
    <div style="margin-top:32px;background-color:#181818;border-radius:12px;border:1px solid #3a3a3a;padding:24px;display:flex;align-items:center;gap:20px;">
      <img src="assets/img/mentor-sarah.jpg" alt="Sarah Chen" style="width:64px;height:64px;border-radius:50%;border:2px solid #d97706;object-fit:cover;">
      <div style="flex:1;">
        <h4 style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">Sarah Chen</h4>
        <p style="margin:4px 0 0 0;color:#737373;font-size:13px;">Senior Product Analyst @ Zeelin &bull; Lead Mentor for Cohort 001</p>
      </div>
      <button onclick="location.hash='#mentorship/support'" style="background-color:#262626;color:white;border:1px solid #404040;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Message Mentor</button>
    </div>

  </main>`;
}

/* ═══ MENTORSHIP — LIVE SESSIONS CALENDAR (reference/17) ═══ */
function dayCell(d, dim, session, isToday){
  return `
        <div style="${isToday
          ? 'background-color:#ffffff;border:2px solid #ffffff;'
          : 'background-color:#181818;border:1px solid #3a3a3a;'} border-radius:8px;padding:12px;min-height:110px;display:flex;flex-direction:column;gap:6px;${dim?'opacity:0.4;':''}">
          <span style="font-size:12px;font-weight:600;${isToday?'color:#000000;':'color:#a3a3a3;'}">${d}</span>
          ${session?`<span style="background-color:#292524;border:1px solid #78350f;color:#fbbf24;font-size:9px;font-weight:600;padding:3px 6px;border-radius:4px;line-height:1.2;white-space:normal;">${session}</span>`:''}
          ${isToday?'<span style="margin-top:auto;font-size:9px;font-weight:800;color:#000000;text-transform:uppercase;letter-spacing:1px;">Today</span>':''}
        </div>`;
}

function viewMentorLive(){
  const cells = [
    dayCell(1,true),dayCell(2,true),dayCell(3,true),dayCell(4,true),dayCell(5,true),dayCell(6,false),dayCell(7,false),
    dayCell(8,false,'11:00 AM Group Review'),dayCell(9,false),dayCell(10,false),dayCell(11,false),dayCell(12,false),dayCell(13,false),dayCell(14,false),
    dayCell(15,false,null,true),
    dayCell(16,false),dayCell(17,false),dayCell(18,false),dayCell(19,false),dayCell(20,false,'2:30 PM 1-on-1'),dayCell(21,false),dayCell(22,false),
    dayCell(23,false),dayCell(24,false),dayCell(25,false,'11:00 AM Workshop'),dayCell(26,false),dayCell(27,false),dayCell(28,false),dayCell(29,false),
    dayCell(30,false),dayCell(31,false)
  ].join('');

  return `
  <!-- MAIN CONTENT AREA -->
  <div style="flex:1;display:flex;height:100vh;overflow:hidden;">

    <!-- BIG CANVAS -->
    <div style="flex:1;overflow-y:auto;padding:32px 40px;background-color:#121212;">

      <!-- Header -->
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px;">
        <div>
          <h1 style="font-size:28px;font-weight:800;color:#ffffff;margin:0 0 6px 0;letter-spacing:-0.5px;">August 2026</h1>
          <p style="color:#737373;font-size:13px;margin:0;">All times displayed in West Africa Time (WAT).</p>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <button onclick="_toast('Previous month is not available in this preview')" style="background-color:#181818;border:1px solid #454545;color:#a3a3a3;width:32px;height:32px;border-radius:6px;font-size:14px;cursor:pointer;">&lt;</button>
          <button onclick="_toast('Next month is not available in this preview')" style="background-color:#181818;border:1px solid #454545;color:#a3a3a3;width:32px;height:32px;border-radius:6px;font-size:14px;cursor:pointer;">&gt;</button>
          <button onclick="_toast('Booking request sent to your mentor')" style="background-color:#2563eb;color:white;border:none;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">+ Book Session</button>
        </div>
      </div>

      <!-- Weekdays -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:8px;">
        ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>`<span style="text-align:right;font-size:11px;font-weight:700;color:#525252;text-transform:uppercase;">${w}</span>`).join('')}
      </div>

      <!-- Days Grid -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">
${cells}
      </div>

      <!-- Legend + Upcoming Session -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;border-top:1px solid #3a3a3a;padding-top:20px;">
        <div style="display:flex;gap:24px;">
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:12px;height:12px;background-color:#292524;border:1px solid #78350f;border-radius:4px;"></div><span style="color:#737373;font-size:12px;">Scheduled Session</span></div>
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:12px;height:12px;background-color:#ffffff;border-radius:4px;"></div><span style="color:#737373;font-size:12px;">Today</span></div>
        </div>
        <button onclick="_toast('Joining stream...')" style="background-color:#d97706;color:#ffffff;border:none;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;">Join Stream: Aug 25 Workshop ${ICO_ARROW}</button>
      </div>

      <!-- UPCOMING LIVE SESSIONS -->
      <div style="margin-top:32px;">
        <h3 style="font-size:14px;font-weight:800;color:#ffffff;margin:0 0 16px 0;text-transform:uppercase;letter-spacing:1px;">Upcoming Live Sessions</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${[
            {date:'Aug 28',time:'11:00 AM',title:'Advanced Excel Modeling Workshop',desc:'Deep dive into pivot tables, VLOOKUP, and dynamic dashboards for project tracking.'},
            {date:'Sep 05',time:'2:30 PM',title:'Mentor 1-on-1: Stage 2 Review',desc:'Individual review of your BRS and Excel model with Dr. O. Emeka.'},
            {date:'Sep 12',time:'11:00 AM',title:'Group Project Sprint Review',desc:'Team checkpoint — present progress on sprint deliverables and blockers.'}
          ].map(s=>`
          <div style="background:#181818;border:1px solid #333;border-radius:12px;padding:20px 24px;display:flex;align-items:center;gap:20px;">
            <div style="width:60px;height:60px;background:rgba(217,119,6,.12);border:1px solid rgba(217,119,6,.3);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="font-size:10px;font-weight:700;color:#d97706;text-transform:uppercase;">${s.date.split(' ')[0]}</span>
              <span style="font-size:20px;font-weight:900;color:#ffffff;line-height:1;">${s.date.split(' ')[1]}</span>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:800;color:#ffffff;margin-bottom:2px;">${s.title}</div>
              <div style="font-size:12px;color:#a3a3a3;line-height:1.4;">${s.desc}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
              <span style="font-size:12px;color:#737373;font-weight:700;">${s.time} WAT</span>
              <button onclick="toast('Joining live stream...')" style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(217,119,6,.3);">Join Stream</button>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Previous Sessions List -->
      <div style="margin-top:32px;">
        <h3 style="font-size:14px;font-weight:800;color:#ffffff;margin:0 0 16px 0;text-transform:uppercase;letter-spacing:1px;">Previous Sessions This Month</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${[['Aug 20','2:30 PM','1-on-1 Strategy Call'],['Aug 14','11:00 AM','Group Project Review'],['Aug 08','11:00 AM','Kickoff Workshop']].map(s=>`
          <div style="display:flex;align-items:center;justify-content:space-between;background-color:#181818;border:1px solid #3a3a3a;border-radius:8px;padding:14px 20px;">
            <div style="display:flex;align-items:center;gap:16px;">
              <span style="font-size:12px;color:#fbbf24;font-weight:700;background-color:#292524;padding:4px 8px;border-radius:4px;">${s[0]}</span>
              <span style="color:#e5e5e5;font-size:13px;font-weight:600;">${s[2]}</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
              <span style="color:#737373;font-size:12px;">${s[1]} WAT</span>
              <a href="#mentorship/recordings" style="background-color:#262626;color:white;border:none;padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;">Watch Recording</a>
            </div>
          </div>`).join('')}
        </div>
      </div>

    </div>

    <!-- RIGHT HAND SIDEBAR PANEL -->
    <aside style="width:320px;background-color:#181818;border-left:1px solid #3f3f3f;display:flex;flex-direction:column;justify-content:space-between;flex-shrink:0;">
      <div style="padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#d97706"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
          <h3 style="font-size:14px;font-weight:700;color:#ffffff;margin:0;">Calendar Guide</h3>
        </div>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#a3a3a3;"><span style="width:6px;height:6px;background-color:#d97706;border-radius:50%;flex-shrink:0;margin-top:5px;"></span> Amber tags mark scheduled group events.</li>
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#a3a3a3;"><span style="width:6px;height:6px;background-color:#d97706;border-radius:50%;flex-shrink:0;margin-top:5px;"></span> Today's cell is highlighted white.</li>
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#a3a3a3;"><span style="width:6px;height:6px;background-color:#d97706;border-radius:50%;flex-shrink:0;margin-top:5px;"></span> Missed a call? Rewatch it in the Recordings Library.</li>
        </ul>
      </div>
      <div style="padding:24px;">
        <a href="#mentorship/recordings" style="display:block;background-color:#d97706;color:#ffffff;text-align:center;padding:12px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">Proceed to Recordings Library</a>
      </div>
    </aside>

  </div>`;
}

/* ─── Check-In View ─── */
function viewCheckin(){
  const alreadyDone = state.lastCheckin === today();
  let blocks = CHECKIN_CONFIG.blocks.map(b => {
    if(b.type==='stars'){
      let starBtns = '';
      for(let i=1;i<=5;i++){
        starBtns += `<button type="button" class="star-btn" data-star="${i}" aria-label="${i} star${i>1?'s':''}" onclick="window._setStars(this,${i})">★</button>`;
      }
      let branches = b.branches.map((br,i)=>
        `<div class="star-branch" data-star="${i+1}"><label>${br}</label><textarea class="form-textarea" placeholder="Optional feedback..."></textarea></div>`
      ).join('');
      return `<div class="block"><label>${b.label}</label><input type="hidden" id="stars-value"><div class="stars-radio" id="stars-container">${starBtns}</div>${branches}</div>`;
    }
    if(b.type==='textarea') return `<div class="block"><label>${b.label}</label><textarea class="form-textarea" placeholder="${b.placeholder}"></textarea></div>`;
    return `<div class="block"><label>${b.label}</label><input class="form-input" type="text" placeholder="${b.placeholder}"/></div>`;
  }).join('');

  const days = STREAK_DAYS.map((d,i)=>{
    const dayIdx = new Date().getDay();
    const mapped = dayIdx===0?6:dayIdx-1;
    let cls = i<mapped?'done':i===mapped?'today':'future';
    if(i<mapped && state.lastCheckin!==today()) cls='done';
    return `<div class="streak-dot ${cls}">${d}</div>`;
  }).join('');

  return renderTopbar('Daily Check-In',0,'')
    + `<div class="content"><div class="checkin-wrap" style="max-width:700px;margin:0 auto">
      <div class="checkin-hero" style="text-align:center;padding:40px 24px 24px"><h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 6px">Daily Check-In</h1><p style="font-size:13px;color:#a3a3a3;margin:0">Track your progress and earn XP by completing your daily accountability check-in.</p></div>
      ${alreadyDone?'<div style="background:#14532d;border:1px solid #16a34a;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;color:#4ade80;font-weight:600">You have already checked in today!</div>':''}
      <div id="checkin-form">${blocks}</div>
      <div class="claim-bar">
        <div class="info">Complete check-in to earn <b>+${CHECKIN_CONFIG.xpClaim} XP</b></div>
        <button class="btn btn-amber" id="checkin-submit" ${alreadyDone?'disabled':''} onclick="window._submitCheckin()">Submit Check-In</button>
      </div>
      <div class="streak" style="margin-top:16px;font-size:12px;color:#a3a3a3;display:flex;align-items:center;gap:12px">${days}</div>
    </div></div>`;
}

/* ─── Accountability View ─── */
function viewAccountability(){
  const m = state.metrics;
  return renderTopbar('Accountability Dashboard',0,'')
    + `<div class="content"><div class="acc-wrap" style="max-width:900px;margin:0 auto">
      <div class="acc-hero" style="text-align:center;padding:40px 24px 24px"><h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 6px">Accountability Dashboard</h1><p style="font-size:13px;color:#a3a3a3;margin:0">Track your project consistency, peer engagement, and milestone progress.</p></div>
      <div class="grid4" style="margin-bottom:24px">
        <div class="metric"><div class="metric-val">${m.checkins}</div><div class="metric-lbl">Check-Ins This Week</div></div>
        <div class="metric"><div class="metric-val">${state.consistency}%</div><div class="metric-lbl">Consistency Rate</div></div>
        <div class="metric"><div class="metric-val">${m.reviews}</div><div class="metric-lbl">Peer Reviews Given</div></div>
        <div class="metric"><div class="metric-val">${m.score}</div><div class="metric-lbl">Project Score</div></div>
      </div>
      <div class="chart-row">
        <div class="chart-card"><h3>Time Distribution</h3>
          <div class="pie-placeholder" style="background:conic-gradient(#d97706 0% 40%,#16a34a 40% 70%,#3b82f6 70% 85%,#262626 85% 100%)">
            <div class="pie-center">40%</div>
          </div>
          <div style="margin-top:16px;display:flex;gap:16px;justify-content:center;font-size:12px;color:#a3a3a3">
            <span style="color:#d97706">Workspace 40%</span><span style="color:#16a34a">BRS Doc 30%</span><span style="color:#3b82f6">Collab 15%</span><span style="color:#737373">Other 15%</span>
          </div>
        </div>
        <div class="chart-card"><h3>Milestone Progress</h3>
          <div class="bar-chart">
            ${[{l:'Brief',w:100,c:'#16a34a'},{l:'Deliverables',w:50,c:'#d97706'},{l:'Workspace',w:75,c:'#d97706'},{l:'Collaboration',w:80,c:'#16a34a'}].map(b=>
              `<div class="bar-row"><span class="bar-label">${b.l}</span><div class="bar-track"><div class="bar-fill" style="width:${b.w}%;background:${b.c}"></div></div><span class="bar-val">${b.w}%</span></div>`
            ).join('')}
          </div>
        </div>
      </div>
    </div></div>`;
}

/* ═══ MENTORSHIP — RECORDINGS LIBRARY (reference/18) ═══ */
function recCard(title, meta, dur, img){
  return `
        <div data-name="${(title+' '+meta).toLowerCase()}" style="background-color:#181818;border-radius:12px;overflow:hidden;border:1px solid #3a3a3a;display:flex;flex-direction:column;">
          <div style="position:relative;height:180px;background:linear-gradient(135deg,#27272a,#3f3f46);">
            <img src="${img}" alt="${title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" onerror="this.style.display='none'">
            <div style="position:absolute;bottom:10px;right:10px;background-color:#000000cc;color:#ffffff;font-size:11px;padding:2px 6px;border-radius:4px;">${dur}</div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;background-color:#d97706e0;display:flex;align-items:center;justify-content:center;">
              <svg viewBox="0 0 24 24" fill="#ffffff" width="24" height="24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div style="padding:20px;">
            <h3 style="margin:0 0 8px 0;font-size:16px;font-weight:700;color:#ffffff;">${title}</h3>
            <p style="margin:0;color:#a3a3a3;font-size:13px;">${meta}</p>
          </div>
        </div>`;
}

function viewMentorRecordings(){
  return `
  <!-- MAIN CONTENT AREA -->
  <main style="flex:1;padding:40px 48px;overflow-y:auto;background-color:#121212;">

    <!-- Header -->
    <div style="margin-bottom:32px;display:flex;align-items:flex-end;justify-content:space-between;">
      <div>
        <h1 style="font-size:32px;font-weight:800;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;">Recordings Library</h1>
        <p style="margin:0;color:#a3a3a3;font-size:14px;">Catch up on missed sessions or rewatch key moments.</p>
      </div>
      <input type="text" placeholder="Search recordings..." oninput="_filterRows('rec-grid', this.value)" style="background-color:#181818;border:1px solid #454545;color:#ffffff;padding:10px 16px;border-radius:8px;width:280px;font-size:13px;outline:none;">
    </div>

    <!-- Recordings Grid -->
    <div id="rec-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-bottom:40px;">
      ${recCard('Week 01: Project Kickoff & Scope Analysis','Sarah Chen &bull; Aug 08, 2026 &bull; Workshop','1:15:20','assets/img/rec-kickoff.jpg')}
      ${recCard('Advanced Data Modeling Techniques','David Okafor &bull; Aug 14, 2026 &bull; Technical Deep-Dive','45:10','assets/img/rec-datamodel.jpg')}
      ${recCard('Client Communication & Reporting','Guest Speaker &bull; Aug 20, 2026 &bull; Soft Skills','52:45','assets/img/rec-clientcomms.jpg')}
    </div>
    <div id="rec-grid-empty" style="display:none;border:2px dashed #555555;border-radius:12px;padding:40px;text-align:center;color:#8a8a8a;font-size:13px;margin-bottom:40px;">No recordings match your search.</div>

    <!-- Proceed CTA -->
    <div style="border-top:1px solid #3a3a3a;padding-top:32px;text-align:right;">
      <a href="#mentorship/evaluation" style="display:inline-block;background-color:#d97706;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">Proceed to Evaluation Log &amp; Reviews</a>
    </div>

  </main>`;
}

/* ═══ MENTORSHIP — EVALUATION LOG & REVIEWS (reference/19) ═══ */
function critRow(crit, score, max, notes){
  return `
          <tr style="border-bottom:1px solid #3a3a3a;">
            <td style="padding:16px 0;color:#e5e5e5;font-size:14px;">${crit}</td>
            <td style="padding:16px 0;text-align:right;"><span style="color:#4ade80;font-weight:700;font-size:14px;">${score} / ${max}</span></td>
            <td style="padding:16px 0;color:#737373;font-size:12px;width:40%;">${notes}</td>
          </tr>`;
}

function viewMentorEvaluation(){
  const proj = getProject(currentProjectId);
  const submissions = [
    {
      num:1,
      title:'Business Requirements Specification (BRS)',
      score:'28/30',
      pct:93,
      origFile:'BRS_Inventory_Hub_V1.2.docx',
      correctedFile:'BRS_Inventory_Hub_V1.2_corrected.docx',
      correctedName:'BRS_Inventory_Hub_V1.2_corrected.docx',
      feedback:'Excellent document. Your BRS clearly captures 80% of the business requirements. The stakeholder interviews were well-structured and the acceptance criteria were specific and measurable. Minor improvement needed: some edge cases for Stock-Out Alerts and Reorder triggers were not fully detailed in Section 4.2. Also consider adding a "Priority" column to the Requirements Traceability Matrix for clarity. Overall, a solid and professional deliverable. — Dr. O. Emeka'
    },
    {
      num:2,
      title:'Executive Summary &amp; Project Pitch Deck',
      score:'27/30',
      pct:90,
      origFile:'Executive_Summary_Inventory_Hub_Pitch.pptx',
      correctedFile:'Executive_Summary_Inventory_Hub_Pitch_corrected.pptx',
      correctedName:'Executive_Summary_Inventory_Hub_Pitch_corrected.pptx',
      feedback:'Very strong. Your pitch deck clearly articulates the project vision, problem statement, and proposed solution. The visuals were clean and aligned with business objectives. The financial projections (ROI &amp; Payback Period) were convincing. Areas for improvement: include a dedicated slide on Risk Mitigation and consider adding a competitive analysis slide comparing your solution to existing inventory systems. A well-prepared and confident delivery. — Dr. O. Emeka'
    },
    {
      num:3,
      title:'Inventory Management &amp; Forecasting Model (Excel)',
      score:'37/40',
      pct:93,
      origFile:'Inventory_Forecast_Model_V2.1.xlsx',
      correctedFile:'Inventory_Forecast_Model_V2.1_corrected.xlsx',
      correctedName:'Inventory_Forecast_Model_V2.1_corrected.xlsx',
      feedback:'Excellent work. The Excel model is well-structured, with separate tabs for Data Input, Forecast Calculations, and Dashboard Summary. The use of named ranges and data validation was impressive. Minor areas for improvement: the forecast accuracy tab could benefit from a sensitivity analysis (±10% demand fluctuation). Also, consider adding conditional formatting to highlight low-stock items automatically. Overall, one of the strongest models in the cohort. — Dr. O. Emeka'
    }
  ];

  function subCard(s){
    return `
    <div style="background:#181818;border:1px solid #333;border-radius:12px;padding:24px 28px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <span style="background:rgba(217,119,6,.15);color:#d97706;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:800;">Submission ${s.num}</span>
        <span style="font-size:16px;font-weight:800;color:#ffffff;flex:1;">${s.title}</span>
        <span style="background:#14532d;color:#4ade80;padding:4px 14px;border-radius:100px;font-size:13px;font-weight:800;">${s.score}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span style="font-size:12px;color:#a3a3a3;">Original File:</span>
        <span style="font-size:12px;font-weight:700;color:#d97706;background:rgba(217,119,6,.12);padding:3px 10px;border-radius:6px;">${s.origFile}</span>
      </div>
      <div style="background:#121212;border:1px solid #333;border-radius:8px;padding:14px 18px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8" fill="none" stroke="#fff" stroke-width="1.5"/></svg>
          <span style="font-size:12px;color:#737373;">Corrected Attachment:</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:13px;font-weight:700;color:#2563eb;">${s.correctedName}</span>
          <button onclick="toast('Downloading ${s.correctedName}...')" style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(217,119,6,.3);">Download</button>
        </div>
      </div>
      <div style="background:rgba(217,119,6,.06);border-left:3px solid #d97706;border-radius:0 8px 8px 0;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#c6c6c6;line-height:1.7;">${s.feedback}</p>
      </div>
    </div>`;
  }

  return `
  <div style="flex:1;display:flex;height:100vh;overflow:hidden;">
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background-color:#121212;">

      <div class="vault-statusbar">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" fill="none" stroke="#d97706" stroke-width="2"/></svg>
          <span style="font-size:14px;font-weight:800;color:#ffffff;">Mentorship &bull; Evaluation Log &amp; Feedback</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;font-size:13px;font-weight:700;color:#d4d4d4;">
          ${bookmarkStar()}
          <span style="color:#16a34a;font-weight:800;">Status: Reviewed</span>
          <span style="background:rgba(22,163,74,.15);color:#4ade80;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:800;">Passed (92/100)</span>
        </div>
      </div>

      <div style="flex:1;overflow-y:auto;padding:36px 52px;">
        <div style="max-width:860px;margin:0 auto;">

          <!-- Banner -->
          <div style="background:#181818;border:1px solid #333;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
            <h2 style="margin:0 0 4px 0;font-size:18px;font-weight:900;color:#ffffff;">PROJECT TITLE</h2>
            <p style="margin:0;font-size:13px;color:#a3a3a3;line-height:1.6;">AIM: To design and implement a Inventory Management System for Inventory Control Solutions that improves stock accuracy, reduces holding costs, and streamlines the reorder process using Microsoft Excel.</p>
          </div>

          <!-- Overall Performance -->
          <div style="background:#181818;border:1px solid #333;border-radius:12px;padding:28px 32px;margin-bottom:28px;display:flex;align-items:center;gap:32px;">
            <div style="position:relative;width:120px;height:120px;flex-shrink:0;">
              <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(#d97706 0% 92%, #262626 92% 100%);display:flex;align-items:center;justify-content:center;">
                <div style="width:96px;height:96px;border-radius:50%;background:#181818;display:flex;align-items:center;justify-content:center;flex-direction:column;">
                  <span style="font-size:28px;font-weight:900;color:#ffffff;line-height:1;">92</span>
                  <span style="font-size:10px;color:#737373;text-transform:uppercase;margin-top:2px;">of 100</span>
                </div>
              </div>
              <div style="position:absolute;top:-6px;right:-6px;background:#16a34a;color:#fff;font-size:10px;font-weight:800;padding:3px 10px;border-radius:100px;">Verified</div>
            </div>
            <div>
              <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#ffffff;">Overall Performance</h2>
              <p style="margin:0;color:#a3a3a3;font-size:13px;line-height:1.6;">You have demonstrated exceptional mastery of the core competencies for this stage. You are cleared to proceed to Stage 3.</p>
            </div>
          </div>

          <!-- Section Header -->
          <div style="border-bottom:2px solid #3a3a3a;padding-bottom:16px;margin-bottom:24px;">
            <h2 style="font-size:24px;font-weight:900;color:#ffffff;margin:0;">Document Submissions &amp; Mentor Feedback</h2>
          </div>

          ${submissions.map(subCard).join('')}

          <div style="margin-top:32px;">
            <a href="#p/${currentProjectId}/live-sessions" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:1px solid #f59e0b;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:900;text-decoration:none;box-shadow:0 4px 16px rgba(217,119,6,.4);">
              Proceed to Live Sessions &rarr;
            </a>
          </div>

        </div>
      </div>

    </div>
  </div>`;
}

/* ═══ MENTOR SUPPORT PAGE ═══ */
function viewMentorSupport(){
  const faqs = [
    {q:'How do I schedule a 1-on-1 session with my mentor?',a:'Navigate to Live Sessions & Calendar from your Mentorship Hub. Click any available slot to book a session with Sarah Chen.'},
    {q:'How often should I expect mentor feedback?',a:'Mentors provide written feedback weekly and after each major deliverable submission. Check the Evaluation Log for all reviews.'},
    {q:'Can I message my mentor directly?',a:'Yes. Use the Community Chat for quick questions or book a dedicated session through the calendar for deeper discussions.'},
    {q:'What if I disagree with my evaluation score?',a:'You can request a review by contacting the support team through Community Chat. All evaluation appeals are reviewed within 48 hours.'},
    {q:'How do I reschedule a mentorship session?',a:'Open the Live Sessions calendar, click on your booked session, and select "Reschedule" to pick a new time slot.'}
  ];

  return `
  <div style="flex:1;display:flex;height:100vh;overflow:hidden;">

    <!-- MAIN CANVAS -->
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">

      <!-- Status Bar -->
      <div class="vault-statusbar">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          <span style="font-size:14px;font-weight:800;color:#ffffff;">Mentorship &bull; Support Center</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;font-size:13px;font-weight:700;color:#d4d4d4;">
          ${bookmarkStar()}
          <span style="color:#16a34a;font-weight:800;">Mentor: Sarah Chen</span>
        </div>
      </div>

      <!-- Inner workspace split -->
      <div style="flex:1;display:flex;overflow:hidden;">

        <!-- BIG CANVAS: Support Content -->
        <div style="flex:1;padding:36px 52px;overflow-y:auto;background-color:#121212;">
          <div style="max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:28px;">

            <!-- Hero -->
            <div style="text-align:center;padding:48px 24px 32px;">
              <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 8px 0;">Project Support Center</h1>
              <p style="font-size:14px;color:#a3a3a3;margin:0;">Get assistance with your Stage 2 In-House Project. Our mentors and support team are here to help you succeed.</p>
            </div>

            <!-- 3 Cards -->
            <div class="grid3" style="margin-bottom:8px;">
              <div class="scard" onclick="location.hash='#p/${currentProjectId}/collaboration'" style="cursor:pointer;">
                <svg viewBox="0 0 24 24" fill="#d97706" width="36" height="36"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                <h3>Community Chat</h3>
                <p>Ask questions and collaborate with your cohort peers and mentors.</p>
              </div>
              <div class="scard" onclick="location.hash='#mentorship/live-sessions'" style="cursor:pointer;">
                <svg viewBox="0 0 24 24" fill="#d97706" width="36" height="36"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                <h3>Mentor Office Hours</h3>
                <p>Schedule 1-on-1 sessions with your assigned project mentor.</p>
              </div>
              <div class="scard" onclick="location.hash='#p/${currentProjectId}/docs-vault'" style="cursor:pointer;">
                <svg viewBox="0 0 24 24" fill="#d97706" width="36" height="36"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
                <h3>Resource Hub</h3>
                <p>Download templates, dataset files, and project submission guidelines.</p>
              </div>
            </div>

            <!-- FAQ -->
            <div class="faq-wrap" style="background:#181818;border:1px solid #3f3f3f;border-radius:12px;padding:28px 24px;">
              <h2 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 20px 0;text-align:center;">Frequently Asked Questions</h2>
              ${faqs.map((f,i)=>`<div class="faq-item ${i===0?'open':''}" onclick="this.classList.toggle('open')"><div class="faq-q">${f.q} <span>+</span></div><div class="faq-a">${f.a}</div></div>`).join('')}
            </div>

          </div>
        </div>

        <!-- RIGHT PANEL -->
        <div class="vault-right-panel">
          <div style="padding:24px;">
            <div style="margin-bottom:24px;">
              <h3 style="font-size:16px;font-weight:900;color:#ffffff;margin:0 0 6px 0;">Quick Actions</h3>
              <p style="font-size:13px;font-weight:700;color:#c0c0c0;margin:0;">Get help fast</p>
            </div>

            <div class="vrp-checklist">
              <label><input type="checkbox" checked style="accent-color:#16a34a;width:16px;height:16px;"> Browse FAQ answers</label>
              <label><input type="checkbox" style="accent-color:#d97706;width:16px;height:16px;"> Open Community Chat</label>
              <label><input type="checkbox" style="accent-color:#d97706;width:16px;height:16px;"> Book mentor session</label>
            </div>

            <!-- Mentor Card -->
            <div style="margin-top:24px;background-color:#181818;border:2px solid #3a3a3a;border-radius:10px;padding:20px;display:flex;flex-direction:column;gap:12px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d97706,#b45309);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:800;">SC</div>
                <div>
                  <div style="font-size:14px;font-weight:700;color:#ffffff;">Sarah Chen</div>
                  <div style="font-size:11px;color:#737373;">Senior Product Analyst</div>
                </div>
              </div>
              <p style="font-size:12px;color:#a3a3a3;margin:0;">Lead Mentor for Cohort 001. Available Mon-Fri, 9 AM - 5 PM.</p>
              <button onclick="location.hash='#mentorship/support'" style="width:100%;background-color:#262626;color:#ffffff;border:1px solid #404040;padding:10px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Message Mentor</button>
            </div>

            <div style="border-top:2px solid #3a3a3a;padding-top:20px;margin-top:20px;">
              <h4 style="font-size:14px;font-weight:900;color:#ffffff;margin:0 0 8px 0;">Need More Help?</h4>
              <p style="font-size:13px;font-weight:700;color:#c0c0c0;line-height:1.6;margin:0;">
                Check the FAQ above or open Community Chat to reach your cohort and mentors directly.
              </p>
            </div>
          </div>

          <div style="padding:24px;background-color:#161616;border-top:2px solid #3a3a3a;">
            <a href="#mentorship" style="display:block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:1px solid #f59e0b;text-align:center;padding:14px;border-radius:8px;font-size:14px;font-weight:900;text-decoration:none;box-shadow:0 4px 16px rgba(217,119,6,.4);">
              &larr; Back to Mentorship Hub
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

/* ─── Support View ─── */
function viewSupport(){
  const faqs = FAQS.map((f,i) =>
    `<div class="faq-item ${i===0?'open':''}" onclick="this.classList.toggle('open')"><div class="faq-q">${f.q} <span>+</span></div><div class="faq-a">${f.a}</div></div>`
  ).join('');

  return renderTopbar('In-House Project Support Center',0,'')
    + `<div class="content"><div class="support-wrap" style="max-width:860px;margin:0 auto">
      <div class="support-hero" style="text-align:center;padding:48px 24px 32px"><h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px">Project Support Center</h1><p style="font-size:14px;color:#a3a3a3;margin:0">Get assistance with your Stage 2 In-House Project.</p></div>
      <div class="grid3" style="margin-bottom:32px">
        <div class="scard"><svg viewBox="0 0 24 24" fill="#d97706" width="36" height="36"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg><h3>Community Chat</h3><p>Ask questions and collaborate with your cohort peers and mentors.</p></div>
        <div class="scard"><svg viewBox="0 0 24 24" fill="#d97706" width="36" height="36"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg><h3>Mentor Office Hours</h3><p>Schedule 1-on-1 sessions with your assigned project mentor.</p></div>
        <div class="scard"><svg viewBox="0 0 24 24" fill="#d97706" width="36" height="36"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg><h3>Resource Hub</h3><p>Download templates, dataset files, and project submission guidelines.</p></div>
      </div>
      <div class="faq-wrap" style="background:#181818;border:1px solid #3f3f3f;border-radius:12px;padding:28px 24px">
        <h2 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 20px;text-align:center">Frequently Asked Questions</h2>
        ${faqs}
      </div>
    </div></div>`;
}

/* ─── Job Portal placeholder ─── */
function viewJobPortal(){
  return renderTopbar('Job Acquisition Portal — Stage 3',0,'')
    + `<div class="content" style="display:flex;align-items:center;justify-content:center;text-align:center">
      <div>
        <div style="font-size:64px;margin-bottom:16px">&#x1F680;</div>
        <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px">Job Acquisition Portal</h1>
        <p style="font-size:14px;color:#a3a3a3;margin:0 0 24px;max-width:400px">Stage 3 will be unlocked once you pass your In-House Project milestone quiz. Complete your project to gain access.</p>
        <button class="btn btn-amber" onclick="window._nav('portal')">Return to Project Hub</button>
      </div>
    </div>`;
}

/* ─── Confetti ─── */
function fireConfetti(){
  const canvas = document.getElementById('confetti-canvas');
  if(!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#d97706','#f59e0b','#16a34a','#4ade80','#3b82f6','#ef4444','#ffffff'];
  for(let i=0;i<150;i++){
    particles.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height - canvas.height,
      w:Math.random()*10+5,
      h:Math.random()*6+3,
      color:colors[Math.floor(Math.random()*colors.length)],
      vx:(Math.random()-0.5)*4,
      vy:Math.random()*3+2,
      rot:Math.random()*360,
      vr:(Math.random()-0.5)*10
    });
  }
  let frame = 0;
  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
      p.x+=p.vx;
      p.y+=p.vy;
      p.vy+=0.05;
      p.rot+=p.vr;
    });
    frame++;
    if(frame<180) requestAnimationFrame(animate);
    else{ctx.clearRect(0,0,canvas.width,canvas.height);canvas.style.display='none';}
  }
  animate();
}

/* ─── Check-in submit ─── */
window._submitCheckin = function(){
  if(!applyCheckinRewards()) return;
  saveState();
  const content = document.getElementById('main-content');
  if(content){
    content.innerHTML = `
      <div style="text-align:center;padding:80px 24px;max-width:500px;margin:0 auto">
        <div style="font-size:64px;margin-bottom:16px">&#x2705;</div>
        <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px">Check-In Complete!</h1>
        <p style="font-size:14px;color:#a3a3a3;margin:0 0 8px">You earned <b style="color:#d97706">+${CHECKIN_CONFIG.xpClaim} XP</b></p>
        <p style="font-size:13px;color:#737373;margin:0 0 24px">Streak: ${state.streak} day(s)</p>
        <button class="btn btn-amber" onclick="window._nav('portal')">Return to Portal</button>
      </div>`;
  }
  fireConfetti();
};

/* ─── Star rating (cumulative fill: clicking N lights stars 1..N) ─── */
window._setStars = function(btn, val){
  const wrap = btn.closest('.stars-radio') || btn.closest('.gate-stars');
  if(!wrap) return;
  wrap.querySelectorAll('.star-btn').forEach(b=>{
    b.classList.toggle('on', parseInt(b.dataset.star,10) <= val);
  });
  const scope = btn.closest('.block') || btn.closest('.gate-block');
  if(scope){
    scope.querySelectorAll('.star-branch').forEach(br=>{
      br.classList.toggle('show', parseInt(br.dataset.star,10) === val);
    });
  }
  const hidden = document.getElementById('stars-value');
  if(hidden) hidden.value = val;
};

/* ─── Track select ─── */
window._selectTrack = function(id){
  currentTrackId = id;
  state.selectedTrack = id;
  saveState();
  navigate('portal');
};

/* ─── Nav helper ─── */
window._nav = function(hash){ navigate(hash); };

/* ─── Sidebar update ─── */
function updateSidebar(activeRoute){
  const sb = document.getElementById('sidebar');
  if(sb) sb.innerHTML = renderSidebar(activeRoute);
}

/* ─── Main render ─── */
function render(view, param, param2){
  const layout = document.querySelector('.layout');
  const isDash = view==='dashboard';
  if(layout) layout.classList.toggle('dash-mode', isDash);

  const mapped = (view==='vault'||view==='doc-editor') ? 'docs-vault' : view;
  const activeKey = param && view!=='vault' && view!=='doc-editor' && view!=='mentorship' ? view+'/'+param : mapped;
  updateSidebar(activeKey);
  const main = document.getElementById('main-content');
  if(!main) return;

  switch(view){
    case 'dashboard':
      main.innerHTML = viewDashboard();
      bindDashboard();
      break;
    case 'home': main.innerHTML = viewProjectHome(); break;
    case 'portal': location.replace('#p/'+currentProjectId+'/home'); return;
    case 'brief': main.innerHTML = viewBrief(); break;
    case 'workspace': main.innerHTML = viewWorkspace(); break;
    case 'collaboration':
      main.innerHTML = viewCollaboration();
      bindCampfire();
      break;
    case 'docs-vault': main.innerHTML = viewVault(); break;
    case 'vault':
      main.innerHTML = viewFolder(param);
      bindFolderDropzone(param);
      break;
    case 'doc-editor': main.innerHTML = viewDocEditor(param); break;
    case 'mentorship':
      if(param==='live-sessions') main.innerHTML = viewMentorLive();
      else if(param==='recordings') main.innerHTML = viewMentorRecordings();
      else if(param==='evaluation') main.innerHTML = viewMentorEvaluation();
      else if(param==='support') main.innerHTML = viewMentorSupport();
      else main.innerHTML = viewMentorship();
      break;
    case 'quiz':
      openGate(currentTrackId);
      break;
    case 'checkin': main.innerHTML = viewCheckin(); break;
    case 'accountability': main.innerHTML = viewAccountability(); break;
    case 'catalog': main.innerHTML = viewCatalog(); bindCatalog(); break;
    case 'cart': main.innerHTML = viewCart(); break;
    case 'checkout': main.innerHTML = viewCheckout(); break;
    case 'support': main.innerHTML = viewCatalog(); bindCatalog(); break;
    case 'job-portal': location.replace('#dashboard'); break;
    default: main.innerHTML = viewDashboard();
  }
}

/* ─── Global task/gate handlers ─── */
/* Close new-item dropdown when clicking anywhere outside it */
document.addEventListener('click', e=>{
  const m = document.getElementById('new-item-menu');
  if(m && m.classList.contains('open') && !e.target.closest('#new-item-menu')) m.classList.remove('open');
});
window._moveTask = function(id){
  state.groupTasks = state.groupTasks || {};
  let base = (GROUP_TASKS||[]).find(t=>t.id===id);
  if(!base) base = (state.customTasks||[]).find(t=>t.id===id);
  if(!base) return;
  const cur = state.groupTasks[id] != null ? state.groupTasks[id] : base.status;
  state.groupTasks[id] = getNextStatus(cur);
  saveState(); render('home');
};
window._addTask = function(){
  state.customTasks = state.customTasks || [];
  state.customTasks.push({id:'C'+Date.now(),title:'New Task',assignee:{init:'JD',color:'#d97706'},status:'backlog',tag:'new',branch:'feature/new'});
  saveState(); render('home');
};
window._openGate = function(){ openGate(currentTrackId); };
window._toggleMilestone = function(id){
  state.mandateDone = state.mandateDone || {};
  state.mandateDone[id] = !state.mandateDone[id];
  saveState(); render('home');
};
window._toggleNewItemMenu = function(ev){
  if(ev && ev.stopPropagation) ev.stopPropagation();
  const m = document.getElementById('new-item-menu');
  if(m) m.classList.toggle('open');
};
window._closeNewItemMenu = function(){
  const m = document.getElementById('new-item-menu');
  if(m) m.classList.remove('open');
};
window._closeItemMenus = function(){
  document.querySelectorAll('.item-action-menu.show').forEach(m=>m.classList.remove('show'));
};
window._toggleItemMenu = function(ev, id){
  if(ev && ev.stopPropagation) ev.stopPropagation();
  window._closeNewItemMenu();
  const m = document.getElementById('item-menu-'+id);
  const wasOpen = m && m.classList.contains('show');
  window._closeItemMenus();
  if(m && !wasOpen) m.classList.add('show');
};
window._filterVault = function(q){
  const norm = (q||'').trim().toLowerCase();
  const wrap = document.getElementById('vault-tree');
  if(wrap) wrap.classList.toggle('searching', !!norm);
  document.querySelectorAll('#vault-tree .tree-row').forEach(r=>{
    r.style.display='';
    if(!norm) return;
    const selfHit = (r.getAttribute('data-name')||'').indexOf(norm)>-1;
    let descHit = false;
    const cont = document.getElementById('tree-kids-'+r.getAttribute('data-id'));
    if(cont) descHit = Array.from(cont.querySelectorAll('.tree-row')).some(x=>(x.getAttribute('data-name')||'').indexOf(norm)>-1);
    r.style.display = (selfHit||descHit)?'':'none';
  });
};
window._toggleTodo = function(k){
  state.todoDone = state.todoDone || {};
  state.todoDone[k] = !state.todoDone[k];
  saveState(); route();
};
window._newPeerNote = function(){
  openVaultModal({
    title:'New message',
    body:`<p class="vm-sub">Posts into this project's community chat.</p>
      <textarea id="vm-note" rows="4" placeholder="Share an approach, ask a question, request a review..." style="width:100%;background-color:#121212;border:1px solid #454545;color:#ffffff;border-radius:8px;padding:10px;font-size:13px;font-family:inherit;resize:vertical;margin-top:6px;"></textarea>`,
    okText:'Post message',
    onOk:function(){ return window._postPeerNote(); }
  });
  setTimeout(()=>{ const ta=document.getElementById('vm-note'); if(ta) ta.focus(); },0);
};
window._postPeerNote = function(){
  const ta = document.getElementById('vm-note');
  const text = ta ? (ta.value||'').trim() : '';
  if(!text){ toast('Type a message first'); return false; }
  const chat = roomMsgs();
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2,'0');
  const ap = h>=12?'PM':'AM';
  h = h%12||12;
  chat.push({init:'JD',color:'#d97706',name:'John Doe (You)',time:h+':'+m+' '+ap,text:text});
  saveState(); toast('Message posted'); route();
  return true;
};

window._newItemAction = function(action){
  window._closeNewItemMenu();
  const key = currentVaultFolderId || 'root';
  const arr = vKids(key);
  if(!arr){ toast('Open a folder first'); return; }
  const parentNode = key==='root' ? null : (vFind(key)||{}).node;
  if(parentNode && parentNode.sealed){ toast('Templates are read-only'); return; }
  if(action==='folder'){
    arr.push({id:uid(),name:'New Folder',kind:'folder',children:[]});
    saveState(); toast('Folder created'); route();
  } else if(action==='doc'){
    const nd = {id:uid(),name:'Untitled Document.docx',kind:'doc',meta:'DRAFT \u2022 John Doe \u2022 '+vDate(),body:''};
    arr.push(nd); saveState();
    navigate('#p/'+currentProjectId+'/doc-editor/'+nd.id);
  } else if(action==='local'){
    const el = document.getElementById('local-picker-'+key);
    if(el) el.click(); else toast('Uploader unavailable here');
  } else if(action==='drive'){
    window.open('https://drive.google.com','_blank');
  } else if(action==='dropbox'){
    window.open('https://dropbox.com','_blank');
  }
};
window._localFilesPicked = function(files){
  if(currentVaultFolderId) handleVaultFiles(files, currentVaultFolderId);
};
function openVaultModal(o){
  window._closeItemMenus();
  const old = document.getElementById('vault-modal');
  if(old) old.remove();
  const ov = document.createElement('div');
  ov.id = 'vault-modal'; ov.className = 'modal-overlay';
  ov.innerHTML = '<div class="modal-card"><h3>'+o.title+'</h3>'+(o.body||'')+
    '<div class="modal-actions"><button class="btn-cancel" id="vm-cancel">Cancel</button>'+
    '<button class="'+(o.danger?'btn-danger':'btn-primary')+'" id="vm-ok">'+(o.okText||'Confirm')+'</button></div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.querySelector('#vm-cancel').addEventListener('click', ()=>ov.remove());
  ov.querySelector('#vm-ok').addEventListener('click', ()=>{ const r = o.onOk ? o.onOk() : undefined; if(r===false) return; ov.remove(); });
  const inp = ov.querySelector('#vm-input');
  if(inp){ inp.focus(); inp.select(); inp.addEventListener('keydown', e=>{ if(e.key==='Enter') ov.querySelector('#vm-ok').click(); }); }
}
window._renameItem = function(pk, id){
  const h = vFind(id); if(!h) return;
  if(h.node.locked){ toast('This item is protected'); return; }
  openVaultModal({
    title: 'Rename "'+(h.node.name||'')+'"',
    body: '<label class="modal-label">New name</label><input id="vm-input" class="modal-input" type="text" value="'+String(h.node.name||'').replace(/"/g,'&quot;')+'">',
    okText: 'Save',
    onOk: ()=>{
      const v = document.getElementById('vm-input').value.trim();
      if(!v) return;
      h.node.name = v; saveState(); toast('Renamed'); route();
    }
  });
};
window._copyItem = function(pk, id){
  const h = vFind(id); if(!h) return;
  if(h.node.locked){ toast('This item is protected'); return; }
  h.list.splice(h.index+1, 0, vClone(h.node));
  saveState(); toast('Copied'); route();
};
window._deleteItem = function(pk, id){
  const h = vFind(id); if(!h) return;
  if(h.node.locked){ toast('This item is protected'); return; }
  openVaultModal({
    title: 'Delete "'+(h.node.name||'')+'"?',
    danger: true,
    okText: 'Delete',
    body: '<p class="modal-text">'+(h.node.children?'This folder and <b>everything inside it</b>':'This item')+' will be permanently removed. This cannot be undone.</p>',
    onOk: ()=>{ h.list.splice(h.index, 1); saveState(); toast('Deleted'); route(); }
  });
};
window._moveItem = function(pk, id){
  const h = vFind(id); if(!h) return;
  if(h.node.locked){ toast('This item is protected'); return; }
  let targets = [{id:'root',name:'Home',depth:0}].concat(vFolders(vTree()));
  const own = vFolders([h.node]).map(o=>o.id); own.push(id);
  targets = targets.filter(t => {
    if(own.indexOf(t.id)>-1) return false;
    if(t.id==='root') return true;
    const tn = vFind(t.id);
    return !!(tn && !tn.node.sealed);
  });
  const ov = document.createElement('div');
  ov.id = 'move-modal';
  ov.innerHTML = '<div class="move-card"><h3>Move "'+h.node.name+'" to...</h3><div class="move-list">'+
    targets.map(t=>'<button class="move-opt" data-t="'+t.id+'" style="padding-left:'+(16+t.depth*20)+'px;">'+(t.id==='root'?'&#127968; ':'&#128193; ')+t.name+'</button>').join('')+
    '</div><button class="move-cancel">Cancel</button></div>';
  document.body.appendChild(ov);
  ov.querySelectorAll('.move-opt').forEach(b=>b.addEventListener('click',()=>{
    const tid = b.getAttribute('data-t');
    let destArr;
    if(tid==='root'){ destArr = vTree(); }
    else { const dh = vFind(tid); if(!dh){ ov.remove(); return; } if(!dh.node.children) dh.node.children=[]; destArr = dh.node.children; }
    h.list.splice(h.index,1);
    destArr.push(h.node);
    saveState(); ov.remove(); toast('Moved'); route();
  }));
  ov.querySelector('.move-cancel').addEventListener('click',()=>ov.remove());
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
};

/* ─── Scroll bar + other features: progress, scroll-to-top, smooth --- */
function initScrollFeatures(){
  if(document.getElementById('scrollProgress')) return;
  const bar=document.createElement('div'); bar.id='scrollProgress'; document.body.appendChild(bar);
  const btn=document.createElement('button'); btn.id='scrollTopBtn'; btn.innerHTML='&#8679;'; btn.title='Scroll to top'; btn.setAttribute('aria-label','Scroll to top'); document.body.appendChild(btn);
  btn.onclick=()=>{ const m=document.getElementById('main-content')||document.querySelector('.main'); if(m) m.scrollTo({top:0,behavior:'smooth'}); else window.scrollTo({top:0,behavior:'smooth'}); };
  const main=document.getElementById('main-content');
  const scroller = main || window;
  const target = main || document.documentElement;
  const onScroll=()=>{
    const el = main || document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max>0 ? (el.scrollTop / max * 100) : 0;
    bar.style.width = pct + '%';
    if(el.scrollTop>280) btn.classList.add('show'); else btn.classList.remove('show');
  };
  if(main) main.addEventListener('scroll', onScroll, {passive:true});
  else window.addEventListener('scroll', onScroll, {passive:true});
  // also observe hash change to reset
  window.addEventListener('hashchange', ()=>{ setTimeout(onScroll, 120); });
}
window._initScrollFeatures = initScrollFeatures;

/* ─── Init ─── */
window.route = route;
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', function(){
  if(!location.hash) location.hash = '#dashboard';
  route();
  initScrollFeatures();
});

})();
