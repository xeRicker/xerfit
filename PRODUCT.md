# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One user: the author, a recreational lifter running a self-made upper/lower-style plan. He uses it standing at the gym, holding the phone in one hand between sets, and again in short bursts at home when he edits the plan or looks back at progress. There is no second audience: no accounts, no sharing, no other people's data in the app.

## Product Purpose

XERFIT records what was lifted and turns that into the next decision. It stores the training plan (containers of splits, each split an ordered list of exercises with a rep range and a weight step), records finished sessions, and from the last completed session of an exercise tells the user the exact weight and reps to attempt next — plus whether the lift is actually moving, plateauing, or setting a PR. Success means the user never has to guess the next weight and never loses a finished workout.

## Positioning

The progression decision is computed, not remembered. The app derives the next weight and rep target from the user's own last completed session, plateaus and PRs from estimated 1RM across history, and puts the relative-strength comparison next to the log as a reference band — while the data itself stays in the user's own GitHub repository, with no backend, no account, and no server-side copy of his training history. A generic tracker cannot copy this: it either owns the user's data or leaves the progression decision to the user.

## Operating Context

- Live at GitHub Pages (`main`), installable-as-bookmark only; no PWA, no offline shell, no push.
- Data lives in four JSON files in the same repo: `database/exercises.json` (global catalog), `database/plan.json` (containers → splits → ordered items), `database/workouts.json` (one record per finished session, sorted by date), `database/strength-standards.json` (relative-strength bands and exercise-name matcher).
- Writes go through the GitHub API with a token injected at deploy time by `.github/workflows/deploy.yml`; reads fall back to the static `./database/*.json` when no token exists. On localhost a dev server (`node dev-server.js`) receives the `PUT`s instead.
- Local development: `node dev-server.js` on port 8100; checks via `npm run check`, `npm run check:browser`, `npm run check:save` (the browser suites need a fresh dev server).
- Body profile (sex, age, height, weight, body fat) is personal data kept in `localStorage: xerfit_profile` on one device, never pushed to the repo. Plan and catalog edits stay in memory (`app.draft`, `app.draftExercises`) until the user saves.
- The live session also survives on the device (`xerfit_session`), and a finished workout that failed to upload is kept under `xerfit_pending_save` and offered again on the next launch.

## Capabilities and Constraints

Confirmed working surface:

- Routes `#/plan`, `#/exercises` (`#/exercises/<exerciseId>`), `#/workout`, `#/summary`, `#/history` (`#/history/<exerciseId>`), `#/settings`; the route param is the single source of truth for the open detail.
- Editing the plan: containers („zakładki”, e.g. Październik) hold splits, splits hold ordered exercises with per-item rep-range and increment overrides (`null` means "use the defaults"), and a container can be cloned with fresh ids so the copy never touches the original.
- Running a workout: every exercise starts with exactly one set; „Dodaj serię" appends another copying the previous one; the last logged weight/reps are prefilled; a session can be minimized and resumed, never ended implicitly by navigation.
- Analysis (all derived, never stored): estimated 1RM `weight * (1 + reps/30)`, progression suggestion, plateau (no 1RM improvement across the last 3 sessions), PR, per-exercise history and charts (hand-written SVG). Total volume was deliberately removed and must not come back as a headline stat.
- History is per `exerciseId`: the same exercise in two splits and two containers shares one history line. Workout records denormalise names, groups, rep ranges and container/split names so old sessions stay readable after the plan changes.
- Relative strength: estimated 1RM ÷ body weight, matched to a lift key by substring on the exercise name, shown as a ratio with the band and the next threshold. A deliberately approximate reference, not a certification, and never reduced to an invented percentage score.
- Notes on the current defaults: rep range 6–10, increment 2.5 kg, bar weight 20 kg, plateau length 3, 12 chart points.

Constraints that must hold:

- No dependency, wrapper or abstraction when `js/services/` or `js/ui/` already covers it; charts stay hand-written SVG; no build step, no bundler, plain ES modules.
- The site stays unindexed (`robots.txt` disallow, `noindex` in `index.html`) and keeps working with no token and no dev server for reads.
- The GitHub token is injected by the deploy workflow only. `config.js` ships the literal `__GH_TOKEN__`; there is never a browser-side token entry and the token is never logged or printed.
- A finished workout is never lost to a failed upload; a failed write always surfaces, with a retry.
- No native `alert`/`confirm`/`prompt` or native `select`; no raw hex/rgb outside `css/theme/palette.css`; no code comments.
- Every interactive control is at least 48px tall, primary actions 60px; nothing may scroll horizontally at 390px.
- Undecided: whether the storage split ever gets a fifth file, and whether strength bands should ever be editable from the UI (today they are edited directly in the repo).

## Brand Commitments

- Name: XERFIT (repo and Pages URL under the `xeRicker` account).
- Language: Polish only, `lang="pl"`, informal second person singular („Twoje dane", „Zostajesz na ciężarze"), terse and factual — no hype, no gamified encouragement.
- Domain vocabulary is fixed and lives in the data: kontener/„zakładka", split, ćwiczenie, katalog, seria, powtórzenia (powt.), skok ciężaru, trening (stored record) vs. sesja (live workout).

## Evidence on Hand

- Real training history: `database/workouts.json` with 3 sessions (2026-10-13 Express, 2026-10-14 Lower, 2026-10-15 Upper) — real numbers, useful as fixture and screenshot content.
- A real plan in `database/plan.json` (containers → splits → ordered items) and the current exercise catalog in `database/exercises.json`.
- Reference bands with real thresholds in `database/strength-standards.json` plus a tested name-matcher.
- `AGENTS.md` is the project's own operating memory: commands, hard rules, data-model gotchas and a failure log.
- Absences — do not fabricate: no customer, testimonial, benchmark, press, pricing, user count or analytics of any kind; no brand assets beyond the name and `favicon.svg`; the single user's body profile and login token are deliberately not in this repo.

## Product Principles

1. Decide the next weight, don't just store the last one: every session ends with the app telling the user what to attempt next, derived from their own numbers.
2. The user's data is the user's: it lives in his repo and on his device, never behind an account or a server that could disappear.
3. Never lose a finished workout: a failed upload is a visible, retryable error, never a silent default.
4. Derived, not stored: volume, 1RM, progression, plateau and PR are computed from history, so the plan can change without corrupting the past.
5. Honest numbers over flattering ones: ratios and reference bands are shown as approximations with their thresholds, never dressed up as a score.

## Accessibility & Inclusion

One-handed use while standing at a machine, in a dark gym, mid-session: large touch targets, no hover-only affordances, no horizontal scrolling down to 320px, and a live session that survives a mistap, a refresh or a phone lock without losing entered sets.
