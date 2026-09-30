
/* Zeelin portal finishing enhancer */
(function(){
  'use strict';
  const images={
    board:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=86',
    community:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=86',
    calendar:'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1800&q=86',
    profile:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=86',
    support:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=86'
  };
  const supportImgs=[
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=84'
  ];
  const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('/')[0]||'home';
  function banner(kind,title,body,label){
    const el=document.createElement('section');
    el.className='zf-route-banner';
    el.innerHTML='<img src="'+images[kind]+'" alt="" loading="eager" decoding="async"><div><span>'+label+'</span><h2>'+title+'</h2><p>'+body+'</p></div>';
    return el;
  }
  function enhanceFeed(){
    const r=route(), shell=r==='board'?document.querySelector('.legacy-board-shell'):r==='community'?document.querySelector('.legacy-community-shell'):null;
    if(!shell||shell.querySelector(':scope > .zf-route-banner'))return;
    if(r==='board') shell.prepend(banner('board','Official updates, presented clearly.','Announcements, schedule updates and important cohort information from the Zeelin Academy team.','GENERAL MESSAGE BOARD'));
    else shell.prepend(banner('community','One community. One continuous conversation.','Share study strategies, ask practical questions and learn alongside your cohort without breaking the original community flow.','GENERAL COMMUNITY'));
  }
  function enhanceCalendar(){
    const shell=document.querySelector('.training-calendar-shell');
    if(!shell||shell.querySelector(':scope > .zf-route-banner'))return;
    shell.prepend(banner('calendar','Plan the learning week before it gets busy.','See live workshops, cohort sessions, Q&A events and the month ahead in one responsive schedule.','LIVE LEARNING CALENDAR'));
  }
  function enhanceProfile(){
    if(route()!=='profile')return;
    const page=document.getElementById('page'); if(!page)return;
    if(!page.querySelector(':scope > .zf-route-banner')) page.prepend(banner('profile','Your learning data should tell a useful story.','Track progress, study mix, strengths, readiness and the habits shaping your package journey.','PROFILE & INSIGHTS'));
    const panels=[...page.querySelectorAll('.xv-panel')];
    const study=panels.find(x=>/Study Breakdown/i.test(x.textContent||''));
    if(study&&!study.querySelector('.zf-study-plus')){
      study.classList.add('zf-study-breakdown-panel');
      const plus=document.createElement('div');
      plus.className='zf-study-plus';
      plus.innerHTML='<div class="zf-study-stat"><span>Primary activity</span><b>Reading · 55%</b><p>Your largest share of completed study activity.</p></div>'
        +'<div class="zf-study-stat"><span>Active learning</span><b>39%</b><p>Video and quiz activity combined.</p></div>'
        +'<div class="zf-study-stat"><span>Completion</span><b>78%</b><p>Current package study completion shown in this breakdown.</p></div>'
        +'<div class="zf-study-stat"><span>Remaining mix</span><b>22%</b><p>Continue the next available activities to close the gap.</p></div>'
        +'<div class="zf-study-note"><b>Study recommendation</b><p>Keep reading as the foundation, then pair each completed reading block with its related video or quiz so knowledge turns into recall and application.</p></div>';
      study.append(plus);
    }
  }
  function enhanceSupport(){
    if(route()!=='support')return;
    const hero=document.querySelector('.ts-support-hero.ts-support-hero-clean');
    if(hero&&!hero.querySelector('.zf-support-hero-media')){
      const f=document.createElement('figure');f.className='zf-support-hero-media';f.innerHTML='<img src="'+images.support+'" alt="Professional support team helping a learner" loading="eager" decoding="async">';hero.append(f);
    }
    document.querySelectorAll('.ts-route-card').forEach((card,i)=>{
      if(card.querySelector(':scope > .ts-card-stock'))return;
      const img=document.createElement('img');img.className='ts-card-stock';img.src=supportImgs[i%supportImgs.length];img.alt='';img.loading='lazy';img.decoding='async';card.prepend(img);
    });
    document.querySelectorAll('.ts-support-side>.ts-side-card').forEach((card,i)=>{
      if(card.querySelector(':scope > .ts-card-stock'))return;
      const img=document.createElement('img');img.className='ts-card-stock';img.src=supportImgs[(i+4)%supportImgs.length];img.alt='';img.loading='lazy';img.decoding='async';card.prepend(img);
    });
  }
  let queued=false;
  function run(){
    queued=false;
    try{enhanceFeed();enhanceCalendar();enhanceProfile();enhanceSupport();}catch(e){console.error('Portal finish enhancer',e)}
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(run)}
  window.addEventListener('hashchange',queue);
  window.addEventListener('load',queue);
  const page=document.getElementById('page'); if(page)new MutationObserver(queue).observe(page,{childList:true,subtree:true});
  queue();
})();
