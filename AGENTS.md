# AGENTS.md — Binding Rules for AI Agents

You are working in a UI template repository. Its purpose is a single, consistent, reusable
set of components. Your job is to keep it that way. These rules are not suggestions.

**Read this entire file before making any change. When in doubt, the stricter reading wins.**

---

## 0. Golden rules (absolute, no exceptions)

1. **Never hand-roll a styled native element.** No `<button>`, `<input>`, `<select>`,
   `<textarea>`, `<table>`, `<a>` with styling outside `src/ui/`. ESLint enforces this.
   If lint flags it, fix the code — **never disable, weaken, or work around a lint rule.**
2. **Never hardcode a design value.** No hex/rgb/oklch colors, no px font sizes, no raw
   border radii in component code. Every visual constant comes from `src/styles/tokens.css`
   via a Tailwind theme mapping. If a token is missing, add the token first.
3. **One component = one folder.** Never add a second component to an existing component's
   files. Never create a shared "misc.tsx", "helpers.tsx" or "components.tsx" grab-bag.
4. **Every exported component has a showcase file.** No exceptions. The validate script
   fails without it.
5. **`npm run validate` must pass before you declare any task done.** If it is red, the
   task is not done — no matter how "obviously correct" the change looks.
6. **Never edit `dist/`, lockfiles (except via `npm install`), or generated files.**
7. **Do not add dependencies** without an explicit instruction from the human. Radix
   per-component packages needed for a planned component are pre-approved (see TODO.md).
8. **Keep CHANGELOG.md updated.** Every time a phase, component, or significant change is
   completed, add or update an entry under the `[Unreleased]` section. Follow the
   [keepachangelog.com](https://keepachangelog.com) format (Added / Changed / Fixed / Removed).

---

## 1. Decision tree — follow it top to bottom, stop at first match

You need a UI element. Do this **in order**:

### Step A — Does it already exist?

1. Run: `ls src/ui src/ui/patterns`
2. Read `src/index.ts` (the public API).
3. Open the component's `*.showcase.tsx` to see its variants and intended usage.

**If it exists → import it from the public API. You are done. Do not create anything.**

### Step B — It exists but needs a small difference?

Classify the difference:

| Difference | Action |
|---|---|
| Layout only (width, margin, alignment, flex placement) | Use `className` at the call site. Done. |
| A visual style that other usages might also want (new color emphasis, new size, new density) | **Add a variant** in this repo. Follow §3 (Modifying a component). |
| A global look change (all buttons rounder, new brand color) | **Change a token** in `src/styles/tokens.css`. Never restyle per-component. |
| New behavior (loading state, icon slot, clearable input) | **Extend the component** with a prop in this repo. Follow §3. |

**Never** fork a component, copy-paste its JSX to a new place, or override its look
with a pile of `className` utilities. If you are writing more than ~3 utility classes
on a `ui/` component, you are in variant territory — go to §3.

### Step C — It does not exist at all?

Create it **in this repo** (never inline in a consuming app), following §2 exactly.

---

## 2. Creating a new component — checklist

Work through every step. Do not skip. Do not reorder.

1. **Confirm it's a primitive or a pattern.**
   - Primitive (self-contained interaction unit: Button, Select, Tooltip) → `src/ui/<kebab-name>/`
   - Pattern (composition of existing primitives: FormField, ConfirmDialog) → `src/ui/patterns/<kebab-name>/`
   - A pattern must be built **from existing primitives**. If it needs a missing primitive,
     create the primitive first as its own task.
2. **Create the folder with exactly these files:**
   ```
   src/ui/<kebab-name>/
     <PascalName>.tsx            # component + CVA variants
     <PascalName>.showcase.tsx   # showcase entry (see §4)
     index.ts                    # re-exports
   ```
3. **Implement using the shadcn/ui pattern:**
   - Radix primitive for behavior if one exists for this component (Dialog, Select,
     Tooltip, Checkbox, Switch, Tabs, Dropdown, Popover…). Plain elements only for
     purely visual components (Card, Badge, Spinner, Skeleton).
   - Variants declared with CVA. Include `variant` and (where sensible) `size`.
     2–3 design variants unless TODO.md specifies otherwise.
   - Merge classes with `cn()` from `src/lib/cn.ts`. Always accept and merge a
     `className` prop last.
   - Forward refs. Spread rest props. Type props explicitly (exported interface).
   - Colors/spacing/radius via token-mapped Tailwind classes only (e.g. `bg-primary`,
     `rounded-ui`) — never arbitrary values like `bg-[#3b82f6]`.
4. **Write the showcase file** per §4.
5. **Export from the public API:** add a line to `src/index.ts`
   (`export * from "./ui/<kebab-name>";`).
6. **Run `npm run validate`.** Fix everything until green.
7. **Visually verify:** `npm run dev`, open the showcase, confirm the component renders
   in its group with all variants, in both light and dark mode (toggle in showcase header).
8. **Update TODO.md:** check the component off the backlog list.

A file exceeding **250 lines** fails lint. If a component legitimately needs more,
split subparts into additional files **inside the same folder** (e.g. `Table.Row.tsx`)
— never into a shared file elsewhere.

## 3. Modifying an existing component — checklist

1. Read the component file AND its showcase file first. Understand existing variants.
2. Make the change **additive** whenever possible: new variant value, new optional prop.
   Do not change the default variant's appearance unless explicitly asked — other apps
   depend on it.
3. If you change or add any variant/prop: **update the showcase file** to demonstrate it.
4. If you change a token: check the showcase visually — tokens affect everything.
5. `npm run validate` green + visual check in showcase (§2.6–7).

## 4. Showcase rules

The showcase app auto-discovers every `*.showcase.tsx` under `src/ui/` via
`import.meta.glob`. There is **no manual registration list** — the file itself is the
registration.

Every showcase file exports exactly one default `ShowcaseEntry` (typed in
`src/showcase/types.ts`):

```tsx
import type { ShowcaseEntry } from "../../showcase/types";
import { Button } from ".";

const entry: ShowcaseEntry = {
  title: "Button",
  group: "inputs",            // must be one of the groups below
  demos: [
    { name: "Variants", render: () => (
      <div className="flex gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    )},
    { name: "Sizes", render: () => ( /* ... */ )},
    { name: "Disabled & loading", render: () => ( /* ... */ )},
  ],
};
export default entry;
```

**Groups (fixed):** `inputs` | `display` | `feedback` | `overlay` | `navigation` | `data` | `patterns`

- Add your component to the group that fits. Every group is a tab in the showcase.
- **Do not invent a new group** unless: (a) you have 3+ components that genuinely fit no
  existing group, AND (b) the human approved it. Then add the group name to the union type
  in `src/showcase/types.ts` and the tab order list in `src/showcase/App.tsx` — those are
  the only two places.
- Demos must cover: every variant, every size, disabled/edge states where applicable.

## 5. Validation — the definition of done

```bash
npm run validate
```

Runs, in order — ALL must pass:

| Step | Command | Catches |
|---|---|---|
| Types | `tsc --noEmit` | type errors |
| Lint | `eslint .` | native elements outside `src/ui/`, files >250 lines, restricted imports, arbitrary Tailwind color values |
| Showcase coverage | `node scripts/check-showcase.mjs` | any `src/ui/**` component folder missing a `*.showcase.tsx`, any showcase entry with an invalid group, any `ui/` folder not exported from `src/index.ts` |
| Build | `tsup && vite build` | broken exports, unresolvable imports |

Rules about validation itself:

- **Never** modify `scripts/check-showcase.mjs`, `eslint.config.js`, or `tsconfig.json`
  to make a failure pass. If you believe a rule is wrong, stop and report to the human.
- **Never** use `eslint-disable` without a `-- reason:` comment on the same line, and only
  for genuine edge cases (e.g. an unstyled native element inside a `ui/` wrapper is already
  allowed — you should almost never need a disable).
- If validate is red for reasons unrelated to your change (pre-existing breakage), stop
  and report — do not "fix" unrelated code to get green.

## 6. Forbidden actions — quick list

- ❌ Styled native elements outside `src/ui/`
- ❌ Hex/rgb/arbitrary color classes (`bg-[#...]`, `text-[rgb(...)]`) anywhere
- ❌ Importing `@radix-ui/*`, `class-variance-authority`, or `tailwind-merge` outside `src/ui/` and `src/lib/`
- ❌ New npm dependencies without human approval
- ❌ New showcase groups without human approval
- ❌ Copy-pasting a component's JSX instead of importing it
- ❌ Inline `style={{...}}` except for genuinely dynamic values (e.g. computed progress width)
- ❌ Editing validation configs to silence failures
- ❌ Declaring a task done with `npm run validate` red or without visual showcase check
- ❌ Business logic, data fetching, routing, or app state inside `src/ui/`

## 7. If you are unsure

Stop. Say exactly what you were trying to do, which rule blocks you, and what options you
see. A question costs nothing; silent rule-bending costs the repo its integrity.
