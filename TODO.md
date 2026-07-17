# TODO — Bootstrap Plan & Component Backlog

Work phases **in order**. Within a phase, tasks are ordered by dependency.
Every task's definition of done: `npm run validate` green + rules in [AGENTS.md](./AGENTS.md) followed.
Check items off (`[x]`) as they complete.

---

## Phase 0 — Repo scaffold (infrastructure, no components yet)

- [x] **0.1 Init project** — Vite + React + TS scaffolded
- [x] **0.2 Install dependencies** — all planned deps installed
- [x] **0.3 Tailwind v4 setup** — `@tailwindcss/vite` plugin in vite.config.ts, globals.css imports tailwindcss + tokens
- [x] **0.4 Design tokens** — `src/styles/tokens.css` with all colors, radius, typography; dark mode under `.dark`
- [x] **0.5 `cn()` helper** — `src/lib/cn.ts` (clsx + tailwind-merge)
- [x] **0.6 Showcase shell** — `src/showcase/types.ts` + `src/showcase/App.tsx` with glob discovery, group tabs, dark toggle
- [x] **0.7 ESLint flat config** — bans styled native elements outside src/ui/, restricted imports, arbitrary colors, 250-line limit
- [x] **0.8 Showcase coverage script** — `scripts/check-showcase.mjs` checks each component folder has showcase + export
- [x] **0.9 Package setup for consumption** — `@sadigaxund/ui`, exports map, tsup build, files: ["dist"]
- [x] **0.10 `validate` script** — `tsc --noEmit && eslint . && node scripts/check-showcase.mjs && npm run build:lib && vite build` (all green)
- [x] **0.11 CI** — `.github/workflows/validate.yml` (push + PR)
- [x] **0.12 Smoke test guardrails** — lint blocks styled `<button>` outside src/ui/; coverage script blocks Dummy.tsx without showcase

## Phase 1 — Core primitives

> For each component: follow AGENTS.md §2 checklist. Radix packages listed per item are
> pre-approved to install. Variants listed are the required minimum.

- [x] **Button** — no Radix. Variants: `primary | secondary | ghost | danger`; sizes `sm | md | lg`; states: disabled, `loading` (spinner + disabled). Group: `inputs`.
- [x] **Spinner** — no Radix. Sizes `sm | md | lg`. Group: `feedback`. (Before Button's `loading` state — Button uses it.)
- [x] **Input** — no Radix. Variants: `default | filled`; sizes `sm | md`; states: disabled, `invalid` (danger ring). Group: `inputs`.
- [x] **Label** — `@radix-ui/react-label`. Group: `inputs`.
- [x] **Card** — no Radix. Variants: `default | outlined | elevated`. Subcomponents in same folder: `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`. Group: `display`.
- [x] **Badge** — no Radix. Variants: `neutral | primary | success | warning | danger`; styles `solid | soft`. Group: `display`.
- [x] **Alert** — no Radix. Variants: `info | success | warning | danger`; optional title + icon slot. Group: `feedback`.

## Phase 2 — Form controls

- [x] **Checkbox** — `@radix-ui/react-checkbox`. Sizes `sm | md`; indeterminate state. Group: `inputs`.
- [x] **RadioGroup** — `@radix-ui/react-radio-group`. Group: `inputs`.
- [x] **Switch** — `@radix-ui/react-switch`. Sizes `sm | md`. Group: `inputs`.
- [x] **Textarea** — no Radix. Variants match Input; `autoResize?` prop. Group: `inputs`.
- [x] **Select** — `@radix-ui/react-select`. Sizes `sm | md`; invalid state. Group: `inputs`.
- [x] **FormField** (pattern) — composes Label + slot + help/error text. Props: `label`, `error?`, `hint?`, `required?`. Group: `patterns`.

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
