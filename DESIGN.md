---
name: XERFIT
description: Instrument-panel training log — volt readouts on near-black, condensed italic caps, tonal depth.
colors:
  volt: "#C6FF00"
  volt-hover: "#D6FF3D"
  volt-pressed: "#A8DC00"
  volt-subtle: "#26310A"
  volt-dimmer: "#1A2207"
  instrument-black: "#070806"
  panel: "#141613"
  panel-raised: "#1C1F1A"
  panel-overlay: "#242821"
  chalk: "#F4F7EF"
  chalk-dim: "#B4BCA9"
  chalk-muted: "#838B79"
  ink: "#0C1000"
  hairline: "rgba(238, 255, 220, 0.10)"
  hairline-strong: "rgba(238, 255, 220, 0.20)"
  success: "#9BE564"
  success-dim: "#1B2A12"
  danger: "#FF7A6B"
  danger-dim: "#331714"
  warning: "#FFC94D"
  warning-dim: "#302408"
  info: "#7BC6FF"
  info-dim: "#122534"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, Barlow, sans-serif"
    fontSize: "46px"
    fontWeight: 800
    lineHeight: 0.95
    fontFeature: "tnum"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, Barlow, sans-serif"
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  heading:
    fontFamily: "Barlow Condensed, Arial Narrow, Barlow, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
  body:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.35
  caption:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  tap-target: "48px"
  tap-target-large: "60px"
components:
  button-primary:
    backgroundColor: "{colors.volt}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap-target}"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.volt-hover}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  button-primary-pressed:
    backgroundColor: "{colors.volt-pressed}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  button-primary-large:
    backgroundColor: "{colors.volt}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap-target-large}"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap-target}"
    padding: "0 16px"
  button-ghost:
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap-target}"
    padding: "0 16px"
  button-selected:
    backgroundColor: "{colors.volt-subtle}"
    textColor: "{colors.volt}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap-target}"
    padding: "0 16px"
  icon-button:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.sm}"
    size: "{spacing.tap-target}"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  stat-tile:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  input-text:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap-target}"
    padding: "0 12px"
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 12px"
  chip-selected:
    backgroundColor: "{colors.volt-dimmer}"
    textColor: "{colors.volt}"
    rounded: "{rounded.pill}"
    height: "36px"
  badge:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.pill}"
    padding: "3px 8px"
  toast:
    backgroundColor: "{colors.panel-overlay}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  action-bar:
    backgroundColor: "{colors.panel-overlay}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
---

# Design System: XERFIT

## Overview

**Creative North Star: "The Instrument Panel"**

XERFIT looks like a readout, not a coach. The world is a near-black housing with a faint green cast, hairline seams between panels, and exactly one volt-lit number per screen — the weight to load next. Type is stamped rather than written: Barlow Condensed, italic, uppercase for every heading and every figure, so the screen reads the way a machine plate reads. Nothing is decorative, and nothing congratulates you. The app's only celebration is a single volt ring around a PR, and even that is a number with a frame around it.

The atmosphere is industrial and physical: chalk-white type on oil-black panels, borders you can see at arm's length under gym light, four background steps that stand in for depth instead of shadows. Density is deliberately low and the vertical rhythm is generous, because the surface is used one-handed, mid-set, with a phone that is moving. Every control is at least 48px tall and the primary action is 60px, so a misjudged tap still lands on the intended thing.

Expression lives in three places only: the volt accent, the condensed italic voice, and the tonal step of the panel behind a value. Everything else is quiet on purpose — the readout is the interface, so the interface gets out of the readout's way. Motion is state change, never showmanship: 120ms on color and border, 80ms on the press, 160–220ms when a floating layer enters. The one exception is the PR celebration, which is allowed a springy overshoot — it is the only moment the system raises its voice.

**Key Characteristics:**
- One accent (`#C6FF00`), reserved for the number that changed, the action that commits, and the state that is live.
- Four tonal background steps and two hairline weights carry all structure; no shadow vocabulary.
- Barlow Condensed italic caps for labels and numerals; Barlow roman for sentences only.
- 560px single column, 16px gutters, 8/14/20px radii, 48px minimum targets.
- Polish-only, terse, informal second person — the copy tone and the type tone are the same tone.
- No native dialogs or native selects anywhere; sheets, action bars and cards carry all interaction.

## Colors

A near-black, green-cast neutral stack with chalk-white type and a single chartreuse accent at full chroma. Every neutral shares the accent's hue so the black never reads as a different material from the light.

### Primary

- **Volt** (`#C6FF00`): the accent and the loudest thing the system owns. Used for the brand mark and the in-app logo, the active nav item's text, drill-in chevrons, the filled primary button's background, logged reps (`.set-pill__reps`), progression and strength ratios, the chart line, the 6px progress/strength fill, the focus outline, the empty-state icon, the toast's left edge, and the PR ring. It is the value that changed and the action that commits — nothing else.
- **Volt Hover** (`#D6FF3D`): the primary button's hover fill, one step lighter so the accent brightens rather than darkens under the cursor.
- **Volt Pressed** (`#A8DC00`): the primary button's active fill, one step darker so the press feels like it sinks.
- **Volt Subtle** (`#26310A`): the selected surface. Fills the checked segmented option, the selected chip or filter, and the `.btn--selected` state; also the flash behind a tapped stepper key.
- **Volt Dimmer** (`#1A2207`): the faintest accent tint. The active nav item's pill, the current container tab, and the "this set is already logged" fill on a done set chip — quiet enough to sit under chalk-white text without glowing.

### Neutral

- **Instrument Black** (`#070806`): the page. Also the `theme-color` and the gear behind the favicon's bolt.
- **Panel** (`#141613`): the standard container fill — cards, chips, session items, the logger's value field, the bottom sheet, the previous-set line.
- **Panel Raised** (`#1C1F1A`): one step above a panel, for controls and small readouts — inputs, icon buttons, stepper keys, stat tiles, badges, set pills, the progress track.
- **Panel Overlay** (`#242821`): the floating layer fill, used only by things that sit above the page — action bars, the workout thumb bar, toasts, the feedback dialog, the PR celebration.
- **Chalk** (`#F4F7EF`): primary text and the value on a raised tile. A warm white, never `#FFFFFF`.
- **Chalk Dim** (`#B4BCA9`): secondary text — long body copy in a card, sheet descriptions, inactive button labels, the eyebrow over a value.
- **Chalk Muted** (`#838B79`): tertiary text and every uppercase eyebrow: field labels, stat labels, section captions, axis ticks, timestamps, hints.
- **Ink** (`#0C1000`): text on a volt fill. An almost-black with the same green cast, so a filled primary button never uses pure black type.
- **Hairline** (`rgba(238, 255, 220, 0.10)`): the default 1px separation — card outlines, list rules, input strokes, the header rule, the nav's top edge.
- **Hairline Strong** (`rgba(238, 255, 220, 0.20)`): the 1px for things that need to be seen while moving: stepper keys, action bars, the sheet's top edge, the sheet handle, the progress track's rim, the empty-state's dashed outline.

### Status

Status color arrives as a pair: a saturated foreground and a deep tinted background that stays inside the neutral stack's darkness.

- **Success** (`#9BE564`) on **Success Dim** (`#1B2A12`): saved-and-confirmed. Declared, and reachable through the save-status component's `.save-status--saved` state.
- **Danger** (`#FF7A6B`) on **Danger Dim** (`#331714`): a failed write and the error state. Also the destructive button and the danger icon button, where the tint only touches the border.
- **Warning** (`#FFC94D`) on **Warning Dim** (`#302408`): the "hold this weight" badge — the only status color that also appears inside a normal flow rather than in an error path.
- **Info** (`#7BC6FF`) on **Info Dim** (`#122534`): the "back off" badge and the in-flight save. The one cool hue in the system.

**Reserved, not drawn:** `palette.css` also declares a five-colour series scale (`--app-chart-1` … `--app-chart-5`: volt, info blue, warning amber, danger coral, and a violet `#C79BFF` that appears nowhere else). Today the chart renders a single series, so only `--app-chart-1`'s hue and `--app-chart-grid` are drawn. A future multi-series chart should take its colours from that scale rather than inventing new hues.

### Named Rules

**The One-Signal Rule.** Volt marks the value that changed and the action that commits, and nothing else. Under 10% of any screen carries it; its rarity is what makes a 46px weight readout legible from arm's length in a dim gym. If a screen has three volt moments, two of them are wrong.

**The Four-Surface Rule.** There are exactly four background steps (Instrument Black → Panel → Panel Raised → Panel Overlay) and two hairline weights. Never invent a fifth grey and never reach for a shadow to separate two panels.

**The Green-Cast Rule.** Every neutral is tinted toward the accent's hue: the blacks are green-black, the greys are green-grey, the whites are green-white. A pure grey (`#808080`) or a blue-grey belongs to a different product.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, then Barlow)
**Body Font:** Barlow (with the system UI stack)

**Character:** A stamped-plate voice over a workmanlike reading voice. Barlow Condensed carries everything that is a label or a quantity — italic, bold-to-black, upper case, tight leading — while Barlow roman carries every sentence a human actually reads. The pairing keeps numbers monumental and prose plain, and the shared Barlow superfamily keeps them from looking like two unrelated typefaces.

### Hierarchy

- **Display** (800, 46px, 0.95): the one number the screen exists for — the weight or reps in the logger, the headline on the summary, the 1RM in the PR celebration, the value in `.display-value`. `tnum` so digits do not jitter while stepping.
- **Title** (700 italic caps, 27px, 1.05): the brand lockup (`.brand__name`, at 0.04em tracking) and the screen title (`.view-header__title`, at 0.01em). `.summary-hero__title` runs this role larger, at 38px.
- **Heading** (700 italic caps, 19px, 1.05): card and section titles — `.card__title`, `.section__title`, `.resume-bar__title`, the sheet title, the feedback-card title, the empty-state title, the exercise name in a split card.
- **Body** (400, 15px, 1.45): running Polish copy — descriptions, hints inside cards, list rows, sheet items. Set in Barlow roman and never uppercased.
- **Label** (500, 13px): secondary readable text — subtitles, status messages, toast text, the strength-level caption, the exercise-row value's neighbours. Roman; the caps are the exception, not the default.
- **Caption** (700, 12px, 0.08em, uppercase): every eyebrow and every piece of metadata — field labels, stat labels, set dates, exercise meta, hints, chart axis ticks, badges and chips. This is where the instrument-plate voice lives in small sizes.

Large one-off readouts in the same voice: the exercise stage name at 30px, `.stat__value` at 30px, `.exercise-row__value` at 26px, `.detail-fact__value` at 24px, `.previous-line__value` at 21px, `.set-pill__weight` / `.set-pill__reps` at 17px. All of them are the Display/Title voice at a smaller step, not a separate style.

### Named Rules

**The Italic Caps Rule.** Every heading and every readable figure is Barlow Condensed, italic, uppercase, and bold-to-black. Never a roman heading, never sentence case in a heading, and never an upright numeral in a value that a user steps or compares.

**The One-Voice Rule.** Barlow Condensed is for labels and quantities; Barlow roman is for sentences. If a string is a phrase the user reads, it is roman and sentence-cased — do not set body copy in caps to make it look strong.

**The Tabular Rule.** Any number a user compares across rows or steps gets `font-variant-numeric: tabular-nums` — set pills, weights, reps, stats, ratios, dates, durations, chart labels.

## Layout

A single 560px column, centred, with 16px gutters (20px from 600px up) and a fixed bottom nav that the content always reserves room for. There is no desktop layout: a wide window simply centres the same column on Instrument Black.

Vertical rhythm is the `spacing` scale: 20px between the blocks of `app-main`, 12px inside a card, 16px between cards and split cards, 8px between sibling controls, 4px between an eyebrow and its value. Radii step with size: 8px for controls, tiles and list rows, 14px for cards, sheets, and action bars, 20px for the shared dialog and the bottom sheet's top corners, and pill for chips, badges, tracks and counters.

Column splits are used only where a comparison is the point: `.stat-grid` (2), `.detail-facts` (3), `.form-grid` (2), `.segmented` (2), and the two stepper grids that frame a value — `.logger__row` and `.workout-nav` at `60px | 1fr | 60px`, `.stepper__controls` at `48px | 64px | 48px`. Everything else is one column.

Two breakpoints, both narrow: at 600px the gutters widen to 20px and the sticky header's negative margins compensate; at 340px and below the settings stepper stops sharing a row and stacks its label above its controls instead of shrinking the 48px keys. Horizontal scrollers (`.container-tabs`) bleed their own gutter and mask their scrollbar, so nothing ever scrolls horizontally at 390px or 320px.

Bottom clearance is a token, not a guess: the shell reserves `nav-height` (64px) plus the safe-area inset plus 24px, and grows to 112px above the nav when a floating action bar is present. The workout route has no nav and reserves 200px instead.

## Elevation & Depth

The system is tonal, and essentially flat. Depth is a background step plus a 1px hairline, and the correct way to move a surface closer is to move it one step up the four-step stack — never to cast a shadow. Because four steps is a small vocabulary, hierarchy is carried mostly by the hairlines and by type size: a card is 14px radius and a hairline on Panel, and it reads as raised next to Instrument Black without any blur under it.

Two `box-shadow` values exist in `palette.css` (`--shadow-raised`, `--shadow-overlay`) and they are used on floating layers only — action bars, the workout thumb bar, toasts, the feedback dialog, the bottom sheet, the PR celebration. They are lift for things detached from the page, not a scale with levels, and they should not be extended into one.

The system's other glow is a ring, not a shadow, and it belongs to state rather than depth: `--brand-primary-glow` (`rgba(198, 255, 0, 0.28)`) is drawn at 3px around a focused input or logger field, at 2px around the active set chip, and at 6px around the PR celebration's border. The celebration is also the only place a spring-like curve is allowed (`cubic-bezier(0.2, 0.9, 0.3, 1.4)`).

### Named Rules

**The Tonal-First Rule.** A new surface reads as closer by taking the next step in the four-step stack, never by gaining a shadow. If a design needs a shadow to communicate hierarchy, the hierarchy is wrong.

**The Floating-Only Rule.** A shadow means "this layer is detached from the page" — action bars, sheets, dialogs, toasts. Nothing that scrolls with the content may have one.

**The State-Ring Rule.** A volt ring means "this is live or focused", never "this is important". 3px for a field, 2px for the active set, 6px for the PR. It is the same ring at three intensities, and it never appears as ornament.

## Shapes

Softly rounded and otherwise hard-edged: 8px on every control, tile and row (inputs, buttons, icon buttons, stepper keys, stat cells, set chips, session items), 14px on cards and floating bars, 20px on the dialog and the sheet's top corners, and full pills for chips, badges, progress tracks and the 22px set-index counter. Sharp 0 radius appears nowhere except full-bleed edges (the header rule, the sheet's sides, the flush card).

Outlines are always 1px, never 2px, and always a hairline: the default weight for structure, the strong weight for interactive or moving things. Two deliberate exceptions in form language: dashed hairlines on `.empty-state` and on the "add container" chip, which is how the system says "this is empty space you can fill"; and a 3px left edge on a toast, which is the only place a single border side carries a status color.

Icons are Material Symbols Rounded at `FILL 0 / wght 500 / opsz 24`, sized to the text they sit beside — 24px in the nav, 22px in a button, 30px in a stepper key, 56px as the celebration mark. Nothing else in the system is a shape: no illustration, no logo beyond the Bolt, no decorative geometry.

## Components

### Buttons

- **Shape:** 8px radius, 48px minimum height (`.btn--large` at 60px, `.btn--compact` at 40px for inline secondary actions), 16px horizontal padding, uppercase Barlow Condensed italic, 0.06em tracking, 120ms colour transitions and an 80ms `scale(0.985)` press.
- **Primary:** solid Volt fill with Ink text, Barlow Condensed black 800. Used for exactly one action per screen — „Zapisz plan", „Zapisz serię" — and never beside a second primary.
- **Secondary:** Panel Raised fill, Hairline Strong border, Chalk text; hover swaps the border and text to Volt.
- **Ghost:** transparent fill, Hairline border, Chalk Dim text; hover moves to Chalk and Hairline Strong. This is the cancel/discard voice.
- **Danger:** transparent fill with a Danger border at 45% via `color-mix()`, Danger text; hover fills Danger Dim. Only for destructive confirmation inside a dialog, never as a page-level action.
- **Selected:** Volt Subtle fill, Volt text and border — the "this option is on" button.
- **Disabled:** 45% opacity, `cursor: not-allowed`, hover states suppressed.

### Icon Buttons

A 48×48 square with a 1px hairline on Panel Raised and Chalk Dim glyphs, 8px radius. `--accent` and `--danger` tint only the border (Volt at 40%, Danger at 35%) so the icon, not its box, carries the color. `--mini` is the one flat exception — 34×30, transparent until hovered — and it exists only for the reorder/remove keys inside a plan row. The workout header's minimize and finish keys are trimmed to 44×44 because they sit in a tight row.

### Chips

Pill, 36px tall, Panel fill, hairline, uppercase 12px caption text at 0.04em. Selected (`.chip[aria-pressed="true"]`, a current container tab) becomes Volt text on a Volt Dimmer fill with a full Volt border. `--action` is the dashed "add" chip with Chalk Muted text, and `--static` is not a control at all: 34px, sentence case, no tracking, 13px — used to show a container name inside a row where nothing is clickable.

### Cards

14px radius, Panel fill, 1px hairline, 16px padding, 12px internal gap, no shadow. `--flush` removes the padding for card-level lists whose rows reach the edges. Cards never nest; a list inside a card is a plain `.list` with 1px hairline rules between rows and no rule on the last one.

### Inputs & Fields

48px tall, Panel Raised fill, hairline border, 8px radius, 16px text (never below 16px, so mobile Safari does not zoom on focus). Focus removes the outline and swaps the border to Volt with a 3px `--brand-primary-glow` ring; error sets the border to Danger; disabled drops to 50% opacity.

Two variants keep the same treatment through a wrapper: `.logger__input-wrap` and the stepper, which draw the same border, radius and focus ring around a borderless input so the focused value can be 46px of condensed italic black without its own box. Fields sit in `.field` (label above, 8px gap) or `.field-row` (label left, control right, 48px minimum row height).

### Navigation

A fixed bottom bar, 4 columns, 64px plus the safe-area inset, filled with Instrument Black at 88% over a 12px backdrop blur so content scrolls visibly underneath, closed by a 1px Hairline on top. Each item is at least 48px, a 24px icon over an uppercase label clamped between 10px and 13px by container width — the label ellipsizes rather than wrapping, which is why the bar carries `container-type: inline-size`. Active (`.app-nav__item[aria-current="page"]`) is Volt text on a Volt Dimmer pill; tap feedback is a Panel fill.

The workout route hides the nav entirely and puts its own thumb-reachable `.workout-actions` bar at the bottom instead; the header of that route carries the minimize and finish keys, and the progress rail sits under it.

### Floating Action Bars

`.action-bar` and `.workout-actions` are the system's save/discard surface: fixed above the nav (or at the bottom on the workout route), 16px in from the page edges, 8px padding, 14px radius, Panel Overlay fill, Hairline Strong, one shadow. `.action-bar--grid` splits it into two equal buttons; a single 11px hint line may sit above them. They appear only when there is something to save, animate in over 160ms, and inside a detail view `.detail-actions` resets the bar back to static flow so it reads as part of the page.

### Badges

A pill at caption size, with an icon at 15px. `--up` is a progression badge: Volt text, Volt border at 40%, Volt Dimmer fill. `--hold` is Warning on Warning Dim, `--down` is Info on Info Dim, `--pr` is the only inverse badge — solid Volt fill with Ink text and a matching border. `--plain` is a transparent, hairline-only metadata chip (duration, exercise count), `--muted` is a neutral status label, and `--danger` is the failure voice. Badges never carry a tap target: they label, they do not act.

### Sheets, Dialogs & Toasts

The system has no native `alert`, `confirm`, `prompt` or `select`. Its **bottom sheet** is full-width up to 560px, capped at 88dvh, Panel fill, 20px top corners, 1px Hairline Strong on its top edge, with a 42×4px pill handle at 20% white and a scrollable body between a fixed head and fixed actions — this is where exercise and unit pickers live. Its **feedback dialog** is a centred 420px card, 20px radius, Panel Overlay fill, one shadow, with side-by-side flexed buttons. Both use the same `rgba(3, 4, 2, 0.72)` backdrop and 160–200ms opacity and translate entrance.

**Toasts** stack above the nav with `pointer-events: none`, Panel Overlay fill, 8px radius, and the status colour carried by the 3px left edge and the leading icon; everything else stays Chalk on black. The **save status** card inside settings is the persistent version of the same idea: a bordered raised row whose border, icon and (on failure) Danger Dim fill report saving, saved or failed.

### Signature Components

**The Logger Stage** (`#/workout`) is the reason the system exists: a 60px `−`, a borderless 46px condensed-italic-black value with its unit beside it, and a 60px `+`, with an 11px hint line under it and a re-pressable `.suggestion` row above it. Stepping repaints the value in place; the input never loses focus.

**Set Chips** are the log as a list of tappable rows: a 22px circular index that turns into a Volt disc with an Ink check when the set is done, the value beside it, then 40px edit and remove keys separated by hairlines. The active set gets a full Volt border and a 2px volt ring; a done set gets the Volt Dimmer fill and a 40%-volt border, and its reps are set in Volt.

**Progress Rails** (`.workout-progress`, `.strength-row__track`) are 6px pill tracks on Panel Raised with a Volt fill: the workout rail at 200ms width, and the strength row paired with a Volt ratio, a caps level label and a right-aligned next-threshold hint.

**The History Chart** is hand-written SVG at 2.4px: a Volt line with round caps, a Volt-to-transparent 28% area gradient, 8%-white grid lines, dots filled with Instrument Black and stroked Volt at 2px, and 10px Chalk Muted axis labels in Barlow roman (the only place body type labels a graphic). A single measurement falls back to one centred dot with a 16px condensed italic value above it, and no history at all falls back to a raised `.chart-empty` block.

## Do's and Don'ts

### Do:

- **Do** reach for `color-mix(in srgb, var(--…))` when a new tint is needed; `css/theme/palette.css` is the only file allowed to hold a literal colour.
- **Do** keep every interactive target at 48px minimum and every primary action at 60px, even if the design would look tighter.
- **Do** keep the numeric readouts in the Display voice (`46px / italic / 800 / tnum`) and let them be the largest thing on the screen.
- **Do** put `tabular-nums` on every value the user compares, steps or scans in a column.
- **Do** separate surfaces with a hairline (10%) or Hairline Strong (20%) and the next tonal step, in that order of preference.
- **Do** use the 3px `--brand-primary-glow` ring for focus on any field, including the borderless logger input, and keep the 2px / 6px variants for the active set and the PR.
- **Do** keep the shell at 560px, the gutters at 16px (20px above 600px), and the bottom clearance at nav + safe-area + 24px.
- **Do** route every confirmation, picker and error through `dialogService` / `sheetService` / `notify` so the sheet, dialog and toast treatments come along.
- **Do** cap motion at 120–200ms of state change, and let the global `prefers-reduced-motion` rule flatten it.

### Don't:

- **Don't** introduce a fifth background step, a third hairline weight, or a shadow on anything that scrolls with the page.
- **Don't** let Volt cover more than roughly a tenth of a screen; if a second and third element compete for it, the emphasis is wrong.
- **Don't** set headings in roman, sentences in caps, or body copy in Barlow Condensed.
- **Don't** use pure white, pure black, or a neutral grey without the green cast.
- **Don't** use a radius that is not 8, 14, 20 or pill, and don't mix two radii inside one component.
- **Don't** ship native `alert`, `confirm`, `prompt` or a native `select`; the sheet, the dialog card and the badge already cover those jobs.
- **Don't** add a fifth nav item to the bar or a third column to `.stat-grid` — at 390px the caps labels already ellipsize at the four the bar has.
- **Don't** animate the celebration's spring curve anywhere else, and don't add a second celebratory moment: the PR ring is the only one.
