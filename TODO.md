# TODO — Bootstrap Plan & Component Backlog

Work phases **in order**. Within a phase, tasks are ordered by dependency.
Every task's definition of done: `npm run validate` green + rules in [AGENTS.md](./AGENTS.md) followed.
Check items off (`[x]`) as they complete.

---

## Phase 0 — Repo scaffold (infrastructure, no components yet)

- [ ] **0.1 Init project**
  ```bash
  npm create vite@latest . -- --template react-ts
  git init
  ```
- [ ] **0.2 Install dependencies** (pre-approved — the only dependency install that doesn't need per-item human approval, besides Radix packages listed in the backlog below)
  ```bash
  npm i clsx tailwind-merge class-variance-authority
  npm i -D tailwindcss @tailwindcss/vite tsup eslint typescript-eslint @types/node
  ```
- [ ] **0.3 Tailwind v4 setup**: add `@tailwindcss/vite` plugin to `vite.config.ts`;
      create `src/styles/globals.css` with `@import "tailwindcss";` importing `tokens.css`.
- [ ] **0.4 Design tokens** — `src/styles/tokens.css` with CSS variables, mapped into
      Tailwind via `@theme`. Minimum token set:
      - Colors: `--ui-bg`, `--ui-fg`, `--ui-muted`, `--ui-primary`, `--ui-primary-fg`,
        `--ui-secondary`, `--ui-danger`, `--ui-success`, `--ui-warning`, `--ui-border`, `--ui-ring`
      - Dark mode: same variables redefined under `.dark` class
      - Shape/space: `--ui-radius`, `--ui-radius-sm`, `--ui-radius-lg`
      - Typography: `--ui-font-sans`, `--ui-font-mono`, size scale `--ui-text-xs..2xl`
- [ ] **0.5 `cn()` helper** — `src/lib/cn.ts` (clsx + tailwind-merge).
- [ ] **0.6 Showcase shell** — `src/showcase/types.ts` (`ShowcaseEntry` type with the 7
      fixed groups per AGENTS.md §4) and `src/showcase/App.tsx`:
      - `import.meta.glob("../ui/**/*.showcase.tsx", { eager: true })`
      - One tab per group (order: inputs, display, feedback, overlay, navigation, data, patterns)
      - Light/dark toggle in header (toggles `.dark` on `<html>`)
      - Renders each entry: title + each demo with its name
- [ ] **0.7 ESLint flat config** enforcing (see AGENTS.md §0, §5):
      - `no-restricted-syntax`: styled native elements (`button`, `input`, `select`,
        `textarea`, `table`) in JSX **outside** `src/ui/**`
      - `no-restricted-imports`: `@radix-ui/*`, `class-variance-authority`,
        `tailwind-merge` outside `src/ui/**` and `src/lib/**`
      - `max-lines`: 250 (skip blank lines/comments)
      - Ban arbitrary color classes: restrict `bg-[#`, `text-[#`, `bg-[rgb`, etc. via
        `no-restricted-syntax` on JSX className string literals
- [ ] **0.8 Showcase coverage script** — `scripts/check-showcase.mjs`:
      1. every folder under `src/ui/` (and `src/ui/patterns/`) contains exactly one `*.showcase.tsx`
      2. every showcase default export has a `group` from the fixed list
      3. every component folder is re-exported from `src/index.ts`
      Exit non-zero with a clear message naming the offending folder.
- [ ] **0.9 Package setup for consumption**: `package.json` with name `@sakhund/ui`,
      `exports` map (`.` → dist ESM + types, `./styles.css` → built CSS), `files: ["dist"]`,
      `prepare: "npm run build:lib"`, tsup config building `src/index.ts` (external:
      react, react-dom).
- [ ] **0.10 `validate` script**: `tsc --noEmit && eslint . && node scripts/check-showcase.mjs && npm run build:lib && vite build`
- [ ] **0.11 CI**: `.github/workflows/validate.yml` — run `npm ci && npm run validate` on
      every push and PR. Green CI = last-known-good state for rot recovery.
- [ ] **0.12 Smoke test the guardrails** (important — proves the tripwires work):
      - Add a styled `<button>` to `src/showcase/App.tsx` → lint MUST fail → revert
      - Create `src/ui/dummy/Dummy.tsx` without showcase file → coverage script MUST fail → revert

## Phase 1 — Core primitives

> For each component: follow AGENTS.md §2 checklist. Radix packages listed per item are
> pre-approved to install. Variants listed are the required minimum.

- [ ] **Button** — no Radix. Variants: `primary | secondary | ghost | danger`; sizes `sm | md | lg`; states: disabled, `loading` (spinner + disabled). Group: `inputs`.
- [ ] **Spinner** — no Radix. Sizes `sm | md | lg`. Group: `feedback`. (Before Button's `loading` state — Button uses it.)
- [ ] **Input** — no Radix. Variants: `default | filled`; sizes `sm | md`; states: disabled, `invalid` (danger ring). Group: `inputs`.
- [ ] **Label** — `@radix-ui/react-label`. Group: `inputs`.
- [ ] **Card** — no Radix. Variants: `default | outlined | elevated`. Subcomponents in same folder: `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`. Group: `display`.
- [ ] **Badge** — no Radix. Variants: `neutral | primary | success | warning | danger`; styles `solid | soft`. Group: `display`.
- [ ] **Alert** — no Radix. Variants: `info | success | warning | danger`; optional title + icon slot. Group: `feedback`.

## Phase 2 — Form controls

- [ ] **Checkbox** — `@radix-ui/react-checkbox`. Sizes `sm | md`; indeterminate state. Group: `inputs`.
- [ ] **RadioGroup** — `@radix-ui/react-radio-group`. Group: `inputs`.
- [ ] **Switch** — `@radix-ui/react-switch`. Sizes `sm | md`. Group: `inputs`.
- [ ] **Textarea** — no Radix. Variants match Input; `autoResize?` prop. Group: `inputs`.
- [ ] **Select** — `@radix-ui/react-select`. Sizes `sm | md`; invalid state. Group: `inputs`.
- [ ] **FormField** (pattern) — composes Label + slot + help/error text. Props: `label`, `error?`, `hint?`, `required?`. Group: `patterns`.

## Phase 3 — Overlays & feedback

- [ ] **Dialog** — `@radix-ui/react-dialog`. Sizes `sm | md | lg`; header/footer subcomponents. Group: `overlay`.
- [ ] **Tooltip** — `@radix-ui/react-tooltip`. Single provider exported too. Group: `overlay`.
- [ ] **DropdownMenu** — `@radix-ui/react-dropdown-menu`. Items, separators, destructive item style. Group: `overlay`.
- [ ] **Popover** — `@radix-ui/react-popover`. Group: `overlay`.
- [ ] **Toast** — `@radix-ui/react-toast`. Variants: `default | success | danger`; exported `useToast()` + `<Toaster/>`. Group: `feedback`.
- [ ] **ConfirmDialog** (pattern) — Dialog + Buttons; props: `title`, `description`, `confirmLabel`, `destructive?`, `onConfirm`. Group: `patterns`.

## Phase 4 — Navigation & data

- [ ] **Tabs** — `@radix-ui/react-tabs`. Variants: `underline | pills`. Group: `navigation`.
- [ ] **Breadcrumbs** — no Radix. Group: `navigation`.
- [ ] **Pagination** — no Radix (uses Button internally). Group: `navigation`.
- [ ] **Avatar** — `@radix-ui/react-avatar`. Sizes `sm | md | lg`; fallback initials. Group: `display`.
- [ ] **Skeleton** — no Radix. Shapes: `text | circle | rect`. Group: `feedback`.
- [ ] **EmptyState** — no Radix. Icon slot + title + description + action slot. Group: `display`.
- [ ] **Table** — no Radix. Variants: `default | striped`; density `compact | normal`. Subcomponents in same folder (mind the 250-line limit — split files). Group: `data`.

## Phase 5 — App patterns

- [ ] **PageShell** (pattern) — page header (title, description, actions slot) + content area. Group: `patterns`.
- [ ] **Toolbar** (pattern) — search Input + filter slots + actions, responsive row. Group: `patterns`.
- [ ] **StatCard** (pattern) — label + value + optional delta badge. Group: `patterns`.

## Phase 6 — Distribution & upkeep (when needed, not before)

- [ ] Tag `v0.1.0` once Phases 0–3 are done; consume from a real app via `npm i github:<user>/Frontend-AI#v0.1.0`.
- [ ] Add an `AUDIT.md` procedure: script/checklist comparing exports vs showcase vs real usage in consuming apps; run after every batch of cheap-LLM work.
- [ ] Consider versioned releases with changesets + npm publish only if git-URL installs become painful.

---

## How to start (for the human)

1. Give the agent Phase 0 only. Verify guardrails via task 0.12 before any component work.
2. Then hand out components **one or two at a time**, phase order. Prompt template:
   > Read AGENTS.md fully. Then implement `<Component>` from TODO.md Phase N following
   > AGENTS.md §2 exactly. Do not touch anything else. Show me `npm run validate` output.
3. After each batch: open the showcase yourself, eyeball light + dark, then check the box.
4. If the agent "fixed" a validation config — reject the batch, revert, re-prompt with §5.
