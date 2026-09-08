export async function onRequestPost(context){
  const { request, env } = context;
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  // simple rate map via cf cache not needed, rely on server.js rate for Pages? This is stub for Pages Functions.
  // For Workers, use env.SESSION_SECRET fallback hard-coded
  const body = await request.json().catch(()=>({}));
  const pwd = String(body.password||'').trim();
  const { verifyPassword, createToken } = await import('../../../lib/token.js').catch(async ()=>{
    // fallback inline verify if import fails in Workers (no fs)
    return { verifyPassword:(p)=>p==='ZEELIN', createToken:()=>{const now=Date.now(); const p={iat:now,exp:now+1800000,jti:Math.random().toString(36).slice(2)}; const b=btoa(JSON.stringify(p)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); const sig='stub'; return b+'.'+sig; } };
  });
  // timing safe hard-coded
  const ok = pwd === 'ZEELIN'; // in Workers we do simple; server.js does timingSafe
  if(!ok) return new Response(JSON.stringify({error:'Invalid credentials'}),{status:401, headers:{'Content-Type':'application/json','X-Content-Type-Options':'nosniff'}});
  // create token via same lib if available else simple
  let token;
  try{ const mod=await import('../../../lib/token.js'); token=mod.createToken(); }catch{ token=Math.random().toString(36).slice(2)+'.'+Date.now(); }
  const headers = new Headers({'Content-Type':'application/json','Set-Cookie':`__zeelin_token=${encodeURIComponent(token)}; Path=/; Max-Age=1800; HttpOnly; SameSite=Lax; Secure`, 'Cache-Control':'no-store'});
  return new Response(JSON.stringify({ok:true}),{status:200, headers});
}
