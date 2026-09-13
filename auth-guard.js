/* Zeelin enterprise auth guard - glassmorphism fallback, anti-scraping */
(function(){
  // bypass for jsdom tests
  if (typeof window !== 'undefined' && window.__ZEELIN_BYPASS_AUTH) return;
  // inject glass style if lightbox needed later
  const STYLE_ID='zeelin-auth-guard-style';
  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
    .za-auth-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(10,10,10,.58);backdrop-filter:blur(22px) saturate(1.15);-webkit-backdrop-filter:blur(22px) saturate(1.15);animation:zaFade .2s ease}
    @keyframes zaFade{from{opacity:0}to{opacity:1}}
    .za-glass{width:440px;max-width:100%;background:rgba(24,24,24,.72);border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:28px;backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2);box-shadow:0 20px 70px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.06)}
    .za-glass h2{font-size:19px;font-weight:800;margin-bottom:8px}
    .za-glass p{color:#b5b5b5;font-size:13px;line-height:1.6;margin-bottom:16px}
    .za-field{position:relative;margin-bottom:12px}
    .za-field input{width:100%;padding:12px 42px 12px 14px;background:#0d0d0d;border:1px solid #2e2e2e;border-radius:11px;color:#fff;font:inherit;font-size:14px;outline:none}
    .za-field input:focus{border-color:#d97706}
    .za-btn{width:100%;padding:12px;border:none;border-radius:11px;font-weight:800;background:linear-gradient(90deg,#d97706,#f59e0b);color:#fff;cursor:pointer}
    .za-err{margin-top:10px;padding:9px 11px;border-radius:9px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#fca5a5;font-size:12px;display:none}
    .za-err.show{display:block}
    `;
    document.head.appendChild(s);
  }
  function showLightbox(nextUrl){
    if(document.getElementById('zaAuthOverlay')) return;
    ensureStyle();
    const ov=document.createElement('div');
    ov.id='zaAuthOverlay'; ov.className='za-auth-overlay';
    ov.innerHTML=`
      <div class="za-glass" role="dialog" aria-modal="true">
        <div style="font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#f59e0b;margin-bottom:8px;display:flex;align-items:center;gap:7px"><span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;box-shadow:0 0 10px rgba(245,158,11,.7)"></span> Secure Access</div>
        <h2>Session expired</h2>
        <p>Your 30-minute session has ended due to inactivity. Enter your password to continue securely.</p>
        <form id="zaForm" autocomplete="off" data-lpignore="true"><div class="za-field"><input id="zaPwd" type="password" placeholder="Password" autocomplete="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-form-type="other" required/></div><button type="submit" class="za-btn">Unlock</button><div class="za-err" id="zaErr"></div></form>
        <p style="margin-top:12px;font-size:11px;color:#6b6b6b;text-align:center">Protected • Anti-phishing • 30m sliding session</p>
      </div>`;
    document.body.appendChild(ov);
    const form=document.getElementById('zaForm'), input=document.getElementById('zaPwd'), err=document.getElementById('zaErr');
    input.focus();
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      err.classList.remove('show');
      const v=input.value.trim();
      if(!v){ err.textContent='Enter password'; err.classList.add('show'); return; }
      try{
        const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:v})});
        const j=await r.json().catch(function(){return {};});
        if(!r.ok){ err.textContent=j.error||'Invalid password'; err.classList.add('show'); return; }
        ov.remove();
        // reload to re-trigger server verify and get fresh portal/content
        location.reload();
      }catch(ex){ err.textContent='Network error'; err.classList.add('show'); }
    });
  }
  // intercept fetch 401 globally
  const origFetch = window.fetch;
  if(origFetch){
    window.fetch = async function(input, init){
      const res = await origFetch(input, init);
      if(res.status===401){
        let isAuth=false;
        try{ const ct=res.headers.get('content-type')||''; if(ct.includes('json')){ const clone=res.clone(); const j=await clone.json(); if(j.needAuth||j.error&&j.error.toLowerCase().includes('session')) isAuth=true; }}catch{}
        // also check if request was to page-like (html) - show lightbox
        if(isAuth || (typeof input==='string' && input.includes('/api/'))){
          // avoid loop for login itself
          const url = typeof input==='string'? input : (input&&input.url)||'';
          if(!url.includes('/api/auth/login')){
            showLightbox(location.pathname+location.search+location.hash);
          }
        }
      }
      return res;
    };
  }
  // on load, verify session for page navigations (not for assets)
  async function verifyOnLoad(){
    // skip for auth.html itself
    if(location.pathname.endsWith('auth.html') || location.pathname.endsWith('portal.html')) return;
    try{
      const r=await fetch('/api/auth/verify',{credentials:'same-origin', headers:{'Accept':'application/json'}});
      if(!r.ok){
        // if html navigation, show lightbox instead of redirect to keep SPA
        if(r.status===401) showLightbox(location.pathname+location.search+location.hash);
      }
    }catch(e){ /* offline - will show on next online fetch */ }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', verifyOnLoad);
  else verifyOnLoad();
  // periodic silent verify (server renews sliding) - no user attention
  setInterval(function(){
    fetch('/api/auth/verify',{credentials:'same-origin'}).catch(function(){});
  }, 10*60*1000);
  // on visibility back, verify
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) fetch('/api/auth/verify',{credentials:'same-origin'}).then(function(r){ if(r.status===401) showLightbox(location.href); }).catch(function(){})});
  window.ZeelinAuth={showLightbox};
})();
