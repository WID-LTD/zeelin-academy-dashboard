/* Functional test: gated XP check-in flow.
   Fresh state -> dashboard auto-spawns the check-in overlay -> blocks are
   filled -> "Ready to Claim" bar reaches 100% and the dimmed Claim button
   activates -> clicking Claim flies the +500 XP win screen and persists XP. */

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
const click = (el) => el && el.dispatchEvent(new window.Event('click', { bubbles: true }));
const input = (el, val) => {
  el.value = val;
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};

let fatal = null;
window.addEventListener('error', (e) => { fatal = e.error || e.message; });
window.eval(dataSrc + '\n;\n' + appSrc);

(async () => {
  // Navigate to #/day before waiting for the auto-spawned overlay.
  window.location.hash = '#/day';
  window.dispatchEvent(new window.Event('hashchange'));
  // Wait for the auto-spawned check-in overlay (350ms delay in app).
  await new Promise((r) => setTimeout(r, 600));
  let ov = document.getElementById('dashOv');
  if (!ov || !ov.innerHTML.includes('Daily Check-In')) {
    console.log('FAIL: check-in overlay did not auto-spawn on dashboard');
    process.exit(1);
  }
  console.log('OK: check-in overlay auto-spawned');

  click(ov.querySelector('[data-ci="productive"][data-v="1"]'));
  click(ov.querySelector('[data-ci="energy"][data-v="0"]'));
  click(ov.querySelector('[data-star="5"]'));
  input(ov.querySelector('#ciImprove'), 'Loved the pacing this week.');
  input(ov.querySelector('#ciUnclear'), 'MoSCoW prioritisation was clear.');

  const pctEl = ov.querySelector('#ciPct');
  const claimBtn = ov.querySelector('#claimXp');
  const pctText = pctEl ? pctEl.textContent : '';
  if (pctText !== '100%') {
    console.log('FAIL: ready-to-claim progress is ' + pctText + ' (expected 100%)');
    process.exit(1);
  }
  if (!claimBtn || claimBtn.disabled || claimBtn.classList.contains('is-locked')) {
    console.log('FAIL: Claim XP button still dimmed after all blocks filled');
    process.exit(1);
  }
  console.log('OK: ready-to-claim bar reached 100% and Claim button activated');

  const before = (JSON.parse(window.localStorage.getItem('zdash_state_v4')) || {}).xp;
  const st = JSON.parse(window.localStorage.getItem('zdash_state_v4'));
  click(claimBtn);

  const win = document.getElementById('dashOv');
  if (!win || !win.innerHTML.includes('XP claimed!')) {
    console.log('FAIL: claim win screen did not appear');
    process.exit(1);
  }
  const st2 = JSON.parse(window.localStorage.getItem('zdash_state_v4'));
  const after = st2.xp;
  const d = new Date();
  const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const claimed = st2.claimedDays[st2.day] === today;
  if (after !== before + 500 || !claimed) {
    console.log('FAIL: XP/claimed state not persisted (xp ' + before + ' -> ' + after + ')');
    process.exit(1);
  }
  console.log('OK: +500 XP claimed and persisted (XP ' + before + ' -> ' + after + ')');

  const btn = win.querySelector('#claimDone') || win.querySelector('#claimXp');
  click(btn);
  window.dispatchEvent(new window.Event('hashchange'));

  if (document.getElementById('dashOv')) {
    console.log('FAIL: overlay did not close after claim routed back to dashboard');
    process.exit(1);
  }
  const dashHtml = document.getElementById('page').innerHTML;
  if (!dashHtml.includes('blur-tag') || !dashHtml.includes('countdown')) {
    console.log('FAIL: claimed check-in card did not blur with 24h countdown');
    process.exit(1);
  }
  console.log('OK: routed back to dashboard with blurred check-in card + countdown');

  if (fatal) { console.log('FAIL: page error ' + fatal); process.exit(1); }
  console.log('All claim-flow checks passed.');
  process.exit(0);
})();