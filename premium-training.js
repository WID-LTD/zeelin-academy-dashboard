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

  function enhanceTopbar(){
    const top = document.getElementById('topbar');
    if(!top) return;
    if(!top.querySelector('.premium-search')){
      const label = document.createElement('label');
      label.className = 'premium-search';
      label.innerHTML = svgIcon('search')+'<input type="search" aria-label="Search training portal" placeholder="Search courses, chapters, resources...">';
      const title = Array.from(top.children).find(el => el.style && String(el.style.cssText).includes('justify-content: center'));
      if(title) top.insertBefore(label,title); else top.insertBefore(label,top.querySelector('.top-actions'));
      const input = label.querySelector('input');
      input.addEventListener('keydown', function(e){
        if(e.key !== 'Enter') return;
        const q = input.value.trim().toLowerCase();
        if(!q) return;
        if(q.includes('roadmap') || q.includes('chapter')) location.hash='/roadmap';
        else if(q.includes('video')) location.hash='/videos';
        else if(q.includes('calendar') || q.includes('event')) location.hash='/calendar';
        else if(q.includes('record')) location.hash='/recordings';
        else if(q.includes('support') || q.includes('help')) location.hash='/support';
        else if(q.includes('community')) location.hash='/community';
        else if(q.includes('profile') || q.includes('insight')) location.hash='/profile';
        else if(q.includes('account')) location.hash='/accountability';
        else location.hash='/day';
      });
    }
  }

  function enhanceSidebar(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    const wrap = sidebar.children[1];
    if(wrap && !wrap.querySelector('.premium-sidebar-motto')){
      const box = document.createElement('div');
      box.className = 'premium-sidebar-motto';
      box.innerHTML = '<strong>Build Skills. Build Confidence. Get Job Ready.</strong><i></i>';
      wrap.appendChild(box);
    }
  }

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
  function refinePremiumChrome(){
    const top=document.getElementById('topbar');
    if(top){
      const titleBox=Array.from(top.children).find(el=>el.style && String(el.style.cssText).includes('justify-content: center'));
      if(titleBox && !titleBox.classList.contains('premium-title-lockup')){
        titleBox.classList.add('premium-title-lockup');
        const span=titleBox.querySelector('span');
        if(span && span.textContent.trim()==='ZEELIN JOB TRAINING PORTAL'){
          span.innerHTML='<b>ZEELIN</b><small>JOB TRAINING PORTAL</small>';
        }
      }
    }
    const sidebar=document.getElementById('sidebar');
    if(sidebar){
      const active=sidebar.querySelector('a[style*="background-color:#262626"],a[style*="background-color: #262626"],a[style*="background-color:#2a2218"],a[style*="background-color: #2a2218"]');
      sidebar.querySelectorAll('a[aria-current]').forEach(a=>a.removeAttribute('aria-current'));
      if(active) active.setAttribute('aria-current','page');
    }
  }
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
