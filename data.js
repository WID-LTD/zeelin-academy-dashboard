/* Zeelin Academy Dashboard — mock data (demo only) */

const A = 'assets/';
const S = A + 'stock/';

const USER = {
  name: 'John Doe',
  email: 'john.doe@zeelin.academy',
  avatar: A + 'avatar_1.png',
  initials: 'JD',
  memberSince: 'Jan 2026',
  cohort: 'Cohort 001 - Parenting',
  streak: 5,
  xp: 2950,
  role: 'Software Engineering Learner',
  level: 12,
};

const COURSES = [
  {
    id: 'ba-foundation',
    title: 'Business Analysis Foundation',
    short: 'BA Foundation',
    cover: A + 'books/foundation_in_bussiness_analysis_pratice.png',
    cohort: 'Cohort 001 - Parenting',
    days: [1, 2],
    week: 1,
    weekName: 'Foundations',
    progress: 45,
    estimatedHours: 34,
    completedHours: 14,
    daysLeft: 2,
    readiness: 18,
    strength: 88,
    color: 'var(--amber)',
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    short: 'Software Eng',
    cover: A + 'books/system_modelling_techniques.png',
    cohort: 'Cohort 001 - Parenting',
    days: [3, 4],
    week: 2,
    weekName: 'Analysis & Design',
    progress: 8,
    estimatedHours: 30,
    completedHours: 2,
    readiness: 8,
    strength: 42,
    daysLeft: 2,
    color: 'var(--blue)',
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    short: 'Prompt Eng',
    cover: A + 'books/project_management.png',
    cohort: 'Cohort 001 - Parenting',
    days: [5, 6],
    week: 3,
    weekName: 'Modelling & Delivery',
    progress: 0,
    estimatedHours: 26,
    completedHours: 0,
    readiness: 0,
    strength: 0,
    daysLeft: 2,
    color: 'var(--green)',
  },
  {
    id: 'job-readiness',
    title: 'Job Readiness Sprint',
    short: 'Job Sprint',
    cover: A + 'books/bussiness_change.png',
    cohort: 'Cohort 001 - Parenting',
    days: [7],
    week: 4,
    weekName: 'Career Launch',
    progress: 0,
    estimatedHours: 16,
    completedHours: 0,
    readiness: 0,
    strength: 0,
    daysLeft: 1,
    color: 'var(--teal)',
  },
];

const TRACKING = COURSES[0];

/* ---------- Books with real authored content ---------- */
const BOOKS = [
  {
    id: 'foundation',
    title: 'Foundation in Business Analysis Practice',
    author: 'Zeelin Academy',
    cover: A + 'books/foundation_in_bussiness_analysis_pratice.png',
    color: 'var(--amber)',
    chapters: [
      { n: 'Chapter 1', t: 'The Role of the Business Analyst', type: 'Core', readTime: 12,
        body: 'The Business Analyst (BA) is the bridge between business needs and IT solutions. A good BA never jumps to a solution before understanding the actual problem, the people affected and the constraints in play.',
        ideas: ['Clarify the business problem before proposing solutions', 'Separate what is needed from what is wanted', 'Work across both business and technical teams', 'Communicate findings in plain, traceable language'] },
      { n: 'Chapter 2', t: 'The Business Analysis Process & Framework', type: 'Core', readTime: 14,
        body: 'Everything in this course follows a simple loop: investigate the situation, define requirements, evaluate options and recommend a solution. Examiners reward candidates who can name each step and describe what happens inside it.',
        ideas: ['Investigate before you define', 'Define requirements in measurable terms', 'Evaluate options against real constraints', 'Present a defensible recommendation'] },
      { n: 'Chapter 3', t: 'Strategy & Business Analysis', type: 'Core', readTime: 11,
        body: 'Good analysis starts from strategy. Techniques like VMOST and SWOT keep the analysis connected to what the organisation is trying to achieve rather than what a stakeholder casually suggests.',
        ideas: ['Link analysis back to business goals', 'Use SWOT for the internal/external view', 'Use VMOST to align vision with tactics', 'Challenge vague objectives early'] },
      { n: 'Chapter 4', t: 'Investigating the Situation', type: 'Core', readTime: 13,
        body: 'Investigation gathers evidence before conclusions. Observation, interviews, workshops and document analysis each reveal a different slice of the current state, and each has strengths and weaknesses.',
        ideas: ['Match the technique to the situation', 'Interviews explore; observation reveals reality', 'Document analysis is cheap but can be stale', 'Triangulate sources before concluding'] },
      { n: 'Chapter 5', t: 'Defining Requirements', type: 'Core', readTime: 12,
        body: 'A requirement is a clear, testable statement of what a stakeholder genuinely needs. Functional requirements describe what the system must do; non-functional ones describe how well it must do it.',
        ideas: ['Write requirements that are testable', 'Separate functional from non-functional', 'Use MoSCoW to prioritise', 'Validate wording with the originator'] },
      { n: 'Chapter 6', t: 'Evaluating Options', type: 'Core', readTime: 11,
        body: 'When several solutions exist, evaluate them against agreed criteria: cost, risk, feasibility and fit with strategy. Document every option and the scoring rationale so the choice is auditable.',
        ideas: ['Agree evaluation criteria first', 'Score every option against every criterion', 'Include a do-nothing baseline option', 'Record the reasoning'] },
      { n: 'Chapter 7', t: 'Recommendation & Communication', type: 'Core', readTime: 10,
        body: 'The recommendation is only as strong as the communication of it. Tailor the message to the audience, lead with the recommendation, then the evidence, and make next steps explicit.',
        ideas: ['Lead with the recommendation', 'Use the audience\'s language', 'Show evidence behind every claim', 'State clear next steps and owners'] },
      { n: 'Chapter 8', t: 'Working with Stakeholders', type: 'Core', readTime: 12,
        body: 'Stakeholder management decides project success. Map stakeholders by power and interest: keep high-power stakeholders satisfied, manage high-interest allies closely, and monitor the rest.',
        ideas: ['Map power vs interest', 'Keep influential people satisfied', 'Manage the highly interested closely', 'Revisit the map as the project evolves'] },
    ],
  },
  {
    id: 'software',
    title: 'Software Engineering',
    author: 'Zeelin Academy',
    cover: A + 'books/system_modelling_techniques.png',
    color: 'var(--blue)',
    chapters: [
      { n: 'Chapter 1', t: 'Software Engineering Fundamentals', type: 'Core', readTime: 12,
        body: 'Software engineering is the disciplined application of engineering principles to software. It exists because large systems fail when built by guesswork, so we use processes, tools and quality gates to keep them predictable.',
        ideas: ['Engineering is about managing complexity', 'Process gives predictability', 'Quality is built in, not inspected in', 'Version control is non-negotiable'] },
      { n: 'Chapter 2', t: 'The Software Lifecycle', type: 'Core', readTime: 14,
        body: 'The SDLC runs from planning through analysis, design, build, test and deployment, then into maintenance. Understanding which phase you are in tells you what artefacts you should be producing next.',
        ideas: ['Requirements feed design', 'Design feeds build', 'Testing is every phase, not just a gate', 'Maintenance is the longest phase'] },
      { n: 'Chapter 3', t: 'Requirements in Software Projects', type: 'Core', readTime: 12,
        body: 'Software requirements must be unambiguous and testable. Acceptance criteria written at requirements time become the automated tests later, so invest early in clarity.',
        ideas: ['Write acceptance criteria early', 'Functional vs non-functional requirements', 'Trace requirements to tests', 'Manage changes through a baseline'] },
      { n: 'Chapter 4', t: 'Testing & Quality Assurance', type: 'Core', readTime: 13,
        body: 'Testing scales from unit tests through integration and end-to-end checks. A solid test pyramid keeps the pipeline fast: many small unit tests, fewer integration tests, fewest end-to-end.',
        ideas: ['Test the smallest units first', 'Keep the pyramid shape in mind', 'Automate the boring checks', 'Test happy paths AND failure paths'] },
      { n: 'Chapter 5', t: 'Deployment & DevOps', type: 'Core', readTime: 11,
        body: 'DevOps closes the gap between writing code and shipping it. Continuous integration runs checks on every change; continuous delivery ships those changes when they pass.',
        ideas: ['CI runs checks on every commit', 'CD deploys tested changes', 'Infrastructure as code fights drift', 'Rollbacks should be as easy as releases'] },
      { n: 'Chapter 6', t: 'Modern Practices & Career', type: 'Core', readTime: 10,
        body: 'Beyond the code, engineers own outcomes: pair reviews, retrospectives and a learning loop keep both the system and the team healthy over years of delivery.',
        ideas: ['Code reviews spread knowledge', 'Retrospectives improve the process', 'Keep learning the toolchain', 'Own the outcome, not just the ticket'] },
    ],
  },
  {
    id: 'prompt',
    title: 'Prompt Engineering',
    author: 'Zeelin Academy',
    cover: A + 'books/project_management.png',
    color: 'var(--green)',
    chapters: [
      { n: 'Chapter 1', t: 'How Language Models Work', type: 'Core', readTime: 11,
        body: 'Large language models predict the next token, given everything before it. Understanding this helps you write prompts that give the model enough context to make a useful prediction.',
        ideas: ['Models predict, they do not know', 'Context length is a real constraint', 'Structure reduces ambiguity', 'Output quality follows input clarity'] },
      { n: 'Chapter 2', t: 'Anatomy of a Great Prompt', type: 'Core', readTime: 12,
        body: 'A strong prompt states the role, the task, the output format and the constraints. Each element removes uncertainty, and uncertainty is where models go wrong.',
        ideas: ['Give the model a role', 'State the task precisely', 'Specify the output format', 'Set constraints and tone'] },
      { n: 'Chapter 3', t: 'Basic Prompt Techniques', type: 'Core', readTime: 13,
        body: 'Techniques like few-shot examples, step-by-step instructions and temperature control move models from generic to dependable. Few-shot prompts show the model the shape of the answer you want.',
        ideas: ['Use examples to show the shape', 'Zero-shot vs few-shot', 'Break big tasks into steps', 'Retry with feedback, not just re-rolls'] },
      { n: 'Chapter 4', t: 'Chain-of-Thought & Reasoning', type: 'Core', readTime: 12,
        body: 'Asking the model to reason step by step, or to explain its answer, dramatically improves accuracy on maths, logic and planning tasks. The reasoning is the scaffold the answer stands on.',
        ideas: ['Ask for step-by-step reasoning', 'Request the answer and then the explanation', 'Give a worked example to imitate', 'Verify final answers independently'] },
      { n: 'Chapter 5', t: 'Safety, Limits & Hallucination', type: 'Core', readTime: 12,
        body: 'Models can fabricate confident-sounding facts. You manage this by asking for citations, grounding prompts in shared source text, and never trusting a single unchecked output.',
        ideas: ['Hallucinations sound confident', 'Ground the model in source text', 'Ask for evidence and citations', 'Keep a human in the loop'] },
      { n: 'Chapter 6', t: 'Building a Prompt Workflow', type: 'Core', readTime: 10,
        body: 'A workflow system turns one-off prompts into reusable tools: template prompts, version them, log inputs and outputs, and benchmark improvements before adopting them.',
        ideas: ['Template and reuse prompts', 'Version prompts like code', 'Log inputs and outputs', 'Benchmark before you switch'] },
    ],
  },
];

const CHAPTER_QUIZZES = {
  foundation: [
    [
      { q: 'What is the primary role of a Business Analyst?', opts: ['Managing project budgets', 'Bridging business needs and IT solutions', 'Writing marketing copy', 'Installing software'], ans: 1 },
      { q: 'A BA should define the problem before…', opts: ['Gathering requirements', 'Proposing a solution', 'Mapping stakeholders', 'Booking meetings'], ans: 1 },
      { q: 'Which best describes the BA communication approach?', opts: ['Technical jargon only', 'Plain, traceable language', 'Executive-speak only', 'Silence until asked'], ans: 1 },
      { q: 'Needs vs wants means…', opts: ['Wants always win', 'Distinguishing what is needed from what is wanted', 'Ignoring people', 'Cheapest option wins'], ans: 1 },
      { q: 'The BA works between which two groups?', opts: ['Marketing and sales', 'Business and technical teams', 'HR and finance', 'Suppliers and lawyers'], ans: 1 },
    ],
    [
      { q: 'What is the correct first step of the BA process framework?', opts: ['Define requirements', 'Evaluate options', 'Investigate the situation', 'Write the report'], ans: 2 },
      { q: 'After defining requirements, the BA should…', opts: ['Skip to the answer', 'Evaluate options', 'Terminate the project', 'Write tests'], ans: 1 },
      { q: 'What does a recommendation need to be?', opts: ['Defensible', 'A guess', 'Anonymous', 'Only about cost'], ans: 0 },
      { q: 'Examiners reward candidates who…', opts: ['Memorise slides', 'Name the technique they used', 'Describe feelings', 'Quote vendors'], ans: 1 },
      { q: 'The loop ends with…', opts: ['An investigation', 'A recommendation', 'A database', 'A chatbot'], ans: 1 },
    ],
    [
      { q: 'Which technique helps align analysis to strategy?', opts: ['VMOST', 'Random sampling', 'Post-it sorting', 'Attendance sheets'], ans: 0 },
      { q: 'SWOT is used to capture…', opts: ['Internal and external views', 'Only financial numbers', 'Holiday plans', 'Password resets'], ans: 0 },
      { q: 'Vague objectives should be…', opts: ['Accepted as-is', 'Challenge early', 'Ignored', 'Deferred to release 3'], ans: 1 },
      { q: 'Analysis should stay connected to…', opts: ['The strategy', 'The coffee machine', 'The vendor demo', 'The org chart only'], ans: 0 },
      { q: 'A stakeholder suggestion is…', opts: ['Always correct', 'Input to requirements, not the goal itself', 'The final requirement', 'Not relevant'], ans: 1 },
    ],
    [
      { q: 'Which investigation technique reveals what people actually do?', opts: ['Observation', 'Reading the logo', 'Guessing', 'Surveys only'], ans: 0 },
      { q: 'Document analysis is…', opts: ['Cheap but can be stale', 'Impossible', 'Alway illegal', 'Only for archives'], ans: 0 },
      { q: 'A good practice is to triangulate…', opts: ['Sources before concluding', 'Chairs in the workshop', 'Menu prices', 'Timesheets'], ans: 0 },
      { q: 'Interviews are best for…', opts: ['Exploring views in depth', 'Counting everything', 'Forcing consensus', 'Filling time'], ans: 0 },
      { q: 'Investigation happens…', opts: ['After guessing the answer', 'Before defining requirements', 'During the party', 'Never'], ans: 1 },
    ],
    [
      { q: 'A testable requirement means…', opts: ['It can be verified objectively', 'It sounds nice', 'It has a comma', 'It fits one line'], ans: 0 },
      { q: 'Which is a functional requirement?', opts: ['The system must send a confirmation email', 'The system should feel modern', 'The vendor should be nice', 'Loading under 30 seconds'], ans: 0 },
      { q: 'Non-functional requirements describe…', opts: ['How well the system must behave', 'What buttons exist', 'Which colours to use forever', 'Hiring plans'], ans: 0 },
      { q: 'MoSCoW is used to…', opts: ['Prioritise requirements', 'Paint walls', 'Name projects', 'Sort emails'], ans: 0 },
      { q: 'Requirement wording should be validated with…', opts: ['The person who raised it', 'A random user', 'The accountant', 'No one'], ans: 0 },
    ],
    [
      { q: 'Evaluation criteria should be agreed…', opts: ['Before scoring options', 'After choosing', 'When the project ends', 'By the vendor'], ans: 0 },
      { q: 'A do-nothing baseline option…', opts: ['Should always be included', 'Is illegal', 'Saves paper', 'Is never useful'], ans: 0 },
      { q: 'Every option should be scored against…', opts: ['Every criterion', 'Only cost', 'The prettiest one', 'Weekly passwords'], ans: 0 },
      { q: 'Recorded reasoning makes a decision…', opts: ['Auditable', 'Invisible', 'More expensive', 'Automatic'], ans: 0 },
      { q: 'Options evaluation compares cost, risk, feasibility and…', opts: ['Fit with strategy', 'Office decor', 'Coffee brands', 'Meeting length'], ans: 0 },
    ],
    [
      { q: 'A recommendation should lead with…', opts: ['The recommendation itself', 'A joke', 'The meeting agenda', 'Page numbers'], ans: 0 },
      { q: 'Communication should be tailored to…', opts: ['The audience', 'The coolest font', 'The loudest person', 'Nobody'], ans: 0 },
      { q: 'Evidence should back…', opts: ['Every claim', 'Only big claims', 'No claims', 'The conclusion only'], ans: 0 },
      { q: 'Next steps in a recommendation need…', opts: ['Clear owners', 'A mascot', 'Ambiguity', 'No dates'], ans: 0 },
      { q: 'The message should use…', opts: ['The audience\'s language', 'Only abbreviations', 'Only your jargon', 'Only emoji'], ans: 0 },
    ],
    [
      { q: 'Stakeholders are mapped by…', opts: ['Power and interest', 'Height and salary', 'Seniority only', 'Surname length'], ans: 0 },
      { q: 'High-power, low-interest stakeholders should be…', opts: ['Kept satisfied', 'Ignored', 'Given the budget', 'Fired'], ans: 0 },
      { q: 'Highly interested allies should be…', opts: ['Managed closely', 'Avoided', 'Overloaded', 'Demoted'], ans: 0 },
      { q: 'The stakeholder map should be…', opts: ['Revisited as the project evolves', 'Frozen forever', 'Secret', 'Deleted weekly'], ans: 0 },
      { q: 'Stakeholder management decides…', opts: ['Project success', 'Office temperature', 'Logo colour', 'Holiday dates'], ans: 0 },
    ],
  ],
  software: [
    [
      { q: 'Software engineering applies…', opts: ['Engineering principles to software', 'Magic to bugs', 'Painting to screens', 'Luck to release days'], ans: 0 },
      { q: 'Process gives…', opts: ['Predictability', 'Confusion', 'Longer meetings', 'More bugs'], ans: 0 },
      { q: 'Quality is…', opts: ['Built in, not inspected in', 'Added at the end', 'Optional', 'The tester\'s fault'], ans: 0 },
      { q: 'Which tool is effectively non-negotiable?', opts: ['Version control', 'Spreadsheets', 'Whiteboards', 'Bugs'], ans: 0 },
      { q: 'Software engineering exists to manage…', opts: ['Complexity', 'Boredom', 'Caffeine levels', 'Parking'], ans: 0 },
    ],
    [
      { q: 'What does SDLC stand for?', opts: ['Software Development Life Cycle', 'System Data Life Cycle', 'Secure Deployment Life Cycle', 'Source Debug Loop Cycle'], ans: 0 },
      { q: 'Requirements feed…', opts: ['Design', 'The exit interview', 'Nothing', 'The marketing deck'], ans: 0 },
      { q: 'Testing happens…', opts: ['In every phase', 'Only at the end', 'Never', 'On weekends only'], ans: 0 },
      { q: 'The longest phase is usually…', opts: ['Maintenance', 'Planning', 'The celebration', 'Warmup'], ans: 0 },
      { q: 'Knowing your phase tells you…', opts: ['What artefacts to produce next', 'When to sleep', 'Who to blame', 'The next meeting'], ans: 0 },
    ],
    [
      { q: 'Software requirements must be…', opts: ['Unambiguous and testable', 'Vague', 'Written once never read', 'Classified'], ans: 0 },
      { q: 'Acceptance criteria written early become…', opts: ['Automated tests later', 'Gossip', 'Browser history', 'Wall posters'], ans: 0 },
      { q: 'Functional requirements describe…', opts: ['What the system does', 'How it feels', 'Office snacks', 'Wage bands'], ans: 0 },
      { q: 'Changes to requirements should…', opts: ['Be managed through a baseline', 'Be ignored', 'Appear silently', 'Void the project'], ans: 0 },
      { q: 'Requirements should trace to…', opts: ['Tests', 'The coffee brand', 'The release date only', 'Nothing'], ans: 0 },
    ],
    [
      { q: 'The test pyramid has…', opts: ['Many unit tests at the bottom', 'Many e2e tests at the bottom', 'No unit tests', 'Equal layers'], ans: 0 },
      { q: 'Integration tests check…', opts: ['That components work together', 'That colors look nice', 'That logins are pretty', 'Nothing'], ans: 0 },
      { q: 'Automation is best for…', opts: ['Repetitive boring checks', 'Creative judgement', 'Art direction', 'Human intuition about UX'], ans: 0 },
      { q: 'Great tests cover…', opts: ['Happy AND failure paths', 'Only happy paths', 'Only failure paths', 'Neither'], ans: 0 },
      { q: 'Unit tests should be…', opts: ['Small and numerous', 'Huge and rare', 'Only on Fridays', 'Written by managers'], ans: 0 },
    ],
    [
      { q: 'CI stands for…', opts: ['Continuous Integration', 'Completely Invisible', 'Continuous Infraction', 'Customer Interface'], ans: 0 },
      { q: 'Continuous integration runs checks…', opts: ['On every change', 'Once a year', 'After launch only', 'When the boss asks'], ans: 0 },
      { q: 'Continuous delivery ships…', opts: ['Tested changes', 'Any change', 'Only hotfixes', 'Vague promises'], ans: 0 },
      { q: 'Infrastructure as code…', opts: ['Fights configuration drift', 'Requires servers in the office', 'Deletes everything', 'Is impossible'], ans: 0 },
      { q: 'Rollbacks should be…', opts: ['As easy as releases', 'Hard and scary', 'Manual forever', 'A monthly ritual'], ans: 0 },
    ],
    [
      { q: 'Code reviews…', opts: ['Spread knowledge', 'Only slow things down', 'Are optional everywhere', 'Replace testing'], ans: 0 },
      { q: 'Retrospectives improve…', opts: ['The process', 'The font size', 'The password', 'The heating bill'], ans: 0 },
      { q: 'Engineers should own…', opts: ['The outcome, not just the ticket', 'Only the code', 'Only the bug count', 'Nothing'], ans: 1 },
      { q: 'A healthy learning loop includes…', opts: ['Continually learning the toolchain', 'Never changing tools', 'Ignoring feedback', 'Daily reboots'], ans: 0 },
      { q: 'Pair reviews and retrospectives keep…', opts: ['Team and system healthy', 'Meetings short', 'Coffee fresh', 'The git log clean'], ans: 0 },
    ],
  ],
  prompt: [
    [
      { q: 'LLMs generate text by…', opts: ['Predicting the next token', 'Searching Wikipedia', 'Copying the internet verbatim', 'Random guessing'], ans: 0 },
      { q: 'Models do not…', opts: ['Actually know facts', 'Predict well', 'Use tokens', 'Read context'], ans: 0 },
      { q: 'Context length is…', opts: ['A real constraint', 'Unlimited', 'Irrelevant', 'A myth'], ans: 0 },
      { q: 'Output quality follows…', opts: ['Input clarity', 'Connection speed', 'Token color', 'Emoji count'], ans: 0 },
      { q: 'Structure in a prompt…', opts: ['Reduces ambiguity', 'Adds confusion', 'Is ignored', 'Breaks the model'], ans: 0 },
    ],
    [
      { q: 'A strong prompt first states…', opts: ['The role', 'The weather', 'The font', 'The date'], ans: 0 },
      { q: 'The task should be…', opts: ['Precise', 'Open-ended', 'Hidden', 'Deferred'], ans: 0 },
      { q: 'Specifying the output format…', opts: ['Removes uncertainty', 'Limits creativity entirely', 'Is not allowed', 'Slows training'], ans: 0 },
      { q: 'Constraints and tone…', opts: ['Should be set in the prompt', 'Should stay implicit', 'Do not exist', 'Come after the answer'], ans: 0 },
      { q: 'Models go wrong most where there is…', opts: ['Uncertainty', 'Structure', 'Clear roles', 'Short tasks'], ans: 0 },
    ],
    [
      { q: 'Few-shot prompting means…', opts: ['Giving examples', 'Using a camera', 'Fewer tokens', 'Less baking'], ans: 0 },
      { q: 'Zero-shot prompts give…', opts: ['No example, just the task', 'Many examples', 'A full novel', 'Only emoji'], ans: 0 },
      { q: 'Big tasks should be…', opts: ['Broken into steps', 'Skipped', 'Compressed to one word', 'Done at night'], ans: 0 },
      { q: 'When a prompt fails, you should…', opts: ['Give feedback and refine', 'Keep rolling dice', 'Give up', 'Blame the model'], ans: 0 },
      { q: 'Examples are meant to show…', opts: ['The shape of the answer', 'The price', 'The logo', 'The errors'], ans: 0 },
    ],
    [
      { q: 'Chain-of-thought means asking for…', opts: ['Step-by-step reasoning', 'A single word', 'No explanation', 'Absolute silence'], ans: 0 },
      { q: 'Step-by-step reasoning helps most on…', opts: ['Maths, logic and planning', 'Emoji selection', 'Colour choice', 'Font pairing'], ans: 0 },
      { q: 'A worked example…', opts: ['Gives a pattern to imitate', 'Is a distraction', 'Must be hidden', 'Always fails'], ans: 0 },
      { q: 'Final answers should be…', opts: ['Verified independently', 'Trusted blindly', 'Guessed', 'Deleted'], ans: 0 },
      { q: 'Order matters: answer first, then…', opts: ['The explanation', 'The applause', 'The silence', 'The refund'], ans: 0 },
    ],
    [
      { q: 'Hallucinations are…', opts: ['Confident-sounding fabrications', 'Real facts always', 'Emojis', 'Input errors'], ans: 0 },
      { q: 'You reduce hallucination risk by…', opts: ['Grounding in source text', 'Making prompts longer forever', 'Ignoring output', 'Using only slang'], ans: 0 },
      { q: 'Asking for citations…', opts: ['Helps verify outputs', 'Makes output private', 'Breaks the model', 'Slows the internet'], ans: 0 },
      { q: 'A single unchecked model output should be…', opts: ['Treated with suspicion', 'Shipped directly', 'Trusted', 'Signed'], ans: 0 },
      { q: 'Keeping a human in the loop…', opts: ['Is essential for safety', 'Slows everything forever', 'Is optional everywhere', 'Ends automation'], ans: 0 },
    ],
    [
      { q: 'A prompt workflow turns prompts into…', opts: ['Reusable tools', 'One-off notes', 'Deleted files', 'Secrets'], ans: 0 },
      { q: 'Prompts should be…', opts: ['Versioned like code', 'Written once', 'Hidden from logs', 'Permanently locked'], ans: 0 },
      { q: 'Templates make prompts…', opts: ['Reusable', 'Broken', 'Secret', 'Unreadable'], ans: 0 },
      { q: 'Logging inputs and outputs lets you…', opts: ['Benchmark improvements', 'Delete the past', 'Hide issues', 'Speed up training'], ans: 0 },
      { q: 'Before adopting a new prompt you should…', opts: ['Benchmark it', 'Rename it', 'Rotate it', 'Forget it'], ans: 0 },
    ],
  ],
};

/* ---------- Videos ---------- */
const VIDEOS = [
  { id: 'v1', title: 'Welcome to Zeelin Academy — Exam Readiness', thumb: S + 'IMG-20260605-WA0031.jpg', dur: '02:45', watched: true, day: 1, takeaway: 'The exam tests your routine, not your sprint. Schedule a daily 20-minute slot.', chapter: 'Welcome' },
  { id: 'v2', title: 'The Role of the Business Analyst', thumb: S + 'IMG-20260605-WA0032.jpg', dur: '06:20', watched: true, day: 1, takeaway: 'Name the technique, then the outcome. Examiners reward a named, applied method.', chapter: 'The Role of the BA' },
  { id: 'v3', title: 'The BA Process Framework', thumb: S + 'IMG-20260605-WA0035.jpg', dur: '07:05', watched: false, day: 2, takeaway: 'Investigate → define requirements → evaluate options → recommend. Keep the steps traceable.', chapter: 'BA Process Framework' },
  { id: 'v4', title: 'Requirements Documentation & MoSCoW', thumb: S + 'IMG-20260605-WA0036.jpg', dur: '18:00', watched: false, day: 2, takeaway: 'MoSCoW = Must / Should / Could / Wont. It forces honest prioritisation under constraints.', chapter: 'Requirements & MoSCoW' },
  { id: 'v5', title: 'Exam Question Pitfalls', thumb: S + 'classroom.jpg', dur: '25:00', watched: false, day: 2, takeaway: 'Read every option before choosing. The exam loves plausible distractors.', chapter: 'Exam Question Pitfalls' },
  { id: 'v6', title: 'Software Engineering Fundamentals', thumb: S + 'IMG-20260605-WA0031.jpg', dur: '08:10', watched: false, day: 3, takeaway: 'Discipline, process and quality gates keep large systems predictable.', chapter: 'Software Fundamentals' },
  { id: 'v7', title: 'The SDLC in Practice', thumb: S + 'IMG-20260605-WA0032.jpg', dur: '09:30', watched: false, day: 3, takeaway: 'Know your phase and the artefacts it demands.', chapter: 'The Software Lifecycle' },
  { id: 'v8', title: 'Quality, Testing & the Test Pyramid', thumb: S + 'IMG-20260605-WA0035.jpg', dur: '11:00', watched: false, day: 4, takeaway: 'Many small unit tests, fewer integration, fewest end-to-end.', chapter: 'Testing & QA' },
  { id: 'v9', title: 'DevOps: Shipping with Confidence', thumb: S + 'IMG-20260605-WA0036.jpg', dur: '10:20', watched: false, day: 4, takeaway: 'CI runs checks on every change; CD ships tested changes.', chapter: 'Deployment & DevOps' },
  { id: 'v10', title: 'How Language Models Actually Work', thumb: S + 'classroom.jpg', dur: '07:45', watched: false, day: 5, takeaway: 'Models predict the next token. Context and structure drive quality.', chapter: 'How LLMs Work' },
  { id: 'v11', title: 'Anatomy of a Great Prompt', thumb: S + 'IMG-20260605-WA0031.jpg', dur: '08:30', watched: false, day: 5, takeaway: 'Role + task + format + constraints beats a vague question.', chapter: 'Prompt Anatomy' },
  { id: 'v12', title: 'Reasoning & Chain-of-Thought', thumb: S + 'IMG-20260605-WA0032.jpg', dur: '09:00', watched: false, day: 6, takeaway: 'Step-by-step reasoning lifts accuracy on logic and maths.', chapter: 'Chain-of-Thought' },
  { id: 'v13', title: 'Safety, Hallucination & Grounding', thumb: S + 'IMG-20260605-WA0035.jpg', dur: '08:00', watched: false, day: 6, takeaway: 'Ground in source text and ask for citations.', chapter: 'Safety & Limits' },
  { id: 'v14', title: 'From Course to Career: Your Job Sprint', thumb: S + 'stack.jpg', dur: '12:00', watched: false, day: 7, takeaway: 'Craft your story, portfolio and pitch — then apply, apply, apply.', chapter: 'Career Launch' },
];
const PLAYLIST = VIDEOS.map((v) => v.id);

const VIDEO_QUIZZES = {
  v1: [
    { q: 'The exam tests your…', opts: ['Routine', 'Luck', 'Sprint', 'Memory'], ans: 0 },
    { q: 'The recommended daily slot is about…', opts: ['20 minutes', '20 seconds', '2 hours', 'Once a week'], ans: 0 },
    { q: 'Consistency beats…', opts: ['Intensity', 'Planning', 'Sleep', 'Coffee'], ans: 0 },
    { q: 'The course is an exam-ready system built on…', opts: ['Daily loops', 'Cramming', 'Mystery', 'Shortcuts'], ans: 0 },
    { q: 'Routines help you handle…', opts: ['Exam pressure', 'Cold weather', 'Internet outages', 'Late busses'], ans: 0 },
  ],
  v2: [
    { q: 'A BA trades in…', opts: ['Named techniques and outcomes', 'Gossip', 'Rumours', 'Magic numbers'], ans: 0 },
    { q: 'Examiners reward…', opts: ['A named, applied method', 'Long answers', 'Fancy fonts', 'Free snacks'], ans: 0 },
    { q: 'The BA sits between…', opts: ['Business and IT', 'HR and legal', 'MKT and sales', 'R&D and QA'], ans: 0 },
    { q: 'You should name a technique then…', opts: ['Explain the outcome', 'Close the tab', 'Applaud', 'Move on'], ans: 0 },
    { q: 'The chapter pairs technique names with…', opts: ['Expected exam outcomes', 'Restaurant menus', 'Brand colours', 'Phone numbers'], ans: 0 },
  ],
  v3: [
    { q: 'After investigating, you define…', opts: ['Requirements', 'Weather', 'Prices', 'None'], ans: 0 },
    { q: 'What follows requirements?', opts: ['Evaluate options', 'Publish', 'Retire', 'Reject'], ans: 0 },
    { q: 'The loop ends with…', opts: ['A recommendation', 'A nap', 'A guess', 'Silence'], ans: 0 },
    { q: 'Steps must stay…', opts: ['Traceable', 'Secret', 'Random', 'Hourly'], ans: 0 },
    { q: 'Which is out of order?', opts: ['Recommend before investigate', 'Investigate before define', 'Define before evaluate', 'Evaluate before recommend'], ans: 0 },
  ],
  v4: [
    { q: 'MoSCoW stands for…', opts: ['Must/Should/Could/Wont', 'Most/Sorted/Codified/Woven', 'Many/Small/Cool/Wide', 'Nice'], ans: 0 },
    { q: 'MoSCoW forces…', opts: ['Honest prioritisation', 'Longer slides', 'More meetings', 'Better font'], ans: 0 },
    { q: '"Must" means…', opts: ['The system cannot launch without it', 'It would be nice', 'Maybe', 'Never'], ans: 0 },
    { q: 'Prioritisation happens under…', opts: ['Constraints', 'No rules', 'Silence', 'Holidays'], ans: 0 },
    { q: 'A good requirement doc records…', opts: ['The priority rationale', 'Only titles', 'Nobody\'s name', 'Blame'], ans: 0 },
  ],
  v5: [
    { q: 'Before choosing, you should…', opts: ['Read every option', 'Pick the first', 'Guess', 'Skip'], ans: 0 },
    { q: 'The exam loves…', opts: ['Plausible distractors', 'Obvious answers', 'Empty options', 'Dumb jokes'], ans: 0 },
    { q: 'Distractors are designed to…', opts: ['Look correct but miss the point', 'Be funny', 'Slow you down only', 'Be ignored'], ans: 0 },
    { q: 'A good habit is to…', opts: ['Eliminate wrong options first', 'Answer blindly', 'Count options', 'Skip long ones'], ans: 0 },
    { q: 'Time is best spent…', opts: ['Reading carefully', 'Second-guessing', 'Rewriting answers', 'Daydreaming'], ans: 0 },
  ],
  v6: [
    { q: 'Software engineering manages…', opts: ['Complexity', 'Painting', 'Rent', 'Meetings'], ans: 0 },
    { q: 'Large systems fail when built by…', opts: ['Guesswork', 'Process', 'Teams', 'Code review'], ans: 0 },
    { q: 'Quality gates make systems…', opts: ['Predictable', 'Mysterious', 'Expensive', 'Wobbly'], ans: 0 },
    { q: 'Version control is…', opts: ['Non-negotiable', 'Optional', 'Expensive', 'Slow'], ans: 0 },
    { q: 'Engineering applies principles to…', opts: ['Software', 'Furniture', 'Cooking', 'Driving'], ans: 0 },
  ],
  v7: [
    { q: 'SDLC begins with…', opts: ['Planning', 'Deployment', 'Testing', 'Retirement'], ans: 0 },
    { q: 'Analysis precedes…', opts: ['Design', 'Retirement', 'Launch party', 'Reboot'], ans: 0 },
    { q: 'Testing is…', opts: ['Every phase, not just a gate', 'A single day', 'Someone else\'s job', 'Optional'], ans: 0 },
    { q: 'The longest SDLC phase is…', opts: ['Maintenance', 'Planning', 'Coffee breaks', 'Stand-ups'], ans: 0 },
    { q: 'Each phase produces…', opts: ['Artefacts that feed the next', 'Dead ends', 'Secrets', 'Nothing'], ans: 0 },
  ],
  v8: [
    { q: 'The pyramid base is…', opts: ['Many unit tests', 'Many e2e tests', 'Few unit tests', 'No tests'], ans: 0 },
    { q: 'Integration tests check…', opts: ['Components working together', 'Colour contrast', 'Logo placement', 'Nothing'], ans: 0 },
    { q: 'Automation suits…', opts: ['Repetitive checks', 'Creative calls', 'Design taste', 'Hiring'], ans: 0 },
    { q: 'Good tests cover…', opts: ['Happy AND failure paths', 'Only happy paths', 'Only sadness', 'Neither'], ans: 0 },
    { q: 'Small unit tests keep the pipeline…', opts: ['Fast', 'Slow', 'Visible', 'Closed'], ans: 0 },
  ],
  v9: [
    { q: 'CI runs checks…', opts: ['On every change', 'Once a year', 'At lunch', 'Never'], ans: 0 },
    { q: 'CD stands for…', opts: ['Continuous Delivery', 'Constant Downtime', 'Code Decoration', 'Content Download'], ans: 0 },
    { q: 'CD ships…', opts: ['Tested changes', 'Anything', 'Only bugs', 'Promises'], ans: 0 },
    { q: 'Infrastructure as code fights…', opts: ['Drift', 'Danger', 'Dinner', 'Debt'], ans: 0 },
    { q: 'Rollbacks should be…', opts: ['As easy as releases', 'Impossible', 'Weekly', 'A myth'], ans: 0 },
  ],
  v10: [
    { q: 'LLMs predict…', opts: ['The next token', 'The weather', 'The stock market', 'Your sleep'], ans: 0 },
    { q: 'Models do not…', opts: ['Truly know facts', 'Use tokens', 'Read context', 'Return text'], ans: 0 },
    { q: 'Context length is…', opts: ['A real constraint', 'Unlimited', 'A myth', 'Optional'], ans: 0 },
    { q: 'Quality input produces…', opts: ['Quality output', 'Random output', 'Silence', 'Errors'], ans: 0 },
    { q: 'Structure in prompts…', opts: ['Reduces ambiguity', 'Adds noise', 'Breaks models', 'Is ignored'], ans: 0 },
  ],
  v11: [
    { q: 'A great prompt states…', opts: ['Role, task, format, constraints', 'Only the topic', 'The deadline', 'A riddle'], ans: 0 },
    { q: 'Giving the model a role…', opts: ['Adds context for better prediction', 'Confuses it', 'Has no effect', 'Slows it down'], ans: 0 },
    { q: 'The output format should be…', opts: ['Explicit', 'Implicit', 'Random', 'Hidden'], ans: 0 },
    { q: 'Constraints belong…', opts: ['In the prompt', 'Nowhere', 'After the answer', 'In the footer'], ans: 0 },
    { q: 'Uncertainty is where models…', opts: ['Go wrong', 'Shine', 'Stop', 'Sleep'], ans: 0 },
  ],
  v12: [
    { q: 'Chain-of-thought asks for…', opts: ['Step-by-step reasoning', 'One-word answers', 'Silence', 'Reverses'], ans: 0 },
    { q: 'Reasoning helps most on…', opts: ['Maths and logic', 'Emoji choice', 'Fonts', 'Colours'], ans: 0 },
    { q: 'You can ask the model to…', opts: ['Explain its answer', 'Skip the work', 'Guess twice', 'Stay silent'], ans: 0 },
    { q: 'A worked example gives…', opts: ['A pattern to imitate', 'A distraction', 'More tokens', 'Confusion'], ans: 0 },
    { q: 'You should verify…', opts: ['The final answer', 'Nothing', 'The prompt length', 'The time'], ans: 0 },
  ],
  v13: [
    { q: 'Hallucinations are…', opts: ['Confident fabrications', 'Real facts', 'Emojis', 'Typos'], ans: 0 },
    { q: 'Grounding supplies…', opts: ['Source text', 'Magic', 'Noise', 'Emoji'], ans: 0 },
    { q: 'Asking for citations…', opts: ['Aids verification', 'Breaks models', 'Is rude', 'Slows text'], ans: 0 },
    { q: 'One unchecked answer should be…', opts: ['Suspicious', 'Trusted', 'Shipped', 'Signed'], ans: 0 },
    { q: 'A human in the loop is…', opts: ['Essential for safety', 'Optional', 'Never needed', 'A myth'], ans: 0 },
  ],
  v14: [
    { q: 'A career sprint begins with…', opts: ['Your story and portfolio', 'Résumé spam', 'Waiting', 'Luck'], ans: 0 },
    { q: 'Job searches are fuelled by…', opts: ['Consistency', 'Procrastination', 'Silence', 'Fashion'], ans: 0 },
    { q: 'Your demo project should…', opts: ['Prove your skill', 'Look pretty only', 'Stay hidden', 'Be copied'], ans: 0 },
    { q: 'Interviews reward…', opts: ['Named experience', 'Vague answers', 'Long silences', 'Blank stares'], ans: 0 },
    { q: 'Landing a role means…', opts: ['Applying, applying, applying', 'Waiting', 'Hoping', 'Retreating'], ans: 0 },
  ],
};

/* ---------- Pitch Decks (visual summary replacement) ---------- */
const DECKS = {
  foundation: {
    id: 'foundation',
    title: 'Foundation — The BA Toolkit Deck',
    course: 'Business Analysis Foundation',
    slides: [
      { img: S + 'IMG-20260605-WA0031.jpg', title: 'The BA in one slide', sub: 'Your role, bridged', bullets: ['Bridge business needs & IT solutions', 'Name techniques, then outcomes', 'Every step stays traceable'] },
      { img: S + 'IMG-20260605-WA0032.jpg', title: 'The 7-step process loop', sub: 'Investigate to recommend', bullets: ['Investigate the situation', 'Define requirements', 'Evaluate options', 'Recommend & communicate'] },
      { img: S + 'IMG-20260605-WA0035.jpg', title: 'Strategy first', sub: 'VMOST & SWOT', bullets: ['VMOST aligns vision with tactics', 'SWOT: internal vs external view', 'Challenge vague objectives early'] },
      { img: S + 'IMG-20260605-WA0036.jpg', title: 'Investigation toolkit', sub: 'Gather evidence', bullets: ['Observation reveals reality', 'Interviews explore depth', 'Documents are cheap but stale', 'Triangulate before concluding'] },
      { img: S + 'IMG-20260605-WA0031.jpg', title: 'Requirements & MoSCoW', sub: 'Define, test, prioritise', bullets: ['Testable requirement statements', 'Functional vs non-functional', 'Must / Should / Could / Wont'] },
      { img: S + 'IMG-20260605-WA0032.jpg', title: 'Stakeholders by power & interest', sub: 'Manage smartly', bullets: ['High power: keep satisfied', 'High interest: manage closely', 'Revisit the map as the project evolves'] },
    ],
  },
  software: {
    id: 'software',
    title: 'Software Engineering — Ship It Deck',
    course: 'Software Engineering',
    slides: [
      { img: S + 'IMG-20260605-WA0035.jpg', title: 'Engineering over guesswork', sub: 'Discipline wins', bullets: ['Process gives predictability', 'Quality is built in', 'Version control is law'] },
      { img: S + 'classroom.jpg', title: 'The SDLC in one glance', sub: 'Plan → test → ship', bullets: ['Requirements feed design', 'Design feeds build', 'Maintenance is the longest phase'] },
      { img: S + 'IMG-20260605-WA0036.jpg', title: 'Requirements with tests', sub: 'Spec that runs', bullets: ['Unambiguous, testable requirements', 'Acceptance criteria become tests', 'Trace requirements to tests'] },
      { img: S + 'IMG-20260605-WA0032.jpg', title: 'The test pyramid', sub: 'Many small, few big', bullets: ['Many unit tests', 'Fewer integration tests', 'Fewest end-to-end tests'] },
      { img: S + 'IMG-20260605-WA0031.jpg', title: 'DevOps loop', sub: 'CI/CD that ships', bullets: ['CI checks every change', 'CD deploys tested changes', 'Rollbacks as easy as releases'] },
      { img: S + 'stack.jpg', title: 'Your engineering career', sub: 'From course to job', bullets: ['Own outcomes, not tickets', 'Code reviews spread knowledge', 'Keep learning the toolchain'] },
    ],
  },
  prompt: {
    id: 'prompt',
    title: 'Prompt Engineering — Think Better Deck',
    course: 'Prompt Engineering',
    slides: [
      { img: S + 'IMG-20260605-WA0031.jpg', title: 'Models predict tokens', sub: 'Know the engine', bullets: ['LLMs predict the next token', 'They do not truly "know"', 'Context length is a constraint'] },
      { img: S + 'IMG-20260605-WA0032.jpg', title: 'Anatomy of a prompt', sub: 'Role + task + format + limits', bullets: ['Give the model a role', 'State the task precisely', 'Specify output format', 'Set constraints and tone'] },
      { img: S + 'IMG-20260605-WA0035.jpg', title: 'Techniques that scale', sub: 'Few-shot & structure', bullets: ['Few-shot examples show the shape', 'Break big tasks into steps', 'Refine with feedback'] },
      { img: S + 'IMG-20260605-WA0036.jpg', title: 'Chain-of-thought', sub: 'Reason step by step', bullets: ['Ask for step-by-step reasoning', 'Strongest on maths & logic', 'Verify the final answer'] },
      { img: S + 'classroom.jpg', title: 'Safety & grounding', sub: 'Avoid hallucination', bullets: ['Hallucinations sound confident', 'Ground in source text', 'Ask for citations'] },
      { img: S + 'stack.jpg', title: 'Prompt workflows', sub: 'Templates & versioning', bullets: ['Template and reuse prompts', 'Version like code', 'Benchmark before switching'] },
    ],
  },
  jobreadiness: {
    id: 'jobreadiness',
    title: 'Career Sprint — Land the Job Deck',
    course: 'Job Readiness Sprint',
    slides: [
      { img: S + 'IMG-20260605-WA0036.jpg', title: 'Your story', sub: 'One-liner that lands', bullets: ['Situation → action → result', 'Name your real skills', 'Own your trajectory'] },
      { img: S + 'IMG-20260605-WA0032.jpg', title: 'Your portfolio', sub: 'Proof beats promises', bullets: ['Ship a demo project', 'Write three case studies', 'Link everything'] },
      { img: S + 'IMG-20260605-WA0035.jpg', title: 'The search loop', sub: 'Apply, apply, apply', bullets: ['10 applications a week', 'Tailor each one', 'Follow up without nagging'] },
      { img: S + 'IMG-20260605-WA0031.jpg', title: 'Interviews', sub: 'Named experience', bullets: ['Name your techniques', 'Describe outcomes', 'Ask smart questions'] },
      { img: S + 'stack.jpg', title: 'The offer', sub: 'Negotiate with data', bullets: ['Benchmark salaries', 'Know your floor', 'Get it in writing'] },
    ],
  },
};

const DECK_QUIZZES = {
  foundation: [
    { q: 'The BA bridges…', opts: ['Business needs and IT solutions', 'Marketing and sales', 'HR and legal', 'Only IT'], ans: 0 },
    { q: 'The first process step is…', opts: ['Investigate', 'Define requirements', 'Evaluate options', 'Recommend'], ans: 0 },
    { q: 'VMOST aligns…', opts: ['Tactics with vision', 'Passwords', 'Schedules', 'Emails'], ans: 0 },
    { q: 'Observation reveals…', opts: ['What people actually do', 'What people say', 'The budget', 'The logo'], ans: 0 },
    { q: 'High-power stakeholders should be…', opts: ['Kept satisfied', 'Ignored', 'Fired', 'Avoided'], ans: 0 },
  ],
  software: [
    { q: 'Process gives…', opts: ['Predictability', 'Chaos', 'Silence', 'Luck'], ans: 0 },
    { q: 'Requirements feed…', opts: ['Design', 'The exit', 'Nothing', 'The logo'], ans: 0 },
    { q: 'Acceptance criteria become…', opts: ['Automated tests', 'Wall art', 'Emails', 'Tickets'], ans: 0 },
    { q: 'The pyramid base is…', opts: ['Many unit tests', 'Many e2e tests', 'No tests', 'Manual tests'], ans: 0 },
    { q: 'CI checks…', opts: ['Every change', 'Only releases', 'Nothing', 'Weekends'], ans: 0 },
  ],
  prompt: [
    { q: 'LLMs predict…', opts: ['The next token', 'The weather', 'The winner', 'The price'], ans: 0 },
    { q: 'A great prompt includes…', opts: ['Role, task, format, constraints', 'Only emoji', 'A deadline', 'A riddle'], ans: 0 },
    { q: 'Few-shot means…', opts: ['Giving examples', 'Using a camera', 'Fewer tokens', 'Less work'], ans: 0 },
    { q: 'Chain-of-thought asks for…', opts: ['Step-by-step reasoning', 'Silence', 'Random guesses', 'Shorter text'], ans: 0 },
    { q: 'Grounding uses…', opts: ['Source text', 'Magic', 'Hunches', 'Emoji'], ans: 0 },
  ],
  jobreadiness: [
    { q: 'A career story uses…', opts: ['Situation → action → result', 'Only salary', 'One word', 'A meme'], ans: 0 },
    { q: 'Portfolios prove…', opts: ['Real skill', 'Attendance', 'Style', 'Speed'], ans: 0 },
    { q: 'A sensible weekly target is…', opts: ['10 applications', '1 application', '0 applications', '100 applications'], ans: 2 },
    { q: 'Interviews reward…', opts: ['Named techniques & outcomes', 'Silence', 'Buzzwords only', 'Persuasion'], ans: 0 },
    { q: 'Negotiation needs…', opts: ['Benchmark data', 'Bluffing', 'Silence', 'Good luck'], ans: 0 },
  ],
};

/* ---------- Previous-session Q&A (curriculum refresh) ---------- */
const PREV_QA = {
  foundation: {
    title: 'Tie up yesterday\u2019s session',
    sub: 'Quick refresher on the BA loop before today\u2019s reading.',
    questions: [
      { q: 'Yesterday we walked the BA process loop. What is the correct order?', opts: ['Investigate → define → evaluate → recommend', 'Evaluate → recommend → investigate → define', 'Define → evaluate → investigate → recommend', 'Recommend → investigate → define → evaluate'], ans: 0 },
      { q: 'Which technique did we use to align analysis with strategy?', opts: ['VMOST', 'Random draw', 'Bubble sort', 'Warmup'], ans: 0 },
      { q: 'What did the exam tip say about naming techniques?', opts: ['Name the technique, then the outcome', 'Never name techniques', 'Only name vendors', 'Keep methods secret'], ans: 0 },
      { q: 'MoSCoW was introduced to…', opts: ['Prioritise requirements', 'Rename projects', 'Sort emails', 'Schedule meetings'], ans: 0 },
      { q: 'Stakeholders with high power should be…', opts: ['Kept satisfied', 'Ignored', 'Demoted', 'Hidden'], ans: 0 },
    ],
  },
  software: {
    title: 'Yesterday on the BA: today in code',
    sub: 'Recall the analysis loop; today it becomes software discipline.',
    questions: [
      { q: 'Yesterday\u2019s BA loop started with…', opts: ['Investigate the situation', 'Deploy to prod', 'Write tests', 'Pick a font'], ans: 0 },
      { q: 'Requirements defined yesterday must be…', opts: ['Testable', 'Vague', 'Secret', 'Only verbal'], ans: 0 },
      { q: 'We prioritised requirements using…', opts: ['MoSCoW', 'Dice rolls', 'Wiki counts', 'Coffee orders'], ans: 0 },
      { q: 'Stakeholder mapping used…', opts: ['Power and interest', 'Height and weight', 'Age and mood', 'Name length'], ans: 0 },
      { q: 'What now drives the software lifecycle?', opts: ['The same requirement discipline', 'Pure luck', 'Random refactors', 'Fashion trends'], ans: 0 },
    ],
  },
  prompt: {
    title: 'Yesterday in code: today in prompts',
    sub: 'The precision of software requirements now shapes your prompts.',
    questions: [
      { q: 'Software requirements were written to be…', opts: ['Unambiguous and testable', 'Short', 'Hidden', 'Vague'], ans: 0 },
      { q: 'Acceptance criteria became…', opts: ['Automated tests', 'Sticky notes', 'Emails', 'Nothing'], ans: 0 },
      { q: 'The test pyramid favours…', opts: ['Many small unit tests', 'One big test', 'Zero tests', 'Manual only'], ans: 0 },
      { q: 'CI runs checks…', opts: ['On every change', 'Never', 'After launch', 'On Mondays'], ans: 0 },
      { q: 'Now apply that precision to…', opts: ['Writing prompts', 'Choosing wallpaper', 'Filing taxes', 'Naming files'], ans: 0 },
    ],
  },
  jobreadiness: {
    title: 'From prompts to portfolio',
    sub: 'Reflect on the skills you have built, then turn them into a career story.',
    questions: [
      { q: 'Your trained skills now include…', opts: ['BA, software and prompt work', 'Only typing', 'Only meetings', 'Nothing'], ans: 0 },
      { q: 'A portfolio should…', opts: ['Prove real skill with projects', 'Hide your work', 'Just list courses', 'Copy others'], ans: 0 },
      { q: 'A one-line career story uses…', opts: ['Situation → action → result', 'Only your age', 'One emoji', 'Your salary'], ans: 0 },
      { q: 'Interviews reward…', opts: ['Named techniques and outcomes', 'Silence', 'Fancy fonts', 'Long monologues'], ans: 0 },
      { q: 'The job search loop favours…', opts: ['Consistency over intensity', 'Waiting', 'Hoping', 'Perfection only'], ans: 0 },
    ],
  },
};

/* ---------- Star-rating branched feedback ---------- */
const STAR_FB = {
  1: { q: 'Tough day — what went wrong?', prompt: 'Tell us what blocked you so we can help.', opts: ['Too much content', 'Concepts unclear', 'Bad time', 'Technical issue'] },
  2: { q: 'A bumpy session — where did it hurt?', prompt: 'Pick the biggest blocker and tell us more.', opts: ['Reading was heavy', 'Video too fast', 'Deck unclear', 'Quiz unfair'] },
  3: { q: 'Decent session — what could improve it?', prompt: 'One small change would have made this great.', opts: ['Slow the pacing down', 'More examples', 'Clearer deck', 'More practice'] },
  4: { q: 'Strong session — what almost made it perfect?', prompt: 'Share the small gap between good and great.', opts: ['A little more depth', 'A recap at the end', 'Longer quiz', 'More videos'] },
  5: { q: 'Excellent! What made it click?', prompt: 'Tell us what worked so we keep doing it.', opts: ['Clear examples', 'Great deck', 'The quiz helped', 'Perfect pacing'] },
};

/* ---------- Dashboard day cards (per day) ---------- */
const DAY_CARDS = {
  1: {
    title: 'Foundations',
    intro: 'Meet the Business Analyst role, the process loop and how strategy shapes analysis.',
    overall: 35,
    prevRep: {
      q: 'Understand the BA role and the process framework.',
    },
    cards: [
      { k: 'checkin', icon: 'user-check', tile: 'green', title: 'Attendance & Personal Check-In', sub: 'Daily attendance — complete it to claim XP', pct: 100, cls: 'green', href: '/checkin', btn: 'Check In' },
      { k: 'roadmap', icon: 'compass', tile: 'amber', title: 'Daily Structured Reading Roadmap', sub: '2 of 5 milestones cleared', pct: 40, cls: 'amber', href: '/roadmap', btn: 'Continue Roadmap' },
      { k: 'reading', icon: 'book', tile: 'green', title: 'Daily Reading Material', sub: 'Chapter 1 of 8 consumed', pct: 60, cls: 'green', href: '/book/foundation/0', btn: 'Open Book' },
      { k: 'video', img: S + 'IMG-20260605-WA0031.jpg', title: 'Video Tutorial', sub: 'Video 1 of 2 watched', pct: 50, cls: 'amber', href: '/videos', btn: 'Continue Video' },
      { k: 'visual', icon: 'layers', tile: 'blue', title: 'Visual Summary — Pitch Deck', sub: 'The BA Toolkit deck, ready to flip through', pct: 40, cls: 'blue', href: '/visual/foundation', btn: 'View Deck' },
    ],
    feedback: { title: 'Daily Feedback & Q&A', sub: 'Rate the day, answer the refresher and share anything we can improve.' },
  },
  2: {
    title: 'Requirements & Analysis',
    intro: 'Turn investigation into testable requirements and honest prioritisation.',
    overall: 20,
    cards: [
      { k: 'checkin', icon: 'user-check', tile: 'green', title: 'Attendance & Personal Check-In', sub: 'Daily attendance — complete it to claim XP', pct: 60, cls: 'green', href: '/checkin', btn: 'Check In' },
      { k: 'roadmap', icon: 'compass', tile: 'amber', title: 'Daily Structured Reading Roadmap', sub: '3 of 5 milestones cleared', pct: 60, cls: 'amber', href: '/roadmap', btn: 'Continue Roadmap' },
      { k: 'reading', icon: 'book', tile: 'green', title: 'Daily Reading Material', sub: 'Chapter 5 of 8 consumed', pct: 40, cls: 'green', href: '/book/foundation/4', btn: 'Open Book' },
      { k: 'video', img: S + 'IMG-20260605-WA0036.jpg', title: 'Video Tutorial', sub: '3 of 3 videos watched', pct: 80, cls: 'green', href: '/videos', btn: 'Replay Video' },
      { k: 'visual', icon: 'layers', tile: 'blue', title: 'Visual Summary — Pitch Deck', sub: 'Requirements & stakeholders deck', pct: 20, cls: 'blue', href: '/visual/foundation', btn: 'View Deck' },
    ],
    feedback: { title: 'Daily Feedback & Q&A', sub: 'Rate the day and refresh the core loop.' },
  },
  3: {
    title: 'Software Engineering',
    intro: 'Discipline, process and quality gates for building software that actually ships.',
    overall: 10,
    cards: [
      { k: 'checkin', icon: 'user-check', tile: 'green', title: 'Attendance & Personal Check-In', sub: 'Daily attendance — complete it to claim XP', pct: 0, cls: 'amber', href: '/checkin', btn: 'Check In' },
      { k: 'roadmap', icon: 'compass', tile: 'amber', title: 'Daily Structured Reading Roadmap', sub: '0 of 5 milestones cleared', pct: 0, cls: 'amber', href: '/roadmap', btn: 'Start Roadmap' },
      { k: 'reading', icon: 'book', tile: 'green', title: 'Daily Reading Material', sub: 'Chapter 1 of 6 consumed', pct: 16, cls: 'green', href: '/book/software/0', btn: 'Open Book' },
      { k: 'video', img: S + 'IMG-20260605-WA0032.jpg', title: 'Video Tutorial', sub: 'Video 1 of 2 watched', pct: 20, cls: 'amber', href: '/videos', btn: 'Continue Video' },
      { k: 'visual', icon: 'layers', tile: 'blue', title: 'Visual Summary — Pitch Deck', sub: 'The ship-it deck for software', pct: 0, cls: 'blue', href: '/visual/software', btn: 'View Deck' },
    ],
    feedback: { title: 'Daily Feedback & Q&A', sub: 'Rate the day and refresh the analysis loop.' },
  },
  4: {
    title: 'Testing, DevOps & Delivery',
    intro: 'Quality is built in, not inspected in — from unit tests to confident deployments.',
    overall: 5,
    cards: [
      { k: 'checkin', icon: 'user-check', tile: 'green', title: 'Attendance & Personal Check-In', sub: 'Daily attendance — complete it to claim XP', pct: 0, cls: 'amber', href: '/checkin', btn: 'Check In' },
      { k: 'roadmap', icon: 'compass', tile: 'amber', title: 'Daily Structured Reading Roadmap', sub: '0 of 5 milestones cleared', pct: 0, cls: 'amber', href: '/roadmap', btn: 'Start Roadmap' },
      { k: 'reading', icon: 'book', tile: 'green', title: 'Daily Reading Material', sub: 'Chapter 4 of 6 consumed', pct: 8, cls: 'green', href: '/book/software/3', btn: 'Open Book' },
      { k: 'video', img: S + 'IMG-20260605-WA0035.jpg', title: 'Video Tutorial', sub: '2 of 2 videos watched', pct: 60, cls: 'amber', href: '/videos', btn: 'Continue Video' },
      { k: 'visual', icon: 'layers', tile: 'blue', title: 'Visual Summary — Pitch Deck', sub: 'The ship-it deck for software', pct: 0, cls: 'blue', href: '/visual/software', btn: 'View Deck' },
    ],
    feedback: { title: 'Daily Feedback & Q&A', sub: 'Rate the day and refresh the pipeline.' },
  },
  5: {
    title: 'Prompt Engineering',
    intro: 'Understand the model, then write prompts that behave predictably.',
    overall: 0,
    cards: [
      { k: 'checkin', icon: 'user-check', tile: 'green', title: 'Attendance & Personal Check-In', sub: 'Daily attendance — complete it to claim XP', pct: 0, cls: 'amber', href: '/checkin', btn: 'Check In' },
      { k: 'roadmap', icon: 'compass', tile: 'amber', title: 'Daily Structured Reading Roadmap', sub: '0 of 4 milestones cleared', pct: 0, cls: 'amber', href: '/roadmap', btn: 'Start Roadmap' },
      { k: 'reading', icon: 'book', tile: 'green', title: 'Daily Reading Material', sub: 'Chapter 1 of 6 consumed', pct: 16, cls: 'green', href: '/book/prompt/0', btn: 'Open Book' },
      { k: 'video', img: S + 'IMG-20260605-WA0031.jpg', title: 'Video Tutorial', sub: 'Video 1 of 2 watched', pct: 0, cls: 'amber', href: '/videos', btn: 'Watch Video' },
      { k: 'visual', icon: 'layers', tile: 'blue', title: 'Visual Summary — Pitch Deck', sub: 'Think-better deck for prompts', pct: 0, cls: 'blue', href: '/visual/prompt', btn: 'View Deck' },
    ],
    feedback: { title: 'Daily Feedback & Q&A', sub: 'Rate the day and refresh your precision.' },
  },
  6: {
    title: 'Reasoning & Safe AI Use',
    intro: 'Chain-of-thought, grounding and building workflows you can actually reuse.',
    overall: 0,
    cards: [
      { k: 'checkin', icon: 'user-check', tile: 'green', title: 'Attendance & Personal Check-In', sub: 'Daily attendance — complete it to claim XP', pct: 0, cls: 'amber', href: '/checkin', btn: 'Check In' },
      { k: 'roadmap', icon: 'compass', tile: 'amber', title: 'Daily Structured Reading Roadmap', sub: '0 of 4 milestones cleared', pct: 0, cls: 'amber', href: '/roadmap', btn: 'Start Roadmap' },
      { k: 'reading', icon: 'book', tile: 'green', title: 'Daily Reading Material', sub: 'Chapter 4 of 6 consumed', pct: 0, cls: 'amber', href: '/book/prompt/3', btn: 'Open Book' },
      { k: 'video', img: S + 'IMG-20260605-WA0036.jpg', title: 'Video Tutorial', sub: '2 of 2 videos watched', pct: 40, cls: 'amber', href: '/videos', btn: 'Continue Video' },
      { k: 'visual', icon: 'layers', tile: 'blue', title: 'Visual Summary — Pitch Deck', sub: 'Think-better deck for prompts', pct: 0, cls: 'blue', href: '/visual/prompt', btn: 'View Deck' },
    ],
    feedback: { title: 'Daily Feedback & Q&A', sub: 'Rate the day and refresh your workflow.' },
  },
  7: {
    title: 'Job Readiness Sprint',
    intro: 'Your story, your portfolio, your search — then you land the job.',
    overall: 0,
    cards: [
      { k: 'checkin', icon: 'user-check', tile: 'green', title: 'Attendance & Personal Check-In', sub: 'Final attendance — complete it to finish', pct: 0, cls: 'amber', href: '/checkin', btn: 'Check In' },
      { k: 'roadmap', icon: 'compass', tile: 'amber', title: 'Career Roadmap', sub: '0 of 5 milestones cleared', pct: 0, cls: 'amber', href: '/roadmap', btn: 'Start Roadmap' },
      { k: 'reading', icon: 'book', tile: 'green', title: 'Career Workbook', sub: 'Story + portfolio workbook', pct: 0, cls: 'amber', href: '/book/prompt/5', btn: 'Open Workbook' },
      { k: 'video', img: S + 'stack.jpg', title: 'Video Tutorial', sub: 'From course to career', pct: 0, cls: 'amber', href: '/videos', btn: 'Watch Video' },
      { k: 'visual', icon: 'layers', tile: 'blue', title: 'Visual Summary — Pitch Deck', sub: 'Land-the-job deck', pct: 0, cls: 'blue', href: '/visual/jobreadiness', btn: 'View Deck' },
    ],
    feedback: { title: 'Daily Feedback & Q&A', sub: 'Rate your readiness and finish the sprint.' },
  },
};

/* ---------- Reading sections ---------- */
const READING_SECTIONS = [
  { id: 'section-1', label: 'Core Textbook — Foundation in BA Practice', compulsory: true },
  { id: 'section-2', label: 'Executive Briefing — Software Engineering', compulsory: true },
  { id: 'section-3', label: 'Executive Briefing — Prompt Engineering', compulsory: true },
];

/* ---------- Check-in (4-option scale shared) ---------- */
const CHECKIN = {
  top: { label: 'Ready to Claim', progress: 0, suffix: '0%' },
  productive: [
    { icon: 'fire', label: 'Very Productive' },
    { icon: 'zap', label: 'Productive' },
    { icon: 'timer', label: 'Okay' },
    { icon: 'coffee', label: 'Off Day' },
  ],
  energy: [
    { icon: 'fire', label: 'Energised' },
    { icon: 'zap', label: 'Calm & Focused' },
    { icon: 'timer', label: 'Meh' },
    { icon: 'coffee', label: 'Low Energy' },
  ],
  streak: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  streakOn: 5,
  panelChecks: ['Day streak XP claimed', 'Weekend double-XP ready'],
  xpAmount: 500,
};

/* ---------- Accountability ---------- */
const ACCOUNTABILITY = {
  top: { label: 'Exam Ready Soon', progress: 78, suffix: '78%' },
  pie: {
    segments: [
      ['var(--amber)', '0 200deg'],
      ['var(--green)', '200deg 290deg'],
      ['var(--blue)', '290deg 340deg'],
      ['#475569', '340deg 360deg'],
    ],
    inner: { value: '78%', label: 'Completed' },
    legend: [
      ['var(--amber)', 'Reading — 55%'],
      ['var(--green)', 'Videos — 25%'],
      ['var(--blue)', 'Quizzes — 14%'],
      ['#475569', 'Locked — 6%'],
    ],
  },
  chartTitle: 'Study Hours — This Week',
};

/* ---------- Visual (default deck meta fallback) ---------- */
const VISUAL = {
  top: { label: 'Level 4 Mastery', progress: 85, suffix: '85%' },
  trophy: { title: 'Gold Tier Visual Scholar', sub: 'Course Mastery', xp: '1,450 XP', right: '100% Mastery' },
  pie: {
    segments: [['var(--amber)', '0 216deg'], ['var(--green)', '216deg 306deg'], ['var(--blue)', '306deg 360deg']],
    inner: { value: '100%', label: 'Mastery' },
    legend: [
      ['var(--amber)', 'Elicitation — 60%'],
      ['var(--green)', 'Prioritization — 25%'],
      ['var(--blue)', 'Strategy — 15%'],
    ],
  },
  root: 'BA Practice',
  children: ['Elicitation', 'Analysis', 'Prioritisation'],
  panelTitle: 'Right Recap',
  checks: ['Foundation workbook — complete', 'Chapter 3 recap — complete'],
};

/* ---------- Community / feed / calendar / recordings / support / aluminal ---------- */
const FEED = [
  { id: 'f1', who: 'Cohort 001 · Parenting', title: 'New session uploaded', body: 'Day 1 recap: watch the latest tutorial before your mock quiz.', time: '2h ago', color: 'var(--green)' },
  { id: 'f2', who: 'Mentor · Amina', title: 'Your accountability check is due', body: 'Submit your daily check-in to keep your 5-day streak alive.', time: '5h ago', color: 'var(--amber)' },
  { id: 'f3', who: 'Zeelin Academy', title: 'Monday Motivation delivered', body: 'A fresh motivational brief landed in your Monday Motivations feed.', time: '1d ago', color: 'var(--blue)' },
  { id: 'f4', who: 'Cohort 001 · Parenting', title: 'Calendar updated', body: 'The live workshop has been added for August 4 / Q&A on August 8.', time: '1d ago', color: 'var(--green)' },
];

const MONDAY = [
  { q: 'Three books are not a mountain.', body: 'Take one chapter a day and the summit takes care of itself.', author: 'Zeelin' },
  { q: 'Your 5–9 is your superpower.', body: 'Busy parents finish because they refuse to start as a hobbyist.', author: 'Cohort Coach' },
  { q: 'Consistency beats intensity.', body: 'One quiz today beats three yesterday.', author: 'Study Guide' },
];

const MONDAY_FEATURED = {
  badge: 'Motivation',
  title: 'Consistency Beats Intensity: Setting Your Weekly Pace',
  body: 'A narrow, daily 20-minute slot beats cramming at the weekend. The exam tests your routine, not your sprint.',
  author: 'Zeelin Academy',
  avatar: S + 'IMG-20260605-WA0031.jpg',
  image: S + 'IMG-20260605-WA0036.jpg',
};

const COMMUNITY = {
  me: { name: 'John Doe', avatar: A + 'avatar_1.png' },
  composer: 'What update are you proud of this week? Share your win below.',
  posts: [
    {
      id: 'p1',
      author: 'Community · Study Group',
      initials: 'CN',
      avatar: S + 'IMG-20260605-WA0032.jpg',
      color: 'var(--teal)',
      ring: 'teal',
      body: 'Looking for partners to review Business Analysis Foundation Day 1 — I\u2019ll host a quick 20-minute zoom on the BA role & process framework.',
      tag: 'Study Group',
      tagCls: 'pill-teal',
      reacts: '14 likes · 6 replies',
      time: 'Yesterday',
    },
    {
      id: 'p2',
      author: 'Community · General',
      initials: 'MA',
      avatar: S + 'IMG-20260605-WA0035.jpg',
      color: 'var(--purple)',
      ring: 'purple',
      body: 'Exam readiness checklist tip: read the first paragraph of every chapter out loud — retention jumps when you hear your own voice.',
      tag: 'General',
      tagCls: 'pill-purple',
      reacts: '28 likes · 11 replies',
      time: '2 days ago',
    },
  ],
};

const CALENDAR_EVENTS = [
  {
    id: 'c1', date: 4, month: 8, year: 2026, dow: 'Tue', offset: 0, color: 'amber', dcol: '',
    title: 'Live Workshop: Effective Communication in Parenting & Study Balance',
    pills: [{ text: 'Live Session', cls: 'pill-amber' }],
    meta: '4:00 PM — 5:00 PM · Live on Zoom',
  },
  {
    id: 'c2', date: 8, month: 8, year: 2026, dow: 'Sat', offset: 3, color: 'blue', dcol: 'blue',
    title: 'Cohort 001 Weekly Q&A and Check-in',
    pills: [{ text: 'Q&A Session', cls: 'pill-blue' }],
    meta: '2:00 PM — 3:00 PM · Live on Zoom',
  },
];

const RECORDINGS = [
  { id: 'r1', title: 'Orientation & Business Analysis Foundation Overview', meta: '28 Jul 2026 · 48 min', cover: S + 'IMG-20260605-WA0031.jpg', badge: { text: 'Current Event', cls: 'pill-amber' }, host: { name: 'Zeelin Academy', avatar: S + 'IMG-20260605-WA0031.jpg', cls: '' } },
  { id: 'r2', title: 'Parenting Strategies & Time Management Masterclass', meta: '19 Jul 2026 · 55 min', cover: S + 'IMG-20260605-WA0036.jpg', badge: { text: 'Previous Event', cls: 'pill-blue' }, host: { name: 'Olaniyi Emeka · OE', avatar: S + 'IMG-20260605-WA0032.jpg', cls: '' } },
];

const SUPPORT = {
  hero: { title: 'Need a hand? We\u2019ve got you covered.', body: 'Browse the FAQ, tap into the knowledge bank for guides on quizzes, streaks and the reading workspace, or manage your billing directly.', image: S + 'IMG-20260605-WA0032.jpg' },
  cards: [
    { id: 'faq', image: S + 'IMG-20260605-WA0031.jpg', tag: 'Support', tagCls: 'sup-tag', title: 'FAQ', body: 'Answers to the most common questions about quizzes, XP, streaks and membership.', foot: { who: 'Zeelin Academy', avatar: S + 'IMG-20260605-WA0031.jpg', href: '/support#faq' } },
    { id: 'kb', image: S + 'IMG-20260605-WA0035.jpg', tag: 'Resources', tagCls: 'sup-tag amber', title: 'Knowledge Bank & Guides', body: 'Guides on the exam pack, the mock quiz format and the daily reading loop.', foot: { who: 'Admin posted 3 months ago', avatar: S + 'IMG-20260605-WA0035.jpg', href: '/support#kb' } },
    { id: 'billing', image: S + 'IMG-20260605-WA0036.jpg', tag: 'Billing', tagCls: 'sup-tag green', title: 'Manage Account & Billing', body: 'Update your details, download your data or manage your membership.', foot: { who: 'Billing team', avatar: S + 'IMG-20260605-WA0036.jpg', href: '/support#billing' } },
  ],
  faqs: [
    { q: 'How do I submit my daily accountability report?', a: 'Open the Accountability Check-In from your Day page, fill the readiness form and hit \u201cSubmit\u201d. Your report feeds the weekly analytics chart.' },
    { q: 'My video will not play — what should I do?', a: 'Ensure you are online, then refresh. If it persists, use the Replay/Watch button from Video Tutorials.' },
    { q: 'Can I retake a mock quiz?', a: 'Yes. Each chapter has the same simple 5-question quiz and you can retake it as often as you like to build readiness.' },
    { q: 'How does my XP and streak work?', a: 'Claim the +500 XP in your Personal Check-In once a day. Submitting every day grows your streak widget.' },
  ],
  manage: ['Cancel annual membership', 'Update billing address', 'Download my data', 'Pause my cohort term'],
};

const ALUMINAL = {
  hero: { badge: 'Limited Time 80% Off Special Offer', title: 'Aluminal — the lifelong coalition of Zeelin Academy graduates.', body: 'Every resource, guide and community perk stays yours for life. One fee, no renewals.' },
  features: [
    { img: S + 'IMG-20260605-WA0031.jpg', tag: 'FEATURE 01', title: 'Lifetime library access', body: 'Keep every book, briefing and workbook after your course ends.' },
    { img: S + 'IMG-20260605-WA0032.jpg', tag: 'FEATURE 02', title: 'Aluminal coaching circle', body: 'Monthly live calls with past graduates and mentors.' },
    { img: S + 'IMG-20260605-WA0035.jpg', tag: 'FEATURE 03', title: 'Exam voucher support', body: 'Guidance and incentives toward your BCS exam voucher.' },
    { img: S + 'IMG-20260605-WA0036.jpg', tag: 'FEATURE 04', title: 'Early-access resources', body: 'New lessons and mocks before the public release.' },
    { img: S + 'classroom.jpg', tag: 'FEATURE 05', title: 'Alumni directory', body: 'Join a private network of certified practitioners.' },
    { img: S + 'stack.jpg', tag: 'FEATURE 06', title: 'Certificate showcase', body: 'A verified digital badge you can share.' },
  ],
  cta: { old: '£100', price: '£20', label: 'Save 80% Today — one-time payment, lifetime access.' },
};

/* ---------- Analytics ---------- */
const WEEKLY = [
  { d: 'Mon', h: 3.5 }, { d: 'Tue', h: 5.0 }, { d: 'Wed', h: 4.0 }, { d: 'Thu', h: 6.0 }, { d: 'Fri', h: 4.5 }, { d: 'Sat', h: 2.0 }, { d: 'Sun', h: 3.0 },
];

const PIE_BREAKDOWN = [
  { label: 'Reading', pct: 55, cls: 'amber' },
  { label: 'Videos', pct: 25, cls: 'green' },
  { label: 'Quizzes', pct: 14, cls: 'blue' },
  { label: 'Locked', pct: 6, cls: 'slate' },
];

const METRICS = [
  { label: '78% Complete', value: '78%', cls: 'green', bar: 78, color: 'var(--green)' },
  { label: 'Days Remaining', value: '4 Days', cls: 'amber', bar: 40, color: 'var(--amber)' },
  { label: 'Days to Certification', value: '12 Days', cls: 'teal', bar: 60, color: 'var(--teal-light)' },
  { label: 'Advanced Strength', value: '88/100', cls: 'blue', bar: 88, color: 'var(--blue)' },
  { label: 'XP Earned Total', value: '3,450 XP', cls: 'green', bar: 69, color: 'var(--green)' },
  { label: 'Quizzes Passed', value: '9 / 10', cls: 'blue', bar: 90, color: 'var(--blue)' },
];

/* ---------- Profile insights ---------- */
const INSIGHTS = {
  bestDay: 'Thursday',
  avgHours: '4.2h',
  daysToCert: '12 Days',
  consistency: '78%',
  accuracy: '84%',
  quizStreak: '9 / 10',
  skills: [
    { label: 'Business Analysis', pct: 78, color: 'var(--amber)' },
    { label: 'Software Engineering', pct: 34, color: 'var(--blue)' },
    { label: 'Prompt Engineering', pct: 12, color: 'var(--green)' },
  ],
  readiness: [
    { label: 'Reading recall', pct: 82, color: 'var(--green)' },
    { label: 'Video retention', pct: 74, color: 'var(--amber)' },
    { label: 'Quiz accuracy', pct: 88, color: 'var(--blue)' },
  ],
};

const FRAMEWORKS = [
  'BCS Swot-LEVEL Analysis', 'MoSCoW Prioritisation', 'BABOK Core Model', 'VMOST', 'Rich Picture / CATWOE', 'PESTLE', 'Seven-Step BA Process',
];

/* ---------- Profile extras ---------- */
const PROFILE_EXTRA = {
  skillShare: {
    segments: [['var(--amber)', '0 280deg'], ['var(--blue)', '280deg 333deg'], ['var(--green)', '333deg 360deg']],
    inner: { value: '84%', label: 'Accuracy' },
    legend: [
      ['var(--amber)', 'Business Analysis - 78%'],
      ['var(--blue)', 'Software Engineering - 34%'],
      ['var(--green)', 'Prompt Engineering - 12%'],
    ],
  },
  coursePath: [
    { short: 'BA Foundation', id: 'ba-foundation', pct: 78, color: 'var(--amber)', cls: 'amber' },
    { short: 'Software Eng', id: 'software-engineering', pct: 34, color: 'var(--blue)', cls: 'blue' },
    { short: 'Prompt Eng', id: 'prompt-engineering', pct: 12, color: 'var(--green)', cls: 'green' },
    { short: 'Job Sprint', id: 'job-readiness', pct: 4, color: 'var(--teal-light)', cls: 'teal' },
  ],
  xpWeek: [
    { d: 'Mon', v: 620 }, { d: 'Tue', v: 850 }, { d: 'Wed', v: 540 }, { d: 'Thu', v: 1080 }, { d: 'Fri', v: 760 }, { d: 'Sat', v: 300 }, { d: 'Sun', v: 640 },
  ],
  dayJourney: [
    { day: 1, label: 'Foundations', done: true },
    { day: 2, label: 'Requirements', done: true },
    { day: 3, label: 'Software Eng', done: true },
    { day: 4, label: 'Testing & DevOps', done: false },
    { day: 5, label: 'Prompt Eng', done: false },
    { day: 6, label: 'Safe AI', done: false },
    { day: 7, label: 'Job Sprint', done: false },
  ],
  habits: [
    { label: 'Daily check-in', pct: 92, color: 'var(--green)' },
    { label: 'Reading completion', pct: 86, color: 'var(--amber)' },
    { label: 'Video completion', pct: 78, color: 'var(--blue)' },
    { label: 'Deck completion', pct: 71, color: 'var(--teal-light)' },
  ],
  timeSplit: {
    segments: [['var(--amber)', '0 198deg'], ['var(--green)', '198deg 288deg'], ['var(--blue)', '288deg 342deg'], ['#475569', '342deg 360deg']],
    inner: { value: '28h', label: 'This week' },
    legend: [
      ['var(--amber)', 'Reading - 55%'],
      ['var(--green)', 'Videos - 25%'],
      ['var(--blue)', 'Quizzes - 14%'],
      ['#475569', 'Locked - 6%'],
    ],
  },
};

/* generic question bank kept for legacy /quiz route fallback */
const QUIZ_BANK = CHAPTER_QUIZZES.foundation[0];

const TODAY = new Date(2026, 7, 4); // 4 Aug 2026 (month is 0-indexed)