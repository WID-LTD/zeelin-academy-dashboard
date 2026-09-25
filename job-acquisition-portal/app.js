/* ─── Job Acquisition Portal — Revamp SPA Engine (Cohort-Based) ─── */
(function(){
'use strict';

const STORE_KEY = 'zdash_cohort_v3';
let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw){ const p=JSON.parse(raw); return migrateState(p); }
  }catch(e){}
  return defaultState();
}
function defaultState(){
  return {
    activeView:'portal',
    cohortStart: new Date().toISOString(),
    boostApplications: JSON.parse(JSON.stringify(BOOST_INITIAL_APPLICATIONS || [])),
    cvDraft:{
      name:'Ike Wisdom Okemsinachi',
      title:'Senior Business Analyst & Supply Chain Specialist',
      email:'ike.wisdom@email.com',
      location:'London, UK',
      certs:'CCNA, Junior Cybersecurity Analyst',
      level:'Senior Specialist',
      industry:'Supply Chain Analytics & Enterprise Systems',
      summary:'Results-driven professional with rigorous work-experience enterprise training and verified credentials. Specialized in supply chain optimization, stakeholder elicitation, financial modeling, and advanced inventory carrying cost analysis.',
      jobDesc:'Seeking Senior Business Analyst with expertise in supply chain optimization, stakeholder elicitation, financial modeling, inventory carrying cost formulas, and advanced Microsoft Excel reporting standards.',
      template:'executive'
    },
    uploads:[],
    interviewBookings:[],
    linkedInProfile: null,
    linkedInExtras: { experiences: [], skills: [], visibility: {customUrl:false, creatorMode:false, featuredSection:false, openToWork:false}, activityLog: [] },
    proofDayOverride:null
  };
}
function migrateState(p){
  const d = defaultState();
  if(p.boostApplications) d.boostApplications = p.boostApplications;
  if(p.cvDraft) d.cvDraft = Object.assign(d.cvDraft, p.cvDraft);
  if(p.cohortStart) d.cohortStart = p.cohortStart;
  if(p.activeView) d.activeView = p.activeView;
  if(p.uploads) d.uploads = p.uploads;
  if(p.interviewBookings) d.interviewBookings = p.interviewBookings;
  if(p.linkedInProfile) d.linkedInProfile = p.linkedInProfile;
  if(p.linkedInExtras) d.linkedInExtras = { experiences: Array.isArray(p.linkedInExtras.experiences)?p.linkedInExtras.experiences:[], skills: Array.isArray(p.linkedInExtras.skills)?p.linkedInExtras.skills:[], visibility: Object.assign({customUrl:false,creatorMode:false,featuredSection:false,openToWork:false}, p.linkedInExtras.visibility||{}), activityLog: Array.isArray(p.linkedInExtras.activityLog)?p.linkedInExtras.activityLog:[] };
  if(Array.isArray(d.interviewBookings)){
    d.interviewBookings = d.interviewBookings.map(b=>({
      id: b.id || 'bk_'+Date.now()+Math.random().toString(36).slice(2,6),
      mentor: b.mentor || 'Dr. O. Emeka',
      date: b.date || new Date().toISOString(),
      anon: !!b.anon,
      type: b.type || 'live-mock',
      evidenceName: b.evidenceName || '',
      evidenceLink: b.evidenceLink || '',
      evidenceNotes: b.evidenceNotes || '',
      status: b.status || (b.evidenceName ? 'pending' : 'pending'),
      createdAt: b.createdAt || b.date || new Date().toISOString()
    }));
  }
  if(Array.isArray(p.boostApplications)){
    // ensure each has status, datePosted, dateApplied
    d.boostApplications = p.boostApplications.map(a=>({
      id:a.id||'b_'+Date.now()+Math.random().toString(36).slice(2,6),
      company:a.company||'Unknown',
      role:a.role||a.company||'Applied Role',
      link:a.link||'#',
      requirements:a.requirements||'',
      dateApplied:a.dateApplied||new Date().toISOString().slice(0,10),
      datePosted:a.datePosted||'',
      status:a.status||'applied'
    }));
  }
  return d;
}
function saveState(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){} }

/* ─── Helpers ─── */
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function svgPath(d, style){
  return '<svg style="'+(style||'width:18px;height:18px;fill:currentColor')+'" viewBox="0 0 24 24"><path d="'+d+'"/></svg>';
}
function fmtDate(iso){
  try{ const d=new Date(iso); if(isNaN(d)) return iso; return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return iso; }
}
function calcProof(){
  try{
    const start = new Date(state.cohortStart);
    const now = new Date();
    const diff = Math.floor((now - start)/86400000)+1;
    if(state.proofDayOverride!=null) return Math.min(30, Math.max(1, state.proofDayOverride));
    return Math.min(30, Math.max(1, diff));
  }catch{ return 7; }
}

/* ─── Router ─── */
function navigate(hash){
  // quota enforcement for progression
  const q = state.boostApplications.length;
  const blocked = ['cv-maker','cv-maker/cv','cv-maker/portfolio','interview-prep'];
  if(blocked.includes(hash) && q < 5){
    // redirect to boost or regional
    if(q < 1) { window.location.hash = 'regional-boards'; showToast('Complete at least 5 logged applications to unlock '+hash+' — redirected to Regional Job Boards'); return; }
    window.location.hash = 'boost';
    showToast('Quota not met ( '+q+'/5 ) — complete 5 applications before accessing '+hash+'. Redirected to Boost & Accountability');
    return;
  }
  window.location.hash = hash;
}
/* scraper presence probe — course-builder/ is gitignored, so production 404s */
window.__HAS_SCRAPER = undefined;
function probeScraper(){
  var done=function(ok){
    window.__HAS_SCRAPER = !!ok;
    try{
      var cur=String(location.hash||'').replace(/^#/,'');
      if(!ok && (cur==='portal' || cur.indexOf('portal/course-builder')===0 || cur.indexOf('portal/job-scraper')===0)) location.hash='overview';
    }catch(e){}
  };
  try{
    var c = (typeof AbortController!=='undefined') ? new AbortController() : null;
    var t = setTimeout(function(){ try{if(c) c.abort();}catch(e){} done(false); }, 4000);
    fetch('course-builder/index.html', {method:'HEAD', cache:'no-store', signal: c?c.signal:undefined}).then(function(r){ clearTimeout(t); done(r && r.ok); }).catch(function(){ clearTimeout(t); done(false); });
  }catch(e){ done(false); }
}
function route(){
  let h = (location.hash.slice(1) || 'portal').toLowerCase().replace(/^#/, '').replace(/\/+$/,'');
  // Dedicated portal selector: #portal and sub-routes portal/<name>/overview
  if(h==='portal/job-acquisition' || h==='portal/job-acquisition/overview' || h==='portal/job-acquisition-portal/overview' || h==='portal/job-acquisition-portal') h='overview';
  if(h==='portal/course-builder' || h==='portal/course-builder/overview' || h==='portal/job-scraper/overview' || h==='portal/job-scraper'){
    if(window.__HAS_SCRAPER===false){ h='overview'; }
    else { window.location.href='course-builder/'; return; }
  }
  if(h==='portal' && window.__HAS_SCRAPER===false) h='overview';
  const allowed = ['portal','overview','regional-boards','boost','cv-maker','cv-maker/cv','cv-maker/portfolio','interview-prep','events-hub','calendar','recordings','live-sessions','resources','help-support'];
  let view = h, param = null;
  if(h.startsWith('regional-boards/')){ view='regional-boards'; param=h.split('/')[1]||null; }
  else if(h==='cv-maker/cv'){ view='cv-maker/cv'; param=null; }
  else if(h==='cv-maker/portfolio'){ view='cv-maker/portfolio'; param=null; }
  else if(!allowed.includes(h)) view='portal';
  else param=null;
  state.activeView=view;
  // keep country param for regional-boards drill-down
  window._jbCountryParam = param;
  saveState();
  render(view, param);
}
function showToast(msg){
  let t=document.getElementById('_toast');
  if(!t){ t=document.createElement('div'); t.id='_toast'; t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1f1f1f;border:2px solid #d97706;color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:800;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.6);max-width:90vw;text-align:center;'; document.body.appendChild(t); }
  t.textContent=msg; t.style.display='block';
  clearTimeout(t._tm); t._tm=setTimeout(()=>t.style.display='none', 3200);
}

/* ─── Sidebar (inline styled) ─── */

/* ─── Exact Overview sidebar clone for every non-Overview Job Acquisition route ─── */
function overviewSidebarIcon(name){
  const paths={
    home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    bag:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2"/>',
    chart:'<path d="M4 20V10M10 20V5M16 20v-8M22 20V2"/><path d="m3 9 6-4 6 5 7-8"/>',
    doc:'<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v5h5M9 12h7M9 16h7"/>',
    book:'<path d="M3 5c4-2 7-1 9 1v15c-2-2-5-3-9-1zM21 5c-4-2-7-1-9 1v15c2-2 5-3 9-1z"/>',
    search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    image:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="m4 16 5-5 4 4 3-3 5 5M16 9h.01"/>',
    users:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20v-2c0-3 2-5 6-5s6 2 6 5v2M14 14c4-1 8 1 8 5v1"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.7 2.7 0 1 1 4.5 2c-1.5 1-2 1.5-2 3M12 18h.01"/>'
  };
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||paths.home)+'</svg>';
}
function overviewSidebarCopy(activeRoute){
  const active=(route)=>activeRoute===route || (route==='cv-maker' && String(activeRoute||'').startsWith('cv-maker/'));
  function item(label,route,icon,isActive,parent){
    return '<li class="nav-item'+(isActive?' active':'')+(parent?' parent':'')+'" tabindex="0" role="button" onclick="window._nav(\''+route+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();window._nav(\''+route+'\')}">'
      +overviewSidebarIcon(icon)+esc(label)+(parent?'<span class="chev">⌄</span>':'')+'</li>';
  }
  return ''
    + '<div class="brand"><div class="brand-mark" style="justify-content:center"><img decoding="async" fetchpriority="high" src="assets/logo.png" alt="Zeelin Academy Logo" style="height:42px;width:auto;object-fit:contain;background:transparent"></div></div>'
    + '<div class="system-title">ZEELIN JOB READINESS SYSTEM</div>'
    + '<ul class="nav-main">'
    + item('Dashboard','overview','home',active('overview'),false)
    + item('Portal','portal','menu',active('portal'),false)
    + '</ul>'
    + '<div class="stage">STAGE 3: CAREER GATE</div>'
    + '<ul class="nav-main">'+item('Placement Pipeline','regional-boards','bag',false,true)+'</ul>'
    + '<ul class="subnav">'
    + item('Regional Job Boards','regional-boards','bag',active('regional-boards'),false)
    + item('Boost & Accountability','boost','chart',active('boost'),false)
    + item('CV Maker & Portfolio','cv-maker','doc',active('cv-maker'),false)
    + '</ul>'
    + '<div class="divider"></div>'
    + '<ul class="nav-main">'
    + item('Learning Hub','resources','book',active('resources'),false)
    + item('Job Opportunities','regional-boards','search',false,false)
    + item('Resources','resources','image',active('resources'),false)
    + item('Community','resources','users',false,false)
    + item('Help & Support','help-support','help',active('help-support'),false)
    + '</ul>'
    + '<div class="journey"><p>“Your Global Career Journey Starts Here.”</p><div class="gold-stroke"></div></div>';
}

function overviewChromeSpriteCopy(){
  return '<svg width="0" height="0" style="position:absolute"><defs>'
    + '<symbol id="menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>'
    + '<symbol id="search" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></symbol>'
    + '<symbol id="bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></symbol>'
    + '<symbol id="chat" viewBox="0 0 24 24"><path d="M4 4h16v13H8l-4 4z"/></symbol>'
    + '</defs></svg>';
}
function overviewTopIconsCopy(){
  return '<div class="top-icons job-copied-top-icons"><div class="notification" tabindex="0" role="button" aria-label="Notifications, 3 unread" onclick="showToast(\'3 notifications\')" style="cursor:pointer"><svg class="ico"><use href="#bell"></use></svg><span class="badge">3</span></div><svg class="ico" tabindex="0" role="button" aria-label="Messages" onclick="showToast(\'Messages (demo)\')" style="cursor:pointer"><use href="#chat"></use></svg><div class="user" tabindex="0" role="button" aria-label="Open profile menu" aria-expanded="false" onclick="event.stopPropagation();var m=this.querySelector(\'.profile-menu\');var o=m.classList.toggle(\'open\');this.setAttribute(\'aria-expanded\',o?\'true\':\'false\')"><img decoding="async" class="avatar" src="assets/overview/avatar.jpg" alt="Wisdom Automa"><div><strong>Wisdom Automa</strong><span>Learner</span></div><span style="font-size:22px;color:#07143a">⌄</span><div class="profile-menu" role="menu" onclick="event.stopPropagation()"><button role="menuitem" onclick="showToast(\'Profile settings\')">Profile settings</button><button role="menuitem" onclick="showToast(\'Account settings\')">Account settings</button><button role="menuitem" onclick="window._nav(\'help-support\')">Help &amp; Support</button></div></div></div>';
}
function overviewTopbarCopy(options){
  const o=options||{};
  const burger=o.regional
    ? '<label class="ov-burger job-copied-burger" for="rbNavToggle" aria-label="Open navigation" aria-expanded="false"><svg class="ico" viewBox="0 0 24 24"><use href="#menu"></use></svg></label>'
    : '<button class="ov-burger job-copied-burger" onclick="document.getElementById(\'sidebar\')&&document.getElementById(\'sidebar\').classList.add(\'open\');document.getElementById(\'sidebarOverlay\')&&document.getElementById(\'sidebarOverlay\').classList.add(\'show\')" aria-label="Open navigation" aria-expanded="false"><svg class="ico" viewBox="0 0 24 24"><use href="#menu"></use></svg></button>';
  const portalMenu=o.hidePortalMenu?'':'<svg class="ico" onclick="window._nav(\'portal\')" style="cursor:pointer"><use href="#menu"></use></svg>';
  return '<header class="topbar job-copied-topbar">'
    + burger
    + portalMenu
    + '<div class="search"><svg class="ico" style="width:19px;flex-shrink:0;" aria-hidden="true"><use href="#search"></use></svg><input type="search" placeholder="Search for jobs, courses, resources..." aria-label="Search for jobs, courses, resources" onkeydown="if(event.key===\'Enter\'){window._nav(\'regional-boards\')}" style="flex:1;min-width:0;background:transparent;border:none;outline:none;color:#4c5772;font-size:14px;font-family:inherit;"></div>'
    + '</header><div class="job-copied-topbar-space" aria-hidden="true"></div>';
}


function renderSidebar(activeRoute){
  return overviewSidebarCopy(activeRoute);
}

/* ─── Topbar helper ─── */
function topbarHtml(title, rightHtml, progressPct){
  return overviewChromeSpriteCopy()+overviewTopIconsCopy()+overviewTopbarCopy({regional:false});
}

/* ─── Views ─── */
function viewPortal(){
  return topbarHtml('ZEELIN JOB ACQUISITION PORTAL \u2022 Select Workspace', '<span style="color:#f59e0b;font-weight:800;">Portal</span><span style="color:#a3a3a3;">zeelin.widltd.com.ng/job-acquisition-portal/#portal</span>', 100)
    + '<div class="jb-split" style="flex:1;display:flex;overflow:hidden;min-height:0;">'
    + '<div style="flex:1;padding:48px 52px;overflow-y:auto;background:#121212;">'
    + '<div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:28px;">'
    + '<div style="text-align:center;padding:8px 0 4px;">'
    + '<h1 style="font-size:32px;font-weight:900;color:#ffffff;margin:0 0 8px;letter-spacing:-0.5px;">Select Portal</h1>'
    + '<p style="font-size:14px;font-weight:700;color:#a3a3a3;margin:0;line-height:1.6;max-width:720px;margin-left:auto;margin-right:auto;">Choose your workspace. Each selection routes to <code style="background:#1f1f1f;border:1px solid #3a3a3a;padding:2px 6px;border-radius:4px;color:#f59e0b;font-weight:800;">portal/&lt;name&gt;/overview</code>. Course Builder (Job Scraper) lives at <code style="background:#1f1f1f;border:1px solid #3a3a3a;padding:2px 6px;border-radius:4px;color:#38bdf8;">course-builder/</code>.</p>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:24px;">'
    // Course Builder card (Job Scraper)
    + '<div style="background:linear-gradient(135deg,#1e1a0e,#181818);border:2px solid #3a3a3a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 12px 24px rgba(0,0,0,0.4);">'
    + '<div style="padding:22px 22px 16px;flex:1;display:flex;flex-direction:column;">'
    + '<div style="width:56px;height:56px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;box-shadow:0 0 14px rgba(245,158,11,.22);"><svg viewBox="0 0 24 24" width="28" height="28" fill="#111"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div>'
    + '<h3 style="font-size:19px;font-weight:900;color:#ffffff;margin:0 0 6px 0;">Course Builder</h3>'
    + '<p style="font-size:12px;font-weight:800;color:#f59e0b;margin:0 0 6px 0;letter-spacing:0.4px;text-transform:uppercase;">Job Scraper • Live Ingestion</p>'
    + '<p style="font-size:13px;font-weight:700;color:#d4d4d4;line-height:1.6;margin:0 0 14px 0;flex:1;">Formerly Job Scraper — live scrape 16 sources, Pathway Finder matcher, and Backward-Design curriculum generation. Build tailored courses from real job ads. Routes to <span style="color:#38bdf8;">portal/course-builder/overview</span> → <span style="color:#f59e0b;">course-builder/</span>.</p>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px;"><span style="font-size:11px;background:#26170b;color:#d97706;padding:4px 8px;border-radius:999px;border:1px solid #3d2411;font-weight:800;">Live Scrape</span><span style="font-size:11px;background:#26170b;color:#d97706;padding:4px 8px;border-radius:999px;border:1px solid #3d2411;font-weight:800;">Pathway Match</span><span style="font-size:11px;background:#26170b;color:#d97706;padding:4px 8px;border-radius:999px;border:1px solid #3d2411;font-weight:800;">Curriculum</span></div>'
    + '</div>'
    + '<div style="padding:14px 16px;background:#1a1a1a;border-top:2px solid #2a2a2a;display:flex;gap:10px;">'
    + '<button onclick="window.location.href=\'course-builder/\' " style="flex:1;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:1px solid #f59e0b;padding:12px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;">Open Course Builder →</button>'
    + '<button onclick="window._nav(\'portal/course-builder/overview\')" style="background:#262626;color:#f59e0b;border:2px solid #d97706;padding:12px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Route Demo</button>'
    + '</div>'
    + '</div>'
    // Job Acquisition card
    + '<div style="background:#181818;border:2px solid #d97706;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 12px 24px rgba(217,119,6,0.18);">'
    + '<div style="padding:22px 22px 16px;flex:1;display:flex;flex-direction:column;">'
    + '<div style="width:56px;height:56px;background:#26170b;border:2px solid rgba(217,119,6,.25);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;"><svg viewBox="0 0 24 24" width="28" height="28" fill="#d97706"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg></div>'
    + '<h3 style="font-size:19px;font-weight:900;color:#ffffff;margin:0 0 6px 0;">Job Acquisition Portal</h3>'
    + '<p style="font-size:12px;font-weight:800;color:#16a34a;margin:0 0 6px 0;letter-spacing:0.4px;text-transform:uppercase;">Cohort-Based • Multi-Job Training</p>'
    + '<p style="font-size:13px;font-weight:700;color:#d4d4d4;line-height:1.6;margin:0 0 14px 0;flex:1;">AI-matched Regional Job Boards, Boost accountability (5-job quota), CV Maker with AI API, and Interview Prep & Mock with timetable. Routes to <span style="color:#34d399;">portal/job-acquisition/overview</span>.</p>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px;"><span style="font-size:11px;background:#064e3b;color:#4ade80;padding:4px 8px;border-radius:999px;border:1px solid #14532d;font-weight:800;">AI Matcher 95%</span><span style="font-size:11px;background:#1e293b;color:#38bdf8;padding:4px 8px;border-radius:999px;border:1px solid #1e3a5f;font-weight:800;">ATS Ready</span></div>'
    + '</div>'
    + '<div style="padding:14px 16px;background:#161616;border-top:2px solid #3a3a3a;display:flex;gap:10px;">'
    + '<button onclick="window._nav(\'overview\')" style="flex:1;background:#16a34a;color:#fff;border:1px solid #22c55e;padding:12px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;">Enter Job Portal →</button>'
    + '<button onclick="window._nav(\'portal/job-acquisition/overview\')" style="background:#262626;color:#34d399;border:2px solid #16a34a;padding:12px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Route Demo</button>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="height:1px;background:#2a2a2a;margin:4px 0;"></div>'
    + '<div style="background:#181818;border:2px solid #3a3a3a;border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">'
    + '<div style="display:flex;align-items:center;gap:10px;"><div style="width:10px;height:10px;background:#16a34a;border-radius:50%;"></div><span style="font-size:13px;font-weight:800;color:#fff;">Landing route is <span style="color:#f59e0b;">#portal</span> — localhost:8092 defaults here. Selecting a portal routes to <span style="color:#34d399;">portal/&lt;name&gt;/overview</span></span></div>'
    + '<span style="font-size:11px;font-weight:700;color:#737373;">Course Builder: 16 sources • Job Acquisition: 5-job quota, AI CV, mocks</span>'
    + '</div>'
    + '</div></div></div>';
}
window._ovNav = function(open){
  var r = document.querySelector('.overview-root'); if(!r) return;
  var sb = r.querySelector('.sidebar'), ov = r.querySelector('.ov-overlay'), bg = r.querySelector('.ov-burger');
  if(sb) sb.classList.toggle('open', !!open);
  if(ov) ov.classList.toggle('open', !!open);
  if(bg) bg.setAttribute('aria-expanded', open ? 'true' : 'false');
};
if(!window._ovBound){
  window._ovBound = true;
  document.addEventListener('click', function(e){
    var r = e.target && e.target.closest ? e.target.closest('.overview-root') : null; if(!r) return;
    if(e.target.closest && e.target.closest('.sidebar.open a')) window._ovNav(false);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') window._ovNav(false);
    var t = e.target && e.target.closest ? e.target.closest('.overview-root [data-route],.overview-root [data-url]') : null;
    if(t && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); if(t.getAttribute('data-route')) window._nav(t.getAttribute('data-route')); else window.open(t.getAttribute('data-url'), '_blank'); }
  });
}
function viewOverview(){
  const q = state.boostApplications.length;
  const proofDay = calcProof();
  const proofPct = Math.round(proofDay/30*100);
  const daysLeft = 30 - proofDay;
  const pct = proofPct;
  const hasCV = q>0;
  const hasQuota = q>=5;
  const latestBoards = (typeof JOB_BOARDS!=='undefined'?JOB_BOARDS.slice(0,6):[]);
  const boardsHtml = latestBoards.map(b=>{
    const c=(typeof JOB_COUNTRIES!=='undefined'?JOB_COUNTRIES.find(x=>x.id===b.countryId):null);
    const loc=c?c.name:b.countryId;
    const host=(function(){try{return new URL(b.url).hostname.replace('www.','')}catch{return b.url}})();
    const tag=b.category==='remote'?'Remote':'Verified';
    const tagCls=b.category==='remote'?'tag blue':'tag';
    const logoInner=b.boardImg?'':esc(b.name.slice(0,3).toUpperCase());
    const logoStyle=b.boardImg?"background:url('"+esc(b.boardImg)+"') center/cover no-repeat":"";
    return '<article class="job" tabindex="0" role="button" aria-label="'+esc(b.name)+'" data-url="'+esc(b.url)+'" onclick="window.open(\''+esc(b.url)+'\',\'_blank\')"><div class="company-logo" style="'+logoStyle+'">'+logoInner+'</div><div><strong>'+esc(b.name)+'</strong><div class="company">'+esc(host)+'</div><div class="job-meta"><svg class="ico" style="width:13px"><use href="#pin"/></svg>'+esc(loc)+' <span class="'+tagCls+'">'+esc(tag)+'</span></div></div><svg class="ico" style="width:17px"><use href="#bookmark"/></svg></article>';
  }).join('');
  const overviewHtml = ''
    + '<style>'
    + '*{box-sizing:border-box} .overview-root{font-family:Inter,"Segoe UI",Arial,sans-serif;color:#07143a;background:#ffffff;min-width:0;min-height:945px} .overview-root .app{width:100%;max-width:1960px;margin:0 auto;min-height:945px;display:grid;grid-template-columns:307px minmax(0,1fr) 400px;background:#ffffff}'
    + '.overview-root .ico{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:inline-block;vertical-align:middle} .overview-root .ico.fill{fill:currentColor;stroke:none}'
    + '.overview-root .sidebar{height:945px;background:radial-gradient(circle at 110% 21%,rgba(200,147,35,.25),transparent 24%),linear-gradient(145deg,#102d4a 0%,#071b33 62%,#0a2746 100%);color:#f7fbff;padding:24px 15px 20px;position:relative;box-shadow:8px 0 22px rgba(15,40,68,.16);overflow-y:auto;overflow-x:hidden} .overview-root .sidebar{scrollbar-width:thin;scrollbar-color:#ffffff #ffffff} .overview-root .sidebar::-webkit-scrollbar{width:6px} .overview-root .sidebar::-webkit-scrollbar-track{background:#ffffff} .overview-root .sidebar::-webkit-scrollbar-thumb{background:#ffffff;border:1px solid #e8edf4;border-radius:999px} .overview-root .brand{height:104px;display:flex;align-items:flex-start;justify-content:center;border-bottom:1px solid rgba(255,255,255,.28);padding:0 0 23px} .overview-root .brand-mark{display:flex;align-items:center;gap:10px} .overview-root .system-title{font-size:15px;letter-spacing:1px;font-weight:800;margin:16px 7px 18px} .overview-root .nav-main,.overview-root .subnav{list-style:none;margin:0;padding:0} .overview-root .nav-item{height:50px;display:flex;align-items:center;gap:18px;padding:0 18px;border-radius:11px;font-size:15px;margin:2px 0;color:#f5f7fb;cursor:pointer} .overview-root .nav-item.active{background:linear-gradient(100deg,#ffe8a0,#edb640);color:#102341;font-weight:800;box-shadow:0 4px 16px rgba(242,193,72,.32)} .overview-root .stage{color:#ffc43e;font-weight:800;font-size:14px;letter-spacing:.3px;margin:19px 15px 12px} .overview-root .nav-item.parent{font-weight:700} .overview-root .chev{margin-left:auto} .overview-root .subnav .nav-item{height:46px;padding-left:44px;font-size:14px;gap:20px} .overview-root .divider{height:1px;background:rgba(255,255,255,.22);margin:10px 7px 12px} .overview-root .journey{height:160px;border:1px solid rgba(255,255,255,.15);border-radius:14px;margin-top:17px;padding:26px 24px;background:linear-gradient(90deg,rgba(6,20,38,.58),rgba(5,24,43,.2)),url(\'assets/overview/journey.jpg\') center/cover;color:white;position:relative;overflow:hidden;flex-shrink:0} .overview-root .journey p{margin:0;font-size:20px;line-height:1.28;font-weight:500;width:150px} .overview-root .gold-stroke{width:77px;height:4px;background:#ffc544;border-radius:99px;transform:rotate(-7deg);margin-top:18px}'
    + '.overview-root .workspace{min-width:0;overflow:hidden;display:flex;flex-direction:column;background:#ffffff} .overview-root .topbar{height:73px;background:rgba(255,255,255,.92);display:flex;align-items:center;padding:0 31px;gap:34px;border-bottom:1px solid #e8edf4;flex-shrink:0} .overview-root .search{width:445px;height:42px;border-radius:24px;background:#f1f4f8;display:flex;align-items:center;gap:16px;padding:0 18px;color:#4c5772;font-size:14px} .overview-root .main{padding:18px 22px 14px;overflow-y:auto;overflow-x:hidden;max-height:945px;background:#ffffff} .overview-root .main{scrollbar-width:thin;scrollbar-color:#ffffff #ffffff} .overview-root .main::-webkit-scrollbar{width:6px} .overview-root .main::-webkit-scrollbar-track{background:#ffffff} .overview-root .main::-webkit-scrollbar-thumb{background:#ffffff;border:1px solid #e8edf4;border-radius:999px} .overview-root .hero{height:auto;min-height:404px;border-radius:14px;background:#fff;overflow:hidden;position:relative;border:1px solid #e5eaf1;box-shadow:0 6px 18px rgba(27,50,85,.04);flex-shrink:0} .overview-root .hero-photo{position:absolute;right:0;top:0;width:47%;height:100%;object-fit:cover;object-position:center 25%;opacity:1;filter:none} .overview-root .hero-fade{display:none} .overview-root .hero-copy{position:relative;z-index:2;padding:28px 29px;width:52%} .overview-root .credential{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(90deg,#ffebac,#f3c86b);border-radius:9px;padding:8px 14px;color:#754300;font-size:13px;font-weight:800} .overview-root .check-dot{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#a56b00;color:white;font-size:12px} .overview-root .hero h1{font-size:42px;line-height:1.03;letter-spacing:-1.5px;margin:22px 0 11px;max-width:650px;color:#07143a} .overview-root .hero h1 span{color:#9d6500} .overview-root .hero p{font-size:15px;line-height:1.48;max-width:610px;margin:0 0 9px;color:#07143a} .overview-root .hero .strong{font-weight:800} .overview-root .hero-actions{display:flex;gap:18px;margin-top:18px} .overview-root .btn{height:50px;border-radius:12px;padding:0 25px;display:inline-flex;align-items:center;gap:13px;font-size:15px;font-weight:800;border:1px solid #0b2449;background:white;color:#07143a;cursor:pointer} .overview-root .btn.primary{background:linear-gradient(100deg,#d99a0a,#e6b939);color:white;border-color:#d49a10;box-shadow:0 6px 13px rgba(192,132,0,.2)} .overview-root .hero-motto{position:absolute;left:295px;bottom:17px;display:flex;align-items:center;gap:16px;color:#697183;font-size:9px;letter-spacing:5px} .overview-root .hero-motto:before{content:"";width:27px;height:2px;background:#b77a05} .overview-root .script{position:absolute;z-index:2;right:18px;top:60px;width:145px;color:#13203d;font-family:"Segoe Script","Bradley Hand",cursive;font-size:24px;line-height:1.55;transform:rotate(-6deg)} .overview-root .script:after{content:"";display:block;width:90px;height:2px;background:#b37700;margin:8px 0 0 10px;transform:rotate(-6deg)}'
    + '.overview-root .feature-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px} .overview-root .feature{height:177px;border-radius:13px;padding:15px 20px;position:relative;border:1px solid #e5ecf5;box-shadow:0 5px 14px rgba(33,65,104,.07);cursor:pointer;overflow:hidden} .overview-root .feature.blue{background:linear-gradient(135deg,#eef7ff,#f8fbff)} .overview-root .feature.green{background:linear-gradient(135deg,#edfdf8,#f7fffc)} .overview-root .feature.purple{background:linear-gradient(135deg,#f3efff,#fbfaff)} .overview-root .feature.gold{background:linear-gradient(135deg,#fff8e8,#fffdfa)} .overview-root .feature-icon{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;margin-bottom:10px} .overview-root .blue .feature-icon{background:#cbe2ff;color:#0c459c} .overview-root .green .feature-icon{background:#c7f2e6;color:#008c68} .overview-root .purple .feature-icon{background:#dfc9ff;color:#4e248c} .overview-root .gold .feature-icon{background:#ffe9b2;color:#995d00} .overview-root .feature h3{font-size:16px;margin:0 0 10px;color:#07143a} .overview-root .feature p{font-size:13px;line-height:1.45;color:#344266;margin:0;width:86%} .overview-root .circle-arrow{position:absolute;right:15px;bottom:16px;width:36px;height:36px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:23px;box-shadow:0 2px 8px rgba(16,37,73,.12)} .overview-root .blue .circle-arrow{color:#1756c5;border:1px solid #bed7ff} .overview-root .green .circle-arrow{color:#008b6a;border:1px solid #b8ebde} .overview-root .purple .circle-arrow{color:#6033b8;border:1px solid #d8c5fb} .overview-root .gold .circle-arrow{color:#a36500;border:1px solid #f2d28d}'
    + '.overview-root .opps-head{display:flex;align-items:center;justify-content:space-between;margin:20px 5px 11px} .overview-root .opps-head h2{font-size:20px;margin:0 0 2px;color:#07143a} .overview-root .opps-head p{margin:0;color:#64708a;font-size:13px} .overview-root .view-all{font-size:13px;color:#0758cf;font-weight:700;cursor:pointer} .overview-root .jobs{display:grid;grid-template-columns:repeat(3,1fr);gap:12px} .overview-root .job{height:90px;background:white;border:1px solid #dbe4ee;border-radius:12px;padding:15px 17px;display:grid;grid-template-columns:52px 1fr 18px;gap:13px;box-shadow:0 3px 8px rgba(26,52,86,.04);cursor:pointer;overflow:hidden;min-width:0} .overview-root .company-logo{height:48px;width:48px;border:1px solid #dfe6ed;border-radius:6px;display:grid;place-items:center;font-weight:900;font-size:14px;color:#104690;background:#f6f9fc;overflow:hidden} .overview-root .job strong{font-size:13px;color:#07143a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block} .overview-root .job .company{font-size:12px;margin-top:5px;color:#07143a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .overview-root .job-meta{font-size:11px;color:#5f6980;margin-top:6px;display:flex;align-items:center;gap:4px} .overview-root .tag{margin-left:auto;border-radius:7px;padding:4px 9px;background:#d8f6e9;color:#007d61;flex-shrink:0} .overview-root .tag.blue{background:#dfeaff;color:#0756c5} .overview-root .support{height:62px;border:1px solid #d9e2ec;border-radius:12px;margin-top:17px;background:#fff;display:flex;align-items:center;padding:0 18px;flex-shrink:0} .overview-root .support-icon{width:39px;height:39px;border-radius:50%;background:#fff4cf;color:#b67b00;display:grid;place-items:center;margin-right:14px;flex-shrink:0} .overview-root .support strong{font-size:13px;color:#07143a} .overview-root .support p{font-size:12px;color:#5f6980;margin:4px 0 0} .overview-root .support .btn{margin-left:auto;height:40px;padding:0 20px;font-size:12px;border-radius:10px;flex-shrink:0}'
    + '.overview-root .right{height:945px;padding:91px 20px 14px 0;background:#ffffff;overflow-y:auto;overflow-x:hidden;flex-shrink:0} .overview-root .right{scrollbar-width:thin;scrollbar-color:#ffffff #ffffff} .overview-root .right::-webkit-scrollbar{width:6px} .overview-root .right::-webkit-scrollbar-track{background:#ffffff} .overview-root .right::-webkit-scrollbar-thumb{background:#ffffff;border:1px solid #e8edf4;border-radius:999px} .overview-root .tracker{height:auto;min-height:480px;background:white;border:1px solid #e8edf3;border-radius:12px;padding:24px;box-shadow:0 8px 18px rgba(25,53,88,.05);flex-shrink:0} .overview-root .eyebrow{display:flex;align-items:center;justify-content:space-between;color:#a05f00;font-weight:800;font-size:13px;letter-spacing:.3px} .overview-root .eyebrow a{color:#075acb;text-decoration:none;font-size:12px} .overview-root .tracker h2{font-size:22px;margin:17px 0 5px;color:#07143a} .overview-root .subtle{color:#68738d;font-size:14px} .overview-root .progress-row{display:grid;grid-template-columns:124px 1fr;gap:19px;margin-top:17px} .overview-root .ring{width:122px;height:122px;border-radius:50%;background:conic-gradient(#0c3b70 0 45%,#075ba8 45% 76%,#b8cee6 76% 100%);display:grid;place-items:center;transform:rotate(-4deg);position:relative;flex-shrink:0} .overview-root .ring:after{content:"";width:91px;height:91px;background:#fff;border-radius:50%;position:absolute} .overview-root .ring-text{position:relative;z-index:1;text-align:center;transform:rotate(4deg)} .overview-root .ring-text b{font-size:27px;display:block;color:#07143a} .overview-root .ring-text span{font-size:12px;color:#53617d} .overview-root .progress-copy{padding-top:14px;min-width:0} .overview-root .progress-copy strong{font-size:14px;color:#07143a} .overview-root .bar{height:12px;border-radius:8px;background:#e0e8f2;margin:16px 0 8px;overflow:hidden} .overview-root .bar span{display:block;width:'+pct+'%;height:100%;background:#bc7900;border-radius:8px} .overview-root .percent{text-align:right;font-weight:800;font-size:13px;color:#07143a} .overview-root .progress-copy p{font-size:12px;line-height:1.35;color:#485574;margin:12px 0 0} .overview-root .current{color:#b16a00;font-weight:800;margin-top:4px;font-size:12px} .overview-root .checklist{background:#f5f8fb;border-radius:12px;padding:12px 15px;margin-top:17px} .overview-root .check-row{height:38px;display:flex;align-items:center;gap:16px;font-size:14px;color:#07143a} .overview-root .box{width:23px;height:23px;border-radius:5px;border:1px solid #aebbd0;display:grid;place-items:center;color:white;font-size:12px;flex-shrink:0} .overview-root .box.done{background:#10a477;border-color:#10a477;font-weight:900} .overview-root .motivation{height:226px;border-radius:13px;margin-top:13px;background:linear-gradient(90deg,rgba(5,29,54,.93),rgba(3,24,47,.35)),url(\'assets/overview/motivation.jpg\') center/cover;color:#fff;padding:40px 31px;flex-shrink:0} .overview-root .motivation h3{font-size:26px;line-height:.98;margin:0 0 15px;width:185px;color:#fff} .overview-root .motivation p{font-size:14px;line-height:1.5;width:195px;margin:0;color:#fff} .overview-root .quote{height:106px;margin-top:12px;background:white;border-radius:13px;padding:22px 22px;display:flex;align-items:center;color:#1a2a55;font-family:Georgia,serif;font-style:italic;font-size:15px;line-height:1.4;flex-shrink:0} .overview-root .quote-mark{font-size:78px;color:#eef1f4;line-height:1;margin-right:15px;font-family:Georgia,serif} .overview-root .top-icons{position:absolute;right:38px;top:0;height:73px;display:flex;align-items:center;gap:27px;color:#07143a} .overview-root .notification{position:relative} .overview-root .badge{position:absolute;right:-10px;top:-9px;width:18px;height:18px;border-radius:50%;background:#e21b2d;color:#fff;font-size:10px;display:grid;place-items:center;border:2px solid white} .overview-root .user{display:flex;align-items:center;gap:10px;border-left:1px solid #e6ebf2;padding-left:19px;margin-left:3px} .overview-root .avatar{width:47px;height:47px;border-radius:50%;object-fit:cover;filter:grayscale(1)} .overview-root .user strong{display:block;font-size:13px;color:#07143a} .overview-root .user span{display:block;font-size:11px;color:#697590;margin-top:4px}'
    + '.overview-root .nav-item{transition:background .18s ease,transform .18s ease}.overview-root .nav-item:hover{background:rgba(255,255,255,.14);transform:translateX(4px)}.overview-root .nav-item.active:hover{transform:none}.overview-root .feature{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.overview-root .feature:hover{transform:translateY(-5px);box-shadow:0 12px 28px rgba(27,50,85,.14)}.overview-root .feature.blue:hover{border-color:#1756c5}.overview-root .feature.green:hover{border-color:#008b6a}.overview-root .feature.purple:hover{border-color:#6033b8}.overview-root .feature.gold:hover{border-color:#a36500}.overview-root .circle-arrow{transition:transform .2s ease}.overview-root .feature:hover .circle-arrow{transform:translateX(4px)}.overview-root .job{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.overview-root .job:hover{transform:translateY(-3px);border-color:#0758cf;box-shadow:0 8px 20px rgba(7,88,207,.14)}.overview-root .btn{transition:transform .18s ease,box-shadow .18s ease,filter .18s ease}.overview-root .btn:hover{transform:translateY(-2px);filter:brightness(1.04);box-shadow:0 8px 18px rgba(27,50,85,.16)}.overview-root .btn.primary:hover{box-shadow:0 10px 24px rgba(192,132,0,.38)}.overview-root .view-all{transition:color .15s ease}.overview-root .view-all:hover{text-decoration:underline;color:#043a8f}.overview-root .check-row{transition:background .15s ease;border-radius:8px}.overview-root .check-row:hover{background:#eef4fb}.overview-root .notification,.overview-root .user{transition:transform .15s ease}.overview-root .notification:hover{transform:scale(1.1)}.overview-root .eyebrow a:hover{text-decoration:underline}.overview-root .journey{transition:box-shadow .2s ease}.overview-root .journey:hover{box-shadow:0 10px 28px rgba(15,40,68,.35)}#main-content::-webkit-scrollbar{width:10px;height:10px}#main-content::-webkit-scrollbar-track{background:#ffffff}#main-content::-webkit-scrollbar-thumb{background:#ffffff;border:1px solid #e8edf4;border-radius:999px}#main-content{scrollbar-width:thin;scrollbar-color:#ffffff #ffffff}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#ffffff;border:none}::-webkit-scrollbar-thumb{background:#ffffff;border:1px solid #e8edf4;border-radius:999px}::-webkit-scrollbar-thumb:hover{background:#ffffff;border-color:#e8edf4}::-webkit-scrollbar-corner{background:#ffffff}*{scrollbar-color:#ffffff #ffffff}.overview-root .ov-burger{display:none}.overview-root .ov-overlay{display:none}.overview-root .ov-bottomnav{display:none}.overview-root .ov-skip{position:absolute;left:-9999px;top:0;background:#07143a;color:#fff;padding:10px 16px;z-index:200;border-radius:0 0 8px 0;font-weight:800;font-size:13px}.overview-root .ov-skip:focus{left:0}.overview-root .search input::placeholder{color:#8a94a8}@media(max-width:1279px){.overview-root{min-height:100dvh}.overview-root .app{display:flex;flex-direction:column;min-height:0}.overview-root .workspace{width:100%;overflow:visible}.overview-root .main{max-height:none;overflow:visible}.overview-root .right{max-height:none;overflow:visible}.overview-root .workspace{min-width:0}.overview-root .hero{height:auto}.overview-root .hero-motto{display:none}.overview-root .right{height:auto;width:100%;padding:20px;display:flex;flex-direction:column;gap:14px}.overview-root .tracker{height:auto}.overview-root .top-icons{position:static;height:auto;margin-left:auto;margin-bottom:0}.overview-root .feature-grid{grid-template-columns:repeat(2,1fr)}.overview-root .jobs{grid-template-columns:repeat(2,1fr)}}@media(max-width:1279px){.overview-root .sidebar{position:fixed;left:0;top:0;bottom:0;width:300px;max-width:86vw;height:100dvh;z-index:90;transform:translateX(-106%);transition:transform .25s ease;border-radius:0 16px 16px 0}.overview-root .sidebar.open{transform:none}.overview-root .ov-overlay.open{display:block;position:fixed;inset:0;background:rgba(7,20,58,.45);z-index:80}.overview-root .topbar > svg.ico{display:none}.overview-root .ov-burger{display:inline-flex;width:42px;height:42px;flex-shrink:0;align-items:center;justify-content:center;background:#fff;border:1px solid #e8edf4;border-radius:12px;color:#07143a;cursor:pointer}.overview-root .topbar{flex-wrap:wrap;height:auto;row-gap:10px}.overview-root .search{flex:1;min-width:200px;width:auto}}@media(max-width:767px){.overview-root .topbar{padding:12px 14px;gap:10px}.overview-root .search{order:3;flex-basis:100%}.overview-root .user div{display:none}.overview-root .top-icons{margin-left:auto;gap:14px}.overview-root .avatar{width:36px;height:36px}.overview-root .user{border-left:none;padding-left:0}.overview-root .user>span{display:none}.overview-root .hero{height:auto;display:flex;flex-direction:column}.overview-root .hero-photo{position:relative;width:100%;height:130px;order:-1}.overview-root .hero-copy{width:100%;padding:14px}.overview-root .credential{font-size:11px;padding:6px 10px;gap:8px}.overview-root .hero h1{font-size:clamp(22px,6.4vw,28px);margin:12px 0 8px}.overview-root .hero p{font-size:13px;margin:0 0 6px}.overview-root .hero .strong{font-size:13px}.overview-root .hero-actions{flex-direction:row;gap:8px;margin-top:10px}.overview-root .hero-actions .btn{flex:1 1 0;min-width:0;width:auto;justify-content:center;height:auto;min-height:44px;padding:7px 8px;font-size:12px;line-height:1.25}.overview-root .script,.overview-root .hero-motto{display:none}.overview-root .app,.overview-root .workspace,.overview-root .right{height:auto!important;max-height:none!important;overflow:visible;min-height:0}.overview-root .feature-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.overview-root .feature{height:auto;min-height:148px;padding:12px}.overview-root .feature-icon{width:44px;height:44px}.overview-root .feature h3{font-size:13px}.overview-root .feature p{font-size:11px}.overview-root .circle-arrow{width:28px;height:28px;font-size:18px;right:10px;bottom:10px}.overview-root .jobs{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.overview-root .job{height:auto;min-height:0;aspect-ratio:1/1;padding:12px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;position:relative}.overview-root .job>svg.ico{position:absolute;top:10px;right:10px;width:16px}.overview-root .company-logo{height:44px;width:44px;font-size:12px}.overview-root .job strong{font-size:12px}.overview-root .job .company{font-size:11px;margin-top:0}.overview-root .job-meta{flex-wrap:wrap;row-gap:2px;font-size:10px;margin-top:auto}.overview-root .tag{padding:3px 7px}.overview-root .support{height:auto;flex-wrap:wrap;padding:14px;gap:10px}.overview-root .support .btn{margin-left:0;width:100%}.overview-root .main{max-height:none;overflow:visible;padding:14px 14px 96px}.overview-root .right{padding:16px 14px 96px}.overview-root .ov-bottomnav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:95;background:rgba(255,255,255,.97);border-top:1px solid #e8edf4;padding:8px 6px calc(8px + env(safe-area-inset-bottom))}.overview-root .ov-bottomnav a{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:800;color:#5f6980;text-decoration:none;padding:6px 2px;border-radius:10px}.overview-root .ov-bottomnav a.active{color:#9d6500}.overview-root .ov-bottomnav .ico{width:22px;height:22px}}@media(max-width:639px){.overview-root .top-icons{gap:16px}}@media(min-width:2000px){.overview-root .app{max-width:2400px}.overview-root .hero h1{font-size:48px}.overview-root .feature-grid,.overview-root .jobs{gap:16px}}@media(min-width:2560px){.overview-root .app{max-width:3000px;grid-template-columns:320px minmax(0,1fr) 440px}.overview-root .hero h1{font-size:56px}.overview-root .hero p{font-size:16px}.overview-root .feature-grid{grid-template-columns:repeat(4,1fr);gap:20px}.overview-root .jobs{gap:20px}}@media(min-width:1280px) and (max-width:1450px){.overview-root .app{grid-template-columns:260px minmax(0,1fr) 330px}.overview-root .sidebar{height:100dvh;min-height:945px;padding-left:10px;padding-right:10px}.overview-root .right{height:100dvh;min-height:945px;padding-right:14px}.overview-root .topbar{padding-left:22px;padding-right:22px;gap:20px}.overview-root .search{width:min(390px,38vw)}.overview-root .main{padding-left:16px;padding-right:16px}.overview-root .hero h1{font-size:34px}.overview-root .hero-copy{padding:24px 22px}.overview-root .feature{padding-left:13px;padding-right:10px}.overview-root .feature h3{font-size:13px}.overview-root .feature p{font-size:11px}.overview-root .tracker{padding:18px}.overview-root .progress-row{grid-template-columns:100px 1fr;gap:12px}.overview-root .ring{width:98px;height:98px}.overview-root .ring:after{width:72px;height:72px}.overview-root .ring-text b{font-size:22px}.overview-root .check-row{font-size:12px;gap:10px}}@media(max-width:1450px) and (min-width:768px){.overview-root .app{grid-template-columns:280px minmax(0,1fr) 360px} .overview-root .hero{display:flex;flex-direction:column} .overview-root .hero-photo{position:relative;width:100%;height:230px;order:-1} .overview-root .hero-copy{width:100%} .overview-root .script{display:none} .overview-root .sidebar{padding-left:12px;padding-right:12px} .overview-root .right{padding-left:0} .overview-root .hero h1{font-size:37px} .overview-root .feature{padding-left:15px;padding-right:12px} .overview-root .feature h3{font-size:14px} .overview-root .progress-row{grid-template-columns:112px 1fr} .overview-root .ring{width:110px;height:110px} .overview-root .ring:after{width:80px;height:80px}}'
    + '<style>.overview-root .user{position:relative;cursor:pointer;border-radius:12px;padding-top:7px;padding-bottom:7px;padding-right:9px;transition:transform .18s ease,background .18s ease,box-shadow .18s ease}.overview-root .user:hover,.overview-root .user:focus-within{transform:translateY(-2px);background:#f7f9fc;box-shadow:0 6px 18px rgba(27,50,85,.10)}.overview-root .avatar{transition:transform .2s ease,box-shadow .2s ease}.overview-root .user:hover .avatar{transform:scale(1.06);box-shadow:0 0 0 3px #f2c65d}.overview-root .profile-menu{display:none;position:absolute;right:0;top:62px;width:190px;background:#fff;border:1px solid #e1e7ef;border-radius:12px;padding:7px;box-shadow:0 14px 34px rgba(20,40,70,.18);z-index:120}.overview-root .profile-menu.open{display:block;animation:ovMenuIn .16s ease-out}.overview-root .profile-menu button{width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:8px;color:#07143a;font:600 13px inherit;cursor:pointer}.overview-root .profile-menu button:hover{background:#f1f4f8}@keyframes ovMenuIn{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}@media(min-width:1280px) and (max-width:1450px){.overview-root .app{grid-template-columns:250px minmax(0,1fr) 310px}.overview-root .topbar{padding:0 18px;gap:16px}.overview-root .search{width:min(360px,36vw)}.overview-root .main{padding:16px 14px}.overview-root .right{padding:82px 12px 14px 0}.overview-root .tracker{padding:16px}.overview-root .progress-row{grid-template-columns:92px minmax(0,1fr);gap:10px}.overview-root .ring{width:90px;height:90px}.overview-root .ring:after{width:66px;height:66px}.overview-root .ring-text b{font-size:20px}.overview-root .hero h1{font-size:32px}.overview-root .hero-copy{padding:22px 20px}.overview-root .feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.overview-root .feature{height:auto;min-height:155px;padding:14px 16px 48px}.overview-root .feature p{width:100%;overflow-wrap:anywhere}.overview-root .jobs{grid-template-columns:repeat(2,minmax(0,1fr))}.overview-root .job{height:auto;min-height:102px}.overview-root .job-meta{flex-wrap:wrap}.overview-root .tag{margin-left:0}.overview-root .check-row{height:auto;min-height:38px;line-height:1.3;padding:5px 0}}@media(max-width:1279px){.overview-root .feature{height:auto;min-height:155px;padding-bottom:48px}.overview-root .feature p{width:100%;overflow-wrap:anywhere}.overview-root .job{height:auto;min-height:102px}.overview-root .job-meta{flex-wrap:wrap}.overview-root .tag{margin-left:0}.overview-root .support{min-height:62px;height:auto}.overview-root .check-row{height:auto;min-height:38px;line-height:1.3;padding:5px 0}}@media(max-width:767px){.overview-root .feature{min-height:165px}.overview-root .job{aspect-ratio:auto;min-height:150px}.overview-root .profile-menu{position:fixed;right:12px;top:68px}.overview-root .user{padding:4px}}</style>'
    + '<style>/* Fluid Overview layout */.overview-root{width:100%;min-width:0;min-height:100dvh}.overview-root .app{width:100%;max-width:1960px;margin:0 auto;min-height:100dvh;grid-template-columns:clamp(240px,16vw,307px) minmax(0,1fr) clamp(300px,21vw,400px)}.overview-root .sidebar{width:auto;height:100dvh;min-height:0;padding-left:clamp(10px,1vw,15px);padding-right:clamp(10px,1vw,15px)}.overview-root .workspace{min-width:0;width:100%;overflow:hidden}.overview-root .topbar{width:100%;padding-left:clamp(16px,1.65vw,31px);padding-right:clamp(16px,1.65vw,31px);gap:clamp(14px,1.8vw,34px)}.overview-root .search{width:clamp(220px,29vw,445px);max-width:100%;min-width:0}.overview-root .main{width:100%;min-width:0;max-height:none;height:calc(100dvh - 73px);padding:clamp(14px,1.15vw,22px);padding-top:clamp(14px,.95vw,18px)}.overview-root .right{width:auto;height:100dvh;min-height:0;padding-top:clamp(78px,4.8vw,91px);padding-right:clamp(12px,1.05vw,20px)}.overview-root .hero{width:100%;min-width:0;min-height:clamp(360px,21vw,404px)}.overview-root .hero-copy{padding:clamp(20px,1.5vw,29px);min-width:0}.overview-root .hero h1{font-size:clamp(30px,2.2vw,42px)}.overview-root .hero p{font-size:clamp(13px,.8vw,15px)}.overview-root .hero-actions{gap:clamp(9px,.95vw,18px);flex-wrap:wrap}.overview-root .btn{padding-left:clamp(14px,1.3vw,25px);padding-right:clamp(14px,1.3vw,25px)}.overview-root .feature-grid{grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));gap:clamp(10px,.65vw,12px)}.overview-root .feature{width:100%;min-width:0;height:auto;min-height:177px;padding:clamp(13px,1vw,20px);padding-bottom:48px}.overview-root .feature h3,.overview-root .feature p{max-width:100%;overflow-wrap:anywhere}.overview-root .feature p{width:100%}.overview-root .jobs{grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:clamp(10px,.65vw,12px)}.overview-root .job{width:100%;min-width:0;height:auto;min-height:90px}.overview-root .job>div{min-width:0}.overview-root .job-meta{flex-wrap:wrap}.overview-root .tag{margin-left:0}.overview-root .support{width:100%;min-width:0;height:auto;min-height:62px}.overview-root .support>div{min-width:0}.overview-root .tracker{width:100%;min-width:0;height:auto;min-height:480px;padding:clamp(16px,1.25vw,24px)}.overview-root .progress-row{grid-template-columns:clamp(88px,6.4vw,124px) minmax(0,1fr);gap:clamp(10px,1vw,19px)}.overview-root .ring{width:clamp(88px,6.3vw,122px);height:clamp(88px,6.3vw,122px)}.overview-root .ring:after{width:72%;height:72%}.overview-root .motivation,.overview-root .quote{width:100%;min-width:0}.overview-root .check-row{height:auto;min-height:38px;line-height:1.35;padding:4px 0}.overview-root .top-icons{right:clamp(16px,2vw,38px);gap:clamp(14px,1.4vw,27px)}@media(max-width:1279px){.overview-root .app{display:flex;min-height:100dvh}.overview-root .workspace{overflow:visible}.overview-root .main{height:auto;overflow:visible}.overview-root .right{height:auto;min-height:0;padding:20px clamp(14px,2vw,24px) 24px}.overview-root .feature-grid{grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr))}.overview-root .jobs{grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))}}@media(max-width:767px){.overview-root .topbar{padding:12px 14px}.overview-root .main{padding:14px 14px 96px}.overview-root .right{padding:16px 14px 96px}.overview-root .feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.overview-root .jobs{grid-template-columns:repeat(2,minmax(0,1fr))}.overview-root .feature{min-height:165px}.overview-root .job{min-height:150px}.overview-root .hero h1{font-size:clamp(22px,6.4vw,28px)}}@media(max-width:479px){.overview-root .feature-grid,.overview-root .jobs{grid-template-columns:1fr}.overview-root .feature,.overview-root .job{min-height:0}.overview-root .hero-actions{flex-direction:column}.overview-root .hero-actions .btn{width:100%}}</style>'
    + '<style>/* Sidebar fluid correction from client-screen verification */@media(min-width:1280px){.overview-root .app{grid-template-columns:clamp(210px,13.5vw,270px) minmax(0,1fr) clamp(280px,19vw,360px)}.overview-root .sidebar{width:100%;min-width:0}.overview-root .brand{height:clamp(82px,5.4vw,104px)}.overview-root .system-title{font-size:clamp(12px,.78vw,15px);margin-left:clamp(4px,.4vw,7px);margin-right:clamp(4px,.4vw,7px)}.overview-root .nav-item{padding-left:clamp(10px,.9vw,18px);padding-right:clamp(10px,.9vw,18px);gap:clamp(10px,.9vw,18px);font-size:clamp(12px,.78vw,15px)}.overview-root .subnav .nav-item{padding-left:clamp(24px,2.3vw,44px);font-size:clamp(12px,.73vw,14px)}.overview-root .stage{font-size:clamp(11px,.73vw,14px);margin-left:clamp(8px,.8vw,15px);margin-right:clamp(8px,.8vw,15px)}.overview-root .journey{padding:clamp(16px,1.25vw,24px);height:auto;min-height:140px}.overview-root .journey p{font-size:clamp(16px,1.05vw,20px);width:auto;max-width:150px}}@media(min-width:1280px) and (max-width:1450px){.overview-root .app{grid-template-columns:220px minmax(0,1fr) 290px}.overview-root .sidebar{padding-left:8px;padding-right:8px}.overview-root .nav-item{padding-left:10px;padding-right:10px;gap:10px}.overview-root .subnav .nav-item{padding-left:24px}.overview-root .right{padding-right:10px}}</style>'
    + '<style>/* Keep overview utility header visible while dashboard content scrolls */.overview-root .workspace{position:relative}.overview-root .topbar{position:sticky;top:0;z-index:75;background:#ffffff;box-shadow:0 1px 0 #e8edf4,0 8px 22px rgba(27,50,85,.06);isolation:isolate}.overview-root .topbar:before{content:"";position:absolute;inset:0;background:#ffffff;z-index:-1}.overview-root .search{background:#f1f4f8}.overview-root .top-icons{z-index:2}.overview-root .profile-menu{z-index:130}@media(min-width:1280px){.overview-root .main{height:auto;max-height:none;overflow:visible}.overview-root .workspace{overflow:visible}.overview-root .right{position:sticky;top:0;align-self:start;max-height:100dvh;overflow-y:auto}}@media(max-width:1279px){.overview-root .topbar{position:sticky;top:0}.overview-root .profile-menu{z-index:130}}</style>'
    + '<style>/* Overview stability audit */.overview-root .app>*{min-width:0}.overview-root .topbar{min-width:0}.overview-root .search input{width:100%;min-width:0}.overview-root .top-icons{max-width:calc(100% - 70px)}.overview-root .opps-head{gap:16px;min-width:0}.overview-root .opps-head>div:first-child{min-width:0}.overview-root .view-all{flex-shrink:0}.overview-root .support>div:nth-child(2){min-width:0;flex:1}.overview-root .support p{overflow-wrap:anywhere}.overview-root .motivation{height:auto;min-height:226px}.overview-root .motivation h3,.overview-root .motivation p{max-width:100%;overflow-wrap:anywhere}.overview-root .quote{height:auto;min-height:106px}.overview-root .profile-menu{cursor:default}.overview-root .profile-menu button{display:block}@media(min-width:1280px){.overview-root .sidebar{position:sticky;top:0;align-self:start;max-height:100dvh}.overview-root .right{height:auto;min-height:100dvh}.overview-root .feature-grid,.overview-root .jobs{align-items:stretch}.overview-root .feature,.overview-root .job{align-self:stretch}}@media(max-width:1279px){.overview-root .right{position:relative;top:auto;max-height:none;overflow:visible}.overview-root .opps-head{flex-wrap:wrap}.overview-root .support{flex-wrap:wrap;row-gap:10px}.overview-root .support .btn{margin-left:auto}}@media(max-width:767px){.overview-root .top-icons{max-width:none}.overview-root .opps-head{align-items:flex-start}.overview-root .view-all{font-size:12px}.overview-root .support .btn{width:100%;margin-left:0}.overview-root .profile-menu{display:none!important}.overview-root .profile-menu.open{display:block!important}.overview-root .user>.profile-menu{position:fixed!important;right:12px!important;top:68px!important;width:min(190px,calc(100vw - 24px))!important}.overview-root .user>.profile-menu button{display:block!important}.overview-root .user>.profile-menu{visibility:visible}}@media(max-width:479px){.overview-root .opps-head{display:block}.overview-root .view-all{margin-top:8px;display:inline-block}}</style>'
    + '<style>/* Guardrails: approved grid designs (must stay last) */@media(min-width:1280px){.overview-root .jobs{grid-template-columns:repeat(3,1fr)}.overview-root .feature-grid{grid-template-columns:repeat(4,1fr)}.overview-root .job{height:90px;min-height:0}.overview-root .feature{height:auto;min-height:177px;padding:15px 20px 46px}}@media(max-width:767px){.overview-root .hero-actions{flex-direction:row}.overview-root .hero-actions .btn{flex:1 1 0;min-width:0;width:auto}.overview-root .jobs{grid-template-columns:repeat(2,minmax(0,1fr))}.overview-root .feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.overview-root .job{aspect-ratio:1/1;min-height:0}.overview-root .feature{min-height:148px}}</style>' + '<style>/* Header icons viewport-anchored + visible scrollbars */@media(min-width:1280px){.overview-root .top-icons{position:fixed;right:38px;top:0;z-index:80;margin:0;background:#ffffff;border:none;border-radius:0;box-shadow:none;padding:0 14px}}@media(min-width:1280px){.overview-root .sidebar{position:sticky;top:0;align-self:start;max-height:100dvh;overflow-y:auto;overflow-x:hidden;height:auto}}#main-content{scrollbar-color:#c9d3e0 #ffffff}#main-content::-webkit-scrollbar-thumb{background:#c9d3e0;border:1px solid #e8edf4}.overview-root .sidebar,.overview-root .main,.overview-root .right{scrollbar-color:#c9d3e0 #ffffff}.overview-root .sidebar::-webkit-scrollbar-thumb,.overview-root .main::-webkit-scrollbar-thumb,.overview-root .right::-webkit-scrollbar-thumb{background:#c9d3e0;border:1px solid #e8edf4}@media(min-width:1280px){.overview-root .main{height:auto;max-height:none;overflow:visible}.overview-root .right{height:auto;max-height:none;overflow:visible;position:static}.overview-root .sidebar{height:auto;max-height:none;position:static}}</style>' + '<style>/* Hero motto in-flow with flanking dashes; columns fill viewport */.overview-root .hero-motto{display:flex;position:static;left:auto;bottom:auto;align-items:center;gap:12px;width:100%;margin:16px 0 0;color:#697183;font-size:9px;letter-spacing:4px;white-space:nowrap}.overview-root .hero-motto:before,.overview-root .hero-motto:after{content:"";height:2px;background:#b77a05;flex:1;min-width:22px}@media(min-width:1280px){.overview-root .sidebar{position:sticky;top:0;align-self:start;height:auto;min-height:100dvh;max-height:100dvh;overflow-y:auto;overflow-x:hidden}.overview-root .right{display:flex;flex-direction:column;min-height:100dvh}.overview-root .right>.quote{margin-top:auto}}@media(max-width:767px){.overview-root .hero-motto{margin-top:12px;letter-spacing:2.5px;font-size:8px}}</style>' + '<style>/* Smart header + topbar brand + sticky sidebar brand */.overview-root .topbar{position:fixed;top:0;z-index:75;transition:transform .28s ease;box-shadow:0 1px 0 #e8edf4,0 8px 22px rgba(27,50,85,.06)}.overview-root .topbar.ov-hidden{transform:translateY(-110%)}.overview-root .top-icons{transition:transform .28s ease,opacity .28s ease}.overview-root.ov-headhidden .top-icons{transform:translateY(-110%);opacity:0}.overview-root .ov-brand{display:flex;align-items:center;flex-shrink:0}.overview-root .ov-brand img{height:34px;width:auto;object-fit:contain;background:transparent}.overview-root .sidebar .brand{position:sticky;top:-24px;z-index:6;margin:-24px -15px 0;padding:24px 15px 23px;background:#0e2a47}@media(max-width:1279px){.overview-root>.top-icons{justify-content:flex-end;padding:10px 16px 0}}@media(max-width:767px){.overview-root .ov-brand img{height:28px}}.overview-root .workspace{padding-top:var(--ov-bar-h,73px)}@media(min-width:1280px){.overview-root .workspace{grid-column:2}.overview-root .right{grid-column:3}.overview-root .sidebar{position:fixed;top:0;left:0;width:var(--ov-side-w,307px);height:100dvh;min-height:0;max-height:100dvh;overflow-y:auto;overflow-x:hidden;z-index:70;align-self:auto}}</style>'
    + '</style>'
    + '<style>/* Match Regional/Boost sidebar typography and sizing */'
    + '.overview-root .sidebar .ico{width:23px!important;height:23px!important}'
    + '.overview-root .brand{height:104px!important}'
    + '.overview-root .system-title{font-size:15px!important;letter-spacing:1px!important;font-weight:800!important;margin:16px 7px 18px!important}'
    + '.overview-root .nav-item{height:50px!important;min-height:50px!important;display:flex!important;align-items:center!important;gap:18px!important;padding:0 18px!important;border-radius:11px!important;font-size:15px!important;font-weight:400!important;margin:2px 0!important}'
    + '.overview-root .nav-item.parent{font-weight:700!important}.overview-root .nav-item.active{font-weight:800!important}'
    + '.overview-root .stage{font-size:14px!important;letter-spacing:.3px!important;font-weight:800!important;margin:19px 15px 12px!important}'
    + '.overview-root .subnav .nav-item{height:46px!important;min-height:46px!important;padding-left:44px!important;font-size:14px!important;gap:20px!important}'
    + '.overview-root .divider{margin:10px 7px 12px!important}'
    + '.overview-root .journey{height:160px!important;min-height:160px!important;padding:26px 24px!important;margin-top:17px!important}'
    + '.overview-root .journey p{font-size:20px!important;line-height:1.28!important;font-weight:500!important;width:150px!important;max-width:150px!important}'
    + '@media(min-width:1280px) and (max-width:1450px){.overview-root .sidebar{padding-left:8px!important;padding-right:8px!important}.overview-root .nav-item{padding-left:10px!important;padding-right:10px!important;gap:10px!important}.overview-root .subnav .nav-item{padding-left:24px!important}}'
    + '</style>'
    + '<style>/* Overview right rail fixed to viewport */@media(min-width:1280px){.overview-root .right{position:fixed!important;top:0!important;right:auto!important;align-self:start!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:55!important;background:#fff!important}.overview-root .workspace{grid-column:2!important}}</style>'
    + '<svg width="0" height="0" style="position:absolute"><defs>'
    + '<symbol id="menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol><symbol id="home" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></symbol><symbol id="target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m15 9 6-6m-4 0h4v4"/></symbol><symbol id="bag" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2"/></symbol><symbol id="chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2"/><path d="m3 9 6-4 6 5 7-8"/></symbol><symbol id="doc" viewBox="0 0 24 24"><path d="M6 2h9l4 4v16H6z"/><path d="M15 2v5h5M9 12h7M9 16h7"/></symbol><symbol id="book" viewBox="0 0 24 24"><path d="M3 5c4-2 7-1 9 1v15c-2-2-5-3-9-1zM21 5c-4-2-7-1-9 1v15c2-2 5-3 9-1z"/></symbol><symbol id="search" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></symbol><symbol id="image" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="m4 16 5-5 4 4 3-3 5 5M16 9h.01"/></symbol><symbol id="users" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20v-2c0-3 2-5 6-5s6 2 6 5v2M14 14c4-1 8 1 8 5v1"/></symbol><symbol id="help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.7 2.7 0 1 1 4.5 2c-1.5 1-2 1.5-2 3M12 18h.01"/></symbol><symbol id="bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></symbol><symbol id="chat" viewBox="0 0 24 24"><path d="M4 4h16v13H8l-4 4z"/></symbol><symbol id="pin" viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2"/></symbol><symbol id="bookmark" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></symbol><symbol id="cap" viewBox="0 0 24 24"><path d="m2 9 10-5 10 5-10 5zM6 11v5c3 3 9 3 12 0v-5M22 9v7"/></symbol>'
    + '</defs></svg>'
    + '<div class="overview-root"><a class="ov-skip" href="#ov-main">Skip to main content</a>' + '<div class="top-icons"><div class="notification" tabindex="0" role="button" aria-label="Notifications, 3 unread" onclick="showToast(\'3 notifications\')" style="cursor:pointer"><svg class="ico"><use href="#bell"/></svg><span class="badge">3</span></div><svg class="ico" tabindex="0" role="button" aria-label="Messages" onclick="showToast(\'Messages (demo)\')" style="cursor:pointer"><use href="#chat"/></svg><div class="user" tabindex="0" role="button" aria-label="Open profile menu" aria-expanded="false" onclick="event.stopPropagation();var m=this.querySelector(\'.profile-menu\');var o=m.classList.toggle(\'open\');this.setAttribute(\'aria-expanded\',o?\'true\':\'false\')"><img decoding="async" class="avatar" src="assets/overview/avatar.jpg" alt="Wisdom Automa"><div><strong>Wisdom Automa</strong><span>Learner</span></div><span style="font-size:22px;color:#07143a">⌄</span><div class="profile-menu" role="menu" onclick="event.stopPropagation()"><button role="menuitem" onclick="showToast(\'Profile settings\')">Profile settings</button><button role="menuitem" onclick="showToast(\'Account settings\')">Account settings</button><button role="menuitem" onclick="window._nav(\'help-support\')">Help &amp; Support</button></div></div></div>' + '<div class="app">'
    + '<aside class="sidebar" id="ovSidebar" role="navigation" aria-label="Primary">'
    + '<div class="brand"><div class="brand-mark" style="justify-content:center"><img decoding="async" fetchpriority="high" src="assets/logo.png" alt="Zeelin Academy Logo" style="height:42px;width:auto;object-fit:contain;background:transparent"></div></div>'
    + '<div class="system-title">ZEELIN JOB READINESS SYSTEM</div>'
    + '<ul class="nav-main">'
    + '<li class="nav-item active" onclick="window._nav(\'overview\')"><svg class="ico"><use href="#home"/></svg>Dashboard</li>'
    + '<li class="nav-item" onclick="location.href=\'/portal.html\'"><svg class="ico"><use href="#menu"/></svg>Portal</li>'
    + '</ul>'
    + '<div class="stage">STAGE 3: CAREER GATE</div>'
    + '<ul class="nav-main"><li class="nav-item parent" onclick="window._nav(\'regional-boards\')"><svg class="ico"><use href="#bag"/></svg>Placement Pipeline <span class="chev">⌄</span></li></ul>'
    + '<ul class="subnav">'
    + '<li class="nav-item" onclick="window._nav(\'regional-boards\')"><svg class="ico"><use href="#bag"/></svg>Regional Job Boards</li>'
    + '<li class="nav-item" onclick="window._nav(\'boost\')"><svg class="ico"><use href="#chart"/></svg>Boost &amp; Accountability</li>'
    + '<li class="nav-item" onclick="window._nav(\'cv-maker\')"><svg class="ico"><use href="#doc"/></svg>CV Maker &amp; Portfolio</li>'
    + '</ul>'
    + '<div class="divider"></div>'
    + '<ul class="nav-main">'
    + '<li class="nav-item" onclick="window._nav(\'resources\')"><svg class="ico"><use href="#book"/></svg>Learning Hub</li>'
    + '<li class="nav-item" onclick="window._nav(\'regional-boards\')"><svg class="ico"><use href="#search"/></svg>Job Opportunities</li>'
    + '<li class="nav-item" onclick="window._nav(\'resources\')"><svg class="ico"><use href="#image"/></svg>Resources</li>'
    + '<li class="nav-item" onclick="window._nav(\'resources\')"><svg class="ico"><use href="#users"/></svg>Community</li>'
    + '<li class="nav-item" onclick="window._nav(\'resources\')"><svg class="ico"><use href="#help"/></svg>Help &amp; Support</li>'
    + '</ul>'
    + '<div class="journey"><p>“Your Global Career Journey Starts Here.”</p><div class="gold-stroke"></div></div>'
    + '</aside>'
    + '<div class="ov-overlay" onclick="window._ovNav(false)" aria-hidden="true"></div>'
    + '<section class="workspace">'
    + '<header class="topbar"><button class="ov-burger" onclick="window._ovNav(true)" aria-label="Open navigation" aria-expanded="false"><svg class="ico" viewBox="0 0 24 24"><use href="#menu"/></svg></button><div class="search"><svg class="ico" style="width:19px;flex-shrink:0;" aria-hidden="true"><use href="#search"/></svg><input id="ovSearch" type="search" placeholder="Search for jobs, courses, resources..." aria-label="Search for jobs, courses, resources" onkeydown="if(event.key===\'Enter\'){window._nav(\'regional-boards\')}" style="flex:1;min-width:0;background:transparent;border:none;outline:none;color:#4c5772;font-size:14px;font-family:inherit;"></div>' + '</header>'
    + '<main class="main" id="ov-main">'
    + '<section class="hero">'
    + '<img class="hero-photo" src="assets/overview/hero.jpg" alt="Smiling professional woman at her laptop">'
    + '<div class="hero-fade"></div><div class="script">Skills<br>Opportunity<br>A Brighter<br>Tomorrow</div>'
    + '<div class="hero-copy">'
    + '<div class="credential"><span class="check-dot">✓</span> VERIFIED STAGE 2 CREDENTIALS LOADED</div>'
    + '<h1>Welcome to Your<br><span>Job Acquisition Dashboard</span></h1>'
    + '<p>You have successfully completed Stage 1 and Stage 2 with a verified score of 92/100. Access verified regional job boards, meet your daily application quotas, and transition into the active employment market.</p>'
    + '<p class="strong">Multiple job training enabled — log up to 5 concurrent applications.</p>'
    + '<div class="hero-actions"><button class="btn primary" onclick="window._nav(\'regional-boards\')"><svg class="ico"><use href="#bag"/></svg>Explore Regional Job Boards <span>→</span></button><button class="btn" onclick="window._nav(\'cv-maker\')">View Verified Portfolio</button></div>'
    + '<div class="hero-motto">TRAIN • APPLY • CONNECT • SUCCEED</div>'
    + '</div>'
    + '</section>'
    + '<section class="feature-grid">'
    + '<article class="feature blue" tabindex="0" role="button" aria-label="Regional Job Boards" data-route="regional-boards" onclick="window._nav(\'regional-boards\')"><div class="feature-icon"><svg class="ico" style="width:32px;height:32px"><use href="#search"/></svg></div><h3>Regional Job Boards</h3><p>Access verified job opportunities worldwide</p><span class="circle-arrow">→</span></article>'
    + '<article class="feature green" tabindex="0" role="button" aria-label="Boost and Accountability" data-route="boost" onclick="window._nav(\'boost\')"><div class="feature-icon"><svg class="ico" style="width:31px;height:31px"><use href="#chart"/></svg></div><h3>Boost &amp; Accountability</h3><p>Track your progress and stay on target</p><span class="circle-arrow">→</span></article>'
    + '<article class="feature purple" tabindex="0" role="button" aria-label="CV Maker and Portfolio" data-route="cv-maker" onclick="window._nav(\'cv-maker\')"><div class="feature-icon"><svg class="ico" style="width:31px;height:31px"><use href="#doc"/></svg></div><h3>CV Maker &amp; Portfolio</h3><p>Create a professional CV and showcase your skills</p><span class="circle-arrow">→</span></article>'
    + '<article class="feature gold" tabindex="0" role="button" aria-label="Training and Learning" data-route="resources" onclick="window._nav(\'resources\')"><div class="feature-icon"><svg class="ico" style="width:31px;height:31px"><use href="#cap"/></svg></div><h3>Training &amp; Learning</h3><p>Build in-demand skills with expert courses</p><span class="circle-arrow">→</span></article>'
    + '</section>'
    + '<div class="opps-head"><div><h2>Latest Job Boards</h2><p>Curated job boards from trusted partners</p></div><div class="view-all" onclick="window._nav(\'regional-boards\')">View All Job Boards&nbsp; →</div></div>'
    + '<section class="jobs">'+boardsHtml+'</section>'
    + '<section class="support"><div class="support-icon"><svg class="ico"><use href="#users"/></svg></div><div><strong>Need Support?</strong><p>Access resources, guides and our community for help at every step.</p></div><button class="btn" onclick="window._nav(\'help-support\')">Get Support&nbsp; →</button></section>'
    + '</main>'
    + '</section>'
    + '<aside class="right">'
    + '<section class="tracker"><div class="eyebrow"><span>COHORT ACCOUNTABILITY</span><a href="#" onclick="window._nav(\'boost\');return false">View All&nbsp; →</a></div><h2>1-Month Proof Tracker</h2><div class="subtle">Required 30-Day Employment Window</div>'
    + '<div class="progress-row"><div class="ring"><div class="ring-text"><b>'+daysLeft+'</b><span>Days Left</span></div></div><div class="progress-copy"><strong>Day '+proofDay+' of 30 Completed</strong><div class="bar"><span></span></div><div class="percent">'+pct+'%</div><p>You must log a minimum of 5 external job applications weekly to maintain active cohort standing.</p><div class="current">Current: '+q+'/5 logged</div></div></div>'
    + '<div class="checklist"><div class="check-row"><span class="box done">✓</span>Stage 2 Project Verified (92/100)</div><div class="check-row"><span class="box '+(hasCV?'done':'')+'">'+(hasCV?'✓':'')+'</span>CV &amp; Portfolio Compiled</div><div class="check-row"><span class="box '+(hasQuota?'done':'')+'">'+(hasQuota?'✓':'')+'</span>Apply to 5 Jobs (Current: '+q+'/5)</div><div class="check-row"><span class="box"></span>Complete Mock Interview Session</div></div>'
    + '</section>'
    + '<section class="motivation"><h3>Bigger<br>Opportunities<br>Await You</h3><p>Keep going. You’re closer than you think.</p><div class="gold-stroke"></div></section>'
    + '<section class="quote"><span class="quote-mark">“</span><span>“Today’s effort.<br>Tomorrow’s opportunity.”<div class="gold-stroke" style="width:60px;height:3px;margin-top:10px"></div></span></section>'
    + '</aside>'
    + '<nav class="ov-bottomnav" aria-label="Primary mobile"><a href="#overview" class="active"><svg class="ico" viewBox="0 0 24 24"><use href="#home"/></svg><span>Home</span></a><a href="#regional-boards"><svg class="ico" viewBox="0 0 24 24"><use href="#bag"/></svg><span>Boards</span></a><a href="#boost"><svg class="ico" viewBox="0 0 24 24"><use href="#chart"/></svg><span>Boost</span></a><a href="#cv-maker"><svg class="ico" viewBox="0 0 24 24"><use href="#doc"/></svg><span>CV Maker</span></a><a href="#resources"><svg class="ico" viewBox="0 0 24 24"><use href="#image"/></svg><span>More</span></a></nav>'
    + '</div></div>';
  return '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:#ffffff;min-height:0"><div style="flex:1;overflow:auto;background:#ffffff">' + overviewHtml + '</div></div>';
}

function viewRegionalBoardsLegacy(countryParam){
  const q = state.boostApplications.length;
  const pct = Math.min(100, Math.round(q/5*100));
  window._jbFilter = window._jbFilter || {q:'', region:'all', category:'all', sort:'name', arrange:'grid'};
  const F = window._jbFilter;
  const countries = (typeof JOB_COUNTRIES!=='undefined'? JOB_COUNTRIES : REGIONAL_BOARDS_DATA.map((b,i)=>({id:b.id, name:b.regionLabel.replace(' Region',''), flag:'🌐', region:b.regionLabel, hero:b.img})));
  const boards = (typeof JOB_BOARDS!=='undefined'? JOB_BOARDS : []);
  function countryBoards(cid){ return boards.filter(b=>b.countryId===cid); }
  // If drill-down to country: show its boards
  if(countryParam){
    const country = countries.find(c=>c.id===countryParam);
    if(!country) countryParam=null; else {
      let list = countryBoards(countryParam);
      // filter by search/category inside country view
      if(F.q) { const s=F.q.toLowerCase(); list = list.filter(b=> b.name.toLowerCase().includes(s)||b.url.toLowerCase().includes(s)||(b.desc||'').toLowerCase().includes(s)); }
      if(F.category!=='all') list = list.filter(b=> (b.category||'general')===F.category);
      if(F.sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
      else if(F.sort==='domain') list.sort((a,b)=> new URL(a.url).hostname.localeCompare(new URL(b.url).hostname));
      function boardCard(b){
        const host = (()=>{try{return new URL(b.url).hostname.replace('www.','')}catch{return b.url}})();
        return '<div class="jb-bug-card" data-board="'+b.id+'" style="background:#181818;border:2px solid #2a2a2a;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;">'
        + '<div class="jb-og-img" data-url="'+esc(b.url)+'" data-fallback="'+esc(b.boardImg||'')+'" style="height:160px;background:#0d0d0d url(\''+ (b.boardImg||b.ogImage||country.hero) +'\') center/cover no-repeat;position:relative;border-bottom:1px solid #2a2a2a;"><div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,.55), transparent);"></div><div style="position:absolute;bottom:10px;left:12px;background:rgba(0,0,0,.75);border:1px solid #3a3a3a;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:800;color:#f59e0b;">'+esc(host)+'</div></div>'
        + '<div style="padding:16px;flex:1;display:flex;flex-direction:column;">'
        + '<h3 style="font-size:14px;font-weight:800;color:#fff;margin-bottom:6px;">'+esc(b.name)+'</h3>'
        + '<p style="font-size:12px;color:#a3a3a3;line-height:1.5;flex:1;">'+esc(b.desc||'')+'</p>'
        + '<div style="display:flex;gap:8px;margin-top:14px;"><a href="'+esc(b.url)+'" target="_blank" rel="noopener" class="jb-open" data-board="'+b.id+'" style="flex:1;background:#2563eb;color:#fff;text-align:center;padding:10px;border-radius:8px;font-size:12px;font-weight:800;text-decoration:none;">Open Board ↗</a><a href="'+esc(b.demoUrl||b.url)+'" target="_blank" rel="noopener" style="flex:.7;background:#262626;color:#f59e0b;text-align:center;padding:10px;border-radius:8px;font-size:11px;font-weight:800;text-decoration:none;border:1px solid #d97706;">Demo</a></div>'
        + '</div></div>';
      }
      const main = '<div style="flex:1;padding:24px 28px;overflow-y:auto;background:#121212;">'
        + '<div style="max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:18px;">'
        + '<div style="display:flex;align-items:center;gap:10px;font-size:12px;color:#a3a3a3;"><a href="#regional-boards" style="color:#f59e0b;font-weight:800;text-decoration:none;">← All Countries</a><span>•</span><span style="color:#fff;font-weight:800;">'+esc(country.flag)+' '+esc(country.name)+'</span><span style="background:#1a1a1a;border:1px solid #3a3a3a;padding:3px 8px;border-radius:999px;font-size:11px;">'+esc(country.region)+'</span></div>'
        + '<div style="background:linear-gradient(rgba(24,24,24,.88), rgba(24,24,24,.92)), url(\''+country.hero+'\') center/cover no-repeat;border:2px solid #3a3a3a;border-radius:12px;padding:20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">'
        + '<div><h1 style="font-size:20px;font-weight:800;color:#fff;">'+esc(country.flag)+' '+esc(country.name)+' — Job Boards</h1><p style="font-size:12px;color:#a3a3a3;margin-top:4px;">'+countryBoards(countryParam).length+' verified boards • Direct links (LinkedIn '+esc(country.name)+' differs from UK) • Workers fetch OG preview</p></div>'
        + '<div style="display:flex;gap:8px;align-items:center;">'
        + '<input id="jbSearch" placeholder="Search boards, e.g. Seek, LinkedIn..." value="'+esc(F.q)+'" style="padding:9px 12px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12px;min-width:220px;" />'
        + '<select id="jbCategory" style="padding:9px 10px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12px;"><option value="all" '+(F.category==='all'?'selected':'')+'>All Categories</option><option value="general" '+(F.category==='general'?'selected':'')+'>General</option><option value="tech" '+(F.category==='tech'?'selected':'')+'>Tech</option><option value="remote" '+(F.category==='remote'?'selected':'')+'>Remote</option></select>'
        + '<select id="jbSort" style="padding:9px 10px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12px;"><option value="name" '+(F.sort==='name'?'selected':'')+'>Sort: Name</option><option value="domain" '+(F.sort==='domain'?'selected':'')+'>Sort: Domain</option></select>'
        + '<button id="jbArrange" style="padding:9px 12px;border-radius:10px;border:1px solid #3a3a3a;background:#1a1a1a;color:#fff;font-size:12px;font-weight:800;">'+(F.arrange==='list'?'Grid':'List')+'</button>'
        + '</div></div>'
        + '<div id="jbGrid" style="display:grid;gap:16px;grid-template-columns:'+(F.arrange==='list'?'1fr':'repeat(auto-fit,minmax(320px, 1fr))')+';">'+ list.map(boardCard).join('') + (list.length?'':'<p style="color:#737373;padding:20px;text-align:center;">No boards match.</p>') +'</div>'
        + '</div></div>';
      const right = '<div style="width:320px;background:#181818;border-left:2px solid #3a3a3a;display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0;">'
        + '<div style="padding:18px;">'
        + '<h3 style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px;">Filters & Arrange</h3>'
        + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:12px;"><div style="font-size:11px;color:#a3a3a3;margin-bottom:6px;">Region</div><div style="font-size:12px;font-weight:700;color:#fff;">'+esc(country.region)+'</div><div style="font-size:11px;color:#737373;">'+esc(country.name)+'</div></div>'
        + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:12px;"><div style="font-size:11px;color:#a3a3a3;margin-bottom:6px;">Quota</div><div style="font-size:12px;font-weight:800;color:#fff;">'+q+' / 5 logged</div><div style="height:6px;background:#1f1f1f;border-radius:999px;overflow:hidden;margin-top:6px;"><div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,#d97706,#16a34a);"></div></div></div>'
        + '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:12px;"><div style="font-size:11px;font-weight:800;color:#f59e0b;margin-bottom:6px;">Recommended</div><p style="font-size:11px;color:#a3a3a3;line-height:1.5;">Boards for '+esc(country.name)+' are direct country-specific domains (e.g., LinkedIn '+esc(country.name)+' differs from UK). Open + log to satisfy 5-job quota.</p></div>'
        + '</div>'
        + '<div style="padding:16px;background:#161616;border-top:2px solid #3a3a3a;"><a href="#regional-boards" style="display:block;width:100%;text-align:center;padding:12px;background:transparent;border:2px solid #3a3a3a;color:#a3a3a3;border-radius:8px;font-weight:800;text-decoration:none;">← Back to Countries</a></div></div>';
      return topbarHtml('Job Boards • '+country.name, '<span>'+esc(country.flag)+' '+esc(country.region)+'</span><span style="color:#34d399;font-weight:800;">'+list.length+' Boards</span>', 55) + '<div class="jb-split" style="flex:1;display:flex;overflow:hidden;min-height:0;">'+main+right+'</div>';
    }
  }
  // Country marketplace grid (first category: job boards country based)
  // F and countries already defined above; reuse without redeclaring
  let filtered = countries.slice();
  if(F.q){ const s=F.q.toLowerCase(); filtered = filtered.filter(c=> c.name.toLowerCase().includes(s) || c.region.toLowerCase().includes(s)); }
  if(F.region!=='all') filtered = filtered.filter(c=> c.region===F.region);
  if(F.sort==='name') filtered.sort((a,b)=> a.name.localeCompare(b.name));
  else if(F.sort==='region') filtered.sort((a,b)=> a.region.localeCompare(b.region));
  const regionOpts = ['all','Africa','Europe','Oceania','North America','Asia','Caribbean','Remote'];
  function countryCard(c){
    const bc = (typeof JOB_BOARDS!=='undefined'? JOB_BOARDS.filter(b=>b.countryId===c.id).length : 2);
    return '<a href="#regional-boards/'+c.id+'" style="text-decoration:none;background:#181818;border:2px solid #2a2a2a;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .15s;">'
      + '<div style="height:140px;background:url(\''+c.hero+'\') center/cover no-repeat;position:relative;border-bottom:1px solid #2a2a2a;"><div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,.75);border:1px solid #3a3a3a;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:800;color:#f59e0b;">'+esc(c.region)+'</div><div style="position:absolute;bottom:10px;left:10px;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.7);padding:6px 10px;border-radius:10px;"><img loading="lazy" decoding="async" src="'+(c.flagImg||'')+'" alt="" style="width:22px;height:16px;object-fit:cover;border-radius:3px;border:1px solid rgba(255,255,255,.2);" onerror="this.style.display=\'none\'"/><span style="font-size:13px;font-weight:800;color:#fff;">'+esc(c.name)+'</span></div></div>'
      + '<div style="padding:16px;flex:1;display:flex;flex-direction:column;">'
      + '<div style="font-size:12px;color:#a3a3a3;flex:1;">'+bc+' verified job boards • Direct links</div>'
      + '<div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;font-weight:800;color:#f59e0b;">Open Boards →</span><span style="font-size:11px;color:#737373;">'+esc(c.region)+'</span></div>'
      + '</div></a>';
  }
  const main = ''
    + '<div style="flex:1;padding:24px 28px;overflow-y:auto;background:#121212;">'
    + '<div style="max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:18px;">'
    + '<div style="background:linear-gradient(rgba(24,24,24,.88), rgba(24,24,24,.92)), url(\'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80\') center/cover no-repeat;border:2px solid #3a3a3a;border-radius:12px;padding:20px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;">'
    + '<div><h1 style="font-size:20px;font-weight:800;color:#fff;">Job Boards — Country Based</h1><p style="font-size:12px;color:#a3a3a3;margin-top:4px;">25 countries • Marketplace cards & list • Search, filter, arrange, sort — directory for job boards only. Click a country to see its boards (Workers fetch image meta).</p></div>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    + '<input id="jbCountrySearch" placeholder="Search country or region, e.g. Nigeria, Europe..." value="'+esc(F.q)+'" style="padding:10px 12px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12px;min-width:260px;" />'
    + '<select id="jbRegion" style="padding:10px 10px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12px;"><option value="all">All Regions</option>'+regionOpts.slice(1).map(r=>'<option '+(F.region===r?'selected':'')+' value="'+r+'">'+r+'</option>').join('')+'</select>'
    + '<select id="jbSort" style="padding:10px 10px;border-radius:10px;border:1px solid #3a3a3a;background:#0d0d0d;color:#fff;font-size:12px;"><option value="name" '+(F.sort==='name'?'selected':'')+'>Sort: Name</option><option value="region" '+(F.sort==='region'?'selected':'')+'>Sort: Region</option></select>'
    + '<button id="jbArrange" style="padding:10px 12px;border-radius:10px;border:1px solid #3a3a3a;background:#1a1a1a;color:#fff;font-size:12px;font-weight:800;">'+(F.arrange==='list'?'Grid':'List')+'</button>'
    + '</div></div>'
    + '<div id="jbCountryGrid" style="display:grid;gap:16px;grid-template-columns:'+(F.arrange==='list'?'1fr':'repeat(auto-fit,minmax(280px, 320px))')+';">'+ filtered.map(countryCard).join('') + (filtered.length?'':'<p style="color:#737373;padding:20px;">No countries match.</p>') +'</div>'
    + '</div></div>';

  const right = ''
    + '<div style="width:340px;background:#181818;border-left:2px solid #3a3a3a;display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0;">'
    + '<div style="padding:18px;">'
    + '<h3 style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px;">Recommended</h3>'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:12px;"><div style="font-size:12px;font-weight:700;color:#fff;">Start with your region</div><p style="font-size:11px;color:#a3a3a3;margin-top:6px;line-height:1.5;">Pick your country card — each opens its dedicated boards (e.g., LinkedIn Nigeria vs LinkedIn UK). Open Board goes direct to site via Workers-fetched preview.</p></div>'
    + '<h3 style="font-size:13px;font-weight:800;color:#fff;margin:14px 0 8px;">Filter</h3>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;"><button onclick="window._jbSetRegion(\'all\')" style="padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid '+(F.region==='all'?'#d97706':'#3a3a3a')+';background:'+(F.region==='all'?'#d97706':'transparent')+';color:'+(F.region==='all'?'#fff':'#a3a3a3')+';">All</button>'+regionOpts.slice(1).map(r=>'<button onclick="window._jbSetRegion(\''+r+'\')" style="padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid '+(F.region===r?'#d97706':'#3a3a3a')+';background:'+(F.region===r?'#d97706':'transparent')+';color:'+(F.region===r?'#fff':'#a3a3a3')+';">'+r+'</button>').join('')+'</div>'
    + '<h3 style="font-size:13px;font-weight:800;color:#fff;margin:14px 0 8px;">Quota</h3>'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:12px;"><div style="font-size:12px;font-weight:800;color:#fff;">'+q+' / 5 logged</div><div style="height:6px;background:#1f1f1f;border-radius:999px;overflow:hidden;margin-top:6px;"><div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,#d97706,#16a34a);"></div></div><p style="font-size:11px;color:#a3a3a3;margin-top:8px;">Log 5 applications across any country boards to unlock mocks.</p></div>'
    + '</div>'
    + '<div style="padding:16px;background:#161616;border-top:2px solid #3a3a3a;"><button onclick="window._nav(\'boost\')" style="width:100%;padding:12px;background:#d97706;color:#fff;border-radius:8px;font-weight:800;border:none;cursor:pointer;">Go to Boost Log</button></div></div>';

  return topbarHtml('Job Boards • Country Based', '<span>25 Countries</span><span style="color:#34d399;font-weight:800;">'+JOB_COUNTRIES.length+' Verified</span>', 40)
    + '<div class="jb-split" style="flex:1;display:flex;overflow:hidden;min-height:0;">'+main+right+'</div>';
}

function viewRegionalBoards(countryParam){
  const q = state.boostApplications.length;
  const pct = Math.min(100, Math.round(q/5*100));
  window._jbFilter = window._jbFilter || {q:'',region:'all',category:'all',sort:'name',arrange:'grid'};
  const F = window._jbFilter;
  const countries = (typeof JOB_COUNTRIES!=='undefined' ? JOB_COUNTRIES : []);
  const boards = (typeof JOB_BOARDS!=='undefined' ? JOB_BOARDS : []);
  const countryBoards = (cid)=>boards.filter(b=>b.countryId===cid);
  const regionOpts = ['all','Africa','Europe','Oceania','North America','Asia','Caribbean','Remote'];

  const pexelsImg = (id)=>'https://images.pexels.com/photos/'+id+'/pexels-photo-'+id+'.jpeg?auto=compress&cs=tinysrgb&w=1200&h=720&fit=crop';
  const countryMedia = {
    nz:{landmark:'Auckland Sky Tower',image:pexelsImg('18742687'),source:'https://www.pexels.com/photo/sky-tower-in-auckland-18742687/'},
    ie:{landmark:"Ha'penny Bridge, Dublin",image:pexelsImg('35809667'),source:'https://www.pexels.com/photo/ha-penny-bridge-spanning-river-liffey-in-dublin-35809667/'},
    au:{landmark:'Sydney Opera House',image:pexelsImg('26834715'),source:'https://www.pexels.com/photo/sydney-opera-house-26834715/'},
    us:{landmark:'Statue of Liberty, New York',image:pexelsImg('64271'),source:'https://www.pexels.com/photo/statue-of-liberty-64271/'},
    ca:{landmark:'CN Tower, Toronto',image:pexelsImg('27844750'),source:'https://www.pexels.com/photo/toronto-cn-tower-27844750/'},
    gb:{landmark:'Big Ben, London',image:pexelsImg('20624142'),source:'https://www.pexels.com/photo/big-ben-in-london-20624142/'},
    ng:{landmark:'Lagos Skyline',image:pexelsImg('37505507'),source:'https://www.pexels.com/photo/prominent-lagos-skyline-featuring-the-green-tower-37505507/'},
    za:{landmark:'Table Mountain, Cape Town',image:pexelsImg('37759553'),source:'https://www.pexels.com/photo/majestic-table-mountain-in-cape-town-landscape-37759553/'},
    ke:{landmark:'Nairobi Skyline',image:pexelsImg('38133494'),source:'https://www.pexels.com/photo/nairobi-skyline-at-sunset-with-urban-landmarks-38133494/'},
    gh:{landmark:'Independence Arch, Accra',image:pexelsImg('20131678'),source:'https://www.pexels.com/photo/independence-arch-in-accra-ghana-20131678/'},
    ug:{landmark:'Kampala Mosque',image:pexelsImg('38101744'),source:'https://www.pexels.com/photo/aerial-view-of-domes-of-kampala-mosque-38101744/'},
    zw:{landmark:'Victoria Falls',image:pexelsImg('27878404'),source:'https://www.pexels.com/photo/an-aerial-view-of-victoria-falls-in-zimbabwe-27878404/'},
    in:{landmark:'Taj Mahal, Agra',image:pexelsImg('13754209'),source:'https://www.pexels.com/photo/taj-mahal-in-india-13754209/'},
    pk:{landmark:'Faisal Mosque, Islamabad',image:pexelsImg('20673923'),source:'https://www.pexels.com/photo/vertical-shot-of-the-faisal-mosque-in-islamabad-20673923/'},
    sg:{landmark:'Marina Bay Sands',image:pexelsImg('13551306'),source:'https://www.pexels.com/photo/marina-bay-sands-in-singapore-13551306/'},
    ph:{landmark:'El Nido, Palawan',image:pexelsImg('36521031'),source:'https://www.pexels.com/photo/serene-limestone-cliffs-in-el-nido-palawan-36521031/'},
    jm:{landmark:'Montego Bay',image:pexelsImg('27222664'),source:'https://www.pexels.com/photo/montego-bay-27222664/'},
    bs:{landmark:'Nassau, Bahamas',image:pexelsImg('28443536'),source:'https://www.pexels.com/photo/nassau-bahamas-28443536/'},
    tt:{landmark:'Maracas Bay',image:pexelsImg('30871804'),source:'https://www.pexels.com/photo/serene-maracas-bay-beach-in-trinidad-and-tobago-30871804/'},
    bz:{landmark:'Belize Caribbean Coast',image:pexelsImg('2473986'),source:'https://www.pexels.com/photo/exotic-tropical-beach-2473986/'},
    gy:{landmark:'Kaieteur Falls',image:'https://images.unsplash.com/photo-1672860004522-5b88ffcf39ce?auto=format&fit=crop&w=1200&q=85',source:'https://unsplash.com/photos/a-large-waterfall-with-water-pouring-out-of-it-7QKewlK6Glg'},
    fj:{landmark:'Nadi, Fiji',image:pexelsImg('26088009'),source:'https://www.pexels.com/photo/stranded-island-surrounded-by-ocean-26088009/'},
    pg:{landmark:'Salamaua Coast, Morobe Province',image:pexelsImg('14558429'),source:'https://www.pexels.com/photo/aerial-view-of-a-tropical-beach-14558429/'},
    ws:{landmark:'Apia, Samoa',image:pexelsImg('36137382'),source:'https://www.pexels.com/photo/tropical-beachfront-with-palm-trees-in-samoa-36137382/'},
    remote:{landmark:'Global Remote Collaboration',image:pexelsImg('3865639'),source:'https://www.pexels.com/photo/cheerful-diverse-colleagues-of-different-ages-working-on-laptop-during-startup-project-3865639/'}
  };
  const mediaFor = (country)=>countryMedia[country && country.id] || {landmark:(country&&country.name)||'Regional Market',image:(country&&country.hero)||'assets/overview/hero.jpg',source:(country&&country.hero)||''};
  const siteShot = (url)=>'https://image.thum.io/get/width/900/crop/560/noanimate/allowJPG/?url='+encodeURIComponent(url||'');


  const css = '<style>'
    + '.rb-root,.rb-root *{box-sizing:border-box}.rb-root{--navy:#071b33;--navy2:#0d2f52;--gold:#d99a0a;--gold2:#f0c456;--text:#07143a;--muted:#697590;--border:#e3e9f0;--soft:#f6f8fb;--blue:#0758cf;--green:#0b9b72;width:100%;min-width:0;min-height:100dvh;background:#fff;color:var(--text);font-family:Inter,"Segoe UI",Arial,sans-serif}.rb-root a{text-decoration:none;color:inherit}.rb-root button,.rb-root input,.rb-root select{font:inherit}.rb-nav-toggle{position:fixed;left:-9999px}.rb-app{width:100%;min-height:100dvh;display:grid;grid-template-columns:clamp(220px,13.8vw,275px) minmax(0,1fr) clamp(285px,19vw,360px);background:#fff}'
    + '.rb-sidebar{position:sticky;top:0;height:100dvh;overflow:auto;padding:22px 12px 20px;color:#fff;background:radial-gradient(circle at 115% 20%,rgba(229,176,55,.24),transparent 26%),linear-gradient(145deg,#103251 0%,#071b33 64%,#0a2746 100%);box-shadow:8px 0 24px rgba(15,40,68,.15);z-index:70}.rb-brand{height:92px;display:flex;justify-content:center;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,.22)}.rb-brand img{height:44px;width:auto;max-width:175px;object-fit:contain;display:block}.rb-system{margin:16px 8px 14px;color:#f7fbff;font-size:clamp(11px,.75vw,14px);font-weight:900;letter-spacing:.85px}.rb-stage{margin:18px 13px 9px;color:#ffc43e;font-size:clamp(11px,.72vw,13px);font-weight:900;letter-spacing:.35px}.rb-nav{list-style:none;margin:0;padding:0}.rb-nav-item{min-height:46px;display:flex;align-items:center;gap:12px;padding:0 13px;margin:3px 0;border-radius:11px;color:#f5f7fb;font-size:clamp(12px,.76vw,14px);font-weight:700;transition:.18s ease}.rb-nav-item:hover{background:rgba(255,255,255,.10);transform:translateX(3px)}.rb-nav-item.active{background:linear-gradient(100deg,#ffe8a0,#edb640);color:#102341;box-shadow:0 5px 15px rgba(242,193,72,.28)}.rb-nav-icon{width:20px;flex:0 0 20px;text-align:center}.rb-nav.sub .rb-nav-item{padding-left:31px;font-size:12px}.rb-divider{height:1px;background:rgba(255,255,255,.18);margin:12px 7px}.rb-journey{margin-top:16px;min-height:142px;border-radius:14px;padding:21px 18px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(90deg,rgba(6,20,38,.72),rgba(5,24,43,.34)),url("assets/overview/journey.jpg") center/cover no-repeat;overflow:hidden}.rb-journey p{max-width:150px;font-size:clamp(16px,1vw,20px);line-height:1.3;font-weight:700;margin:0}.rb-gold-stroke{width:72px;height:4px;background:#ffc544;border-radius:99px;transform:rotate(-6deg);margin-top:17px}'
    + '.rb-workspace{min-width:0;background:#fff}.rb-topbar{position:sticky;top:0;z-index:60;min-height:73px;display:flex;align-items:center;gap:clamp(12px,1.4vw,26px);padding:10px clamp(16px,1.6vw,30px);background:rgba(255,255,255,.98);border-bottom:1px solid #e7edf4;box-shadow:0 6px 20px rgba(27,50,85,.05);backdrop-filter:blur(14px)}.rb-hamburger{display:none;width:40px;height:40px;border-radius:11px;border:1px solid #e3e9f0;background:#fff;color:var(--navy);align-items:center;justify-content:center;font-size:19px;cursor:pointer}.rb-search{width:clamp(250px,31vw,470px);height:42px;border-radius:24px;background:#f2f5f9;display:flex;align-items:center;gap:11px;padding:0 16px;color:#65728b;border:1px solid transparent;transition:.18s ease}.rb-search:focus-within{background:#fff;border-color:#ccd8e6;box-shadow:0 0 0 4px rgba(7,88,207,.06)}.rb-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#344266;font-size:13px}.rb-top-spacer{flex:1}.rb-top-icons{display:flex;align-items:center;gap:15px;color:#0a1a39}.rb-icon-button{width:38px;height:38px;border-radius:10px;border:0;background:transparent;display:grid;place-items:center;position:relative;color:#0a1a39;font-size:17px;cursor:pointer}.rb-icon-button:hover{background:#f5f7fa}.rb-badge{position:absolute;right:0;top:1px;width:17px;height:17px;border-radius:50%;background:#e21b2d;color:#fff;font-size:9px;display:grid;place-items:center;border:2px solid #fff}.rb-profile{position:relative}.rb-profile summary{list-style:none}.rb-profile summary::-webkit-details-marker{display:none}.rb-profile-trigger{display:flex;align-items:center;gap:10px;padding:5px 8px 5px 12px;border-left:1px solid #e4eaf1;border-radius:11px;cursor:pointer;transition:.18s ease}.rb-profile-trigger:hover{background:#f8fafc;box-shadow:0 7px 18px rgba(25,53,88,.08);transform:translateY(-1px)}.rb-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;display:block;border:2px solid #fff;box-shadow:0 0 0 1px #dbe3ec;filter:grayscale(1)}.rb-profile-text strong{display:block;font-size:12px}.rb-profile-text span{display:block;font-size:10px;color:#7b879b;margin-top:3px}.rb-dropdown{position:absolute;right:0;top:58px;width:195px;padding:7px;border-radius:12px;background:#fff;border:1px solid #e0e6ee;box-shadow:0 16px 36px rgba(23,47,78,.16);z-index:100}.rb-dropdown a{display:block;padding:10px 11px;border-radius:8px;font-size:12px;font-weight:700}.rb-dropdown a:hover{background:#f2f5f8}'
    + '.rb-content{padding:clamp(16px,1.35vw,26px) clamp(16px,1.7vw,32px) 40px}.rb-hero{min-height:252px;border-radius:19px;overflow:hidden;position:relative;padding:clamp(28px,2.3vw,42px);background:linear-gradient(90deg,rgba(7,27,51,.97),rgba(7,27,51,.76)),url("assets/overview/hero.jpg") center/cover no-repeat;box-shadow:0 14px 34px rgba(18,51,85,.13);color:#fff}.rb-hero.country{background:linear-gradient(90deg,rgba(7,27,51,.97),rgba(7,27,51,.76)),var(--rb-country-hero) center/cover no-repeat}.rb-hero:before{content:"";position:absolute;right:-80px;top:-100px;width:330px;height:330px;border-radius:50%;background:radial-gradient(circle,rgba(240,196,86,.29),transparent 68%)}.rb-hero-copy{position:relative;z-index:2;max-width:780px}.rb-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border-radius:9px;background:linear-gradient(90deg,#ffecb1,#f3c76d);color:#805100;font-size:11px;font-weight:900;letter-spacing:.5px}.rb-hero h1{margin:18px 0 11px;font-size:clamp(30px,2.5vw,46px);line-height:1.03;letter-spacing:-1.4px;color:#fff}.rb-hero h1 span{color:#f2c862}.rb-hero p{max-width:720px;color:rgba(255,255,255,.84);font-size:14px;line-height:1.65;margin:0}'
    + '.rb-filterbar{margin-top:17px;padding:12px;background:#fff;border:1px solid #e1e8f0;border-radius:16px;box-shadow:0 10px 30px rgba(23,50,84,.08);display:grid;grid-template-columns:minmax(240px,1fr) auto auto auto;gap:9px}.rb-input-wrap{min-width:0;height:44px;border-radius:11px;background:#f4f7fa;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid transparent}.rb-input-wrap:focus-within{background:#fff;border-color:#c9d6e4;box-shadow:0 0 0 3px rgba(7,88,207,.06)}.rb-input-wrap input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#25324c;font-size:12px}.rb-control{height:44px;padding:0 12px;border-radius:10px;background:#fff;border:1px solid #dfe6ee;color:#25324c;font-size:12px;font-weight:700;outline:0;cursor:pointer}.rb-control:hover{border-color:#c9d4e0}.rb-section-head{margin:27px 3px 14px;display:flex;justify-content:space-between;align-items:flex-end;gap:14px}.rb-section-head h2{font-size:clamp(20px,1.4vw,26px);margin:0}.rb-section-head p{font-size:12px;color:var(--muted);margin:4px 0 0}.rb-count-pill{padding:8px 11px;border-radius:999px;background:#fff6dd;border:1px solid #f0dda6;color:#946000;font-size:11px;font-weight:900;white-space:nowrap}'
    + '.rb-country-grid,.rb-board-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(235px,100%),1fr));gap:14px}.rb-country-grid.list,.rb-board-grid.list{grid-template-columns:1fr}.rb-country-card,.rb-board-card{min-width:0;background:#fff;border:1px solid #dfe7f0;border-radius:16px;overflow:hidden;box-shadow:0 5px 16px rgba(30,60,95,.055);transition:.22s ease}.rb-country-card{display:flex;flex-direction:column}.rb-country-card:hover,.rb-board-card:hover{transform:translateY(-5px);border-color:#d4aa48;box-shadow:0 18px 45px rgba(22,48,82,.14)}.rb-country-image,.rb-board-image{height:150px;position:relative;background-size:cover;background-position:center;background-color:#eef2f6}.rb-country-image:after,.rb-board-image:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(7,27,51,.72),rgba(7,27,51,.06))}.rb-region-chip,.rb-domain{position:absolute;z-index:2;left:12px;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.94);color:#8b5900;font-size:10px;font-weight:900;box-shadow:0 3px 12px rgba(0,0,0,.07)}.rb-region-chip{top:12px}.rb-domain{bottom:12px;max-width:calc(100% - 24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rb-country-name{position:absolute;z-index:2;left:13px;right:13px;bottom:13px;display:flex;align-items:center;gap:9px;color:#fff;font-size:16px;font-weight:900}.rb-flag{width:28px;height:19px;border-radius:4px;display:block;object-fit:cover;background:rgba(255,255,255,.92);border:1px solid rgba(255,255,255,.48)}.rb-country-body,.rb-board-body{padding:15px 16px 16px}.rb-country-body p,.rb-board-body p{color:var(--muted);font-size:12px;line-height:1.55;margin:0}.rb-country-footer{margin-top:15px;display:flex;align-items:center;justify-content:space-between;gap:12px}.rb-open-label{font-size:12px;font-weight:900;color:var(--blue)}.rb-arrow{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#f7f9fc;border:1px solid #dfe7ef;color:var(--blue);font-size:18px;transition:.2s ease}.rb-country-card:hover .rb-arrow{transform:translateX(3px);background:var(--blue);color:#fff;border-color:var(--blue)}.rb-board-card{display:flex;flex-direction:column}.rb-board-image{height:155px}.rb-board-body{display:flex;flex-direction:column;flex:1}.rb-board-body h3{margin:0 0 7px;color:var(--text);font-size:15px}.rb-board-body p{flex:1;overflow-wrap:anywhere}.rb-board-actions{margin-top:16px;display:grid;grid-template-columns:1fr auto;gap:8px}.rb-primary-link,.rb-secondary-link{min-height:42px;border-radius:10px;display:flex;justify-content:center;align-items:center;padding:9px 13px;text-decoration:none;font-size:12px;font-weight:900;transition:.18s ease}.rb-primary-link{background:linear-gradient(100deg,#d59608,#e9bb38);color:#fff!important;box-shadow:0 5px 12px rgba(192,132,0,.18)}.rb-secondary-link{background:#fff;border:1px solid #d8e0e9;color:var(--navy)!important}.rb-primary-link:hover,.rb-secondary-link:hover{transform:translateY(-2px)}'
    + '.rb-right{min-width:0;border-left:1px solid #e6ecf2;background:#fbfcfe;padding:24px 17px}.rb-right-inner{position:sticky;top:96px;display:flex;flex-direction:column;gap:14px}.rb-side-card{background:#fff;border:1px solid #e0e7ef;border-radius:15px;padding:18px;box-shadow:0 5px 16px rgba(31,58,91,.045)}.rb-side-label{color:#9a6400;font-size:11px;font-weight:900;letter-spacing:.55px;text-transform:uppercase}.rb-side-card h3{margin:7px 0 6px;font-size:17px;color:var(--text)}.rb-side-card p{color:var(--muted);font-size:12px;line-height:1.56;margin:0}.rb-region-buttons{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.rb-chip{border:1px solid #dde5ee;border-radius:999px;background:#fff;color:#64708a;padding:7px 10px;font-size:11px;font-weight:800;cursor:pointer}.rb-chip.active{background:#fff3cd;border-color:#e3b646;color:#835500}.rb-chip:hover{border-color:#d6a128;color:#8f5b00}.rb-progress-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0;font-size:13px;font-weight:900}.rb-progress{height:10px;overflow:hidden;border-radius:99px;background:#e4ebf2}.rb-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#d99a0a,#10a477)}.rb-side-btn{display:flex;align-items:center;justify-content:center;width:100%;min-height:44px;margin-top:14px;border:0;border-radius:11px;background:var(--navy);color:#fff!important;font-size:12px;font-weight:900;transition:.18s ease}.rb-side-btn:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(7,27,51,.18)}.rb-mini-stats{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.rb-mini-stat{padding:12px;border-radius:12px;background:#f7f9fc;border:1px solid #e5ebf2}.rb-mini-stat b{display:block;font-size:17px}.rb-mini-stat span{font-size:10px;color:#7a8598;margin-top:3px;display:block}.rb-empty{grid-column:1/-1;padding:40px;text-align:center;color:#798399;border:1px dashed #d8e1eb;border-radius:15px;background:#fafcff}.rb-overlay{display:none}'
    + '@media(max-width:1279px){.rb-app{grid-template-columns:1fr}.rb-sidebar{position:fixed;left:0;top:0;bottom:0;width:300px;max-width:86vw;height:100dvh;transform:translateX(-106%);transition:transform .25s ease;border-radius:0 16px 16px 0;z-index:95}.rb-hamburger{display:flex}.rb-nav-toggle:checked~.rb-app .rb-sidebar{transform:none}.rb-nav-toggle:checked~.rb-app .rb-overlay{display:block;position:fixed;inset:0;background:rgba(7,20,58,.45);z-index:90}.rb-right{grid-column:1;border-left:0;border-top:1px solid #e6ecf2}.rb-right-inner{position:static;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}}'
    + '@media(max-width:850px){.rb-topbar{flex-wrap:wrap;row-gap:10px}.rb-search{order:3;flex-basis:100%;width:auto}.rb-profile-text{display:none}.rb-filterbar{grid-template-columns:1fr 1fr}.rb-input-wrap{grid-column:1/-1}.rb-right-inner{grid-template-columns:1fr}}'
    + '@media(max-width:620px){.rb-topbar{padding:10px 13px}.rb-content{padding:14px 13px 30px}.rb-hero{min-height:0;padding:24px 18px;border-radius:15px}.rb-hero h1{font-size:28px}.rb-filterbar{grid-template-columns:1fr}.rb-input-wrap{grid-column:auto}.rb-control{width:100%}.rb-section-head{align-items:flex-start;flex-direction:column}.rb-country-grid,.rb-board-grid{grid-template-columns:1fr}.rb-country-image,.rb-board-image{height:170px}.rb-top-icons{gap:8px}.rb-profile-trigger{padding-left:6px}.rb-dropdown{position:fixed;right:12px;top:68px}}'

    + '</style>';


  const chrome = '<style>'
    + '.rb-root .rb-ico{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:inline-block;vertical-align:middle;flex:0 0 auto}'
    + '.rb-app{width:100%;max-width:1960px;margin:0 auto;min-height:945px;display:grid;grid-template-columns:307px minmax(0,1fr) 400px;background:#fff}'
    + '.rb-sidebar{height:auto;min-height:945px;max-height:none;position:static;overflow:visible;padding:24px 15px 20px;background:radial-gradient(circle at 110% 21%,rgba(200,147,35,.25),transparent 24%),linear-gradient(145deg,#102d4a 0%,#071b33 62%,#0a2746 100%);box-shadow:8px 0 22px rgba(15,40,68,.16);color:#f7fbff;z-index:70}'
    + '.rb-brand{height:104px;display:flex;align-items:flex-start;justify-content:center;border-bottom:1px solid rgba(255,255,255,.28);padding:0 0 23px}.rb-brand img{height:42px;width:auto;max-width:none;object-fit:contain;background:transparent}'
    + '.rb-system{font-size:15px;letter-spacing:1px;font-weight:800;margin:16px 7px 18px;color:#f7fbff}.rb-stage{color:#ffc43e;font-weight:800;font-size:14px;letter-spacing:.3px;margin:19px 15px 12px}'
    + '.rb-nav-item{height:50px;min-height:50px;display:flex;align-items:center;gap:18px;padding:0 18px;border-radius:11px;font-size:15px;font-weight:400;margin:2px 0;color:#f5f7fb;transition:background .18s ease,transform .18s ease}.rb-nav-item:hover{background:rgba(255,255,255,.14);transform:translateX(4px)}.rb-nav-item.active{background:linear-gradient(100deg,#ffe8a0,#edb640);color:#102341;font-weight:800;box-shadow:0 4px 16px rgba(242,193,72,.32)}.rb-nav-item.active:hover{transform:none}.rb-nav.sub .rb-nav-item{height:46px;min-height:46px;padding-left:44px;font-size:14px;gap:20px}.rb-divider{height:1px;background:rgba(255,255,255,.22);margin:10px 7px 12px}'
    + '.rb-journey{height:160px;min-height:160px;border:1px solid rgba(255,255,255,.15);border-radius:14px;margin-top:17px;padding:26px 24px;background:linear-gradient(90deg,rgba(6,20,38,.58),rgba(5,24,43,.2)),url("assets/overview/journey.jpg") center/cover;color:white;position:relative;overflow:hidden}.rb-journey p{margin:0;font-size:20px;line-height:1.28;font-weight:500;width:150px}.rb-gold-stroke{width:77px;height:4px;background:#ffc544;border-radius:99px;transform:rotate(-7deg);margin-top:18px}'
    + '.rb-workspace{min-width:0;overflow:hidden;display:flex;flex-direction:column;background:#fff}.rb-topbar{position:relative;top:auto;z-index:60;height:73px;min-height:73px;background:rgba(255,255,255,.92);display:flex;align-items:center;padding:0 31px;gap:34px;border-bottom:1px solid #e8edf4;box-shadow:none;backdrop-filter:none;flex-shrink:0}.rb-portal-icon{cursor:pointer}.rb-search{width:445px;height:42px;border-radius:24px;background:#f1f4f8;display:flex;align-items:center;gap:16px;padding:0 18px;color:#4c5772;border:0}.rb-search input{font-size:14px}.rb-search-small{width:19px;height:19px}'
    + '.rb-hamburger{display:none}.rb-top-spacer{flex:1}.rb-top-icons{position:fixed;right:38px;top:0;z-index:80;height:73px;display:flex;align-items:center;gap:27px;color:#07143a;margin:0;background:rgba(255,255,255,.96);border:1px solid #e8edf4;border-radius:0 0 14px 14px;padding:0 14px;box-shadow:0 8px 22px rgba(27,50,85,.08)}.rb-icon-button{width:23px;height:23px;border:0;background:transparent;padding:0;display:grid;place-items:center;position:relative;color:#07143a;cursor:pointer}.rb-icon-button .rb-ico{width:23px;height:23px}.rb-badge{position:absolute;right:-10px;top:-9px;width:18px;height:18px;border-radius:50%;background:#e21b2d;color:#fff;font-size:10px;display:grid;place-items:center;border:2px solid white}'
    + '.rb-profile{position:relative}.rb-profile summary{list-style:none}.rb-profile summary::-webkit-details-marker{display:none}.rb-profile-trigger{display:flex;align-items:center;gap:10px;border-left:1px solid #e6ebf2;padding-left:19px;margin-left:3px;cursor:pointer;border-radius:0}.rb-profile-trigger:hover{background:transparent;box-shadow:none;transform:none}.rb-avatar{width:47px;height:47px;border-radius:50%;object-fit:cover;filter:grayscale(1);border:0;box-shadow:none}.rb-profile-text strong{display:block;font-size:13px;color:#07143a}.rb-profile-text span{display:block;font-size:11px;color:#697590;margin-top:4px}.rb-profile-chevron{font-size:22px;color:#07143a}.rb-dropdown{top:58px}'
    + '.rb-right{min-width:0}.rb-filterbar .rb-ico{width:18px;height:18px;color:#65728b}'
    + '@media(max-width:1279px){.rb-app{display:flex;flex-direction:column;min-height:0}.rb-workspace{width:100%;overflow:visible}.rb-sidebar{position:fixed;left:0;top:0;bottom:0;width:300px;max-width:86vw;height:100dvh;min-height:0;overflow-y:auto;z-index:95;transform:translateX(-106%);transition:transform .25s ease;border-radius:0 16px 16px 0}.rb-nav-toggle:checked~.rb-app .rb-sidebar{transform:none}.rb-hamburger{display:inline-flex;width:42px;height:42px;flex-shrink:0;align-items:center;justify-content:center;background:#fff;border:1px solid #e8edf4;border-radius:12px;color:#07143a;cursor:pointer}.rb-portal-icon{display:none}.rb-topbar{position:sticky;top:0;flex-wrap:wrap;height:auto;min-height:73px;row-gap:10px}.rb-search{flex:1;min-width:200px;width:auto}.rb-top-icons{position:static;height:auto;margin-left:auto;margin-bottom:0;background:transparent;border:0;border-radius:0;padding:0;box-shadow:none}.rb-right{width:100%;border-left:0;border-top:1px solid #e6ecf2}.rb-right-inner{position:static;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}}'
    + '@media(max-width:767px){.rb-topbar{padding:12px 14px;gap:10px}.rb-search{order:3;flex-basis:100%}.rb-profile-text{display:none}.rb-top-icons{margin-left:auto;gap:14px}.rb-avatar{width:36px;height:36px}.rb-profile-trigger{border-left:0;padding-left:0}.rb-profile-chevron{display:none}.rb-right-inner{grid-template-columns:1fr}}'
    + '.rb-sidebar.overview-sidebar-copy{background:radial-gradient(circle at 110% 21%,rgba(200,147,35,.25),transparent 24%),linear-gradient(145deg,#102d4a 0%,#071b33 62%,#0a2746 100%)!important;color:#f7fbff!important;padding:24px 15px 20px!important;box-shadow:8px 0 22px rgba(15,40,68,.16)!important;scrollbar-width:thin!important;scrollbar-color:#c9d3e0 #ffffff!important}.rb-sidebar.overview-sidebar-copy::-webkit-scrollbar{width:6px!important}.rb-sidebar.overview-sidebar-copy::-webkit-scrollbar-track{background:#ffffff!important}.rb-sidebar.overview-sidebar-copy::-webkit-scrollbar-thumb{background:#c9d3e0!important;border:1px solid #e8edf4!important;border-radius:999px!important}.rb-sidebar.overview-sidebar-copy .ico{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:inline-block;vertical-align:middle;flex:0 0 auto}.rb-sidebar.overview-sidebar-copy .brand{height:104px;display:flex;align-items:flex-start;justify-content:center;border-bottom:1px solid rgba(255,255,255,.28);padding:0 0 23px}.rb-sidebar.overview-sidebar-copy .system-title{font-size:15px;letter-spacing:1px;font-weight:800;margin:16px 7px 18px}.rb-sidebar.overview-sidebar-copy .nav-main,.rb-sidebar.overview-sidebar-copy .subnav{list-style:none;margin:0;padding:0}.rb-sidebar.overview-sidebar-copy .nav-item{height:50px;display:flex;align-items:center;gap:18px;padding:0 18px;border-radius:11px;font-size:15px;font-weight:400;margin:2px 0;color:#f5f7fb;cursor:pointer}.rb-sidebar.overview-sidebar-copy .nav-item.active{background:linear-gradient(100deg,#ffe8a0,#edb640);color:#102341;font-weight:800;box-shadow:0 4px 16px rgba(242,193,72,.32)}.rb-sidebar.overview-sidebar-copy .stage{color:#ffc43e;font-weight:800;font-size:14px;letter-spacing:.3px;margin:19px 15px 12px}.rb-sidebar.overview-sidebar-copy .nav-item.parent{font-weight:700}.rb-sidebar.overview-sidebar-copy .chev{margin-left:auto}.rb-sidebar.overview-sidebar-copy .subnav .nav-item{height:46px;padding-left:44px;font-size:14px;gap:20px}.rb-sidebar.overview-sidebar-copy .divider{height:1px;background:rgba(255,255,255,.22);margin:10px 7px 12px}.rb-sidebar.overview-sidebar-copy .journey{height:160px;border:1px solid rgba(255,255,255,.15);border-radius:14px;margin-top:17px;padding:26px 24px;background:linear-gradient(90deg,rgba(6,20,38,.58),rgba(5,24,43,.2)),url("assets/overview/journey.jpg") center/cover;color:#fff;position:relative;overflow:hidden;flex-shrink:0}.rb-sidebar.overview-sidebar-copy .journey p{margin:0;font-size:20px;line-height:1.28;font-weight:500;width:150px}.rb-sidebar.overview-sidebar-copy .gold-stroke{width:77px;height:4px;background:#ffc544;border-radius:99px;transform:rotate(-7deg);margin-top:18px}'
    + '@media(min-width:1280px){.rb-app{grid-template-columns:clamp(210px,13.5vw,270px) minmax(0,1fr) clamp(280px,19vw,360px)!important}.rb-sidebar.overview-sidebar-copy{position:sticky!important;top:0!important;align-self:start!important;width:100%!important;height:100dvh!important;min-height:0!important;max-height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important}.rb-workspace{grid-column:auto!important}.rb-right{grid-column:auto!important}}'
    + '@media(min-width:1280px) and (max-width:1450px){.rb-app{grid-template-columns:220px minmax(0,1fr) 290px!important}.rb-sidebar.overview-sidebar-copy{padding-left:8px!important;padding-right:8px!important}.rb-sidebar.overview-sidebar-copy .nav-item{padding-left:10px;padding-right:10px;gap:10px}.rb-sidebar.overview-sidebar-copy .subnav .nav-item{padding-left:24px}}'
    + '@media(max-width:1279px){.rb-sidebar.overview-sidebar-copy{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:300px!important;max-width:86vw!important;height:100dvh!important;min-height:0!important;overflow-y:auto!important;transform:translateX(-106%);transition:transform .25s ease;border-radius:0 16px 16px 0;z-index:95}.rb-nav-toggle:checked~.rb-app .rb-sidebar.overview-sidebar-copy{transform:none}}'
    + '</style>';

  const icons = '<svg width="0" height="0" style="position:absolute"><defs>'
    + '<symbol id="menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>'
    + '<symbol id="home" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></symbol>'
    + '<symbol id="bag" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2"/></symbol>'
    + '<symbol id="chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2"/><path d="m3 9 6-4 6 5 7-8"/></symbol>'
    + '<symbol id="doc" viewBox="0 0 24 24"><path d="M6 2h9l4 4v16H6z"/><path d="M15 2v5h5M9 12h7M9 16h7"/></symbol>'
    + '<symbol id="book" viewBox="0 0 24 24"><path d="M3 5c4-2 7-1 9 1v15c-2-2-5-3-9-1zM21 5c-4-2-7-1-9 1v15c2-2 5-3 9-1z"/></symbol>'
    + '<symbol id="search" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></symbol>'
    + '<symbol id="image" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="m4 16 5-5 4 4 3-3 5 5M16 9h.01"/></symbol>'
    + '<symbol id="users" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20v-2c0-3 2-5 6-5s6 2 6 5v2M14 14c4-1 8 1 8 5v1"/></symbol>'
    + '<symbol id="help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.7 2.7 0 1 1 4.5 2c-1.5 1-2 1.5-2 3M12 18h.01"/></symbol>'
    + '<symbol id="bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></symbol>'
    + '<symbol id="chat" viewBox="0 0 24 24"><path d="M4 4h16v13H8l-4 4z"/></symbol>'
    + '</defs></svg>';

  function sidebar(){
    return '<aside class="rb-sidebar overview-sidebar-copy" role="navigation" aria-label="Primary">'+overviewSidebarCopy('regional-boards')+'</aside>';
  }

  function topbar(){
    return overviewTopIconsCopy()+overviewTopbarCopy({includeBrand:false,regional:true,hidePortalMenu:true});
  }

  function shell(mainHtml,rightHtml){
    return css + chrome + icons + overviewChromeSpriteCopy() + '<div class="rb-root"><input class="rb-nav-toggle" type="checkbox" id="rbNavToggle"><div class="rb-app">'+sidebar()+'<label class="rb-overlay" for="rbNavToggle"></label><section class="rb-workspace">'+topbar()+mainHtml+'</section>'+rightHtml+'</div></div>';
  }

  if(countryParam){
    const country = countries.find(c=>c.id===countryParam);
    if(country){
      let list = countryBoards(countryParam);
      if(F.q){ const s=F.q.toLowerCase(); list=list.filter(b=>b.name.toLowerCase().includes(s)||String(b.url||'').toLowerCase().includes(s)||String(b.desc||'').toLowerCase().includes(s)); }
      if(F.category!=='all') list=list.filter(b=>(b.category||'general')===F.category);
      if(F.sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
      else if(F.sort==='domain') list.sort((a,b)=>{ try{return new URL(a.url).hostname.localeCompare(new URL(b.url).hostname)}catch(e){return 0} });

      function boardCard(b){
        const host=(()=>{try{return new URL(b.url).hostname.replace('www.','')}catch(e){return b.url}})();
        const preview=siteShot(b.url);
        const fallback=b.boardImg||mediaFor(country).image||country.hero||'assets/overview/hero.jpg';
        return '<article class="rb-board-card">'
          + '<div class="rb-board-image" role="img" aria-label="'+esc(b.name)+' website preview" data-preview-source="'+esc(b.url)+'" style="background-image:url(&quot;'+esc(preview)+'&quot;),url(&quot;'+esc(fallback)+'&quot;)"><span class="rb-domain">'+esc(host)+'</span></div>'
          + '<div class="rb-board-body"><h3>'+esc(b.name)+'</h3><p>'+esc(b.desc||('Explore current opportunities available through '+b.name+'.'))+'</p>'
          + '<div class="rb-board-actions"><a class="rb-primary-link jb-open" data-board="'+esc(b.id)+'" href="'+esc(b.url)+'" target="_blank" rel="noopener">Open Job Board&nbsp; ↗</a><a class="rb-secondary-link" href="'+esc(b.demoUrl||b.url)+'" target="_blank" rel="noopener">Preview</a></div></div>'
          + '</article>';
      }

      const selectedMedia=mediaFor(country);
      const main = '<main class="rb-content">'
        + '<section class="rb-hero country" data-landmark="'+esc(selectedMedia.landmark)+'" data-stock-source="'+esc(selectedMedia.source)+'" style="--rb-country-hero:url(&quot;'+esc(selectedMedia.image)+'&quot;)"><div class="rb-hero-copy"><div class="rb-eyebrow">✓ VERIFIED REGIONAL MARKETPLACE</div><h1>'+esc(country.flag||'')+' '+esc(country.name)+' <span>Job Boards</span></h1><p>Discover verified employment platforms for '+esc(country.name)+'. Search trusted local and international boards, compare opportunities, and continue building your 5-job accountability quota.</p></div></section>'
        + '<section class="rb-filterbar"><label class="rb-input-wrap"><svg class="rb-ico"><use href="#search"/></svg><input id="jbSearch" value="'+esc(F.q)+'" placeholder="Search boards, companies or domains..."></label>'
        + '<select id="jbCategory" class="rb-control"><option value="all" '+(F.category==='all'?'selected':'')+'>All Categories</option><option value="general" '+(F.category==='general'?'selected':'')+'>General</option><option value="tech" '+(F.category==='tech'?'selected':'')+'>Tech</option><option value="remote" '+(F.category==='remote'?'selected':'')+'>Remote</option></select>'
        + '<select id="jbSort" class="rb-control"><option value="name" '+(F.sort==='name'?'selected':'')+'>Sort: Name</option><option value="domain" '+(F.sort==='domain'?'selected':'')+'>Sort: Domain</option></select>'
        + '<button id="jbArrange" class="rb-control" type="button">'+(F.arrange==='list'?'Grid View':'List View')+'</button></section>'
        + '<div class="rb-section-head"><div><h2>Available Job Boards</h2><p>Trusted employment platforms serving '+esc(country.name)+'.</p></div><div class="rb-count-pill">'+list.length+' Boards</div></div>'
        + '<section id="jbGrid" class="rb-board-grid '+(F.arrange==='list'?'list':'')+'">'+(list.length?list.map(boardCard).join(''):'<div class="rb-empty">No job boards match your current filters.</div>')+'</section>'
        + '</main>';

      const right = '<aside class="rb-right"><div class="rb-right-inner">'
        + '<section class="rb-side-card"><div class="rb-side-label">Selected Market</div><h3>'+esc(country.flag||'')+' '+esc(country.name)+'</h3><p>'+esc(country.region)+' regional employment market.</p><a class="rb-side-btn" href="#regional-boards">← Back to Countries</a></section>'
        + '<section class="rb-side-card"><div class="rb-side-label">Application Quota</div><div class="rb-progress-title"><span>Weekly Progress</span><span>'+q+'/5</span></div><div class="rb-progress"><span style="width:'+pct+'%"></span></div><p style="margin-top:12px">Log five verified external applications to maintain active cohort standing.</p></section>'
        + '<section class="rb-side-card"><div class="rb-side-label">Career Tip</div><h3>Apply strategically</h3><p>Prioritize positions that closely match your verified skills and portfolio experience.</p><a class="rb-side-btn" href="#boost">Open Application Log →</a></section>'
        + '</div></aside>';
      return shell(main,right);
    }
  }

  let filtered=countries.slice();
  if(F.q){ const s=F.q.toLowerCase(); filtered=filtered.filter(c=>c.name.toLowerCase().includes(s)||c.region.toLowerCase().includes(s)); }
  if(F.region!=='all') filtered=filtered.filter(c=>c.region===F.region);
  if(F.sort==='name') filtered.sort((a,b)=>a.name.localeCompare(b.name));
  else if(F.sort==='region') filtered.sort((a,b)=>a.region.localeCompare(b.region));

  function countryCard(country){
    const bc=countryBoards(country.id).length;
    const media=mediaFor(country);
    return '<a href="#regional-boards/'+esc(country.id)+'" class="rb-country-card">'
      + '<div class="rb-country-image" role="img" aria-label="'+esc(media.landmark)+', '+esc(country.name)+'" title="'+esc(media.landmark)+'" data-landmark="'+esc(media.landmark)+'" data-stock-source="'+esc(media.source)+'" style="background-image:url(&quot;'+esc(media.image)+'&quot;),url(&quot;'+esc(country.hero||'assets/overview/hero.jpg')+'&quot;)"><span class="rb-region-chip">'+esc(country.region)+'</span><div class="rb-country-name">'+(country.flagImg?'<img class="rb-flag" loading="lazy" decoding="async" src="'+esc(country.flagImg)+'" alt="'+esc(country.name)+' flag" onerror="this.style.display=&quot;none&quot;">':'')+'<span>'+esc(country.name)+'</span></div></div>'
      + '<div class="rb-country-body"><p>'+bc+' verified job boards • Direct links to employment platforms for '+esc(country.name)+'.</p><div class="rb-country-footer"><span class="rb-open-label">Explore opportunities</span><span class="rb-arrow">→</span></div></div>'
      + '</a>';
  }

  const main = '<main class="rb-content">'
    + '<section class="rb-hero"><div class="rb-hero-copy"><div class="rb-eyebrow">✓ VERIFIED GLOBAL JOB MARKETPLACE</div><h1>Explore <span>Regional Job Boards</span><br>Across Global Markets</h1><p>Discover trusted employment platforms across multiple regions. Choose a country, access verified job boards, and build your application pipeline with confidence.</p></div></section>'
    + '<section class="rb-filterbar"><label class="rb-input-wrap"><svg class="rb-ico"><use href="#search"/></svg><input id="jbCountrySearch" value="'+esc(F.q)+'" placeholder="Search country or region, e.g. Nigeria, Europe..."></label>'
    + '<select id="jbRegion" class="rb-control"><option value="all">All Regions</option>'+regionOpts.slice(1).map(r=>'<option value="'+esc(r)+'" '+(F.region===r?'selected':'')+'>'+esc(r)+'</option>').join('')+'</select>'
    + '<select id="jbSort" class="rb-control"><option value="name" '+(F.sort==='name'?'selected':'')+'>Sort: Name</option><option value="region" '+(F.sort==='region'?'selected':'')+'>Sort: Region</option></select>'
    + '<button id="jbArrange" class="rb-control" type="button">'+(F.arrange==='list'?'Grid View':'List View')+'</button></section>'
    + '<div class="rb-section-head"><div><h2>Explore Regional Markets</h2><p>Select a country to access its verified employment platforms.</p></div><div class="rb-count-pill">'+filtered.length+' Countries</div></div>'
    + '<section id="jbCountryGrid" class="rb-country-grid '+(F.arrange==='list'?'list':'')+'">'+(filtered.length?filtered.map(countryCard).join(''):'<div class="rb-empty">No countries match your search.</div>')+'</section>'
    + '</main>';

  const right = '<aside class="rb-right"><div class="rb-right-inner">'
    + '<section class="rb-side-card"><div class="rb-side-label">Recommended</div><h3>Start with your region</h3><p>Choose your primary employment market first, then expand into remote and international opportunities.</p><div class="rb-mini-stats"><div class="rb-mini-stat"><b>'+countries.length+'</b><span>Countries</span></div><div class="rb-mini-stat"><b>'+boards.length+'</b><span>Verified Boards</span></div></div></section>'
    + '<section class="rb-side-card"><div class="rb-side-label">Filter Markets</div><div class="rb-region-buttons">'+regionOpts.map(r=>'<button class="rb-chip '+(F.region===r?'active':'')+'" type="button" onclick="window._jbSetRegion(&quot;'+esc(r)+'&quot;)">'+(r==='all'?'All':esc(r))+'</button>').join('')+'</div></section>'
    + '<section class="rb-side-card"><div class="rb-side-label">Weekly Accountability</div><div class="rb-progress-title"><span>Applications Logged</span><span>'+q+'/5</span></div><div class="rb-progress"><span style="width:'+pct+'%"></span></div><p style="margin-top:12px">Complete five verified external applications to stay active in the employment cohort.</p><a class="rb-side-btn" href="#boost">Go to Application Log →</a></section>'
    + '</div></aside>';

  return shell(main,right);
}

function bindRegionalBoards(){
  const s=document.getElementById('jbCountrySearch'); if(s) s.addEventListener('input', e=>{ window._jbFilter.q=e.target.value; const m=document.getElementById('main-content'); const h=location.hash; if(h.startsWith('#regional-boards/')){ m.innerHTML=viewRegionalBoards(window._jbCountryParam); bindRegionalBoards(); const inp=document.getElementById('jbSearch'); if(inp) inp.focus(); } else { m.innerHTML=viewRegionalBoards(); bindRegionalBoards(); const inp2=document.getElementById('jbCountrySearch'); if(inp2){ inp2.focus(); const v=inp2.value; inp2.value=''; inp2.value=v; } } });
  const r=document.getElementById('jbRegion'); if(r) r.addEventListener('change', e=>{ window._jbFilter.region=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewRegionalBoards(window._jbCountryParam); bindRegionalBoards(); });
  const so=document.getElementById('jbSort'); if(so) so.addEventListener('change', e=>{ window._jbFilter.sort=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewRegionalBoards(window._jbCountryParam); bindRegionalBoards(); });
  const ar=document.getElementById('jbArrange'); if(ar) ar.addEventListener('click', ()=>{ window._jbFilter.arrange= window._jbFilter.arrange==='grid'?'list':'grid'; const m=document.getElementById('main-content'); m.innerHTML=viewRegionalBoards(window._jbCountryParam); bindRegionalBoards(); });
  // country-detail search
  const s2=document.getElementById('jbSearch'); if(s2) s2.addEventListener('input', e=>{ window._jbFilter.q=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewRegionalBoards(window._jbCountryParam); bindRegionalBoards(); });
  const c2=document.getElementById('jbCategory'); if(c2) c2.addEventListener('change', e=>{ window._jbFilter.category=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewRegionalBoards(window._jbCountryParam); bindRegionalBoards(); });
  const so2=document.getElementById('jbSort'); if(so2 && document.getElementById('jbCategory')) so2.addEventListener('change', e=>{ window._jbFilter.sort=e.target.value; const m=document.getElementById('main-content'); m.innerHTML=viewRegionalBoards(window._jbCountryParam); bindRegionalBoards(); });
  // Workers fetch OG previews for BUG cards
  document.querySelectorAll('.jb-og-img[data-url]').forEach(el=>{
    const url=el.getAttribute('data-url'); if(!url) return;
    fetch('/api/og?url='+encodeURIComponent(url)).then(r=>r.json()).then(j=>{
      if(j.image){ el.style.backgroundImage = 'url(\''+j.image.replace(/'/g,'%27')+'\')'; } else { const fb=el.getAttribute('data-fallback'); if(fb) el.style.backgroundImage='url(\''+fb+'\')'; }
      if(j.title){ const t=el.parentElement && el.parentElement.querySelector('h3'); if(t && j.title!==new URL(url).hostname) { /* keep orig title */ } }
    }).catch(()=>{});
  });
  // board open tracking for demo (right sidebar not trending, just count)
}
window._jbSetRegion = (v)=>{ window._jbFilter.region=v; const m=document.getElementById('main-content'); m.innerHTML=viewRegionalBoards(); bindRegionalBoards(); };

function viewBoost(){
  const apps=state.boostApplications;
  const q=apps.length;
  const pct=Math.min(100,Math.round(q/5*100));
  const left=Math.max(0,5-q);
  const interviews=apps.filter(a=>a.status==='interview').length;

  const statusStyle=(status)=>{
    if(status==='accepted') return {bg:'#eaf8f3',color:'#08785b',border:'#a9dfcc'};
    if(status==='rejected') return {bg:'#fff0f2',color:'#b4233d',border:'#f2c0ca'};
    if(status==='interview') return {bg:'#fff6dd',color:'#946000',border:'#ebcf77'};
    return {bg:'#f3f6fa',color:'#59677e',border:'#dce4ed'};
  };

  const historyHtml=apps.length ? apps.map((a)=>{
    const st=statusStyle(a.status);
    return '<article class="bp-application">'
      + '<div class="bp-app-copy">'
      + '<h4>'+esc(a.role||a.company+' — Application')+' <span>— '+esc(a.company)+'</span></h4>'
      + '<div class="bp-app-meta"><span>Applied: '+esc(fmtDate(a.dateApplied))+'</span><span>Posted: '+esc(a.datePosted?fmtDate(a.datePosted):'—')+'</span>'
      + '<a href="'+esc(a.link)+'" target="_blank" rel="noopener">Open source ↗</a></div>'
      + '<div class="bp-req">'+esc((a.requirements||'No requirements summary added.').slice(0,150))+'</div>'
      + '</div>'
      + '<div class="bp-app-actions">'
      + '<select onchange="window._updateBoostStatus(\''+a.id+'\',this.value)" style="background:'+st.bg+';color:'+st.color+';border-color:'+st.border+'">'
      + '<option value="applied" '+(a.status==='applied'?'selected':'')+'>Applied</option>'
      + '<option value="interview" '+(a.status==='interview'?'selected':'')+'>Interview</option>'
      + '<option value="accepted" '+(a.status==='accepted'?'selected':'')+'>Accepted</option>'
      + '<option value="rejected" '+(a.status==='rejected'?'selected':'')+'>Rejected</option>'
      + '</select>'
      + '<button class="bp-delete" onclick="window._deleteBoost(\''+a.id+'\')" aria-label="Remove '+esc(a.company)+' application">✕</button>'
      + '</div>'
      + '</article>';
  }).join('') : '<div class="bp-empty">No applications logged yet. Use the form above to add your first verified application.</div>';

  const checklistHtml=apps.slice(0,5).map(a=>
    '<div class="bp-check"><span class="bp-box done">✓</span><span>'+esc(a.company)+' application logged</span></div>'
  ).join('') + (left
    ? '<div class="bp-check"><span class="bp-box"></span><span>Reach the 5-application weekly quota</span></div>'
    : '<div class="bp-check"><span class="bp-box done">✓</span><span>Weekly quota complete — progression unlocked</span></div>');

  const css='<style>'
    + '.boost-premium,.boost-premium *{box-sizing:border-box}.boost-premium{--bp-navy:#071b33;--bp-gold:#d99a0a;--bp-gold2:#f0c456;--bp-green:#0b9b72;--bp-blue:#0758cf;--bp-text:#07143a;--bp-muted:#697590;--bp-line:#e3e9f0;--bp-soft:#f6f8fb;display:flex;flex:1;min-height:0;background:#fff;color:var(--bp-text);font-family:Inter,"Segoe UI",Arial,sans-serif}.boost-premium button,.boost-premium input,.boost-premium select,.boost-premium textarea{font:inherit}.boost-premium a{text-decoration:none}'
    + '.bp-main{flex:1;min-width:0;overflow-y:auto;background:#fff;padding:22px 22px 50px}.bp-inner{max-width:1120px;margin:0 auto}.bp-hero{min-height:270px;border-radius:18px;overflow:hidden;padding:32px 34px;color:#fff;background:linear-gradient(90deg,rgba(5,20,38,.96),rgba(5,20,38,.84) 52%,rgba(5,20,38,.28)),url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85") center/cover;box-shadow:0 18px 40px rgba(19,47,77,.12)}.bp-eyebrow{font-size:11px;font-weight:900;letter-spacing:.75px;color:#ffd267;text-transform:uppercase}.bp-hero h1{font-size:clamp(30px,3vw,45px);line-height:1.03;margin:12px 0}.bp-hero h1 span{color:var(--bp-gold2)}.bp-hero p{max-width:700px;font-size:14px;line-height:1.68;color:#dbe5ef;margin:0}.bp-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.bp-btn{min-height:44px;border-radius:11px;padding:0 17px;border:1px solid #d6dfe8;background:#fff;color:var(--bp-navy);font-size:12px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:.18s}.bp-btn:hover{transform:translateY(-1px)}.bp-btn.primary{background:linear-gradient(100deg,#d59608,#e9bb38);border-color:#d89c11;color:#fff;box-shadow:0 8px 20px rgba(201,144,7,.28)}.bp-btn.navy{background:var(--bp-navy);color:#fff;border-color:var(--bp-navy)}'
    + '.bp-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0 20px}.bp-metric,.bp-card,.bp-side-card{background:#fff;border:1px solid #dfe7ef;border-radius:15px;box-shadow:0 5px 16px rgba(31,58,91,.045)}.bp-metric{padding:16px}.bp-metric-label{font-size:10px;color:#7a8598;font-weight:900;letter-spacing:.35px}.bp-metric b{display:block;font-size:26px;margin-top:10px}.bp-metric p{margin:3px 0 0;font-size:11px;color:#7a8598}'
    + '.bp-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.78fr);gap:18px}.bp-card{overflow:hidden}.bp-head{padding:18px 20px;border-bottom:1px solid #e7edf3;display:flex;justify-content:space-between;align-items:center;gap:12px}.bp-head h2{margin:0;font-size:19px}.bp-head p{margin:4px 0 0;color:#7a8598;font-size:12px;line-height:1.45}.bp-pill{padding:7px 10px;border-radius:999px;background:#fff6d9;border:1px solid #e7c158;color:#8a5b00;font-size:10px;font-weight:900;white-space:nowrap}.bp-body{padding:20px}.bp-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bp-full{grid-column:1/-1}.bp-field label{display:block;font-size:11px;font-weight:900;color:#45526a;margin-bottom:7px}.bp-field input,.bp-field select,.bp-field textarea{width:100%;padding:12px 13px;border:1px solid #dbe3ec;border-radius:11px;background:#f8fafc;color:#17233e;outline:0;transition:.16s}.bp-field input:focus,.bp-field select:focus,.bp-field textarea:focus{background:#fff;border-color:#9db7d7;box-shadow:0 0 0 4px rgba(7,88,207,.06)}.bp-field textarea{min-height:94px;resize:vertical}.bp-form-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px}.bp-helper{font-size:11px;color:#7b879a}'
    + '.bp-quota{background:linear-gradient(145deg,#0b2744,#071b33);color:#fff;padding:22px}.bp-qtop{display:flex;justify-content:space-between;gap:14px}.bp-quota h3{font-size:19px;margin:5px 0}.bp-quota p{font-size:12px;color:#c8d5e2;margin:0}.bp-qvalue{text-align:right}.bp-qvalue b{font-size:30px;color:#ffd361;display:block}.bp-qvalue span{font-size:10px}.bp-progress{height:11px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden;margin:18px 0 8px}.bp-progress span{display:block;height:100%;background:linear-gradient(90deg,#d99a0a,#10a477);border-radius:inherit}.bp-qrow{display:flex;justify-content:space-between;font-size:11px}.bp-checklist{display:flex;flex-direction:column;gap:10px;margin-top:18px}.bp-check{display:flex;align-items:center;gap:10px;font-size:12px;line-height:1.35}.bp-box{width:20px;height:20px;flex:0 0 20px;border-radius:6px;border:1px solid rgba(255,255,255,.28);display:grid;place-items:center}.bp-box.done{background:#10a477;border-color:#10a477}'
    + '.bp-history{margin-top:18px}.bp-list{display:flex;flex-direction:column;gap:11px;padding:16px}.bp-application{border:1px solid #e0e7ef;border-radius:14px;padding:15px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;background:#fff}.bp-application h4{margin:0 0 5px;font-size:14px}.bp-application h4 span{color:#66748a;font-weight:700}.bp-app-meta{font-size:11px;color:#778297;display:flex;gap:8px;flex-wrap:wrap}.bp-app-meta a{color:var(--bp-blue);font-weight:800}.bp-req{margin-top:7px;font-size:11px;color:#57657d;line-height:1.45}.bp-app-actions{display:flex;align-items:center;gap:7px}.bp-app-actions select{width:auto;min-width:116px;border:1px solid #dce4ed;border-radius:9px;padding:8px 9px;font-size:12px;font-weight:800;outline:none}.bp-delete{width:34px;height:34px;border-radius:9px;border:1px solid #e1e6ed;background:#fff;color:#7b8799;cursor:pointer}.bp-delete:hover{background:#fff0f2;color:#b91c35;border-color:#f4c5ce}.bp-empty{padding:30px;text-align:center;color:#788398;border:1px dashed #d6dee8;border-radius:13px;background:#fafcff}'
    + '.boost-premium{position:relative;padding-right:360px}.bp-right{position:fixed!important;top:0!important;right:0!important;bottom:0!important;z-index:54;width:360px;flex:0 0 360px;height:100dvh!important;max-height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important;border-left:1px solid #e4eaf1;background:#fbfcfe;padding:91px 17px 18px;scrollbar-width:thin;scrollbar-color:#d0d9e4 #ffffff;transform:none!important}.bp-right-inner{display:flex;flex-direction:column;gap:14px;transform:none!important;transition:none!important;will-change:auto!important}.bp-side-card{padding:18px}.bp-side-label{color:#9a6400;font-size:11px;font-weight:900;letter-spacing:.55px;text-transform:uppercase}.bp-side-card h3{margin:7px 0 6px;font-size:17px}.bp-side-card p{color:#697590;font-size:12px;line-height:1.56;margin:0}.bp-ring-wrap{position:relative}.bp-ring{width:108px;height:108px;border-radius:50%;margin:16px auto;background:conic-gradient(#10a477 0 '+pct+'%,#e8edf3 '+pct+'% 100%);display:grid;place-items:center}.bp-ring:before{content:"";width:78px;height:78px;border-radius:50%;background:#fff}.bp-ring-copy{position:absolute;inset:0;display:grid;place-items:center;text-align:center}.bp-ring-copy b{font-size:23px;display:block}.bp-ring-copy span{display:block;font-size:10px;color:#7c8899}.bp-side-progress{height:9px;background:#e5ebf1;border-radius:999px;overflow:hidden;margin:10px 0}.bp-side-progress span{display:block;height:100%;background:linear-gradient(90deg,#d99a0a,#10a477)}.bp-side-line{display:flex;justify-content:space-between;gap:10px;font-size:11px;font-weight:800}.bp-tip{min-height:180px;color:#fff;background:linear-gradient(180deg,rgba(7,27,51,.12),rgba(7,27,51,.92)),url("https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80") center/cover;display:flex;flex-direction:column;justify-content:flex-end}.bp-tip p{color:#e3ebf2}.bp-tip .bp-gold-stroke{width:77px;height:4px;background:#ffc544;border-radius:99px;transform:rotate(-7deg);margin-top:14px}'
    + '@media(max-width:1279px){.boost-topbar{position:sticky!important;left:auto!important;width:100%!important}.boost-premium{display:block;overflow-y:auto;padding-right:0}.bp-main{overflow:visible}.bp-right{position:static!important;top:auto!important;right:auto!important;bottom:auto!important;z-index:auto;width:100%;height:auto!important;max-height:none!important;overflow:visible!important;border-left:0;border-top:1px solid #e4eaf1;padding:20px;transform:none!important}.bp-right-inner{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));transform:none!important}.bp-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    + '@media(max-width:850px){.bp-grid{grid-template-columns:1fr}.bp-right-inner{grid-template-columns:1fr}}'
    + '@media(max-width:620px){.bp-main{padding:14px 13px 36px}.bp-hero{padding:24px 18px;min-height:0}.bp-hero h1{font-size:30px}.bp-metrics{grid-template-columns:1fr 1fr;gap:9px}.bp-form-grid{grid-template-columns:1fr}.bp-full{grid-column:auto}.bp-application{grid-template-columns:1fr}.bp-app-actions{justify-content:space-between}.bp-head{align-items:flex-start;flex-direction:column}}'
    + '.boost-topbar{top:0!important;margin:0!important;transition:transform .28s ease!important;will-change:transform}.boost-topbar.ov-hidden{transform:translateY(-110%)!important}'
    + '@media(min-width:1280px){.boost-topbar{position:fixed!important;top:0!important;z-index:75!important}.bp-main{padding-top:95px!important}.sidebar.boost-sidebar-position{position:sticky!important;top:0!important;align-self:flex-start!important;height:100dvh!important;min-height:0!important;max-height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important;width:clamp(210px,13.5vw,270px)!important;min-width:clamp(210px,13.5vw,270px)!important}.layout:has(.boost-premium){background:#fff!important}.main:has(.boost-premium){background:#fff!important}}'
    + '@media(min-width:1280px) and (max-width:1450px){.sidebar.boost-sidebar-position{width:220px!important;min-width:220px!important;padding-left:8px!important;padding-right:8px!important}.sidebar.boost-sidebar-position .nav-item{padding-left:10px!important;padding-right:10px!important;gap:10px!important}.sidebar.boost-sidebar-position .subnav .nav-item{padding-left:24px!important}}'
    + '@media(max-width:1279px){.sidebar.boost-sidebar-position{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:300px!important;max-width:86vw!important;height:100dvh!important;min-height:0!important;overflow-y:auto!important}}'
    + 'body.boost-page-active,#main-content.boost-page,#main-content.boost-page .boost-premium,#main-content.boost-page .boost-premium *{scrollbar-width:thin!important;scrollbar-color:#dfe6ee #ffffff!important}'
    + 'body.boost-page-active::-webkit-scrollbar,#main-content.boost-page::-webkit-scrollbar,#main-content.boost-page .boost-premium::-webkit-scrollbar,#main-content.boost-page .boost-premium *::-webkit-scrollbar{width:8px!important;height:8px!important}'
    + 'body.boost-page-active::-webkit-scrollbar-track,#main-content.boost-page::-webkit-scrollbar-track,#main-content.boost-page .boost-premium::-webkit-scrollbar-track,#main-content.boost-page .boost-premium *::-webkit-scrollbar-track{background:#ffffff!important;border:0!important}'
    + 'body.boost-page-active::-webkit-scrollbar-thumb,#main-content.boost-page::-webkit-scrollbar-thumb,#main-content.boost-page .boost-premium::-webkit-scrollbar-thumb,#main-content.boost-page .boost-premium *::-webkit-scrollbar-thumb{background:#ffffff!important;border:1px solid #e3e9f0!important;border-radius:999px!important}'
    + 'body.boost-page-active::-webkit-scrollbar-thumb:hover,#main-content.boost-page::-webkit-scrollbar-thumb:hover,#main-content.boost-page .boost-premium::-webkit-scrollbar-thumb:hover,#main-content.boost-page .boost-premium *::-webkit-scrollbar-thumb:hover{background:#f8fafc!important;border-color:#d7e0e9!important}'
    + 'body.boost-page-active::-webkit-scrollbar-corner,#main-content.boost-page::-webkit-scrollbar-corner,#main-content.boost-page .boost-premium::-webkit-scrollbar-corner,#main-content.boost-page .boost-premium *::-webkit-scrollbar-corner{background:#ffffff!important}'
    + '</style>';

  const main='<div class="bp-main"><div class="bp-inner">'
    + '<section class="bp-hero"><div class="bp-eyebrow">MANDATORY COHORT ENFORCEMENT</div><h1>Boost Your <span>Application Engine</span></h1><p>Track every external application, maintain your weekly quota, and move through ZEELIN’s employment-readiness pipeline with evidence-backed accountability.</p><div class="bp-actions"><button class="bp-btn primary" type="button" onclick="document.getElementById(\'boost-company\').focus()">＋ Log New Application</button><button class="bp-btn" type="button" onclick="document.getElementById(\'boost-history\').scrollIntoView({behavior:\'smooth\'})">View Application History</button></div></section>'
    + '<section class="bp-metrics"><article class="bp-metric"><div class="bp-metric-label">WEEKLY QUOTA</div><b>'+q+'/5</b><p>Applications logged</p></article><article class="bp-metric"><div class="bp-metric-label">COMPLETION</div><b>'+pct+'%</b><p>Quota progress</p></article><article class="bp-metric"><div class="bp-metric-label">INTERVIEWS</div><b>'+interviews+'</b><p>Active interview stage</p></article><article class="bp-metric"><div class="bp-metric-label">REMAINING</div><b>'+left+'</b><p>Applications to quota</p></article></section>'
    + '<section class="bp-grid">'
    + '<article class="bp-card"><div class="bp-head"><div><h2>Log New Job Application</h2><p>Add a verified external application to your weekly accountability record.</p></div><span class="bp-pill">VERIFIED LOG</span></div><div class="bp-body"><div class="bp-form-grid">'
    + '<div class="bp-field"><label for="boost-company">COMPANY NAME</label><input id="boost-company" type="text" placeholder="e.g. Greencore / TechCorp"></div>'
    + '<div class="bp-field"><label for="boost-role">ROLE / POSITION</label><input id="boost-role" type="text" placeholder="e.g. Senior Business Analyst"></div>'
    + '<div class="bp-field"><label for="boost-link">JOB APPLICATION LINK</label><input id="boost-link" type="url" placeholder="https://external-jobboard.com/apply"></div>'
    + '<div class="bp-field"><label for="boost-status">APPLICATION STATUS</label><select id="boost-status"><option value="applied">Applied</option><option value="interview">Interview</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select></div>'
    + '<div class="bp-field"><label for="boost-dateApplied">DATE APPLIED</label><input id="boost-dateApplied" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>'
    + '<div class="bp-field"><label for="boost-datePosted">DATE JOB WAS POSTED</label><input id="boost-datePosted" type="date"></div>'
    + '<div class="bp-field bp-full"><label for="boost-req">JOB REQUIREMENTS SUMMARY</label><textarea id="boost-req" placeholder="Business Analysis, SQL, Stakeholder Mapping, Power BI..."></textarea></div>'
    + '</div><div class="bp-form-foot"><span class="bp-helper">Each verified entry contributes to the mandatory 5-application weekly quota.</span><button class="bp-btn primary" type="button" onclick="window._submitBoost()">Submit &amp; Count Application (+1)</button></div></div></article>'
    + '<article class="bp-card bp-quota"><div class="bp-qtop"><div><div class="bp-eyebrow">ACCOUNTABILITY ENGINE</div><h3>5-Application Quota</h3><p>Strict progression rule</p></div><div class="bp-qvalue"><b>'+q+' / 5</b><span>'+(left?left+' LEFT':'QUOTA MET')+'</span></div></div><div class="bp-progress"><span style="width:'+pct+'%"></span></div><div class="bp-qrow"><span>Weekly progress</span><strong>'+pct+'%</strong></div><div class="bp-checklist">'+checklistHtml+'</div><button class="bp-btn" type="button" style="width:100%;margin-top:20px" onclick="window._nav(\'regional-boards\')">Explore More Job Boards →</button></article>'
    + '</section>'
    + '<section class="bp-card bp-history" id="boost-history"><div class="bp-head"><div><h2>Verified Application History</h2><p>Track Applied → Interview → Accepted / Rejected.</p></div><span class="bp-pill">'+q+' APPLICATION'+(q===1?'':'S')+'</span></div><div class="bp-list">'+historyHtml+'</div></section>'
    + '</div></div>';

  const right='<aside class="bp-right"><div class="bp-right-inner">'
    + '<section class="bp-side-card"><div class="bp-side-label">Weekly Accountability</div><h3>Application Quota</h3><p>Complete five verified applications to remain active in the employment cohort.</p><div class="bp-ring-wrap"><div class="bp-ring"></div><div class="bp-ring-copy"><div><b>'+q+'/5</b><span>Logged</span></div></div></div><div class="bp-side-line"><span>Current progress</span><span>'+pct+'%</span></div><div class="bp-side-progress"><span style="width:'+pct+'%"></span></div></section>'
    + '<section class="bp-side-card"><div class="bp-side-label">Next Action</div><h3>'+(left?left+' application'+(left===1?'':'s')+' remaining':'Weekly quota complete')+'</h3><p>'+(left?'Return to Regional Job Boards, identify suitable opportunities, and log each verified application here.':'Your five-application weekly quota is complete. Continue tracking interviews and offer outcomes.')+'</p><button class="bp-btn navy" type="button" style="width:100%;margin-top:14px" onclick="window._nav(\'regional-boards\')">Go to Regional Job Boards →</button></section>'
    + '<section class="bp-side-card bp-tip"><div class="bp-side-label" style="color:#ffd46b">Career Momentum</div><h3>Stay consistent.</h3><p>Every verified application increases your exposure to real opportunities.</p><div class="bp-gold-stroke"></div></section>'
    + '</div></aside>';

  const boostTopbar = topbarHtml('ZEELIN JOB ACQUISITION PORTAL \u2022 Boost & Accountability','',pct)
    .replace('class="topbar job-copied-topbar"','class="topbar job-copied-topbar boost-topbar"')
    .replace(/<div class="job-copied-topbar-space"[^>]*><\/div>/,'');
  return boostTopbar
    + css
    + '<div class="boost-premium">'+main+right+'</div>';
}

function linkedInPreviewHtml(){
  const p=state.linkedInProfile;
  const logo='<img class="cvp-li-logo" src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Linkedin-logo-blue-In-square-40px.png" alt="LinkedIn logo">';
  if(!p || !p.url) return logo+'<div><h4 style="font-size:14px;margin:0 0 4px;color:#07143a">No LinkedIn profile saved yet</h4><div style="font-size:11px;color:#7c8799">Paste your LinkedIn profile URL and click Save or Fetch Demo.</div></div>';
  const name=esc(p.name||'LinkedIn User');
  const headline=esc(p.headline||'Business Analysis • Supply Chain');
  const loc=esc(p.location||'London, UK');
  const about=esc(p.about||'Results-driven professional with verified ZEELIN work experience.');
  const url=esc(p.url);
  return logo+'<div style="min-width:0"><h4 style="font-size:14px;margin:0 0 4px;color:#07143a">'+name+'</h4><div style="font-size:12px;color:#0a66c2;font-weight:800">'+headline+'</div><div style="font-size:11px;color:#7c8799;margin-top:3px">'+loc+' • <a href="'+url+'" target="_blank" rel="noopener" style="color:#0a66c2;font-weight:800">'+url+'</a></div><div style="font-size:11px;color:#59677d;line-height:1.5;margin-top:7px">'+about+'</div></div>';
}
window._saveLinkedIn = function(){
  const el=document.getElementById('input-linkedin');
  const url = el ? el.value.trim() : '';
  if(!url){ showToast('Paste your LinkedIn profile link first'); return; }
  if(!/linkedin\.com\/in\//i.test(url)){ showToast('Invalid LinkedIn link — should look like https://linkedin.com/in/your-profile'); return; }
  const slug = (url.split('/in/')[1]||'').split('/')[0].split('?')[0].replace(/-/g,' ');
  const mockName = slug ? slug.split(' ').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ') : state.cvDraft.name;
  state.linkedInProfile = {
    url: url,
    name: mockName || state.cvDraft.name,
    headline: state.cvDraft.title || 'Business Analyst • Supply Chain',
    location: state.cvDraft.location || 'London, UK',
    about: state.cvDraft.summary ? state.cvDraft.summary.slice(0,160) + '...' : 'Demo LinkedIn about — helps build your LinkedIn presence and auto-fills CV.',
    fetchedAt: new Date().toISOString()
  };
  saveState();
  const prev=document.getElementById('linkedin-preview');
  if(prev) prev.innerHTML = linkedInPreviewHtml();
  showToast('LinkedIn profile saved — demo preview updated');
  render(state.activeView);
};
window._fetchLinkedIn = function(){
  const el=document.getElementById('input-linkedin');
  const url = el ? el.value.trim() : (state.linkedInProfile?state.linkedInProfile.url:'');
  if(!url){ showToast('Paste a LinkedIn link first'); return; }
  showToast('Fetching LinkedIn demo data for '+url+'…');
  // Try Workers OG fetch as demo, fallback to mock
  fetch('/api/og?url='+encodeURIComponent(url)).then(r=>r.json()).then(j=>{
    const slug = (url.split('/in/')[1]||'').split('/')[0].split('?')[0].replace(/-/g,' ');
    const mockName = j.title && j.title.length>3 && !j.title.includes('LinkedIn') ? j.title.split(' | ')[0] : (slug ? slug.split(' ').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ') : state.cvDraft.name);
    state.linkedInProfile = {
      url: url,
      name: mockName,
      headline: (j.description||'').slice(0,80) || state.cvDraft.title,
      location: state.cvDraft.location,
      about: (j.description|| state.cvDraft.summary || '').slice(0,180),
      fetchedAt: new Date().toISOString()
    };
    saveState();
    const prev=document.getElementById('linkedin-preview');
    if(prev) prev.innerHTML = linkedInPreviewHtml();
    showToast('LinkedIn demo fetch complete — preview updated');
    render(state.activeView);
  }).catch(()=>{
    window._saveLinkedIn();
  });
};
window._applyLinkedInToCV = function(){
  const p = state.linkedInProfile;
  if(!p || !p.url){ showToast('Save a LinkedIn profile first'); return; }
  if(p.headline) state.cvDraft.title = p.headline.slice(0,80);
  if(p.about) state.cvDraft.summary = p.about.slice(0,400);
  if(p.name) state.cvDraft.name = p.name;
  saveState();
  showToast('Applied LinkedIn headline & about to your CV draft');
  render(state.activeView);
  setTimeout(()=>{ const el=document.getElementById('input-summary'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); }, 300);
};
window._generateHeadline = function(){
  const base = state.cvDraft.title || 'Business Analyst';
  const ind = state.cvDraft.industry || 'Supply Chain';
  const sugg = base + ' | ' + ind + ' | Open to Work • Zeelin Verified';
  const el=document.getElementById('input-linkedin-headline');
  if(el) el.value = sugg;
  if(state.linkedInProfile){ state.linkedInProfile.headline = sugg; saveState(); const prev=document.getElementById('linkedin-preview'); if(prev) prev.innerHTML = linkedInPreviewHtml(); }
  showToast('Headline generated — edit and Save');
};
window._addExperience = function(){
  const t=document.getElementById('exp-title'), c=document.getElementById('exp-company'), d=document.getElementById('exp-duration');
  if(!t||!c||!t.value.trim()||!c.value.trim()){ showToast('Enter title and company'); return; }
  if(!state.linkedInExtras) state.linkedInExtras={experiences:[],skills:[],visibility:{customUrl:false,creatorMode:false,featuredSection:false,openToWork:false},activityLog:[]};
  state.linkedInExtras.experiences.push({id:'ex_'+Date.now(), title:t.value.trim(), company:c.value.trim(), duration:d.value.trim()||'1 yr'});
  state.linkedInExtras.activityLog.unshift({at:new Date().toISOString(), action:'Added experience: '+t.value.trim()+' @ '+c.value.trim()});
  t.value=''; c.value=''; if(d) d.value='';
  saveState(); render(state.activeView);
};
window._removeExperience = function(id){ if(!state.linkedInExtras) return; state.linkedInExtras.experiences = state.linkedInExtras.experiences.filter(x=>x.id!==id); state.linkedInExtras.activityLog.unshift({at:new Date().toISOString(), action:'Removed experience'}); saveState(); render(state.activeView); };
window._addSkill = function(){
  const el=document.getElementById('skill-input');
  const v=el?el.value.trim():'';
  if(!v){ showToast('Enter a skill'); return; }
  if(!state.linkedInExtras) state.linkedInExtras={experiences:[],skills:[],visibility:{customUrl:false,creatorMode:false,featuredSection:false,openToWork:false},activityLog:[]};
  if(!state.linkedInExtras.skills.includes(v)) state.linkedInExtras.skills.push(v);
  state.linkedInExtras.activityLog.unshift({at:new Date().toISOString(), action:'Added skill: '+v});
  if(el) el.value='';
  saveState(); render(state.activeView);
};
window._removeSkill = function(s){ if(!state.linkedInExtras) return; state.linkedInExtras.skills = state.linkedInExtras.skills.filter(x=>x!==s); state.linkedInExtras.activityLog.unshift({at:new Date().toISOString(), action:'Removed skill: '+s}); saveState(); render(state.activeView); };
window._toggleVisibility = function(k){ if(!state.linkedInExtras) state.linkedInExtras={experiences:[],skills:[],visibility:{customUrl:false,creatorMode:false,featuredSection:false,openToWork:false},activityLog:[]}; state.linkedInExtras.visibility[k]=!state.linkedInExtras.visibility[k]; state.linkedInExtras.activityLog.unshift({at:new Date().toISOString(), action:'Toggled visibility: '+k}); saveState(); render(state.activeView); };
window._copyLinkedInLink = function(){ const p=state.linkedInProfile; if(!p||!p.url){ showToast('No LinkedIn link saved'); return; } try{ navigator.clipboard.writeText(p.url); }catch(e){} showToast('Copied LinkedIn link'); if(!state.linkedInExtras) state.linkedInExtras={experiences:[],skills:[],visibility:{customUrl:false,creatorMode:false,featuredSection:false,openToWork:false},activityLog:[]}; state.linkedInExtras.activityLog.unshift({at:new Date().toISOString(), action:'Copied link'}); saveState(); };
function linkedInStrength(){
  const p=state.linkedInProfile;
  let score=0, total=6;
  if(p&&p.url) score++;
  if(p&&p.name) score++;
  if(p&&p.headline) score++;
  if(p&&p.about) score++;
  if((state.linkedInExtras&&state.linkedInExtras.experiences||[]).length) score++;
  if((state.linkedInExtras&&state.linkedInExtras.skills||[]).length>=3) score++;
  return Math.round(score/total*100);
}
function linkedInStatsHtml(){
  const p=state.linkedInProfile||{};
  const con = p.connections||512;
  const views = p.profileViews||1240;
  const search = p.searchAppearances||86;
  return '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">'
    + '<div style="background:#1e293b;border:1px solid #3b82f6;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:900;color:#38bdf8;">'+con+'+</div><div style="font-size:10px;font-weight:800;color:#a3a3a3;">Connections</div><div style="font-size:10px;color:#4ade80;">↑ 12% demo</div></div>'
    + '<div style="background:#1e293b;border:1px solid #3b82f6;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:900;color:#38bdf8;">'+views+'</div><div style="font-size:10px;font-weight:800;color:#a3a3a3;">Profile views</div><div style="font-size:10px;color:#4ade80;">↑ 8% demo</div></div>'
    + '<div style="background:#1e293b;border:1px solid #3b82f6;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:900;color:#38bdf8;">'+search+'</div><div style="font-size:10px;font-weight:800;color:#a3a3a3;">Search appearances</div><div style="font-size:10px;color:#4ade80;">↑ 5% demo</div></div>'
    + '</div>';
}

function cvPortfolioPremiumStyles(){
  return '<style>'
    + '.cvp-root,.cvp-root *{box-sizing:border-box}.cvp-root{--ink:#07143a;--muted:#697590;--line:#dfe7ef;--soft:#f6f8fb;--gold:#d99a0a;--gold2:#f0c456;--blue:#0a66c2;--green:#0a9b70;flex:1;min-height:0;background:#fff;color:var(--ink);font-family:Inter,"Segoe UI",Arial,sans-serif}.cvp-root button,.cvp-root input,.cvp-root select,.cvp-root textarea{font:inherit}.cvp-root a{text-decoration:none;color:inherit}'
    + '.cvp-scroll{height:100%;overflow-y:auto;background:#fff;padding:22px;scrollbar-width:thin;scrollbar-color:#d9e2ec #fff}.cvp-scroll::-webkit-scrollbar{width:7px}.cvp-scroll::-webkit-scrollbar-track{background:#fff}.cvp-scroll::-webkit-scrollbar-thumb{background:#d9e2ec;border-radius:999px}.cvp-inner{max-width:1480px;margin:0 auto;min-height:100%;display:flex;flex-direction:column}'
    + '.cvp-hero{min-height:240px;border-radius:18px;padding:32px 34px;color:#fff;background:linear-gradient(90deg,rgba(5,20,38,.96),rgba(5,20,38,.84) 52%,rgba(5,20,38,.24)),url("https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1600&q=85") center/cover;box-shadow:0 18px 40px rgba(19,47,77,.12)}.cvp-eyebrow{font-size:11px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;color:#ffd36a}.cvp-hero h1{font-size:clamp(31px,3vw,45px);line-height:1.04;margin:10px 0 12px}.cvp-hero h1 span{color:var(--gold2)}.cvp-hero p{max-width:780px;font-size:14px;line-height:1.68;color:#dce6ef;margin:0}.cvp-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.cvp-btn{min-height:42px;border:1px solid #d6dfe8;border-radius:11px;background:#fff;color:var(--ink);padding:0 16px;font-size:12px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:.18s}.cvp-btn:hover{transform:translateY(-1px)}.cvp-btn.primary{background:linear-gradient(100deg,#d59608,#e9bb38);border-color:#d89c11;color:#fff;box-shadow:0 8px 20px rgba(201,144,7,.25)}.cvp-btn.navy{background:#071b33;color:#fff;border-color:#071b33}.cvp-btn.blue{background:#0a66c2;color:#fff;border-color:#0a66c2}.cvp-btn.green{background:#0a9b70;color:#fff;border-color:#0a9b70}'
    + '.cvp-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0}.cvp-metric,.cvp-card{background:#fff;border:1px solid var(--line);border-radius:15px;box-shadow:0 5px 16px rgba(31,58,91,.045)}.cvp-metric{padding:16px}.cvp-metric span{font-size:10px;color:#7a8598;font-weight:900;letter-spacing:.3px}.cvp-metric b{display:block;font-size:26px;margin-top:9px}.cvp-metric p{font-size:11px;color:#7a8598;margin:3px 0 0}'
    + '.cvp-hub-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;flex:1;min-height:440px}.cvp-hub-card{min-height:440px;border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 12px 30px rgba(30,58,90,.09);cursor:pointer;overflow:hidden;display:flex;flex-direction:column;transition:.22s}.cvp-hub-card:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(30,58,90,.15)}.cvp-hub-visual{height:245px;position:relative;background-size:cover;background-position:center;flex:0 0 245px}.cvp-hub-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,20,58,.04),rgba(7,20,58,.6))}.cvp-hub-content{padding:25px;display:flex;flex-direction:column;flex:1}.cvp-hub-content h2{font-size:25px;line-height:1.08;margin:0 0 9px;font-weight:900}.cvp-hub-content p{font-size:13px;line-height:1.65;color:#697590;margin:0}.cvp-hub-link{margin-top:auto;padding-top:22px;font-size:13px;font-weight:900;color:#0758cf}.cvp-ats-badge{position:absolute;left:22px;bottom:20px;z-index:2;padding:10px 13px;background:rgba(255,255,255,.95);border-radius:12px;font-size:12px;font-weight:900;color:#8a5b00;box-shadow:0 6px 18px rgba(0,0,0,.12)}.cvp-linkedin-logo{position:absolute;left:22px;bottom:20px;z-index:2;width:64px;height:64px;object-fit:contain;background:#fff;border-radius:14px;padding:5px;box-shadow:0 8px 22px rgba(10,102,194,.22)}'
    + '.cvp-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,.92fr);gap:18px;margin-top:18px}.cvp-card{overflow:hidden}.cvp-card+.cvp-card{margin-top:16px}.cvp-head{padding:18px 20px;border-bottom:1px solid #e7edf3;display:flex;align-items:center;justify-content:space-between;gap:12px}.cvp-head h2,.cvp-head h3{margin:0}.cvp-head h2{font-size:19px}.cvp-head h3{font-size:16px}.cvp-head p{margin:4px 0 0;color:#7a8598;font-size:12px;line-height:1.45}.cvp-pill{padding:7px 10px;border-radius:999px;background:#fff6d9;border:1px solid #e7c158;color:#8a5b00;font-size:10px;font-weight:900;white-space:nowrap}.cvp-body{padding:20px}.cvp-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.cvp-full{grid-column:1/-1}.cvp-field label{display:block;font-size:11px;font-weight:900;color:#45526a;margin-bottom:7px}.cvp-field input,.cvp-field select,.cvp-field textarea{width:100%;padding:12px 13px;border:1px solid #dbe3ec;border-radius:11px;background:#f8fafc;color:#17233e;outline:0;transition:.16s}.cvp-field textarea{min-height:94px;resize:vertical}.cvp-field input:focus,.cvp-field select:focus,.cvp-field textarea:focus{background:#fff;border-color:#9db7d7;box-shadow:0 0 0 4px rgba(7,88,207,.06)}'
    + '.cvp-preview{position:sticky;top:18px}.cvp-preview-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.cvp-preview-toolbar h3{margin:2px 0 0;font-size:17px}.cvp-paper{min-height:660px;padding:30px;background:#fffbf0;color:#111;border-radius:10px;border-top:4px solid #d97706;box-shadow:0 14px 35px rgba(20,40,70,.16);font-family:Georgia,"Times New Roman",serif}.cvp-paper h1{text-align:center;font-size:27px;margin:0}.cvp-paper-title{text-align:center;color:#b77400;font-weight:700;margin-top:4px}.cvp-contact{text-align:center;font-size:11px;color:#5a6170;margin-top:5px}.cvp-section{margin-top:20px}.cvp-section h4{font-size:12px;letter-spacing:.7px;text-transform:uppercase;border-bottom:1px solid currentColor;padding-bottom:4px;margin:0 0 8px}.cvp-section p{font-size:11px;line-height:1.55;margin:0}.cvp-themes{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.cvp-theme{border:1px solid #dbe3ec;border-radius:9px;overflow:hidden;background:#fff;cursor:pointer;text-align:center}.cvp-theme.active{border:2px solid #d99a0a}.cvp-theme-img{height:52px;background-size:cover;background-position:center;border-bottom:1px solid #e5eaf0}.cvp-theme-label{padding:7px;font-size:10px;font-weight:900;color:#697590}'
    + '.cvp-portfolio-grid{display:grid;grid-template-columns:minmax(0,1fr) 350px;gap:18px;margin-top:18px}.cvp-profile-line{display:flex;align-items:center;gap:16px}.cvp-profile-avatar{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#0a66c2,#75b9ee);color:#fff;font-size:26px;font-weight:900}.cvp-profile-copy h2{margin:0;font-size:20px}.cvp-profile-copy p{margin:5px 0 0;font-size:12px;color:#697590}.cvp-li-preview{display:flex;gap:15px;align-items:flex-start;background:#f8fbff;border:1px solid #d7e6f5;border-radius:13px;padding:16px;margin-top:14px;min-height:86px}.cvp-li-logo{width:48px;height:48px;object-fit:contain;border-radius:8px;flex:0 0 48px}.cvp-li-preview h4{font-size:14px;margin:0 0 4px}.cvp-li-preview .headline{font-size:12px;color:#0a66c2;font-weight:800}.cvp-li-preview .meta{font-size:11px;color:#7c8799;margin-top:3px}.cvp-li-preview .about{font-size:11px;color:#59677d;line-height:1.5;margin-top:7px}.cvp-exp{padding:14px;border:1px solid #e2e8ef;border-radius:12px;display:flex;justify-content:space-between;gap:12px;align-items:center}.cvp-exp+.cvp-exp{margin-top:8px}.cvp-exp strong{font-size:13px}.cvp-exp span{display:block;font-size:11px;color:#7c8799;margin-top:3px}.cvp-chips{display:flex;flex-wrap:wrap;gap:8px}.cvp-chip{padding:8px 10px;border-radius:999px;background:#eef5ff;border:1px solid #cfe0f6;color:#0a66c2;font-size:11px;font-weight:800}.cvp-chip button{border:0;background:transparent;color:#0a66c2;font-weight:900;margin-left:5px}.cvp-strength{height:10px;background:#e6ebf1;border-radius:999px;overflow:hidden}.cvp-strength span{display:block;height:100%;background:linear-gradient(90deg,#0a66c2,#0a9b70)}.cvp-checks{display:flex;flex-direction:column;gap:10px}.cvp-check{display:flex;align-items:center;gap:9px;font-size:12px}.cvp-check input{accent-color:#0a66c2;width:17px;height:17px}.cvp-activity{font-size:11px;color:#68758b;padding:10px 0;border-bottom:1px solid #eef2f6}.cvp-qr{width:112px;height:112px;margin:0 auto;background:repeating-linear-gradient(45deg,#07143a 0 5px,#fff 5px 10px);border:10px solid #fff;box-shadow:0 0 0 1px #dfe7ef}'
    + '@media(max-width:1279px){.cvp-hub-grid{grid-template-columns:1fr 1fr}.cvp-portfolio-grid{grid-template-columns:1fr}.cvp-preview{position:static}}'
    + '@media(max-width:900px){.cvp-split{grid-template-columns:1fr}.cvp-metrics{grid-template-columns:1fr 1fr}}'
    + '@media(max-width:620px){.cvp-scroll{padding:14px 13px}.cvp-hero{padding:24px 18px}.cvp-hub-grid{grid-template-columns:1fr}.cvp-hub-card{min-height:390px}.cvp-hub-visual{height:210px;flex-basis:210px}.cvp-form-grid{grid-template-columns:1fr}.cvp-full{grid-column:auto}.cvp-themes{grid-template-columns:repeat(2,1fr)}.cvp-head{align-items:flex-start;flex-direction:column}}'
    + '</style>';
}

function viewCVMaker(){
  const cvFields=[state.cvDraft.name,state.cvDraft.title,state.cvDraft.email,state.cvDraft.location,state.cvDraft.certs,state.cvDraft.summary].filter(Boolean).length;
  const cvPct=Math.round(cvFields/6*100);
  const profilePct=linkedInStrength();
  return topbarHtml('CV Maker & Portfolio Hub','',Math.round((cvPct+profilePct)/2))
    + cvPortfolioPremiumStyles()
    + '<div class="cvp-root"><div class="cvp-scroll"><div class="cvp-inner">'
    + '<section class="cvp-hero"><div class="cvp-eyebrow">CAREER IDENTITY WORKSPACE</div><h1>CV Maker &amp; <span>Portfolio Hub</span></h1><p>Build an ATS-ready CV and strengthen your professional portfolio with a focused, employer-facing workspace built around your verified ZEELIN career evidence.</p><div class="cvp-actions"><button class="cvp-btn primary" type="button" onclick="window._nav(\'cv-maker/cv\')">Open ATS CV Maker</button><button class="cvp-btn" type="button" onclick="window._nav(\'cv-maker/portfolio\')">Open Portfolio &amp; LinkedIn</button></div></section>'
    + '<section class="cvp-metrics"><article class="cvp-metric"><span>CV COMPLETION</span><b>'+cvPct+'%</b><p>Core professional fields populated</p></article><article class="cvp-metric"><span>PROFILE STRENGTH</span><b>'+profilePct+'%</b><p>LinkedIn &amp; portfolio readiness</p></article><article class="cvp-metric"><span>VERIFIED PROJECTS</span><b>2</b><p>Stage 2 evidence embedded</p></article><article class="cvp-metric"><span>ATS THEMES</span><b>5</b><p>Professional resume templates</p></article></section>'
    + '<section class="cvp-hub-grid">'
    + '<article class="cvp-hub-card" onclick="window._nav(\'cv-maker/cv\')"><div class="cvp-hub-visual" style="background-image:url(\'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1400&q=85\')"><div class="cvp-ats-badge">ATS CV BUILDER • LIVE PREVIEW</div></div><div class="cvp-hub-content"><h2>ATS CV Maker</h2><p>Create a targeted, ATS-ready professional CV with live editing, verified project evidence, role-specific content, AI wording assistance, PDF output, and five polished template themes.</p><div class="cvp-hub-link">Build Your CV →</div></div></article>'
    + '<article class="cvp-hub-card" onclick="window._nav(\'cv-maker/portfolio\')"><div class="cvp-hub-visual" style="background-image:linear-gradient(135deg,rgba(10,102,194,.08),rgba(7,27,51,.16)),url(\'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85\')"><img class="cvp-linkedin-logo" src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Linkedin-logo-blue-In-square-40px.png" alt="LinkedIn logo"></div><div class="cvp-hub-content"><h2>Portfolio &amp; LinkedIn</h2><p>Strengthen your professional presence with LinkedIn profile positioning, headline optimization, experience, skills, visibility checks, share tools, and reusable content for your CV.</p><div class="cvp-hub-link">Open Portfolio Workspace →</div></div></article>'
    + '</section></div></div></div>';
}

function viewCVMakerDetail(){
  const d=state.cvDraft;
  const themes={
    executive:{bg:'#fffbf0',color:'#111111',border:'3px solid #d97706',titleColor:'#d97706'},
    corporate:{bg:'#f8fafc',color:'#0f172a',border:'3px solid #2563eb',titleColor:'#2563eb'},
    minimalist:{bg:'#ffffff',color:'#27272a',border:'1px solid #71717a',titleColor:'#71717a'},
    tech:{bg:'#f0fdf4',color:'#14532d',border:'3px solid #16a34a',titleColor:'#16a34a'},
    classic:{bg:'#fafaf9',color:'#292524',border:'2px solid #78716c',titleColor:'#78716c'}
  };
  const t=themes[d.template]||themes.executive;
  const themeCards=[
    ['executive','Executive','https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80'],
    ['corporate','Corporate','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80'],
    ['minimalist','Minimalist','https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?auto=format&fit=crop&w=300&q=80'],
    ['tech','Tech Focus','https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80'],
    ['classic','Classic','https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80']
  ].map(x=>'<div id="card-'+x[0]+'" class="cvp-theme '+(d.template===x[0]?'active':'')+'" onclick="window._setTemplate(\''+x[0]+'\')"><div class="cvp-theme-img" style="background-image:url(\''+x[2]+'\')"></div><div class="cvp-theme-label">'+x[1]+'</div></div>').join('');

  return topbarHtml('CV Maker','',90)
    + cvPortfolioPremiumStyles()
    + '<div class="cvp-root"><div class="cvp-scroll"><div class="cvp-inner">'
    + '<section class="cvp-hero" style="min-height:215px;background:linear-gradient(90deg,rgba(5,20,38,.96),rgba(5,20,38,.82) 55%,rgba(5,20,38,.25)),url(\'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=85\') center/cover"><div class="cvp-eyebrow">ATS OPTIMIZATION ENGINE</div><h1>Targeted <span>Resume Builder</span></h1><p>Build and refine your professional CV using your experience, verified training evidence, certifications and target job requirements. Every change updates the live canvas instantly.</p><div class="cvp-actions"><button class="cvp-btn" type="button" onclick="window._nav(\'cv-maker\')">← Back to Hub</button><button class="cvp-btn primary" type="button" onclick="window._downloadCV()">Download / Print PDF</button></div></section>'
    + '<section class="cvp-split"><div>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h2>1. Personal Details</h2><p>Core identity and contact information.</p></div><span class="cvp-pill">LIVE</span></div><div class="cvp-body"><div class="cvp-form-grid">'
    + '<div class="cvp-field"><label>FULL NAME</label><input id="input-name" value="'+esc(d.name)+'" oninput="window._updateCV()"></div>'
    + '<div class="cvp-field"><label>PROFESSIONAL TITLE</label><input id="input-title" value="'+esc(d.title)+'" oninput="window._updateCV()"></div>'
    + '<div class="cvp-field"><label>EMAIL</label><input id="input-email" value="'+esc(d.email)+'" oninput="window._updateCV()"></div>'
    + '<div class="cvp-field"><label>LOCATION</label><input id="input-location" value="'+esc(d.location)+'" oninput="window._updateCV()"></div>'
    + '<div class="cvp-field cvp-full"><label>CERTIFICATIONS</label><input id="input-certs" value="'+esc(d.certs)+'" oninput="window._updateCV()"></div>'
    + '</div></div></article>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h2>2. Professional Background</h2><p>Experience level, sector focus and summary.</p></div></div><div class="cvp-body"><div class="cvp-form-grid">'
    + '<div class="cvp-field"><label>EXPERIENCE LEVEL</label><select id="input-level" onchange="window._updateCV()"><option value="Senior Specialist" '+(d.level==='Senior Specialist'?'selected':'')+'>Senior Specialist</option><option value="Mid-Level Analyst" '+(d.level==='Mid-Level Analyst'?'selected':'')+'>Mid-Level Analyst</option><option value="Junior / Graduate" '+(d.level==='Junior / Graduate'?'selected':'')+'>Junior / Graduate</option></select></div>'
    + '<div class="cvp-field"><label>PRIMARY INDUSTRY FOCUS</label><input id="input-industry" value="'+esc(d.industry)+'" oninput="window._updateCV()"></div>'
    + '<div class="cvp-field cvp-full"><label>BACKGROUND SUMMARY</label><textarea id="input-summary" oninput="window._updateCV()">'+esc(d.summary)+'</textarea></div>'
    + '</div></div></article>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h2>3. Target Job Description</h2><p>Use the role requirements to tune your ATS language.</p></div></div><div class="cvp-body"><div class="cvp-field"><label>TARGET ROLE / REQUIREMENTS</label><textarea id="input-job">'+esc(d.jobDesc)+'</textarea></div><div class="cvp-actions"><button class="cvp-btn primary" type="button" onclick="window._aiEnhance()">✨ Enhance Summary</button><button class="cvp-btn" type="button" onclick="window._nav(\'cv-maker/portfolio\')">Import from Portfolio</button></div></div></article>'
    + '</div><aside class="cvp-preview">'
    + '<div class="cvp-preview-toolbar"><div><div class="cvp-eyebrow" style="color:#9a6400">DYNAMIC LIVE CANVAS</div><h3>ATS-Compliant Professional CV</h3></div><button class="cvp-btn navy" type="button" onclick="window._downloadCV()">Download PDF</button></div>'
    + '<div id="cv-canvas" class="cvp-paper" style="background:'+t.bg+';color:'+t.color+';border-top:'+t.border+'"><div id="cv-header" style="border-bottom:'+t.border+';padding-bottom:12px;margin-bottom:16px"><h1 id="cv-name">'+esc((d.name||'').toUpperCase())+'</h1><div id="cv-title" class="cvp-paper-title" style="color:'+t.titleColor+'">'+esc(d.title)+'</div><div id="cv-contact" class="cvp-contact">'+esc(d.location)+' • '+esc(d.email)+' • Experience Level: '+esc(d.level)+' • Focus: '+esc(d.industry)+'</div></div><div class="cvp-section"><h4>Professional Background &amp; Summary</h4><p id="cv-summary-text">'+esc(d.summary)+'</p></div><div class="cvp-section"><h4>Certifications &amp; Core Competencies</h4><p id="cv-certs"><strong>Certifications:</strong> '+esc(d.certs)+'.<br><strong>Focus:</strong> '+esc(d.industry)+' ('+esc(d.level)+').</p></div><div class="cvp-section"><h4>Verified Work Experience Deliverables</h4><p><strong>Retail Supply Chain Optimization Model</strong> — Grade 92/100<br>Engineered spreadsheet financial models mapping annual carrying cost multipliers and inventory turnover metrics.</p><p style="margin-top:10px"><strong>Business Requirements Specification (BRS)</strong> — Grade 93/100<br>Conducted stakeholder interviews, documented functional specifications, and created MoSCoW prioritization matrices.</p></div></div>'
    + '<div class="cvp-themes">'+themeCards+'</div>'
    + '</aside></section></div></div></div>';
}

function viewPortfolio(){
  const p=state.linkedInProfile||{};
  const st=linkedInStrength();
  const ex=state.linkedInExtras||{experiences:[],skills:[],visibility:{customUrl:false,creatorMode:false,featuredSection:false,openToWork:false},activityLog:[]};
  const vis=ex.visibility||{};
  const visPct=Math.round(((vis.customUrl?1:0)+(vis.creatorMode?1:0)+(vis.featuredSection?1:0)+(vis.openToWork?1:0))/4*100);
  const initials=esc((p.name||state.cvDraft.name||'IW').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase());
  const exList=(ex.experiences||[]).length ? ex.experiences.map(x=>'<div class="cvp-exp"><div><strong>'+esc(x.title)+'</strong><span>'+esc(x.company)+' • '+esc(x.duration)+'</span></div><button class="cvp-btn" type="button" onclick="window._removeExperience(\''+x.id+'\')">Remove</button></div>').join('') : '<div style="font-size:12px;color:#7a8598;padding:12px 0">No additional experience added yet.</div>';
  const skillList=(ex.skills||[]).length ? ex.skills.map(s=>'<span class="cvp-chip">'+esc(s)+'<button type="button" onclick="window._removeSkill(\''+esc(s).replace(/'/g,"\\'")+'\')">×</button></span>').join('') : '<span style="font-size:12px;color:#7a8598">Add at least 3 skills to improve profile strength.</span>';
  const logs=(ex.activityLog||[]).slice(0,6);
  const logList=logs.length?logs.map(l=>'<div class="cvp-activity">'+esc(l.action)+' <span style="float:right;color:#9aa5b5">'+esc(fmtDate(l.at))+'</span></div>').join(''):'<div class="cvp-activity">Profile workspace ready</div>';
  const preview=p.url
    ? '<img class="cvp-li-logo" src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Linkedin-logo-blue-In-square-40px.png" alt="LinkedIn logo"><div style="min-width:0"><h4>'+esc(p.name||state.cvDraft.name)+'</h4><div class="headline">'+esc(p.headline||state.cvDraft.title)+'</div><div class="meta">'+esc(p.location||state.cvDraft.location)+' • <a href="'+esc(p.url)+'" target="_blank" rel="noopener" style="color:#0a66c2;font-weight:800">'+esc(p.url)+'</a></div><div class="about">'+esc(p.about||state.cvDraft.summary)+'</div></div>'
    : '<img class="cvp-li-logo" src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Linkedin-logo-blue-In-square-40px.png" alt="LinkedIn logo"><div><h4>No LinkedIn profile saved yet</h4><div class="meta">Paste your LinkedIn profile URL below and save or fetch demo profile data.</div></div>';

  return topbarHtml('Portfolio & LinkedIn','',st)
    + cvPortfolioPremiumStyles()
    + '<div class="cvp-root"><div class="cvp-scroll"><div class="cvp-inner">'
    + '<section class="cvp-hero" style="min-height:220px;background:linear-gradient(90deg,rgba(5,20,38,.96),rgba(5,20,38,.80) 54%,rgba(5,20,38,.24)),url(\'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85\') center/cover"><div class="cvp-eyebrow">PROFESSIONAL PROFILE CONNECTOR</div><h1>Portfolio &amp; <span>LinkedIn Visibility</span></h1><p>Strengthen your professional presence with profile positioning, headline optimization, experience, skills and visibility signals, then reuse your strongest content in the ATS CV Maker.</p><div class="cvp-actions"><button class="cvp-btn" type="button" onclick="window._nav(\'cv-maker\')">← Back to Hub</button><button class="cvp-btn primary" type="button" onclick="window._applyLinkedInToCV()">Apply Profile to CV →</button></div></section>'
    + '<section class="cvp-portfolio-grid"><main>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h2>Professional Profile</h2><p>Connect your LinkedIn profile and strengthen employer visibility.</p></div><span class="cvp-pill">'+st+'% STRENGTH</span></div><div class="cvp-body">'
    + '<div class="cvp-profile-line"><div class="cvp-profile-avatar">'+initials+'</div><div class="cvp-profile-copy"><h2>'+esc(p.name||state.cvDraft.name||'Your Name')+'</h2><p>'+esc(p.headline||state.cvDraft.title||'Professional headline')+'</p><p>'+esc(p.location||state.cvDraft.location||'Location')+'</p></div></div>'
    + '<div class="cvp-field" style="margin-top:16px"><label>LINKEDIN PROFILE URL</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="input-linkedin" type="url" value="'+esc(p.url||'')+'" placeholder="https://linkedin.com/in/your-profile" style="flex:1;min-width:250px"><button class="cvp-btn blue" type="button" onclick="window._saveLinkedIn()">Save Profile</button><button class="cvp-btn" type="button" onclick="window._fetchLinkedIn()">Fetch Demo</button></div></div>'
    + '<div id="linkedin-preview" class="cvp-li-preview">'+preview+'</div>'
    + '<div class="cvp-field" style="margin-top:14px"><label>HEADLINE</label><div style="display:flex;gap:8px"><input id="input-linkedin-headline" value="'+esc(p.headline||'')+'" placeholder="Generate or edit your headline"><button class="cvp-btn" type="button" onclick="window._generateHeadline()">Generate</button></div></div>'
    + '<div class="cvp-actions"><button class="cvp-btn green" type="button" onclick="window._applyLinkedInToCV()">Apply to CV →</button><button class="cvp-btn" type="button" onclick="window._copyLinkedInLink()">Copy Link</button></div>'
    + '</div></article>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h3>Experience</h3><p>Add professional roles used in profile-strength scoring.</p></div></div><div class="cvp-body"><div>'+exList+'</div><div class="cvp-form-grid" style="margin-top:12px"><div class="cvp-field"><label>TITLE</label><input id="exp-title" placeholder="Business Analyst"></div><div class="cvp-field"><label>COMPANY</label><input id="exp-company" placeholder="Company"></div><div class="cvp-field cvp-full"><label>DURATION</label><input id="exp-duration" placeholder="1 yr"></div></div><div class="cvp-actions"><button class="cvp-btn blue" type="button" onclick="window._addExperience()">Add Experience</button></div></div></article>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h3>Skills</h3><p>Build a focused skill profile for recruiter discovery.</p></div></div><div class="cvp-body"><div class="cvp-chips">'+skillList+'</div><div class="cvp-field" style="margin-top:14px"><div style="display:flex;gap:8px"><input id="skill-input" placeholder="Add a skill e.g. Stakeholder Mapping"><button class="cvp-btn blue" type="button" onclick="window._addSkill()">Add Skill</button></div></div></div></article>'
    + '</main><aside>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h3>Profile Strength</h3><p>Complete the highest-impact profile signals.</p></div></div><div class="cvp-body"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;margin-bottom:8px"><span>Overall strength</span><span>'+st+'%</span></div><div class="cvp-strength"><span style="width:'+st+'%"></span></div><p style="font-size:11px;color:#697590;line-height:1.5;margin:12px 0 0">Add a profile URL, headline, about content, experience and at least three skills to increase strength.</p></div></article>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h3>Visibility Checklist</h3><p>'+visPct+'% complete</p></div></div><div class="cvp-body cvp-checks"><label class="cvp-check"><input type="checkbox" '+(vis.customUrl?'checked':'')+' onclick="window._toggleVisibility(\'customUrl\')">Custom URL set</label><label class="cvp-check"><input type="checkbox" '+(vis.creatorMode?'checked':'')+' onclick="window._toggleVisibility(\'creatorMode\')">Creator mode on</label><label class="cvp-check"><input type="checkbox" '+(vis.featuredSection?'checked':'')+' onclick="window._toggleVisibility(\'featuredSection\')">Featured section added</label><label class="cvp-check"><input type="checkbox" '+(vis.openToWork?'checked':'')+' onclick="window._toggleVisibility(\'openToWork\')">Open to Work badge</label></div></article>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h3>Share &amp; QR</h3></div></div><div class="cvp-body" style="text-align:center"><div class="cvp-qr"></div><p style="font-size:11px;color:#697590;word-break:break-all">'+esc(p.url||'No LinkedIn link saved')+'</p><button class="cvp-btn" type="button" onclick="window._copyLinkedInLink()">Copy Profile Link</button></div></article>'
    + '<article class="cvp-card"><div class="cvp-head"><div><h3>Activity Log</h3></div></div><div class="cvp-body">'+logList+'</div></article>'
    + '</aside></section></div></div></div>';
}

function viewInterviewPrep(){
  const questionsHtml = MOCK_QUESTIONS_DATA.map(q=>{
    return '<div style="background-color:#161616;border:2px solid #2a2a2a;border-radius:10px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;">'
      + '<div><span style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;margin-bottom:4px;display:block;">'+esc(q.label)+'</span>'
      + '<h3 style="font-size:16px;font-weight:900;color:#ffffff;margin:0 0 8px 0;">'+esc(q.title)+'</h3>'
      + '<p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0 0 16px 0;">'+esc(q.desc)+'</p></div>'
      + '<button onclick="window._reviewMock(\''+q.id+'\')" style="background-color:#262626;color:#ffffff;border:1px solid #404040;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;">Review Question Guide</button></div>';
  }).join('');

  const main = ''
    + '<div style="flex:1;padding:36px 52px;overflow-y:auto;background-color:#121212;">'
    + '<div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:32px;">'
    + '<div style="background:linear-gradient(rgba(24,24,24,0.9), rgba(24,24,24,0.9)), url(\'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80\') center/cover no-repeat;border:2px solid #3a3a3a;border-radius:12px;padding:32px;box-sizing:border-box;">'
    + '<span style="font-size:12px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.8px;">Technical & Behavioral Readiness</span>'
    + '<h1 style="font-size:28px;font-weight:900;color:#ffffff;margin:8px 0 10px 0;">Interview Prep, Assignments & Mock Center</h1>'
    + '<p style="font-size:14px;font-weight:700;color:#c0c0c0;margin:0;line-height:1.6;">Complete document-based interview question assignments, upload your structured answers, review mock interview questions, and book live 1-on-1 sessions with industry mentors.</p></div>'
    + '<div style="background-color:#181818;border:2px solid #3a3a3a;border-radius:12px;padding:32px;display:flex;flex-direction:column;gap:20px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;"><h2 style="font-size:20px;font-weight:900;color:#ffffff;margin:0;">Assignment Interview Questions (Doc Upload)</h2><span style="background-color:#2c1a0e;color:#f59e0b;border:1px solid #d97706;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:900;">Required Task</span></div>'
    + '<p style="font-size:13px;font-weight:700;color:#c0c0c0;margin:0;line-height:1.5;">Download the official technical question document, draft your complete analysis, and upload your answered submission for mentor evaluation. You can also upload structured answers as doc/pdf just like docs.</p>'
    + '<div style="background-color:#161616;border:2px solid #2a2a2a;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;"><span style="font-size:13px;font-weight:800;color:#ffffff;">\uD83D\uDCE5 Question Template: <code style="color:#f59e0b;">BA_SupplyChain_Interview_Prompt.docx</code></span><button onclick="window._downloadPrompt()" style="background-color:#262626;color:#ffffff;border:1px solid #404040;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:800;cursor:pointer;">Download Prompt</button></div>'
    + '<div id="dropZone" ondrop="window._handleDrop(event)" ondragover="event.preventDefault(); this.style.borderColor=\'#f59e0b\'" ondragleave="this.style.borderColor=\'#d97706\'" onclick="document.getElementById(\'fileInput\').click()" style="background-color:#161616;border:2px dashed #d97706;border-radius:10px;padding:24px;text-align:center;cursor:pointer;">'
    + '<span style="font-size:14px;font-weight:900;color:#ffffff;display:block;margin-bottom:4px;">\uD83D\uDCE4 Drag & Drop Your Answered Document Here</span><span style="font-size:12px;font-weight:700;color:#a3a3a3;">Supports .docx, .pdf (Max size: 25MB) — also interview exercise uploads</span>'
    + '<input id="fileInput" type="file" accept=".docx,.pdf,.doc" style="display:none" onchange="window._handleFile(this.files)"><div id="uploadList" style="margin-top:12px;text-align:left;"></div></div>'
    + '</div>'
    + '<div onclick="window._nav(\'resources\')" style="background:linear-gradient(135deg,#1e1a0e 0%, #181818 100%);border:2px solid #d97706;border-radius:12px;padding:28px;cursor:pointer;box-shadow:0 8px 20px rgba(217,119,6,0.12);display:flex;flex-direction:column;gap:16px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:18px;">\u25B6</div><div><h2 style="font-size:20px;font-weight:900;color:#fff;margin:0;">Mock Interview Resources</h2><p style="font-size:12px;font-weight:700;color:#f59e0b;margin:0;">Question Bank • Guides • Videos \u2022 Click to open \u2197</p></div></div><span style="background:#262626;color:#f59e0b;border:1px solid #d97706;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:900;">\u2197 Open Resources</span></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:16px;"><div style="font-size:11px;font-weight:900;color:#f59e0b;margin-bottom:6px;">\uD83D\uDCCB QUESTION BANK</div><div style="font-size:12px;font-weight:800;color:#d4d4d4;line-height:1.4;">120+ curated behavioral & technical questions with STAR guides</div></div>'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:16px;"><div style="font-size:11px;font-weight:900;color:#38bdf8;margin-bottom:6px;">\uD83D\uDCD8 INTERVIEW GUIDE</div><div style="font-size:12px;font-weight:800;color:#d4d4d4;line-height:1.4;">E-books: BA Playbook, Supply Chain Defense, ATS Mastery</div></div>'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:16px;"><div style="font-size:11px;font-weight:900;color:#4ade80;margin-bottom:6px;">\uD83C\uDFA5 VIDEO RESOURCES</div><div style="font-size:12px;font-weight:800;color:#d4d4d4;line-height:1.4;">18 mock videos with mentor commentary & rubrics</div></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;opacity:0.9;"><div style="height:90px;background:linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.5)), url(\'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80\') center/cover no-repeat;border:1px solid #2a2a2a;border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center;"><span style="background:rgba(217,119,6,0.9);border:1px solid #f59e0b;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:900;color:#fff;">\u25B6 E-BOOKS</span></div><div style="height:90px;background:linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.5)), url(\'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80\') center/cover no-repeat;border:1px solid #2a2a2a;border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center;"><span style="background:rgba(0,0,0,0.85);border:1px solid #3a3a3a;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:900;color:#fff;">\u25B6 VIDEOS 18</span></div></div>'
    + '</div></div></div>';

  const right = ''
    + '<div style="width:360px;background-color:#181818;border-left:2px solid #3a3a3a;display:flex;flex-direction:column;justify-content:space-between;overflow-y:auto;flex-shrink:0;">'
    + '<div style="padding:28px;">'
    + '<div style="margin-bottom:24px;border-bottom:2px solid #3a3a3a;padding-bottom:16px;"><span style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.8px;">Live Booking Calendar</span><h3 style="font-size:18px;font-weight:900;color:#ffffff;margin:4px 0 2px 0;">Mock Session Timetable</h3><p style="font-size:12px;font-weight:700;color:#c0c0c0;margin:0;">1-on-1 Mentor Scheduling</p></div>'
    + '<div style="background-color:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:20px;margin-bottom:20px;">'
    + '<span style="font-size:12px;font-weight:900;color:#34d399;display:block;margin-bottom:6px;">Available Mentor Slot</span><h4 style="font-size:15px;font-weight:900;color:#ffffff;margin:0 0 4px 0;">Dr. O. Emeka (Lead Mentor)</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0 0 16px 0;">Monday, Aug 31, 2026 \u2022 14:00 WAT</p>'
    + '<button onclick="window._bookSlot(\'Dr. O. Emeka\')" style="width:100%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#ffffff;border:1px solid #f59e0b;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3);">Book Live Mock Session</button></div>'
    + '<div style="background-color:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:20px;margin-bottom:20px;">'
    + '<span style="font-size:12px;font-weight:900;color:#38bdf8;display:block;margin-bottom:6px;">Career Coaching Slot</span><h4 style="font-size:15px;font-weight:900;color:#ffffff;margin:0 0 4px 0;">Sarah Jenkins</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0 0 16px 0;">Tuesday, Sep 1 \u2022 11:00 WAT</p>'
    + '<button onclick="window._bookSlot(\'Sarah Jenkins\')" style="width:100%;background:#262626;color:#ffffff;border:1px solid #404040;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;">Book Slot</button></div>'
    + '<div style="display:flex;flex-direction:column;gap:12px;font-size:13px;font-weight:700;color:#d4d4d4;margin-bottom:32px;">'
    + '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox" checked style="accent-color:#16a34a;width:16px;height:16px;"> Review Interview Prompt Doc</label>'
    + '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input id="chk-upload" type="checkbox" '+(state.uploads.length?'checked':'')+' style="accent-color:#16a34a;width:16px;height:16px;"> Upload Answered Assignment</label>'
    + '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox" '+(state.interviewBookings.length?'checked':'')+' style="accent-color:'+(state.interviewBookings.length?'#16a34a':'#d97706')+';width:16px;height:16px;"> Book Live Mock Session</label>'
    + '</div></div>'
    + '<div style="padding:24px;background-color:#161616;border-top:2px solid #3a3a3a;">'
    + '<button onclick="window._nav(\'overview\')" style="width:100%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#ffffff;border:1px solid #f59e0b;padding:14px;border-radius:8px;font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(217, 119, 6, 0.4);">'
    + '<span>Return to Mission Control</span><svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg></button></div></div>';

  return topbarHtml('ZEELIN JOB ACQUISITION PORTAL \u2022 Interview Prep & Mock Center', '<span>Live Timetable: <strong style="color:#34d399;">Booking Open</strong></span><span style="color:#f59e0b;font-weight:800;">Mock & Assignments</span>', 75)
    + '<div class="jb-split" style="flex:1;display:flex;overflow:hidden;min-height:0;">'+main+right+'</div>';
}

function viewEventsHub(){
  const cardsHtml = EVENTS_HUB_CARDS.map(c=>{
    return '<div style="background-color:#181818;border:2px solid #3a3a3a;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box;">'
      + '<div style="height:160px;background:url(\''+c.img+'\') center/cover no-repeat;border-bottom:2px solid #3a3a3a;position:relative;">'
      + '<div style="position:absolute;top:14px;left:14px;background-color:rgba(0,0,0,0.85);border:1px solid '+c.badgeBorder+';padding:6px 12px;border-radius:6px;font-size:12px;font-weight:900;color:'+c.badgeColor+';">'+esc(c.badge)+'</div></div>'
      + '<div style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;flex:1;">'
      + '<div><h3 style="font-size:18px;font-weight:900;color:#ffffff;margin:0 0 8px 0;">'+esc(c.title)+'</h3><p style="font-size:13px;font-weight:700;color:#a3a3a3;line-height:1.6;margin:0 0 24px 0;">'+esc(c.desc)+'</p></div>'
      + '<button onclick="window._nav(\''+c.route+'\')" style="width:100%;background:'+c.btnBg+';color:#ffffff;border:1px solid '+c.btnBorder+';padding:12px;border-radius:8px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.3);">'+esc(c.btnText)+'</button></div></div>';
  }).join('');

  const main = ''
    + '<div style="flex:1;padding:36px 52px;overflow-y:auto;background-color:#121212;">'
    + '<div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:32px;">'
    + '<div style="background:linear-gradient(rgba(24,24,24,0.85), rgba(24,24,24,0.85)), url(\'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1400&q=80\') center/cover no-repeat;border:2px solid #3a3a3a;border-radius:16px;padding:40px 48px;box-sizing:border-box;">'
    + '<span style="font-size:12px;font-weight:900;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">Master Schedule Architecture</span><h1 style="font-size:32px;font-weight:900;color:#ffffff;margin:8px 0 12px 0;letter-spacing:-0.5px;">Events & Sessions Hub</h1><p style="font-size:14px;font-weight:700;color:#d4d4d4;margin:0;line-height:1.6;max-width:700px;">Seamlessly access your synchronized calendar events, tune into live workshops, and browse the comprehensive video recording archives.</p></div>'
    + '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;">'+cardsHtml+'</div>'
    + '</div></div>';

  const right = ''
    + '<div style="width:360px;background-color:#181818;border-left:2px solid #3a3a3a;display:flex;flex-direction:column;justify-content:space-between;overflow-y:auto;flex-shrink:0;">'
    + '<div style="padding:28px;">'
    + '<div style="margin-bottom:24px;border-bottom:2px solid #3a3a3a;padding-bottom:16px;">'
    + '<span style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.8px;">Quick Actions</span><h3 style="font-size:18px;font-weight:900;color:#ffffff;margin:4px 0 2px 0;">Session Navigation</h3><p style="font-size:12px;font-weight:700;color:#c0c0c0;margin:0;">Jump to live sessions</p></div>'
    + '<div style="background-color:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:20px;margin-bottom:24px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><span style="font-size:13px;font-weight:900;color:#34d399;">LIVE NOW</span><span style="font-size:11px;font-weight:800;color:#a3a3a3;">14:00 WAT</span></div>'
    + '<h4 style="font-size:15px;font-weight:900;color:#ffffff;margin:0 0 2px 0;">Supply Chain Q&A Walkthrough</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0 0 12px 0;">Dr. O. Emeka</p>'
    + '<button onclick="window._nav(\'live-sessions\')" style="width:100%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#ffffff;border:1px solid #f59e0b;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3);">Join Live Room</button></div>'
    + '<div style="background-color:#161616;border:2px solid #2a2a2a;border-radius:10px;padding:16px;margin-bottom:16px;"><span style="font-size:11px;font-weight:900;color:#38bdf8;display:block;margin-bottom:4px;">Tomorrow</span><h4 style="font-size:15px;font-weight:900;color:#ffffff;margin:0 0 2px 0;">Behavioral Mock Interview Masterclass</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0 0 12px 0;">Sarah Jenkins \u2022 10:00 WAT</p><button onclick="window._reserveSeat()" style="width:100%;background-color:#262626;color:#ffffff;border:1px solid #404040;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;">Reserve Seat</button></div>'
    + '<div style="background-color:#161616;border:2px solid #2a2a2a;border-radius:10px;padding:16px;margin-bottom:16px;"><span style="font-size:11px;font-weight:900;color:#f59e0b;display:block;margin-bottom:4px;">This Week</span><h4 style="font-size:15px;font-weight:900;color:#ffffff;margin:0 0 2px 0;">Technical Review: Project Vault</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0 0 12px 0;">Lead Mentor \u2022 Wed, Sep 2 \u2022 15:00 WAT</p><button onclick="window._nav(\'calendar\')" style="width:100%;background-color:#262626;color:#ffffff;border:1px solid #404040;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;">Add to Calendar</button></div>'
    + '</div>'
    + '<div style="padding:24px;background-color:#161616;border-top:2px solid #3a3a3a;">'
    + '<button onclick="window._nav(\'calendar\')" style="width:100%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#ffffff;border:1px solid #f59e0b;padding:14px;border-radius:8px;font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(217, 119, 6, 0.4);"><span>View Full Calendar & Bookings</span><svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg></button></div></div>';

  return topbarHtml('Work Experience Portal \u2022 Events & Sessions Hub', '', 60)
    + '<div class="jb-split" style="flex:1;display:flex;overflow:hidden;min-height:0;">'+main+right+'</div>';
}

function bookingHistoryHtml(){
  const bookings = (state.interviewBookings||[]).slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
  if(!bookings.length) return '<div style="background:#161616;border:2px dashed #3a3a3a;border-radius:10px;padding:16px;text-align:center;margin-top:4px;"><div style="font-size:11px;font-weight:800;color:#737373;letter-spacing:0.6px;margin-bottom:6px;">INTERVIEW BOOKING HISTORY</div><div style="font-size:12px;font-weight:700;color:#52525b;">No bookings yet — confirm a live mock above to create your first record.</div></div>';
  const now = new Date(); now.setHours(0,0,0,0);
  const upcoming = bookings.filter(b=> new Date(b.date) >= now);
  const past = bookings.filter(b=> new Date(b.date) < now);
  function statusBadge(b){
    const s = (b.status||'pending').toLowerCase();
    if(s==='accepted') return '<span style="font-size:10px;font-weight:900;color:#4ade80;background:#064e3b;border:1px solid #10b981;padding:3px 8px;border-radius:999px;">● ACCEPTED</span>';
    if(s==='denied') return '<span style="font-size:10px;font-weight:900;color:#f87171;background:#450a0a;border:1px solid #ef4444;padding:3px 8px;border-radius:999px;">● DENIED</span>';
    if(s==='evidence_invalid' || s==='invalid') return '<span style="font-size:10px;font-weight:900;color:#fbbf24;background:#422006;border:1px solid #d97706;padding:3px 8px;border-radius:999px;">● EVIDENCE INVALID</span>';
    return '<span style="font-size:10px;font-weight:900;color:#f59e0b;background:#422006;border:1px solid #d97706;padding:3px 8px;border-radius:999px;">● PENDING</span>';
  }
  function row(b){
    const d = new Date(b.date);
    const dateStr = isNaN(d) ? esc(b.date) : d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) + ' • ' + String(b.date).split('T')[1]?.slice(0,5) + ' WAT';
    const anon = b.anon ? '<span style="font-size:10px;color:#f59e0b;">• Anonymous</span>' : '';
    const ev = b.evidenceName ? '<div style="font-size:11px;color:#a3a3a3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📎 '+esc(b.evidenceName)+ (b.evidenceLink ? ' • <a href="'+esc(b.evidenceLink)+'" target="_blank" style="color:#38bdf8;text-decoration:underline;">view</a>' : '') +'</div>' : '<div style="font-size:11px;color:#52525b;">No evidence file</div>';
    const isPast = new Date(b.date) < now;
    return '<div style="background:#1f1f1f;border:1px solid #2a2a2a;border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">'+statusBadge(b)+'<span style="font-size:10px;font-weight:700;color:#737373;">'+(isPast?'PAST':'UPCOMING')+'</span></div>'
      + '<div style="font-size:12px;font-weight:800;color:#fff;">'+esc(b.mentor||'Dr. O. Emeka')+' • '+dateStr+' '+anon+'</div>'
      + ev
      + '<div style="display:flex;gap:6px;"><button onclick="window._updateBookingStatus(\''+b.id+'\',\'accepted\')" style="flex:1;background:#064e3b;color:#4ade80;border:1px solid #10b981;padding:6px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;">Accept</button><button onclick="window._updateBookingStatus(\''+b.id+'\',\'denied\')" style="flex:1;background:#450a0a;color:#f87171;border:1px solid #ef4444;padding:6px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;">Deny</button><button onclick="window._updateBookingStatus(\''+b.id+'\',\'evidence_invalid\')" style="flex:1;background:#422006;color:#fbbf24;border:1px solid #d97706;padding:6px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;">Invalid</button></div>'
      + '</div>';
  }
  const upcomingHtml = upcoming.length ? upcoming.map(row).join('') : '<div style="font-size:11px;color:#52525b;padding:8px;text-align:center;">No upcoming bookings</div>';
  const pastHtml = past.length ? past.map(row).join('') : '<div style="font-size:11px;color:#52525b;padding:8px;text-align:center;">No past bookings</div>';
  return '<div style="background:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:12px;margin-top:4px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;font-weight:800;color:#f59e0b;letter-spacing:0.6px;">INTERVIEW BOOKING HISTORY</span><span style="font-size:10px;color:#737373;">'+bookings.length+' total</span></div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;"><div style="font-size:11px;font-weight:800;color:#38bdf8;">UPCOMING ('+upcoming.length+')</div>'+upcomingHtml+'</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;"><div style="font-size:11px;font-weight:800;color:#a3a3a3;">PAST ('+past.length+')</div>'+pastHtml+'</div>'
    + '</div>';
}
let _pendingBooking = null;
function openEvidenceDialog(date,time,anon){
  _pendingBooking = {date,time,anon};
  const ex = document.getElementById('evidence-dialog');
  if(ex) ex.remove();
  const overlay = document.createElement('div');
  overlay.id='evidence-dialog';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';
  overlay.innerHTML = '<div style="background:#181818;border:2px solid #3a3a3a;border-radius:12px;width:100%;max-width:520px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);">'
    + '<div style="padding:18px 20px;border-bottom:2px solid #3a3a3a;"><h3 style="font-size:16px;font-weight:900;color:#fff;margin:0;">Upload Interview Evidence</h3><p style="font-size:12px;color:#a3a3a3;margin:6px 0 0 0;">Live mock booking: <b style="color:#fff;">'+esc(date)+' '+esc(time)+' WAT</b>'+(anon?' • Anonymous':'')+'</p></div>'
    + '<div style="padding:18px 20px;display:flex;flex-direction:column;gap:12px;">'
    + '<label style="font-size:11px;font-weight:800;color:#d4d4d4;">Evidence File (PDF, DOCX, PNG, MP4)</label><input id="ev-file" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov" style="background:#0a0a0a;border:2px solid #3a3a3a;border-radius:6px;padding:8px;color:#fff;font-size:12px;width:100%;">'
    + '<label style="font-size:11px;font-weight:800;color:#d4d4d4;">Or Evidence Link (Drive, Loom, etc.)</label><input id="ev-link" type="url" placeholder="https://..." style="background:#0a0a0a;border:2px solid #3a3a3a;border-radius:6px;padding:8px;color:#fff;font-size:12px;width:100%;">'
    + '<label style="font-size:11px;font-weight:800;color:#d4d4d4;">Notes (optional)</label><textarea id="ev-notes" rows="2" placeholder="Interview summary, STAR notes..." style="background:#0a0a0a;border:2px solid #3a3a3a;border-radius:6px;padding:8px;color:#fff;font-size:12px;width:100%;resize:vertical;"></textarea>'
    + '<div id="ev-error" style="display:none;background:#450a0a;border:1px solid #ef4444;border-radius:6px;padding:8px;font-size:11px;font-weight:700;color:#fca5a5;"></div>'
    + '</div>'
    + '<div style="padding:14px 20px;background:#161616;border-top:2px solid #3a3a3a;display:flex;gap:10px;justify-content:flex-end;">'
    + '<button onclick="document.getElementById(\'evidence-dialog\').remove();_pendingBooking=null;" style="background:#262626;color:#a3a3a3;border:1px solid #404040;padding:10px 16px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;">Cancel</button>'
    + '<button onclick="window._submitEvidence()" style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);color:#fff;border:1px solid #16a34a;padding:10px 18px;border-radius:6px;font-size:12px;font-weight:900;cursor:pointer;">Submit Evidence & Confirm Booking</button>'
    + '</div></div>';
  overlay.addEventListener('click',e=>{ if(e.target===overlay){ overlay.remove(); _pendingBooking=null; } });
  document.body.appendChild(overlay);
}
window._submitEvidence = function(){
  const fileEl=document.getElementById('ev-file');
  const linkEl=document.getElementById('ev-link');
  const notesEl=document.getElementById('ev-notes');
  const errEl=document.getElementById('ev-error');
  const file = fileEl && fileEl.files && fileEl.files[0];
  const link = linkEl ? linkEl.value.trim() : '';
  const notes = notesEl ? notesEl.value.trim() : '';
  if(!file && !link){
    errEl.style.display='block'; errEl.textContent='Upload a file or paste a link as evidence of interview.';
    return;
  }
  const allowed = ['pdf','doc','docx','png','jpg','jpeg','mp4','mov'];
  let evidenceName = file ? file.name : (link ? link.split('/').pop().slice(0,40) || 'link-evidence' : '');
  let ext = evidenceName.split('.').pop().toLowerCase();
  let status = 'pending';
  if(file && allowed.indexOf(ext)===-1) status='evidence_invalid';
  if(link && !/^https?:\/\//.test(link)) status='evidence_invalid';
  if(!file && link && link.length<8) status='evidence_invalid';
  const booking = {
    id: 'bk_'+Date.now()+Math.random().toString(36).slice(2,6),
    mentor:'Dr. O. Emeka',
    date: (_pendingBooking ? _pendingBooking.date+'T'+_pendingBooking.time : new Date().toISOString()),
    anon: _pendingBooking ? _pendingBooking.anon : false,
    type:'live-mock',
    evidenceName: evidenceName,
    evidenceLink: link,
    evidenceNotes: notes,
    status: status,
    createdAt: new Date().toISOString()
  };
  state.interviewBookings.push(booking);
  saveState();
  const dlg=document.getElementById('evidence-dialog'); if(dlg) dlg.remove(); _pendingBooking=null;
  if(status==='evidence_invalid') showToast('Booking saved — evidence marked INVALID. Please re-upload a valid PDF/DOCX or link.');
  else showToast('Live mock booked & evidence submitted — '+esc(booking.evidenceName)+' — status: '+status.toUpperCase());
  render(state.activeView);
};
window._updateBookingStatus = function(id, newStatus){
  const b = (state.interviewBookings||[]).find(x=>x.id===id);
  if(!b) return;
  b.status = newStatus;
  saveState();
  showToast('Booking '+esc(b.evidenceName||b.date)+' → '+newStatus.toUpperCase());
  render(state.activeView);
};
function viewCalendar(){
  const d = CALENDAR_DATA;
  const daysHead = d.days.map(x=>'<span>'+x+'</span>').join('');
  const cells = d.cells.map(c=>{
    if(c.muted) return '<div style="padding:12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:8px;color:#525252;">'+c.d+'</div>';
    if(c.highlight) return '<div style="padding:12px;background-color:#2c1a0e;border:2px solid #d97706;border-radius:8px;color:#f59e0b;font-weight:900;">'+c.d+'</div>';
    return '<div style="padding:12px;background-color:#161616;border:1px solid #3a3a3a;border-radius:8px;">'+c.d+'</div>';
  }).join('');
  const upcoming = d.upcoming.map(u=>{
    const btn = u.actionStyle==='primary'
      ? '<button onclick="window._joinLive()" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#ffffff;border:1px solid #f59e0b;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3);">'+u.action+'</button>'
      : '<button onclick="window._reserveSeat()" style="background-color:#262626;color:#ffffff;border:2px solid #404040;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;">'+u.action+'</button>';
    return '<div style="background-color:#161616;border:2px solid #2a2a2a;border-radius:10px;padding:20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">'
      + '<div><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;"><span style="font-size:11px;font-weight:900;color:'+u.badgeColor+';background-color:'+u.badgeBg+';border:1px solid '+u.badgeBorder+';padding:2px 8px;border-radius:4px;">'+u.badge+'</span><span style="font-size:12px;font-weight:800;color:#a3a3a3;">'+u.time+'</span></div>'
      + '<h4 style="font-size:17px;font-weight:900;color:#ffffff;margin:0 0 4px 0;">'+esc(u.title)+'</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0;">Lead Mentor: '+esc(u.mentor)+'</p></div>'+btn+'</div>';
  }).join('');
  const previous = d.previous.map(p=>{
    return '<div style="background-color:#161616;border:2px solid #2a2a2a;border-radius:10px;padding:20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">'
      + '<div><span style="font-size:11px;font-weight:800;color:#a3a3a3;text-transform:uppercase;margin-bottom:4px;display:block;">'+esc(p.date)+'</span><h4 style="font-size:16px;font-weight:900;color:#ffffff;margin:0 0 4px 0;">'+esc(p.title)+'</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0;">'+esc(p.duration)+'</p></div>'
      + '<button onclick="window._watchRecording()" style="background-color:#16a34a;color:#ffffff;border:1px solid #22c55e;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;">Watch Recording</button></div>';
  }).join('');
  const mentors = d.mentors.map(m=>{
    const btn = m.btnPrimary
      ? '<button onclick="window._bookSlot(\''+esc(m.name)+'\')" style="width:100%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#ffffff;border:1px solid #f59e0b;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3);">Book Slot Now</button>'
      : '<button onclick="window._bookSlot(\''+esc(m.name)+'\')" style="width:100%;background-color:#262626;color:#ffffff;border:1px solid #404040;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;">Book Slot Now</button>';
    return '<div style="background-color:#161616;border:2px solid #2a2a2a;border-radius:10px;padding:16px;">'
      + '<span style="font-size:11px;font-weight:900;color:'+m.labelColor+';display:block;margin-bottom:4px;">'+esc(m.label)+'</span><h4 style="font-size:15px;font-weight:900;color:#ffffff;margin:0 0 2px 0;">'+esc(m.name)+'</h4><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0 0 12px 0;">'+esc(m.date)+'</p>'+btn+'</div>';
  }).join('');

  const interviewVideos = [
    {id:'iv1', title:'STAR Behavioral Interview Mastery', duration:'24:18', thumb:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80', badge:'Video Resource', badgeColor:'#38bdf8', badgeBg:'#1e293b', badgeBorder:'#3b82f6'},
    {id:'iv2', title:'Supply Chain Case Defense — Live Mock Review', duration:'31:42', thumb:'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80', badge:'Live Mock', badgeColor:'#f59e0b', badgeBg:'#2c1a0e', badgeBorder:'#d97706'},
    {id:'iv3', title:'MoSCoW Prioritization Walkthrough', duration:'18:05', thumb:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', badge:'E-Book Linked', badgeColor:'#4ade80', badgeBg:'#064e3b', badgeBorder:'#10b981'}
  ];
  const interviewVideosHtml = interviewVideos.map(v=>{
    return '<div onclick="window._nav(\'resources\')" style="background:#161616;border:2px solid #2a2a2a;border-radius:10px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;">'
      + '<div style="height:140px;background:linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.4)), url(\''+v.thumb+'\') center/cover no-repeat;position:relative;display:flex;align-items:center;justify-content:center;">'
      + '<div style="width:44px;height:44px;background:rgba(217,119,6,0.9);border:2px solid #f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:900;box-shadow:0 4px 12px rgba(0,0,0,0.4);">\u25B6</div>'
      + '<div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.85);border:1px solid '+v.badgeBorder+';padding:3px 8px;border-radius:4px;font-size:10px;font-weight:900;color:'+v.badgeColor+';">'+v.badge+'</div>'
      + '<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.85);padding:3px 8px;border-radius:4px;font-size:11px;font-weight:800;color:#fff;">'+v.duration+'</div></div>'
      + '<div style="padding:14px;"><h4 style="font-size:14px;font-weight:900;color:#fff;margin:0 0 4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(v.title)+'</h4><p style="font-size:11px;font-weight:700;color:#a3a3a3;margin:0;">Interview • Click to open resources</p></div></div>';
  }).join('');

  const main = ''
    + '<div style="flex:1;padding:36px 52px;overflow-y:auto;background:#121212;">'
    + '<div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:32px;">'
    + '<div style="background:linear-gradient(rgba(24,24,24,0.85), rgba(24,24,24,0.85)), url(\'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1400&q=80\') center/cover no-repeat;border:2px solid #3a3a3a;border-radius:16px;padding:40px 48px;box-sizing:border-box;">'
    + '<span style="font-size:12px;font-weight:900;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">Master Schedule Suite</span><h1 style="font-size:32px;font-weight:900;color:#fff;margin:8px 0 12px 0;letter-spacing:-0.5px;">Calendar, Live Sessions & Mentor Slots</h1><p style="font-size:14px;font-weight:700;color:#d4d4d4;margin:0;line-height:1.6;max-width:700px;">Interactive demo calendar — click days, join live rooms, review recordings, and book live mock interviews with calendar time & anonymous option.</p></div>'
    + '<div style="background:#181818;border:2px solid #3a3a3a;border-radius:14px;padding:32px;box-sizing:border-box;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:12px;flex-wrap:wrap;"><h3 style="font-size:20px;font-weight:900;color:#fff;margin:0;">'+esc(d.monthLabel)+'</h3><div style="display:flex;gap:8px;"><button onclick="showToast(\'Previous month — demo\')" style="background:#262626;color:#fff;border:1px solid #404040;padding:6px 12px;border-radius:6px;font-weight:900;cursor:pointer;">&lt;</button><button onclick="showToast(\'Next month — demo\')" style="background:#262626;color:#fff;border:1px solid #404040;padding:6px 12px;border-radius:6px;font-weight:900;cursor:pointer;">&gt;</button></div></div><div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:8px;text-align:center;font-size:12px;font-weight:900;color:#a3a3a3;margin-bottom:12px;">'+daysHead+'</div><div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:8px;text-align:center;font-size:14px;font-weight:800;color:#d4d4d4;">'+cells+'</div><p style="font-size:11px;font-weight:700;color:#737373;margin:12px 0 0 0;">\u2022 Demo: click any highlighted day (28) for schedule details</p></div>'
    + '<div style="background:#181818;border:2px solid #3a3a3a;border-radius:14px;padding:32px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px;"><h3 style="font-size:20px;font-weight:900;color:#fff;margin:0;">Upcoming Live Sessions</h3>'+upcoming+'</div>'
    + '<div style="background:#181818;border:2px solid #3a3a3a;border-radius:14px;padding:32px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px;"><h3 style="font-size:20px;font-weight:900;color:#fff;margin:0;">Previous Live Sessions (Recordings)</h3>'+previous+'</div>'
    + '<div style="background:#181818;border:2px solid #3a3a3a;border-radius:14px;padding:32px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px;"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;"><h3 style="font-size:20px;font-weight:900;color:#fff;margin:0;">Interview Videos</h3><button onclick="window._nav(\'resources\')" style="background:#262626;color:#f59e0b;border:1px solid #d97706;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;">View All Resources \u2197</button></div><div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;">'+interviewVideosHtml+'</div><p style="font-size:12px;font-weight:700;color:#a3a3a3;margin:0;">Videos linked to Mock Interview Resources \u2192 Question Bank, Guides & E-books.</p></div>'
    + '</div></div>';

  const right = ''
    + '<div style="width:360px;background:#181818;border-left:2px solid #3a3a3a;display:flex;flex-direction:column;justify-content:space-between;overflow-y:auto;flex-shrink:0;">'
    + '<div style="padding:28px;display:flex;flex-direction:column;gap:24px;">'
    + '<div style="margin-bottom:4px;border-bottom:2px solid #3a3a3a;padding-bottom:16px;"><span style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.8px;">Resources Hub</span><h3 style="font-size:18px;font-weight:900;color:#fff;margin:4px 0 2px 0;">Mock Interview Resources</h3><p style="font-size:12px;font-weight:700;color:#c0c0c0;margin:0;">Question Bank • E-books • Videos</p></div>'
    + '<div onclick="window._nav(\'resources\')" style="background:linear-gradient(135deg,#1e1a0e 0%, #181818 100%);border:2px solid #d97706;border-radius:12px;padding:20px;cursor:pointer;box-shadow:0 8px 20px rgba(217,119,6,0.15);">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><div style="width:36px;height:36px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;">\u25B6</div><div><div style="font-size:14px;font-weight:900;color:#fff;">Open Resources Library</div><div style="font-size:11px;font-weight:700;color:#f59e0b;">\u2197 Click to view sub-sections</div></div></div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:12px;font-weight:800;color:#d4d4d4;">\uD83D\uDCCB QUESTION BANK</span><span style="font-size:10px;font-weight:900;color:#38bdf8;background:#1e293b;border:1px solid #3b82f6;padding:2px 6px;border-radius:4px;">120+ Q</span></div>'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:12px;font-weight:800;color:#d4d4d4;">\uD83D\uDCD8 INTERVIEW GUIDE</span><span style="font-size:10px;font-weight:900;color:#f59e0b;background:#2c1a0e;border:1px solid #d97706;padding:2px 6px;border-radius:4px;">E-BOOKS</span></div>'
    + '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:12px;font-weight:800;color:#d4d4d4;">\uD83C\uDFA5 VIDEO RESOURCES</span><span style="font-size:10px;font-weight:900;color:#4ade80;background:#064e3b;border:1px solid #10b981;padding:2px 6px;border-radius:4px;">18 Videos</span></div>'
    + '</div>'
    + '<button onclick="window._nav(\'resources\')" style="width:100%;background:#262626;color:#f59e0b;border:1px solid #d97706;padding:10px;border-radius:6px;font-size:13px;font-weight:900;cursor:pointer;">Browse All Resources</button>'
    + '</div>'
    + '<div style="background:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:20px;">'
    + '<span style="font-size:11px;font-weight:900;color:#34d399;display:block;margin-bottom:6px;">\u25CF LIVE MOCK ONLY</span><h4 style="font-size:15px;font-weight:900;color:#fff;margin:0 0 2px 0;">Dr. O. Emeka (Lead Mentor)</h4><p style="font-size:11px;font-weight:700;color:#a3a3a3;margin:0 0 4px 0;">Lead Mentor • Live Mock Interview</p>'
    + '<div style="background:#1f1f1f;border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:12px 0;display:flex;flex-direction:column;gap:10px;">'
    + '<label style="font-size:11px;font-weight:800;color:#d4d4d4;">Select Date</label><input id="cal-date" type="date" value="2026-08-31" style="background:#0a0a0a;border:2px solid #3a3a3a;border-radius:6px;padding:8px;color:#fff;font-size:13px;font-weight:700;outline:none;">'
    + '<label style="font-size:11px;font-weight:800;color:#d4d4d4;">Select Time (WAT)</label><select id="cal-time" style="background:#0a0a0a;border:2px solid #3a3a3a;border-radius:6px;padding:8px;color:#fff;font-size:13px;font-weight:700;outline:none;"><option value="09:00">09:00 WAT</option><option value="10:00">10:00 WAT</option><option value="11:00">11:00 WAT</option><option value="14:00" selected>14:00 WAT</option><option value="15:00">15:00 WAT</option><option value="16:00">16:00 WAT</option></select>'
    + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#262626;border:1px solid #3a3a3a;border-radius:6px;padding:8px;"><input id="cal-anon" type="checkbox" style="accent-color:#f59e0b;width:16px;height:16px;"><span style="font-size:12px;font-weight:800;color:#d4d4d4;">Book as <span style="color:#f59e0b;">Anonymous</span></span><span style="font-size:10px;color:#a3a3a3;">hide name in calendar</span></label>'
    + '</div>'
    + '<button onclick="window._bookSlotAdvanced()" style="width:100%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#fff;border:1px solid #f59e0b;padding:12px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3);">Confirm Live Mock Booking</button>'
    + '<p style="font-size:11px;font-weight:700;color:#737373;margin:8px 0 0 0;text-align:center;">Only for live mock • Calendar invite sent</p>'
    + '</div>'
    + bookingHistoryHtml()
    + '</div>'
    + '<div style="padding:24px;background:#161616;border-top:2px solid #3a3a3a;">'
    + '<button onclick="window._nav(\'resources\')" style="width:100%;background:#262626;color:#d4d4d4;border:1px solid #404040;padding:12px;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><span>\uD83D\uDCCB</span> Go to Mock Resources <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg></button>'
    + '</div></div>';

  return topbarHtml('Work Experience Portal \u2022 Calendar & Live Sessions Hub', '<span style="color:#a3a3a3;">Interactive Demo</span>', 55)
    + '<div class="jb-split" style="flex:1;display:flex;overflow:hidden;min-height:0;">'+main+right+'</div>';
}

function viewResources(){
  const questions=[
    {q:'Explain how you resolved a stakeholder conflict between inventory and finance teams.',tag:'Behavioral',diff:'Medium',tone:'gold'},
    {q:'Walk us through your inventory carrying-cost formula and absolute-cell locking strategy.',tag:'Technical',diff:'Hard',tone:'green'},
    {q:'Describe a time a Business Requirements Specification missed an important requirement. How did you recover?',tag:'BRS',diff:'Medium',tone:'purple'},
    {q:'How would you defend your MoSCoW prioritization when a sponsor adds scope mid-sprint?',tag:'Agile',diff:'Hard',tone:'gold'},
    {q:'How do you handle #DIV/0! and #REF! errors in a client-facing financial model?',tag:'Excel',diff:'Easy',tone:'green'},
    {q:'Give us a 90-second “Tell me about yourself” answer that connects your verified experience to this role.',tag:'Career',diff:'Core',tone:'purple'}
  ];
  const books=[
    {title:'Interview Question Guide — Business Analyst Edition',desc:'STAR method, stakeholder mapping, BRS walkthroughs, MoSCoW prioritization, and Excel audit checklists.',pages:'72 PAGES',meta:'PDF • 8.2 MB',img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'},
    {title:'Supply Chain Mock Interview Playbook',desc:'Case-based Q&A, inventory-model defense prompts, carrying-cost calculations and mentor walkthroughs.',pages:'48 PAGES',meta:'PDF • 5.6 MB',img:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'},
    {title:'ATS & Behavioral Interview E-book',desc:'Resume-to-interview linking, STAR examples, recruiter expectations and 30 sample mentor-reviewed answers.',pages:'56 PAGES',meta:'PDF • 6.4 MB',img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'}
  ];
  const videos=[
    {title:'STAR Method: Answer Like a Pro — Full Mock',desc:'Behavioral interview structure with response breakdowns.',dur:'22:14',img:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'},
    {title:'Live Mock Interview: Supply Chain Defense',desc:'Dr. O. Emeka reviews technical reasoning and model defense.',dur:'34:20',img:'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80'},
    {title:'MoSCoW & Stakeholder Elicitation — Office Hours',desc:'Practical techniques for requirements prioritization and interview defense.',dur:'18:45',img:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'}
  ];

  const questionHtml=questions.map((x,i)=>{
    const cls=x.tone==='green'?' green':x.tone==='purple'?' purple':'';
    return '<article class="rs-question rs-search-item" data-search="'+esc((x.q+' '+x.tag+' '+x.diff).toLowerCase())+'">'
      + '<div class="rs-q-num">Q'+(i+1)+'</div><div class="rs-q-copy"><div class="rs-q-meta"><span class="rs-tag'+cls+'">'+esc(x.tag)+'</span><span class="rs-tag blue">'+esc(x.diff)+'</span></div>'
      + '<h3>'+esc(x.q)+'</h3><div class="rs-actions" style="margin-top:12px"><button class="rs-btn" type="button" onclick="showToast(&quot;Answer guide opened — demo&quot;)">View Answer Guide</button></div></div></article>';
  }).join('');

  const bookHtml=books.map(b=>
    '<article class="rs-resource-card rs-search-item" data-search="'+esc((b.title+' '+b.desc).toLowerCase())+'">'
      + '<div class="rs-resource-img" style="background-image:url(&quot;'+b.img+'&quot;)"><span class="rs-resource-type">E-BOOK • '+b.pages+'</span></div>'
      + '<div class="rs-resource-body"><h3>'+esc(b.title)+'</h3><p>'+esc(b.desc)+'</p><div class="rs-resource-foot"><span class="rs-resource-meta">'+esc(b.meta)+'</span>'
      + '<button class="rs-btn primary" type="button" onclick="showToast(&quot;E-book download started — demo&quot;)">Download</button></div></div></article>'
  ).join('');

  const videoHtml=videos.map(v=>
    '<article class="rs-video-card rs-search-item" data-search="'+esc((v.title+' '+v.desc).toLowerCase())+'" onclick="showToast(&quot;Video playback opened — demo&quot;)">'
      + '<div class="rs-video-thumb" style="background-image:url(&quot;'+v.img+'&quot;)"><div class="rs-play">▶</div><span class="rs-duration">'+v.dur+'</span></div>'
      + '<div class="rs-video-body"><h3>'+esc(v.title)+'</h3><p>'+esc(v.desc)+'</p></div></article>'
  ).join('');

  const css='<style>'
    + '.resources-premium,.resources-premium *{box-sizing:border-box}.resources-premium{--rs-ink:#07143a;--rs-muted:#697590;--rs-line:#e1e8ef;--rs-gold:#d79a0b;--rs-gold2:#f2c14e;--rs-blue:#0a66c2;--rs-green:#0a9b70;display:flex;flex:1;min-height:0;background:#fff;color:var(--rs-ink);font-family:Inter,"Segoe UI",Arial,sans-serif}.resources-premium button,.resources-premium input{font:inherit}.resources-premium a{text-decoration:none;color:inherit}'
    + '.rs-main{flex:1;min-width:0;overflow-y:auto;background:#fff;padding:22px;scrollbar-width:thin;scrollbar-color:#d9e2ec #fff}.rs-main::-webkit-scrollbar{width:7px}.rs-main::-webkit-scrollbar-track{background:#fff}.rs-main::-webkit-scrollbar-thumb{background:#d9e2ec;border-radius:999px}.rs-inner{max-width:1180px;margin:0 auto}'
    + '.rs-hero{min-height:260px;border-radius:18px;padding:34px 36px;color:#fff;background:linear-gradient(90deg,rgba(5,20,38,.97),rgba(5,20,38,.85) 52%,rgba(5,20,38,.24)),url("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=85") center/cover;box-shadow:0 18px 40px rgba(19,47,77,.12)}.rs-eyebrow{font-size:11px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;color:#ffd36a}.rs-hero h1{font-size:clamp(31px,3vw,46px);line-height:1.03;margin:10px 0 12px}.rs-hero h1 span{color:var(--rs-gold2)}.rs-hero p{max-width:760px;font-size:14px;line-height:1.68;color:#dce6ef;margin:0}.rs-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.rs-btn{min-height:42px;border:1px solid #d6dfe8;border-radius:11px;background:#fff;color:#07143a;padding:0 16px;font-size:12px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:.18s}.rs-btn:hover{transform:translateY(-1px)}.rs-btn.primary{background:linear-gradient(100deg,#d59608,#e9bb38);border-color:#d89c11;color:#fff;box-shadow:0 8px 20px rgba(201,144,7,.25)}'
    + '.rs-search{margin-top:18px;max-width:610px;height:46px;border-radius:13px;background:rgba(255,255,255,.96);display:flex;align-items:center;gap:10px;padding:0 14px;color:#68758b}.rs-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#07143a;font-size:13px}.rs-search svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2}'
    + '.rs-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0 20px}.rs-metric{background:#fff;border:1px solid var(--rs-line);border-radius:15px;padding:16px;box-shadow:0 5px 16px rgba(31,58,91,.045)}.rs-metric span{font-size:10px;color:#7a8598;font-weight:900;letter-spacing:.3px}.rs-metric b{display:block;font-size:26px;margin-top:9px}.rs-metric p{font-size:11px;color:#7a8598;margin:3px 0 0}'
    + '.rs-section{margin-top:20px}.rs-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:12px}.rs-section-head h2{font-size:21px;margin:0}.rs-section-head p{font-size:12px;color:#7a8598;margin:5px 0 0}.rs-section-badge{padding:7px 10px;border-radius:999px;background:#fff6d9;border:1px solid #e7c158;color:#8a5b00;font-size:10px;font-weight:900;white-space:nowrap}'
    + '.rs-q-list{display:grid;grid-template-columns:1fr 1fr;gap:12px}.rs-question{background:#fff;border:1px solid #dfe7ef;border-radius:15px;padding:16px;box-shadow:0 5px 16px rgba(31,58,91,.04);display:flex;gap:16px;align-items:flex-start}.rs-q-copy{min-width:0}.rs-q-meta{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px}.rs-tag{font-size:10px;font-weight:900;border-radius:999px;padding:6px 8px;background:#fff6d9;color:#8a5b00;border:1px solid #ecd288}.rs-tag.blue{background:#eef5ff;color:#0a66c2;border-color:#cfe0f6}.rs-tag.green{background:#eaf8f3;color:#0a7c5d;border-color:#b9e4d5}.rs-tag.purple{background:#f4efff;color:#6b3db4;border-color:#dccdf7}.rs-question h3{font-size:14px;line-height:1.45;margin:0;color:#17233e}.rs-q-num{width:38px;height:38px;border-radius:11px;background:#071b33;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:900;flex:0 0 38px}'
    + '.rs-resource-grid,.rs-video-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.rs-resource-card,.rs-video-card{background:#fff;border:1px solid var(--rs-line);border-radius:17px;overflow:hidden;box-shadow:0 7px 22px rgba(30,58,90,.055);transition:.2s}.rs-resource-card{display:flex;flex-direction:column;min-height:390px}.rs-resource-card:hover,.rs-video-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(30,58,90,.1)}.rs-resource-img{height:190px;background-size:cover;background-position:center;position:relative}.rs-resource-img:after,.rs-video-thumb:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,20,58,.04),rgba(7,20,58,.45))}.rs-resource-type{position:absolute;left:13px;bottom:12px;z-index:2;padding:7px 9px;border-radius:9px;background:rgba(255,255,255,.94);font-size:10px;font-weight:900;color:#8a5b00}.rs-resource-body{padding:18px;display:flex;flex-direction:column;flex:1}.rs-resource-body h3{font-size:16px;line-height:1.3;margin:0 0 7px}.rs-resource-body p{font-size:12px;line-height:1.55;color:#697590;margin:0}.rs-resource-foot{margin-top:auto;padding-top:16px;display:flex;justify-content:space-between;align-items:center;gap:10px}.rs-resource-meta{font-size:11px;color:#8490a1;font-weight:800}'
    + '.rs-video-card{cursor:pointer}.rs-video-thumb{height:180px;background-size:cover;background-position:center;position:relative}.rs-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#d99a0a,#efbd3a);color:#fff;font-size:20px;box-shadow:0 8px 22px rgba(217,154,10,.3)}.rs-duration{position:absolute;right:10px;bottom:10px;z-index:2;padding:5px 7px;border-radius:7px;background:rgba(7,20,58,.86);color:#fff;font-size:10px;font-weight:900}.rs-video-body{padding:16px}.rs-video-body h3{font-size:14px;line-height:1.4;margin:0 0 5px}.rs-video-body p{font-size:11px;color:#7a8598;margin:0}'
    + '.rs-right{width:360px;flex:0 0 360px;height:100%;overflow-y:auto;border-left:1px solid #e4eaf1;background:#fbfcfe;padding:18px 17px;scrollbar-width:thin;scrollbar-color:#d0d9e4 #fff}.rs-right::-webkit-scrollbar{width:6px}.rs-right::-webkit-scrollbar-track{background:#fff}.rs-right::-webkit-scrollbar-thumb{background:#d0d9e4;border-radius:999px}.rs-right-inner{display:flex;flex-direction:column;gap:14px}.rs-side-card{background:#fff;border:1px solid #e0e7ef;border-radius:15px;padding:18px;box-shadow:0 5px 16px rgba(31,58,91,.045)}.rs-side-label{color:#9a6400;font-size:11px;font-weight:900;letter-spacing:.55px;text-transform:uppercase}.rs-side-card h3{margin:7px 0 6px;font-size:17px}.rs-side-card p{font-size:12px;line-height:1.56;color:#697590;margin:0}.rs-quick-nav{display:flex;flex-direction:column;gap:8px;margin-top:14px}.rs-quick-nav button{width:100%;border:1px solid #e0e7ef;background:#f8fafc;color:#25324b;border-radius:10px;padding:11px 12px;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:800;text-align:left;cursor:pointer}.rs-quick-nav button:hover{background:#eef4fb}.rs-quick-nav em{font-style:normal;color:#0a66c2;font-size:10px;font-weight:900}.rs-mock{color:#fff;min-height:190px;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(180deg,rgba(7,27,51,.05),rgba(7,27,51,.94)),url("https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80") center/cover}.rs-mock p{color:#dce6ef}.rs-tip-list{display:flex;flex-direction:column;gap:9px;margin-top:12px}.rs-tip-row{font-size:11px;color:#56637a;display:flex;gap:8px;align-items:flex-start}.rs-dot{width:8px;height:8px;border-radius:50%;background:#d99a0a;flex:0 0 8px;margin-top:4px}'
    + '@media(max-width:1279px){.resources-premium{display:block;overflow-y:auto}.rs-main{overflow:visible}.rs-right{width:100%;height:auto;overflow:visible;border-left:0;border-top:1px solid #e4eaf1;padding:20px}.rs-right-inner{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.rs-resource-grid,.rs-video-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    + '@media(max-width:900px){.rs-q-list{grid-template-columns:1fr}.rs-right-inner{grid-template-columns:1fr}.rs-metrics{grid-template-columns:1fr 1fr}}'
    + '@media(max-width:620px){.rs-main{padding:14px 13px}.rs-hero{padding:24px 18px;min-height:0}.rs-hero h1{font-size:30px}.rs-resource-grid,.rs-video-grid{grid-template-columns:1fr}.rs-metrics{grid-template-columns:1fr 1fr;gap:9px}}'
    + '</style>';

  const main='<main class="rs-main"><div class="rs-inner">'
    + '<section class="rs-hero"><div class="rs-eyebrow">CAREER READINESS RESOURCE VAULT</div><h1>Interview &amp; Career <span>Resources Library</span></h1><p>Access structured interview question banks, premium e-books, walkthrough videos, and role-specific career resources designed to support your job application and interview preparation.</p>'
    + '<div class="rs-actions"><button class="rs-btn primary" type="button" onclick="window._scrollResources(&quot;rs-questions&quot;)">Explore Question Bank</button><button class="rs-btn" type="button" onclick="window._scrollResources(&quot;rs-ebooks&quot;)">Browse E-books</button><button class="rs-btn" type="button" onclick="window._scrollResources(&quot;rs-videos&quot;)">Watch Videos</button></div>'
    + '<label class="rs-search"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><input type="search" placeholder="Search guides, questions, videos..." oninput="window._filterResources(this.value)"></label>'
    + '</section>'
    + '<section class="rs-metrics"><article class="rs-metric"><span>QUESTION BANK</span><b>120+</b><p>Behavioral &amp; technical prompts</p></article><article class="rs-metric"><span>INTERVIEW GUIDES</span><b>12</b><p>Role-specific e-books</p></article><article class="rs-metric"><span>VIDEO RESOURCES</span><b>18</b><p>Mentor walkthroughs</p></article><article class="rs-metric"><span>PROGRESS</span><b>68%</b><p>Resources completed</p></article></section>'
    + '<section class="rs-section" id="rs-questions"><div class="rs-section-head"><div><h2>Question Bank</h2><p>Practice the high-value questions employers are most likely to ask.</p></div><span class="rs-section-badge">120+ QUESTIONS</span></div><div class="rs-q-list">'+questionHtml+'</div></section>'
    + '<section class="rs-section" id="rs-ebooks"><div class="rs-section-head"><div><h2>Interview Guides &amp; E-books</h2><p>Structured playbooks for applications, tests and interviews.</p></div><span class="rs-section-badge">OFFLINE READY</span></div><div class="rs-resource-grid">'+bookHtml+'</div></section>'
    + '<section class="rs-section" id="rs-videos"><div class="rs-section-head"><div><h2>Video Resources</h2><p>Mentor-led walkthroughs and realistic mock interview examples.</p></div><span class="rs-section-badge">18 VIDEOS</span></div><div class="rs-video-grid">'+videoHtml+'</div></section>'
    + '</div></main>';

  const right='<aside class="rs-right"><div class="rs-right-inner">'
    + '<section class="rs-side-card"><div class="rs-side-label">Quick Navigation</div><h3>Resources Menu</h3><p>Jump directly to the resource section you need.</p><div class="rs-quick-nav"><button type="button" onclick="window._scrollResources(&quot;rs-questions&quot;)"><span>Question Bank</span><em>120+</em></button><button type="button" onclick="window._scrollResources(&quot;rs-ebooks&quot;)"><span>Interview Guides</span><em>12</em></button><button type="button" onclick="window._scrollResources(&quot;rs-videos&quot;)"><span>Video Resources</span><em>18</em></button></div></section>'
    + '<section class="rs-side-card rs-mock"><div class="rs-side-label" style="color:#ffd36a">Mock Interview</div><h3>Practice live with a mentor</h3><p>Use a guided mock session to test your interview answers before employer interviews.</p><button class="rs-btn primary" type="button" style="width:100%;margin-top:14px" onclick="window._nav(&quot;calendar&quot;)">Book Mock Session →</button></section>'
    + '<section class="rs-side-card"><div class="rs-side-label">Resource Tip</div><h3>Build a preparation loop</h3><div class="rs-tip-list"><div class="rs-tip-row"><span class="rs-dot"></span><span>Review one question category at a time.</span></div><div class="rs-tip-row"><span class="rs-dot"></span><span>Download the matching e-book for deeper examples.</span></div><div class="rs-tip-row"><span class="rs-dot"></span><span>Watch the mentor walkthrough and compare your answer.</span></div><div class="rs-tip-row"><span class="rs-dot"></span><span>Practice aloud before booking a live mock.</span></div></div></section>'
    + '</div></aside>';

  return topbarHtml('Resources','',68)+css+'<div class="resources-premium">'+main+right+'</div>';
}

function viewHelpSupport(){
  const faqs=[
    ['How do I submit my daily accountability report?','Open the Accountability Check-In from your course Day page, fill the readiness form, and submit it. Your report feeds the weekly analytics chart in the Course Portal.'],
    ['How do I maintain my Job Acquisition weekly application quota?','Use Boost & Accountability to log verified external job applications. The Job Acquisition workflow tracks progress against the five-application weekly quota.'],
    ['Where do I find Regional Job Boards?','Open Regional Job Boards from the Placement Pipeline in the left sidebar. Choose your employment market, browse verified boards, and open the external job board that matches your target region.'],
    ['How do I update my CV and professional portfolio?','Use CV Maker & Portfolio from the Placement Pipeline. You can update your professional details, choose an ATS template, strengthen your LinkedIn profile, and reuse portfolio content in your CV.'],
    ['My video will not play — what should I do?','Ensure you are online, refresh the page, and try the Replay or Watch button again from the Course Portal Video Tutorials or Job Acquisition Resources page.'],
    ['How does my XP and streak work?','XP and streak tracking remain part of your Course Portal learning activity. Claim the daily XP in Personal Check-In and continue submitting daily to grow your streak.']
  ];
  const faqHtml=faqs.map((f,i)=>
    '<article class="hs-faq"><button type="button" onclick="window._toggleSupportFaq(this)"><span>'+esc(f[0])+'</span><span class="hs-plus">+</span></button><div class="hs-answer">'+esc(f[1])+'</div></article>'
  ).join('');

  const css='<style>'
    + '.help-support-premium,.help-support-premium *{box-sizing:border-box}.help-support-premium{--hs-ink:#07143a;--hs-muted:#697590;--hs-line:#e1e8ef;--hs-gold:#d79a0b;--hs-gold2:#f2c14e;--hs-blue:#0a66c2;--hs-green:#0a9b70;display:flex;flex:1;min-height:0;background:#fff;color:var(--hs-ink);font-family:Inter,"Segoe UI",Arial,sans-serif}.help-support-premium button,.help-support-premium input,.help-support-premium textarea,.help-support-premium select{font:inherit}.help-support-premium a{text-decoration:none;color:inherit}'
    + '.hs-main{flex:1;min-width:0;overflow-y:auto;background:#fff;padding:22px;scrollbar-width:thin;scrollbar-color:#d9e2ec #fff}.hs-main::-webkit-scrollbar{width:7px}.hs-main::-webkit-scrollbar-track{background:#fff}.hs-main::-webkit-scrollbar-thumb{background:#d9e2ec;border-radius:999px}.hs-inner{max-width:1180px;margin:0 auto}'
    + '.hs-hero{min-height:270px;border-radius:18px;padding:34px 36px;color:#fff;background:linear-gradient(90deg,rgba(5,20,38,.97),rgba(5,20,38,.86) 50%,rgba(5,20,38,.28)),url("https://images.pexels.com/photos/7709252/pexels-photo-7709252.jpeg?auto=compress&cs=tinysrgb&w=1600") center 38%/cover;box-shadow:0 18px 40px rgba(19,47,77,.12)}.hs-eyebrow{font-size:11px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;color:#ffd36a}.hs-hero h1{font-size:clamp(31px,3vw,46px);line-height:1.03;margin:10px 0 12px}.hs-hero h1 span{color:var(--hs-gold2)}.hs-hero p{max-width:740px;font-size:14px;line-height:1.68;color:#dce6ef;margin:0}.hs-hero-search{margin-top:20px;max-width:620px;height:48px;border-radius:13px;background:rgba(255,255,255,.97);display:flex;align-items:center;gap:11px;padding:0 15px;color:#63718a}.hs-hero-search svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2}.hs-hero-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#07143a;font-size:13px}'
    + '.hs-support-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:18px 0 22px}.hs-support-card{border:1px solid #dfe7ef;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 8px 24px rgba(30,58,90,.06);display:flex;flex-direction:column;min-height:410px;transition:.2s}.hs-support-card:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(30,58,90,.11)}.hs-support-img{height:190px;background-size:cover;background-position:center;position:relative}.hs-support-img:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,20,58,.02),rgba(7,20,58,.48))}.hs-support-tag{position:absolute;left:14px;bottom:12px;z-index:2;padding:7px 9px;border-radius:9px;background:rgba(255,255,255,.95);font-size:10px;font-weight:900;color:#8a5b00}.hs-support-tag.blue{color:#0a66c2}.hs-support-tag.green{color:#08785b}.hs-support-body{padding:19px;display:flex;flex-direction:column;flex:1}.hs-support-body h3{font-size:18px;line-height:1.2;margin:0 0 7px}.hs-support-body p{font-size:12px;line-height:1.6;color:#697590;margin:0}.hs-support-foot{margin-top:auto;padding-top:18px;display:flex;align-items:center;justify-content:space-between;gap:10px}.hs-support-owner{font-size:11px;color:#8490a1;font-weight:800}'
    + '.hs-btn{min-height:42px;border:1px solid #d6dfe8;border-radius:11px;background:#fff;color:#07143a;padding:0 16px;font-size:12px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:.18s}.hs-btn:hover{transform:translateY(-1px)}.hs-btn.primary{background:linear-gradient(100deg,#d59608,#e9bb38);border-color:#d89c11;color:#fff;box-shadow:0 8px 20px rgba(201,144,7,.25)}.hs-btn.blue{background:#0a66c2;color:#fff;border-color:#0a66c2}.hs-btn.green{background:#0a9b70;color:#fff;border-color:#0a9b70}'
    + '.hs-section{margin-top:20px}.hs-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:12px}.hs-section-head h2{font-size:21px;margin:0}.hs-section-head p{font-size:12px;color:#7a8598;margin:5px 0 0}.hs-section-badge{padding:7px 10px;border-radius:999px;background:#fff6d9;border:1px solid #e7c158;color:#8a5b00;font-size:10px;font-weight:900}.hs-faq-list{display:flex;flex-direction:column;gap:10px}.hs-faq{border:1px solid #dfe7ef;border-radius:14px;background:#fff;box-shadow:0 5px 16px rgba(31,58,91,.04);overflow:hidden}.hs-faq>button{width:100%;border:0;background:#fff;color:#07143a;padding:17px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px;text-align:left;font-size:13px;font-weight:900}.hs-faq>button:hover{background:#fbfcfe}.hs-plus{width:29px;height:29px;border-radius:9px;background:#f1f4f8;color:#0a66c2;display:grid;place-items:center;flex:0 0 29px;font-size:18px;transition:.18s}.hs-answer{display:none;padding:0 18px 18px;font-size:12px;line-height:1.65;color:#697590;max-width:900px}.hs-faq.open .hs-answer{display:block}.hs-faq.open .hs-plus{transform:rotate(45deg);background:#fff6d9;color:#9a6400}'
    + '.hs-manage-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:16px}.hs-manage-card{border:1px solid #dfe7ef;border-radius:16px;background:#fff;padding:20px;box-shadow:0 5px 16px rgba(31,58,91,.04)}.hs-manage-card h3{font-size:17px;margin:0 0 5px}.hs-manage-card p{font-size:12px;line-height:1.55;color:#697590;margin:0 0 14px}.hs-manage-list{display:grid;grid-template-columns:1fr 1fr;gap:9px}.hs-manage-item{border:1px solid #e3e9f0;border-radius:11px;background:#f8fafc;padding:12px;font-size:11px;font-weight:800;color:#45526a;display:flex;align-items:center;gap:9px}.hs-manage-icon{width:29px;height:29px;border-radius:9px;background:#eef5ff;color:#0a66c2;display:grid;place-items:center;font-weight:900}'
    + '.hs-right{width:360px;flex:0 0 360px;height:100%;overflow-y:auto;border-left:1px solid #e4eaf1;background:#fbfcfe;padding:18px 17px;scrollbar-width:thin;scrollbar-color:#d0d9e4 #fff}.hs-right::-webkit-scrollbar{width:6px}.hs-right::-webkit-scrollbar-track{background:#fff}.hs-right::-webkit-scrollbar-thumb{background:#d0d9e4;border-radius:999px}.hs-right-inner{display:flex;flex-direction:column;gap:14px}.hs-side-card{background:#fff;border:1px solid #e0e7ef;border-radius:15px;padding:18px;box-shadow:0 5px 16px rgba(31,58,91,.045)}.hs-side-label{color:#9a6400;font-size:11px;font-weight:900;letter-spacing:.55px;text-transform:uppercase}.hs-side-card h3{margin:7px 0 6px;font-size:17px}.hs-side-card p{font-size:12px;line-height:1.56;color:#697590;margin:0}.hs-support-team{display:flex;align-items:center;gap:11px;margin-top:15px;padding:12px;background:#f8fafc;border:1px solid #e3e9f0;border-radius:12px}.hs-team-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#071b33;color:#fff;font-size:13px;font-weight:900}.hs-support-team strong{font-size:12px}.hs-support-team span{font-size:10px;color:#7a8598;display:block;margin-top:3px}.hs-status{display:flex;align-items:center;gap:7px;margin-top:12px;font-size:11px;color:#0a7c5d;font-weight:900}.hs-status-dot{width:8px;height:8px;border-radius:50%;background:#10a477;box-shadow:0 0 0 4px #eaf8f3}.hs-quick{display:flex;flex-direction:column;gap:8px;margin-top:13px}.hs-quick button{width:100%;border:1px solid #e0e7ef;background:#f8fafc;color:#25324b;border-radius:10px;padding:11px 12px;display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:800;text-align:left;cursor:pointer}.hs-quick button:hover{background:#eef4fb}.hs-contact-card{min-height:205px;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(180deg,rgba(7,27,51,.06),rgba(7,27,51,.94)),url("https://images.pexels.com/photos/7709116/pexels-photo-7709116.jpeg?auto=compress&cs=tinysrgb&w=1200") center 34%/cover}.hs-contact-card p{color:#dce6ef}'
    + '.hs-modal{position:fixed;inset:0;background:rgba(7,20,58,.48);display:none;align-items:center;justify-content:center;padding:20px;z-index:120}.hs-modal.open{display:flex}.hs-modal-card{width:min(620px,100%);background:#fff;border-radius:17px;box-shadow:0 24px 70px rgba(7,27,51,.25);overflow:hidden}.hs-modal-head{padding:18px 20px;border-bottom:1px solid #e7edf3;display:flex;align-items:center;justify-content:space-between}.hs-modal-head h3{margin:0;font-size:18px}.hs-modal-head button{border:0;background:#f1f4f8;width:34px;height:34px;border-radius:9px;color:#07143a}.hs-modal-body{padding:20px}.hs-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}.hs-full{grid-column:1/-1}.hs-field label{display:block;font-size:11px;font-weight:900;color:#45526a;margin-bottom:7px}.hs-field input,.hs-field select,.hs-field textarea{width:100%;padding:12px 13px;border:1px solid #dbe3ec;border-radius:11px;background:#f8fafc;color:#17233e;outline:0}.hs-field textarea{min-height:100px;resize:vertical}.hs-form-foot{display:flex;justify-content:flex-end;gap:9px;margin-top:15px}'
    + '@media(max-width:1279px){.help-support-premium{display:block;overflow-y:auto}.hs-main{overflow:visible}.hs-right{width:100%;height:auto;overflow:visible;border-left:0;border-top:1px solid #e4eaf1;padding:20px}.hs-right-inner{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}}'
    + '@media(max-width:900px){.hs-support-grid{grid-template-columns:1fr}.hs-right-inner{grid-template-columns:1fr}.hs-manage-grid{grid-template-columns:1fr}}'
    + '@media(max-width:620px){.hs-main{padding:14px 13px}.hs-hero{padding:24px 18px;min-height:0}.hs-hero h1{font-size:30px}.hs-manage-list{grid-template-columns:1fr}.hs-form-grid{grid-template-columns:1fr}.hs-full{grid-column:auto}}'
    + '</style>';

  const main='<main class="hs-main"><div class="hs-inner">'
    + '<section class="hs-hero"><div class="hs-eyebrow">HELP CENTRE</div><h1>Need a hand? <span>We’ve got you covered.</span></h1><p>Browse the FAQ, tap into the knowledge bank for guides, get help with your Job Acquisition workspace, or manage your account and membership directly.</p><label class="hs-hero-search"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><input type="search" placeholder="What can we help you with?" oninput="window._filterSupportFaq(this.value)"></label></section>'
    + '<section class="hs-support-grid">'
    + '<article class="hs-support-card"><div class="hs-support-img" style="background-image:url(&quot;https://images.pexels.com/photos/5453808/pexels-photo-5453808.jpeg?auto=compress&cs=tinysrgb&w=1000&quot;)"><span class="hs-support-tag">SUPPORT</span></div><div class="hs-support-body"><h3>FAQ</h3><p>Answers to common questions about the Job Acquisition portal, accountability, CV tools, applications and general ZEELIN access.</p><div class="hs-support-foot"><span class="hs-support-owner">Zeelin Academy</span><button class="hs-btn" type="button" onclick="window._scrollSupport(&quot;hs-faq&quot;)">Open</button></div></div></article>'
    + '<article class="hs-support-card"><div class="hs-support-img" style="background-image:url(&quot;https://images.pexels.com/photos/8866740/pexels-photo-8866740.jpeg?auto=compress&cs=tinysrgb&w=1000&quot;)"><span class="hs-support-tag blue">RESOURCES</span></div><div class="hs-support-body"><h3>Knowledge Bank &amp; Guides</h3><p>Use support guides alongside the Resources Library for Regional Job Boards, weekly accountability, CV Maker, portfolio setup and interview preparation.</p><div class="hs-support-foot"><span class="hs-support-owner">Admin support guides</span><button class="hs-btn blue" type="button" onclick="window._nav(&quot;resources&quot;)">Open</button></div></div></article>'
    + '<article class="hs-support-card"><div class="hs-support-img" style="background-image:url(&quot;https://images.pexels.com/photos/5467586/pexels-photo-5467586.jpeg?auto=compress&cs=tinysrgb&w=1000&quot;)"><span class="hs-support-tag green">ACCOUNT</span></div><div class="hs-support-body"><h3>Manage Account &amp; Billing</h3><p>Update your account details, manage membership information, download your data, or request support with billing and cohort access.</p><div class="hs-support-foot"><span class="hs-support-owner">Billing team</span><button class="hs-btn green" type="button" onclick="window._scrollSupport(&quot;hs-account&quot;)">Open</button></div></div></article>'
    + '</section>'
    + '<section class="hs-section" id="hs-faq"><div class="hs-section-head"><div><h2>Frequently Asked Questions</h2><p>Quick answers for common Job Acquisition and ZEELIN support questions.</p></div><span class="hs-section-badge">HELP CENTRE</span></div><div class="hs-faq-list">'+faqHtml+'</div></section>'
    + '<section class="hs-section" id="hs-account"><div class="hs-section-head"><div><h2>Manage Account &amp; Membership</h2><p>Course Portal account-management options carried into the Job Acquisition Help Centre.</p></div></div><div class="hs-manage-grid"><article class="hs-manage-card"><h3>Account actions</h3><p>Choose the type of account assistance you need. Sensitive account changes should be confirmed by the ZEELIN support or billing team.</p><div class="hs-manage-list"><div class="hs-manage-item"><span class="hs-manage-icon">01</span>Cancel annual membership</div><div class="hs-manage-item"><span class="hs-manage-icon">02</span>Update billing address</div><div class="hs-manage-item"><span class="hs-manage-icon">03</span>Download my data</div><div class="hs-manage-item"><span class="hs-manage-icon">04</span>Pause my cohort term</div></div></article><article class="hs-manage-card"><h3>Need direct assistance?</h3><p>Open a support request and tell the ZEELIN team what you need help with.</p><button class="hs-btn primary" type="button" style="width:100%" onclick="window._openSupportTicket()">Open Support Request</button><button class="hs-btn" type="button" style="width:100%;margin-top:9px" onclick="showToast(&quot;support@zeelin.academy&quot;)">Show Support Email</button></article></div></section>'
    + '</div></main>';

  const right='<aside class="hs-right"><div class="hs-right-inner">'
    + '<section class="hs-side-card"><div class="hs-side-label">Support Team</div><h3>Zeelin Academy Support</h3><p>Help with account access, portal navigation, learning support and Job Acquisition workflows.</p><div class="hs-support-team"><div class="hs-team-avatar">ZA</div><div><strong>Zeelin Admin | Support Team</strong><span>Course &amp; Career Support</span></div></div><div class="hs-status"><span class="hs-status-dot"></span>Support channel available</div><button class="hs-btn primary" type="button" style="width:100%;margin-top:14px" onclick="window._openSupportTicket()">Contact Support</button></section>'
    + '<section class="hs-side-card"><div class="hs-side-label">Quick Help</div><h3>Jump to a support area</h3><div class="hs-quick"><button type="button" onclick="window._scrollSupport(&quot;hs-faq&quot;)"><span>Frequently Asked Questions</span><span>→</span></button><button type="button" onclick="window._nav(&quot;resources&quot;)"><span>Knowledge Bank &amp; Guides</span><span>→</span></button><button type="button" onclick="window._scrollSupport(&quot;hs-account&quot;)"><span>Account &amp; Billing</span><span>→</span></button></div></section>'
    + '<section class="hs-side-card hs-contact-card"><div class="hs-side-label" style="color:#ffd36a">Need More Help?</div><h3>Open a support request</h3><p>Send your issue to the ZEELIN support team with the portal area and problem details.</p><button class="hs-btn primary" type="button" style="width:100%;margin-top:14px" onclick="window._openSupportTicket()">Create Request →</button></section>'
    + '</div></aside>';

  const modal='<div class="hs-modal" id="hs-ticket-modal" onclick="if(event.target===this)window._closeSupportTicket()"><div class="hs-modal-card"><div class="hs-modal-head"><h3>Contact ZEELIN Support</h3><button type="button" onclick="window._closeSupportTicket()" aria-label="Close">✕</button></div><div class="hs-modal-body"><div class="hs-form-grid"><div class="hs-field"><label>SUPPORT AREA</label><select id="hs-support-area"><option>Job Acquisition Portal</option><option>Regional Job Boards</option><option>Boost &amp; Accountability</option><option>CV Maker &amp; Portfolio</option><option>Course Portal</option><option>Account &amp; Billing</option></select></div><div class="hs-field"><label>PRIORITY</label><select id="hs-support-priority"><option>Normal</option><option>High</option><option>Access issue</option></select></div><div class="hs-field hs-full"><label>SUBJECT</label><input id="hs-ticket-subject" placeholder="Brief description of the issue"></div><div class="hs-field hs-full"><label>MESSAGE</label><textarea id="hs-ticket-message" placeholder="Tell us what happened, what page you were using, and what you expected to happen."></textarea></div></div><div class="hs-form-foot"><button class="hs-btn" type="button" onclick="window._closeSupportTicket()">Cancel</button><button class="hs-btn primary" type="button" onclick="window._submitSupportTicket()">Submit Support Request</button></div></div></div></div>';

  return topbarHtml('Help & Support','',82)+css+'<div class="help-support-premium">'+main+right+'</div>'+modal;
}
window._toggleSupportFaq = function(btn){
  const item=btn&&btn.closest?btn.closest('.hs-faq'):null;
  if(item) item.classList.toggle('open');
};
window._filterSupportFaq = function(value){
  const q=String(value||'').trim().toLowerCase();
  document.querySelectorAll('.hs-faq').forEach(function(item){
    item.style.display=!q || item.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
};
window._scrollSupport = function(id){
  const el=document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
};
window._openSupportTicket = function(){
  const m=document.getElementById('hs-ticket-modal');
  if(m) m.classList.add('open');
};
window._closeSupportTicket = function(){
  const m=document.getElementById('hs-ticket-modal');
  if(m) m.classList.remove('open');
};
window._submitSupportTicket = function(){
  const subject=(document.getElementById('hs-ticket-subject')||{}).value||'';
  const message=(document.getElementById('hs-ticket-message')||{}).value||'';
  const area=(document.getElementById('hs-support-area')||{}).value||'Job Acquisition Portal';
  const priority=(document.getElementById('hs-support-priority')||{}).value||'Normal';
  if(!subject.trim() || !message.trim()){
    showToast('Please add a subject and message.');
    return;
  }
  window._closeSupportTicket();
  const body='Support Area: '+area+'\nPriority: '+priority+'\n\n'+message;
  try{ window.location.href='mailto:support@zeelin.academy?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body); }
  catch(e){ showToast('support@zeelin.academy'); }
};

window._filterResources = function(value){
  const q=String(value||'').trim().toLowerCase();
  document.querySelectorAll('.rs-search-item').forEach(function(el){
    el.style.display=!q || String(el.dataset.search||'').includes(q) ? '' : 'none';
  });
};
window._scrollResources = function(id){
  const el=document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
};


function viewRecordings(){
  const listHtml = RECORDINGS_DATA.map(r=>{
    return '<div style="background-color:#181818;border:2px solid #3a3a3a;border-radius:14px;padding:32px;display:grid;grid-template-columns:1fr 1.5fr;gap:32px;align-items:center;box-sizing:border-box;">'
      + '<div style="display:flex;flex-direction:column;gap:12px;"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;"><span style="font-size:11px;font-weight:900;color:'+r.sessionColor+';background-color:'+r.sessionBg+';border:1px solid '+r.sessionBorder+';padding:3px 10px;border-radius:4px;text-transform:uppercase;">'+esc(r.sessionLabel)+'</span><span style="font-size:12px;font-weight:800;color:#a3a3a3;">'+esc(r.date)+'</span></div>'
      + '<h3 style="font-size:22px;font-weight:900;color:#ffffff;margin:0;letter-spacing:-0.3px;">'+esc(r.title)+'</h3><p style="font-size:14px;font-weight:700;color:#c0c0c0;line-height:1.6;margin:0;">'+esc(r.desc)+'</p>'
      + '<div style="display:flex;gap:16px;font-size:13px;font-weight:800;color:#a3a3a3;flex-wrap:wrap;"><span>Instructor: '+esc(r.instructor)+'</span><span>\u2022</span><span>Duration: '+esc(r.duration)+'</span></div></div>'
      + '<div onclick="window._watchRecording(\''+r.id+'\')" style="height:200px;background:linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(\''+r.thumb+'\') center/cover no-repeat;border:2px solid #3a3a3a;border-radius:10px;display:flex;align-items:center;justify-content:center;position:relative;box-sizing:border-box;cursor:pointer;">'
      + '<div style="width:56px;height:56px;background-color:rgba(217, 119, 6, 0.9);border:2px solid #f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#ffffff;cursor:pointer;box-shadow:0 4px 16px rgba(217,119,6,0.5);">\u25B6</div>'
      + '<div style="position:absolute;bottom:12px;right:12px;background-color:rgba(0,0,0,0.85);padding:4px 10px;border-radius:6px;font-size:11px;font-weight:900;color:#34d399;">1080p HD</div></div></div>';
  }).join('');

  const main = ''
    + '<div style="flex:1;padding:36px 52px;overflow-y:auto;background:#121212;">'
    + '<div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:32px;">'
    + '<div style="background:linear-gradient(rgba(24,24,24,0.85), rgba(24,24,24,0.85)), url(\'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80\') center/cover no-repeat;border:2px solid #3a3a3a;border-radius:16px;padding:40px 48px;box-sizing:border-box;">'
    + '<span style="font-size:12px;font-weight:900;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">On-Demand Media Archive</span><h1 style="font-size:32px;font-weight:900;color:#fff;margin:8px 0 12px 0;letter-spacing:-0.5px;">Recordings Library</h1><p style="font-size:14px;font-weight:700;color:#d4d4d4;margin:0;line-height:1.6;max-width:700px;">Access comprehensive video records of all past live cohort sessions, technical reviews, and mock interview walkthroughs arranged chronologically.</p></div>'
    + '<div style="display:flex;flex-direction:column;gap:24px;">'+listHtml+'</div>'
    + '</div></div>';

  const right = ''
    + '<div style="width:360px;background:#181818;border-left:2px solid #3a3a3a;display:flex;flex-direction:column;justify-content:space-between;overflow-y:auto;flex-shrink:0;">'
    + '<div style="padding:28px;display:flex;flex-direction:column;gap:24px;">'
    + '<div style="margin-bottom:4px;border-bottom:2px solid #3a3a3a;padding-bottom:16px;"><span style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.8px;">Archive Tools</span><h3 style="font-size:18px;font-weight:900;color:#fff;margin:4px 0 2px 0;">Recordings Hub</h3><p style="font-size:12px;font-weight:700;color:#c0c0c0;margin:0;">On-demand • Scrollable</p></div>'
    + '<div style="background:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:16px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><span style="font-size:12px;font-weight:900;color:#fff;">Search recordings</span></div><input type="text" placeholder="Search by title or instructor..." oninput="showToast(\'Filtering: \'+this.value+\' — demo\')" style="width:100%;background:#0a0a0a;border:2px solid #3a3a3a;border-radius:8px;padding:10px;color:#fff;font-size:12px;font-weight:700;outline:none;"><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;"><button onclick="showToast(\'Filter: All — demo\')" style="background:#262626;color:#fff;border:1px solid #3a3a3a;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:800;cursor:pointer;">All</button><button onclick="showToast(\'Filter: Live Session #3\')" style="background:#1e293b;color:#38bdf8;border:1px solid #3b82f6;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:800;cursor:pointer;">#3</button><button onclick="showToast(\'Filter: Dr. O. Emeka\')" style="background:#2c1a0e;color:#f59e0b;border:1px solid #d97706;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:800;cursor:pointer;">Emeka</button></div></div>'
    + '<div onclick="window._nav(\'resources\')" style="background:linear-gradient(135deg,#1e1a0e 0%, #181818 100%);border:2px solid #d97706;border-radius:12px;padding:20px;cursor:pointer;">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><div style="width:32px;height:32px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;">\u25B6</div><div><div style="font-size:13px;font-weight:900;color:#fff;">Mock Interview Resources</div><div style="font-size:11px;font-weight:700;color:#f59e0b;">\u2197 Open Question Bank & E-books</div></div></div>'
    + '<div style="display:flex;flex-direction:column;gap:6px;"><div style="background:#161616;border:1px solid #2a2a2a;border-radius:6px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;font-weight:800;color:#d4d4d4;">\uD83D\uDCCB QUESTION BANK</span><span style="font-size:10px;color:#38bdf8;">120+ Q</span></div><div style="background:#161616;border:1px solid #2a2a2a;border-radius:6px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;font-weight:800;color:#d4d4d4;">\uD83D\uDCD8 E-BOOKS</span><span style="font-size:10px;color:#f59e0b;">3 Guides</span></div><div style="background:#161616;border:1px solid #2a2a2a;border-radius:6px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;font-weight:800;color:#d4d4d4;">\uD83C\uDFA5 VIDEOS</span><span style="font-size:10px;color:#4ade80;">18</span></div></div></div>'
    + '<div style="background:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:16px;"><h4 style="font-size:13px;font-weight:900;color:#fff;margin:0 0 8px 0;">Need help?</h4><p style="font-size:11px;font-weight:700;color:#a3a3a3;margin:0 0 10px 0;line-height:1.5;">Archived sessions include transcripts & slides.</p><button onclick="window._contactSupport()" style="width:100%;background:#262626;color:#f59e0b;border:1px solid #d97706;padding:8px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;">Contact Support</button></div>'
    + '</div>'
    + '<div style="padding:24px;background:#161616;border-top:2px solid #3a3a3a;"><button onclick="window._nav(\'calendar\')" style="width:100%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#fff;border:1px solid #f59e0b;padding:14px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><span>Go to Calendar & Live</span><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg></button></div></div>';

  return topbarHtml('Work Experience Portal \u2022 Recordings Library & Archive Hub', '<span style="color:#a3a3a3;">On-Demand</span>', 70)
    + '<div class="jb-split" style="flex:1;display:flex;overflow:hidden;min-height:0;">'+main+right+'</div>';
}

function viewLiveSessions(){
  return '<div style="display:flex;flex-direction:column;height:100%;background:#0a0a0a;overflow:hidden;">'
    + '<div style="background:#181818;border-bottom:2px solid #3a3a3a;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:16px;">'
    + '<div style="display:flex;align-items:center;gap:14px;flex:1;min-width:0;">'
    + '<a onclick="window._nav(\'events-hub\')" style="display:flex;align-items:center;gap:8px;background:#262626;border:1px solid #404040;padding:8px 14px;border-radius:8px;color:#fff;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap;">\u2190 Back to Hub</a>'
    + '<div style="width:1px;height:28px;background:#3a3a3a;"></div>'
    + '<div style="display:flex;align-items:center;gap:10px;min-width:0;"><div style="width:8px;height:8px;background:#ef4444;border-radius:50%;box-shadow:0 0 0 6px rgba(239,68,68,0.15);flex-shrink:0;"></div>'
    + '<div style="min-width:0;"><div style="font-size:14px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Supply Chain Model Q&A Walkthrough</div><div style="font-size:11px;font-weight:700;color:#a3a3a3;">Live Session \u2022 Dr. O. Emeka \u2022 14:00 – 15:45 WAT \u2022 <span style="color:#34d399;">\u25CF Recording</span></div></div></div></div>'
    + '<div style="display:flex;align-items:center;gap:10px;flex-shrink:0;"><div style="display:flex;align-items:center;gap:6px;background:#1f1f1f;border:1px solid #3a3a3a;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:800;color:#d4d4d4;"><svg style="width:14px;height:14px;fill:#a3a3a3;" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> 18 participants</div><div style="background:#161616;border:1px solid #3a3a3a;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:800;color:#f59e0b;">01:24:18</div><div style="width:32px;height:32px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#000;">YO</div></div></div>'
    + '<div style="flex:1;display:flex;overflow:hidden;background:#0a0a0a;min-height:0;">'
    + '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:#0a0a0a;">'
    + '<div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;background:#0a0a0a;">'
    + '<div style="flex:1;min-height:360px;background:#161616;border:2px solid #3a3a3a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;position:relative;">'
    + '<div style="flex:1;background:linear-gradient(135deg,#1f1f1f 0%, #181818 100%);display:flex;align-items:center;justify-content:center;position:relative;padding:24px;">'
    + '<div style="width:100%;max-width:760px;background:#111;border:2px solid #2a2a2a;border-radius:10px;overflow:hidden;"><div style="background:#262626;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #3a3a3a;"><span style="font-size:12px;font-weight:800;color:#d4d4d4;">\uD83D\uDCCA Supply_Chain_Model_v4.2.xlsx — Screen share by Dr. O. Emeka</span><span style="font-size:11px;font-weight:900;color:#4ade80;background:#064e3b;border:1px solid #10b981;padding:2px 8px;border-radius:4px;">Live Share</span></div>'
    + '<div style="height:220px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#2a2a2a;padding:1px;"><div style="background:#181818;padding:12px;"><div style="font-size:10px;font-weight:900;color:#f59e0b;text-transform:uppercase;margin-bottom:8px;">Inventory Holding Cost</div><div style="height:6px;background:#262626;border-radius:4px;overflow:hidden;margin-bottom:6px;"><div style="width:72%;height:100%;background:#d97706;"></div></div><div style="height:6px;background:#262626;border-radius:4px;overflow:hidden;margin-bottom:6px;"><div style="width:45%;height:100%;background:#2563eb;"></div></div><div style="height:6px;background:#262626;border-radius:4px;overflow:hidden;"><div style="width:88%;height:100%;background:#16a34a;"></div></div></div><div style="background:#1f1f1f;display:flex;align-items:center;justify-content:center;color:#525252;font-size:12px;font-weight:800;">=VLOOKUP + INDEX/MATCH</div><div style="background:#181818;padding:12px;"><div style="font-size:10px;font-weight:900;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">Error Handling</div><div style="font-size:11px;font-weight:700;color:#a3a3a3;line-height:1.5;">IFERROR( ) wrappers<br/>Cell locking ($A$1)<br/>Audit trace applied</div></div></div></div>'
    + '<div style="position:absolute;bottom:14px;right:14px;width:160px;height:108px;background:url(\'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80\') center/cover no-repeat;border:2px solid #f59e0b;border-radius:10px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.6);"><div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent, rgba(0,0,0,0.85));padding:6px 8px;display:flex;align-items:center;gap:6px;"><div style="width:6px;height:6px;background:#4ade80;border-radius:50%;"></div><span style="font-size:11px;font-weight:800;color:#fff;">Dr. O. Emeka</span></div><div style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.7);border:1px solid #3a3a3a;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;color:#fff;display:flex;align-items:center;gap:4px;"><svg style="width:10px;height:10px;fill:#ef4444;" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg> Speaking</div></div></div>'
    + '<div style="background:#181818;border-top:2px solid #3a3a3a;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:13px;font-weight:900;color:#fff;">Dr. O. Emeka is presenting</span><span style="font-size:11px;font-weight:800;color:#a3a3a3;">\u2022 12 viewing</span></div><div style="display:flex;gap:8px;"><button style="background:#262626;color:#fff;border:1px solid #404040;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;">Pop out</button><button style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#fff;border:1px solid #f59e0b;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;">Follow presenter</button></div></div></div>'
    + '<div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:12px;">'
    + '<div style="height:110px;background:#181818;border:2px solid #d97706;border-radius:10px;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;"><div style="width:48px;height:48px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:14px;">YO</div><div style="position:absolute;bottom:6px;left:6px;right:6px;display:flex;align-items:center;justify-content:space-between;"><span style="background:rgba(0,0,0,0.85);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:800;color:#fff;">You</span><span style="background:#ef4444;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:900;color:#fff;">Muted</span></div></div>'
    + '<div style="height:110px;background:url(\'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80\') center/cover no-repeat;border:2px solid #2a2a2a;border-radius:10px;overflow:hidden;position:relative;"><div style="position:absolute;inset:0;background:linear-gradient(transparent 40%, rgba(0,0,0,0.75));"></div><div style="position:absolute;bottom:6px;left:6px;background:rgba(0,0,0,0.85);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:800;color:#fff;display:flex;align-items:center;gap:4px;"><svg style="width:10px;height:10px;fill:#4ade80;" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg> Sarah Jenkins</div><div style="position:absolute;top:6px;right:6px;background:#064e3b;border:1px solid #10b981;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:900;color:#4ade80;">Co-host</div></div>'
    + '<div style="height:110px;background:#1f1f1f;border:2px solid #2a2a2a;border-radius:10px;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;"><div style="width:48px;height:48px;background:#262626;border:2px solid #3a3a3a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#d4d4d4;font-size:14px;">AK</div><div style="position:absolute;bottom:6px;left:6px;background:rgba(0,0,0,0.85);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:800;color:#fff;">Amara K.</div><div style="position:absolute;top:6px;right:6px;background:#1e3a5f;border:1px solid #3b82f6;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:900;color:#38bdf8;">\u270B Raised</div></div>'
    + '<div style="height:110px;background:url(\'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80\') center/cover no-repeat;border:2px solid #2a2a2a;border-radius:10px;overflow:hidden;position:relative;"><div style="position:absolute;inset:0;background:linear-gradient(transparent 40%, rgba(0,0,0,0.75));"></div><div style="position:absolute;bottom:6px;left:6px;background:rgba(0,0,0,0.85);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:800;color:#fff;">David O.</div></div>'
    + '<div style="height:110px;background:#1f1f1f;border:2px solid #2a2a2a;border-radius:10px;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;"><div style="width:48px;height:48px;background:#262626;border:2px solid #3a3a3a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#d4d4d4;font-size:14px;">+9</div><div style="position:absolute;bottom:6px;left:6px;right:6px;text-align:center;background:rgba(0,0,0,0.85);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:800;color:#a3a3a3;">9 more</div></div>'
    + '<div style="height:110px;background:#161616;border:2px dashed #3a3a3a;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;"><div style="width:36px;height:36px;background:#262626;border:1px solid #404040;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#a3a3a3;">+</div><span style="font-size:12px;font-weight:800;color:#a3a3a3;">Invite</span></div>'
    + '</div></div>'
    + '<div style="background:#181818;border-top:2px solid #3a3a3a;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:16px;"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;font-weight:800;color:#a3a3a3;background:#1f1f1f;border:1px solid #2a2a2a;padding:6px 10px;border-radius:6px;display:flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;background:#ef4444;border-radius:50%;"></span> REC 01:24:18</span><span style="font-size:12px;font-weight:700;color:#525252;">|</span><span style="font-size:12px;font-weight:700;color:#a3a3a3;">18 in call</span></div><div style="display:flex;align-items:center;gap:8px;"><button style="width:44px;height:44px;background:#ef4444;border:1px solid #dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(239,68,68,0.3);"><svg style="width:18px;height:18px;fill:#fff;" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.74 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></button><button style="width:44px;height:44px;background:#262626;border:1px solid #404040;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg style="width:18px;height:18px;fill:#fff;" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg></button><button style="width:44px;height:44px;background:#262626;border:1px solid #404040;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg style="width:18px;height:18px;fill:#fff;" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg></button><div style="width:1px;height:28px;background:#3a3a3a;margin:0 4px;"></div><button style="width:44px;height:44px;background:#262626;border:1px solid #404040;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg style="width:18px;height:18px;fill:#fff;" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></button><button style="width:44px;height:44px;background:#262626;border:1px solid #404040;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg style="width:18px;height:18px;fill:#fff;" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg></button><button style="width:44px;height:44px;background:#1f1f1f;border:1px solid #3a3a3a;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg style="width:18px;height:18px;fill:#a3a3a3;" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button></div><button onclick="window._nav(\'events-hub\')" style="background:#dc2626;color:#fff;border:1px solid #ef4444;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg> Leave</button></div></div>'
    + '<div style="width:360px;background:#181818;border-left:2px solid #3a3a3a;display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;">'
    + '<div style="display:flex;border-bottom:2px solid #3a3a3a;flex-shrink:0;"><button style="flex:1;padding:14px;background:#262626;border:none;border-bottom:2px solid #d97706;color:#fff;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;"><svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg> Chat <span style="background:#d97706;color:#fff;padding:2px 6px;border-radius:10px;font-size:11px;">4</span></button><button onclick="window._showParticipants()" style="flex:1;padding:14px;background:#181818;border:none;border-bottom:2px solid transparent;color:#a3a3a3;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;"><svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> Participants (18)</button></div>'
    + '<div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;background:#121212;">'
    + '<div style="background:#1f1f1f;border:1px solid #2a2a2a;border-radius:8px;padding:10px 12px;text-align:center;"><span style="font-size:11px;font-weight:800;color:#a3a3a3;">Today \u2022 Meeting started at 14:00 WAT \u2022 Recording is on</span></div>'
    + '<div style="display:flex;gap:10px;"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;"><div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:13px;font-weight:900;color:#fff;">Sarah Jenkins</span><span style="font-size:11px;font-weight:700;color:#a3a3a3;">14:02</span><span style="font-size:10px;font-weight:900;color:#4ade80;background:#064e3b;border:1px solid #065f46;padding:1px 6px;border-radius:4px;">Co-host</span></div><div style="margin-top:4px;background:#262626;border:1px solid #3a3a3a;border-radius:10px;border-top-left-radius:4px;padding:10px 12px;"><p style="font-size:13px;font-weight:700;color:#d4d4d4;margin:0;line-height:1.5;">Welcome everyone! \uD83D\uDC4B Quick reminder — Q&A is open. Drop your inventory model questions in chat and Dr. Emeka will walk through them live.</p><div style="margin-top:8px;display:flex;gap:6px;"><span style="background:#1f1f1f;border:1px solid #2a2a2a;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:800;color:#d4d4d4;">\uD83D\uDC4D 6</span><span style="background:#1f1f1f;border:1px solid #2a2a2a;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:800;color:#d4d4d4;">\uD83D\uDCA1 3</span></div></div></div></div>'
    + '<div style="display:flex;gap:10px;"><div style="width:32px;height:32px;border-radius:50%;background:#262626;border:1px solid #3a3a3a;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#d4d4d4;flex-shrink:0;">AK</div><div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:13px;font-weight:900;color:#fff;">Amara K.</span><span style="font-size:11px;font-weight:700;color:#a3a3a3;">14:08</span></div><div style="margin-top:4px;background:#262626;border:1px solid #3a3a3a;border-radius:10px;border-top-left-radius:4px;padding:10px 12px;"><p style="font-size:13px;font-weight:700;color:#d4d4d4;margin:0;line-height:1.5;">How do we lock cell references when copying the holding cost formula across months? My $ signs keep breaking \uD83D\uDE05</p></div></div></div>'
    + '<div style="display:flex;gap:10px;"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #d97706;"><div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:13px;font-weight:900;color:#f59e0b;">Dr. O. Emeka</span><span style="font-size:11px;font-weight:700;color:#a3a3a3;">14:10</span><span style="font-size:10px;font-weight:900;color:#f59e0b;background:#2c1a0e;border:1px solid #d97706;padding:1px 6px;border-radius:4px;">Host</span></div><div style="margin-top:4px;background:linear-gradient(135deg,#2c1a0e 0%, #1f1f1f 100%);border:1px solid #d97706;border-radius:10px;border-top-left-radius:4px;padding:10px 12px;"><p style="font-size:13px;font-weight:700;color:#fff;margin:0;line-height:1.5;">Great Q @Amara — locking is <span style="background:#f59e0b;color:#000;padding:1px 6px;border-radius:4px;font-weight:900;">$A$1</span> for absolute. Watch the screen share now, I\u2019ll demo row vs column locks.</p><div style="margin-top:8px;font-size:11px;font-weight:800;color:#f59e0b;">\u21B3 Replying to Amara K.</div></div></div></div>'
    + '<div style="display:flex;gap:10px;"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#000;flex-shrink:0;">YO</div><div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:13px;font-weight:900;color:#fff;">You</span><span style="font-size:11px;font-weight:700;color:#a3a3a3;">14:12</span></div><div style="margin-top:4px;background:#d97706;border:1px solid #f59e0b;border-radius:10px;border-top-left-radius:4px;padding:10px 12px;"><p style="font-size:13px;font-weight:700;color:#fff;margin:0;line-height:1.5;">Thanks! The IFERROR wrapper also fixed my #DIV/0! issue \uD83D\uDE4C</p></div><div style="margin-top:4px;font-size:11px;font-weight:700;color:#a3a3a3;display:flex;gap:8px;align-items:center;"><span>\u2713 Delivered</span><span>\u2022</span><span style="color:#38bdf8;cursor:pointer;">Edit</span></div></div></div>'
    + '<div style="display:flex;gap:10px;"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;"><div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:13px;font-weight:900;color:#fff;">Sarah Jenkins</span><span style="font-size:11px;font-weight:700;color:#a3a3a3;">14:15</span></div><div style="margin-top:4px;background:#161616;border:2px solid #3a3a3a;border-radius:10px;padding:12px;display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#16a34a;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;">\uD83D\uDCCE</div><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:800;color:#fff;">Holding_Cost_Template.xlsx</div><div style="font-size:11px;font-weight:700;color:#a3a3a3;">124 KB \u2022 Shared for practice</div></div><button style="background:#262626;color:#4ade80;border:1px solid #22c55e;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:900;cursor:pointer;">Download</button></div></div></div>'
    + '<div style="background:#1e293b;border:1px solid #3b82f6;border-radius:8px;padding:8px 12px;display:flex;align-items:center;gap:8px;"><span style="font-size:14px;">\u270B</span><span style="font-size:12px;font-weight:800;color:#38bdf8;">Amara K. raised hand</span><span style="font-size:11px;font-weight:700;color:#a3a3a3;">\u2022 14:18</span></div>'
    + '</div>'
    + '<div style="padding:12px;background:#181818;border-top:2px solid #3a3a3a;flex-shrink:0;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><button style="width:28px;height:28px;background:#262626;border:1px solid #404040;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;">\uD83D\uDE0A</button><button style="width:28px;height:28px;background:#262626;border:1px solid #404040;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;">\uD83D\uDCCE</button><button style="width:28px;height:28px;background:#262626;border:1px solid #404040;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;">\uD83C\uDFA5</button><button style="width:28px;height:28px;background:#262626;border:1px solid #404040;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;">GIF</button><div style="flex:1;"></div><span style="font-size:11px;font-weight:700;color:#525252;">Shift + Enter for new line</span></div><div style="display:flex;gap:8px;align-items:flex-end;"><div style="flex:1;background:#0a0a0a;border:2px solid #3a3a3a;border-radius:8px;padding:10px 12px;min-height:44px;display:flex;align-items:center;"><input id="live-chat-input" type="text" placeholder="Type a message..." onkeydown="if(event.key===\'Enter\') window._sendLiveChat()" style="flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:13px;font-weight:600;font-family:inherit;"></div><button onclick="window._sendLiveChat()" style="width:44px;height:44px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border:1px solid #f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3);"><svg style="width:18px;height:18px;fill:#fff;" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div><div style="margin-top:8px;display:flex;gap:8px;"><button onclick="window._raiseHand()" style="flex:1;background:#262626;color:#d4d4d4;border:1px solid #404040;padding:8px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">\u270B Raise hand</button><button style="flex:1;background:#262626;color:#d4d4d4;border:1px solid #404040;padding:8px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;"><span>\uD83D\uDE00</span> React</button></div></div>'
    + '</div></div></div>';
}

/* ─── Wire functions ─── */
window._nav = function(hash){
  navigate(hash);
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('sidebarOverlay');
  if(sb) sb.classList.remove('open');
  if(ov) ov.classList.remove('show');
};
window._submitBoost = function(){
  const cEl=document.getElementById('boost-company');
  const roleEl=document.getElementById('boost-role');
  const lEl=document.getElementById('boost-link');
  const rEl=document.getElementById('boost-req');
  const daEl=document.getElementById('boost-dateApplied');
  const dpEl=document.getElementById('boost-datePosted');
  const sEl=document.getElementById('boost-status');
  const company=(cEl&&cEl.value.trim())||'';
  const role=(roleEl&&roleEl.value.trim())||'';
  const link=(lEl&&lEl.value.trim())||'';
  const req=(rEl&&rEl.value.trim())||'';
  const dateApplied=(daEl&&daEl.value)||new Date().toISOString().slice(0,10);
  const datePosted=(dpEl&&dpEl.value)||'';
  const status=(sEl&&sEl.value)||'applied';
  if(!company){ showToast('Enter Company Name'); cEl&&cEl.focus(); return; }
  if(!link || !/^https?:\/\//.test(link)){ showToast('Enter a valid Job Application Link (https://)'); lEl&&lEl.focus(); return; }
  if(state.boostApplications.length>=5){
    showToast('Quota reached (5/5). Update status of existing entries instead of adding more. Multiple jobs allowed but quota caps at 5 for cohort progression.');
    return;
  }
  const entry={
    id:'b'+Date.now(),
    company:company,
    role: role || company+' — Application',
    link:link,
    requirements:req,
    dateApplied:dateApplied,
    datePosted:datePosted,
    status:status
  };
  state.boostApplications.push(entry);
  saveState();
  showToast('Logged '+company+' ('+state.boostApplications.length+'/5) — date applied '+fmtDate(dateApplied));
  render(state.activeView);
};
window._updateBoostStatus = function(id, newStatus){
  const a=state.boostApplications.find(x=>x.id===id);
  if(!a) return;
  a.status=newStatus;
  saveState();
  showToast(esc(a.company)+' status → '+newStatus);
  render(state.activeView);
};
window._deleteBoost = function(id){
  state.boostApplications = state.boostApplications.filter(x=>x.id!==id);
  saveState();
  showToast('Application removed');
  render(state.activeView);
};
window._updateCV = function(){
  const get = id=>document.getElementById(id);
  const d=state.cvDraft;
  if(get('input-name')) d.name=get('input-name').value;
  if(get('input-title')) d.title=get('input-title').value;
  if(get('input-email')) d.email=get('input-email').value;
  if(get('input-location')) d.location=get('input-location').value;
  if(get('input-certs')) d.certs=get('input-certs').value;
  if(get('input-level')) d.level=get('input-level').value;
  if(get('input-industry')) d.industry=get('input-industry').value;
  if(get('input-summary')) d.summary=get('input-summary').value;
  if(get('input-job')) d.jobDesc=get('input-job').value;
  saveState();
  // live canvas update without full rerender for smoothness
  const nameEl=document.getElementById('cv-name');
  if(nameEl) nameEl.textContent=(d.name||'').toUpperCase();
  const titleEl=document.getElementById('cv-title');
  if(titleEl) titleEl.textContent=d.title;
  const contactEl=document.getElementById('cv-contact');
  if(contactEl) contactEl.textContent=d.location+' • '+d.email+' • Experience Level: '+d.level+' • Focus: '+d.industry;
  const sumEl=document.getElementById('cv-summary-text');
  if(sumEl) sumEl.textContent=d.summary;
  const certsEl=document.getElementById('cv-certs');
  if(certsEl) certsEl.innerHTML='<strong>Certifications:</strong> '+esc(d.certs)+'.<br><strong>Focus:</strong> '+esc(d.industry)+' ('+esc(d.level)+').';
};
window._setTemplate = function(theme){
  state.cvDraft.template=theme;
  saveState();
  // update card borders live
  document.querySelectorAll('[id^="card-"]').forEach(el=>{
    const isActive = el.id==='card-'+theme;
    el.style.borderColor=isActive?'#d97706':(el.classList.contains('cvp-theme')?'#dbe3ec':'#3a3a3a');
    const lbl=el.querySelector('div:last-child');
    if(lbl) lbl.style.color=isActive?'#9a6400':(el.classList.contains('cvp-theme')?'#697590':'#a3a3a3');
    const imgDiv=el.querySelector('div:first-child');
    if(imgDiv) imgDiv.style.borderBottom='2px solid '+(isActive?'#d97706':'#3a3a3a');
  });
  const tMap={
    executive:{bg:'#fffbf0', color:'#111111', border:'3px solid #d97706', titleColor:'#d97706'},
    corporate:{bg:'#f8fafc', color:'#0f172a', border:'3px solid #2563eb', titleColor:'#2563eb'},
    minimalist:{bg:'#ffffff', color:'#27272a', border:'1px solid #71717a', titleColor:'#71717a'},
    tech:{bg:'#f0fdf4', color:'#14532d', border:'3px solid #16a34a', titleColor:'#16a34a'},
    classic:{bg:'#fafaf9', color:'#292524', border:'2px solid #78716c', titleColor:'#78716c'}
  };
  const t=tMap[theme]||tMap.executive;
  const canvas=document.getElementById('cv-canvas');
  if(canvas){ canvas.style.backgroundColor=t.bg; canvas.style.color=t.color; }
  const hdr=document.getElementById('cv-header');
  if(hdr) hdr.style.borderBottom=t.border;
  const ttl=document.getElementById('cv-title');
  if(ttl) ttl.style.color=t.titleColor;
};
window._aiEnhance = function(){
  const jobEl=document.getElementById('input-job');
  const sumEl=document.getElementById('input-summary');
  if(!jobEl || !sumEl){ showToast('AI API: form not ready'); return; }
  const btn=event&&event.target;
  const original = btn? btn.textContent : '';
  if(btn){ btn.textContent='Enhancing...'; btn.disabled=true; }
  // Mock AI API — in production replace with fetch('/api/cv/generate', {method:'POST', body:JSON.stringify({summary:sumEl.value, job:jobEl.value})})
  setTimeout(()=>{
    const enhanced = sumEl.value.trim() + ' [AI-enhanced: aligned to ATS keywords from target job — stakeholder elicitation, MoSCoW, financial modeling, inventory turnover.]';
    sumEl.value=enhanced;
    state.cvDraft.summary=enhanced;
    saveState();
    window._updateCV();
    showToast('AI API: Summary enhanced for ATS (demo). Verify facts before submit — AI disclaimer applies.');
    if(btn){ btn.textContent=original||'✨ Enhance with AI API'; btn.disabled=false; }
  }, 900);
};
window._downloadCV = function(){
  showToast('Downloading ATS Resume PDF... (demo — canvas ready for print)');
  window.print && window.print();
};
window._downloadPrompt = function(){
  const blob = new Blob(['ZEELIN JOB ACQUISITION PORTAL — BA_SupplyChain_Interview_Prompt.docx (demo)\n\n1. Describe your stakeholder conflict resolution approach.\n2. Defend your carrying cost multiplier model.\n3. Explain MoSCoW prioritization under scope creep.\n\nSubmit via drag & drop.'], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='BA_SupplyChain_Interview_Prompt.docx'; a.click(); URL.revokeObjectURL(url);
  showToast('Downloaded BA_SupplyChain_Interview_Prompt.docx');
};
window._handleFile = function(files){
  if(!files||!files.length) return;
  const list=document.getElementById('uploadList');
  const chk=document.getElementById('chk-upload');
  Array.from(files).forEach(f=>{
    if(f.size>25*1024*1024){ showToast(f.name+' exceeds 25MB'); return; }
    state.uploads.push({name:f.name, size:f.size, date:new Date().toISOString().slice(0,10)});
    if(list){
      const div=document.createElement('div');
      div.style.cssText='margin-top:8px;background:#262626;border:1px solid #3a3a3a;border-radius:6px;padding:8px 12px;font-size:12px;font-weight:700;color:#d4d4d4;display:flex;justify-content:space-between;align-items:center;';
      div.innerHTML='<span>📄 '+esc(f.name)+' ('+(f.size/1024).toFixed(1)+' KB)</span><span style="color:#16a34a;">Uploaded</span>';
      list.appendChild(div);
    }
  });
  saveState();
  if(chk) chk.checked=true;
  showToast('Uploaded '+files.length+' document(s) — mock interview / assignment');
};
window._handleDrop = function(e){
  e.preventDefault();
  const dz=document.getElementById('dropZone');
  if(dz) dz.style.borderColor='#d97706';
  if(e.dataTransfer&&e.dataTransfer.files) window._handleFile(e.dataTransfer.files);
};
window._reviewMock = function(id){
  const q = MOCK_QUESTIONS_DATA.find(x=>x.id===id);
  if(!q) return;
  showToast(q.title+': '+q.guide);
};
window._joinLive = function(){ window._nav('live-sessions'); };
window._reserveSeat = function(){ showToast('Seat reserved for Behavioral Mock Interview Masterclass — check email (demo)'); };
window._watchRecording = function(id){ showToast('Opening recording '+(id||'')+' — 1080p HD (demo playback)'); if(id) window._nav('recordings'); };
window._bookSlot = function(name){ state.interviewBookings.push({id:'bk_'+Date.now()+Math.random().toString(36).slice(2,6), mentor:name, date:new Date().toISOString(), anon:false, type:'live-mock', evidenceName:'', evidenceLink:'', status:'pending', createdAt:new Date().toISOString()}); saveState(); showToast('Booked live mock session with '+name+' — check Calendar tab. Interview exercise added to timetable.'); render(state.activeView); };
window._bookSlotAdvanced = function(){
  const dEl=document.getElementById('cal-date');
  const tEl=document.getElementById('cal-time');
  const aEl=document.getElementById('cal-anon');
  const date=dEl?dEl.value:'2026-08-31';
  const time=tEl?tEl.value:'14:00';
  const anon=aEl?aEl.checked:false;
  if(!date){ showToast('Select date for live mock'); return; }
  openEvidenceDialog(date,time,anon);
};
window._sendLiveChat = function(){
  const inp=document.getElementById('live-chat-input');
  if(!inp || !inp.value.trim()) return;
  const msg=inp.value.trim();
  inp.value='';
  showToast('You: '+msg+' \u2014 sent to live chat (Teams demo)');
  // append bubble to chat for demo
  const scroller=document.querySelector('[style*="overflow-y:auto"][style*="background:#121212"]');
  if(scroller){
    const div=document.createElement('div');
    div.style.cssText='display:flex;gap:10px;';
    div.innerHTML='<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#000;flex-shrink:0;">YO</div><div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:13px;font-weight:900;color:#fff;">You</span><span style="font-size:11px;font-weight:700;color:#a3a3a3;">now</span></div><div style="margin-top:4px;background:#d97706;border:1px solid #f59e0b;border-radius:10px;border-top-left-radius:4px;padding:10px 12px;"><p style="font-size:13px;font-weight:700;color:#fff;margin:0;line-height:1.5;">'+esc(msg)+'</p></div></div>';
    scroller.appendChild(div);
    scroller.scrollTop=scroller.scrollHeight;
  }
};
window._raiseHand = function(){ showToast('\u270B Hand raised — Dr. O. Emeka will invite you to speak'); };
window._showParticipants = function(){ showToast('Participants: 18 in call \u2014 Dr. O. Emeka (Host), Sarah Jenkins (Co-host), You, Amara K., David O. +13 more'); };
window._contactSupport = function(){ showToast('Contact Support: support@zeelin.academy (demo)'); };

/* ─── Sidebar update ─── */
function updateSidebar(activeRoute){
  const sb=document.getElementById('sidebar');
  if(sb){
    sb.classList.add('overview-sidebar-copy');
    sb.classList.toggle('boost-sidebar-position', activeRoute==='boost');
    sb.innerHTML=renderSidebar(activeRoute);
  }
  const fullWidth=['overview','regional-boards'].includes(activeRoute);
  const isBoost=activeRoute==='boost';
  const layout=document.querySelector('.layout');
  const mainWrap=document.querySelector('.main');
  const sidebarEl=document.getElementById('sidebar');
  if(fullWidth){
    if(sidebarEl) sidebarEl.style.display='none';
    if(layout){layout.style.display='block';layout.style.background='#ffffff';}
    if(mainWrap) mainWrap.style.background='#ffffff';
    try{document.body.style.background='#ffffff';}catch(e){}
  }else{
    if(sidebarEl){sidebarEl.style.display='flex';sidebarEl.style.width='';}
    if(layout){layout.style.display='flex';layout.style.background=isBoost?'#ffffff':'';}
    if(mainWrap) mainWrap.style.background=isBoost?'#ffffff':'';
    try{document.body.style.background=isBoost?'#ffffff':'';}catch(e){}
  }
}

function renderJBNav(view){
  var el = document.getElementById('jbBottomNav'); if(!el) return;
  if(view==='overview' || view==='regional-boards'){ el.innerHTML=''; el.style.display='none'; return; }
  el.style.display='';
  var map = {'portal':'home','overview':'home','regional-boards':'boards','boost':'boost','cv-maker':'cv','cv-maker/cv':'cv','cv-maker/portfolio':'cv','interview-prep':'prep','events-hub':'hub','calendar':'hub','recordings':'hub','live-sessions':'hub','resources':'hub'};
  var on = map[view] || '';
  function link(route, key, label, path){
    return '<a href="#'+route+'" class="'+(on===key?'active':'')+'"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="'+path+'"/></svg><span>'+label+'</span></a>';
  }
  el.innerHTML = link('overview','home','Home','M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z')
    + link('regional-boards','boards','Boards','M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z')
    + link('boost','boost','Boost','M4 20V10M10 20V5M16 20v-8M22 20V2')
    + link('cv-maker','cv','CV Maker','M6 2h9l4 4v16H6zM15 2v5h5M9 12h7M9 16h7')
    + link('events-hub','hub','Hub','M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z');
}

/* ─── Main render ─── */
function render(view, param){
  const fullWidthViews = ['overview','regional-boards'];
  const isFull = fullWidthViews.includes(view);
  const isBoost = view==='boost';
  const isCareer = ['cv-maker','cv-maker/cv','cv-maker/portfolio'].includes(view);
  const isResources = view==='resources';
  const isSupport = view==='help-support';
  // update sidebar even for full width (for state)
  updateSidebar(view);
  renderJBNav(view);
  // re-evaluate stage zoom on every navigation so no stale scale sticks
  try{ fitStage(); }catch(e){}
  const main = document.getElementById('main-content');
  if(!main) return;
  main.classList.toggle('boost-page',isBoost);
  try{ document.body.classList.toggle('boost-page-active',isBoost); }catch(e){}
  // Ensure main-content wrapper styles — overview white, free, 80% scale handled inside
  main.style.cssText = isFull ? 'display:block;overflow:auto;background:#ffffff;height:100vh;height:100dvh;min-height:0;flex:none;' : 'display:flex;flex-direction:column;overflow:hidden;background:'+((isBoost||isCareer||isResources||isSupport)?'#ffffff':'#121212')+';height:100%;min-height:0;';

  let html='';
  switch(view){
    case 'portal': html = viewPortal(); break;
    case 'overview': html = viewOverview(); break;
    case 'regional-boards': html = viewRegionalBoards(param); if(typeof bindRegionalBoards==='function') setTimeout(bindRegionalBoards, 0); break;
    case 'boost': html = viewBoost(); break;
    case 'cv-maker': html = viewCVMaker(); break;
    case 'cv-maker/cv': html = viewCVMakerDetail(); break;
    case 'cv-maker/portfolio': html = viewPortfolio(); break;
    case 'interview-prep': html = viewInterviewPrep(); break;
    case 'events-hub': html = viewEventsHub(); break;
    case 'calendar': html = viewCalendar(); break;
    case 'recordings': html = viewRecordings(); break;
    case 'live-sessions': html = viewLiveSessions(); break;
    case 'resources': html = viewResources(); break;
    case 'help-support': html = viewHelpSupport(); break;
    default: html = viewPortal();
  }
  main.innerHTML = html;
  bindOvSmartHeader();
  ovSyncHeader();
  bindCopiedOverviewChrome();
  syncCopiedOverviewChrome();
  // re-attach file input listener if needed is inline; ensure drag zone exists
  // scroll to top
  const scrollEl = main.querySelector('[style*="overflow-y:auto"]') || main;
  if(scrollEl) scrollEl.scrollTop = 0;
}


/* ─── Copied Overview chrome for Regional + every other Job Acquisition route ─── */
function syncCopiedOverviewChrome(){
  try{
    const main=document.getElementById('main-content');
    if(!main) return;
    const bar=main.querySelector('.job-copied-topbar');
    if(!bar) return;
    const regional=main.querySelector('.rb-root');
    const host=regional ? main.querySelector('.rb-workspace') : document.querySelector('.layout > .main');
    if(host && window.innerWidth>=1280){
      const r=host.getBoundingClientRect();
      bar.style.left=r.left+'px';
      bar.style.width=r.width+'px';
    }else{
      bar.style.left='0px';
      bar.style.width='100%';
    }
    const space=main.querySelector('.job-copied-topbar-space');
    if(space) space.style.height=bar.offsetHeight+'px';
  }catch(e){}
}
function bindCopiedOverviewChrome(){
  const main=document.getElementById('main-content');
  if(!main || main.dataset.copiedOverviewChromeBound) return;
  main.dataset.copiedOverviewChromeBound='1';
  window.addEventListener('resize',syncCopiedOverviewChrome);
  document.addEventListener('scroll',function(e){
    const bar=main.querySelector('.job-copied-topbar');
    const icons=main.querySelector('.job-copied-top-icons');
    if(!bar || !icons) return;

    const boostRoot=main.querySelector('.boost-premium');
    let t=e.target===document ? document.scrollingElement : e.target;

    if(boostRoot){
      const boostScroller=boostRoot.querySelector('.bp-main');
      if(!boostScroller || t!==boostScroller) return;
    }

    if(!t || typeof t.scrollTop!=='number') return;
    const st=t.scrollTop;
    const last=Number(t.dataset && t.dataset.jobChromeLast || 0);
    const hide=st>140 && st>last+4;
    const show=st<last-4;

    if(hide){
      bar.classList.add('ov-hidden');
      icons.classList.add('ov-hidden');
    }else if(show){
      bar.classList.remove('ov-hidden');
      icons.classList.remove('ov-hidden');
    }

    if(st<=20 && boostRoot){
      bar.classList.remove('ov-hidden');
      icons.classList.remove('ov-hidden');
    }

    if(t.dataset) t.dataset.jobChromeLast=String(st);
  },true);
}

/* ─── Overview smart header: hide on scroll down, reveal on scroll up ─── */
function ovSyncHeader(){
  try{
    const main = document.getElementById('main-content');
    if(!main) return;
    const root = main.querySelector('.overview-root');
    if(!root) return;
    const ws = root.querySelector('.workspace');
    const bar = root.querySelector('.topbar');
    if(!ws || !bar) return;
    const r = ws.getBoundingClientRect();
    bar.style.left = r.left + 'px';
    bar.style.width = r.width + 'px';
    const sb = root.querySelector('.sidebar');
    const appEl = root.querySelector('.app');
    const right = root.querySelector('.right');
    if(sb && appEl && window.innerWidth >= 1280){
      const ar = appEl.getBoundingClientRect();
      sb.style.left = ar.left + 'px';
      sb.style.width = (r.left - ar.left) + 'px';
      if(right){
        const rightWidth = Math.max(0, ar.right - r.right);
        right.style.left = r.right + 'px';
        right.style.width = rightWidth + 'px';
      }
    } else {
      if(sb){ sb.style.left=''; sb.style.width=''; }
      if(right){ right.style.left=''; right.style.width=''; }
    }
    root.style.setProperty('--ov-bar-h', bar.offsetHeight + 'px');
  }catch(e){}
}
function bindOvSmartHeader(){
  const main = document.getElementById('main-content');
  if(!main || main.dataset.ovSmart) return;
  main.dataset.ovSmart = '1';
  window.addEventListener('resize', ovSyncHeader);
  let last = 0;
  main.addEventListener('scroll', function(){
    const root = main.querySelector('.overview-root');
    if(!root) return;
    const bar = root.querySelector('.topbar');
    if(!bar) return;
    const st = main.scrollTop;
    if(st > 140 && st > last + 4){ bar.classList.add('ov-hidden'); root.classList.add('ov-headhidden'); }
    else if(st < last - 4){ bar.classList.remove('ov-hidden'); root.classList.remove('ov-headhidden'); }
    last = st;
  }, {passive:true});
}

/* ─── Overlay helper ─── */
function closeSidebar(){
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('sidebarOverlay');
  if(sb) sb.classList.remove('open');
  if(ov) ov.classList.remove('show');
}

/* ─── Init ─── */
/* standard 100% scale on all displays — no zoom magnification */
function fitStage(){ try{ document.body.style.zoom = ''; }catch(e){} }
window.addEventListener('resize', fitStage);
fitStage();
window.addEventListener('hashchange', function(){
  closeSidebar();
  route();
});
window.addEventListener('DOMContentLoaded', function(){
  if(!location.hash) location.hash = 'portal';
  probeScraper();
  route();
  const ov=document.getElementById('sidebarOverlay');
  if(ov) ov.addEventListener('click', closeSidebar);
  document.addEventListener('click', function(e){
    const link=e.target.closest('.sidebar a');
    if(link) closeSidebar();
  });
  // global drag prevention
  document.addEventListener('dragover', e=>e.preventDefault());
  document.addEventListener('drop', e=>e.preventDefault());
});

})();
