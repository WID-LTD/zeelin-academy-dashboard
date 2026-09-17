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

/* ─── Country-based Job Boards Directory (25 countries, 5 regions) — Workers fetch OG preview ─── */
const JOB_COUNTRIES = [
  {id:'nz', name:'New Zealand', flag:'🇳🇿', flagImg:'assets/flags/nz.png', region:'Oceania', hero:'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80'},
  {id:'ie', name:'Ireland', flag:'🇮🇪', flagImg:'assets/flags/ie.png', region:'Europe', hero:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80'},
  {id:'au', name:'Australia', flag:'🇦🇺', flagImg:'assets/flags/au.png', region:'Oceania', hero:'https://images.unsplash.com/photo-1523424080367-98cea630a2e6?auto=format&fit=crop&w=600&q=80'},
  {id:'us', name:'United States', flag:'🇺🇸', flagImg:'assets/flags/us.png', region:'North America', hero:'https://images.unsplash.com/photo-1485738422979-f5c462def9f7?auto=format&fit=crop&w=600&q=80'},
  {id:'ca', name:'Canada', flag:'🇨🇦', flagImg:'assets/flags/ca.png', region:'North America', hero:'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=600&q=80'},
  {id:'gb', name:'United Kingdom', flag:'🇬🇧', flagImg:'assets/flags/gb.png', region:'Europe', hero:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80'},
  {id:'ng', name:'Nigeria', flag:'🇳🇬', flagImg:'assets/flags/ng.png', region:'Africa', hero:'https://images.unsplash.com/photo-1578592829428-569bab29f79b?auto=format&fit=crop&w=600&q=80'},
  {id:'za', name:'South Africa', flag:'🇿🇦', flagImg:'assets/flags/za.png', region:'Africa', hero:'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?auto=format&fit=crop&w=600&q=80'},
  {id:'ke', name:'Kenya', flag:'🇰🇪', flagImg:'assets/flags/ke.png', region:'Africa', hero:'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=600&q=80'},
  {id:'gh', name:'Ghana', flag:'🇬🇭', flagImg:'assets/flags/gh.png', region:'Africa', hero:'https://images.unsplash.com/photo-1516026672322-bc52d61a55e5?auto=format&fit=crop&w=600&q=80'},
  {id:'ug', name:'Uganda', flag:'🇺🇬', flagImg:'assets/flags/ug.png', region:'Africa', hero:'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'},
  {id:'zw', name:'Zimbabwe', flag:'🇿🇼', flagImg:'assets/flags/zw.png', region:'Africa', hero:'https://images.unsplash.com/photo-1516026672322-bc52d61a55e5?auto=format&fit=crop&w=600&q=80'},
  {id:'in', name:'India', flag:'🇮🇳', flagImg:'assets/flags/in.png', region:'Asia', hero:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80'},
  {id:'pk', name:'Pakistan', flag:'🇵🇰', flagImg:'assets/flags/pk.png', region:'Asia', hero:'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80'},
  {id:'sg', name:'Singapore', flag:'🇸🇬', flagImg:'assets/flags/sg.png', region:'Asia', hero:'https://images.unsplash.com/photo-1525625293386-3f8f993a32c5?auto=format&fit=crop&w=600&q=80'},
  {id:'ph', name:'Philippines', flag:'🇵🇭', flagImg:'assets/flags/ph.png', region:'Asia', hero:'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80'},
  {id:'jm', name:'Jamaica', flag:'🇯🇲', flagImg:'assets/flags/jm.png', region:'Caribbean', hero:'https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=600&q=80'},
  {id:'bs', name:'Bahamas', flag:'🇧🇸', flagImg:'assets/flags/bs.png', region:'Caribbean', hero:'https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=600&q=80'},
  {id:'tt', name:'Trinidad & Tobago', flag:'🇹🇹', flagImg:'assets/flags/tt.png', region:'Caribbean', hero:'https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=600&q=80'},
  {id:'bz', name:'Belize', flag:'🇧🇿', flagImg:'assets/flags/bz.png', region:'Caribbean', hero:'https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=600&q=80'},
  {id:'gy', name:'Guyana', flag:'🇬🇾', flagImg:'assets/flags/gy.png', region:'Caribbean', hero:'https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=600&q=80'},
  {id:'fj', name:'Fiji', flag:'🇫🇯', flagImg:'assets/flags/fj.png', region:'Oceania', hero:'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80'},
  {id:'pg', name:'Papua New Guinea', flag:'🇵🇬', flagImg:'assets/flags/pg.png', region:'Oceania', hero:'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80'},
  {id:'ws', name:'Samoa', flag:'🇼🇸', flagImg:'assets/flags/ws.png', region:'Oceania', hero:'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80'},
  {id:'remote', name:'Global Remote', flag:'🌐', flagImg:'assets/flags/globe.png', region:'Remote', hero:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'}
];

const JOB_BOARDS = [
  {id:'nz-seek', countryId:'nz', name:'Seek NZ', url:'https://www.seek.co.nz', demoUrl:'https://www.seek.co.nz/business-analyst-jobs', category:'general', desc:'Largest NZ board with strong business analysis listings.', boardImg:'assets/boards/board-1.jpg'},
  {id:'nz-trademe', countryId:'nz', name:'Trade Me Jobs', url:'https://www.trademe.co.nz/a/jobs', demoUrl:'https://www.trademe.co.nz/a/jobs/search?search_string=business+analyst', category:'general', desc:'NZ marketplace giant with local employer listings.', boardImg:'assets/boards/board-2.jpg'},
  {id:'nz-careers', countryId:'nz', name:'Careers.govt.nz', url:'https://www.careers.govt.nz', demoUrl:'https://www.careers.govt.nz/jobs-database/', category:'general', desc:'Government career explorer and role database.', boardImg:'assets/boards/board-3.jpg'},
  {id:'ie-irishjobs', countryId:'ie', name:'IrishJobs', url:'https://www.irishjobs.ie', demoUrl:'https://www.irishjobs.ie/Jobs/Business-Analyst', category:'general', desc:'Irelands biggest jobs site with BA and systems roles.', boardImg:'assets/boards/board-4.jpg'},
  {id:'ie-jobsie', countryId:'ie', name:'Jobs.ie', url:'https://www.jobs.ie', demoUrl:'https://www.jobs.ie/business-analyst-jobs', category:'general', desc:'Irish board for tech, finance and analyst roles.', boardImg:'assets/boards/board-5.jpg'},
  {id:'ie-recruitireland', countryId:'ie', name:'RecruitIreland', url:'https://www.recruitireland.com', demoUrl:'https://www.recruitireland.com/search-jobs/business-analyst', category:'general', desc:'Irish recruitment board across sectors.', boardImg:'assets/boards/board-6.jpg'},
  {id:'au-seek', countryId:'au', name:'Seek Australia', url:'https://www.seek.com.au', demoUrl:'https://www.seek.com.au/business-analyst-jobs', category:'general', desc:'Australias #1 board for analyst roles.', boardImg:'assets/boards/board-7.jpg'},
  {id:'au-jora', countryId:'au', name:'Jora Australia', url:'https://au.jora.com', demoUrl:'https://au.jora.com/j?l=&q=Business+Analyst', category:'general', desc:'Aggregator sweeping AU employer sites.', boardImg:'assets/boards/board-8.jpg'},
  {id:'au-careerone', countryId:'au', name:'CareerOne', url:'https://www.careerone.com.au', demoUrl:'https://www.careerone.com.au/jobs/business-analyst-jobs', category:'general', desc:'Long-running Australian job board.', boardImg:'assets/boards/board-9.jpg'},
  {id:'au-indeed', countryId:'au', name:'Indeed Australia', url:'https://au.indeed.com', demoUrl:'https://au.indeed.com/q-business-analyst-jobs.html', category:'general', desc:'Indeed Australia edition.', boardImg:'assets/boards/board-10.jpg'},
  {id:'us-indeed', countryId:'us', name:'Indeed USA', url:'https://www.indeed.com', demoUrl:'https://www.indeed.com/q-business-analyst-jobs.html', category:'general', desc:'Largest US aggregator for corporate roles.', boardImg:'assets/boards/board-11.jpg'},
  {id:'us-zip', countryId:'us', name:'ZipRecruiter', url:'https://www.ziprecruiter.com', demoUrl:'https://www.ziprecruiter.com/Jobs/Business-Analyst', category:'general', desc:'US quick-apply board with alerts.', boardImg:'assets/boards/board-12.jpg'},
  {id:'us-glassdoor', countryId:'us', name:'Glassdoor', url:'https://www.glassdoor.com', demoUrl:'https://www.glassdoor.com/Job/business-analyst-jobs-SRCH_KO0,16.htm', category:'general', desc:'Reviews plus verified US listings.', boardImg:'assets/boards/board-13.jpg'},
  {id:'us-dice', countryId:'us', name:'Dice', url:'https://www.dice.com', demoUrl:'https://www.dice.com/jobs?q=business+analyst', category:'general', desc:'US tech and systems analyst board.', boardImg:'assets/boards/board-14.jpg'},
  {id:'ca-indeed', countryId:'ca', name:'Indeed Canada', url:'https://ca.indeed.com', demoUrl:'https://ca.indeed.com/q-business-analyst-jobs.html', category:'general', desc:'Indeed Canada edition.', boardImg:'assets/boards/board-15.jpg'},
  {id:'ca-jobbank', countryId:'ca', name:'Job Bank Canada', url:'https://www.jobbank.gc.ca', demoUrl:'https://www.jobbank.gc.ca/jobsearch/searchJobs?searchstring=business+analyst', category:'general', desc:'Government of Canada official board.', boardImg:'assets/boards/board-16.jpg'},
  {id:'ca-eluta', countryId:'ca', name:'Eluta', url:'https://www.eluta.ca', demoUrl:'https://www.eluta.ca/search?q=business+analyst', category:'general', desc:'Direct-from-employer Canadian listings.', boardImg:'assets/boards/board-1.jpg'},
  {id:'ca-workopolis', countryId:'ca', name:'Workopolis', url:'https://www.workopolis.com', demoUrl:'https://www.workopolis.com/jobsearch/business-analyst-jobs', category:'general', desc:'Long-standing Canadian job board.', boardImg:'assets/boards/board-2.jpg'},
  {id:'gb-reed', countryId:'gb', name:'Reed.co.uk', url:'https://www.reed.co.uk', demoUrl:'https://www.reed.co.uk/jobs?keywords=business+analyst&location=london', category:'general', desc:'UKs leading board for analyst roles.', boardImg:'assets/boards/board-3.jpg'},
  {id:'gb-totaljobs', countryId:'gb', name:'Totaljobs', url:'https://www.totaljobs.com', demoUrl:'https://www.totaljobs.com/jobs/business-analyst', category:'general', desc:'Major UK board for business roles.', boardImg:'assets/boards/board-4.jpg'},
  {id:'gb-cvlibrary', countryId:'gb', name:'CV-Library', url:'https://www.cv-library.co.uk', demoUrl:'https://www.cv-library.co.uk/business-analyst-jobs', category:'general', desc:'UK CV database plus live vacancies.', boardImg:'assets/boards/board-5.jpg'},
  {id:'gb-jobsite', countryId:'gb', name:'Jobsite', url:'https://www.jobsite.co.uk', demoUrl:'https://www.jobsite.co.uk/jobs/business-analyst', category:'general', desc:'UK board with analyst and IT roles.', boardImg:'assets/boards/board-6.jpg'},
  {id:'ng-jobberman', countryId:'ng', name:'Jobberman Nigeria', url:'https://www.jobberman.com', demoUrl:'https://www.jobberman.com/jobs?search=business+analyst', category:'general', desc:'Nigerias top jobs platform.', boardImg:'assets/boards/board-7.jpg'},
  {id:'ng-myjobmag', countryId:'ng', name:'MyJobMag Nigeria', url:'https://www.myjobmag.com', demoUrl:'https://www.myjobmag.com/jobs-at?search=business+analyst', category:'general', desc:'Daily NG vacancies across sectors.', boardImg:'assets/boards/board-8.jpg'},
  {id:'ng-hot', countryId:'ng', name:'HotNigerianJobs', url:'https://www.hotnigerianjobs.com', demoUrl:'https://www.hotnigerianjobs.com/search?search=business+analyst', category:'general', desc:'High-traffic NG listings board.', boardImg:'assets/boards/board-9.jpg'},
  {id:'ng-ngcareers', countryId:'ng', name:'NgCareers', url:'https://www.ngcareers.com', demoUrl:'https://www.ngcareers.com/search?search=business+analyst', category:'general', desc:'Nigerian career portal and listings.', boardImg:'assets/boards/board-10.jpg'},
  {id:'za-pnet', countryId:'za', name:'PNet', url:'https://www.pnet.co.za', demoUrl:'https://www.pnet.co.za/jobs--Business-Analyst.html', category:'general', desc:'South Africas leading job board.', boardImg:'assets/boards/board-11.jpg'},
  {id:'za-careers24', countryId:'za', name:'Careers24', url:'https://www.careers24.com', demoUrl:'https://www.careers24.com/jobs/kw-business-analyst/', category:'general', desc:'Major SA board with recruiter reach.', boardImg:'assets/boards/board-12.jpg'},
  {id:'za-jobmail', countryId:'za', name:'JobMail', url:'https://www.jobmail.co.za', demoUrl:'https://www.jobmail.co.za/jobs/business-analyst-jobs', category:'general', desc:'SA board with free job alerts.', boardImg:'assets/boards/board-13.jpg'},
  {id:'za-indeed', countryId:'za', name:'Indeed South Africa', url:'https://www.indeed.co.za', demoUrl:'https://www.indeed.co.za/q-business-analyst-jobs.html', category:'general', desc:'Indeeds South Africa edition.', boardImg:'assets/boards/board-14.jpg'},
  {id:'ke-brighter', countryId:'ke', name:'BrighterMonday Kenya', url:'https://www.brightermonday.co.ke', demoUrl:'https://www.brightermonday.co.ke/jobs?search=business+analyst', category:'general', desc:'Kenyas leading jobs portal.', boardImg:'assets/boards/board-15.jpg'},
  {id:'ke-fuzu', countryId:'ke', name:'Fuzu Kenya', url:'https://www.fuzu.com', demoUrl:'https://www.fuzu.com/kenya', category:'general', desc:'Career guidance plus KE listings.', boardImg:'assets/boards/board-16.jpg'},
  {id:'ke-myjobmag', countryId:'ke', name:'MyJobMag Kenya', url:'https://www.myjobmag.co.ke', demoUrl:'https://www.myjobmag.co.ke/jobs?search=business+analyst', category:'general', desc:'Daily Kenyan vacancies.', boardImg:'assets/boards/board-1.jpg'},
  {id:'gh-jobberman', countryId:'gh', name:'Jobberman Ghana', url:'https://www.jobberman.com.gh', demoUrl:'https://www.jobberman.com.gh/jobs?search=business+analyst', category:'general', desc:'Ghanas leading jobs platform.', boardImg:'assets/boards/board-2.jpg'},
  {id:'gh-jobsinghana', countryId:'gh', name:'JobsInGhana', url:'https://www.jobsinghana.com', demoUrl:'https://www.jobsinghana.com/jobs?search=business+analyst', category:'general', desc:'Long-running Ghana listings board.', boardImg:'assets/boards/board-3.jpg'},
  {id:'gh-jobweb', countryId:'gh', name:'JobWebGhana', url:'https://www.jobwebghana.com', demoUrl:'https://www.jobwebghana.com/search?search=business+analyst', category:'general', desc:'Ghana vacancies aggregator.', boardImg:'assets/boards/board-4.jpg'},
  {id:'ug-brighter', countryId:'ug', name:'BrighterMonday Uganda', url:'https://www.brightermonday.co.ug', demoUrl:'https://www.brightermonday.co.ug/jobs?search=business+analyst', category:'general', desc:'Ugandas leading jobs portal.', boardImg:'assets/boards/board-5.jpg'},
  {id:'ug-fuzu', countryId:'ug', name:'Fuzu Uganda', url:'https://www.fuzu.com', demoUrl:'https://www.fuzu.com/uganda', category:'general', desc:'Career platform with UG listings.', boardImg:'assets/boards/board-6.jpg'},
  {id:'ug-linkedin', countryId:'ug', name:'LinkedIn Uganda', url:'https://ug.linkedin.com/jobs/search?location=Uganda', demoUrl:'https://ug.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Uganda', category:'general', desc:'LinkedIns Uganda feed.', boardImg:'assets/boards/board-7.jpg'},
  {id:'zw-vacancymail', countryId:'zw', name:'VacancyMail', url:'https://www.vacancymail.co.zw', demoUrl:'https://www.vacancymail.co.zw/jobs?search=business+analyst', category:'general', desc:'Zimbabwes top vacancies mailing board.', boardImg:'assets/boards/board-8.jpg'},
  {id:'zw-myjobmag', countryId:'zw', name:'MyJobMag Zimbabwe', url:'https://www.myjobmag.co.zw', demoUrl:'https://www.myjobmag.co.zw/jobs?search=business+analyst', category:'general', desc:'Daily Zimbabwe vacancies.', boardImg:'assets/boards/board-9.jpg'},
  {id:'zw-linkedin', countryId:'zw', name:'LinkedIn Zimbabwe', url:'https://zw.linkedin.com/jobs/search?location=Zimbabwe', demoUrl:'https://zw.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Zimbabwe', category:'general', desc:'LinkedIns Zimbabwe feed.', boardImg:'assets/boards/board-10.jpg'},
  {id:'in-naukri', countryId:'in', name:'Naukri.com', url:'https://www.naukri.com', demoUrl:'https://www.naukri.com/business-analyst-jobs', category:'general', desc:'Indias #1 job board for analysts.', boardImg:'assets/boards/board-11.jpg'},
  {id:'in-foundit', countryId:'in', name:'Foundit India', url:'https://www.foundit.in', demoUrl:'https://www.foundit.in/srp/results?query=business+analyst', category:'general', desc:'Major India board, ex-Monster India.', boardImg:'assets/boards/board-12.jpg'},
  {id:'in-shine', countryId:'in', name:'Shine.com', url:'https://www.shine.com', demoUrl:'https://www.shine.com/job-search/business-analyst-jobs', category:'general', desc:'India board with skill courses.', boardImg:'assets/boards/board-13.jpg'},
  {id:'in-indeed', countryId:'in', name:'Indeed India', url:'https://www.indeed.co.in', demoUrl:'https://www.indeed.co.in/q-business-analyst-jobs.html', category:'general', desc:'Indeed India edition.', boardImg:'assets/boards/board-14.jpg'},
  {id:'pk-rozee', countryId:'pk', name:'Rozee.pk', url:'https://www.rozee.pk', demoUrl:'https://www.rozee.pk/job/jsearch/q/business%20analyst', category:'general', desc:'Pakistans largest job board.', boardImg:'assets/boards/board-15.jpg'},
  {id:'pk-mustakbil', countryId:'pk', name:'Mustakbil', url:'https://www.mustakbil.com', demoUrl:'https://www.mustakbil.com/jobs/search/business-analyst', category:'general', desc:'Pakistani career portal.', boardImg:'assets/boards/board-16.jpg'},
  {id:'pk-brightspyre', countryId:'pk', name:'BrightSpyre', url:'https://www.brightspyre.com', demoUrl:'https://www.brightspyre.com/jobs/search/business-analyst', category:'general', desc:'Pakistan recruitment platform.', boardImg:'assets/boards/board-1.jpg'},
  {id:'pk-paperpk', countryId:'pk', name:'PaperPk', url:'https://www.paperpk.com', demoUrl:'https://www.paperpk.com/search?search=business+analyst', category:'general', desc:'Newspaper jobs aggregator for Pakistan.', boardImg:'assets/boards/board-2.jpg'},
  {id:'sg-mycareers', countryId:'sg', name:'MyCareersFuture', url:'https://www.mycareersfuture.gov.sg', demoUrl:'https://www.mycareersfuture.gov.sg/search?search=business%20analyst', category:'general', desc:'Singapore government official board.', boardImg:'assets/boards/board-3.jpg'},
  {id:'sg-jobsdb', countryId:'sg', name:'JobsDB Singapore', url:'https://sg.jobsdb.com', demoUrl:'https://sg.jobsdb.com/j?sp=search&q=business%20analyst', category:'general', desc:'SEEK Asia network, Singapore edition.', boardImg:'assets/boards/board-4.jpg'},
  {id:'sg-jobstreet', countryId:'sg', name:'JobStreet Singapore', url:'https://www.jobstreet.com.sg', demoUrl:'https://www.jobstreet.com.sg/en/job-search/business-analyst-jobs/', category:'general', desc:'Leading Singapore listings board.', boardImg:'assets/boards/board-5.jpg'},
  {id:'sg-indeed', countryId:'sg', name:'Indeed Singapore', url:'https://sg.indeed.com', demoUrl:'https://sg.indeed.com/q-business-analyst-jobs.html', category:'general', desc:'Indeed Singapore edition.', boardImg:'assets/boards/board-6.jpg'},
  {id:'ph-jobstreet', countryId:'ph', name:'JobStreet Philippines', url:'https://www.jobstreet.com.ph', demoUrl:'https://www.jobstreet.com.ph/en/job-search/business-analyst-jobs/', category:'general', desc:'Philippines top job board.', boardImg:'assets/boards/board-7.jpg'},
  {id:'ph-kalibrr', countryId:'ph', name:'Kalibrr', url:'https://www.kalibrr.com', demoUrl:'https://www.kalibrr.com/home?query=business+analyst', category:'general', desc:'PH tech and startup hiring platform.', boardImg:'assets/boards/board-8.jpg'},
  {id:'ph-mynimo', countryId:'ph', name:'Mynimo', url:'https://www.mynimo.com', demoUrl:'https://www.mynimo.com/search?search=business+analyst', category:'general', desc:'Free Filipino listings board.', boardImg:'assets/boards/board-9.jpg'},
  {id:'ph-indeed', countryId:'ph', name:'Indeed Philippines', url:'https://www.indeed.com.ph', demoUrl:'https://www.indeed.com.ph/q-business-analyst-jobs.html', category:'general', desc:'Indeed Philippines edition.', boardImg:'assets/boards/board-10.jpg'},
  {id:'jm-caribbean', countryId:'jm', name:'CaribbeanJobs Jamaica', url:'https://www.caribbeanjobs.com/Jamaica', demoUrl:'https://www.caribbeanjobs.com/Jamaica?search=business+analyst', category:'general', desc:'Regional board, Jamaica listings.', boardImg:'assets/boards/board-11.jpg'},
  {id:'jm-gleaner', countryId:'jm', name:'Jamaica Gleaner Jobs', url:'https://www.jamaica-gleaner.com', demoUrl:'https://www.jamaica-gleaner.com/pages/jobs', category:'general', desc:'National newspaper jobs section.', boardImg:'assets/boards/board-12.jpg'},
  {id:'jm-linkedin', countryId:'jm', name:'LinkedIn Jamaica', url:'https://jm.linkedin.com/jobs/search?location=Jamaica', demoUrl:'https://jm.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Jamaica', category:'general', desc:'LinkedIns Jamaica feed.', boardImg:'assets/boards/board-13.jpg'},
  {id:'bs-caribbean', countryId:'bs', name:'CaribbeanJobs Bahamas', url:'https://www.caribbeanjobs.com/Bahamas', demoUrl:'https://www.caribbeanjobs.com/Bahamas?search=business+analyst', category:'general', desc:'Regional board, Bahamas listings.', boardImg:'assets/boards/board-14.jpg'},
  {id:'bs-bahamaslocal', countryId:'bs', name:'BahamasLocal Jobs', url:'https://www.bahamaslocal.com', demoUrl:'https://www.bahamaslocal.com/jobs', category:'general', desc:'Bahamas directory with job listings.', boardImg:'assets/boards/board-15.jpg'},
  {id:'bs-linkedin', countryId:'bs', name:'LinkedIn Bahamas', url:'https://bs.linkedin.com/jobs/search?location=Bahamas', demoUrl:'https://bs.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Bahamas', category:'general', desc:'LinkedIns Bahamas feed.', boardImg:'assets/boards/board-16.jpg'},
  {id:'tt-caribbean', countryId:'tt', name:'CaribbeanJobs Trinidad & Tobago', url:'https://www.caribbeanjobs.com/Trinidad-Tobago', demoUrl:'https://www.caribbeanjobs.com/Trinidad-Tobago?search=business+analyst', category:'general', desc:'Regional board, T&T listings.', boardImg:'assets/boards/board-1.jpg'},
  {id:'tt-guardian', countryId:'tt', name:'Trinidad Guardian Jobs', url:'https://www.guardian.co.tt', demoUrl:'https://www.guardian.co.tt/classifieds', category:'general', desc:'National newspaper classifieds and jobs.', boardImg:'assets/boards/board-2.jpg'},
  {id:'tt-linkedin', countryId:'tt', name:'LinkedIn Trinidad & Tobago', url:'https://tt.linkedin.com/jobs/search?location=Trinidad%20and%20Tobago', demoUrl:'https://tt.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Trinidad%20and%20Tobago', category:'general', desc:'LinkedIns T&T feed.', boardImg:'assets/boards/board-3.jpg'},
  {id:'bz-caribbean', countryId:'bz', name:'CaribbeanJobs Belize', url:'https://www.caribbeanjobs.com/Belize', demoUrl:'https://www.caribbeanjobs.com/Belize?search=business+analyst', category:'general', desc:'Regional board, Belize listings.', boardImg:'assets/boards/board-4.jpg'},
  {id:'bz-linkedin', countryId:'bz', name:'LinkedIn Belize', url:'https://bz.linkedin.com/jobs/search?location=Belize', demoUrl:'https://bz.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Belize', category:'general', desc:'LinkedIns Belize feed.', boardImg:'assets/boards/board-5.jpg'},
  {id:'gy-caribbean', countryId:'gy', name:'CaribbeanJobs Guyana', url:'https://www.caribbeanjobs.com/Guyana', demoUrl:'https://www.caribbeanjobs.com/Guyana?search=business+analyst', category:'general', desc:'Regional board, Guyana listings.', boardImg:'assets/boards/board-6.jpg'},
  {id:'gy-stabroek', countryId:'gy', name:'Stabroek News Jobs', url:'https://www.stabroeknews.com', demoUrl:'https://www.stabroeknews.com/category/advertisements/jobs/', category:'general', desc:'National newspaper jobs advertisements.', boardImg:'assets/boards/board-7.jpg'},
  {id:'gy-linkedin', countryId:'gy', name:'LinkedIn Guyana', url:'https://gy.linkedin.com/jobs/search?location=Guyana', demoUrl:'https://gy.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Guyana', category:'general', desc:'LinkedIns Guyana feed.', boardImg:'assets/boards/board-8.jpg'},
  {id:'fj-myfiji', countryId:'fj', name:'MyJobsFiji', url:'https://www.myjobsfiji.com', demoUrl:'https://www.myjobsfiji.com/jobs?search=business+analyst', category:'general', desc:'Fijis #1 job website.', boardImg:'assets/boards/board-9.jpg'},
  {id:'fj-fijisun', countryId:'fj', name:'Fiji Sun Jobs', url:'https://www.fijisun.com.fj', demoUrl:'https://www.fijisun.com.fj/category/classifieds/', category:'general', desc:'National newspaper classifieds and jobs.', boardImg:'assets/boards/board-10.jpg'},
  {id:'fj-linkedin', countryId:'fj', name:'LinkedIn Fiji', url:'https://fj.linkedin.com/jobs/search?location=Fiji', demoUrl:'https://fj.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Fiji', category:'general', desc:'LinkedIns Fiji feed.', boardImg:'assets/boards/board-11.jpg'},
  {id:'pg-workforce', countryId:'pg', name:'PNGWorkforce', url:'https://www.pngworkforce.com', demoUrl:'https://www.pngworkforce.com/jobs?search=business+analyst', category:'general', desc:'Papua New Guinea jobs board.', boardImg:'assets/boards/board-12.jpg'},
  {id:'pg-jobseek', countryId:'pg', name:'PNG JobSeek', url:'https://www.pngjobseek.com', demoUrl:'https://www.pngjobseek.com/jobs?search=business+analyst', category:'general', desc:'PNG listings and career advice.', boardImg:'assets/boards/board-13.jpg'},
  {id:'pg-loop', countryId:'pg', name:'Loop PNG Jobs', url:'https://www.looppng.com', demoUrl:'https://www.looppng.com/jobs', category:'general', desc:'National news network jobs section.', boardImg:'assets/boards/board-14.jpg'},
  {id:'ws-observer', countryId:'ws', name:'Samoa Observer Jobs', url:'https://www.samoaobserver.ws', demoUrl:'https://www.samoaobserver.ws/category/jobs', category:'general', desc:'National newspaper jobs section.', boardImg:'assets/boards/board-15.jpg'},
  {id:'ws-linkedin', countryId:'ws', name:'LinkedIn Samoa', url:'https://ws.linkedin.com/jobs/search?location=Samoa', demoUrl:'https://ws.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Samoa', category:'general', desc:'LinkedIns Samoa feed.', boardImg:'assets/boards/board-16.jpg'},
  {id:'remote-wework', countryId:'remote', name:'We Work Remotely', url:'https://weworkremotely.com', demoUrl:'https://weworkremotely.com/categories/remote-programming-jobs', category:'remote', desc:'Top remote jobs network.', boardImg:'assets/boards/board-1.jpg'},
  {id:'remote-remoteok', countryId:'remote', name:'Remote OK', url:'https://remoteok.com', demoUrl:'https://remoteok.com/remote-business-analyst-jobs', category:'remote', desc:'Remote-first listings aggregator.', boardImg:'assets/boards/board-2.jpg'},
  {id:'remote-linkedin', countryId:'remote', name:'LinkedIn Remote', url:'https://www.linkedin.com/jobs/search?location=Remote', demoUrl:'https://www.linkedin.com/jobs/search?keywords=Business%20Analyst&location=Remote', category:'remote', desc:'LinkedIns remote feed.', boardImg:'assets/boards/board-3.jpg'},
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
  {id:'regional', title:'Regional Job Boards', desc:'Researched boards across 24 countries in 6 regions, plus remote.', img:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80', btnText:'Access Boards', btnBg:'#2563eb', btnBorder:'#3b82f6', route:'regional-boards'},
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
