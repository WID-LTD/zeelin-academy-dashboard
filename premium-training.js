/* ZEELIN Job Training Portal — premium shell enhancer.
   This file does not replace app.js. It preserves route logic and specialist workspaces. */
(function(){
  'use strict';

  const CDN = [
    'https://images.unsplash.com/photo-1652971422886-784758cc28d7?auto=format&fit=crop&w=1600&q=86',
    'https://images.unsplash.com/photo-1778489769184-45868633c527?auto=format&fit=crop&w=1600&q=86',
    'https://images.unsplash.com/photo-1654262609484-76d1a8f3b016?auto=format&fit=crop&w=1600&q=86',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=86',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=86',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=86'
  ];
  const ROUTE_CLASSES = [
    'home','day','checkin','book','videos','watch','visual','profile','accountability',
    'roadmap','board','guide','community','calendar','recordings','support','aluminal','monday'
  ];
  const SPECIALIST_ROUTES = new Set([
    'book','visual','calendar','recordings','support','community','profile','accountability',
    'guide','board','monday','aluminal','videos','roadmap','checkin','watch'
  ]);

  function currentRoute(){
    const raw = String(location.hash || '').replace(/^#\/?/, '');
    return (raw.split('/')[0] || 'home').toLowerCase();
  }

  function svgIcon(name){
    const paths = {
      search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
      thumbs:'<path d="M7 21H3V9h4v12Zm0-10 5-8c1.5 0 2.3 1 2 2.3L13.5 9H20c1.2 0 2 .9 1.7 2.1l-2 8c-.2 1-1 1.9-2.1 1.9H7Z"/>',
      chat:'<path d="M4 4h16v13H8l-4 4z"/><path d="M8 9h8M8 13h5"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      book:'<path d="M3 5c4-2 7-1 9 1v15c-2-2-5-3-9-1zM21 5c-4-2-7-1-9 1v15c2-2 5-3 9-1z"/>'
    };
    const p = paths[name] || paths.search;
    return '<span class="premium-inline-icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg></span>';
  }

  function setRouteClass(route){
    document.body.classList.add('premium-training');
    ROUTE_CLASSES.forEach(r=>document.body.classList.remove('premium-route-'+r));
    document.body.classList.add('premium-route-'+route);
    document.body.classList.toggle('premium-specialist-workspace', SPECIALIST_ROUTES.has(route));
  }

  function enhanceTopbar(){ return; }
  function enhanceSidebar(){ return; }
  function course(){
    try{
      if(typeof COURSES !== 'undefined' && COURSES && COURSES.length) return COURSES[0];
    }catch(_){}
    return {
      title:'Business Analysis Foundation',weekName:'Foundations',cohort:'Cohort 001',
      progress:45,completedHours:14,estimatedHours:34,readiness:18,daysLeft:2
    };
  }

  function stateDone(){
    const out={roadmap:false,reading:false,video:false,deck:false};
    try{
      const d = typeof STATE !== 'undefined' ? STATE.day : 1;
      if(typeof flatChapters === 'function'){
        const flat=flatChapters();
        out.roadmap=flat.length>0 && flat.every(r=>STATE.done[r.bookId] && STATE.done[r.bookId][r.idx]);
      }
      if(typeof dayReadingHref === 'function'){
        const h=dayReadingHref(d).split('/');
        out.reading=!!(STATE.done[h[2]] && STATE.done[h[2]][Number(h[3])]);
      }
      if(typeof VIDEOS !== 'undefined'){
        const vids=VIDEOS.filter(v=>v.day===d);
        out.video=vids.length>0 && vids.every(v=>STATE.doneVideo[v.id]);
      }
      if(typeof deckIdForDay === 'function') out.deck=!!STATE.doneDeck[deckIdForDay(d)];
    }catch(_){}
    return out;
  }

  function railHTML(){
    const c=course();
    const done=stateDone();
    const progress=Math.max(0,Math.min(100,Number(c.progress)||45));
    const hours=(Number(c.completedHours)||14)+' of '+(Number(c.estimatedHours)||34)+'h';
    let events=[];
    try{
      if(typeof CALENDAR_EVENTS !== 'undefined') events=CALENDAR_EVENTS.slice(0,2);
    }catch(_){}
    if(!events.length){
      events=[
        {date:4,month:8,title:'Live Workshop: Effective Communication & Study Balance',meta:'4:00 PM — 5:00 PM · Live on Zoom'},
        {date:8,month:8,title:'Cohort 001 Weekly Q&A and Check-in',meta:'2:00 PM — 3:00 PM · Live on Zoom'}
      ];
    }
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const check=(label,kind)=>{
      const cls=kind===true?' done':kind==='now'?' now':'';
      const mark=kind===true?'✓':kind==='now'?'1':'';
      return '<div class="premium-check"><span class="premium-box'+cls+'">'+mark+'</span>'+label+'</div>';
    };
    return '<section class="premium-rail-card">'
      +'<div class="premium-rail-top"><span>COURSE PROGRESS</span><a href="#/profile">View details</a></div>'
      +'<h2>'+c.title+'</h2><div class="premium-rail-sub">'+(c.weekName||'Foundations')+' · '+(c.cohort||'Cohort 001')+'</div>'
      +'<div class="premium-rail-progress"><div class="premium-rail-ring" style="background:conic-gradient(#d99a0a 0 '+progress+'%,#e6edf4 '+progress+'% 100%)"><div><b>'+progress+'%</b><span>Complete</span></div></div>'
      +'<div class="premium-rail-copy"><strong>'+hours+'</strong><div class="premium-rail-bar"><i style="width:'+progress+'%"></i></div><p>'+(c.readiness||18)+'% readiness · '+(c.daysLeft||2)+' days left in the current course window.</p></div></div>'
      +'<div class="premium-checks">'
      +check('Day 1 — Foundations','now')
      +check('Reading roadmap',done.roadmap)
      +check('Daily reading',done.reading)
      +check('Video tutorial',done.video)
      +check('Visual summary',done.deck)
      +check('Accountability report',false)
      +'</div></section>'
      +'<section class="premium-rail-card premium-upcoming"><h3>Upcoming Live Events</h3>'
      +events.map(e=>'<div class="premium-event"><div class="premium-date"><b>'+String(e.date).padStart(2,'0')+'</b><span>'+months[(e.month||8)-1]+'</span></div><div><strong>'+e.title+'</strong><p>'+e.meta+'</p></div></div>').join('')
      +'</section>'
      +'<section class="premium-motivation"><h3>Keep Building Your Career Skills</h3><p>Every completed lesson strengthens the confidence, structure and practical knowledge you take into the job market.</p></section>';
  }

  function manageRail(route){
    const row=document.querySelector('.shell-row');
    const content=document.querySelector('.shell-row > .content');
    if(!row || !content) return;
    let rail=document.getElementById('premiumContextRail');
    const show=route==='day';
    document.body.classList.toggle('has-premium-rail',show);
    if(!show){
      if(rail) rail.remove();
      return;
    }
    if(!rail){
      rail=document.createElement('aside');
      rail.id='premiumContextRail';
      rail.className='premium-context-rail';
      row.appendChild(rail);
    }
    rail.innerHTML=railHTML();
  }

  function replaceLegacyStockImages(route){
    const page=document.getElementById('page');
    if(!page) return;
    const imgs=Array.from(page.querySelectorAll('img'));
    let i=0;
    imgs.forEach(img=>{
      const raw=img.getAttribute('src')||'';
      if(!raw.includes('assets/stock/')) return;
      const index=(i + (
        route==='support'?1:
        route==='aluminal'?2:
        route==='recordings'?3:
        route==='monday'?4:
        route==='guide'?5:0
      ))%CDN.length;
      img.src=CDN[index];
      img.classList.add('premium-cdn-image');
      img.referrerPolicy='no-referrer';
      i++;
    });
  }

  function replaceEmojiUI(){
    const page=document.getElementById('page');
    if(!page) return;
    page.querySelectorAll('span').forEach(el=>{
      const t=el.textContent||'';
      if(t.includes('👍')){
        const clean=t.replace(/👍/g,'').trim();
        el.innerHTML=svgIcon('thumbs')+clean;
      }else if(t.includes('💬')){
        const clean=t.replace(/💬/g,'').trim();
        el.innerHTML=svgIcon('chat')+clean;
      }
    });
  }

  function enhanceDayContent(){
    const route=currentRoute();
    if(route!=='day') return;
    let day=1;
    try{day=Number(STATE.day)||1}catch(_){}
    if(day!==1) return;
    /* The underlying dashboard already supplies the requested Day 1 blocks.
       These labels guarantee the full approved wording remains visible in a fresh state. */
    const cards=Array.from(document.querySelectorAll('#page .p-card'));
    const byTitle={};
    cards.forEach(card=>{
      const title=card.querySelector('.pt-title');
      if(title) byTitle[title.textContent.trim()]=card;
    });
    const required=[
      ['Attendance & Personal Check-In','Complete the blocks to claim +500 XP','Check In'],
      ['Daily Structured Reading Roadmap','0 of 20 chapters cleared — unified index','Open Roadmap'],
      ['Daily Reading Material','Chapter 1 of 20 — The Role of the Business Analyst','Start Reading'],
      ['Video Tutorial','0 of 2 videos watched','Continue Video'],
      ['Visual Summary — Pitch Deck','The BA Toolkit deck, ready to flip through','View Deck'],
      ['Calendar','2 live events scheduled','View Calendar'],
      ['Accountability Check-In','Weekly breakdown & study-hours report','Submit Report']
    ];
    let isFresh=true;
    try{
      const anyDone=Object.values(STATE.done||{}).some(a=>Array.isArray(a)&&a.some(Boolean));
      const anyVideo=Object.values(STATE.doneVideo||{}).some(Boolean);
      const anyDeck=Object.values(STATE.doneDeck||{}).some(Boolean);
      isFresh=!anyDone&&!anyVideo&&!anyDeck&&!claimedToday();
    }catch(_){}
    if(!isFresh) return;
    required.forEach(([title,sub,button])=>{
      const card=byTitle[title];
      if(!card) return;
      const st=card.querySelector('.pt-sub');
      const bt=card.querySelector('.p-foot .btn');
      if(st) st.textContent=sub;
      if(bt) bt.childNodes.forEach(n=>{ if(n.nodeType===3 && n.textContent.trim()) n.textContent=button+' '; });
    });
  }

  function enhance(){
    const route=currentRoute();
    setRouteClass(route);
    enhanceTopbar();
    enhanceSidebar();
    manageRail(route);
    replaceLegacyStockImages(route);
    replaceEmojiUI();
    enhanceDayContent();
  }

  let scheduled=false;
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enhance();});
  }

  window.addEventListener('hashchange',schedule);
  window.addEventListener('load',schedule);
  document.addEventListener('DOMContentLoaded',schedule);

  const page=document.getElementById('page');
  const top=document.getElementById('topbar');
  const side=document.getElementById('sidebar');
  [page,top,side].filter(Boolean).forEach(node=>{
    new MutationObserver(schedule).observe(node,{childList:true,subtree:false});
  });

  schedule();
})();

/* Premium V3 micro-composition */
(function(){
  function refinePremiumChrome(){ return; }
  function refinePageSemantics(){
    const page=document.getElementById('page');
    if(!page) return;
    const h1=page.querySelector('h1');
    if(h1 && !h1.id) h1.id='pageTitle';
    page.setAttribute('aria-labelledby',h1?'pageTitle':'');
    page.querySelectorAll('img').forEach(img=>{
      if(!img.loading) img.loading='lazy';
      if(!img.decoding) img.decoding='async';
    });
  }
  const run=()=>{refinePremiumChrome();refinePageSemantics();};
  window.addEventListener('hashchange',()=>requestAnimationFrame(run));
  window.addEventListener('load',run);
  const p=document.getElementById('page');
  const t=document.getElementById('topbar');
  [p,t].filter(Boolean).forEach(el=>new MutationObserver(()=>requestAnimationFrame(run)).observe(el,{childList:true,subtree:false}));
  run();
})();

/* ============================================================
   PREMIUM V4 — PROFILE MENU + PLATFORM MICRO-INTERACTIONS
   ============================================================ */
(function(){
  'use strict';

  const menuIcon = {
    user:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"/>',
    check:'<path d="M9 11 12 14 20 6"/><path d="M20 12a8 8 0 1 1-5-7.4"/>',
    chart:'<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.6 2.6 0 1 1 4.3 2c-1.4 1-1.9 1.5-1.9 3M12 17.5h.01"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>'
  };
  const mi=(name)=>'<span class="profile-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+menuIcon[name]+'</svg></span>';

  function getProfileMenu(){
    let menu=document.getElementById('premiumProfileMenu');
    if(menu) return menu;
    menu=document.createElement('div');
    menu.id='premiumProfileMenu';
    menu.className='premium-profile-menu';
    menu.setAttribute('role','menu');
    menu.setAttribute('aria-label','Account menu');
    menu.innerHTML=
      '<div class="profile-menu-head">'
        +'<img src="assets/avatar_1.png" alt="" class="profile-menu-avatar">'
        +'<div><strong>John Doe</strong><span>Job Training Learner</span></div>'
      +'</div>'
      +'<div class="profile-menu-stats">'
        +'<span><b>2,950</b><small>XP</small></span>'
        +'<span><b>5</b><small>Day streak</small></span>'
      +'</div>'
      +'<div class="profile-menu-group">'
        +'<button type="button" role="menuitem" data-profile-nav="/profile">'+mi('user')+'<span><b>Profile &amp; Insights</b><small>Progress, skills and readiness</small></span>'+mi('chevron')+'</button>'
        +'<button type="button" role="menuitem" data-profile-nav="/checkin">'+mi('check')+'<span><b>Personal Check-In</b><small>Daily routine and XP claim</small></span>'+mi('chevron')+'</button>'
        +'<button type="button" role="menuitem" data-profile-nav="/accountability">'+mi('chart')+'<span><b>Accountability</b><small>Weekly learning report</small></span>'+mi('chevron')+'</button>'
        +'<button type="button" role="menuitem" data-profile-nav="/support">'+mi('help')+'<span><b>Support</b><small>Help centre and resources</small></span>'+mi('chevron')+'</button>'
      +'</div>'
      +'<div class="profile-menu-foot">'
        +'<a href="/portal.html" role="menuitem">'+mi('layers')+'<span><b>Switch Portal</b><small>Return to Zeelin portals</small></span>'+mi('chevron')+'</a>'
      +'</div>';
    document.body.appendChild(menu);

    menu.addEventListener('click',e=>{
      const item=e.target.closest('[data-profile-nav]');
      if(item){
        closeProfileMenu();
        location.hash=item.dataset.profileNav;
      }
    });
    return menu;
  }

  function positionProfileMenu(){
    const btn=document.querySelector('.profile-btn');
    const menu=document.getElementById('premiumProfileMenu');
    if(!btn||!menu||!menu.classList.contains('open')) return;
    const r=btn.getBoundingClientRect();
    const w=Math.min(340,window.innerWidth-24);
    const left=Math.max(12,Math.min(window.innerWidth-w-12,r.right-w));
    menu.style.width=w+'px';
    menu.style.left=left+'px';
    menu.style.top=Math.round(r.bottom+10)+'px';
  }

  function openProfileMenu(){
    const btn=document.querySelector('.profile-btn');
    if(!btn) return;
    const menu=getProfileMenu();
    menu.classList.add('open');
    btn.classList.add('menu-open');
    btn.setAttribute('aria-expanded','true');
    btn.setAttribute('aria-haspopup','menu');
    positionProfileMenu();
    requestAnimationFrame(()=>menu.querySelector('[role="menuitem"]')?.focus({preventScroll:true}));
  }

  function closeProfileMenu(){
    const btn=document.querySelector('.profile-btn');
    const menu=document.getElementById('premiumProfileMenu');
    if(menu) menu.classList.remove('open');
    if(btn){
      btn.classList.remove('menu-open');
      btn.setAttribute('aria-expanded','false');
    }
  }

  function toggleProfileMenu(){
    const menu=getProfileMenu();
    if(menu.classList.contains('open')) closeProfileMenu();
    else openProfileMenu();
  }

  /* Capture before app.js's direct data-go profile handler. */
  document.addEventListener('click',function(e){
    const btn=e.target.closest && e.target.closest('.profile-btn');
    if(btn){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleProfileMenu();
      return;
    }
    const menu=e.target.closest && e.target.closest('#premiumProfileMenu');
    if(!menu) closeProfileMenu();
  },true);

  document.addEventListener('keydown',function(e){
    const menu=document.getElementById('premiumProfileMenu');
    if(!menu||!menu.classList.contains('open')) return;
    if(e.key==='Escape'){
      e.preventDefault();
      closeProfileMenu();
      document.querySelector('.profile-btn')?.focus();
      return;
    }
    const items=[...menu.querySelectorAll('[role="menuitem"]')];
    const idx=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){
      e.preventDefault();
      (items[(idx+1+items.length)%items.length]||items[0])?.focus();
    }else if(e.key==='ArrowUp'){
      e.preventDefault();
      (items[(idx-1+items.length)%items.length]||items.at(-1))?.focus();
    }
  });

  window.addEventListener('resize',positionProfileMenu,{passive:true});
  window.addEventListener('scroll',positionProfileMenu,{passive:true,capture:true});
  window.addEventListener('hashchange',closeProfileMenu);

  /* Re-apply ARIA every time app.js recreates the topbar. */
  const top=document.getElementById('topbar');
  if(top){
    new MutationObserver(()=>{
      const btn=top.querySelector('.profile-btn');
      if(btn){
        btn.setAttribute('aria-haspopup','menu');
        btn.setAttribute('aria-expanded','false');
        btn.setAttribute('title','Open account menu');
      }
    }).observe(top,{childList:true});
  }
})();


/* ============================================================
   PREMIUM V5 — ACQUISITION-MATCHED SHELL + ROUTE TOP NAV
   ============================================================ */
(function(){
  'use strict';

  const routeMeta={
    home:{title:'Training Dashboard',sub:'Your active learning programme',action:'Continue',href:'/day'},
    day:{title:'Day 1 · Foundations',sub:'Structured learning day',action:'Roadmap',href:'/roadmap'},
    checkin:{title:'Personal Check-In',sub:'Daily routine · +500 XP',action:'Day Overview',href:'/day'},
    roadmap:{title:'Reading Roadmap',sub:'20 chapters · unified index',action:'Start Reading',href:'/book/foundation/0'},
    book:{title:'Daily Reading',sub:'Foundation in Business Analysis Practice',action:'Roadmap',href:'/roadmap'},
    videos:{title:'Video Tutorials',sub:'Expert walkthroughs',action:'Day Overview',href:'/day'},
    watch:{title:'Video Learning',sub:'Focused tutorial workspace',action:'All Videos',href:'/videos'},
    visual:{title:'Visual Summary',sub:'Pitch deck learning',action:'Videos',href:'/videos'},
    calendar:{title:'Learning Calendar',sub:'Live workshops & Q&A',action:'Recordings',href:'/recordings'},
    accountability:{title:'Accountability',sub:'Weekly learning report',action:'Profile',href:'/profile'},
    profile:{title:'Profile & Insights',sub:'Progress, readiness & skills',action:'Accountability',href:'/accountability'},
    guide:{title:'User Guide',sub:'Portal orientation',action:'Dashboard',href:'/'},
    board:{title:'Message Board',sub:'Official announcements',action:'Community',href:'/community'},
    community:{title:'Community',sub:'Cohort discussion',action:'Message Board',href:'/board'},
    monday:{title:'Monday Motivations',sub:'Weekly focus & momentum',action:'Dashboard',href:'/'},
    recordings:{title:'Recordings',sub:'Workshops & event archive',action:'Calendar',href:'/calendar'},
    support:{title:'Help & Support',sub:'Learner help centre',action:'User Guide',href:'/guide'},
    aluminal:{title:'Aluminal',sub:'Graduate membership',action:'Profile',href:'/profile'}
  };

  function route(){
    const raw=String(location.hash||'').replace(/^#\/?/,'');
    return (raw.split('/')[0]||'home').toLowerCase();
  }
  function goRoute(href){
    if(href==='/'){location.hash='';}
    else location.hash=href;
  }
  function navSvg(name){
    const p={
      menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
      arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>'
    }[name]||'';
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
  }

  function ensureSidebarBrand(){
    const sidebar=document.getElementById('sidebar');
    if(!sidebar) return;
    let brand=sidebar.querySelector('.training-acq-brand');
    if(!brand){
      brand=document.createElement('div');
      brand.className='training-acq-brand';
      brand.innerHTML='<img decoding="async" fetchpriority="high" src="assets/logo.png" alt="Zeelin Academy Logo">';
      sidebar.insertBefore(brand,sidebar.firstChild);
    }
    const legacyTitle=[...sidebar.children].find(el=>el!==brand && el.textContent && el.textContent.includes('ZEELIN JOB READINESS SYSTEM'));
    if(legacyTitle) legacyTitle.classList.add('training-system-title');
  }

  function removeTopbarLogo(){
    const top=document.getElementById('topbar');
    if(!top) return;
    [...top.children].forEach(el=>{
      const img=el.querySelector && el.querySelector('img[src*="assets/logo.png"]');
      if(img) el.remove();
    });
  }

  function ensureMenuMark(){
    const top=document.getElementById('topbar');
    if(!top || top.querySelector('.training-top-menu')) return;
    const b=document.createElement('button');
    b.type='button';
    b.className='training-top-menu';
    b.setAttribute('aria-label','Training dashboard');
    b.innerHTML=navSvg('menu');
    b.addEventListener('click',()=>goRoute('/'));
    const search=top.querySelector('.premium-search');
    top.insertBefore(b,search||top.firstChild);
  }

  function pageSpecificText(r){
    const meta={...(routeMeta[r]||routeMeta.home)};
    try{
      if(r==='day' && typeof STATE!=='undefined'){
        const d=Number(STATE.day)||1;
        meta.title='Day '+d+' · '+((typeof dayCard==='function'&&dayCard(d).title)||'Foundations');
        meta.sub='Structured learning day';
      }
      if(r==='book'){
        const parts=String(location.hash).replace(/^#\/?/,'').split('/');
        const n=Number(parts[2]||0)+1;
        meta.sub='Chapter '+n+' · Foundation in Business Analysis Practice';
      }
      if(r==='visual'){
        const page=document.getElementById('page');
        const progress=page?.textContent?.match(/Slide\s+(\d+)\s+of\s+(\d+)/i);
        if(progress) meta.sub='Slide '+progress[1]+' of '+progress[2]+' · Pitch deck';
      }
      if(r==='videos'){
        const page=document.getElementById('page');
        const m=page?.textContent?.match(/(\d+)\s+of\s+(\d+)\s+Watched/i);
        if(m) meta.sub=m[1]+' of '+m[2]+' watched';
      }
      if(r==='calendar') meta.sub='August 2026 · 2 live events';
    }catch(_){}
    return meta;
  }

  function ensureRouteNav(){
    const top=document.getElementById('topbar');
    if(!top) return;
    let box=top.querySelector('.training-route-nav');
    if(!box){
      box=document.createElement('div');
      box.className='training-route-nav';
      const actions=top.querySelector('.top-actions');
      top.insertBefore(box,actions||null);
    }
    const r=route();
    const m=pageSpecificText(r);
    box.innerHTML=
      '<div class="training-route-copy"><strong>'+m.title+'</strong><span>'+m.sub+'</span></div>'
      +(m.action?'<button type="button" class="training-route-action">'+m.action+navSvg('arrow')+'</button>':'');
    const action=box.querySelector('.training-route-action');
    if(action) action.onclick=()=>goRoute(m.href);
  }

  function acquisitionTopbar(){
    const top=document.getElementById('topbar');
    if(!top) return;
    removeTopbarLogo();
    ensureMenuMark();
    ensureRouteNav();
    const old=top.querySelector('.premium-title-lockup');
    if(old) old.remove();
  }

  function apply(){
    ensureSidebarBrand();
    acquisitionTopbar();
  }

  window.addEventListener('hashchange',()=>requestAnimationFrame(apply));
  window.addEventListener('load',apply);
  document.addEventListener('DOMContentLoaded',apply);
  const top=document.getElementById('topbar');
  const side=document.getElementById('sidebar');
  const page=document.getElementById('page');
  [top,side,page].filter(Boolean).forEach(el=>{
    new MutationObserver(()=>requestAnimationFrame(apply)).observe(el,{childList:true,subtree:false});
  });
  apply();
})();


/* ============================================================
   PREMIUM V6 — TRAINING SUPPORT CENTRE
   Acquisition-inspired layout; training SUPPORT content preserved.
   ============================================================ */
(function(){
  'use strict';

  const escText=(v)=>String(v??'').replace(/[&<>"']/g,s=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));

  function route(){
    return String(location.hash||'').replace(/^#\/?/,'').split('/')[0]||'home';
  }

  function supportData(){
    try{return SUPPORT;}catch(_){return null;}
  }

  function faqHtml(items){
    return items.map((f,i)=>
      '<article class="ts-faq" data-support-faq>'
      +'<button type="button" class="ts-faq-q" aria-expanded="false">'
      +'<span>'+escText(f.q)+'</span><span class="ts-faq-plus" aria-hidden="true">+</span>'
      +'</button>'
      +'<div class="ts-faq-a">'+escText(f.a)+'</div>'
      +'</article>'
    ).join('');
  }

  function cardHtml(c,index){
    const tones=['gold','blue','green'];
    const labels=['SUPPORT','RESOURCES','ACCOUNT'];
    return '<article class="ts-support-card">'
      +'<div class="ts-card-image"><img loading="lazy" decoding="async" src="'+escText(c.image)+'" alt=""><span class="ts-card-label '+tones[index]+'">'+labels[index]+'</span></div>'
      +'<div class="ts-card-body"><h3>'+escText(c.title)+'</h3><p>'+escText(c.body)+'</p>'
      +'<div class="ts-card-foot"><span>'+escText(c.foot?.who||'Zeelin Academy')+'</span>'
      +'<button type="button" class="ts-card-open" data-support-card="'+escText(c.id)+'">Open <span aria-hidden="true">→</span></button>'
      +'</div></div></article>';
  }

  function renderSupportPremium(){
    if(route()!=='support') return;
    const page=document.getElementById('page');
    const data=supportData();
    if(!page||!data) return;
    if(page.querySelector('.training-support-premium')) return;

    const manage=(data.manage||[]).map((x,i)=>
      '<button type="button" class="ts-manage-item" data-support-manage="'+i+'"><span class="ts-manage-num">'+String(i+1).padStart(2,'0')+'</span><span>'+escText(x)+'</span><span class="ts-manage-arrow">→</span></button>'
    ).join('');

    page.innerHTML=
      '<div class="training-support-premium">'
      +'<main class="ts-support-main"><div class="ts-support-inner">'
      +'<section class="ts-support-hero">'
      +'<div class="ts-support-eyebrow">HELP CENTRE</div>'
      +'<h1>'+escText(data.hero.title)+'</h1>'
      +'<p>'+escText(data.hero.body)+'</p>'
      +'<label class="ts-support-search"><span class="ts-search-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg></span><input type="search" placeholder="What can we help you with?" aria-label="Search support"></label>'
      +'</section>'
      +'<section class="ts-support-grid">'+data.cards.map(cardHtml).join('')+'</section>'
      +'<section class="ts-section" id="trainingSupportFaq">'
      +'<div class="ts-section-head"><div><span>QUICK ANSWERS</span><h2>Frequently Asked Questions</h2><p>Find answers for common training, quiz, video, XP and streak questions.</p></div><span class="ts-section-pill">HELP CENTRE</span></div>'
      +'<div class="ts-faq-list">'+faqHtml(data.faqs||[])+'</div>'
      +'</section>'
      +'<section class="ts-section" id="trainingSupportAccount">'
      +'<div class="ts-section-head"><div><span>ACCOUNT</span><h2>Manage Account &amp; Membership</h2><p>Choose the account action you need help with.</p></div></div>'
      +'<div class="ts-manage-grid">'
      +'<article class="ts-manage-panel"><div class="ts-manage-list">'+manage+'</div></article>'
      +'<article class="ts-direct-card"><span>DIRECT ASSISTANCE</span><h3>Need help from the ZEELIN team?</h3><p>Send the support team a clear description of the issue and the area of the training portal you were using.</p><button type="button" class="ts-primary-btn" data-support-contact>Open Support Request</button></article>'
      +'</div></section>'
      +'</div></main>'
      +'<aside class="ts-support-side">'
      +'<section class="ts-side-card"><span class="ts-side-label">SUPPORT TEAM</span><h3>Zeelin Academy Support</h3><p>Help with portal access, course navigation, learning activities, account issues and training workflows.</p>'
      +'<div class="ts-team"><div class="ts-team-avatar">ZA</div><div><strong>Zeelin Admin | Support Team</strong><span>Course &amp; Learner Support</span></div></div>'
      +'<div class="ts-online"><i></i> Support channel available</div>'
      +'<button type="button" class="ts-primary-btn" data-support-contact>Contact Support</button></section>'
      +'<section class="ts-side-card"><span class="ts-side-label">QUICK HELP</span><h3>Jump to a support area</h3>'
      +'<nav class="ts-quick-links"><button type="button" data-support-scroll="trainingSupportFaq">Frequently Asked Questions <span>→</span></button><button type="button" data-support-scroll="trainingSupportAccount">Account &amp; Billing <span>→</span></button><button type="button" data-support-guide>Knowledge Bank &amp; Guides <span>→</span></button></nav></section>'
      +'<section class="ts-side-card ts-side-image"><div><span class="ts-side-label">NEED MORE HELP?</span><h3>Open a support request</h3><p>Tell us what happened, where it happened, and what you expected to see.</p><button type="button" class="ts-primary-btn" data-support-contact>Create Request →</button></div></section>'
      +'</aside>'
      +'</div>'
      +'<div class="ts-support-modal" id="trainingSupportModal" aria-hidden="true"><div class="ts-modal-card" role="dialog" aria-modal="true" aria-labelledby="trainingSupportModalTitle">'
      +'<div class="ts-modal-head"><div><span>ZEELIN SUPPORT</span><h3 id="trainingSupportModalTitle">Open Support Request</h3></div><button type="button" aria-label="Close support request" data-support-close>×</button></div>'
      +'<div class="ts-modal-body"><label>SUPPORT AREA<select><option>Job Training Portal</option><option>Course Content</option><option>Personal Check-In</option><option>Videos &amp; Recordings</option><option>Account &amp; Billing</option></select></label><label>SUBJECT<input type="text" placeholder="Brief description of the issue"></label><label>MESSAGE<textarea placeholder="Tell us what happened and what you need help with."></textarea></label><div class="ts-modal-actions"><button type="button" class="ts-secondary-btn" data-support-close>Cancel</button><button type="button" class="ts-primary-btn" data-support-submit>Submit Request</button></div></div>'
      +'</div></div>';

    const search=page.querySelector('.ts-support-search input');
    search?.addEventListener('input',()=>{
      const q=search.value.trim().toLowerCase();
      page.querySelectorAll('[data-support-faq]').forEach(item=>{
        item.hidden=!!q && !item.textContent.toLowerCase().includes(q);
      });
    });

    page.querySelectorAll('.ts-faq-q').forEach(btn=>btn.addEventListener('click',()=>{
      const item=btn.closest('.ts-faq');
      const open=item.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    }));

    page.querySelectorAll('[data-support-card]').forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.dataset.supportCard;
      const target=id==='faq'?'trainingSupportFaq':id==='billing'?'trainingSupportAccount':null;
      if(target) document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'});
      else location.hash='/guide';
    }));
    page.querySelectorAll('[data-support-scroll]').forEach(btn=>btn.addEventListener('click',()=>{
      document.getElementById(btn.dataset.supportScroll)?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    page.querySelectorAll('[data-support-guide]').forEach(btn=>btn.addEventListener('click',()=>{location.hash='/guide'}));

    const modal=page.querySelector('#trainingSupportModal');
    const openModal=()=>{
      modal?.classList.add('open');
      modal?.setAttribute('aria-hidden','false');
      modal?.querySelector('input')?.focus();
    };
    const closeModal=()=>{
      modal?.classList.remove('open');
      modal?.setAttribute('aria-hidden','true');
    };
    page.querySelectorAll('[data-support-contact]').forEach(btn=>btn.addEventListener('click',openModal));
    page.querySelectorAll('[data-support-close]').forEach(btn=>btn.addEventListener('click',closeModal));
    modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
    page.querySelector('[data-support-submit]')?.addEventListener('click',()=>{
      closeModal();
      if(typeof showToast==='function') showToast('Support request prepared.');
    });
  }

  const run=()=>requestAnimationFrame(renderSupportPremium);
  window.addEventListener('hashchange',run);
  window.addEventListener('load',run);
  const page=document.getElementById('page');
  if(page)new MutationObserver(run).observe(page,{childList:true,subtree:false});
  run();
})();
