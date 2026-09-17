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
  function progressOf(run){
    if(run.status==='succeeded'||run.status==='failed') return 100;
    if(run.rolesTotal){
      const rolePct=(run.rolesDone||0)/run.rolesTotal;
      const adPct=(run.adsCollected||0)/(run.totalAdsGoal||1);
      const base= run.stage==='fetching details' ? 10 : run.stage==='analyzing details' ? 70 : 5;
      return Math.min(95, Math.round(rolePct*50 + adPct*30) + base);
    }
    const total=run.sourcesTotal||1;
    const done=(run.sources||[]).filter(s=>s.status!=='running'&&s.started).length;
    return Math.min(95, Math.round((done/total)*80)+(run.stage==='fetching details'?15:run.stage==='analyzing details'?70:5));
  }
  const hasProxy = Boolean(config.proxy.url) || Boolean((() => { try{ return require('./course-builder/scraper/config').proxy.url; }catch(_){ return ''; }})());
  function available(sources){ return hasProxy ? sources : sources.filter(s=>!config.sources.browserSources.includes(s));}
  const SOURCE_OPTIONS={
    all: config.sources.enabled,
    fast: ['reed','milkround','greenhouse','remotive-jobicy','adzuna','lever','ashby','workday','bamboohr'],
    deep: ['reed','milkround','indeed','google-jobs','cutshort','linkedin-jobs','glassdoor','upwork','ziprecruiter','greenhouse','remotive-jobicy','lever','ashby','workday','bamboohr'],
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
    const seen=new Map(); const websiteCache=new Map();
    const needsWebsite=[];
    for(const j of jobs){
      const key=String(j.company||'').toLowerCase();
      if(seen.has(key)||!j.company||j.company==='Unknown company') continue;
      if(j.company_url){ websiteCache.set(key,j.company_url); continue;}
      if(needsWebsite.length<6 && !needsWebsite.some(w=>w.key===key)) needsWebsite.push({key,name:j.company});
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
    for(const j of jobs){
      const key=String(j.company||'').toLowerCase();
      if(seen.has(key)||seen.size>=8) continue;
      seen.set(key,null);
      const website=j.company_url||websiteCache.get(key);
      if(website){
        try{ const c=await contacts.enrichCompany({name:j.company,website}); seen.set(key,c);}catch(_){}
      }
    }
    return jobs.map(j=>{
      const key=String(j.company||'').toLowerCase();
      const c=seen.get(key);
      const website=j.company_url||websiteCache.get(key)||null;
      if(c) j.companyDetails={contacts:c.contacts||[],decisionMakers:c.decisionMakers||[],website};
      else j.companyDetails={contacts:[],decisionMakers:[],website};
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
  function getCountriesList(input){
    if(Array.isArray(input.countries) && input.countries.length) return input.countries.map(s=>String(s).trim()).filter(Boolean);
    if(input.location) return [String(input.location).trim()];
    return ['United Kingdom'];
  }

  async function startScrapeRun(input){
    // normalize legacy fields
    if(!input.keywordsList && input.keywords) input.keywordsList=getKeywordsList(input);
    if(!input.countries) input.countries=getCountriesList(input);
    if(!input.maxAdsPerTitle) input.maxAdsPerTitle=Number(input.maxAdsPerTitle)|| Math.max(5, Math.floor((Number(input.maxRecords)||50)/Math.max(1,getKeywordsList(input).length)));
    if(!input.sheetName) input.sheetName = sanitizeSheet(input.sheetName||'Jobs');
    if(!input.analysisMode) input.analysisMode='none';
    const run={id:nextRunId(),actor:'zeelin-course-builder',mode:input.mode||'console',status:'running',input,stage:'queued',stages:[],sources:[],sourcesTotal:0,logs:[],jobs:[],items:0,cost:0.0,startedAt:new Date().toISOString(),finishedAt:null,durationMs:0, taskId:input.taskId||null, taskName:input.taskName||null};
    runs.set(run.id,run);
    runLog.unshift({id:run.id,actor:run.actor,mode:run.mode,status:'running',startedAt:run.startedAt,items:0, taskId:run.taskId});
    if(runLog.length>200) runLog.pop();
    if(db) try{ db.saveRun(run); }catch(e){ console.warn('db saveRun failed', e.message); }
    const keywordsList=getKeywordsList(input);
    const countriesList=getCountriesList(input);
    const perTitle=Math.max(1, Number(input.maxAdsPerTitle)||25);
    const totalCap=Number(input.maxRecords)|| keywordsList.length*perTitle*countriesList.length;
    // For multi-country, total goal is perTitle * keywords * countries (e.g., 25*1*25=625 capped by maxRecords 50 or 500)
    const rawTotalGoal = keywordsList.length * perTitle * countriesList.length;
    const cappedGoal = Math.min(rawTotalGoal, totalCap);
    run.sourcesTotal=(input.jobIds&&input.jobIds.length)?1: (selectSources(input).length * Math.max(1, keywordsList.length*countriesList.length));
    run.rolesTotal=keywordsList.length;
    run.rolesDone=0;
    run.adsPerRole=perTitle;
    run.totalAdsGoal=cappedGoal;
    run.adsCollected=0;
    run.perRoleProgress={}; keywordsList.forEach(k=> run.perRoleProgress[k]={done:0, total:perTitle});
    const log=makeLogger(run);
    setStage(run,'starting actor');
    log.info(`Starting actor "zeelin-course-builder"${input.mode==='pathway'?' (Pathway match)':''} — ${keywordsList.length} roles × ${countriesList.length} countries × ${perTitle}/role (cap ${totalCap})`);
    (async()=>{
      try{
        setStage(run,'fetching details');
        const onSource=(r)=>run.sources.push({source:r.source,status:r.status,items:r.items,message:r.message,started:true, q:r.q||'', c:r.c||''});
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
              return;
            }
          }
          // fan-out: country × keyword, but per-source country filter to avoid 0/50 stall for UK-only boards
          const allSources=selectSources(input);
          const batches=[];
          for(const country of countriesList){
            for(const kw of keywordsList){
              const filtered = allSources.filter(s=> isSourceSupportedForCountry(s, country));
              if(!filtered.length) {
                log.info(`Skipping ${kw} @ ${country} — no sources support this country (UK-only boards filtered)`);
                continue;
              }
              batches.push({country, kw, sources: filtered});
            }
          }
          if(!batches.length){
            log.warn(`No batches after country filter for ${countriesList.length} countries × ${keywordsList.length} keywords — check supported countries`);
            // fallback: use all sources for first country only to avoid 0 jobs
            batches.push({country: countriesList[0]||'United Kingdom', kw: keywordsList[0], sources: allSources});
          }
          log.info(`Fan-out plan: ${batches.length} batches (${countriesList.join(', ')}) × (${keywordsList.slice(0,3).join(', ')}${keywordsList.length>3?'…':''}) — multitasking all countries simultaneously (per-source country filter, UK-only boards only for UK)`);
          // Intense simultaneous: run ALL batches concurrently with concurrency limit to avoid overload
          const concurrency = Math.min(8, batches.length); // up to 8 parallel, still intense but controlled
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
            async function worker(){
              while(idx < items.length){
                const cur = idx++;
                const item = items[cur];
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
                  // include country count in progress: e.g., 9/12
                  log.info(`Fetching job ads | Countries ${run.countriesDone}/${run.countriesTotal} · Job roles ${run.rolesDone}/${run.rolesTotal} · ${q} (${item.country}): ${run.perRoleProgress[q].done}/${perTitle*countriesList.length} ads · total ${run.adsCollected}/${run.totalAdsGoal} · Batch ${cur+1}/${batches.length}`);
                  if(res.res.results) allResults=allResults.concat(res.res.results);
                  run.sourcesTotal=Math.max(run.sourcesTotal, allResults.length||sources.length*batches.length);
                  // update run for live preview polling
                  run.progress = Math.min(95, Math.round((run.adsCollected/run.totalAdsGoal)*80) + 10);
                  run.stage = 'fetching details';
                }
              }
            }
            const workers= Array.from({length:Math.min(limit, items.length)}, ()=> worker());
            await Promise.all(workers);
            return results;
          }
          await runWithConcurrency(batches, concurrency, async ({country, kw, sources: batchSources})=>{
            const q=kw; const loc=country;
            const srcs = batchSources || allSources;
            const wrappedOnSource=(r)=> onSource({...r, q, c:country});
            try{
              const res=await scraper.run({sources: srcs, query:q, location: loc, limit: perTitle, log:{ info:()=>{}, warn:()=>{} }, onSource: wrappedOnSource});
              // supervised: title-relevant filter before mapping (remove Salesforce noise) + HTML clean
              res.jobs = (res.jobs||[]).filter(j=>{
                const t=String(j.title||'').toLowerCase();
                const qlow=q.toLowerCase();
                return t.includes(qlow) || t.includes(qlow.split(' ')[0]);
              });
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
          if(!allJobs.length){
            // fallback single run if fan-out yielded nothing (e.g., scraper loop not triggered)
            log.info('Fan-out returned 0, trying single combined query as fallback');
            const fallbackQ=keywordsList.join(' ');
            const res=await scraper.run({sources: allSources, query: fallbackQ, location: countriesList[0]||'', limit: totalCap, log, onSource});
            (res.jobs||[]).forEach(j=>{ j.queryKeyword=keywordsList[0]; j.country=countriesList[0]; ensureRequirements(j); });
            allJobs=res.jobs||[];
            allResults=res.results||[];
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
            log.info(`Shortfall ${validJobs.length}/${totalCap} — going deeper to fetch ${need} more (replacement for missing)`);
            // Re-run fan-out for shortfall with +2 perTitle for each keyword, limited to 1 retry to avoid infinite loop
            const extraPerTitle = Math.ceil(need / Math.max(1, keywordsList.length * countriesList.length)) + 2;
            // Simple retry: run once more with increased limit for the least-served country/role
            try{
              const retryBatches = [];
              // Find countries with least jobs
              const countryCounts={}; validJobs.forEach(j=>{ const c=j.country||'Unknown'; countryCounts[c]=(countryCounts[c]||0)+1; });
              const sortedCountries = Object.entries(countryCounts).sort((a,b)=>a[1]-b[1]).map(e=>e[0]);
              const targetCountries = sortedCountries.length? sortedCountries.slice(0,3) : countriesList.slice(0,2);
              for(const c of targetCountries){
                for(const kw of keywordsList.slice(0,2)){
                  retryBatches.push({country:c, kw});
                }
              }
              const retrySources = selectSources(input);
              const retryJobs=[];
              for(const {country, kw} of retryBatches.slice(0,6)){
                try{
                  const res=await scraper.run({sources: retrySources, query:kw, location:country, limit: extraPerTitle, log:{info:()=>{}, warn:()=>{}}, onSource:()=>{}});
                  res.jobs.forEach(j=>{ j.queryKeyword=kw; j.country=country; ensureRequirements(j); });
                  retryJobs.push(...res.jobs);
                }catch(_){}
              }
              const retryValid = retryJobs.filter(isCompleteJob).filter(j=> !validJobs.some(v=> v.url===j.url));
              if(retryValid.length){
                log.info(`Replacement fetch got ${retryValid.length} additional valid ads`);
                validJobs.push(...retryValid);
              }
            }catch(e){ log.warn(`Replacement fetch failed: ${e.message}`); }
          }
        }
        // bucket handling: per-country for multi-country bulk to ensure 30-35 across 25 countries
        let jobsToFilter;
        if (countriesList.length > 1) {
          // Multi-country: distribute evenly, aim for totalCap (30-35)
          const perCountryTarget = Math.ceil(totalCap / countriesList.length);
          const byCountry={};
          validJobs.forEach(j=>{ const c=j.country||'Unknown'; (byCountry[c]=byCountry[c]||[]).push(j); });
          let balancedMulti=[];
          // Round-robin 1 per country until totalCap
          let added=true;
          while(balancedMulti.length < totalCap && added){
            added=false;
            for(const c of countriesList){
              const bucket=byCountry[c];
              if(bucket && bucket.length){
                balancedMulti.push(bucket.shift());
                added=true;
                if(balancedMulti.length >= totalCap) break;
              }
            }
          }
          // Fill remaining from any leftover
          if(balancedMulti.length < totalCap){
            const remaining = Object.values(byCountry).flat();
            balancedMulti.push(...remaining.slice(0, totalCap - balancedMulti.length));
          }
          jobsToFilter = balancedMulti.slice(0, totalCap);
          if(jobsToFilter.length < 30) log.warn(`Multi-country shortfall ${jobsToFilter.length}/${totalCap} — collected ${validJobs.length} valid, need deeper scrape`);
          else log.info(`Multi-country balanced ${jobsToFilter.length}/${totalCap} across ${countriesList.length} countries`);
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
        run.sources=allResults.map(r=>({source:r.source,status:r.status,items:r.items,message:r.message,started:true}));
        run.sourcesTotal=allResults.length || run.sourcesTotal;
        setStage(run,'analyzing details');
        log.info(`Collected ${jobsToFilter.length} balanced jobs (from ${validJobs.length} valid, ${allJobs.length} unique, ${beforeDedupe} raw) — analyzing details …`);
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
              const er=await enrichMod.enrichJobs(jobs,{concurrency:3,onProgress:(d,t)=>{ run.aiProgress={done:d,total:t}; }});
              jobs=er.jobs; run.aiStats=er.stats;
              log.info(`AI enrichment: ${er.stats.ai} ai / ${er.stats.fallback} deterministic / ${er.stats.cached} cached`);
            } else log.warn('AI requested but OPENCODE_API_KEY not set — deterministic output kept');
          }catch(e){ log.warn('AI pass failed, keeping deterministic: '+String((e&&e.message)||e).slice(0,120)); }
        }
        run.jobs=jobs; run.items=jobs.length; run.status='succeeded'; run.finishedAt=new Date().toISOString(); run.durationMs=Date.now()-new Date(run.startedAt).getTime(); run.cost=0.0;
        setStage(run,'finished'); log.info(`Run finished — ${jobs.length} jobs ready. Countries: ${countriesList.join(', ')} | Keywords: ${keywordsList.length} | ${input.analysisMode!=='none' ? 'analysis:'+input.analysisMode : 'no analysis'}`);
        const entry=runLog.find(r=>r.id===run.id); if(entry){ entry.status=run.status; entry.items=jobs.length; entry.finishedAt=run.finishedAt; entry.durationMs=run.durationMs; }
        if(db) try{ db.saveRun(run); }catch(e){ console.warn('db saveRun finish failed', e.message); }
      }catch(err){
        run.status='failed'; run.finishedAt=new Date().toISOString(); run.message=err.message; setStage(run,'failed'); log.warn(`Run failed: ${err.message}`);
        const entry=runLog.find(r=>r.id===run.id); if(entry) entry.status=run.status;
        if(db) try{ db.saveRun(run); }catch(e){ console.warn('db saveRun fail failed', e.message); }
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
  const EXPORT_HEADERS=["Company_Name","Industry","Experience_Level","Core_Functional_Skills","TOOLS","AI_Emerging_Capabilities","Key_Responsibility","Salary","Salary_Min","Salary_Max","Salary_Currency","Salary_Period","Posted_Date","Posted_Time","Source_Platform","Platform","URL","Job_URL","Job_URL_Direct","Source_URL","Scraped_At","Location_Country","Location_Region","Location_Label","Is_Remote","Is_Hybrid","Job_Type","Seniority_Level","Easy_Apply","Company_Rating","Company_Reviews_Count","Company_Size","Company_Industry","Employment_Type","Workplace_Type","Description","Skills","Query_Keyword","Company_URL","Apply_URL","Posted_Date_Raw"];
  function jobToExportRow(j){
     const loc=j.location||{};
    const sal=j.salary||{};
    return [
      j.Company_Name||j.company||'',
      j.Industry||j.industry||'',
      j.Experience_Level||j.experienceLevel||j.seniority_level||'',
      (j.Core_Functional_Skills||j.requirements?.core||[]).join('; '),
      (j.TOOLS||j.requirements?.tools||[]).join('; '),
      (j.AI_Emerging_Capabilities||j.requirements?.ai||[]).join('; '),
      (j.Key_Responsibility||j.requirements?.responsibilities||[]).join(' | '),
      j.salary ? (sal.raw || ((sal.min||'') + (sal.max? '–'+sal.max:''))) : (j.Salary||''),
      sal.min||'',
      sal.max||'',
      sal.currency||'',
      sal.period||'',
      j.Posted_Date||'',
      j.Posted_Time||'',
      j.Source_Platform||j.source||j.platform||'',
      j.platform||j.source||'',
      j.URL||j.url||j.job_url||'',
      j.job_url||j.url||'',
      j.job_url_direct||j.url||'',
      j.source_url||j.url||'',
      j.scraped_at||new Date().toISOString(),
      loc.country||j.country|| (loc.label||'').split(',').pop()?.trim()||'',
      loc.region||'',
      loc.label||'',
      j.is_remote||j.isRemote ? 'TRUE':'FALSE',
      j.isHybrid ? 'TRUE':'FALSE',
      j.employmentType||j.job_type||'',
      j.seniority_level||j.seniority||'',
      j.easy_apply ? 'TRUE':'FALSE',
      j.company_rating||'',
      j.company_reviews_count||'',
      j.company_size||'',
      j.company_industry||j.Industry||'',
      j.employmentType||'',
      j.workplaceType|| (j.is_remote?'remote': j.isHybrid?'hybrid':'on-site'),
      (j.description||'').slice(0,500),
      (j.requirements?.skills||[]).join('; '),
      j.queryKeyword||j.Query_Keyword||j.title||'',
      j.company_url||'',
      j.url||j.job_url||'',
      j.postedAt||j.Posted_Date||''
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
        const cRaw=(j.location?.country||j.country||j.queryKeyword||'Unknown').split(',').pop().trim()||'Unknown';
        // supervised exact match only (no substring) to avoid US->Australia collision
        let targetKey=Object.keys(groups).find(k=> k.toLowerCase()===cRaw.toLowerCase());
        if(!targetKey){
          // fallback: try case-insensitive sanitized exact after trimming
          const sanitizedC=sanitizeSheet(cRaw).toLowerCase();
          targetKey=Object.keys(groups).find(k=> k.toLowerCase()===sanitizedC);
        }
        if(!targetKey){
          targetKey=Object.keys(groups)[0]||sanitizeSheet('Unknown');
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
    if(parts[1]==='health'){ const mode=db?'local JSON DB (persistent, view previous runs)':'no-store (results are never saved)'; let ai=false; try{ ai=require('./course-builder/scraper/enrich').aiAvailable(); }catch(_){} return sendJson(res,200,{ok:true,service:'zeelin-course-builder',mode,runs:db?db.listRuns(200).length:runs.size,time:new Date().toISOString(),aiAvailable:ai});}
    if(parts[1]==='industries') return sendJson(res,200,industries);
    if(parts[1]==='cities') return sendJson(res,200,cities);
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
        // ensure in-memory cache
        if(!runs.has(parts[2]) && run) runs.set(parts[2], run);
        if(parts[3]==='result') return sendJson(res,200,publicRun(run,{withJobs:true}));
        if(parts[3]==='export'){
          const body= (req.method==='POST' ? await readBody(req) : {});
          const fmt=(url.searchParams.get('format')||body.format||'xlsx').toLowerCase();
          const sheetName=body.sheetName||run.input.sheetName||'Jobs';
          const analysisMode=body.analysisMode||run.input.analysisMode||'none';
          if(fmt==='csv'){
            const headers=EXPORT_HEADERS;
            const rows=[headers.join(',')];
            (run.jobs||[]).forEach(j=>{
              const r=jobToExportRow(j).map(v=>`"${String(v).replace(/"/g,'""')}"`);
              rows.push(r.join(','));
            });
            const csv=rows.join('\n');
            res.writeHead(200, {'Content-Type':'text/csv', 'Content-Disposition':`attachment; filename="${sanitizeSheet(sheetName)}-${run.id}.csv"`});
            res.end(csv);
            return true;
          }
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
          const dbRuns=db.listRuns(100).map(r=>({id:r.id, actor:r.actor, mode:r.mode, status:r.status, startedAt:r.startedAt, finishedAt:r.finishedAt, durationMs:r.durationMs, items:r.items, taskId:r.taskId}));
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
