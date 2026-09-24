export async function onRequestGet(context){
  const url = new URL(context.request.url).searchParams.get('url');
  if(!url) return new Response(JSON.stringify({error:'Missing url'}),{status:400, headers:{'Content-Type':'application/json'}});
  let parsed;
  try{ parsed = new URL(url); }catch{ return new Response(JSON.stringify({error:'Invalid url'}),{status:400, headers:{'Content-Type':'application/json'}}); }
  if(!['http:','https:'].includes(parsed.protocol)) return new Response(JSON.stringify({error:'Invalid protocol'}),{status:400, headers:{'Content-Type':'application/json'}});
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  let cached = await cache.match(cacheKey);
  if(cached) return cached;
  try{
    const res = await fetch(url, {headers:{'User-Agent':'ZeelinAcademyBot/1.0 (+https://zeelin.academy)','Accept':'text/html'}, cf:{cacheTtl:86400, cacheEverything:true}});
    const html = await res.text();
    const og = {url, domain: parsed.hostname, title:'', description:'', image:''};
    const m = (re)=>{ const x = html.match(re); return x ? x[1].trim().replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&') : ''; };
    og.title = m(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || m(/<title[^>]*>([^<]+)<\/title>/i) || parsed.hostname;
    og.description = m(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || m(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i) || '';
    og.image = m(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || '';
    if(og.image && og.image.startsWith('/')) og.image = parsed.origin + og.image;
    if(og.image && !og.image.startsWith('http')) og.image = '';
    const out = new Response(JSON.stringify(og),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=86400','Access-Control-Allow-Origin':'*'}});
    context.waitUntil(cache.put(cacheKey, out.clone()));
    return out;
  }catch(e){
    return new Response(JSON.stringify({url, domain: parsed.hostname, title: parsed.hostname, description:'', image:''}),{headers:{'Content-Type':'application/json'}});
  }
}
