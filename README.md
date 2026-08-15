# my-you-eye

A personally curated UI kit for building clean, simple apps fast — plus a motion and
scene system for turning the same components into interactive presentations and
rendered videos. Built so AI agents (even cheap ones) can use it correctly on the
first try.

<sub>React 19 · Radix · Tailwind v4 · 100+ components across 4 tiers · 10 themes · light/dark</sub>

```tsx
import { Button, Card, DataTable } from "my-you-eye";
import "my-you-eye/styles.css";

<Button variant="primary">Save</Button>
```

**Browse everything live:** [sadigaxund.github.io/my-you-eye](https://sadigaxund.github.io/my-you-eye/) —
every component, every variant, with theme/font/dark switches and a generated API
reference on each page.

## A quick look

<!-- screenshot: showcase overview — a component page in the glass theme, showing
     the sidebar, demo cards, and the API reference panel -->
![The showcase](docs/screenshots/showcase.png)

<!-- screenshot: the Graph pattern — pipeline editor with a few connected nodes,
     a group boundary, and colored edge kinds -->
![Node editor](docs/screenshots/graph.png)

<!-- screenshot: a CodeScene frame mid-walkthrough — focused lines, camera zoomed,
     caption at the bottom (render one frame from apps/video) -->
![A video scene](docs/screenshots/code-scene.png)

<!-- screenshot: the same page in 3-4 themes side by side (default, neon, comic,
     metallic) to sell the token system -->
![Themes](docs/screenshots/themes.png)

## What's inside

One package, four tiers — install once, import what the job needs:

| Import | What you get |
|---|---|
| `my-you-eye` | The static kit: inputs, overlays, tables, charts, code/terminal/diff blocks, a node-canvas editor, stat cards, file trees… |
| `my-you-eye/motion` | Frame-driven animation primitives (`Reveal`, `Stagger`, `TypeText`, `Camera`, …) that render identically live and in video |
| `my-you-eye/scenes` | Author a whole presentation or video as **one typed data object** — title, code walkthrough, diagram, chart, terminal scenes |
| `my-you-eye/present` / `my-you-eye/video` | Deliver that object as a live click-through (no Remotion needed) or render it to MP4 |

Everything is themed by CSS tokens: set `data-theme="neon"` (or `glass`, `comic`,
`brutal`, `stark`, `contrast`, `metallic`, `frosted`, `dark`) and `.dark` on `<html>`
and the entire kit restyles — no component forks, ever.

## Install & get started

```bash
npm install my-you-eye
```

```tsx
// once, at your app root — pick ONE stylesheet:
import "my-you-eye/styles.css";          // your app runs Tailwind v4 (the normal path)
// or
import "my-you-eye/styles.compiled.css"; // no Tailwind in your pipeline (Remotion, plain bundlers)

// then, anywhere:
import { Dialog, TreeView, BarChart } from "my-you-eye";
```

Every component ships its `Props` type and its variants from the same import. The
full catalog with prop signatures lives in [COMPONENTS.md](./COMPONENTS.md) /
`components.json`, or run `npx my-you-eye list`.

## Why this works well with AI agents

The package is designed to be *agent-legible*, so you can hand a coding agent a
one-line request and get house-style UI back:

- **[SKILL.md](./SKILL.md)** is a ready-made agent skill: request→recipe playbooks
  ("build me an IDE-like tool", "a dashboard", "a landing page"), design rules, and
  a script→scenes workflow for authoring videos. Drop it into a project with:
  ```bash
  npx my-you-eye init   # copies SKILL.md + references/ + components.json into skills/
  ```
- **`components.json`** is generated from the source on every build — prop
  signatures, variants, defaults — so agents pick from the real API instead of
  guessing.
- **Scene data can't be styled wrong**: a video/presentation is plain data with
  closed unions — no `className`, no colors, no pixel pushing — and
  `assertVideo()` validates every reference before a frame renders.

## Versioning

Releases are **date-versioned** (`YYYY.M.N` — year, month, release-counter within
the month, e.g. `2026.8.0`). Semver semantics don't fit a personal kit that evolves
continuously; the version tells you *when*, the [CHANGELOG](./CHANGELOG.md) tells
you *what*. The format is still npm/semver-compatible, so ranges and tooling work
unchanged.

## Contributing / working in this repo

> **AI agents: read [AGENTS.md](./AGENTS.md) first.** It is the binding ruleset.

```bash
npm run dev        # the showcase, locally
npm run validate   # the definition of done — types, lint, coverage, themes, contrast, build
npm run release    # CalVer bump + changelog + signed tag (push to publish)
```

Components follow the shadcn/ui pattern — code is owned here, Radix supplies
behavior, CVA declares variants, and every visual constant is a token in
`src/styles/tokens.css`. `npm run validate` turns rule violations into a red build.

## License

See [LICENSE](./LICENSE).
