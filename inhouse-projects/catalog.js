/* Zeelin In-House — Marketplace Catalog: 7 categories, sectors/roles, 5 researched projects per role */
(function(){
'use strict';

const CAT_COVERS = {
  core: 'assets/cards/brief.jpg',
  technical: 'assets/cards/workspace.jpg',
  product: 'assets/cards/collaboration.jpg',
  data: 'assets/cards/deliverables.jpg',
  ai: 'assets/cards/quiz.jpg',
  customer: 'assets/cards/evaluation.jpg',
  industry: 'assets/cards/brief.jpg'
};

const CATEGORIES = [
  {id:'core', name:'Core / Classic Business Analysis', short:'Core BA', blurb:'Classic BA craft: stakeholders, requirements, process, BRD/RTM and business cases.', color:'#f59e0b', bg:'#26170b', cover:CAT_COVERS.core},
  {id:'technical', name:'Technical Business Analysis', short:'Technical BA', blurb:'Systems, APIs, ERP/CRM, platform and solution architecture.', color:'#60a5fa', bg:'#172554', cover:CAT_COVERS.technical},
  {id:'product', name:'Product & Agile', short:'Product & Agile', blurb:'Product ownership, backlogs, roadmaps, experiments and delivery.', color:'#4ade80', bg:'#14532d', cover:CAT_COVERS.product},
  {id:'data', name:'Data & Business Intelligence', short:'Data & BI', blurb:'Analytics, BI dashboards, governance, reporting and decision support.', color:'#22d3ee', bg:'#164e63', cover:CAT_COVERS.data},
  {id:'ai', name:'AI-Era Business Analysis', short:'AI-Era BA', blurb:'AI integration, automation, copilots, evals and responsible AI.', color:'#a78bfa', bg:'#2e1065', cover:CAT_COVERS.ai},
  {id:'customer', name:'Customer & Journey', short:'Customer & Journey', blurb:'CX, journeys, insights, VoC, success and service delivery.', color:'#fb7185', bg:'#4c0519', cover:CAT_COVERS.customer},
  {id:'industry', name:'Industry-Specific', short:'Industry', blurb:'Banking, healthcare, insurance, telecom, retail, gov, HR, marketing.', color:'#fbbf24', bg:'#451a03', cover:CAT_COVERS.industry}
];

const SECTORS = [
  {id:'banking-finance', cat:'industry', name:'Banking & Finance'},
  {id:'healthcare', cat:'industry', name:'Healthcare'},
  {id:'insurance', cat:'industry', name:'Insurance'},
  {id:'telecom', cat:'industry', name:'Telecommunications'},
  {id:'retail-ecom', cat:'industry', name:'Retail & E-commerce'},
  {id:'gov-defence', cat:'industry', name:'Government & Defence'},
  {id:'hr', cat:'industry', name:'Human Resources'},
  {id:'marketing', cat:'industry', name:'Marketing'}
];

/* All roles — ids are stable for routing */
const ROLES = [
  // Core (12)
  {id:'business-analyst', cat:'core', title:'Business Analyst'},
  {id:'business-systems-analyst', cat:'core', title:'Business Systems Analyst'},
  {id:'systems-analyst-core', cat:'core', title:'Systems Analyst'},
  {id:'functional-analyst', cat:'core', title:'Functional Analyst / Functional Consultant'},
  {id:'requirements-analyst', cat:'core', title:'Requirements Analyst / Requirements Engineer'},
  {id:'process-analyst', cat:'core', title:'Process Analyst / Business Process Analyst'},
  {id:'bpi-analyst', cat:'core', title:'Business Process Improvement Analyst'},
  {id:'operations-analyst', cat:'core', title:'Operations Analyst'},
  {id:'management-analyst', cat:'core', title:'Management Analyst'},
  {id:'enterprise-analyst', cat:'core', title:'Enterprise Analyst'},
  {id:'solutions-analyst', cat:'core', title:'Solutions Analyst'},
  {id:'business-consultant', cat:'core', title:'Business Consultant / Management Consultant'},
  // Technical (10)
  {id:'technical-ba', cat:'technical', title:'Technical Business Analyst'},
  {id:'it-ba', cat:'technical', title:'IT Business Analyst'},
  {id:'systems-ba', cat:'technical', title:'Systems Business Analyst'},
  {id:'integration-analyst', cat:'technical', title:'Integration Analyst / API Analyst'},
  {id:'erp-analyst', cat:'technical', title:'ERP Analyst (SAP / Oracle / Dynamics / Workday)'},
  {id:'crm-analyst', cat:'technical', title:'CRM Analyst (Salesforce Business Analyst)'},
  {id:'application-analyst', cat:'technical', title:'Application Analyst'},
  {id:'platform-analyst', cat:'technical', title:'Platform Analyst'},
  {id:'solution-architect', cat:'technical', title:'Solution Architect (BA-adjacent)'},
  {id:'automation-analyst-tech', cat:'technical', title:'Automation Analyst / RPA / Intelligent Automation'},
  // Product & Agile (7)
  {id:'product-analyst', cat:'product', title:'Product Analyst'},
  {id:'product-owner', cat:'product', title:'Product Owner'},
  {id:'product-manager', cat:'product', title:'Associate Product Manager / Product Manager'},
  {id:'digital-product-analyst', cat:'product', title:'Digital Product Analyst'},
  {id:'agile-ba', cat:'product', title:'Business Analyst - Agile / Agile BA'},
  {id:'scrum-product-owner', cat:'product', title:'Scrum Product Owner'},
  {id:'feature-analyst', cat:'product', title:'Feature Analyst'},
  // Data & BI (9)
  {id:'data-analyst', cat:'data', title:'Data Analyst'},
  {id:'data-ba', cat:'data', title:'Data Business Analyst'},
  {id:'bi-analyst', cat:'data', title:'Business Intelligence Analyst / BI Developer'},
  {id:'reporting-analyst', cat:'data', title:'Reporting Analyst'},
  {id:'analytics-consultant', cat:'data', title:'Analytics Consultant'},
  {id:'insights-analyst', cat:'data', title:'Insights Analyst'},
  {id:'decision-support-analyst', cat:'data', title:'Decision Support Analyst'},
  {id:'data-governance-analyst', cat:'data', title:'Data Governance Analyst'},
  {id:'master-data-analyst', cat:'data', title:'Master Data Analyst'},
  // AI-Era (8)
  {id:'ai-ba', cat:'ai', title:'AI Business Analyst'},
  {id:'automation-analyst-ai', cat:'ai', title:'Automation Analyst / RPA Business Analyst'},
  {id:'intelligent-automation-analyst', cat:'ai', title:'Intelligent Automation Analyst'},
  {id:'ai-solutions-analyst', cat:'ai', title:'AI Solutions Analyst'},
  {id:'ai-product-analyst', cat:'ai', title:'AI Product Analyst'},
  {id:'conversational-ai-analyst', cat:'ai', title:'Conversational AI Analyst / Chatbot Analyst'},
  {id:'prompt-workflow-analyst', cat:'ai', title:'Prompt / AI Workflow Analyst'},
  {id:'ai-governance-analyst', cat:'ai', title:'AI Governance / Responsible AI Analyst'},
  // Customer & Journey (8)
  {id:'cx-analyst', cat:'customer', title:'Customer Experience (CX) Analyst'},
  {id:'customer-journey-analyst', cat:'customer', title:'Customer Journey Analyst'},
  {id:'customer-insights-analyst', cat:'customer', title:'Customer Insights Analyst'},
  {id:'customer-success-analyst', cat:'customer', title:'Customer Success Manager / Analyst'},
  {id:'client-relationship-manager', cat:'customer', title:'Client Relationship Manager'},
  {id:'service-delivery-analyst', cat:'customer', title:'Service Delivery Analyst'},
  {id:'voc-analyst', cat:'customer', title:'Voice of Customer (VoC) Analyst'},
  {id:'customer-ops-analyst', cat:'customer', title:'Customer Operations Analyst'},
  // Industry (27 across 8 sectors)
  {id:'credit-risk-analyst', cat:'industry', sector:'banking-finance', title:'Credit Risk Analyst'},
  {id:'regulatory-reporting-analyst', cat:'industry', sector:'banking-finance', title:'Regulatory Reporting Analyst'},
  {id:'treasury-analyst', cat:'industry', sector:'banking-finance', title:'Treasury Analyst'},
  {id:'payments-ba', cat:'industry', sector:'banking-finance', title:'Payments Business Analyst'},
  {id:'core-banking-analyst', cat:'industry', sector:'banking-finance', title:'Core Banking Analyst'},
  {id:'aml-compliance-analyst', cat:'industry', sector:'banking-finance', title:'AML / Compliance Analyst'},
  {id:'murex-temenos-analyst', cat:'industry', sector:'banking-finance', title:'Murex / Temenos / Finacle Analyst'},
  {id:'clinical-systems-analyst', cat:'industry', sector:'healthcare', title:'Clinical Systems Analyst'},
  {id:'healthcare-ba', cat:'industry', sector:'healthcare', title:'Healthcare Business Analyst'},
  {id:'ehr-epic-analyst', cat:'industry', sector:'healthcare', title:'EHR / Epic Analyst'},
  {id:'revenue-cycle-analyst', cat:'industry', sector:'healthcare', title:'Revenue Cycle Analyst'},
  {id:'underwriting-analyst', cat:'industry', sector:'insurance', title:'Underwriting Analyst'},
  {id:'claims-ba', cat:'industry', sector:'insurance', title:'Claims Business Analyst'},
  {id:'actuarial-analyst', cat:'industry', sector:'insurance', title:'Actuarial Analyst'},
  {id:'oss-bss-analyst', cat:'industry', sector:'telecom', title:'OSS / BSS Analyst'},
  {id:'billing-systems-analyst', cat:'industry', sector:'telecom', title:'Billing Systems Analyst'},
  {id:'merchandising-analyst', cat:'industry', sector:'retail-ecom', title:'Merchandising Analyst'},
  {id:'supply-chain-analyst', cat:'industry', sector:'retail-ecom', title:'Supply Chain Analyst'},
  {id:'category-analyst', cat:'industry', sector:'retail-ecom', title:'Category Analyst'},
  {id:'program-analyst', cat:'industry', sector:'gov-defence', title:'Program Analyst'},
  {id:'policy-analyst', cat:'industry', sector:'gov-defence', title:'Policy Analyst'},
  {id:'acquisition-analyst', cat:'industry', sector:'gov-defence', title:'Acquisition Analyst'},
  {id:'hris-analyst', cat:'industry', sector:'hr', title:'HRIS Analyst'},
  {id:'people-analytics-analyst', cat:'industry', sector:'hr', title:'People Analytics Analyst'},
  {id:'marketing-analyst', cat:'industry', sector:'marketing', title:'Marketing Analyst'},
  {id:'growth-analyst', cat:'industry', sector:'marketing', title:'Growth Analyst'},
  {id:'campaign-analyst', cat:'industry', sector:'marketing', title:'Campaign Analyst'}
];

/* 5 researched project seeds per category family.
   Each seed: [title suffix, description, difficulty, duration, price, skills] */
const FAMILY_SEEDS = {
  core: [
    ['Stakeholder Map, RACI & Engagement Plan', 'Map influence/interest, RACI and comms plan; produce BRD scope and sign-off pack.', 'Foundation', '2 weeks', 0, ['Stakeholders','RACI','BRD']],
    ['BPMN As-Is / To-Be & Gap Analysis', 'Model current vs target process in BPMN 2.0 with gateways, swimlanes and gap register.', 'Intermediate', '3 weeks', 29, ['BPMN','Gap Analysis','FRD']],
    ['Requirements Traceability (RTM) to UAT', 'Elicit functional/non-functional requirements; build RTM from need to test case.', 'Intermediate', '2 weeks', 29, ['RTM','MoSCoW','UAT']],
    ['Business Case, NPV & Benefits Register', 'Draft business case with costs, NPV, risks and benefits realisation plan.', 'Advanced', '3 weeks', 49, ['Business Case','NPV','Risk Log']],
    ['User Stories, Acceptance Criteria & Walkthrough', 'Write INVEST stories with Gherkin criteria; run validation walkthrough to sign-off.', 'Intermediate', '2 weeks', 29, ['User Stories','Gherkin','Workshops']]
  ],
  technical: [
    ['Systems Requirements & Interface Spec', 'Translate business needs into system requirements, interfaces and NFRs.', 'Intermediate', '2 weeks', 29, ['SRS','Interfaces','NFRs']],
    ['API Design (OpenAPI) & Contract Tests', 'Design REST endpoints in OpenAPI; define Pact contract tests and error handling.', 'Advanced', '3 weeks', 49, ['REST','OpenAPI','Pact']],
    ['ERP/CRM Configuration & Gap-Fit', 'Run gap-fit for SAP/Oracle/Salesforce; configure fields, flows and migration plan.', 'Advanced', '3 weeks', 49, ['ERP','CRM','Gap-Fit']],
    ['Data Model (ERD) & Integration Mapping', 'Build conceptual/logical/physical ERDs to 3NF with source-target maps.', 'Advanced', '3 weeks', 49, ['ERD','SQL','ETL']],
    ['UAT Strategy, Test Cases & Defect Triage', 'Plan UAT cycles, write test cases, manage defects to 95%+ pass rate.', 'Intermediate', '2 weeks', 29, ['UAT','Test Cases','Jira']]
  ],
  product: [
    ['PRD, Roadmap & RICE Prioritisation', 'Write PRD, quarterly roadmap and RICE-scored backlog with success metrics.', 'Intermediate', '2 weeks', 29, ['PRD','Roadmap','RICE']],
    ['Backlog Grooming: Epics to Ready Stories', 'Split epics, refine 50+ items, define acceptance criteria and sprint plan.', 'Intermediate', '2 weeks', 29, ['Backlog','Jira','Stories']],
    ['Funnel, Retention & KPI Dashboard', 'Define KPI hierarchy; build funnel/retention analysis with experiment readout.', 'Intermediate', '2 weeks', 29, ['KPIs','SQL','Power BI']],
    ['A/B Experiment Design & Rollout Decision', 'Hypothesis, guardrails, sample sizing and ship/no-ship recommendation.', 'Advanced', '2 weeks', 49, ['Experiments','Stats','Decisions']],
    ['Discovery: Interviews to Prototype', 'Run 8 interviews, affinity map, prototype flow and usability readout.', 'Foundation', '2 weeks', 0, ['Discovery','Personas','Prototype']]
  ],
  data: [
    ['Sales Performance Dashboard (Power BI)', 'Model star schema; DAX measures for revenue, region and rep performance.', 'Intermediate', '2 weeks', 29, ['Power BI','DAX','Modelling']],
    ['SQL Analysis Pack: Joins to Funnels', 'Answer 10 business questions in SQL with documented queries and checks.', 'Intermediate', '2 weeks', 29, ['SQL','QA','Insights']],
    ['Customer Segmentation & Churn Signals', 'Segment base, flag churn drivers and recommend retention actions.', 'Advanced', '3 weeks', 49, ['Segmentation','Churn','Python']],
    ['Governance: Dictionary, Lineage & Quality', 'Publish data dictionary, lineage and quality rules with issue log.', 'Advanced', '3 weeks', 49, ['Governance','Lineage','DQ']],
    ['Executive Reporting Pack & Narrative', 'Monthly pack with KPIs, commentary and decision log for leadership.', 'Foundation', '1 week', 0, ['Reporting','Storytelling','Excel']]
  ],
  ai: [
    ['AI Opportunity Map & Feasibility Note', 'Score 10 use cases on value/feasibility; pick pilot with guardrails.', 'Intermediate', '2 weeks', 29, ['Discovery','Feasibility','ROI']],
    ['Support Triage Copilot (RAG) Blueprint', 'Design retrieval flow, prompts, human-in-loop and eval set for support.', 'Advanced', '3 weeks', 49, ['RAG','Prompts','Eval']],
    ['Prompt Library to Agent Workflow', 'Turn repeated prompts into reusable commands, then a governed agent.', 'Intermediate', '2 weeks', 29, ['Prompting','Agents','n8n']],
    ['Model Eval, Hallucination & Safety Tests', 'Build golden set, test grounding/citations and failure handling.', 'Advanced', '2 weeks', 49, ['Eval','Safety','Grounding']],
    ['Responsible AI Register & Release Gate', 'Document risks, controls, approval route and Go/No-Go checklist.', 'Advanced', '2 weeks', 49, ['Governance','Risk','Release']]
  ],
  customer: [
    ['Journey Map & Moments of Truth', 'Map end-to-end journey, pains and backlog prioritised by effort/impact.', 'Foundation', '2 weeks', 0, ['Journeys','Personas','Backlog']],
    ['VoC Synthesis: Reviews to Themes', 'Code 200+ verbatims into themes, drivers and fix recommendations.', 'Intermediate', '2 weeks', 29, ['VoC','Affinity','Insights']],
    ['NPS/Csat Dashboard & Recovery Play', 'Build score dashboard with segment cuts and closed-loop workflow.', 'Intermediate', '2 weeks', 29, ['NPS','Dashboard','Playbook']],
    ['Service Blueprint (Front/Back Stage)', 'Blueprint with policies, systems and handoffs for consistent delivery.', 'Intermediate', '2 weeks', 29, ['Blueprint','SOP','SLA']],
    ['Success Plan & QBR Pack', 'Define outcomes, adoption milestones and QBR narrative for key accounts.', 'Intermediate', '2 weeks', 29, ['Success','QBR','Adoption']]
  ],
  industry: [
    ['Domain Primer: Regulations, Actors & Data', 'Summarise sector rules, key actors, core systems and datasets.', 'Foundation', '1 week', 0, ['Domain','Regulations','Glossary']],
    ['As-Is Process & Systems Landscape', 'Map process with systems, owners, controls and pain points.', 'Intermediate', '2 weeks', 29, ['BPMN','Systems','Controls']],
    ['Requirements Pack for Sector Workflow', 'Elicit role-specific requirements with RTM and acceptance criteria.', 'Intermediate', '2 weeks', 29, ['BRD','RTM','Stories']],
    ['Risk, Controls & Compliance Checklist', 'Build risk/control matrix with evidence expectations and sign-off.', 'Advanced', '2 weeks', 49, ['Risk','Compliance','Audit']],
    ['Improvement Case with KPIs & Roadmap', 'Quantify benefits, define KPIs and phased roadmap to target state.', 'Advanced', '3 weeks', 49, ['KPIs','Roadmap','Benefits']]
  ]
};

const THUMB_POOL = [];
for(let i=1;i<=21;i++) THUMB_POOL.push('assets/marketplace/ba-'+String(i).padStart(2,'0')+'.jpg');
for(let i=1;i<=21;i++) THUMB_POOL.push('assets/marketplace/se-'+String(i).padStart(2,'0')+'.jpg');
THUMB_POOL.push('assets/cards/brief.jpg','assets/cards/workspace.jpg','assets/cards/collaboration.jpg','assets/cards/deliverables.jpg','assets/cards/evaluation.jpg','assets/cards/quiz.jpg');

function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48); }

const MARKETPLACE_PROJECTS = [];
let thumbCursor = 0;
ROLES.forEach(function(role){
  const seeds = FAMILY_SEEDS[role.cat] || FAMILY_SEEDS.core;
  const cat = CATEGORIES.find(c=>c.id===role.cat);
  seeds.forEach(function(sd, idx){
    const n = idx+1;
    const id = slug(role.id)+'-p'+n;
    const thumb = THUMB_POOL[(thumbCursor++) % THUMB_POOL.length];
    MARKETPLACE_PROJECTS.push({
      id: id,
      title: sd[0] + ' — ' + role.title,
      category: role.cat,
      categoryName: cat ? cat.name : role.cat,
      sector: role.sector || null,
      jobRole: role.title,
      roleId: role.id,
      difficulty: sd[2],
      duration: sd[3],
      price: sd[4],
      desc: sd[1],
      skills: sd[5],
      deliverables: ['BRD / FRD extract','Process / model diagram','Traceability matrix','User stories + acceptance criteria','Stakeholder / review readout'],
      thumbnail: thumb,
      rating: (4.4 + ((idx%3)*0.15)).toFixed(1),
      learners: 400 + ((thumbCursor*37)%2400)
    });
  });
});

/* Default owned project so dashboard starts with exactly 1 card */
const DEFAULT_PROJECT_ID = MARKETPLACE_PROJECTS[0] ? MARKETPLACE_PROJECTS[0].id : null;

const MODE_DEFS = [
  {id:'supported', name:'Supported Project', tag:'Mentor Guided', desc:'Work alongside a mentor on the live brief with weekly reviews.', color:'#f59e0b', bg:'#26170b'},
  {id:'mandate', name:'Mandate Project', tag:'On Your Own', desc:'Self-directed mandate. Set milestones and deliver solo.', color:'#60a5fa', bg:'#172554'},
  {id:'group', name:'Group Project', tag:'Team Sync', desc:'Collaborate in a simulated agency with standups and reviews.', color:'#4ade80', bg:'#14532d'}
];

function getCategory(id){ return CATEGORIES.find(c=>c.id===id) || CATEGORIES[0]; }
function getRole(roleId){ return ROLES.find(r=>r.id===roleId) || ROLES[0]; }
function getSector(sectorId){ return SECTORS.find(s=>s.id===sectorId) || null; }
function getCatalogProject(id){ return MARKETPLACE_PROJECTS.find(p=>p.id===id) || MARKETPLACE_PROJECTS[0]; }
function projectsForRole(roleId){ return MARKETPLACE_PROJECTS.filter(p=>p.roleId===roleId); }
function rolesForCategory(catId){ return ROLES.filter(r=>r.cat===catId); }
function rolesForSector(sectorId){ return ROLES.filter(r=>r.sector===sectorId); }

/* expose for app.js (loaded before app.js) */
window.ZEELIN_CATALOG = {
  CATEGORIES, SECTORS, ROLES, MARKETPLACE_PROJECTS, MODE_DEFS,
  DEFAULT_PROJECT_ID, getCategory, getRole, getSector, getCatalogProject,
  projectsForRole, rolesForCategory, rolesForSector
};

})();
