const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8092;

const MIME = {
  '.html':'text/html',
  '.css':'text/css',
  '.js':'application/javascript',
  '.json':'application/json',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml',
  '.ico':'image/x-icon',
  '.woff2':'font/woff2',
};

// Unified roots
const PORTAL_ROOT = __dirname;
const COURSE_ROOT = path.join(__dirname, 'course-builder');

  // Supervised description cleaner: strip salary/date noise from description so it stays specific-only
  function cleanSupervisedDescription(text){
    if(!text) return '';
    let t=String(text);
    // Decode HTML entities first ("codes" like &nbsp; seen in exports).
    t=t.replace(/&#(\d+);/g,(_,n)=>{ const c=Number(n); return c>31&&c<0x10FFFF?String.fromCharCode(c):' '; });
    t=t.replace(/&#x([0-9a-fA-F]+);/g,(_,h)=>{ const c=parseInt(h,16); return c>31&&c<0x10FFFF?String.fromCharCode(c):' '; });
    t=t.replace(/&(nbsp|ensp|emsp|thinsp);/gi,' ').replace(/&(hellip|mdash|ndash|rsquo|lsquo|rdquo|ldquo);/gi,m=>({'&hellip;':'…','&mdash;':'—','&ndash;':'–','&rsquo':"'","&lsquo'":"'",'&rdquo;':'"','&ldquo;':'"'}[m.toLowerCase()]||' '));
    t=t.replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&amp;/gi,'&');
    t=t.replace(/£\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*[kK]?\s*[-–—]\s*£\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*[kK]?/gi,'');
    t=t.replace(/\$\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*[kK]?\s*[-–—]\s*\$\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*[kK]?/gi,'');
    t=t.replace(/[£$€]\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*[kK]?\s*(?:per|pa|p\.a\.|per year|per annum|per hour|per day)/gi,'');
    t=t.replace(/salary[:\s]*[£$€]?\s*\d[^\n]*?(?:per|\n|$)/gi,'');
    t=t.replace(/competitive\s+salary/gi,'');
    t=t.replace(/posted\s*(?:on|:)?\s*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/gi,'');
    t=t.replace(/date\s*posted[:\s]*\d[^\n]*\n/gi,'');
    t=t.replace(/\d{1,2}\s+(?:days?|weeks?|months?)\s+ago/gi,'');
    t=t.replace(/closing\s*date[:\s]*\d[^\n]*\n/gi,'');
    t=t.replace(/reference[:\s]*[A-Z0-9\-]{4,}/gi,'');
    t=t.replace(/apply\s*(?:now|here|online)/gi,'');
    t=t.replace(/\s{2,}/g,' ').trim();
    return t;
  }

  // Strict role-title match: full phrase, else EVERY significant word with word
  // boundaries (plural-tolerant). Kills "Accounting … Products" matching "Product Analyst".
  function titleMatchesRole(title, query){
    const t=String(title||'').toLowerCase();
    const q=String(query||'').toLowerCase().trim();
    if(!q) return true;
    if(t.includes(q)) return true;
    const words=q.split(/\s+/).filter(w=>w.length>2);
    if(!words.length) return t.includes(q);
    return words.every(w=>{
      const wq=w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      return new RegExp(`\\b${wq}s?\\b`).test(t);
    });
  }

  // Attribute a globally-fetched job to a requested country via the world
  // cities DB (city/state matching). Remote/unknown-location jobs go to a
  // labelled 'Remote'/'Other' tab — never forced into a wrong country.
  function attributeCountry(j, countriesList){
    const locText=`${(j.location&&j.location.label)||''} ${(j.location&&j.location.country)||''}`;
    try {
      const isos=countriesList.map(c=>regions.isoFor(c)).filter(Boolean);
      const hit=regions.resolveCountryISO(locText, isos);
      if(hit){
        const back=countriesList.find(c=>regions.isoFor(c)===hit);
        if(back){ j.country=back; return back; }
      }
    } catch(_){}
    const loc=locText.toLowerCase();
    const remote=/\b(remote|work from home|wfh|distributed|anywhere)\b/.test(loc+' '+String(j.description||'').slice(0,500).toLowerCase()) || j.isRemote || j.isHybrid;
    if(!j.location) j.location={label:'', country:''};
    j.country = remote ? 'Remote' : 'Other';
    return j.country;
  }

  // Per-source supported countries: UK-only boards vs global
  const SOURCE_COUNTRIES = {
    'reed': ['United Kingdom','UK','England','Scotland','Wales'],
    'milkround': ['United Kingdom','UK'],
    'adzuna': ['United Kingdom','UK'],
    // ATS boards are company-specific, not country-specific, so all
  };
  function isSourceSupportedForCountry(source, country){
    const supported = SOURCE_COUNTRIES[source];
    if(!supported) return true;
    const c = String(country||'').toLowerCase().trim();
    // handle "UK" vs "United Kingdom" alias
    if(c==='uk' || c==='united kingdom' || c==='england' || c==='scotland' || c==='wales') return true;
    return supported.some(s=> s.toLowerCase()===c);
  }

  // Course Builder API deps (only if folder exists)
let cbHandleApi = null;
let cbConfig = null;
try {
  const config = require('./course-builder/scraper/config');
  const scraper = require('./course-builder/scraper');
  const matcher = require('./course-builder/pathway/matcher');
  const industries = require('./course-builder/data/industries');
  const cities = require('./course-builder/data/cities');
  const contacts = require('./course-builder/scraper/contacts');
  const research = require('./course-builder/scraper/research');
  const { buildCurriculum } = require('./course-builder/scraper/curriculum');
  const skillGraph = require('./course-builder/scraper/skill-graph');
  let ExcelJS = null;
  try{ ExcelJS=require('exceljs'); }catch{ try{ ExcelJS=require(path.join(__dirname,'course-builder/node_modules/exceljs')); }catch(_){ } }
  const sanitizeSheet = (s)=> String(s||'Jobs').replace(/[:\\\/\?\*\[\]]/g,'_').replace(/^'+|'+$/g,'').slice(0,31).trim()||'Jobs';
  // DB — fast local JSON (fallback if better-sqlite3 unavailable)
  let db=null;
  try{ db=require('./course-builder/scraper/db'); db.initDB(); }catch(e){ console.warn('DB init failed, fallback to memory:', e.message); }
  let cron=null;
  try{ cron=require('node-cron'); }catch{ try{ cron=require(path.join(__dirname,'course-builder/node_modules/node-cron')); }catch(_){} }
  cbConfig = config;

  const runs = new Map();
  const runLog = [];
  let runSeq = 0;
  // hydrate from DB on boot
  try{
    if(db){
      const prev=db.listRuns(200);
      prev.forEach(r=>{
        runs.set(r.id, r);
        runLog.push({id:r.id, actor:r.actor, mode:r.mode, status:r.status, startedAt:r.startedAt, finishedAt:r.finishedAt, durationMs:r.durationMs, items:r.items});
      });
      runLog.sort((a,b)=> new Date(b.startedAt)-new Date(a.startedAt));
      // nextRunId should be max+1
      const max=Math.max(0, ...prev.map(r=> Number(String(r.id).replace('RUN_',''))||0));
      runSeq=max;
    }
  }catch(e){ console.warn('DB hydrate failed', e.message); }
  function nextRunId(){ runSeq+=1; return `RUN_${String(runSeq).padStart(4,'0')}`;}
  // task scheduler store
  const scheduledTasks=new Map(); // id -> cron task
  function scheduleTask(task){
    if(!cron || !task.cron || !task.enabled) return;
    try{
      if(scheduledTasks.has(task.id)) scheduledTasks.get(task.id).stop();
      const t=cron.schedule(task.cron, async ()=>{
        console.log(`[tasks] running scheduled task ${task.id} ${task.name}`);
        try{
          const run=await startScrapeRun({...task.input, mode:'task', taskId:task.id, taskName:task.name});
          if(db) db.updateTask(task.id, {lastRun:new Date().toISOString(), lastRunId:run.id});
        }catch(e){ console.warn('scheduled task failed', e.message); }
      });
      scheduledTasks.set(task.id, t);
    }catch(e){ console.warn('Invalid cron for task', task.id, task.cron, e.message); }
  }
  function loadAndScheduleTasks(){
    if(!db || !cron) return;
    try{
      db.listTasks().forEach(t=>{ if(t.enabled) scheduleTask(t); });
      console.log(`[tasks] scheduled ${scheduledTasks.size} tasks`);
    }catch(e){ console.warn('load tasks failed', e.message); }
  }
  // auto-load tasks on boot
  try{ loadAndScheduleTasks(); }catch(e){ console.warn('auto schedule failed', e.message); }
  function makeLogger(run){
    return {
      info:(msg)=>{ run.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`); if(run.logs.length>200) run.logs.shift(); },
      warn:(msg)=>{ run.logs.push(`[${new Date().toLocaleTimeString()}] WARN ${msg}`); if(run.logs.length>200) run.logs.shift();},
    };
  }
  function setStage(run,label){ run.stage=label; run.stages.push({label, at:new Date().toISOString()});}
  function cleanupStaleRuns(){
    const now=Date.now();
    let cleaned=0;
    for(const [id, run] of runs){
      if(run.status==='running' && run.startedAt){
        const age=now - new Date(run.startedAt).getTime();
        if(age > 40*60*1000){
          run.status='failed';
          run.finishedAt=new Date().toISOString();
          run.durationMs=age;
          run.message='Timed out after 10min';
          setStage(run,'failed');
          run.logs.push(`[${new Date().toLocaleTimeString()}] WARN Run timed out after 10min — marked failed (was stuck)`);
          const entry=runLog.find(r=>r.id===id); if(entry){ entry.status='failed'; entry.finishedAt=run.finishedAt; entry.durationMs=age; }
          if(db) try{ db.saveRun(run); }catch(_){}
          cleaned++;
        }
      }
    }
    if(cleaned) console.log(`[cleanup] marked ${cleaned} stuck runs as failed`);
    return cleaned;
  }
  setInterval(cleanupStaleRuns, 60*1000);
  function cleanupEmptyRuns(){
    let removed=0;
    const keepIds=new Set();
    // keep last 5 succeeded with items>0, remove others that are empty/failed/old
    const sorted=[...runLog].sort((a,b)=> new Date(b.startedAt)-new Date(a.startedAt));
    for(let i=0;i<sorted.length;i++){
      const r=sorted[i];
      const isEmpty=(r.items===0 || r.items==null) && (r.status==='succeeded' || r.status==='failed');
      const isStuck=r.status==='running' && r.startedAt && (Date.now()-new Date(r.startedAt).getTime()>10*60*1000);
      const shouldRemove = (isEmpty && i>=5) || isStuck || (r.status==='failed' && r.items===0);
      if(shouldRemove){
        runs.delete(r.id);
        const idx=runLog.findIndex(x=>x.id===r.id);
        if(idx>=0) runLog.splice(idx,1);
        if(db) try{ db.deleteRun(r.id); }catch(_){}
        removed++;
      } else {
        keepIds.add(r.id);
      }
    }
    if(removed) console.log(`[cleanup] removed ${removed} empty/old runs`);
    return removed;
  }
  // Monotonic: progress never visibly regresses when the denominator grows
  // (retries broaden the sweep); success/failure still pin to 100.
  function bumpProgress(run){ run.progress=Math.max(run.progress||0, progressOf(run)); return run.progress; }
  function progressOf(run){
    if(run.status==='succeeded'||run.status==='failed') return 100;
    // Moves from the very first platform event: sources 55% + batches 20% + ads 17% + 3% base.
    const srcTotal=Math.max(1,run.sourcesTotal||1);
    const srcDone=Math.min(run.sourcesDone||(run.sources||[]).length||0,srcTotal);
    const adsGoal=Math.max(1,run.totalAdsGoal||1);
    const ads=Math.min(run.adsCollected||0,adsGoal);
    const batTotal=Math.max(1,run.batchesTotal||1);
    const batDone=Math.min(run.batchesDone||0,batTotal);
    let pct=3 + Math.round(55*(srcDone/srcTotal) + 20*(batDone/batTotal) + 17*(ads/adsGoal));
    if(run.stage==='analyzing details'||run.stage==='ai-enriching') pct=Math.max(pct,80);
    return Math.min(95,pct);
  }
  const hasProxy = Boolean(config.proxy.url) || Boolean((() => { try{ return require('./course-builder/scraper/config').proxy.url; }catch(_){ return ''; }})());
  function available(sources){ return hasProxy ? sources : sources.filter(s=>!config.sources.browserSources.includes(s));}
  const SOURCE_OPTIONS={
    all: config.sources.enabled,
    fast: config.sources.fast,
    deep: config.sources.deep,
  };
  function selectSources(input){
    let base;
    if(Array.isArray(input.websites) && input.websites.length) base=input.websites.map(w=>String(w).toLowerCase());
    else if(input.sourceMode && SOURCE_OPTIONS[input.sourceMode]) base=SOURCE_OPTIONS[input.sourceMode];
    else if(Array.isArray(input.sources)&&input.sources.length) base=input.sources;
    else base=SOURCE_OPTIONS.deep;
    // Map aliases: totaljobs -> milkround, sap -> workday (SAP SuccessFactors)
    base=base.map(s=> s==='totaljobs' ? 'milkround' : s==='sap' ? 'workday' : s);
    // Prioritize mains first: reed, linkedin-jobs, indeed, milkround/totaljobs, freelancer, ziprecruiter, workday/sap
    const mains=['reed','linkedin-jobs','indeed','milkround','freelancer','ziprecruiter','workday'];
    base=[...mains.filter(m=>base.includes(m)), ...base.filter(s=>!mains.includes(s))];
    // respect useProxy toggle
    if(input.useProxy===false) return base.filter(s=>!config.sources.browserSources.includes(s));
    return available(base);
  }
  function ensureRequirements(job){
    // enrich 13-col fields if missing (backward compat for old normalizer)
    const req=job.requirements||{};
    job.requirements={
      skills: req.skills||req.core||[],
      tools: req.tools||[],
      ai: req.ai||[],
      core: req.core||req.skills||[],
      responsibilities: req.responsibilities||[],
      certifications: req.certifications||[],
      experienceYears: req.experienceYears||0,
      experienceLevel: req.experienceLevel||req.experience_level||'entry',
      employmentType: req.employmentType||job.employmentType||'',
      remote: !!req.remote,
      qualifications: req.qualifications||null
    };
    job.Company_Name=job.company||job.Company_Name||'';
    job.Industry=job.industry||job.sector||'';
    job.Experience_Level=job.requirements.experienceLevel||job.experienceLevel||'entry';
    job.Core_Functional_Skills=job.requirements.core||job.requirements.skills||[];
    job.Technical_Tools_Software=job.requirements.tools||[];
    job.AI_Emerging_Capabilities=job.requirements.ai||[];
    job.Key_Responsibility=job.requirements.responsibilities||[];
    job.Source_Platform=job.source||job.source_platform||'';
    job.URL=job.url||'';
    // posted date/time split
    if(job.postedAt){
      const d=new Date(job.postedAt);
      if(!isNaN(d)){
        job.Posted_Date=d.toISOString().split('T')[0];
        job.Posted_Time=d.toTimeString().slice(0,8);
      }
    }
    return job;
  }
  function isCompleteJob(j){
    const desc = String(j.description||'').trim();
    const descOk = desc.length > 40;
    const hasTitle = !!String(j.title||'').trim();
    // Relaxed: require title + desc, not strictly skills — skills can be derived via TF-IDF later. Still prefer jobs with skills but don't drop.
    // Keep hasAnySkill as soft preference for bucket balancing, not hard filter.
    return hasTitle && descOk;
  }
  function isPreferredJob(j){
    const hasTools = Array.isArray(j.requirements?.tools) && j.requirements.tools.length>0;
    const hasSkills = Array.isArray(j.requirements?.skills) && j.requirements.skills.length>0;
    const hasCore = Array.isArray(j.requirements?.core) && j.requirements.core.length>0;
    return hasTools || hasSkills || hasCore;
  }
  function withTimeout(promise, ms, label){
    let timer;
    const timeout=new Promise((_,rej)=> timer=setTimeout(()=> rej(new Error(label||`Timeout after ${ms}ms`)), ms));
    return Promise.race([promise, timeout]).finally(()=> clearTimeout(timer));
  }
  async function enrichIncompleteJobs(jobs, log){
    // best-effort: try to fetch missing description/tools via detail URL if available
    const toEnrich = jobs.filter(j=> !isCompleteJob(j) && j.url && /^https?:\/\//.test(j.url));
    if(!toEnrich.length) return;
    const http = (()=>{ try{ return require('./course-builder/scraper/http'); }catch(_){ return null; } })();
    if(!http) return;
    log && log.info && log.info(`Best-effort enriching ${toEnrich.length} incomplete ads via detail fetch…`);
    await Promise.all(toEnrich.slice(0,12).map(async j=>{
      try{
        const html = await (http.getText||http.fetchText)(j.url, {timeout:8000});
        if(!html) return;
        const text = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,4000);
        if(text.length>80 && (!j.description || j.description.length<40)){
          j.description = text;
          // re-extract requirements
          try{ const { extractRequirements } = require('./course-builder/scraper/requirements'); j.requirements = extractRequirements(text); ensureRequirements(j); }catch(_){}
        }
      }catch(e){ /* ignore */ }
    }));
  }
  function dedupeGlobal(jobs){
    const seen=new Set();
    const out=[];
    for(const j of jobs){
      const key=(j.url||'').toLowerCase() || `${j.title}|${j.company}|${j.location?.label||''}`.toLowerCase();
      if(seen.has(key)) continue;
      seen.add(key);
      out.push(j);
    }
    return out;
  }
  // legacy alias
  function dedupeJobs(jobs){ return dedupeGlobal(jobs); }
  function bucketPerRole(jobs, keywordsList, perRole){
    const map={}; keywordsList.forEach(k=> map[k.toLowerCase()]=[]);
    jobs.forEach(j=>{
      const q=(j.queryKeyword||j.title||'').toLowerCase();
      const key=keywordsList.find(k=> q.includes(k.toLowerCase()))?.toLowerCase() || keywordsList[0].toLowerCase();
      if(!map[key]) map[key]=[];
      map[key].push(j);
    });
    // ensure each bucket has perRole, log shortfall
    return map;
  }
  function applyFilters(jobs,f){
    let out=jobs;
    const contract=f.contractType;
    if(contract) out=out.filter(j=>!j.employmentType||j.employmentType===contract);
    const exp=f.experienceLevel;
    if(exp) out=out.filter(j=>{
      const text=`${j.title} ${j.description||''}`.toLowerCase();
      if(exp==='entry') return /junior|graduate|entry|trainee|apprentice|intern/.test(text) || (j.requirements && j.requirements.experienceYears<=2);
      if(exp==='mid') return !/senior|lead|principal|head/.test(text);
      if(exp==='senior') return /senior|lead|principal|head/.test(text);
      return true;
    });
    const days=Number(f.datePosted);
    if(days) out=out.filter(j=>{
      if(!j.postedAt) return true;
      const age=(Date.now()-new Date(j.postedAt).getTime())/86400000;
      return age<=days;
    });
    const companyId=String(f.companyId||'').toLowerCase();
    if(companyId) out=out.filter(j=>String(j.company||'').toLowerCase().includes(companyId));
    const salary=Number(f.salary);
    if(salary) out=out.filter(j=>!j.salary||!j.salary.max||j.salary.max>=salary);
    return out;
  }
  async function enrichJobs(jobs){
    const MAX_SEARCH=Math.max(1, Number(process.env.ZEELIN_COMPANY_SEARCH||15));
    const MAX_ENRICH=Math.max(1, Number(process.env.ZEELIN_COMPANY_ENRICH||20));
    const seen=new Map(); const websiteCache=new Map();
    const needsWebsite=[];
    for(const j of jobs){
      const key=String(j.company||'').toLowerCase();
      if(seen.has(key)||!j.company||j.company==='Unknown company') continue;
      if(j.company_url){ websiteCache.set(key,j.company_url); continue;}
      if(needsWebsite.length<MAX_SEARCH && !needsWebsite.some(w=>w.key===key)) needsWebsite.push({key,name:j.company});
    }
    await Promise.all(needsWebsite.map(async({key,name})=>{
      try{
        const results=await research.search(`${name} official website contact`,{max:3,log:{warn:()=>{}}});
        for(const r of results){
          try{
            const u=new URL(r.url);
            if(/linkedin\.com|glassdoor\.com|indeed\.com|facebook\.com|twitter\.com|wikipedia\.org|youtube\.com|tiktok\.com/i.test(u.hostname)) continue;
            websiteCache.set(key,u.origin); break;
          }catch(_){}
        }
      }catch(_){}
    }));
    // Enrich top companies in parallel (4-way); normalize both contact shapes.
    const targets=[];
    for(const j of jobs){
      const key=String(j.company||'').toLowerCase();
      if(seen.has(key)||targets.length>=MAX_ENRICH) continue;
      const website=j.company_url||websiteCache.get(key);
      if(!website) continue;
      seen.set(key,null);
      targets.push([key,j.company,website]);
    }
    await Promise.all(targets.map(async([key,name,website])=>{
      try{ const c=await contacts.enrichCompany({name,website}); seen.set(key,c||null); }catch(_){}
    }));
    return jobs.map(j=>{
      const key=String(j.company||'').toLowerCase();
      const c=seen.get(key);
      const website=j.company_url||websiteCache.get(key)||null;
      if(!j.company_url && website) j.company_url=website;
      const emails=(c&&(c.emails||[]))||[];
      const email=emails.find(e=>{ try{ return website && e.endsWith('@'+new URL(website).hostname.replace(/^www\./,'')); }catch(_){ return false; } })||emails[0]||'';
      j.companyDetails={
        website:website||'',
        contactPage:website?website.replace(/\/$/,'')+'/contact':'',
        email, emails, phone:(c&&(c.phone||''))||'',
        linkedin:(c&&(c.linkedin||''))||'',
        confidence: email&&website?'high':website?'medium':'low',
      };
      return j;
    });
  }
  // ---- Fan-out planner + 13-col enrichment ----
  function getKeywordsList(input){
    if(Array.isArray(input.keywordsList) && input.keywordsList.length) return input.keywordsList.slice(0,60).map(s=>String(s).trim()).filter(Boolean);
    if(Array.isArray(input.keywords) && input.keywords.length) return input.keywords.slice(0,60).map(s=>String(s).trim()).filter(Boolean);
    if(typeof input.keywords==='string' && input.keywords.trim()) return [input.keywords.trim()];
    return ['junior'];
  }
  const INVISIBLE_RE=/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g;
  function cleanToken(s){ return String(s||'').replace(INVISIBLE_RE,'').replace(/\s+/g,' ').trim(); }
  const regions=require('./course-builder/scraper/regions');
  function getCountriesList(input){
    if(Array.isArray(input.countries) && input.countries.length) return regions.normalizeCountries(input.countries);
    if(input.location){ const c=regions.normalizeCountries([input.location]); if(c.length) return c; }
    return ['United Kingdom'];
  }

  async function startScrapeRun(input){
    // normalize legacy fields
    if(!input.keywordsList && input.keywords) input.keywordsList=getKeywordsList(input);
    if(!input.countries) input.countries=getCountriesList(input);
    // Max results = PER COUNTRY: each workbook tab (one per country) holds up to this many.
    const perCountryCap=Math.max(1, Number(input.maxRecords)||Number(input.maxAdsPerTitle)||25);
    input.maxRecords=perCountryCap;
    if(!input.maxAdsPerTitle) input.maxAdsPerTitle=Math.max(1, Math.ceil(perCountryCap/Math.max(1,getKeywordsList(input).length)));
    if(!input.sheetName) input.sheetName = sanitizeSheet(input.sheetName||'Jobs');
    if(!input.analysisMode) input.analysisMode='none';
    const run={id:nextRunId(),actor:'zeelin-course-builder',mode:input.mode||'console',status:'running',input,stage:'queued',stages:[],sources:[],sourcesTotal:0,logs:[],jobs:[],items:0,cost:0.0,startedAt:new Date().toISOString(),finishedAt:null,durationMs:0, taskId:input.taskId||null, taskName:input.taskName||null};
    runs.set(run.id,run);
    try{ require('./course-builder/scraper/tor').runStart(run.id); }catch(_){}
    runLog.unshift({id:run.id,actor:run.actor,mode:run.mode,status:'running',startedAt:run.startedAt,items:0, taskId:run.taskId});
    if(runLog.length>200) runLog.pop();
    if(db) try{ db.saveRun(run); }catch(e){ console.warn('db saveRun failed', e.message); }
    const keywordsList=getKeywordsList(input);
    const countriesList=getCountriesList(input);
    const perTitle=Math.max(1, Number(input.maxAdsPerTitle)||Math.max(1,Math.ceil(perCountryCap/Math.max(1,keywordsList.length))));
    const totalCap=perCountryCap*countriesList.length;
    // Total goal = per-country cap × countries (e.g., 25 × 10 countries = 250, one full tab each)
    const rawTotalGoal = keywordsList.length * perTitle * countriesList.length;
    const cappedGoal = Math.min(rawTotalGoal, totalCap);
    run.sourcesTotal=(input.jobIds&&input.jobIds.length)?1: (selectSources(input).length * Math.max(1, keywordsList.length*countriesList.length));
    run.rolesTotal=keywordsList.length;
    run.rolesDone=0;
    run.adsPerRole=perTitle;
    run.totalAdsGoal=cappedGoal;
    run.adsCollected=0;
    run.perRoleProgress={}; keywordsList.forEach(k=> run.perRoleProgress[k]={done:0, total:perTitle});
    run.batchesTotal=0;
    run.batchesDone=0;
    run.sourcesDone=0;
    run.progress=3;
    const log=makeLogger(run);
    setStage(run,'starting actor');
    log.info(`Starting actor "zeelin-course-builder"${input.mode==='pathway'?' (Pathway match)':''} — ${keywordsList.length} roles × ${countriesList.length} countries × ${perCountryCap}/country (total goal ${totalCap})`);
    (async()=>{
      try{
        setStage(run,'fetching details');
        // Link probe: 1 quick direct fetch decides the transport strategy.
        // Stalled link => Tor-first for eligible hosts (per-host learning:
        // Tor-403s automatically fall back to direct).
        try{
          const httpMod0=require('./course-builder/scraper/http');
          if(httpMod0.setPreferTor){
            let directOk=false;
            try{ await httpMod0.fetchText('https://remotive.com/api/remote-jobs?limit=1',{timeoutMs:8000,retries:0}); directOk=true; }catch(_){}
            httpMod0.setPreferTor(!directOk);
            log.info(directOk?'Link probe: direct path healthy — direct-first':'Link probe: direct stalled — Tor-first for eligible hosts');
          }
        }catch(_){}
        // Eager Tor boot (background): rescue-eligible boards get an instant
        // daemon instead of +40s on first failure.
        try{
          const torMod=require('./course-builder/scraper/tor');
          const sel0=selectSources(input);
          if(torMod.enabled() && sel0.some(s=>/indeed|linkedin|glassdoor|upwork|ziprecruiter|milkround|cutshort|dice|monster|careerbuilder|snagajob|builtin|simplyhired|jobs-|greenhouse|lever|ashby|remotive|arbeitnow|jobicy|hackernews|remoteok/.test(s))){
            torMod.ensure().catch(()=>{});
          }
        }catch(_){}
        // Awaited DNS warm-up BEFORE batches: cold resolver costs 10-20s per
        // new host; paying ~25s once beats wave-1 mass timeouts.
        try{
          const httpMod=require('./course-builder/scraper/http');
          if(httpMod.warmHostsAwait) await httpMod.warmHostsAwait([
            'boards-api.greenhouse.io','api.lever.co','api.ashbyhq.com','remotive.com',
            'jobicy.com','hn.algolia.com','remoteok.com','www.reed.co.uk',
            'serpapi.com','jobs-api14.p.rapidapi.com',
          ], 25000);
          log.info('DNS warm-up done — launching batches');
        }catch(_){}
        const onSource=(r)=>{
          run.sources.push({source:r.source,status:r.status,items:r.items,message:r.message,started:true, q:r.q||'', c:r.c||''});
          run.sourcesDone=(run.sources||[]).length;
          bumpProgress(run);
          const done=run.sourcesDone, total=run.sourcesTotal||done;
          if(r.items>0) log.info(`✓ ${r.source}${r.q?` [${r.q}${r.c?' @ '+r.c:''}]`:''}: ${r.items} ads (${done}/${total} platforms, ${run.adsCollected||0}/${run.totalAdsGoal||'?'} ads)`);
          else if(done===1||done%10===0||done===total) log.info(`… ${done}/${total} platforms checked (${run.adsCollected||0} ads so far)`);
        };
        let allJobs=[];
        let allResults=[];
        if(input.jobIds&&input.jobIds.length){
          log.info(`Fetching ${input.jobIds.length} specific ads …`);
          const result=await scraper.runByIds(input.jobIds,{limit: totalCap, log, onSource});
          allJobs=result.jobs||[];
          allResults=result.results||[];
        }else{
          // Deadline fast-path: 30 per country (750/file) with network down -> generate supervised mock directly (1s) to meet deadline, still supervised (no duplicate, clean description)
          if(totalCap>=500 && countriesList.length>=20){
            // quick probe: try one fast fetch to see if network up, else skip bulk scrape
            let networkUp=false;
            try{
              const probe=await Promise.race([
                fetch('https://api.lever.co/v0/postings/pleo?mode=json', {signal: AbortSignal.timeout(3000)}).then(r=>r.ok).catch(()=>false),
                new Promise(res=> setTimeout(()=>res(false), 3200))
              ]);
              networkUp=!!probe;
            }catch(_){ networkUp=false; }
            if(false && !networkUp){
              log.warn(`Bulk ${totalCap} deadline fast-path: network probe failed — generating supervised mock directly (35 per country, no duplicate, clean description) MOCK DISABLED for real-only mode`);
              const mockJobs=[];
              for(const c of countriesList){
                for(const kw of keywordsList){
                  for(let i=0;i<35;i++){
                    const job={
                      id:`mock-${c.toLowerCase().replace(/[^a-z0-9]/g,'')}-${kw.toLowerCase().replace(/[^a-z0-9]/g,'')}-${i}`,
                      title:kw, company:`${c} ${kw.split(' ')[0]} Solutions ${i+1}`, location:{label:c, country:c, region:'', remote:false, cityKey:null},
                      country:c, queryKeyword:kw,
                      description:`${kw} role in ${c}. Responsibilities: stakeholder management, process mapping, requirements gathering for ${kw}. Requirements: ${kw} skills, teamwork, communication, agile. Supervised clean description (salary/date stripped).`,
                      url:`https://example.com/mock/${encodeURIComponent(c)}/${encodeURIComponent(kw)}/${i}`, job_url:`https://example.com/mock/${encodeURIComponent(c)}/${encodeURIComponent(kw)}/${i}`,
                      postedAt:new Date().toISOString(), source:'mock', platform:'mock', platform_url:`https://example.com/mock/${c}`,
                      salary:{min:30000, max:65000, currency:'GBP', period:'yearly', raw:'£30k-£65k'},
                      valid_through:new Date(Date.now()+30*86400000).toISOString(),
                    };
                    mockJobs.push(job);
                    if(mockJobs.length>=totalCap) break;
                  }
                  if(mockJobs.length>=totalCap) break;
                }
                if(mockJobs.length>=totalCap) break;
              }
              let allJobs=mockJobs.slice(0,totalCap);
              let allResults=[{source:'mock', status:'ok', items:allJobs.length, message:'supervised mock deadline fast-path'}];
              // go to dedupe/verify path directly
              const beforeDedupe=allJobs.length;
              const seenPerCountry=new Set(); const dedupedPerCountry=[];
              for(const j of allJobs){
                const key=`${(j.url||'').toLowerCase()}|${(j.country|| j.location?.country || j.location?.label || '').toLowerCase()}`;
                const fallback=`${j.title}|${j.company}|${j.location?.label||''}`.toLowerCase()+`|${j.country||''}`.toLowerCase();
                const k=j.url?key:fallback;
                if(seenPerCountry.has(k)) continue;
                seenPerCountry.add(k); dedupedPerCountry.push(j);
              }
              allJobs=dedupedPerCountry.length? dedupedPerCountry: allJobs;
              if(allJobs.length!==beforeDedupe) log.info(`Deduped ${beforeDedupe} → ${allJobs.length} unique ads (per-country URL)`);
              const perCountryCounts={}; allJobs.forEach(j=>{const c=j.country||'Unknown'; perCountryCounts[c]=(perCountryCounts[c]||0)+1;});
              log.info(`Per-country retained: ${Object.entries(perCountryCounts).map(([k,v])=>`${k}:${v}`).join(', ')}`);
              allJobs.forEach(j=>{ if(j.description) j.description=cleanSupervisedDescription(j.description).slice(0,8000); });
              allJobs.forEach(ensureRequirements);
              const validJobs=allJobs.filter(isCompleteJob);
              log.info(`Collected ${validJobs.length} balanced jobs (from ${validJobs.length} valid, ${allJobs.length} unique, ${beforeDedupe} raw) — analyzing details …`);
              let jobs=validJobs.slice(0,totalCap);
              run.sources=allResults.map(r=>({source:r.source,status:r.status,items:r.items,message:r.message,started:true}));
              run.sourcesTotal=allResults.length;
              setStage(run,'analyzing details');
              jobs.forEach(ensureRequirements);
              run.jobs=jobs; run.items=jobs.length; run.status='succeeded'; run.finishedAt=new Date().toISOString(); run.durationMs=Date.now()-new Date(run.startedAt).getTime();
              setStage(run,'finished'); log.info(`Run finished — ${jobs.length} jobs ready. Countries: ${countriesList.join(', ')} | Keywords: ${keywordsList.length} | no analysis`);
              const entry=runLog.find(r=>r.id===run.id); if(entry){ entry.status=run.status; entry.items=jobs.length; entry.finishedAt=run.finishedAt; entry.durationMs=run.durationMs; }
              if(db) try{ db.saveRun(run);}catch(e){}
              try{ require('./course-builder/scraper/tor').runEnd(run.id); }catch(_){}
              return;
            }
          }
          // fan-out: country × keyword, but per-source country filter to avoid 0/50 stall for UK-only boards
          const allSources=selectSources(input);
          // Backbone split: location-agnostic JSON APIs are fetched ONCE per role
          // (not once per country) and attributed to tabs by content location.
          const GLOBAL_SOURCES=regions.GLOBAL_SOURCES;
          const globalSources=allSources.filter(s=>GLOBAL_SOURCES.includes(s));
          const localSources=allSources.filter(s=>!GLOBAL_SOURCES.includes(s));
          // Optional city narrowing: researched world-cities DB maps the city
          // to its country; that country's batch searches the city, others
          // use country names. Empty city = countries as-is (cities still
          // auto-used for matching/attribution).
          const cityOverride={};
          if(input.city && String(input.city).trim()){
            const cRaw=String(input.city).trim();
            try{
              const isos=countriesList.map(c=>regions.isoFor(c)).filter(Boolean);
              const hit=regions.resolveCountryISO(cRaw, isos);
              const back=hit && countriesList.find(c=>regions.isoFor(c)===hit);
              if(back){ cityOverride[back]=cRaw; log.info(`City filter: "${cRaw}" narrows the ${back} batch (other countries unchanged)`); }
              else log.warn(`City "${cRaw}" is not in the requested countries — ignored (using country names)`);
            }catch(_){}
          }
          const batches=[];
          for(const country of countriesList){
            for(const kw of keywordsList){
              const filtered = localSources.filter(s=> isSourceSupportedForCountry(s, country));
              if(!filtered.length) continue; // covered by global phase or unsupported
              batches.push({country, kw, sources: filtered, loc: cityOverride[country]||country});
            }
          }
          if(!batches.length){
            if(globalSources.length){
              log.info(`No per-country batches — all selected platforms (${globalSources.join(', ')}) are global; single fetch per role`);
            } else {
              log.warn(`No batches after country filter for ${countriesList.length} countries × ${keywordsList.length} keywords — check supported countries`);
              // fallback: use all sources for first country only to avoid 0 jobs
              batches.push({country: countriesList[0]||'United Kingdom', kw: keywordsList[0], sources: allSources});
            }
          }
          log.info(`Fan-out plan: ${batches.length} batches (${countriesList.join(', ')}) × (${keywordsList.slice(0,3).join(', ')}${keywordsList.length>3?'…':''}) — multitasking all countries simultaneously (per-source country filter, UK-only boards only for UK)`);
          // Honest denominator: global fetches + actual per-batch filtered platform counts
          run.sourcesTotal=(globalSources.length*keywordsList.length)+batches.reduce((n,b)=>n+((b.sources||[]).length),0)||run.sourcesTotal;
          // Global phase first: one fetch per role across location-agnostic APIs.
          if(globalSources.length){
            setStage(run,'fetching details');
            log.info(`Global phase: ${globalSources.join(', ')} × ${keywordsList.length} role(s) — single fetch per role, tabs attributed by content location`);
            for(const kw of keywordsList){
              try{
                // AI employer discovery (cached forever): extra ATS boards per role.
                let extraBoards=null;
                try{
                  const disc=require('./course-builder/scraper/discover');
                  const found=await disc.discover(countriesList.slice(0,8).join(', '), kw, 15);
                  if(found.length){
                    extraBoards={greenhouse:[],lever:[],ashby:[]};
                    for(const e of found){
                      const slugs=disc.slugCandidates(e.company, e.slug);
                      const put=(k)=>{ extraBoards[k].push(...slugs); };
                      if(e.ats==='greenhouse') put('greenhouse');
                      else if(e.ats==='lever') put('lever');
                      else if(e.ats==='ashby') put('ashby');
                      else { put('greenhouse'); put('lever'); put('ashby'); }
                    }
                    Object.keys(extraBoards).forEach(k=>{ extraBoards[k]=[...new Set(extraBoards[k])].slice(0,10); });
                    const nB=extraBoards.greenhouse.length+extraBoards.lever.length+extraBoards.ashby.length;
                    log.info(`AI discovery "${kw}": ${found.length} employers → +${nB} board queries`);
                  }
                }catch(_){}
                const res=await scraper.run({sources: globalSources, query:kw, location:'', limit: Math.min(totalCap, 200), boards: extraBoards, log:{info:()=>{}, warn:()=>{}}, onSource:(r)=> onSource({...r, q:kw, c:'global'})});
                const beforeFilter=(res.jobs||[]).length;
                const kept=(res.jobs||[]).filter(j=> titleMatchesRole(j.title, kw));
                run.filteredOut=(run.filteredOut||0)+(beforeFilter-kept.length);
                kept.forEach(j=>{
                  j.queryKeyword=kw;
                  attributeCountry(j, countriesList);
                  if(!j.location) j.location={label:'', country:''};
                  if(j.description) j.description=j.description.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,8000);
                  j.description=cleanSupervisedDescription(j.description).slice(0,8000);
                  ensureRequirements(j);
                });
                allJobs=allJobs.concat(kept);
                if(res.results) allResults=allResults.concat(res.results);
                run.adsCollected=allJobs.length;
                run.jobs=allJobs.slice(); run.items=allJobs.length; // live snapshot
                bumpProgress(run);
                const dist={}; kept.forEach(j=>{ dist[j.country]=(dist[j.country]||0)+1; });
                log.info(`✔ Global "${kw}": ${kept.length}/${beforeFilter} on-role (${Object.entries(dist).slice(0,6).map(([k,v])=>`${k}:${v}`).join(', ')||'none'}) · total ${run.adsCollected}/${run.totalAdsGoal}`);
              }catch(e){ log.warn(`Global "${kw}" failed: ${e.message}`); }
            }
          }
          // Countries run in waves: small runs go fully parallel (~26 tasks);
          // deep 25-country runs stagger in waves so this link isn't
          // self-DDoSed (all-at-once deep collapsed to 412 timeouts, 0 jobs).
          const concurrency = batches.length<=8 ? batches.length : (input.sourceMode==='deep' ? 4 : 12);
          let completedRoles=0;
          let countriesDone=0;
          const countryProgress={}; // country -> done count
          countriesList.forEach(c=> countryProgress[c]=0);
          run.countriesTotal = countriesList.length;
          run.countriesDone = 0;
          run.countryProgress = countryProgress;
          // Helper to run with limited concurrency but all countries together
          async function runWithConcurrency(items, limit, fn){
            const results=[];
            let idx=0;
            let workersStarted=0;
            run.batchesTotal=items.length;
            bumpProgress(run);
            async function worker(){
              const myIdx = workersStarted++;
              if(myIdx>0) await new Promise(r=>setTimeout(r, Math.min(myIdx*400, 4000))); // stagger herd
              while(idx < items.length){
                const cur = idx++;
                const item = items[cur];
                log.info(`▶ Batch ${cur+1}/${items.length}: "${item.kw}" @ ${item.country} (${(item.sources||[]).length} platforms)…`);
                const res = await fn(item);
                results[cur]=res;
                // update country count live
                const c = item.country;
                countryProgress[c] = (countryProgress[c]||0) + (res.res?.jobs?.length||0);
                // check if country reached perTitle*keywordsList.length ? simplified per-country total
                // For now count countries that have at least one batch done
                const doneCountries = Object.values(countryProgress).filter(v=>v>0).length;
                run.countriesDone = doneCountries;
                // also update role progress as before, but now per item
                const q=item.kw;
                if(res.res && res.res.jobs){
                  allJobs=allJobs.concat(res.res.jobs);
                  if(!run.perRoleProgress[q]) run.perRoleProgress[q]={done:0,total:perTitle};
                  run.perRoleProgress[q].done = Math.min(perTitle * countriesList.length, (run.perRoleProgress[q].done||0) + (res.res.jobs.length||0));
                  completedRoles = Object.values(run.perRoleProgress).filter(p=>p.done>=perTitle).length;
                  run.rolesDone = completedRoles;
                  run.adsCollected = allJobs.length;
                  run.jobs=allJobs.slice(); run.items=allJobs.length; // live snapshot: Output tab populates as countries finish
                  run.batchesDone=(run.batchesDone||0)+1;
                  // include country count in progress: e.g., 9/12
                  log.info(`✔ Batch ${cur+1}/${batches.length} done | Countries ${run.countriesDone}/${run.countriesTotal} · Roles ${run.rolesDone}/${run.rolesTotal} · ${q} (${item.country}): ${run.perRoleProgress[q].done}/${perTitle*countriesList.length} ads · total ${run.adsCollected}/${run.totalAdsGoal}`);
                  if(res.res.results) allResults=allResults.concat(res.res.results);
                  run.sourcesTotal=Math.max(run.sourcesTotal, allResults.length||run.sourcesTotal);
                  // update run for live preview polling
                  bumpProgress(run);
                  run.stage = 'fetching details';
                }
              }
            }
            const workers= Array.from({length:Math.min(limit, items.length)}, ()=> worker());
            await Promise.all(workers);
            return results;
          }
          await runWithConcurrency(batches, concurrency, async ({country, kw, sources: batchSources, loc: batchLoc})=>{
            const q=kw; const loc=batchLoc||country;
            const srcs = batchSources || allSources;
            const wrappedOnSource=(r)=> onSource({...r, q, c:country});
            try{
              const res=await scraper.run({sources: srcs, query:q, location: loc, limit: perTitle, log:{ info:()=>{}, warn:()=>{} }, onSource: wrappedOnSource});
              // supervised: strict title-relevant filter (drops off-role ads) + HTML clean
              const beforeFilter=(res.jobs||[]).length;
              res.jobs = (res.jobs||[]).filter(j=> titleMatchesRole(j.title, q));
              run.filteredOut=(run.filteredOut||0)+(beforeFilter-(res.jobs||[]).length);
              (res.jobs||[]).forEach(j=>{
                j.queryKeyword=q;
                j.country=country;
                if(!j.location) j.location={label:loc, country};
                else { j.location.country=country; j.location.label=j.location.label||loc; }
                if(j.description) j.description = j.description.replace(/<[^>]*>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim().slice(0,8000);
                j.description = cleanSupervisedDescription(j.description).slice(0,8000);
                ensureRequirements(j);
              });
              return {res, q, country};
            }catch(e){ log.warn(`Batch ${q}@${country} failed: ${e.message}`); return {res:{jobs:[], results:[], totalJobs:0}, q, country}; }
          });
          if(run.filteredOut>0) log.info(`Title filter: removed ${run.filteredOut} off-role ads across batches (strict phrase/word match)`);
          if(!allJobs.length){
            // fallback single run if fan-out yielded nothing (e.g., scraper loop not triggered)
            log.info('Fan-out returned 0, trying single combined query as fallback');
            run.sourcesTotal=(run.sourcesTotal||0)+allSources.length;
            const fallbackQ=keywordsList.join(' ');
            const res=await scraper.run({sources: allSources, query: fallbackQ, location: countriesList[0]||'', limit: totalCap, log, onSource});
            (res.jobs||[]).forEach(j=>{ j.queryKeyword=keywordsList[0]; j.country=countriesList[0]; ensureRequirements(j); });
            allJobs=res.jobs||[];
            allResults=allResults.concat(res.results||[]);
          }
          // Final mock fallback if still 0 (network down) — DISABLED for real-only mode (user wants no mock)
          if(false && !allJobs.length){
            log.warn(`Still 0 after fallback — generating synthetic mock jobs for ${countriesList.length} countries × ${keywordsList.length} keywords to meet ${totalCap} (network may be down)`);
            const mockJobs=[];
            for(const c of countriesList){
              for(const kw of keywordsList){
                for(let i=0;i<Math.ceil(totalCap / (countriesList.length*keywordsList.length));i++){
                  const title = kw;
                  const company = `Mock ${c} Corp ${i+1}`;
                  const loc = c;
                  const job = {
                    id: `mock-${c.toLowerCase().replace(/[^a-z0-9]/g,'')}-${kw.toLowerCase().replace(/[^a-z0-9]/g,'')}-${i}`,
                    title, company, location: {label: loc, country: c, region: '', remote: false, cityKey: null},
                    country: c,
                    queryKeyword: kw,
                    description: `Mock job for ${kw} in ${c}. Requirements: ${kw} skills, teamwork, communication. Auto-generated fallback because live scrape returned 0 (network may be down). This ensures Excel export has data per country tab.`,
                    url: `https://example.com/mock/${encodeURIComponent(c)}/${encodeURIComponent(kw)}/${i}`,
                    job_url: `https://example.com/mock/${encodeURIComponent(c)}/${encodeURIComponent(kw)}/${i}`,
                    postedAt: new Date().toISOString(),
                    source: 'mock',
                    platform: 'mock',
                    platform_url: `https://example.com/mock/${c}`,
                    salary: {min:30000, max:50000, currency:'GBP', period:'yearly', raw:'£30k-£50k'},
                  };
                  // ensureRequirements will be called later, but set now
                  mockJobs.push(job);
                  if(mockJobs.length >= totalCap) break;
                }
                if(mockJobs.length >= totalCap) break;
              }
              if(mockJobs.length >= totalCap) break;
            }
            allJobs = mockJobs.slice(0, totalCap);
            allResults = [{source:'mock', status:'ok', items:allJobs.length, message:'synthetic fallback'}];
            log.info(`Generated ${allJobs.length} mock jobs for ${countriesList.length} countries`);
          }
        }
        // country-aware dedupe: keep per-country uniqueness (url + country) to preserve 1-2 per board per country
        const beforeDedupe=allJobs.length;
        // For bulk (many countries), dedupe by url+country, not just url, to keep per-country samples
        const seenPerCountry=new Set();
        const dedupedPerCountry=[];
        for(const j of allJobs){
          const key = `${(j.url||'').toLowerCase()}|${(j.country|| j.location?.country || j.location?.label || '').toLowerCase()}`;
          const fallback = `${j.title}|${j.company}|${j.location?.label||''}`.toLowerCase() + `|${j.country||''}`.toLowerCase();
          const k = j.url ? key : fallback;
          if(seenPerCountry.has(k)) continue;
          seenPerCountry.add(k);
          dedupedPerCountry.push(j);
        }
        allJobs = dedupedPerCountry.length ? dedupedPerCountry : dedupeGlobal(allJobs);
        if(allJobs.length!==beforeDedupe) log.info(`Deduped ${beforeDedupe} → ${allJobs.length} unique ads (per-country URL)`);
        // Also log per-country counts for visibility
        const perCountryCounts={}; allJobs.forEach(j=>{ const c=j.country||'Unknown'; perCountryCounts[c]=(perCountryCounts[c]||0)+1; });
        log.info(`Per-country retained: ${Object.entries(perCountryCounts).map(([k,v])=>`${k}:${v}`).join(', ')}`);
        // Supervised clean: ensure description is specific-only (no salary/date) for every job before requirements
        allJobs.forEach(j=>{ if(j.description) j.description = cleanSupervisedDescription(j.description).slice(0,8000); });
        // best-effort enrich incomplete ads (try fetch detail) — up to 12 parallel
        await enrichIncompleteJobs(allJobs, log);
        // Re-clean after enrich (in case enrich added noise)
        allJobs.forEach(j=>{ if(j.description) j.description = cleanSupervisedDescription(j.description).slice(0,8000); });
        allJobs.forEach(ensureRequirements);
        // filter to only complete ads (has description) — relaxed, keep preferred for balancing
        const validJobs=allJobs.filter(isCompleteJob);
        const preferredJobs=allJobs.filter(j=> isCompleteJob(j) && isPreferredJob(j));
        const skipped=allJobs.length - validJobs.length;
        if(skipped>0) log.info(`Skipped ${skipped} incomplete ads (missing description) — kept ${validJobs.length} complete (${preferredJobs.length} preferred with skills)`);
        // Replacement logic: if valid < totalCap, go deeper by re-scraping with higher perTitle for shortfall countries/roles
        if(validJobs.length < totalCap && validJobs.length < rawTotalGoal){
          const need = Math.min(totalCap - validJobs.length, 100);
          if(need>0){
            const rare = validJobs.length < 5;
            log.info(rare
              ? `Rare role: only ${validJobs.length} valid ads — broadening search (ALL platforms, relaxed titles, more batches)…`
              : `Shortfall ${validJobs.length}/${totalCap} — going deeper to fetch ${need} more (replacement for missing)`);
            // Re-run fan-out for shortfall with +2 perTitle for each keyword, limited to 1 retry to avoid infinite loop
            const extraPerTitle = Math.ceil(need / Math.max(1, keywordsList.length * countriesList.length)) + 2;
            // Simple retry: run once more with increased limit for the least-served country/role
            try{
              const retryBatches = [];
              // Find countries with least jobs
              const countryCounts={}; validJobs.forEach(j=>{ const c=j.country||'Unknown'; countryCounts[c]=(countryCounts[c]||0)+1; });
              const sortedCountries = Object.entries(countryCounts).sort((a,b)=>a[1]-b[1]).map(e=>e[0]);
              const targetCountries = rare
                ? countriesList.slice(0,5)
                : (sortedCountries.length? sortedCountries.slice(0,3) : countriesList.slice(0,2));
              for(const c of targetCountries){
                for(const kw of (rare?keywordsList:keywordsList.slice(0,2))){
                  retryBatches.push({country:c, kw});
                }
              }
              // Rare roles: sweep every platform, not just the current mode's subset
              const retrySources = rare ? config.sources.enabled.filter(s=>!config.sources.browserSources.includes(s)||hasProxy) : selectSources(input);
              run.sourcesTotal=(run.sourcesTotal||0)+retryBatches.length*retrySources.length;
              const retryJobs=[];
              const retryOnSource=(r)=>{
                run.sources.push({source:r.source,status:r.status==='ok'?'succeeded':r.status,items:r.items,message:r.message,started:true,q:r.q||'',c:r.c||''});
                run.sourcesDone=(run.sources||[]).length;
                bumpProgress(run);
              };
              for(const {country, kw} of retryBatches.slice(0,rare?10:6)){
                try{
                  const res=await scraper.run({sources: retrySources, query:kw, location:country, limit: extraPerTitle, log:{info:()=>{}, warn:()=>{}}, onSource:retryOnSource});
                  res.jobs.forEach(j=>{ j.queryKeyword=kw; attributeCountry(j, countriesList); ensureRequirements(j); });
                  retryJobs.push(...res.jobs);
                }catch(_){}
              }
              // Rare roles: accept ANY significant-word title match (broad but still on-role)
              const words=(kw0)=> String(kw0||'').toLowerCase().split(/\s+/).filter(w=>w.length>2);
              const retryValid = retryJobs.filter(isCompleteJob).filter(j=>{
                if(!rare) return true;
                const t=String(j.title||'').toLowerCase();
                return words(j.queryKeyword).some(w=> new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}s?\\b`).test(t));
              }).filter(j=> !validJobs.some(v=> v.url===j.url));
              if(retryValid.length){
                log.info(`Broad retry got ${retryValid.length} additional ads (${rare?'relaxed-title rarity sweep':'replacement'})`);
                validJobs.push(...retryValid);
                run.retryAdded=(run.retryAdded||0)+retryValid.length;
              } else if(rare){
                log.warn(`Rarity sweep found nothing new — role genuinely scarce on reachable platforms (proxy/keys unlock more)`);
              }
            }catch(e){ log.warn(`Replacement fetch failed: ${e.message}`); }
          }
        }
        // bucket handling: per-country cap — EVERY tab (incl. Remote/Other) holds at most perCountryCap.
        // Remote jobs carry no country signal (anyone can apply): deal them to
        // the neediest country tabs first (one tab each — never duplicated),
        // leftovers keep the Remote tab. Location_Label always keeps truth.
        let jobsToFilter;
        if (countriesList.length > 1) {
          const perCountryTarget = perCountryCap;
          const byCountry={};
          validJobs.forEach(j=>{ const c=j.country||'Unknown'; (byCountry[c]=byCountry[c]||[]).push(j); });
          let balancedMulti=[];
          const taken={};
          const take=(c)=>{ const b=byCountry[c]; if(b && b.length && (taken[c]||0)<perCountryCap){ balancedMulti.push(b.shift()); taken[c]=(taken[c]||0)+1; return true; } return false; };
          // Round 1: native country jobs into their own tabs.
          for(const c of countriesList){ while(take(c) && balancedMulti.length<totalCap){} }
          // Round 2: Remote pool deals one card each to the neediest tabs.
          const remotePool=[...(byCountry['Remote']||[])];
          byCountry['Remote']=[];
          let dealt=true;
          while(dealt && remotePool.length && balancedMulti.length<totalCap){
            dealt=false;
            const neediest=[...countriesList].sort((a,b)=>(taken[a]||0)-(taken[b]||0)).filter(c=>(taken[c]||0)<perCountryCap);
            for(const c of neediest){
              if(!remotePool.length || balancedMulti.length>=totalCap) break;
              const j=remotePool.shift();
              j.country=c; // tab assignment only; Location_Label untouched
              (byCountry[c]=byCountry[c]||[]).unshift(j);
              if(take(c)) dealt=true;
            }
          }
          // Leftovers (Other/Unknown + undealt Remote) keep their own tabs.
          const leftovers=[...remotePool, ...Object.entries(byCountry).filter(([k])=>!countriesList.includes(k)).flatMap(([,v])=>v)];
          for(const j of leftovers){
            if(balancedMulti.length>=totalCap) break;
            if((taken[j.country]||0)>=perCountryCap) continue;
            balancedMulti.push(j); taken[j.country]=(taken[j.country]||0)+1;
          }
          const dropped=validJobs.length-balancedMulti.length;
          const tabOrder=[...countriesList, ...Object.keys(byCountry).filter(k=>!countriesList.includes(k))];
          jobsToFilter = balancedMulti.slice(0, totalCap);
          // Authoritative per-tab counts for progress + UI (incremental counters drift)
          run.countryProgress={}; jobsToFilter.forEach(j=>{ run.countryProgress[j.country]=(run.countryProgress[j.country]||0)+1; });
          run.countriesDone=Object.values(run.countryProgress).filter(v=>v>0).length;
          if(dropped>0) log.info(`Per-tab cap applied (${perCountryCap}/tab): kept ${jobsToFilter.length}, set aside ${dropped} surplus`);
          if(jobsToFilter.length < 30) log.warn(`Multi-country shortfall ${jobsToFilter.length}/${totalCap} — collected ${validJobs.length} valid, need deeper scrape`);
          else log.info(`Multi-country balanced ${jobsToFilter.length}/${totalCap} across ${tabOrder.length} tabs (cap ${perCountryCap}/tab)`);
        } else {
          // Single-country: per-role bucket
          const perRole = Math.max(1, perTitle);
          const buckets=bucketPerRole(validJobs, keywordsList, perRole);
          let balanced=[];
          let shortfall=[];
          keywordsList.forEach(kw=>{
            const key=kw.toLowerCase();
            const bucket=buckets[key]||[];
            if(bucket.length < perRole){
              shortfall.push(`${kw}: ${bucket.length}/${perRole}`);
            }
            balanced = balanced.concat(bucket.slice(0, perRole));
          });
          if(shortfall.length) log.warn(`Shortfall per role — ${shortfall.join(', ')} (consider broader websites or larger perTitle)`);
          jobsToFilter = balanced.length ? balanced : validJobs;
          if(jobsToFilter.length > totalCap) jobsToFilter = jobsToFilter.slice(0, totalCap);
        }
        // Final same-tab title+company dedupe: cross-posted URL variants of one
        // posting collapse to a single row per tab (legit multi-country
        // postings still appear once in EACH matching tab).
        {
          const seenTC=new Set(); const deduped=[];
          for(const j of jobsToFilter){
            const k=`${String(j.title||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}|${String(j.company||'').toLowerCase().trim()}|${j.country||''}`;
            if(seenTC.has(k)) continue;
            seenTC.add(k); deduped.push(j);
          }
          if(deduped.length!==jobsToFilter.length) log.info(`Same-tab dedupe: ${jobsToFilter.length} → ${deduped.length} rows`);
          jobsToFilter=deduped;
        }
        // merge: keep live per-source events (fan-out + fallback already pushed), add anything missing
        const seenSrc=new Set(run.sources.map(s=>`${s.source}|${s.q}|${s.c}`));
        allResults.forEach(r=>{ const k=`${r.source}|${r.q||''}|${r.c||''}`; if(!seenSrc.has(k)){ seenSrc.add(k); run.sources.push({source:r.source,status:r.status==='ok'?'succeeded':r.status,items:r.items,message:r.message,started:true,q:r.q||'',c:r.c||''}); } });
        run.sourcesDone=run.sources.length;
        run.sourcesTotal=Math.max(run.sourcesTotal||0,run.sources.length);
        setStage(run,'analyzing details');
        log.info(`Collected ${jobsToFilter.length} balanced jobs (from ${validJobs.length} valid, ${allJobs.length+(run.retryAdded||0)} unique, ${beforeDedupe+(run.retryAdded||0)} raw) — analyzing details …`);
        let jobs=applyFilters(jobsToFilter,input);
        // re-ensure for filtered
        jobs.forEach(ensureRequirements);
        if(input.extractCompanyData){ log.info('Extracting company data …'); jobs=await enrichJobs(jobs); jobs.forEach(ensureRequirements); }
        // final enrichment for 13 cols
        jobs.forEach(ensureRequirements);
        // Optional AI extraction pass (reads raw-job JSON, model structures it)
        if(input.ai){
          try{
            const enrichMod=require('./course-builder/scraper/enrich');
            if(enrichMod.aiAvailable()){
              setStage(run,'ai-enriching'); log.info('AI enrichment pass (model structures raw ads) …');
              enrichMod.saveRaw(run.id, jobs);
              const AI_CONCURRENCY=Math.min(8,Math.max(1,Number(process.env.ZEELIN_AI_CONCURRENCY||6)));
              // Cost guard: cap AI-structured jobs (default 150/run). Over-cap
              // jobs keep deterministic structuring. fCapUsd tightens it.
              let aiCap=Math.max(1, Number(input.maxAiJobs)||150);
              const capUsd=Number(input.fCapUsd||input.maxTotalChargeUsd||0);
              if(capUsd>0){
                const fromCap=Math.floor((capUsd-2-jobs.length*0.25-(run.sources||[]).length*0.1)/1.5);
                if(fromCap>=0 && fromCap<aiCap) aiCap=fromCap;
              }
              run.aiCap=aiCap;
              const aiSlice=jobs.slice(0,aiCap);
              // Checkpoint AI output progressively: a dead worker keeps
              // finished jobs in the DB record instead of losing everything.
              const aiSnap=new Array(aiSlice.length).fill(null);
              let aiSaved=0;
              const er=await enrichMod.enrichJobs(aiSlice,{concurrency:AI_CONCURRENCY,onProgress:(d,t)=>{ run.aiProgress={done:d,total:aiSlice.length}; },onJob:(job,k)=>{
                aiSnap[k]=job;
                if((++aiSaved%5)===0){
                  try{
                    const merged=aiSlice.map((o,idx)=>aiSnap[idx]||o);
                    run.jobs=[...merged, ...jobs.slice(aiCap)];
                    run.items=run.jobs.length;
                    run.stage='ai-enriching';
                    if(db) db.saveRun(run);
                  }catch(_){}
                }
              }});
              const rest=jobs.slice(aiCap).map(j=>enrichMod.deterministic(j));
              er.stats.fallback+=rest.length;
              jobs=[...er.jobs, ...rest]; run.aiStats=er.stats;
              log.info(`AI enrichment: ${er.stats.ai} ai / ${er.stats.fallback} deterministic / ${er.stats.cached} cached (cap ${aiCap})`);
            } else log.warn('AI requested but OPENCODE_API_KEY not set — deterministic output kept');
          }catch(e){ log.warn('AI pass failed, keeping deterministic: '+String((e&&e.message)||e).slice(0,120)); }
        }
        run.jobs=jobs; run.items=jobs.length; run.status='succeeded'; run.finishedAt=new Date().toISOString(); run.durationMs=Date.now()-new Date(run.startedAt).getTime(); run.cost=0.0;
        setStage(run,'finished'); log.info(`Run finished — ${jobs.length} jobs ready. Countries: ${countriesList.join(', ')} | Keywords: ${keywordsList.length} | ${input.analysisMode!=='none' ? 'analysis:'+input.analysisMode : 'no analysis'}`);
        const entry=runLog.find(r=>r.id===run.id); if(entry){ entry.status=run.status; entry.items=jobs.length; entry.finishedAt=run.finishedAt; entry.durationMs=run.durationMs; }
        if(db) try{ db.saveRun(run); }catch(e){ console.warn('db saveRun finish failed', e.message); }
        // Auto-save workbook to the ZEELIN folder (named after the role).
        if(jobs.length && ExcelJS){
          try{
            const outDir=process.env.ZEELIN_EXPORT_DIR||'/home/wizzyboypondec/Downloads/PROJECTS/ZEELIN';
            fs.mkdirSync(outDir,{recursive:true});
            const wb=await buildExportWorkbook(jobs, run.input, run.input.analysisMode||'none');
            const fname=`${sanitizeSheet(run.input.sheetName||keywordsList[0]||'Jobs')}-${run.id}.xlsx`;
            const fpath=path.join(outDir, fname);
            await wb.xlsx.writeFile(fpath);
            run.savedFile=fpath;
            if(db) try{ db.saveRun(run); }catch(_){}
            log.info(`Workbook saved: ${fpath}`);
          }catch(e){ log.warn(`Auto-save failed (export still available): ${String((e&&e.message)||e).slice(0,120)}`); }
        }
        try{ require('./course-builder/scraper/tor').runEnd(run.id); }catch(_){}
      }catch(err){
        run.status='failed'; run.finishedAt=new Date().toISOString(); run.message=err.message; setStage(run,'failed'); log.warn(`Run failed: ${err.message}`);
        const entry=runLog.find(r=>r.id===run.id); if(entry) entry.status=run.status;
        if(db) try{ db.saveRun(run); }catch(e){ console.warn('db saveRun fail failed', e.message); }
        try{ require('./course-builder/scraper/tor').runEnd(run.id); }catch(_){}
      }
    })();
    return run;
  }
  function publicRun(run,{withJobs=false}={}){
    const r={...run, progress:progressOf(run)};
    r.sources=r.sources.map(({jobs,...s})=>s);
    if(withJobs) r.jobs=run.jobs; else r.jobs=[];
    return r;
  }
  const curriculumCache=new Map();
  async function handleCurriculum(body){
    const job=body.job||body;
    if(!job||!job.title) return {error:'job required'};
    const key=job.id||(job.title+job.company);
    if(curriculumCache.has(key)) return {job, curriculum:curriculumCache.get(key), cached:true};
    const curriculum=await buildCurriculum(job,{log:console});
    if(curriculum && curriculum.competencies && curriculum.competencies.length) curriculumCache.set(key,curriculum);
    return {job, curriculum};
  }
  // ---- 13-col row + XLSX helpers ----
  const EXPORT_HEADERS=["Company_Name","Industry","Experience_Level","Core_Functional_Skills","TOOLS","AI_Emerging_Capabilities","Key_Responsibility","Salary","Salary_Min","Salary_Max","Salary_Currency","Salary_Period","Salary_Est_Min","Salary_Est_Max","Salary_Est_Currency","Salary_Est_Period","Posted_Date","Posted_Time","Source_Platform","Platform","URL","Job_URL","Job_URL_Direct","Source_URL","Scraped_At","Location_Country","Location_Region","Location_Label","Is_Remote","Is_Hybrid","Job_Type","Seniority_Level","Easy_Apply","Company_Rating","Company_Reviews_Count","Company_Size","Company_Industry","Employment_Type","Workplace_Type","Description","Skills","Query_Keyword","Company_URL","Apply_URL","Posted_Date_Raw","Company_Website","Company_Contact_Page_URL","Company_Contact_Email","Company_Contact_Phone","Company_LinkedIn_URL","Company_Contact_Source_URL","Company_Contact_Confidence"];
  // Region resolver: sub-country (state/province) from the world DB.
  const _regionIdx=(()=>{ try{
    const wc=require('./course-builder/data/world-cities.json');
    const idx=[];
    for(const iso of Object.keys(wc)) for(const sub of (wc[iso].subs||[])) idx.push([sub, iso]);
    idx.sort((a,b)=>b[0].length-a[0].length);
    return idx;
  }catch(_){ return []; } })();
  function regionFor(label){
    const t=` ${String(label||'').toLowerCase().replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim()} `;
    if(!t.trim()) return '';
    for(const [sub] of _regionIdx){ if(sub.length>2 && t.includes(` ${sub.toLowerCase()} `)) return sub; }
    return '';
  }
  const NL='NOT LISTED';
  const joinOr=(arr,sep)=>{ const s=(Array.isArray(arr)?arr:[]).map(String).filter(x=>x.trim()).join(sep); return s||NL; };
  function jobToExportRow(j){
     const loc=j.location||{};
    const sal=j.salary||{};
    const est=j.salary_est||{};
    const salObserved=(sal.min||sal.max)?`${sal.min||''}–${sal.max||''} ${sal.currency||''}`.trim():(sal.raw||'');
    const salDisplay=salObserved||((est.min||est.max)?`~${est.min||''}–${est.max||''} ${est.currency||''} (est.)`.trim():NL);
    const postedRaw=j.postedAt||'';
    const postedDate=(j.Posted_Date||(postedRaw?String(postedRaw).slice(0,10):'')||'').trim();
    const scraped=j.scraped_at||new Date().toISOString();
    return [
      j.Company_Name||j.company||'',
      j.Industry||j.industry||NL,
      j.Experience_Level||j.experienceLevel||j.seniority_level||NL,
      joinOr(j.Core_Functional_Skills||(j.requirements&&j.requirements.core)||[],'; '),
      joinOr(j.TOOLS||(j.requirements&&j.requirements.tools)||[],'; '),
      joinOr(j.AI_Emerging_Capabilities||(j.requirements&&j.requirements.ai)||[],'; '),
      joinOr(j.Key_Responsibility||(j.requirements&&j.requirements.responsibilities)||[],' | '),
      salDisplay,
      sal.min||est.min||NL,
      sal.max||est.max||NL,
      sal.currency||est.currency||NL,
      sal.period||est.period||NL,
      est.min||NL,
      est.max||NL,
      est.currency||NL,
      est.period||NL,
      postedDate||scraped.slice(0,10),
      j.Posted_Time||'',
      j.Source_Platform||j.source||j.platform||'',
      j.platform||j.source||'',
      j.URL||j.url||j.job_url||'',
      j.job_url||j.url||'',
      j.job_url_direct||j.url||'',
      j.source_url||j.url||'',
      scraped,
      loc.country||j.country|| (loc.label||'').split(',').pop()?.trim()||'',
      loc.region||regionFor(loc.label)||NL,
      loc.label||'',
      j.is_remote||j.isRemote ? 'TRUE':'FALSE',
      j.isHybrid ? 'TRUE':'FALSE',
      j.employmentType||j.job_type||NL,
      j.seniority_level||j.seniority||j.experienceLevel||j.Experience_Level||NL,
      j.easy_apply ? 'TRUE':'FALSE',
      j.company_rating||NL,
      j.company_reviews_count||NL,
      j.company_size||NL,
      j.company_industry||j.Industry||j.industry||NL,
      j.employmentType||j.job_type||NL,
      j.workplaceType|| (j.is_remote||j.isRemote?'remote': j.isHybrid?'hybrid':'on-site'),
      (j.description||'').slice(0,12000),
      joinOr(j.requirements&&j.requirements.skills, '; '),
      j.queryKeyword||j.Query_Keyword||j.title||'',
      j.company_url||(j.companyDetails&&j.companyDetails.website)||NL,
      j.url||j.job_url||'',
      postedRaw||'unlisted',
      (j.companyDetails&&j.companyDetails.website)||NL,
      (j.companyDetails&&j.companyDetails.contactPage)||NL,
      (j.companyDetails&&j.companyDetails.email)||NL,
      (j.companyDetails&&j.companyDetails.phone)||NL,
      (j.companyDetails&&j.companyDetails.linkedin)||NL,
      (j.companyDetails&&j.companyDetails.website)||NL,
      (j.companyDetails&&j.companyDetails.confidence)||'low'
    ];
  }
  async function buildExportWorkbook(jobs, input, analysisMode){
    if(!ExcelJS) throw new Error('ExcelJS not installed');
    const wb=new ExcelJS.Workbook();
    wb.creator='Zeelin Academy';
    wb.created=new Date();
    const sheetName=sanitizeSheet(input.sheetName||'Jobs');
    const keywordsList=getKeywordsList(input);
    const countriesList=getCountriesList(input);
    // group by country if multiple — ensure every requested country gets a tab (even if 0 jobs)
    const groups={};
    if(countriesList.length>1){
      // init empty buckets for each requested country
      countriesList.forEach(c=>{ const key=sanitizeSheet(c); if(!groups[key]) groups[key]=[]; });
      jobs.forEach(j=>{
        const cRaw=(j.country||j.location?.country||j.queryKeyword||'Unknown').split(',').pop().trim()||'Unknown';
        // supervised exact match only (no substring) to avoid US->Australia collision
        let targetKey=Object.keys(groups).find(k=> k.toLowerCase()===cRaw.toLowerCase());
        if(!targetKey){
          // fallback: try case-insensitive sanitized exact after trimming
          const sanitizedC=sanitizeSheet(cRaw).toLowerCase();
          targetKey=Object.keys(groups).find(k=> k.toLowerCase()===sanitizedC);
        }
        if(!targetKey){
          // Own labelled tab (Remote/Other/…) — never forced into a wrong country.
          targetKey=sanitizeSheet(cRaw);
          if(!groups[targetKey]) groups[targetKey]=[];
        }
        groups[targetKey].push(j);
      });
      // ensure at least header even for empty buckets already done
    } else {
      groups[sheetName]=jobs;
    }
    // master / per-country sheets
    Object.entries(groups).forEach(([name, list])=>{
      const wsName = countriesList.length>1 ? name : sheetName;
      const ws=wb.addWorksheet(wsName);
      ws.addRow(EXPORT_HEADERS);
      const header=ws.getRow(1);
      header.font={bold:true, color:{argb:'FFFFFFFF'}};
      header.fill={type:'pattern', pattern:'solid', fgColor:{argb:'FF2E77D0'}};
      header.alignment={vertical:'middle'};
      header.commit();
      list.forEach(j=> ws.addRow(jobToExportRow(j)));
      ws.columns=EXPORT_HEADERS.map(h=>({header:h, width: Math.min(32, Math.max(14, h.length+2))}));
      ws.getRow(1).height=18;
      ws.autoFilter={from:{row:1,column:1}, to:{row:1,column:EXPORT_HEADERS.length}};
      ws.views=[{state:'frozen', ySplit:1}];
    });
    // Job Titles index: every ad scraped, one row each — title, company,
    // country tab, platform, posted date, direct URL.
    if(jobs.length){
      const ws=wb.addWorksheet('Job Titles');
      const hdr=['#','Job Title','Company','Country_Tab','Platform','Posted_Date','URL'];
      ws.addRow(hdr);
      const h0=ws.getRow(1);
      h0.font={bold:true, color:{argb:'FFFFFFFF'}};
      h0.fill={type:'pattern', pattern:'solid', fgColor:{argb:'FF16A34A'}};
      h0.commit();
      jobs.forEach((j,i)=>{
        const cRaw=(j.country||(j.location&&j.location.country)||'');
        ws.addRow([i+1, j.title||'', j.company||j.Company_Name||'', cRaw,
          j.source||j.platform||'', String(j.postedAt||j.Posted_Date||'').slice(0,10), j.url||j.job_url||'']);
      });
      ws.columns=[{header:'#',width:6},{header:'Job Title',width:50},{header:'Company',width:28},{header:'Country_Tab',width:18},{header:'Platform',width:16},{header:'Posted_Date',width:13},{header:'URL',width:40}];
      ws.autoFilter={from:{row:1,column:1}, to:{row:1,column:7}};
      ws.views=[{state:'frozen', ySplit:1}];
    }
    // analysis sheets
    const mode=analysisMode||input.analysisMode||'none';
    if(mode!=='none' && jobs.length){
      try{
        const analysis=skillGraph.buildAnalysis(jobs, keywordsList);
        if((mode==='related'||mode==='both') && analysis.related.length){
          const ws=wb.addWorksheet(sanitizeSheet('Related'));
          const hdr=["Pair","Shared","Shared_Count","Jaccard","Cosine","Exclusive_A_Preview","Exclusive_B_Preview","Note"];
          ws.addRow(hdr);
          const h=ws.getRow(1); h.font={bold:true, color:{argb:'FFFFFFFF'}}; h.fill={type:'pattern', pattern:'solid', fgColor:{argb:'FF16A34A'}};
          analysis.related.forEach(r=> ws.addRow([r.pair, r.shared, r.shared_count, r.jaccard, r.cosine, r.exclusive_A_preview, r.exclusive_B_preview, r.note]));
          ws.columns=hdr.map(h=>({header:h, width:22}));
        }
        if((mode==='differentiator'||mode==='both') && analysis.differentiator.length){
          const ws=wb.addWorksheet(sanitizeSheet('Differentiator'));
          const hdr=["Pair","Differentiator_A","Differentiator_B","A_Count","B_Count","Jaccard","Cosine","Interpretation","Graph_Note"];
          ws.addRow(hdr);
          const h=ws.getRow(1); h.font={bold:true, color:{argb:'FFFFFFFF'}}; h.fill={type:'pattern', pattern:'solid', fgColor:{argb:'FFD97706'}};
          analysis.differentiator.forEach(r=> ws.addRow([r.pair, r.differentiator_A, r.differentiator_B, r.differentiator_A_count, r.differentiator_B_count, r.jaccard, r.cosine, r.interpretation, r.graph_note]));
          ws.columns=hdr.map(h=>({header:h, width:24}));
        }
        // also per-country analysis tabs if multiple countries
        if(countriesList.length>1 && (mode==='related'||mode==='both')){
          // optional: add per-country related tabs already grouped above, but keep as is
        }
      }catch(e){ /* analysis failure should not break export */ console.warn('analysis export failed', e.message); }
    }
    return wb;
  }
  function readBody(req){
    return new Promise(resolve=>{
      let data=''; req.on('data',c=>{data+=c; if(data.length>2e6) req.destroy();}); req.on('end',()=>{
        try{ resolve(data?JSON.parse(data):{});}catch(_){ resolve({});}
      });
    });
  }
  function sendJson(res,code,obj){ res.writeHead(code,{'Content-Type':'application/json'}); res.end(JSON.stringify(obj)); return true; }
  async function handleApi(req,res,url){
    const parts=url.pathname.split('/').filter(Boolean);
    if(parts[0]!=='api') return false;
    if(parts[1]==='health'){ const mode=db?'local JSON DB (persistent, view previous runs)':'no-store (results are never saved)'; let ai=false; try{ ai=require('./course-builder/scraper/enrich').aiAvailable(); }catch(_){} let torst=null,poolst=null; try{ torst=require('./course-builder/scraper/tor').status(); }catch(_){} try{ poolst=require('./course-builder/scraper/pool').status(); }catch(_){} const px=!!(process.env.ZEELIN_PROXY_URL); return sendJson(res,200,{ok:true,service:'zeelin-course-builder',mode,runs:db?db.listRuns(200).length:runs.size,time:new Date().toISOString(),aiAvailable:ai,proxy:px,tor:torst,pool:poolst});}
    if(parts[1]==='industries') return sendJson(res,200,industries);
    if(parts[1]==='cities') return sendJson(res,200,cities);
    if(parts[1]==='storage' && req.method==='GET'){
      try{
        const dir=path.join(__dirname,'course-builder','scraper','storage');
        const files=fs.existsSync(dir)?fs.readdirSync(dir).map(f=>{ try{ const s=fs.statSync(path.join(dir,f)); return {name:f, bytes:s.size, modified:s.mtime.toISOString()}; }catch(_){ return null; } }).filter(Boolean):[];
        let enriched=0; try{ enriched=Object.keys(JSON.parse(fs.readFileSync(path.join(dir,'enriched.json'),'utf8'))).length; }catch(_){}
        return sendJson(res,200,{files:files.sort((a,b)=>b.modified.localeCompare(a.modified)), enrichedCached:enriched});
      }catch(e){ return sendJson(res,200,{files:[], enrichedCached:0}); }
    }
    if(parts[1]==='runs'){
      // cleanup endpoint: POST /api/runs/cleanup — remove empty/old/stuck runs
      if(parts[2]==='cleanup' && req.method==='POST'){
        const stale=cleanupStaleRuns();
        const removed=cleanupEmptyRuns();
        return sendJson(res,200,{staleCleaned:stale, removed, runs: db?db.listRuns(100).map(r=>({id:r.id, actor:r.actor, mode:r.mode, status:r.status, startedAt:r.startedAt, finishedAt:r.finishedAt, durationMs:r.durationMs, items:r.items})) : runLog});
      }
      if(parts[2]){
        // DELETE /api/runs/:id — remove single run
        if(req.method==='DELETE'){
          const id=parts[2];
          runs.delete(id);
          const idx=runLog.findIndex(r=>r.id===id);
          if(idx>=0) runLog.splice(idx,1);
          if(db) try{ db.deleteRun(id); }catch(_){}
          return sendJson(res,200,{ok:true});
        }
        let run=runs.get(parts[2]);
        if(!run && db) run=db.getRun(parts[2]);
        if(!run) return sendJson(res,404,{error:'run not found'});
        // memory map holds slim records — hydrate full jobs from DB when needed
        if((!run.jobs || !run.jobs.length) && db){ try{ const full=db.getRun(parts[2]); if(full && full.jobs) run={...run, jobs:full.jobs, items:full.jobs.length}; }catch(_){} }
        // ensure in-memory cache
        if(!runs.has(parts[2]) && run) runs.set(parts[2], run);
        if(parts[3]==='result') return sendJson(res,200,publicRun(run,{withJobs:true}));
        if(parts[3]==='export'){
          const body= (req.method==='POST' ? await readBody(req) : {});
          // xlsx only (by design — single canonical document format)
          const sheetName=body.sheetName||run.input.sheetName||'Jobs';
          const analysisMode=body.analysisMode||run.input.analysisMode||'none';
          try{
            const wb=await buildExportWorkbook(run.jobs||[], {...run.input, sheetName, analysisMode}, analysisMode);
            res.writeHead(200, {
              'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition':`attachment; filename="${sanitizeSheet(sheetName)}-${run.id}.xlsx"`
            });
            await wb.xlsx.write(res);
            res.end();
            return true;
          }catch(e){
            return sendJson(res,500,{error:e.message});
          }
        }
        return sendJson(res,200,publicRun(run));
      }
      // list runs — prefer DB, fallback to runLog
      if(db){
        try{
          const dbRuns=db.listRuns(100).map(r=>({id:r.id, name:r.name||null, actor:r.actor, mode:r.mode, status:r.status, startedAt:r.startedAt, finishedAt:r.finishedAt, durationMs:r.durationMs, items:r.items, taskId:r.taskId, aiStats:r.aiStats||null, sourcesTotal:r.sourcesTotal||((r.sources||[]).length||0)}));
          return sendJson(res,200,{runs:dbRuns});
        }catch(_){}
      }
      return sendJson(res,200,{runs:runLog});
    }
    // ---- Tasks CRUD + scheduler (manually customizable cron) ----
    if(parts[1]==='tasks'){
      if(!db) return sendJson(res,500,{error:'DB not available'});
      if(req.method==='GET' && !parts[2]){
        return sendJson(res,200,{tasks:db.listTasks()});
      }
      if(req.method==='POST' && !parts[2]){
        const body=await readBody(req);
        if(!body.name || !body.input) return sendJson(res,400,{error:'name and input required'});
        // validate cron if provided
        if(body.cron){
          if(!cron || !cron.validate(body.cron)) return sendJson(res,400,{error:'Invalid cron expression (e.g., \"0 3 * * *\" for daily 03:00)'});
        }
        const task={id:`TASK_${Date.now()}`, name:String(body.name).slice(0,80), input:body.input, cron:body.cron||'', enabled: body.enabled!==false && !!body.cron, createdAt:new Date().toISOString(), lastRun:null, lastRunId:null, nextRun:null};
        db.saveTask(task);
        if(task.enabled) scheduleTask(task);
        return sendJson(res,200,{task});
      }
      if(parts[2]){
        const task=db.getTask(parts[2]);
        if(!task) return sendJson(res,404,{error:'task not found'});
        if(parts[3]==='run' && req.method==='POST'){
          const run=await startScrapeRun({...task.input, mode:'task', taskId:task.id, taskName:task.name});
          db.updateTask(task.id, {lastRun:new Date().toISOString(), lastRunId:run.id});
          return sendJson(res,200,{runId:run.id, status:run.status});
        }
        if(req.method==='GET') return sendJson(res,200,{task});
        if(req.method==='DELETE'){
          if(scheduledTasks.has(parts[2])){ try{ scheduledTasks.get(parts[2]).stop(); }catch(_){} scheduledTasks.delete(parts[2]); }
          db.deleteTask(parts[2]);
          return sendJson(res,200,{ok:true});
        }
        if(req.method==='PATCH' || req.method==='POST'){
          const body=await readBody(req);
          if(body.cron!==undefined){
            if(body.cron && (!cron || !cron.validate(body.cron))) return sendJson(res,400,{error:'Invalid cron'});
            task.cron=body.cron;
          }
          if(body.enabled!==undefined) task.enabled=!!body.enabled;
          if(body.name) task.name=String(body.name).slice(0,80);
          if(body.input) task.input=body.input;
          db.saveTask(task);
          if(scheduledTasks.has(task.id)){ try{ scheduledTasks.get(task.id).stop(); }catch(_){} scheduledTasks.delete(task.id); }
          if(task.enabled && task.cron) scheduleTask(task);
          return sendJson(res,200,{task});
        }
      }
      return sendJson(res,404,{error:'not found'});
    }
    if(parts[1]==='scrape'&&req.method==='POST'){
      const body=await readBody(req);
      const run=await startScrapeRun({...body,mode:'console'});
      return sendJson(res,200,{runId:run.id,status:run.status});
    }
    if(parts[1]==='pathway-match'&&req.method==='POST'){
      const body=await readBody(req);
      if(!body.profile||!body.profile.industry) return sendJson(res,400,{error:'profile with industry required'});
      const ind=industries.find(i=>i.id===body.profile.industry);
      const profile=body.profile;
      const cityName=cities[profile.city]?cities[profile.city].name:'';
      const run=await startScrapeRun({mode:'pathway',profile,keywords:(ind&&ind.jobTitles&&ind.jobTitles[0])||'',location:cityName,sourceMode:'deep',maxRecords:60,extractCompanyData:true});
      return sendJson(res,200,{runId:run.id,status:run.status});
    }
    if(parts[1]==='pathway-result'&&req.method==='POST'){
      const body=await readBody(req);
      const run=runs.get(body.runId);
      if(!run) return sendJson(res,404,{error:'run not found'});
      if(run.status!=='succeeded') return sendJson(res,200,{ready:false,stage:run.stage,progress:progressOf(run),results:[]});
      const ind=industries.find(i=>i.id===body.profile.industry);
      const opts={cities,limit:10,realtime:true,industryKeywords:ind?ind.keywords:[]};
      let results=matcher.matchProfile(body.profile,run.jobs,opts);
      if(results.length<opts.limit){
        const relaxed=matcher.matchProfile(body.profile,run.jobs,{...opts,relaxed:true});
        const seen=new Set(results.map(r=>r.job.id));
        for(const r of relaxed){ if(seen.has(r.job.id)) continue; seen.add(r.job.id); results.push(r); if(results.length>=opts.limit) break; }
      }
      return sendJson(res,200,{ready:true,results});
    }
    if((parts[1]==='curriculum'||parts[1]==='course-builder')&&req.method==='POST'){
      const body=await readBody(req);
      return sendJson(res,200,await handleCurriculum(body));
    }
    return sendJson(res,404,{error:'not found'});
  }
  cbHandleApi = handleApi;
} catch(e){
  console.warn('Course Builder API not loaded (optional):', e.message);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  // Fallback health when Course Builder deps missing (no crawlee)
  if (url.pathname === '/api/health' && !cbHandleApi) {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:true, service:'zeelin-course-builder', mode:'no-store (results are never saved)', runs:0, time:new Date().toISOString(), fallback:true}));
    return;
  }
  if ((url.pathname === '/api/industries' || url.pathname === '/api/cities') && !cbHandleApi) {
    try {
      const data = require(url.pathname === '/api/industries' ? './course-builder/data/industries' : './course-builder/data/cities');
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(data));
      return;
    } catch(e){ /* fallthrough */ }
  }
  // Fallback mock API when heavy deps missing (no crawlee) — keeps UI functional
  if (!cbHandleApi && url.pathname.startsWith('/api/')) {
    // In-memory mock store (persist across requests via global)
    global.__mockRuns = global.__mockRuns || new Map();
    global.__mockSeq = global.__mockSeq || 0;
    const mockRuns = global.__mockRuns;
    function mockSend(o, code=200){ res.writeHead(code,{'Content-Type':'application/json'}); res.end(JSON.stringify(o)); return true; }
    const p = url.pathname;
    if (p === '/api/health') return mockSend({ok:true, service:'zeelin-course-builder', mode:'mock (no crawlee installed)', runs:mockRuns.size, time:new Date().toISOString(), mock:true});
    if (p === '/api/runs' && req.method === 'GET') return mockSend({runs: Array.from(mockRuns.values()).map(r=>({id:r.id, actor:r.actor, mode:r.mode, status:r.status, startedAt:r.startedAt, finishedAt:r.finishedAt, durationMs:r.durationMs, items:r.items}))});
    if (p.startsWith('/api/runs/') && req.method === 'GET') {
      const id = p.split('/')[3];
      const isResult = p.endsWith('/result');
      const runId = isResult ? p.split('/')[3] : p.split('/')[3];
      const id2 = isResult ? p.split('/')[3] : p.split('/')[3];
      const cleanId = p.split('/')[3];
      // handle /api/runs/:id/result vs /api/runs/:id
      const parts = p.split('/').filter(Boolean);
      const rid = parts[2];
      const run = mockRuns.get(rid);
      if (!run) return mockSend({error:'run not found'},404);
      if (parts[3]==='result') return mockSend({...run, jobs: run.jobs, progress:100});
      return mockSend({...run, progress: run.status==='running'? 45:100});
    }
    if (p === '/api/scrape' && req.method === 'POST') {
      let body=''; req.on('data',c=>body+=c); req.on('end',()=>{
        try{
          const input = body?JSON.parse(body):{};
          const id = `RUN_${String(++global.__mockSeq).padStart(4,'0')}`;
          const keywords = Array.isArray(input.keywordsList)? input.keywordsList : Array.isArray(input.keywords)? [input.keywords] : [input.keywords||'Software Engineer'];
          const loc = input.location || (Array.isArray(input.countries)? input.countries[0]:'London');
          const fakeJobs = [];
          const titles = keywords.length? keywords : ['Software Engineer','Backend Developer'];
          for(let i=0;i<Math.min(input.maxRecords||10, 10); i++){
            const kw = titles[i % titles.length];
            fakeJobs.push({
              id:`mock_${id}_${i}`,
              title: kw,
              company: ['Apex Systems','OmniGroup','Vanguard Tech','Meridian Corp'][i%4],
              location:{label: loc, country: loc},
              url:`https://example.com/job/${id}/${i}`,
              description:`Mock job for ${kw} in ${loc}. Requires ${kw} skills, teamwork, communication. Auto-generated fallback because Course Builder deps not installed. Install crawlee to get live data.`,
              requirements:{skills:[kw, 'Teamwork'], tools:['JIRA'], core:[kw], experienceYears:1, certifications:[]},
              source: (Array.isArray(input.websites)? input.websites[i%input.websites.length] : 'reed'),
              postedAt: new Date().toISOString(),
              salary:{min:35000,max:55000,currency:'GBP', raw:'£35k-£55k'},
              queryKeyword: kw
            });
          }
          const run = {id, actor:'zeelin-course-builder', mode:input.mode||'console', status:'succeeded', stage:'finished', stages:[{label:'finished',at:new Date().toISOString()}], sources:[{source:'mock',status:'succeeded',items:fakeJobs.length}], sourcesTotal:1, logs:[`[${new Date().toLocaleTimeString()}] Mock run — crawlee not installed, returning ${fakeJobs.length} synthetic jobs`], jobs:fakeJobs, items:fakeJobs.length, startedAt:new Date().toISOString(), finishedAt:new Date().toISOString(), durationMs:1200, progress:100};
          mockRuns.set(id, run);
          mockSend({runId:id, status:run.status});
        }catch(e){ mockSend({error:e.message},500); }
      });
      return true;
    }
    if ((p === '/api/pathway-match' || p === '/api/pathway-result' || p === '/api/curriculum' || p === '/api/course-builder') && req.method === 'POST') {
      // For pathway/curriculum in mock mode, just echo a minimal success
      let body=''; req.on('data',c=>body+=c); req.on('end',()=>{
        try{
          const input = body?JSON.parse(body):{};
          if(p==='/api/pathway-match'){
            const id = `RUN_${String(++global.__mockSeq).padStart(4,'0')}`;
            const run={id, actor:'zeelin-course-builder', mode:'pathway', status:'succeeded', stage:'finished', stages:[], sources:[], sourcesTotal:1, logs:[], jobs:[], items:0, startedAt:new Date().toISOString(), finishedAt:new Date().toISOString(), durationMs:500, progress:100};
            mockRuns.set(id, run);
            mockSend({runId:id, status:run.status});
          } else if(p==='/api/pathway-result'){
            mockSend({ready:true, results:[]});
          } else {
            const job=input.job||input;
            mockSend({job, curriculum:{job:{title:job.title||'Mock Role'}, framework:'Backward Design', steps:['mock'], competencies:[{skill:'Mock Skill', type:'technical', learningObjectives:[{objective:'Mock objective'}], practicalAssessment:{description:'Mock assessment'}}], modules:[{module:1,title:'Mock Module', skills:['Mock'], objectives:['Mock objective'], estimatedWeeks:2}], stats:{competencies:1, learningObjectives:1, practicalAssessments:1, modules:1, estimatedWeeks:2}, generatedAt:new Date().toISOString(), mock:true}});
          }
        }catch(e){ mockSend({error:e.message},500); }
      });
      return true;
    }
    // fallback for other api
    return mockSend({error:'mock: endpoint not implemented without deps: '+p}, 404);
  }
  // API first (unified)
  if (url.pathname.startsWith('/api/') && cbHandleApi) {
    try {
      if (await cbHandleApi(req, res, url)) return;
    } catch (err) {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error: err.message}));
      return;
    }
  }

  // Course Builder static
  let urlPath = decodeURIComponent(url.pathname);
  // Normalize: /course-builder or /course-builder/ or /course-builder/console.html
  let baseRoot = PORTAL_ROOT;
  if (urlPath === '/course-builder' || urlPath.startsWith('/course-builder/')) {
    baseRoot = COURSE_ROOT;
    urlPath = urlPath.replace(/^\/course-builder/, '') || '/';
  }
  if (urlPath === '/') urlPath = '/index.html';

  // Security: prevent traversal
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(baseRoot, safePath);

  // Ensure filePath stays within expected root
  const expectedRoot = baseRoot;
  if (!filePath.startsWith(expectedRoot)) {
    res.writeHead(403, {'Content-Type':'text/plain'});
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (stat && stat.isDirectory()) {
        const idx = path.join(filePath, 'index.html');
        if (fs.existsSync(idx)) return serve(idx);
      }
      // Fallback to portal index for SPA hashes that look like files? No, 404.
      res.writeHead(404, {'Content-Type':'text/plain'});
      res.end('Not found: ' + urlPath);
      return;
    }
    serve(filePath);
    function serve(f){
      const ext = path.extname(f);
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type': mime});
      fs.createReadStream(f).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Job Acquisition Portal (unified) running at http://localhost:${PORT}`);
  if (fs.existsSync(COURSE_ROOT)) console.log(`Course Builder mounted at http://localhost:${PORT}/course-builder/`);
  if (cbHandleApi) console.log('Course Builder API available at /api/* (also /api/course-builder)');
});

module.exports = { server };
