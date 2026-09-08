// Cloudflare Pages middleware - enforce auth on page navigations, block scraper, serve portal at /
export async function onRequest(context){
  const url = new URL(context.request.url);
  let path = url.pathname;
  const blocked = ['/job-acquisition-portal/course-builder','/.git','/.aidesigner','/storage'];
  for(const b of blocked){ if(path===b || path.startsWith(b+'/')) return new Response('Not found',{status:404, headers:{'Content-Type':'text/plain','X-Robots-Tag':'noindex'}}); }

  // Pretty aliases - rewrite before auth check
  if(path==='/course' || path==='/course/') path='/index.html';
  else if(path==='/inhouse' || path==='/inhouse/') path='/inhouse-projects/index.html';
  else if(path==='/jobs' || path==='/jobs/') path='/job-acquisition-portal/index.html';
  else if(path==='/portal' || path==='/portal/') path='/portal.html';

  // Handle root "/" specially: serve portal.html if auth, else auth.html
  if(path==='/' || path===''){
    const cookie = context.request.headers.get('Cookie')||'';
    const m = cookie.match(/__zeelin_token=([^;]+)/);
    const token = m ? decodeURIComponent(m[1]) : '';
    const hasToken = !!token;
    let valid=false;
    if(hasToken){
      try{
        const part=token.split('.')[0];
        let b=part.replace(/-/g,'+').replace(/_/g,'/');
        while(b.length%4) b+='=';
        const payload=JSON.parse(atob(b));
        if(Date.now() < payload.exp) valid=true;
      }catch{}
    }
    const target = valid ? '/portal.html' : '/auth.html';
    const newUrl = new URL(target, url.origin);
    // Preserve query/hash? redirect with 302 to target so browser shows correct URL
    // For Pages, do a redirect to portal/auth so static serves correctly
    return Response.redirect(newUrl.toString(), 302);
  }

  const noAuth = ['/auth.html','/portal.html','/404.html','/auth-guard.js','/robots.txt','/_headers','/_routes.json','.assetsignore'];
  if(noAuth.includes(path) || path.startsWith('/api/')) return await context.next();
  const ext = path.split('.').pop().toLowerCase();
  const assetExts = ['js','css','png','jpg','jpeg','svg','webp','mp4','ico','woff','woff2','json','txt'];
  if(assetExts.includes(ext)) return await context.next();

  const cookie = context.request.headers.get('Cookie')||'';
  const m = cookie.match(/__zeelin_token=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : '';
  if(!token){
    const accept = context.request.headers.get('Accept')||'';
    if(accept.includes('text/html') || !path.includes('.')){
      return Response.redirect(new URL('/auth.html?next='+encodeURIComponent(path), url.origin).toString(), 302);
    }
    return new Response(JSON.stringify({error:'Session expired', needAuth:true}),{status:401, headers:{'Content-Type':'application/json'}});
  }
  try{
    const part=token.split('.')[0];
    let b=part.replace(/-/g,'+').replace(/_/g,'/');
    while(b.length%4) b+='=';
    const payload=JSON.parse(atob(b));
    if(Date.now()>payload.exp){
      const accept = context.request.headers.get('Accept')||'';
      if(accept.includes('text/html') || !path.includes('.')) return Response.redirect(new URL('/auth.html?next='+encodeURIComponent(path), url.origin).toString(),302);
      return new Response(JSON.stringify({error:'Session expired', needAuth:true}),{status:401, headers:{'Content-Type':'application/json'}});
    }
  }catch{}
  // Rewrite path if alias changed
  if(path !== url.pathname){
    const newUrl = new URL(path, url.origin);
    return await context.next(new Request(newUrl.toString(), context.request));
  }
  return await context.next();
}
