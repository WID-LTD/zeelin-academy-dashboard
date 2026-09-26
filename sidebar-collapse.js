
(function(){
  'use strict';
  const KEY='zeelin_sidebar_collapsed:'+location.pathname;
  let collapsed=false;
  try{ collapsed=localStorage.getItem(KEY)==='1'; }catch(_){}

  function visibleSidebar(){
    const candidates=[
      document.querySelector('#sidebar'),
      document.querySelector('.overview-root .sidebar'),
      document.querySelector('.rb-sidebar')
    ].filter(Boolean);
    let best=null;
    for(const el of candidates){
      const cs=getComputedStyle(el);
      const r=el.getBoundingClientRect();
      if(cs.display!=='none' && cs.visibility!=='hidden' && r.width>20 && r.right>0){
        if(!best || r.width>best.getBoundingClientRect().width) best=el;
      }
    }
    return best;
  }

  function button(){
    let b=document.getElementById('sidebarCollapseControl');
    if(b) return b;
    b=document.createElement('button');
    b.id='sidebarCollapseControl';
    b.className='sidebar-collapse-control';
    b.type='button';
    b.setAttribute('aria-label','Collapse sidebar');
    b.setAttribute('title','Collapse sidebar');
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
    b.addEventListener('click',()=>{
      collapsed=!collapsed;
      try{localStorage.setItem(KEY,collapsed?'1':'0')}catch(_){}
      apply();
    });
    document.body.appendChild(b);
    return b;
  }

  function syncButton(){
    const b=button();
    if(window.innerWidth<1280){b.hidden=true;return;}
    const shell=document.getElementById('shell');
    const side=visibleSidebar();

    /* Training home deliberately has no sidebar. */
    if(shell && shell.classList.contains('hide-sidebar') && !document.querySelector('.overview-root .sidebar,.rb-sidebar')){
      b.hidden=true;return;
    }

    if(!collapsed && !side){b.hidden=true;return;}
    b.hidden=false;
    b.classList.toggle('is-collapsed',collapsed);
    b.setAttribute('aria-label',collapsed?'Expand sidebar':'Collapse sidebar');
    b.setAttribute('title',collapsed?'Expand sidebar':'Collapse sidebar');
    b.setAttribute('aria-expanded',collapsed?'false':'true');

    if(collapsed){
      b.style.left='12px';
    }else if(side){
      const r=side.getBoundingClientRect();
      b.style.left=Math.max(10,Math.round(r.right-19))+'px';
    }
  }

  function apply(){
    document.body.classList.toggle('zeelin-sidebar-collapsed',collapsed && window.innerWidth>=1280);
    syncButton();
    setTimeout(syncButton,40);
    setTimeout(()=>{
      syncButton();
      window.dispatchEvent(new Event('resize'));
    },320);
  }

  window.addEventListener('resize',apply,{passive:true});
  window.addEventListener('hashchange',()=>{setTimeout(apply,20);setTimeout(apply,180)});
  window.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(apply,180)});
  window.addEventListener('load',()=>{apply();setTimeout(apply,250)});

  const target=document.getElementById('main-content')||document.getElementById('page')||document.body;
  if(target && window.MutationObserver){
    const mo=new MutationObserver(()=>{clearTimeout(mo._t);mo._t=setTimeout(syncButton,40)});
    mo.observe(target,{childList:true,subtree:true});
  }

  apply();
})();
