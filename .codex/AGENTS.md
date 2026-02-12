# AGENTS.md

This is the single source of truth.  
Every task, component, and line of code should follow these rules.

This is a vibecoded, design-driven calorie tracking app.  
Speed matters. Aesthetics matter. Clarity matters more.

---

# PROJECT

Calorie counting & macro tracking mobile web app.  
Mobile-first (iPhone priority).  
Reference viewport: iPhone 14 Pro (393×852 logical px).

Must look and feel like Apple designed it for athletes.

This is not a medical product.  
This is a premium fitness tool.

---

# STACK

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS 4
- Framer Motion
- Lucide React (stroke-width 1.5)
- Inter font (SF Pro fallback)
- Zustand (state)
- @tanstack/react-query (data fetching)
- clsx + tailwind-merge (cn() helper)

Avoid adding new dependencies unless necessary.

---

# DESIGN SYSTEM

## Philosophy

Apple Liquid Glass meets energetic sport aesthetic.

Primary color: neon orange `#FF6A00`.

Every UI element = translucent glass panel floating above background, accented with controlled orange glow.

Premium fitness app made by Apple — clean, breathing, bold accents on dark/light backgrounds.

---

## Primary Color: #FF6A00

Used in:
- CTA buttons
- Progress ring fills
- Active tabs
- Numeric highlights
- Gradients (#FF4D00 → #FF9500)
- Glow shadows

NEVER as body text.  
NEVER as full-screen background.

Used sparingly and consistently.

---

## Color Palette

### LIGHT MODE

Background:        #F2F2F7  
Glass bg:          rgba(255,255,255,0.55)  
Glass border:      rgba(255,255,255,0.35)  
Text primary:      #1C1C1E  
Text secondary:    #8E8E93  
Text tertiary:     #C7C7CC  
Separator:         rgba(0,0,0,0.06)  

### DARK MODE

Background:        #000000  
Background 2:      #1C1C1E  
Glass bg:          rgba(255,255,255,0.08)  
Glass border:      rgba(255,255,255,0.12)  
Text primary:      #F5F5F7  
Text secondary:    #8E8E93  
Text tertiary:     #48484A  
Separator:         rgba(255,255,255,0.06)  

### MACROS (fixed everywhere)

Calories: #FF6A00  
Protein:  #0A84FF  
Carbs:    #30D158  
Fat:      #FF375F  

### STATUS

Success: #30D158  
Warning: #FFD60A  
Error:   #FF453A  
Info:    #0A84FF  

---

## Glassmorphism

Every card, panel, container:

Light:
- bg rgba(255,255,255,0.55)
- backdrop-blur
- border 1px rgba(255,255,255,0.35)
- rounded-2xl
- subtle shadow

Dark:
- bg rgba(255,255,255,0.08)
- border 1px rgba(255,255,255,0.12)
- stronger shadow

Orange accent elements may add soft glow.

No sharp edges. Ever.

---

## Typography

Display: 36px, font-black  
Heading XL: 32px, font-bold  
Heading L: 28px  
Heading M: 22px  
Heading S: 17px  
Body Large: 17px  
Body: 15px  
Caption: 13px  
Overline: 11px uppercase  

Rules:
- Calorie/macro numbers are bold and visually dominant.
- Main calorie number uses primary orange.
- Units (kcal, g) smaller and secondary.
- Layout must breathe.

---

# ANIMATIONS

Allowed:
- Framer Motion
- @formkit/auto-animate
- CSS transitions
- Lottie (light usage)

Rules:

- Every meaningful state change should be animated.
- Animations must be fast and responsive.
- User never waits for animation to complete.

Durations:
- Micro: 150–200ms
- Element enter: 250–350ms
- Page transition: 350–450ms
- Count-up / progress: 600–800ms

Prefer:
- transform
- opacity

Width animation allowed only for progress elements.

---

# COMPONENT CONSISTENCY

If a component exists — use it.  
Do not create visual duplicates.

If new variation is needed — extend with props.

Every interactive element must define:
- default
- pressed
- disabled
- loading
- focus
- error (if applicable)

Min touch target: 44×44px.

---

# MOBILE FIRST

Design for 375–430px width.

Use safe areas:
- env(safe-area-inset-top)
- env(safe-area-inset-bottom)

No desktop breakpoints unless truly needed.

---

# DATA PRINCIPLES

Keep models simple.

No premature abstraction.

Prefer:
- optimistic updates
- local persistence (localStorage / IndexedDB)
- simple structures

Sync and backend complexity can come later.

Correct data > fancy UI.

---

# CODE ARCHITECTURE

Code must be readable in 30 seconds.

Aim for:
- <200 lines per file
- <40 lines per function

If readability drops — refactor.  
If splitting makes it worse — keep it together.

Clarity > arbitrary limits.

---

## Structure

src/
- app/
- components/
  - ui/
  - features/
  - layout/
- hooks/
- stores/
- types/
- lib/
- constants/
- api/

One responsibility per file.

---

## Naming

Self-documenting names only.

Booleans:
- is
- has
- can
- should

Functions start with verbs:
- calculateMacros
- fetchFoods
- formatDate

No:
- tmp
- data
- item
- val

---

## TypeScript

Strict mode.

No `any`.

Avoid type assertions unless validated.

Explicit props interfaces.

---

## State & Effects

Do not use useEffect for derived state.  
Use react-query for fetching.

No silent errors.

Every async operation must handle error state.

---

# PERFORMANCE

Prefer transform + opacity animations.

Use next/image.

Avoid unnecessary client components.

Measure before optimizing.

Optimize when needed — not prematurely.

---

# VIBECODE MODE

This project is intentionally design-driven.

Build fast.
Refactor when patterns emerge.
Avoid premature abstraction.
Do not over-engineer edge cases before MVP works.
If something feels heavy — simplify.

UX clarity > animation complexity.

Perfection is iterative, not instant.

---

# MENTAL MODEL

If it doesn't feel like Apple-level polish — refine it.

If it becomes overcomplicated — simplify it.

If it needs a comment to understand — rename it better.

Beauty and clarity must coexist.