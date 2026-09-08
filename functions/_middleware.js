// Cloudflare Pages middleware - enforce auth on page navigations, block scraper
export async function onRequest(context){
  const url = new URL(context.request.url);
  const path = url.pathname;
  const blocked = ['/job-acquisition-portal/course-builder','/.git','/.aidesigner','/storage'];
  for(const b of blocked){ if(path===b || path.startsWith(b+'/')) return new Response('Not found',{status:404, headers:{'Content-Type':'text/plain','X-Robots-Tag':'noindex'}}); }
  // allow assets and api and auth/portal pages
  const noAuth = ['/auth.html','/portal.html','/404.html','/auth-guard.js'];
  if(noAuth.includes(path) || path.startsWith('/api/')) return await context.next();
  const ext = path.split('.').pop().toLowerCase();
  const assetExts = ['js','css','png','jpg','jpeg','svg','webp','mp4','ico','woff','woff2','json','txt'];
  if(assetExts.includes(ext)) return await context.next();
  // page navigation requires token
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
  // light exp check
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
  return await context.next();
}
