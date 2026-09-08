export async function onRequestGet(context){
  const { request } = context;
  const cookie = request.headers.get('Cookie')||'';
  const m = cookie.match(/__zeelin_token=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : '';
  if(!token) return new Response(JSON.stringify({ok:false, error:'no token'}),{status:401, headers:{'Content-Type':'application/json'}});
  // light verify: decode b64url and check exp
  try{
    const part = token.split('.')[0];
    let b = part.replace(/-/g,'+').replace(/_/g,'/');
    while(b.length%4) b+='=';
    const payload = JSON.parse(atob(b));
    if(Date.now() > payload.exp) return new Response(JSON.stringify({ok:false, error:'expired'}),{status:401, headers:{'Content-Type':'application/json'}});
    // renew if <15m left
    const remain = payload.exp - Date.now();
    if(remain < 15*60*1000){
      // issue new token via lib if possible
      let newToken=token;
      try{ const mod=await import('../../../lib/token.js'); newToken=mod.createToken(); }catch{}
      const headers = new Headers({'Content-Type':'application/json','Set-Cookie':`__zeelin_token=${encodeURIComponent(newToken)}; Path=/; Max-Age=1800; HttpOnly; SameSite=Lax; Secure`});
      const exp = JSON.parse(atob(newToken.split('.')[0].replace(/-/g,'+').replace(/_/g,'/'))).exp || (Date.now()+1800000);
      return new Response(JSON.stringify({ok:true, exp, renewed:true}),{status:200, headers});
    }
    return new Response(JSON.stringify({ok:true, exp:payload.exp, renewed:false}),{status:200, headers:{'Content-Type':'application/json'}});
  }catch(e){
    return new Response(JSON.stringify({ok:false, error:'invalid'}),{status:401, headers:{'Content-Type':'application/json'}});
  }
}
export async function onRequestPost(ctx){ return onRequestGet(ctx); }
