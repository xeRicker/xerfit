# AGENTS.md

Mobile-first tracker progresu w treningu siłowym: katalog ćwiczeń, zakładki (kontenery) ze splitami, tryb treningu, sugestie progresji, historia. Static site: ES modules, no bundler, no build step. UI copy is Polish, code identifiers English. Visual rules live in `DESIGN.md`.

## Commands
- `node dev-server.js` — serves the site on http://localhost:8100 and handles local JSON `PUT` under `database/`. Without it the site opens but local saves fail; check its terminal for save errors.
- `npm run check` — Node sanity checks for pure logic, view rendering and the workout flow (`scripts/check-*.mjs`). These stub `window`/`document`/`localStorage`/`fetch` and load the real modules, so they catch crashes and wrong output, but they never exercise real event handling.
- `npm run check:browser` — drives headless Chrome over the DevTools Protocol (needs `node dev-server.js` running): real clicks, real layout measurements at 390×844, and it restores `database/*.json` afterwards. Use it for anything involving clicks, state and repaints; `npm run check` alone will not catch those bugs.
- After any CSS change, check a mobile viewport (390px). Nothing may scroll horizontally.
- `node scripts/seed-workouts.mjs` — regenerates `database/workouts.json` from the set lists inside the script. It exists so a factory-reset database can be restored; do not run it over real training history.

## Never
- Native `alert/confirm/prompt` or native `select` — use `dialogService` / `sheetService` / `notify` from `js/ui/components/dialogs.js`.
- Raw hex/rgb outside `css/theme/palette.css`; derive with `color-mix()` from an existing variable.
- A new dependency, wrapper or abstraction when something in `js/services/` or `js/ui/` already covers it. Charts are hand-written SVG in `js/ui/charts.js`.
- Code comments of any kind.
- Empty or log-only `catch`. Every catch shows a notice/dialog or rethrows. A failed fetch/write never resolves to a silent default.
- Hardcoding, logging or printing the GitHub token. `config.js` ships the literal `__GH_TOKEN__`; only the deploy workflow replaces it, `js/services/token.js` may hold a browser-local override.
- Losing a finished workout when the GitHub write fails: keep the record and show the retry action.
- A guard that skips repainting when the route has not changed, or calling `bind()` again on a re-render. Both silently break in-place actions — see the failure log.

## Ask first
- Changing the JSON data shape (touches `api.js`, `planService.js`, `workoutService.js`, `workoutAnalysis.js` and every view together).
- Deleting or rewriting records inside `database/`.
- Any request that could reasonably mean two different meanings.

## Data model gotchas
- Three files. `database/exercises.json` is the global exercise catalog: `{ version, exercises: { ex_id: { name, group } } }`. `database/plan.json` is `{ version, defaults, containers }` — containers („zakładki”, e.g. Grudzień) hold splits, splits hold ordered `{ exerciseId, repMin, repMax, increment }` items. `database/workouts.json` is `{ version, workouts: [...] }`, one record per finished session, sorted by `date`.
- Exercises are global and referenced by id everywhere. Progress, plateau and PR are computed per `exerciseId`, so the same exercise in two splits and two containers shares one history line. Never store progression on the exercise itself.
- A container is the editable unit: `copyContainer` clones it with fresh container and split ids but the same `exerciseId` references, so editing a copy never touches the original. Per-split target overrides live in the split item, not in the catalog.
- There is no set count in the plan. Every exercise value in a session starts as exactly one set (`workoutService.createSession`), and „Dodaj serię” appends another one copying the previous values.
- Per-split overrides are `null` in `plan.json` and resolved against `defaults` by `planService.listSplitExercises`. Views must never read raw `repMin` off a split item.
- Workout records denormalise `containerId`/`containerName` and `splitId`/`splitName` and each entry's `name`, `group`, `repMin`, `repMax`, `increment`, so old history stays readable after the plan changes. Empty `containerName` means a record from before containers existed.
- `date` is ISO `yyyy-mm-dd` in the data; `dd.mm.yyyy` (via `formatDate`) is display only.
- Derived values are never stored: volume, estimated 1RM (`weight * (1 + reps/30)`), progression suggestion, plateau and PR all come from `services/workoutAnalysis.js`.
- Plateau = no improvement in estimated 1RM across the last `WORKOUT_CONFIG.PLATEAU_LENGTH` (3) sessions. A suggestion is computed from the last completed session of that exercise, and the workout screen prefills the last logged weight/reps.
- Deleting an exercise drops it from every split but leaves history records alone — existing sessions keep their denormalised name.
- Plan edits live only in `app.draft` until „Zapisz plan” runs `planService.save`; catalog edits live in `app.draftExercises` until „Zapisz”. `isPlanDirty()` / `isExercisesDirty()` compare drafts with loaded data by serialised value.
- Active session is stored under `localStorage: xerfit_session` and survives refresh; a finished workout that failed to save is kept under `xerfit_pending_save` and offered again on the next launch.
- Writes read the target file's SHA immediately before the `PUT`, so two consecutive writes cannot collide on a stale SHA.

## Environments
- Prod is GitHub Pages: static, no `PUT`. `exercises.json` / `plan.json` / `workouts.json` writes go through `services/api.js` via the GitHub API, so there is no deploy step for data. Code ships by pushing to the Pages branch.
- Reads prefer the GitHub API when a token exists, and fall back to the static `./database/*.json` when it does not (localhost and tokenless builds).
- On localhost writes go to the dev server instead of GitHub, so `dev-server.js` must be running.
- The site must stay unindexed (`robots.txt` disallow, `noindex` in `index.html`).

## Routes
Hash routing in `js/main.js`: `#/plan`, `#/exercises` (with optional `#/exercises/<exerciseId>`), `#/workout`, `#/summary`, `#/history` (with optional `#/history/<exerciseId>`), `#/settings`. The Historia tab (Treningi / Ćwiczenia) is view state in `app.historyUI.tab`, not a route. `render()` always repaints the current route; `hashchange` is the only caller that needs no repaint logic, and it repaints too. The listener for each route is attached exactly once (see `boundRoutes`), and views keep no state in closures, so re-rendering is safe. `#/workout` hides the bottom nav and falls back to `#/plan` without a live session.

## Render path
- Views read current state, never the last saved snapshot: `app.draft` (plan) and `app.draftExercises` (catalog). Reading `app.plan` / `app.exercises` in a view makes in-memory edits invisible and greys out nothing — the bug always looks like "the button does nothing".
- `app.markPlanDirty()` / `app.markExercisesDirty()` repaint; the dirty flag is derived, so save bars appear and disappear on their own.
- Floating save bars (`.action-bar`) are `position: fixed` above the bottom nav and render only when there is something to save; the workout's own thumb bar is `.workout-actions`.

## Conventions
- Tokens only: colors from `css/theme/palette.css`, fonts via `--font-heading` / `--font-body`. A new palette role is added to `palette.css` and `DESIGN.md` in the same change.
- One CSS file per view (`plan.css`, `workout.css`, `history.css`, `settings.css`), all imported from `style.css`. The Ćwiczenia view reuses `plan.css` list styles.
- Views are factories: `createXView(app)` returns `{ render(), bind(root) }`. Views own markup and event handling; all persistence and maths live in `js/services/`.
- Icons via `renderMaterialIcon()` with real Material Symbols ligature names; a bad name renders as overlapping text.
- Every interactive control is at least 48px tall; primary actions are 60px.
- Booleans read as assertions: `isPlanDirty`, `isReady`, `hasToken`. Naming: one word per concept (`session` is the live workout, `workout` is a stored record).
- Size: files ~400 lines, functions ~50, nesting ~3 levels. Split along an existing seam and flatten with guard clauses.

## Working style
- Before writing code: reuse an existing util/pattern → native feature → shortest correct one-liner. Grep real usage; don't trust memory of file layout.
- A bug report names one symptom — grep every caller and fix the shared function once.
- No unrequested features, options, copy or UI. Match existing patterns over parallel ones.
- Reversible ambiguity: state the assumption in one line and proceed; list assumptions at the top of the summary.
- Terse summaries: which files changed and why, one or two lines.
- Update this file only when a change makes a statement here false.

## Failure log
Add one imperative line, specific to this repo, whenever you are corrected on something.
- Never skip the repaint when a route is unchanged: every in-place action (workout +/-, steppers, copying a container) mutates state and then re-renders, and a "same route" guard made all of them look dead.
- Never attach a view's event listeners on every render: the handlers accumulated, so one tap on „Dodaj serię” added nine sets and one tap on „+” jumped two steps. Bind each route once (`boundRoutes` in `main.js`).
- Never read `app.plan` / `app.exercises` in a view: they are the last saved snapshot, so in-memory edits (new container, copied zakładka) never appeared. Views read `app.draft` / `app.draftExercises`.
- Verify click behaviour in `npm run check:browser`, not `npm run check`: the Node stubs never dispatch events, so a fully broken button passes every Node check.
- Kill any stale `node dev-server.js` before trusting a browser run — an old server on port 8100 keeps serving the previous revision and makes fixed bugs look unfixed.
