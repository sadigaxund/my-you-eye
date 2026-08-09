// Proves the crossing-reduction claim for src/lib/layout.ts's `layered()`.
//
// Builds a small 3-layer DAG whose layer-1 and layer-2 edges are wired in a
// deliberately scrambled order relative to the input node array — exactly
// the "wire up the lines without any care about how it will look" failure
// mode TODO.md Q3 names as the reason this file exists. `layered()` groups
// each layer in input order before any crossing-reduction pass runs, so
// that scrambled input order is also the *naive* layout (iterations: 0).
// We then run the real barycenter pass (default iterations) on the exact
// same graph and assert the crossing count went down.
//
// There's no test runner configured in this repo, so this is a plain
// node-runnable script (not a unit test) — run it directly:
//   node scripts/prove-layout-crossings.mjs
//
// It bundles src/lib/layout.ts with esbuild (already a transitive
// dependency of vite/tsup — nothing new installed) so this proves the real
// TypeScript implementation, not a reimplemented copy.

import { build } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

async function loadLayoutModule() {
  const outDir = mkdtempSync(join(tmpdir(), "layout-proof-"));
  const outfile = join(outDir, "layout.mjs");
  await build({
    entryPoints: [join(ROOT, "src/lib/layout.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  const mod = await import(`file://${outfile}`);
  rmSync(outDir, { recursive: true, force: true });
  return mod;
}

// Layer 0 (sources): A, B, C, D
// Layer 1: P, Q, R, S — each fed by exactly one layer-0 node, wired as a
// full reversal (A→S, B→R, C→Q, D→P) against the input order [P,Q,R,S].
// Layer 2: X, Y, Z — each fed by two layer-1 nodes, also wired against the
// input order [X,Y,Z] rather than by proximity.
const nodes = [
  { id: "A" }, { id: "B" }, { id: "C" }, { id: "D" },
  { id: "P" }, { id: "Q" }, { id: "R" }, { id: "S" },
  { id: "X" }, { id: "Y" }, { id: "Z" },
];
const edges = [
  // Layer 0 -> Layer 1: reversed
  { from: "A", to: "S" },
  { from: "B", to: "R" },
  { from: "C", to: "Q" },
  { from: "D", to: "P" },
  // Layer 1 -> Layer 2: scrambled
  { from: "P", to: "Z" },
  { from: "Q", to: "X" },
  { from: "R", to: "Y" },
  { from: "S", to: "X" },
  { from: "P", to: "Y" },
  { from: "R", to: "Z" },
];

function layersFromPositions(positions, direction) {
  const axis = direction === "horizontal" ? "x" : "y";
  const crossAxis = direction === "horizontal" ? "y" : "x";
  const byRank = new Map();
  for (const p of positions) {
    const list = byRank.get(p[axis]) ?? [];
    list.push(p);
    byRank.set(p[axis], list);
  }
  return [...byRank.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, list]) => list.sort((a, b) => a[crossAxis] - b[crossAxis]).map((p) => p.id));
}

const { layered, countCrossings } = await loadLayoutModule();

const naivePositions = layered(nodes, edges, { iterations: 0 });
const optimizedPositions = layered(nodes, edges);

const naiveLayers = layersFromPositions(naivePositions, "horizontal");
const optimizedLayers = layersFromPositions(optimizedPositions, "horizontal");

const naiveCrossings = countCrossings(naiveLayers, edges);
const optimizedCrossings = countCrossings(optimizedLayers, edges);

console.log("Graph: 4 sources (A-D) -> 4 mid nodes (P-S, reversed wiring) -> 3 sinks (X-Z, scrambled wiring)");
console.log("Naive layer order (iterations: 0):", naiveLayers.map((l) => `[${l.join(",")}]`).join(" "));
console.log("Naive crossings:", naiveCrossings);
console.log("Optimized layer order (default iterations):", optimizedLayers.map((l) => `[${l.join(",")}]`).join(" "));
console.log("Optimized crossings:", optimizedCrossings);

if (!(optimizedCrossings < naiveCrossings)) {
  console.error(`❌ Expected optimized crossings (${optimizedCrossings}) < naive crossings (${naiveCrossings})`);
  process.exit(1);
}
console.log(`✅ Crossing reduction confirmed: ${naiveCrossings} -> ${optimizedCrossings}`);
