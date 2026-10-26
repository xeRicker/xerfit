import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PLAN_PATH = 'F:/Coding/GitHub/xerfit/database/plan.json';
const planSnapshot = readFileSync(PLAN_PATH, 'utf8');

const PORT = 9399;
const profile = mkdtempSync(join(tmpdir(), 'xerfit-save-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--disable-gpu', '--window-size=390,844', 'about:blank'
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function endpoint() {
    for (let i = 0; i < 60; i += 1) {
        try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return r.json(); } catch { await sleep(250); }
    }
    throw new Error('no endpoint');
}

const version = await endpoint();
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise(r => socket.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const logs = [];
socket.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
        const { resolve, reject } = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) reject(new Error(m.error.message)); else resolve(m.result);
        return;
    }
    if (m.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
});
function send(method, params = {}, sessionId) {
    id += 1;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    socket.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout ${method}`)); } }, 25000);
    });
}

await send('Target.setDiscoverTargets', { discover: true });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, userGesture: true }, sessionId);
    if (r.exceptionDetails) return { __error: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result.value;
};
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Network.enable', {}, sessionId);
await send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId);

let failures = 0;
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); if (!ok) failures += 1; };

const planBefore = JSON.parse(readFileSync('F:/Coding/GitHub/xerfit/database/plan.json', 'utf8'));

await send('Page.navigate', { url: 'http://localhost:8100/#/settings' }, sessionId);
await sleep(2000);

const initial = await evaluate(`(() => ({
  increment: document.querySelector('[data-default-field="increment"]')?.value,
  saveBars: document.querySelectorAll('[data-action="save-plan"]').length,
  valueFocused: document.activeElement?.dataset?.defaultField || null
}))()`);
check('settings shows the current weight step', initial.increment === '2,5', JSON.stringify(initial));
check('no save bar before changes', initial.saveBars === 0, JSON.stringify(initial));

await evaluate(`document.querySelector('[data-action="step"][data-field="increment"][data-step="0.5"]').click()`);
await sleep(200);
const afterOne = await evaluate(`(() => ({
  increment: document.querySelector('[data-default-field="increment"]')?.value,
  saveBars: document.querySelectorAll('[data-action="save-plan"]').length
}))()`);
check('one tap changes the step by exactly 0,5', afterOne.increment === '3', JSON.stringify(afterOne));
check('save bar appears once dirty', afterOne.saveBars === 1, JSON.stringify(afterOne));

await evaluate(`document.querySelector('[data-action="step"][data-field="increment"][data-step="0.5"]').click()`);
await sleep(200);
const afterTwo = await evaluate(`document.querySelector('[data-default-field="increment"]')?.value`);
check('second tap is another 0,5', afterTwo === '3,5', String(afterTwo));

await evaluate(`document.querySelector('[data-action="save-plan"]').click()`);
await sleep(900);
const afterSave = await evaluate(`(() => ({
  saveBars: document.querySelectorAll('[data-action="save-plan"]').length,
  increment: document.querySelector('[data-default-field="increment"]')?.value
}))()`);
check('save bar disappears after saving', afterSave.saveBars === 0, JSON.stringify(afterSave));
check('value is unchanged by saving', afterSave.increment === '3,5', JSON.stringify(afterSave));

const planAfter = JSON.parse(readFileSync('F:/Coding/GitHub/xerfit/database/plan.json', 'utf8'));
check('plan.json on disk got the new step', planAfter.defaults.increment === 3.5, `${planBefore.defaults.increment} -> ${planAfter.defaults.increment}`);

await evaluate(`location.reload()`);
await sleep(2200);
const afterReload = await evaluate(`document.querySelector('[data-default-field="increment"]')?.value`);
check('value survives a page reload', afterReload === '3,5', String(afterReload));

await evaluate(`document.querySelector('[data-action="step"][data-field="increment"][data-step="-0.5"]').click()`);
await sleep(200);
await evaluate(`document.querySelector('[data-action="discard-plan"]').click()`);
await sleep(400);
const afterDiscard = await evaluate(`(() => ({
  increment: document.querySelector('[data-default-field="increment"]')?.value,
  toasts: document.querySelectorAll('.toast').length,
  saveBars: document.querySelectorAll('[data-action="save-plan"]').length
}))()`);
check('discard restores the saved value', afterDiscard.increment === '3,5', JSON.stringify(afterDiscard));
check('discard shows exactly one toast', afterDiscard.toasts === 1, JSON.stringify(afterDiscard));
check('discard hides the save bar', afterDiscard.saveBars === 0, JSON.stringify(afterDiscard));

// restore the original file no matter how the run ended
writeFileSync(PLAN_PATH, planSnapshot, 'utf8');
const restored = JSON.parse(readFileSync(PLAN_PATH, 'utf8'));
check('plan.json left as found', restored.defaults.increment === planBefore.defaults.increment, String(restored.defaults.increment));

console.log('\n--- click affordances ---');
await send('Page.navigate', { url: 'http://localhost:8100/#/exercises' }, sessionId);
await sleep(1600);
const affordance = await evaluate(`(() => {
  const rows = [...document.querySelectorAll('[data-action="open-exercise"]')];
  const withChevron = rows.filter(r => r.querySelector('.exercise-row__chevron')).length;
  const tooSmall = rows.filter(r => r.getBoundingClientRect().height < 48).length;
  return { rows: rows.length, withChevron, tooSmall, navFs: getComputedStyle(document.querySelector('.app-nav__item span:last-child')).fontSize };
})()`);
check('every catalog row shows a chevron', affordance.rows > 0 && affordance.withChevron === affordance.rows, JSON.stringify(affordance));
check('every catalog row is a full tap target', affordance.tooSmall === 0, JSON.stringify(affordance));

await send('Page.navigate', { url: 'http://localhost:8100/#/history' }, sessionId);
await sleep(1600);
await evaluate(`document.querySelector('[data-action="history-tab"][data-tab="exercises"]').click()`);
await sleep(400);
const historyRows = await evaluate(`(() => {
  const rows = [...document.querySelectorAll('[data-action="open-exercise"]')];
  return { rows: rows.length, withChevron: rows.filter(r => r.querySelector('.exercise-row__chevron')).length };
})()`);
check('history exercise rows show a chevron too', historyRows.rows > 0 && historyRows.withChevron === historyRows.rows, JSON.stringify(historyRows));

for (const { name, ok, detail } of results) {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : ` → ${detail}`}`);
}
if (logs.length) console.log('\npage exceptions:\n' + logs.join('\n'));
console.log(failures ? `\n${failures} save check(s) failed` : '\nall save checks passed');

socket.close();
chrome.kill();
await sleep(200);
process.exit(failures ? 1 : 0);
