/* Zeelin Academy — Enterprise static server with auth portal, session, portal router, hardening */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createToken, verifyToken, shouldRenew, verifyPassword, TTL_MS } = require('./lib/token');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

const BLOCKED_PREFIXES = [
  '/job-acquisition-portal/course-builder',
  '/job-acquisition-portal/course-builder/',
  '/.git',
  '/.aidesigner',
  '/storage',
];

const PUBLIC_ASSET_EXT = new Set(['.js','.css','.png','.jpg','.jpeg','.svg','.webp','.mp4','.ico','.woff','.woff2','.json']);
const PAGE_EXT = new Set(['.html','', '.htm']);

function isBlocked(p) {
  return BLOCKED_PREFIXES.some(b => p === b || p.startsWith(b + '/') || p.startsWith(b));
}

// --- Local-only scraper console (same port, loopback only) ---
// Public/remote traffic still gets the 404 above + git never sees the
// scraper (course-builder/ is gitignored). Local browser (127.0.0.1)
// bypasses the block and reaches the console + backend proxy below.
const SCRAPER_BACKEND = { host: '127.0.0.1', port: Number(process.env.SCRAPER_PORT || 8092) };
const SCRAPER_API = ['/api/health', '/api/scrape', '/api/runs', '/api/industries', '/api/cities', '/api/curriculum', '/api/course-builder', '/api/pathway-match', '/api/pathway-result'];
function isLoopback(req) {
  const ip = String((req.socket && req.socket.remoteAddress) || '');
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}
function isScraperApi(p) {
  return SCRAPER_API.some(a => p === a || p.startsWith(a + '/'));
}
function proxyScraper(req, res, targetPath) {
  const proxy = http.request(
    { host: SCRAPER_BACKEND.host, port: SCRAPER_BACKEND.port, path: targetPath, method: req.method, headers: { ...req.headers, host: `${SCRAPER_BACKEND.host}:${SCRAPER_BACKEND.port}` } },
    (up) => { res.writeHead(up.statusCode || 502, up.headers); up.pipe(res); }
  );
  proxy.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'scraper backend offline — start it: node job-acquisition-portal/server.js' }));
  });
  req.pipe(proxy);
}

function parseCookies(req) {
  const h = req.headers.cookie || '';
  const out = {};
  h.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx < 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx+1).trim();
    try { out[k] = decodeURIComponent(v); } catch { out[k]=v; }
  });
  return out;
}

function rateLimitCheck(ip) {
  const now = Date.now();
  let rec = rateMap.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { fails: 0, resetAt: now + 15*60*1000, blockedUntil: 0 };
    rateMap.set(ip, rec);
  }
  if (rec.blockedUntil && now < rec.blockedUntil) {
    return { blocked: true, retryAfter: Math.ceil((rec.blockedUntil - now)/1000) };
  }
  if (rec.fails >= 5) {
    rec.blockedUntil = now + 60*1000;
    rec.fails = 0;
    return { blocked: true, retryAfter: 60 };
  }
  return { blocked: false, rec };
}

const rateMap = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k,v] of rateMap) if (now > v.resetAt && now > (v.blockedUntil||0)) rateMap.delete(k);
}, 60*1000).unref();

function securityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '0',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' blob:; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

function tokenFromReq(req) {
  const cookies = parseCookies(req);
  let t = cookies['__zeelin_token'] || '';
  if (!t) {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) t = auth.slice(7).trim();
  }
  return t;
}

function setTokenCookie(res, token, isSecure) {
  const attrs = [
    `__zeelin_token=${encodeURIComponent(token)}`,
    `Path=/`,
    `Max-Age=${Math.floor(TTL_MS/1000)}`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];
  if (isSecure) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function clearTokenCookie(res, isSecure) {
  const attrs = [
    `__zeelin_token=;`,
    `Path=/`,
    `Max-Age=0`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];
  if (isSecure) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function shouldAuthPage(urlPath) {
  // Page navigations require token. Asset exts do not.
  if (urlPath.startsWith('/api/')) return false;
  // Demo marketplace: allow browsing job boards + in-house projects without auth for catalog view (enterprise gate still for API writes)
  if (urlPath.startsWith('/job-acquisition-portal/') || urlPath.startsWith('/inhouse-projects/')) return false;
  const ext = path.extname(urlPath).toLowerCase();
  if (PUBLIC_ASSET_EXT.has(ext)) return false;
  // allow auth.html and its assets without auth, plus portal.html itself is gated
  if (urlPath === '/auth.html' || urlPath === '/portal.html' || urlPath === '/404.html') return false;
  // only html navigations require token. For extensionless (like / or /course) treat as page
  if (ext === '' || PAGE_EXT.has(ext)) return true;
  return false;
}

function isHtmlNavigation(req, urlPath) {
  // Consider Accept header for navigation vs fetch
  if (PUBLIC_ASSET_EXT.has(path.extname(urlPath).toLowerCase())) return false;
  const accept = (req.headers.accept||'').toLowerCase();
  if (accept.includes('text/html')) return true;
  if (urlPath.endsWith('.html') || urlPath === '/' ) return true;
  // SPA hash routes are same html, but initial doc request is html navigation
  if (!path.extname(urlPath)) return true;
  return false;
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  try { return JSON.parse(body); } catch { return {}; }
}

function sendJson(res, code, obj, extraHeaders) {
  const h = { 'Content-Type': 'application/json', ...securityHeaders(), ...(extraHeaders||{}) };
  res.writeHead(code, h);
  res.end(JSON.stringify(obj));
}

function serveFile(filePath, res, req, extraHeaders) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const headers = { 'Content-Type': mime, 'Cache-Control': (ext === '.html' || ext === '.js' || ext === '.css') ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600', ...securityHeaders(), ...(extraHeaders||{}) };
  // prevent mime sniff
  headers['X-Content-Type-Options'] = 'nosniff';
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      serve404(req, res);
      return;
    }
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

function serve404(req, res, extra) {
  const p404 = path.join(ROOT, '404.html');
  if (fs.existsSync(p404)) {
    const headers = { 'Content-Type': 'text/html', 'Cache-Control':'no-cache', ...securityHeaders(), ...(extra||{}) };
    res.writeHead(404, headers);
    fs.createReadStream(p404).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type':'text/plain', ...securityHeaders(), ...(extra||{}) });
    res.end('Not found');
  }
}

function redirect(res, location, code=302, extra) {
  res.writeHead(code, { Location: location, 'Cache-Control':'no-cache', ...securityHeaders(), ...(extra||{}) });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted;
  let rawUrl = req.url || '/';
  let urlPath = decodeURIComponent(rawUrl.split('?')[0]);
  // normalize double slashes
  urlPath = urlPath.replace(/\/+/g, '/');
  if (!urlPath.startsWith('/')) urlPath = '/' + urlPath;

  // --- Security: origin/referer check for POST login (phishing/CSRF) ---
  if (req.method === 'POST' && urlPath.startsWith('/api/auth/')) {
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || req.headers.referrer || '';
    const host = req.headers.host || '';
    // allow only same-origin or no origin (curl) but block cross-origin
    if (origin && !origin.includes(host)) {
      sendJson(res, 403, { error: 'Forbidden origin' });
      return;
    }
    if (!origin && referer) {
      try { const u = new URL(referer); if (u.host !== host) { sendJson(res,403,{error:'Forbidden'}); return; } } catch {}
    }
  }

  // --- Block scraper/console (remote traffic only; loopback uses /scraper below) ---
  if (isBlocked(urlPath) && !isLoopback(req)) {
    serve404(req, res);
    return;
  }
  if (urlPath.includes('..')) { res.writeHead(400, securityHeaders()); res.end('Bad request'); return; }

  // --- Local scraper console on the same port (loopback + login only) ---
  if (urlPath === '/scraper' || urlPath === '/scraper/') {
    if (!isLoopback(req)) { serve404(req, res); return; }
    const t = tokenFromReq(req);
    if (!verifyToken(t)) { return redirect(res, '/'); }
    const consolePath = path.join(ROOT, 'job-acquisition-portal', 'course-builder', 'index.html');
    if (!fs.existsSync(consolePath)) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Scraper console not installed locally.');
      return;
    }
    return serveFile(consolePath, res, req);
  }
  // --- Local scraper API proxy to the portal backend (loopback only) ---
  if (isScraperApi(urlPath)) {
    if (!isLoopback(req)) { serve404(req, res); return; }
    return proxyScraper(req, res, rawUrl);
  }

  // --- API routes ---
  if (urlPath === '/api/auth/login' && req.method === 'POST') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const rl = rateLimitCheck(ip);
    if (rl.blocked) {
      sendJson(res, 429, { error: 'Too many attempts. Try again later.' }, { 'Retry-After': String(rl.retryAfter) });
      return;
    }
    const body = await readJsonBody(req);
    const pwd = String(body.password || body.pwd || '').trim();
    // timing safe
    if (!verifyPassword(pwd)) {
      rl.rec.fails++;
      // generic error, no hint
      sendJson(res, 401, { error: 'Invalid credentials' });
      return;
    }
    // success reset
    const r = rateMap.get(ip); if (r) { r.fails=0; r.blockedUntil=0; }
    const token = createToken();
    setTokenCookie(res, token, isSecure);
    // also return exp for client display
    const payload = verifyToken(token);
    sendJson(res, 200, { ok: true, exp: payload.exp, iat: payload.iat });
    return;
  }

  if (urlPath === '/api/auth/verify' && (req.method==='GET' || req.method==='POST')) {
    const t = tokenFromReq(req);
    const p = verifyToken(t);
    if (!p) { sendJson(res, 401, { ok:false, error:'Invalid or expired session' }); return; }
    // sliding renew if needed - server renews silently without user attention
    if (shouldRenew(p)) {
      const nt = createToken();
      setTokenCookie(res, nt, isSecure);
      const np = verifyToken(nt);
      sendJson(res, 200, { ok:true, exp: np.exp, renewed:true });
      return;
    }
    sendJson(res, 200, { ok:true, exp: p.exp, renewed:false });
    return;
  }

  if (urlPath === '/api/auth/logout' && req.method==='POST') {
    clearTokenCookie(res, isSecure);
    sendJson(res, 200, { ok:true });
    return;
  }

  if (urlPath.startsWith('/api/og') && req.method==='GET') {
    const u = new URL(req.url, `http://${req.headers.host}`);
    const target = u.searchParams.get('url');
    if(!target){ sendJson(res,400,{error:'Missing url'}); return; }
    let parsed; try{ parsed=new URL(target); }catch{ sendJson(res,400,{error:'Invalid url'}); return; }
    try{
      const ctrl = new AbortController(); const t=setTimeout(()=>ctrl.abort(), 4500);
      const r = await fetch(target, {headers:{'User-Agent':'ZeelinAcademyBot/1.0'}, signal: ctrl.signal});
      clearTimeout(t);
      const html = await r.text();
      const m=(re)=>{ const x=html.match(re); return x?x[1].trim():''; };
      const og={url:target, domain:parsed.hostname, title: m(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || m(/<title[^>]*>([^<]+)<\/title>/i) || parsed.hostname, description: m(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || m(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i) || '', image: m(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || ''};
      if(og.image && og.image.startsWith('/')) og.image = parsed.origin + og.image;
      sendJson(res,200, og, {'Cache-Control':'public, max-age=86400','Access-Control-Allow-Origin':'*'});
    }catch(e){ sendJson(res,200,{url:target, domain: parsed.hostname, title: parsed.hostname, description:'', image:''});}
    return;
  }

  // --- Pretty aliases ---
  if (urlPath === '/course' || urlPath === '/course/') { urlPath = '/index.html'; }
  else if (urlPath === '/inhouse' || urlPath === '/inhouse/' ) { urlPath = '/inhouse-projects/index.html'; }
  else if (urlPath === '/jobs' || urlPath === '/jobs/' ) { urlPath = '/job-acquisition-portal/index.html'; }
  else if (urlPath === '/portal' || urlPath === '/portal/') { urlPath = '/portal.html'; }

  // --- Root handling: default home is portal selector, gated ---
  if (urlPath === '/') {
    // if not authenticated, show auth lightbox over portal shell? For direct nav, serve portal.html but it will show lightbox via JS if no token.
    // For enterprise, server must enforce: if page navigation without token, serve auth.html (or redirect to /auth.html)
    const t = tokenFromReq(req);
    const p = verifyToken(t);
    if (!p) {
      // serve auth.html as the default gate (glassmorphism lightbox is also in auth.html)
      const authPath = path.join(ROOT, 'auth.html');
      if (fs.existsSync(authPath)) return serveFile(authPath, res, req);
      // fallback to portal with 401 status? We serve auth
      res.writeHead(401, { 'Content-Type':'text/html', ...securityHeaders() });
      res.end('Authentication required');
      return;
    }
    // valid token: renew silently if needed
    let extra = {};
    if (shouldRenew(p)) {
      const nt = createToken();
      setTokenCookie(res, nt, isSecure);
    }
    // serve portal selector
    const portalPath = path.join(ROOT, 'portal.html');
    if (fs.existsSync(portalPath)) return serveFile(portalPath, res, req, extra);
    // fallback to index
    return serveFile(path.join(ROOT, 'index.html'), res, req, extra);
  }

  // --- Auth page accessible without token ---
  if (urlPath === '/auth.html') {
    return serveFile(path.join(ROOT, 'auth.html'), res, req);
  }
  if (urlPath === '/portal.html') {
    const t = tokenFromReq(req);
    const p = verifyToken(t);
    if (!p) {
      // if direct request without token, redirect to / (which will serve auth)
      return redirect(res, '/');
    }
    if (shouldRenew(p)) { const nt=createToken(); setTokenCookie(res, nt, isSecure); }
    return serveFile(path.join(ROOT, 'portal.html'), res, req);
  }

  // --- For any page navigation that requires token, enforce ---
  const needsAuth = shouldAuthPage(urlPath) || isHtmlNavigation(req, urlPath);
  // Special: allow /auth.html assets + demo marketplaces without auth (catalog browsing)
  const allowWithoutAuth = urlPath === '/auth.html' || urlPath === '/404.html' || urlPath.startsWith('/api/') || urlPath.startsWith('/job-acquisition-portal/') || urlPath.startsWith('/inhouse-projects/') || urlPath.startsWith('/portal.html') || urlPath === '/index.html' || urlPath === '/';
  if (needsAuth && !allowWithoutAuth) {
    // check if it's actually a page (html or no ext). Asset exts already excluded
    const t = tokenFromReq(req);
    const p = verifyToken(t);
    if (!p) {
      // For fetch/XHR expecting json, return 401 JSON
      const accept = (req.headers.accept||'');
      if (accept.includes('application/json') || req.headers['x-requested-with']==='XMLHttpRequest' || urlPath.startsWith('/api/')) {
        sendJson(res, 401, { error:'Session expired. Please sign in.', needAuth:true });
        return;
      }
      // For html navigation, serve auth.html with 401 status so browser shows gate (and glass lightbox)
      // Preserve original URL via header X-Original-Url for client to redirect after login
      const authPath = path.join(ROOT, 'auth.html');
      if (fs.existsSync(authPath)) {
        res.writeHead(401, { 'Content-Type':'text/html', 'Cache-Control':'no-cache', 'X-Original-Url': urlPath, ...securityHeaders() });
        fs.createReadStream(authPath).pipe(res);
        return;
      }
      sendJson(res, 401, { error:'Session expired' });
      return;
    }
    // renew silently if window <15m - no user attention
    if (shouldRenew(p)) {
      const nt = createToken();
      setTokenCookie(res, nt, isSecure);
    }
  }

  // --- Static file serving ---
  // map urlPath to filesystem, ensure within ROOT
  let filePath = path.join(ROOT, urlPath);
  // directory -> index.html
  if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  // prevent traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, securityHeaders()); res.end('Forbidden'); return;
  }
  // if path is directory, serve its index.html
  try {
    const st = fs.statSync(filePath);
    if (st.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {}

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Try portal-aware 404: if accept html, serve 404.html
      const accept = (req.headers.accept||'').toLowerCase();
      if (accept.includes('text/html') || isHtmlNavigation(req, urlPath)) {
        serve404(req, res);
      } else {
        res.writeHead(404, { 'Content-Type':'application/json', ...securityHeaders() });
        res.end(JSON.stringify({ error:'Not found', path: urlPath }));
      }
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    // security + cache - bust JS cache for marketplace updates
    const isHtml = ext === '.html' || ext === '.htm';
    const isJs = ext === '.js';
    const headers = {
      'Content-Type': mime,
      'Cache-Control': (isHtml || isJs || ext === '.css') ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600',
      ...securityHeaders(),
    };
    // if token exists and page, renew cookie already set above, need to keep it
    // We already set Set-Cookie via setTokenCookie which uses res.setHeader - need to not overwrite
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Zeelin Academy secure server on http://localhost:${PORT}`);
  console.log(`Auth gate enabled (30m sliding session)`);
});
