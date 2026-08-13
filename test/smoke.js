/* Route + functional smoke test for Zeelin Academy dashboard (jsdom).
   Loads data.js + app.js in a jsdom window, walks every route, asserts a
   distinctive marker rendered per route, then exercises the gate-quiz engine
   by clicking the book page "Complete & Continue" button. */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="shell" class="app"><header class="topbar" id="topbar"></header><div class="shell-row"><aside class="sidebar" id="sidebar"></aside><div class="backdrop" id="backdrop"></div><div class="content"><main class="page" id="page"></main></div></div></div></body></html>', {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});

const { window } = dom;
const { document } = window;

// Claim today so boot does not auto-spawn the check-in overlay (prevents
// overlapping modals while we walk routes) and set a deterministic day.
window.localStorage.setItem('zdash_state_v4', JSON.stringify({
  xp: 2950, streak: 5, claims: 2,
  done: {}, doneVideo: {}, doneDeck: {},
  claimedDays: {}, claimedAt: null,
  day: 1, completedDays: [],
  ci: {}, stars: null, improve: '', unclear: '',
  prevDoneDay: {}, prevA: {},
}));

let fatal = null;
window.addEventListener('error', (e) => { fatal = e.error || e.message; });

function evalSrc() {
  window.eval(dataSrc + '\n;\n' + appSrc);
}

function goto(hash) {
  if (window.location.hash !== hash) window.location.hash = hash;
  window.dispatchEvent(new window.Event('hashchange'));
}

const routes = [
  ['#/', 'Welcome back'],
  ['#/dashboard', 'Welcome back'],
  ['#/day', 'Overall Day Progress'],
  ['#/accountability', 'Weekly Completion Breakdown'],
  ['#/checkin', 'Ready to Claim'],
  ['#/book/foundation/0', 'The Role of the Business Analyst'],
  ['#/book/software/0', 'Software Engineering Fundamentals'],
  ['#/book/prompt/0', 'How Language Models Work'],
  ['#/book/foundation/7', 'Working with Stakeholders'],
  ['#/videos', 'Video Tutorials'],
  ['#/watch/v1', 'Welcome to Zeelin Academy'],
  ['#/watch/v14', 'From Course to Career'],
  ['#/visual/foundation', 'deck-stage'],
  ['#/visual/software', 'deck-stage'],
  ['#/visual/prompt', 'deck-stage'],
  ['#/visual/jobreadiness', 'deck-stage'],
  ['#/roadmap', 'Chapter'],
  ['#/profile', 'journey-strip'],
  ['#/community', 'Your network'],
  ['#/calendar', 'August 2026'],
  ['#/recordings', 'Event Recordings'],
  ['#/support', 'Help centre'],
  ['#/aluminal', 'Become an Aluminal'],
  ['#/monday', 'Monday Motivations'],
  ['#/nonsense-route', 'Welcome back'],
];

let pass = 0;
const failures = [];

evalSrc();

for (const [hash, marker] of routes) {
  goto(hash);
  const html = document.getElementById('page').innerHTML;
  const ok = html && html.length > 0 && html.includes(marker);
  if (ok) {
    pass++;
  } else {
    failures.push(hash + ' (expected "' + marker + '")');
  }
}

// Functional: gate quiz engine opens from book page "Complete & Continue"
goto('#/book/foundation/0');
let btn = document.getElementById('chNext');
if (btn) btn.dispatchEvent(new window.Event('click', { bubbles: true }));
let gate = document.getElementById('gateOv');
if (gate && gate.innerHTML.includes('Question 1 of 5')) {
  pass++;
} else {
  failures.push('#/book/foundation/0 gate quiz did not open on Complete');
}
// close the gate + any overlay so a fresh route render stays clean
if (gate) gate.remove();
const anyOv = document.getElementById('dashOv');
if (anyOv) anyOv.remove();

if (fatal) failures.push('page error: ' + fatal);

console.log('Routes: ' + pass + '/' + (routes.length + 1) + ' passing');
if (failures.length) {
  console.log('FAILURES:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('All smoke checks passed.');
process.exit(0);