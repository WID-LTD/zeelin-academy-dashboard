/* ─── Job Acquisition Portal — Cohort-Based Data Layer (Revamp) ─── */

/* Country-categorized demo boards + direct links */
const REGIONAL_BOARDS_DATA = [
  {
    id:'uk',
    region:'UK Region',
    regionLabel:'UK Region',
    badgeBorder:'#3b82f6',
    badgeColor:'#38bdf8',
    title:'Reed.co.uk & Totaljobs',
    desc:'Verified UK hiring portals featuring active business systems analysis and supply chain openings.',
    img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    link:'https://www.reed.co.uk',
    demoLink:'https://www.reed.co.uk/jobs?keywords=business+analyst&location=london',
    btnBg:'#2563eb',
    btnBorder:'#3b82f6',
    shadow:'0 4px 12px rgba(37,99,235,0.3)'
  },
  {
    id:'us',
    region:'US Region',
    regionLabel:'US Region',
    badgeBorder:'#16a34a',
    badgeColor:'#4ade80',
    title:'Indeed USA & Glassdoor',
    desc:'North American enterprise job boards indexing thousands of verified corporate positions.',
    img:'https://images.unsplash.com/photo-1485738422979-f5c462def9f7?auto=format&fit=crop&w=600&q=80',
    link:'https://www.indeed.com',
    demoLink:'https://www.indeed.com/q-business-analyst-jobs.html',
    btnBg:'#16a34a',
    btnBorder:'#22c55e',
    shadow:'0 4px 12px rgba(22,163,74,0.3)'
  },
  {
    id:'ng',
    region:'Africa & Nigeria',
    regionLabel:'Africa & Nigeria',
    badgeBorder:'#d97706',
    badgeColor:'#f59e0b',
    title:'Jobberman & TechCabal Jobs',
    desc:'Premier African employment platforms featuring tech, finance, and supply chain roles.',
    img:'https://images.unsplash.com/photo-1578592829428-569bab29f79b?auto=format&fit=crop&w=600&q=80',
    link:'https://www.jobberman.com',
    demoLink:'https://www.jobberman.com/jobs?search=business+analyst',
    btnBg:'#d97706',
    btnBorder:'#f59e0b',
    shadow:'0 4px 12px rgba(217,119,6,0.3)'
  },
  {
    id:'remote',
    region:'Global Remote',
    regionLabel:'Global Remote',
    badgeBorder:'#a855f7',
    badgeColor:'#c084fc',
    title:'We Work Remotely & LinkedIn',
    desc:'Top-tier remote job networks for international distributed teams and companies.',
    img:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    link:'https://weworkremotely.com',
    demoLink:'https://weworkremotely.com/categories/remote-programming-jobs',
    btnBg:'#9333ea',
    btnBorder:'#a855f7',
    shadow:'0 4px 12px rgba(147,51,234,0.3)'
  }
];

/* Boost accountability — initial demo history */
const BOOST_INITIAL_APPLICATIONS = [
  {id:'b1', company:'Greencore', role:'Senior Business Analyst (HR)', link:'https://www.reed.co.uk/jobs/greencore-ba', requirements:'Business Analysis, Stakeholder Mapping, Excel', dateApplied:'2026-08-26', datePosted:'2026-08-24', status:'applied'},
  {id:'b2', company:'TechCorp Global', role:'Systems Integration Analyst', link:'https://www.indeed.com/techcorp-integration', requirements:'Systems Integration, SQL, API Mapping', dateApplied:'2026-08-27', datePosted:'2026-08-25', status:'interview'},
  {id:'b3', company:'Apex Global', role:'Supply Chain Data Specialist', link:'https://www.jobberman.com/apex-supply-chain', requirements:'Supply Chain, Data Modelling, PowerBI', dateApplied:'2026-08-28', datePosted:'2026-08-26', status:'applied'}
];

/* Mock interview questions (renamed from scenarios) */
const MOCK_QUESTIONS_DATA = [
  {id:'mq1', label:'Question Set A', title:'Stakeholder Conflict Resolution', desc:'Handling conflicting requirements between inventory managers and executive sponsors.', guide:'Review elicitation, prioritization (MoSCoW), and mediation techniques.'},
  {id:'mq2', label:'Question Set B', title:'Spreadsheet Financial Model Defense', desc:'Defending ROI calculations and carrying cost multipliers under cross-examination.', guide:'Review formula auditing, cell locking, and sensitivity analysis.'},
  {id:'mq3', label:'Question Set C', title:'Requirements Elicitation Sprint', desc:'Rapid BRS drafting under ambiguous scope with multiple stakeholders.', guide:'Review interview scripting, process mapping, and validation loops.'},
  {id:'mq4', label:'Question Set D', title:'Behavioural STAR Deep Dive', desc:'Narrate a time you turned a failing delivery into a controlled success.', guide:'Review STAR structure, metrics, and reflection.'}
];

/* Events & Sessions Hub cards */
const EVENTS_HUB_CARDS = [
  {id:'cal', badge:'Schedule', badgeBorder:'#d97706', badgeColor:'#f59e0b', title:'Calendar & Events/Live', desc:'Interactive scheduling suite tracking cohort milestones, live workshop dates, and mentor booking timelines.', img:'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80', btnText:'Open Calendar', btnBg:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', btnBorder:'#f59e0b', route:'calendar'},
  {id:'rec', badge:'Archive', badgeBorder:'#16a34a', badgeColor:'#4ade80', title:'Recordings', desc:'Comprehensive on-demand video archive of all past cohort technical reviews, lectures, and mock interview walkthroughs.', img:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', btnText:'Browse Recordings', btnBg:'#16a34a', btnBorder:'#22c55e', route:'recordings'},
  {id:'live', badge:'Broadcast', badgeBorder:'#2563eb', badgeColor:'#38bdf8', title:'Live Sessions', desc:'Direct access to active broadcasting rooms, mentor Q&A sessions, and real-time collaborative review calls.', img:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80', btnText:'Join Live Rooms', btnBg:'#2563eb', btnBorder:'#3b82f6', route:'live-sessions'}
];

/* Recordings archive */
const RECORDINGS_DATA = [
  {id:'r1', sessionLabel:'Live Session #3', sessionColor:'#38bdf8', sessionBg:'#1e293b', sessionBorder:'#3b82f6', date:'Recorded Aug 24, 2026', title:'Supply Chain Model Q&A Walkthrough', desc:'Comprehensive deep dive into inventory holding costs, cell reference locking across sheet structures, and error-handling in complex financial spreadsheets.', instructor:'Dr. O. Emeka', duration:'1h 45m', thumb:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'},
  {id:'r2', sessionLabel:'Live Session #2', sessionColor:'#f59e0b', sessionBg:'#2c1a0e', sessionBorder:'#d97706', date:'Recorded Aug 20, 2026', title:'Stakeholder Elicitation & BRS Best Practices', desc:'Step-by-step methodology on gathering client requirements, structuring functional scopes, and accurately mapping MoSCoW prioritization matrices.', instructor:'Dr. O. Emeka', duration:'2h 10m', thumb:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'},
  {id:'r3', sessionLabel:'Live Session #1', sessionColor:'#4ade80', sessionBg:'#064e3b', sessionBorder:'#10b981', date:'Recorded Aug 15, 2026', title:'Stage 1 Foundation Review & Onboarding', desc:'Orientation session introducing portal workflows, tool repository navigation, and foundational principles for in-house project execution.', instructor:'Sarah Jenkins', duration:'1h 20m', thumb:'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'}
];

/* Calendar & mentor slots */
const CALENDAR_DATA = {
  monthLabel:'August 2026 Master Calendar',
  days:['MON','TUE','WED','THU','FRI','SAT','SUN'],
  cells:[
    {d:27, muted:true},{d:28, muted:true},{d:29, muted:true},{d:30, muted:true},{d:31, muted:true},
    {d:1},{d:2},{d:3},{d:4},{d:5},{d:6},{d:7},{d:8},{d:9},{d:10},{d:11},{d:12},{d:13},{d:14},{d:15},{d:16},{d:17},{d:18},{d:19},{d:20},{d:21},{d:22},{d:23},{d:24},{d:25},{d:26},{d:27},{d:28, highlight:true},{d:29},{d:30}
  ],
  upcoming:[
    {badge:'Live Today', badgeBg:'#064e3b', badgeColor:'#34d399', badgeBorder:'#10b981', time:'14:00 WAT', title:'Supply Chain Model Q&A Walkthrough', mentor:'Dr. O. Emeka', action:'Join Live Room ↗', actionStyle:'primary'},
    {badge:'Tomorrow', badgeBg:'#1e293b', badgeColor:'#38bdf8', badgeBorder:'#3b82f6', time:'10:00 WAT', title:'Behavioral Mock Interview Masterclass', mentor:'Sarah Jenkins', action:'Reserve Seat', actionStyle:'secondary'}
  ],
  previous:[
    {date:'Recorded on Aug 24, 2026', title:'Stage 2 Project Orientation & Vault Setup', duration:'Duration: 1h 45m'},
    {date:'Recorded on Aug 20, 2026', title:'Stakeholder Elicitation & BRS Best Practices', duration:'Duration: 2h 10m'}
  ],
  mentors:[
    {name:'Dr. O. Emeka', role:'Lead Mentor', date:'Monday, Aug 31 • 14:00 WAT', label:'Next Available Slot', labelColor:'#34d399', btnPrimary:true},
    {name:'Sarah Jenkins', role:'Career Coaching Slot', date:'Tuesday, Sep 1 • 11:00 WAT', label:'Career Coaching Slot', labelColor:'#38bdf8', btnPrimary:false}
  ]
};

/* Overview 5-card grid (Regional + Boost + Interview + CV Maker + Events Hub) */
const OVERVIEW_CARDS = [
  {id:'regional', title:'Regional Job Boards', desc:'Country-categorized verified boards for UK, US, Nigeria, and Remote markets.', img:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80', btnText:'Access Boards', btnBg:'#2563eb', btnBorder:'#3b82f6', route:'regional-boards'},
  {id:'boost', title:'Boost Application', desc:'Accountability engine enforcing the mandatory 5-job application quota.', img:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=80', btnText:'Log Applications', btnBg:'#d97706', btnBorder:'#f59e0b', route:'boost'},
  {id:'mock', title:'Interview & Mock Hub', desc:'Document-based assignments, mock scenarios, and 1-on-1 booking calendar.', img:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80', btnText:'Start Prep', btnBg:'#16a34a', btnBorder:'#22c55e', route:'interview-prep'},
  {id:'cv', title:'CV Maker & Portfolio', desc:'ATS Smart Resume Generator with live preview and 5 template themes.', img:'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=500&q=80', btnText:'Build CV', btnBg:'#9333ea', btnBorder:'#a855f7', route:'cv-maker'},
  {id:'events', title:'Events & Sessions Hub', desc:'Calendar, live workshops, recordings archive and mentor booking.', img:'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80', btnText:'Open Hub', btnBg:'#0ea5e9', btnBorder:'#38bdf8', route:'events-hub'}
];

/* Legacy keeps for compatibility */
const JOBS_DATA = [];
const COMPANIES_DATA = [];
const PIPELINE_DATA = {applied:[], interviewing:[], offer:[]};
const PORTFOLIO_DATA = {targetJob:'', keywordMatch:96, requiredSkills:'', projects:[{id:'pp1', verified:true, score:92, title:'Retail Enterprise Inventory & Supply Chain Optimization', desc:'Includes BRS documentation and financial spreadsheet models.', included:true}], checklist:[]};
const ANALYTICS_DATA = {matchIndex:95, skills:[], weeklyApps:[], scorecard:[]};
const PORTAL_CARDS = OVERVIEW_CARDS;
const PORTAL_FAQS = [];
