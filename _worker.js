// Zeelin Academy — Cloudflare Worker with assets + enterprise auth (glassmorphism, 30m sliding)
const PASSWORD = 'ZEELIN';
const SECRET = 'zeelin-academy-enterprise-v1-8f3a9c2e7b1d4e6f5a9c0b2d3e4f6a7b';
const TTL_MS = 30 * 60 * 1000;
const RENEW_WINDOW_MS = 15 * 60 * 1000;

function b64urlEncode(buf) {
  const b = typeof buf === 'string' ? buf : String.fromCharCode(...new Uint8Array(buf));
  // buf may be string or ArrayBuffer
  let str;
  if (buf instanceof ArrayBuffer || ArrayBuffer.isView(buf)) {
    const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    str = btoa(binary);
  } else {
    str = btoa(unescape(encodeURIComponent(String(buf))));
  }
  return str.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function b64urlDecodeToStr(s){
  let b = s.replace(/-/g,'+').replace(/_/g,'/');
  while(b.length%4) b+='=';
  return atob(b);
}
async function hmacSign(payloadB64){
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return b64urlEncode(sig);
}
async function timingSafeEqual(a,b){
  if(a.length !== b.length) return false;
  let r=0;
  for(let i=0;i<a.length;i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r===0;
}
async function createToken(){
  const now = Date.now();
  const payload = {iat: now, exp: now+TTL_MS, jti: Math.random().toString(36).slice(2,10)+Date.now().toString(36)};
  const pB64 = b64urlEncode(JSON.stringify(payload));
  const sig = await hmacSign(pB64);
  return pB64+'.'+sig;
}
async function verifyToken(token){
  if(!token || !token.includes('.')) return null;
  const dot = token.lastIndexOf('.');
  const pB64 = token.slice(0,dot);
  const sig = token.slice(dot+1);
  const expected = await hmacSign(pB64);
  if(!(await timingSafeEqual(sig, expected))) return null;
  let payload;
  try{ payload = JSON.parse(b64urlDecodeToStr(pB64)); }catch{ return null; }
  if(Date.now() > payload.exp) return null;
  return payload;
}
function shouldRenew(payload){ return payload && (payload.exp - Date.now()) < RENEW_WINDOW_MS; }
function parseCookies(h){
  const out={};
  (h||'').split(';').forEach(p=>{
    const i=p.indexOf('=');
    if(i<0) return;
    const k=p.slice(0,i).trim();
    const v=p.slice(i+1).trim();
    try{ out[k]=decodeURIComponent(v);}catch{ out[k]=v;}
  });
  return out;
}
function tokenFromReq(req){
  const c = parseCookies(req.headers.get('Cookie')||'');
  let t = c['__zeelin_token']||'';
  if(!t){
    const a = req.headers.get('Authorization')||'';
    if(a.startsWith('Bearer ')) t=a.slice(7).trim();
  }
  return t;
}
function setCookieHeader(token){
  return `__zeelin_token=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.floor(TTL_MS/1000)}; HttpOnly; SameSite=Lax; Secure`;
}
const BLOCKED = ['/job-acquisition-portal/course-builder','/.git','/.aidesigner','/storage'];
function isBlocked(p){ return BLOCKED.some(b=> p===b || p.startsWith(b+'/')); }
const ASSET_EXT = new Set(['js','css','png','jpg','jpeg','svg','webp','mp4','ico','woff','woff2','json','txt','html','htm']);
function isAsset(p){
  const ext = p.split('.').pop().toLowerCase().split('?')[0].split('#')[0];
  return ASSET_EXT.has(ext) && p.includes('.');
}
function isHtmlNav(req, urlPath){
  const accept=(req.headers.get('Accept')||'').toLowerCase();
  if(accept.includes('text/html')) return true;
  if(urlPath.endsWith('.html') || urlPath==='/' ) return true;
  if(!urlPath.includes('.')) return true;
  return false;
}
function securityHeaders(){
  return {
    'X-Frame-Options':'DENY',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'strict-origin-when-cross-origin',
    'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'Cross-Origin-Opener-Policy':'same-origin',
    'X-Robots-Tag':'noindex, nofollow',
  };
}
const rateMap = new Map();
function rateCheck(ip){
  const now=Date.now();
  let rec=rateMap.get(ip);
  if(!rec || now>rec.resetAt){ rec={fails:0, resetAt: now+15*60*1000, blockedUntil:0}; rateMap.set(ip,rec); }
  if(rec.blockedUntil && now<rec.blockedUntil) return {blocked:true, retryAfter: Math.ceil((rec.blockedUntil-now)/1000)};
  if(rec.fails>=5){ rec.blockedUntil=now+60*1000; rec.fails=0; return {blocked:true, retryAfter:60}; }
  return {blocked:false, rec};
}

export default {
  async fetch(request, env, ctx){
    const url = new URL(request.url);
    let urlPath = decodeURIComponent(url.pathname).replace(/\/+/g,'/');
    if(!urlPath.startsWith('/')) urlPath='/'+urlPath;
    const sec = securityHeaders();

    // Block scraper
    if(isBlocked(urlPath)){
      const res = env.ASSETS ? await env.ASSETS.fetch(new Request(url.origin+'/404.html', request)) : new Response('Not found',{status:404});
      return new Response(res.body, {status:404, headers:{...Object.fromEntries(res.headers), ...sec, 'Cache-Control':'no-cache'}});
    }
    if(urlPath.includes('..')) return new Response('Bad request',{status:400, headers:sec});

    // API: login
    if(urlPath==='/api/auth/login' && request.method==='POST'){
      const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
      const rl = rateCheck(ip);
      if(rl.blocked) return new Response(JSON.stringify({error:'Too many attempts. Try again later.'}),{status:429, headers:{'Content-Type':'application/json', ...sec, 'Retry-After': String(rl.retryAfter)}});
      let body={};
      try{ body=await request.json(); }catch{}
      const pwd=String(body.password||'').trim();
      const ok = await timingSafeEqual(pwd, PASSWORD);
      if(!ok){
        rl.rec.fails++;
        return new Response(JSON.stringify({error:'Invalid credentials'}),{status:401, headers:{'Content-Type':'application/json', ...sec}});
      }
      rl.rec.fails=0; rl.rec.blockedUntil=0;
      const token = await createToken();
      const payload = await verifyToken(token);
      return new Response(JSON.stringify({ok:true, exp:payload.exp, iat:payload.iat}),{status:200, headers:{'Content-Type':'application/json', 'Set-Cookie': setCookieHeader(token), ...sec, 'Cache-Control':'no-store'}});
    }
    if((urlPath==='/api/auth/verify') && (request.method==='GET' || request.method==='POST')){
      const t=tokenFromReq(request);
      const p=await verifyToken(t);
      if(!p) return new Response(JSON.stringify({ok:false, error:'Invalid or expired session'}),{status:401, headers:{'Content-Type':'application/json', ...sec}});
      if(shouldRenew(p)){
        const nt=await createToken();
        const np=await verifyToken(nt);
        return new Response(JSON.stringify({ok:true, exp:np.exp, renewed:true}),{status:200, headers:{'Content-Type':'application/json', 'Set-Cookie': setCookieHeader(nt), ...sec}});
      }
      return new Response(JSON.stringify({ok:true, exp:p.exp, renewed:false}),{status:200, headers:{'Content-Type':'application/json', ...sec}});
    }
    if(urlPath==='/api/auth/logout' && request.method==='POST'){
      return new Response(JSON.stringify({ok:true}),{status:200, headers:{'Content-Type':'application/json', 'Set-Cookie':'__zeelin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure', ...sec}});
    }

    // Pretty aliases
    if(urlPath==='/course' || urlPath==='/course/') urlPath='/index.html';
    else if(urlPath==='/inhouse' || urlPath==='/inhouse/') urlPath='/inhouse-projects/index.html';
    else if(urlPath==='/jobs' || urlPath==='/jobs/') urlPath='/job-acquisition-portal/index.html';
    else if(urlPath==='/portal' || urlPath==='/portal/') urlPath='/portal.html';

    // Determine if page navigation needs auth
    const allowWithoutAuth = ['/auth.html','/404.html','/auth-guard.js','/robots.txt','/_headers','/_routes.json'].includes(urlPath) || urlPath.startsWith('/api/');
    const ext = urlPath.split('.').pop().toLowerCase();
    const assetExts = new Set(['js','css','png','jpg','jpeg','svg','webp','mp4','ico','woff','woff2','json','txt']);
    const isAssetPath = assetExts.has(ext) && urlPath.includes('.');
    const needsAuth = !allowWithoutAuth && !isAssetPath && (isHtmlNav(request, urlPath) || urlPath.endsWith('.html') || !urlPath.includes('.'));

    if(needsAuth){
      const t=tokenFromReq(request);
      const p=await verifyToken(t);
      if(!p){
        const accept=request.headers.get('Accept')||'';
        if(accept.includes('application/json') || request.headers.get('X-Requested-With')==='XMLHttpRequest'){
          return new Response(JSON.stringify({error:'Session expired. Please sign in.', needAuth:true}),{status:401, headers:{'Content-Type':'application/json', ...sec}});
        }
        // serve auth.html with 401 for html navigation (preserves glassmorphism)
        if(env.ASSETS){
          const authReq = new Request(url.origin+'/auth.html', request);
          const authRes = await env.ASSETS.fetch(authReq);
          return new Response(authRes.body, {status:401, headers:{...Object.fromEntries(authRes.headers), ...sec, 'Cache-Control':'no-cache', 'Content-Type':'text/html'}});
        }
        return new Response('Authentication required',{status:401, headers:{'Content-Type':'text/html', ...sec}});
      }
      if(shouldRenew(p)){
        const nt=await createToken();
        // fetch asset then attach Set-Cookie
        if(env.ASSETS){
          const assetReq = new Request(url.origin+urlPath, request);
          const assetRes = await env.ASSETS.fetch(assetReq);
          if(assetRes.status!==404){
            const h = new Headers(assetRes.headers);
            h.set('Set-Cookie', setCookieHeader(nt));
            for(const [k,v] of Object.entries(sec)) h.set(k,v);
            return new Response(assetRes.body, {status: assetRes.status, headers: h});
          }
        }
        // fallback: redirect to let next request get new cookie
        const headers = new Headers(sec);
        headers.set('Set-Cookie', setCookieHeader(nt));
        // continue to assets fetch below with new header
        // we will attach via response later
      }
    }

    // Serve assets / pages via ASSETS binding if available (Workers)
    if(env.ASSETS){
      // handle /
      let fetchPath = urlPath;
      if(fetchPath==='/') fetchPath='/portal.html';
      // we already handled auth for '/', but need to decide: if unauthenticated, "/" should serve auth.html (already handled above via needsAuth)
      // For authenticated "/", we want portal.html
      // The needsAuth logic will have already blocked unauthenticated, so here we are authenticated for "/"
      const assetReq = new Request(url.origin + fetchPath, request);
      let res = await env.ASSETS.fetch(assetReq);
      if(res.status===404){
        // try 404.html
        const notFound = await env.ASSETS.fetch(new Request(url.origin+'/404.html', request));
        return new Response(notFound.body, {status:404, headers:{...Object.fromEntries(notFound.headers), ...sec, 'Cache-Control':'no-cache', 'Content-Type':'text/html'}});
      }
      // attach security headers
      const h = new Headers(res.headers);
      for(const [k,v] of Object.entries(sec)) if(!h.has(k)) h.set(k,v);
      // ensure html no-cache
      if(fetchPath.endsWith('.html') || !fetchPath.includes('.')) h.set('Cache-Control','no-cache, no-store, must-revalidate');
      return new Response(res.body, {status: res.status, headers: h});
    }

    // Fallback if no ASSETS binding (e.g., local wrangler without assets)
    return new Response('Worker running — assets binding missing. Deploy via Pages or enable [assets] in wrangler.toml.', {status:200, headers:{'Content-Type':'text/plain', ...sec}});
  }
};
