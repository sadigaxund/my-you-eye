# Frontend-AI — UI Template Repository

A single source of truth for UI components, consumed by all frontend apps as a package.
Built so that **AI agents (including cheaper LLMs) can safely reuse, extend, and add components
without hand-rolling native HTML or drifting from the house style.**

> **If you are an AI agent working in this repo, STOP and read [AGENTS.md](./AGENTS.md) first.
> It is the binding ruleset. Nothing in this README overrides it.**

## What this repo is

- A curated set of UI primitives (`src/ui/`) and composed patterns (`src/ui/patterns/`),
  each with a small fixed set of approved design variants.
- A **showcase app** (`src/showcase/`) that renders every component and every variant,
  auto-discovered from `*.showcase.tsx` files — nothing is registered by hand.
- A **validation pipeline** (`npm run validate`) that makes rule violations a red build
  instead of something a human has to discover later.

## What this repo is NOT

- Not a general component library for the world. It is *our* house standard.
- Not a place for app business logic. Components here are presentation + interaction only.
- Not a parts bin of one-off styles. Every visual decision flows from tokens and variants.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Build/dev | Vite + React 18 + TypeScript (strict) | Simple SPA, no SSR footguns, fast |
| Styling | Tailwind CSS v4 (local build, no CDN) | Compiled at build time, zero runtime remote deps |
| Behavior primitives | Radix UI (per-component packages) | Mature accessibility (focus, keyboard, ARIA) |
| Variants | `class-variance-authority` (CVA) | Declarative, enforceable variant sets |
| Class merging | `clsx` + `tailwind-merge` via `cn()` | Predictable `className` overrides |
| Library build | `tsup` (runs on `prepare`) | Consumable via `npm install` from a git URL |

Component implementations follow the **shadcn/ui pattern**: the code is copied into this repo
and owned here. There is no upstream component dependency that can break or restyle us.

## Repository layout

```
src/
  index.ts                  # public API — the ONLY entry consuming apps import from
  lib/
    cn.ts                   # clsx + tailwind-merge helper
  styles/
    tokens.css              # ALL design tokens (colors, radius, spacing, typography)
    globals.css             # tailwind entry + base styles
  ui/                       # one folder per primitive component
    button/
      Button.tsx            # component + CVA variants
      Button.showcase.tsx   # demo entries for the showcase app
      index.ts              # re-exports
    ...
    patterns/               # composed components (built FROM primitives)
      form-field/
      ...
  showcase/                 # showcase app shell (dev-only, not exported)
    App.tsx                 # glob-discovers *.showcase.tsx, renders group tabs
    types.ts                # ShowcaseEntry contract
scripts/
  check-showcase.mjs        # fails if any component folder lacks a showcase file
AGENTS.md                   # binding rules for AI agents
TODO.md                     # bootstrap plan + component backlog
```

## Consuming this package from an app

```bash
npm install github:<your-username>/Frontend-AI
```

```tsx
import { Button, Card, Dialog } from "@sakhund/ui";
import "@sakhund/ui/styles.css";
```

To pick up changes made here in all apps: bump the git tag here, `npm update` in each app.

## The three customization channels (in order of preference)

1. **Theme tokens** — global restyle with zero code changes. Override CSS variables in the
   consuming app's root stylesheet:
   ```css
   :root {
     --ui-primary: oklch(0.6 0.2 25);
     --ui-radius: 4px;
   }
   ```
2. **Variant props** — per-usage choice from the approved set:
   ```tsx
   <Button variant="danger" size="sm">Delete</Button>
   ```
3. **`className`** — one-off *layout* tweaks only (width, margin). Never a redesign:
   ```tsx
   <Button className="w-full">Submit</Button>
   ```

If a `className` tweak keeps recurring, it must become a variant in this repo (see AGENTS.md).

## Development

```bash
npm install
npm run dev        # showcase app at localhost:5173
npm run validate   # typecheck + lint + showcase coverage + build — must be green
```

`npm run validate` is the definition of done for every change. See [AGENTS.md](./AGENTS.md).
