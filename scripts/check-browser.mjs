import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:8100';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = Number(process.env.CDP_PORT) || 9333;
const DEVICE_WIDTH = 390;
const DEVICE_HEIGHT = 844;
const DATA_FILES = ['exercises.json', 'plan.json', 'workouts.json'];

const snapshot = new Map(DATA_FILES.map(name => [name, readFileSync(new URL(`../database/${name}`, import.meta.url), 'utf8')]));

function restoreDataFiles() {
    for (const [name, text] of snapshot) {
        writeFileSync(new URL(`../database/${name}`, import.meta.url), text, 'utf8');
    }
}

let failures = 0;
const results = [];

function check(name, condition, detail = '') {
    results.push({ name, ok: Boolean(condition), detail });
    if (!condition) failures += 1;
}

const profile = mkdtempSync(join(tmpdir(), 'xerfit-cdp-'));

const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${DEVICE_WIDTH},${DEVICE_HEIGHT}`,
    'about:blank'
], { stdio: 'ignore' });

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForEndpoint() {
    for (let attempt = 0; attempt < 60; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
            if (response.ok) return await response.json();
        } catch {
            await sleep(250);
        }
    }
    throw new Error('Chrome DevTools endpoint did not start');
}

const version = await waitForEndpoint();
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
});

let messageId = 0;
const pending = new Map();
const pageSessions = new Map();
let activeSessionId = null;

socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.message} (${JSON.stringify(message.error.data ?? '')})`));
        else resolve(message.result);
        return;
    }

    if (message.method === 'Target.attachedToTarget') {
        pageSessions.set(message.params.sessionId, true);
    }
});

function send(method, params = {}, sessionId = null) {
    messageId += 1;
    const id = messageId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    socket.send(JSON.stringify(payload));

    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        setTimeout(() => {
            if (pending.has(id)) {
                pending.delete(id);
                reject(new Error(`CDP timeout: ${method}`));
            }
        }, 30000);
    });
}

await send('Target.setDiscoverTargets', { discover: true });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
activeSessionId = sessionId;

async function evaluate(expression, awaitPromise = false) {
    const result = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise,
        userGesture: true
    }, activeSessionId);

    if (result.exceptionDetails) {
        throw new Error(`evaluate failed: ${result.exceptionDetails.exception?.description || result.exceptionDetails.text}`);
    }
    return result.result.value;
}

async function navigate(path) {
    await send('Page.navigate', { url: `${BASE}${path}` }, activeSessionId);
    for (let attempt = 0; attempt < 80; attempt += 1) {
        await sleep(150);
        const ready = await evaluate('document.readyState === "complete" && !document.querySelector(".app-loader")');
        if (ready) break;
    }
    await sleep(250);
}

await send('Page.enable', {}, activeSessionId);
await send('Runtime.enable', {}, activeSessionId);
await send('Network.enable', {}, activeSessionId);
await send('Network.setCacheDisabled', { cacheDisabled: true }, activeSessionId);
await send('Emulation.setDeviceMetricsOverride', {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    deviceScaleFactor: 2,
    mobile: true
}, activeSessionId);

const metricsExpression = `(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    navLabels: [...document.querySelectorAll('.app-nav__item')].map(el => {
        const label = el.querySelector('span:last-child');
        const style = getComputedStyle(label);
        return {
            text: label.textContent,
            width: Math.round(label.getBoundingClientRect().width),
            height: Math.round(label.getBoundingClientRect().height),
            lineHeight: parseFloat(style.lineHeight),
            scrollWidth: label.scrollWidth
        };
    }),
    actionBar: (() => {
        const bar = document.querySelector('.action-bar');
        if (!bar) return null;
        const style = getComputedStyle(bar);
        return { position: style.position, childButtons: bar.querySelectorAll('.btn').length };
    })(),
    hiddenOverflow: [...document.querySelectorAll('.app-shell *, .app-nav *')]
        .filter(el => el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && getComputedStyle(el).overflowX === 'visible')
        .map(el => el.className + ' ' + el.scrollWidth + '>' + el.clientWidth)
        .slice(0, 8),
    savePlanButtons: document.querySelectorAll('[data-action="save-plan"]').length,
    containerPills: [...document.querySelectorAll('.container-tabs .chip')].map(c => c.textContent.trim()),
    headerMeta: document.querySelector('.header-meta')?.textContent || ''
}))()`;

const clickExpression = selector => `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return { clicked: false };
    el.click();
    return { clicked: true, text: el.textContent.trim().slice(0, 40) };
})()`;

const readExpression = `(() => ({
    weight: document.querySelector('[data-input="weight"]')?.value ?? null,
    reps: document.querySelector('[data-input="reps"]')?.value ?? null,
    chips: [...document.querySelectorAll('.set-chip__value')].map(el => el.textContent.trim()),
    position: document.querySelector('.workout-topbar__position')?.textContent || '',
    exercise: document.querySelector('.exercise-stage__name')?.textContent || '',
    notices: document.querySelectorAll('.toast').length,
    buttons: document.querySelectorAll('[data-action]').length
}))()`;

try {
    await navigate('/');
    await evaluate('localStorage.clear()');
    await navigate('/');

    const planMetrics = await evaluate(metricsExpression);
    check('no horizontal scroll on plan', planMetrics.scrollWidth <= planMetrics.viewport, `scrollWidth=${planMetrics.scrollWidth} viewport=${planMetrics.viewport}`);
    check('no overflowing elements on plan', planMetrics.hiddenOverflow.length === 0, planMetrics.hiddenOverflow.join(' | '));
    check('nav labels stay on one line', planMetrics.navLabels.every(l => l.height <= l.lineHeight * 1.6), JSON.stringify(planMetrics.navLabels));
    check('settings nav label fits', planMetrics.navLabels.some(l => l.text === 'Ustawienia' && l.scrollWidth <= l.width + 1), JSON.stringify(planMetrics.navLabels));
    check('Ustawienia is not truncated', await evaluate(`(() => { const el = [...document.querySelectorAll('.app-nav__item span:last-child')].find(s => s.textContent === 'Ustawienia'); return el ? el.scrollWidth <= el.clientWidth + 1 : false; })()`));
    check('empty plan hides save button', planMetrics.savePlanButtons === 0, `found ${planMetrics.savePlanButtons}`);
    check('container name hidden from header meta', !planMetrics.headerMeta.includes('Październik'), planMetrics.headerMeta);
    check('single container pill for one container', planMetrics.containerPills.filter(p => p === 'Październik').length === 1, JSON.stringify(planMetrics.containerPills));
    const planHtml = await evaluate(`document.getElementById('view').innerHTML`);
    check('plan lists all three seeded splits', ['Upper', 'Lower', 'Express'].every(name => planHtml.includes(`>${name}<`)), planHtml.replace(/\s+/g, ' ').slice(0, 400));
    check('split cards preview seeded exercises', planHtml.includes('Upper Chest Press') && planHtml.includes('Suwnica'), planHtml.slice(0, 200));

    const copyResult = await evaluate(`(() => {
        const before = [...document.querySelectorAll('.container-tabs .chip')].map(c => c.textContent.trim());
        document.querySelector('[data-action="copy-container"]').click();
        return before;
    })()`);
    await sleep(200);
    const afterCopy = await evaluate(`(() => ({
        pills: [...document.querySelectorAll('.container-tabs .chip')].map(c => c.textContent.trim()),
        notices: document.querySelectorAll('.toast').length
    }))()`);
    check('copy shows exactly one toast', afterCopy.notices === 1, `toasts=${afterCopy.notices}`);
    check('copy does not chain KOPIA names', !afterCopy.pills.some(p => /kopia.*kopia/i.test(p)), JSON.stringify(afterCopy.pills));
    check('copy created exactly one container', afterCopy.pills.length === copyResult.length + 1, `${JSON.stringify(copyResult)} -> ${JSON.stringify(afterCopy.pills)}`);

    await navigate('/');
    await evaluate('localStorage.clear()');
    await navigate('/');

    const startResult = await evaluate(clickExpression('[data-action="start-split"]'));
    await sleep(300);
    check('start button found and clicked', startResult.clicked === true);
    const workoutState = await evaluate(readExpression);
    check('workout view is live after start', workoutState.exercise.length > 0 && workoutState.position.length > 0, JSON.stringify(workoutState));
    check('workout nav hidden', await evaluate(`document.getElementById('app-nav').hidden === true`));

    const beforePlus = await evaluate(readExpression);
    check('workout prefills the last logged weight', beforePlus.weight === '110', String(beforePlus.weight));
    check('workout names the exercise from the seed', workoutState.exercise.includes('Upper Chest Press'), workoutState.exercise);
    check('workout position matches the seeded split', workoutState.position === '1/8', workoutState.position);
    await evaluate(clickExpression('[data-action="adjust"][data-field="weight"][data-delta="1"]'));
    await sleep(120);
    const afterPlus = await evaluate(readExpression);
    check('weight + changes the input', afterPlus.weight !== beforePlus.weight, `${beforePlus.weight} -> ${afterPlus.weight}`);
    check('weight + uses the per-exercise increment', afterPlus.weight === '112,5', String(afterPlus.weight));

    const assisted = await evaluate(`(() => {
        const next = document.querySelector('[data-action="confirm-set"]');
        return Boolean(next);
    })()`);
    check('workout offers the confirm action', assisted === true);

    await evaluate(clickExpression('[data-action="adjust"][data-field="reps"][data-delta="1"]'));
    await sleep(120);
    const afterReps = await evaluate(readExpression);
    check('reps + changes the input', Number(afterReps.reps) === Number(afterPlus.reps) + 1, `${afterPlus.reps} -> ${afterReps.reps}`);

    await evaluate(clickExpression('[data-action="add-set"]'));
    await sleep(150);
    const afterAdd = await evaluate(readExpression);
    check('add set appends a chip', afterAdd.chips.length === 2, JSON.stringify(afterAdd.chips));
    check('added chip copies weight', afterAdd.chips[1] === afterAdd.chips[0], JSON.stringify(afterAdd.chips));

    await evaluate(clickExpression('[data-action="remove-set"]'));
    await sleep(150);
    const afterRemove = await evaluate(readExpression);
    check('remove set leaves one chip', afterRemove.chips.length === 1, JSON.stringify(afterRemove.chips));

    const beforeArrows = await evaluate(`document.querySelector('.workout-topbar__position').textContent`);
    for (let step = 0; step < 3; step += 1) {
        await evaluate(clickExpression('[data-action="step-next"]'));
        await sleep(120);
    }
    const pullups = await evaluate(`(() => ({
        exercise: document.querySelector('.exercise-stage__name')?.textContent || '',
        weight: document.querySelector('[data-input="weight"]')?.value ?? null,
        hint: document.querySelector('.logger__hint')?.textContent || '',
        hintClass: document.querySelector('.logger__hint')?.className || '',
        position: document.querySelector('.workout-topbar__position')?.textContent || ''
    }))()`);
    check('arrow navigation moves between exercises', pullups.position === '4/8', `${beforeArrows} -> ${pullups.position}`);
    check('arrow navigation reaches the assisted exercise', pullups.exercise === 'Pullups', pullups.exercise);
    check('assisted weight keeps its minus sign', pullups.weight === '-15', String(pullups.weight));
    check('assisted set shows the assist hint', pullups.hint.includes('Asysta 15 kg'), pullups.hint);
    check('assist hint is highlighted', pullups.hintClass.includes('logger__hint--assist'), pullups.hintClass);

    await evaluate(clickExpression('[data-action="step-prev"]'));
    await sleep(150);
    check('previous arrow goes back', (await evaluate(`document.querySelector('.exercise-stage__name').textContent`)) === 'Butterfly');

    await evaluate(`(() => { const w = document.querySelector('[data-input="weight"]'); w.value = '80'; w.dispatchEvent(new Event('input', { bubbles: true })); const r = document.querySelector('[data-input="reps"]'); r.value = '8'; r.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await evaluate(clickExpression('[data-action="confirm-set"]'));
    await sleep(300);
    const afterConfirm = await evaluate(readExpression);
    check('confirm saves the set and advances', afterConfirm.position === '4/8', JSON.stringify(afterConfirm));

    await evaluate(clickExpression('[data-action="skip"]'));
    await sleep(200);
    const afterSkip = await evaluate(`document.querySelector('[data-action="skip"]').textContent.includes('Przywróć')`);
    check('skip toggles the label', afterSkip === true);

    await evaluate(clickExpression('[data-action="finish"]'));
    await sleep(300);
    const dialogText = await evaluate(`document.querySelector('.feedback-card__title')?.textContent || ''`);
    if (dialogText) {
        await evaluate(clickExpression('.feedback-card__actions .btn--primary'));
        await sleep(300);
    }
    const summaryVisible = await evaluate(`document.querySelector('.summary-hero__title')?.textContent || ''`);
    check('finish reaches the summary', summaryVisible.includes('Dobra robota'), summaryVisible);

    for (const path of ['/#/exercises', '/#/history', '/#/history/exercises', '/#/settings']) {
        await navigate(path);
        const m = await evaluate(metricsExpression);
        check(`no horizontal scroll on ${path}`, m.scrollWidth <= m.viewport, `scrollWidth=${m.scrollWidth}`);
        check(`no overflowing elements on ${path}`, m.hiddenOverflow.length === 0, m.hiddenOverflow.join(' | '));
    }

    await navigate('/#/exercises');
    const exercisesState = await evaluate(`(() => ({
        hasGroupLabels: document.body.innerHTML.includes('Klatka') || document.body.innerHTML.includes('Partia'),
        rows: document.querySelectorAll('[data-action="open-exercise"]').length,
        dashes: (document.body.innerHTML.match(/—/g) || []).length
    }))()`);
    check('catalog no longer shows groups', exercisesState.hasGroupLabels === false, JSON.stringify(exercisesState));
    check('catalog lists the seeded exercises', exercisesState.rows === 22, JSON.stringify(exercisesState));

    await navigate('/#/settings');
    const settingsState = await evaluate(`(() => ({
        repMin: document.querySelector('[data-default-field="repMin"]')?.value,
        repMax: document.querySelector('[data-default-field="repMax"]')?.value,
        increment: document.querySelector('[data-default-field="increment"]')?.value,
        hasGitHubSection: document.body.innerHTML.includes('Zapis do GitHuba'),
        saveButtons: document.querySelectorAll('[data-action="save-plan"]').length,
        actionBarPosition: (() => { const bar = document.querySelector('.action-bar'); return bar ? getComputedStyle(bar).position : null; })()
    }))()`);
    check('settings shows sane rep min', settingsState.repMin === '6', String(settingsState.repMin));
    check('settings shows sane rep max', settingsState.repMax === '10', String(settingsState.repMax));
    check('settings shows sane increment', settingsState.increment === '2,5', String(settingsState.increment));
    check('github info section removed', settingsState.hasGitHubSection === false);
    check('settings hides save bar when clean', settingsState.saveButtons === 0, `found ${settingsState.saveButtons}`);

    const stepResult = await evaluate(`(() => {
        const before = document.querySelector('[data-default-field="repMin"]').value;
        document.querySelector('[data-action="step"][data-field="repMin"][data-step="1"]').click();
        return before;
    })()`);
    await sleep(150);
    const afterStep = await evaluate(`(() => ({
        repMin: document.querySelector('[data-default-field="repMin"]')?.value,
        saveButtons: document.querySelectorAll('[data-action="save-plan"]').length,
        actionBarPosition: (() => { const bar = document.querySelector('.action-bar'); return bar ? getComputedStyle(bar).position : null; })()
    }))()`);
    check('rep min + steps by exactly one', Number(afterStep.repMin) === Number(stepResult) + 1, `${stepResult} -> ${afterStep.repMin}`);
    check('settings shows save bar when dirty', afterStep.saveButtons === 1, JSON.stringify(afterStep));
    check('save bar floats when dirty', afterStep.actionBarPosition === 'fixed', String(afterStep.actionBarPosition));

    await navigate('/#/settings');
    const bottomCheck = await evaluate(`(() => {
        const dataCard = [...document.querySelectorAll('.card')].pop();
        const nav = document.getElementById('app-nav');
        const navTop = nav.getBoundingClientRect().top;
        const lastRow = dataCard.querySelector('.list__item:last-child')?.getBoundingClientRect();
        return { navTop: Math.round(navTop), lastRowBottom: lastRow ? Math.round(lastRow.bottom) : null, shellPaddingBottom: getComputedStyle(document.querySelector('.app-shell')).paddingBottom };
    })()`);
    check('last settings row is not hidden behind the nav', bottomCheck.lastRowBottom !== null && bottomCheck.lastRowBottom <= bottomCheck.navTop, JSON.stringify(bottomCheck));
    check('shell reserves space for the nav', parseFloat(bottomCheck.shellPaddingBottom) >= 64, String(bottomCheck.shellPaddingBottom));
} finally {
    for (const { name, ok, detail } of results) {
        console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : ` → ${detail}`}`);
    }
    console.log(failures ? `\n${failures} browser check(s) failed` : '\nall browser checks passed');

    socket.close();
    chrome.kill();
    await sleep(300);
    restoreDataFiles();
    console.log('(database files restored)');
    try {
        rmSync(profile, { recursive: true, force: true });
    } catch {
        console.log('(could not remove the temporary Chrome profile)');
    }
    process.exit(failures ? 1 : 0);
}
