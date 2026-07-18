# my-you-eye

A themeable, AI-maintainable UI component library — primitives, rich data components, and a
full **node-based canvas editor** — built so that agents (even cheap ones) can reuse and extend
it without drifting from the house style.

<sub>Radix · Tailwind v4 · CVA · shadcn-style owned components · 50+ components · light/dark + swappable themes</sub>

```tsx
import { Button, Card, Table } from "my-you-eye";
import "my-you-eye/styles.css";

<Button variant="primary">Save</Button>
```

---

## Highlights

- **50+ components** — inputs, overlays, feedback, navigation, and rich data (`Table`,
  `TreeView`, `CellValue`, `DataList`, `CodeBlock`, `Markdown`). Full list:
  **[COMPONENTS.md](./COMPONENTS.md)**.
- **Canvas / data-orchestration editor** — `Canvas`, `GraphNode`, `Port`, `Edge`, plus an
  `Orchestrator` pattern with node drag, grid snapping, port-to-port connections, pan/zoom,
  selection, and delete.
- **Themes without forks** — every color, radius, spacing, font, and border value is a CSS
  token. A theme is a token-override block; `data-theme` + `.dark` swap the entire look. No
  component is restyled per theme.
- **Guardrails, not vibes** — `npm run validate` turns rule violations into a red build: no
  styled native elements outside `src/ui/`, no hardcoded colors, every component has a showcase,
  every theme defines the full token set.

## Install

```bash
npm install github:sadigaxund/my-you-eye
```

```tsx
// once, at your app root
import "my-you-eye/styles.css";
// anywhere
import { Dialog, TreeView } from "my-you-eye";
```

To pick up changes: bump the tag here, then `npm update` in each app.

## Customize — three channels, in order of preference

1. **Theme tokens** — global restyle, zero code. Override the CSS variables at your root, or
   set `data-theme="neon"` / `class="dark"` on `<html>`.
   ```css
   :root {
     --color-primary: oklch(0.6 0.2 25);
     --radius-ui: 4px;
   }
   ```
2. **Variant props** — per-use choice from the approved set (see [COMPONENTS.md](./COMPONENTS.md)):
   ```tsx
   <Button variant="danger" size="sm">Delete</Button>
   ```
3. **`className`** — one-off *layout* only (width, margin), never a redesign:
   ```tsx
   <Button className="w-full">Submit</Button>
   ```

If a `className` tweak keeps recurring, it should become a variant in this repo — see
[AGENTS.md](./AGENTS.md).

## Discovering components (humans and agents)

`components.json` and [COMPONENTS.md](./COMPONENTS.md) are **auto-generated** from the showcase
files on every commit and every library build, so they never drift. An agent working in a
consuming app should read `components.json` and follow [SKILL.md](./SKILL.md) before building
any UI.

## The showcase

Every component and every variant renders in a live showcase with light/dark, font, and theme
switches — the source of truth for how things actually look.

```bash
npm run dev        # http://localhost:5173
```

## What this is / is not

- **Is** a curated house standard: primitives in `src/ui/`, compositions in `src/ui/patterns/`,
  each with a small fixed set of approved variants.
- **Is not** a general-purpose library for the world, a home for business logic or data
  fetching, or a parts bin of one-off styles.

## For contributors and agents

> **If you are an AI agent working in this repo, read [AGENTS.md](./AGENTS.md) first.** It is
> the binding ruleset; nothing here overrides it.

```bash
npm install
npm run dev        # showcase
npm run validate   # typecheck + lint + coverage + themes + build — the definition of done
npm run audit      # non-blocking drift report
npm run manifest   # regenerate components.json + COMPONENTS.md
```

`npm run validate` is the definition of done for every change. See [AGENTS.md](./AGENTS.md).

## CLI

The package ships a tiny Node CLI (`my-you-eye`) for project setup:

```
my-you-eye init          Copy SKILL.md + components.json to skills/
my-you-eye list          Print table of all components with groups and variants
my-you-eye sync          Re-copy SKILL.md + components.json (overwrite)
my-you-eye --help        Show usage
```

All file paths resolve from the package location, not the caller's cwd. The CLI has zero external dependencies.

| Concern | Choice | Why |
|---|---|---|
| Build/dev | Vite + React + TypeScript (strict) | Simple SPA, no SSR footguns |
| Styling | Tailwind CSS v4 (local build, no CDN) | Compiled at build time, no remote deps |
| Behavior | Radix UI (per-component packages) | Mature accessibility: focus, keyboard, ARIA |
| Variants | `class-variance-authority` | Declarative, enforceable variant sets |
| Class merging | `clsx` + `tailwind-merge` via `cn()` | Predictable `className` overrides |
| Library build | `tsup` | Consumable via `npm install` from a git URL |

Components follow the **shadcn/ui pattern**: code is copied in and owned here, so no upstream
dependency can break or restyle us.

### Layout

```
src/
  index.ts             # public API — the ONLY entry consuming apps import from
  lib/cn.ts            # clsx + tailwind-merge helper
  styles/
    tokens.css         # ALL base design tokens
    themes/*.css       # per-theme token overrides (dark, neon, high-contrast, …)
    globals.css        # tailwind entry, global scrollbar, base styles
  ui/<component>/      # Component.tsx + Component.showcase.tsx + index.ts
  ui/patterns/         # compositions built FROM primitives (FormField, Orchestrator, …)
  showcase/            # dev-only showcase app (glob-discovers *.showcase.tsx)
scripts/
  check-showcase.mjs   # every component folder has a showcase + export
  check-themes.mjs     # every theme defines the full token set
  gen-manifest.mjs     # regenerates components.json + COMPONENTS.md
  audit.mjs            # non-blocking drift report
AGENTS.md · SKILL.md · TODO.md · CHANGELOG.md
```

## License

See [LICENSE](./LICENSE).
