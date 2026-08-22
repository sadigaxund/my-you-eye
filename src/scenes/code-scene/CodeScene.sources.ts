// Pure helpers for CodeScene — no React, no DOM.

import type { HighlightRangeDef } from "../../ui/code-block";
import type { CodeScene as CodeSceneData } from "../schema";

/** The source "on screen" before and after each step runs. Mirrors
 * validate.content.ts's own running-source walk (kept local rather than
 * shared: the schema-validation tier and the rendering tier only
 * coincidentally compute the same thing, and validation must stay
 * dependency-free of the render tier). */
export function runningSources(scene: CodeSceneData): { before: string[]; after: string[] } {
  let running = scene.code;
  const before: string[] = [];
  const after: string[] = [];
  for (const step of scene.steps) {
    before.push(running);
    if (step.code != null) running = step.code;
    after.push(running);
  }
  return { before, after };
}

/** Turns a step's literal-substring `highlight` list into CodeBlock's
 * `highlightRanges`, searching only within `focus` (if set) or the whole
 * source otherwise — matched literally, per CodeStep.highlight's own doc. */
export function buildHighlightRanges(
  code: string,
  focus: [number, number] | undefined,
  needles: string[] | undefined,
): HighlightRangeDef[] {
  if (!needles || needles.length === 0) return [];
  const lines = code.split("\n");
  const [start, end] = focus ?? [1, lines.length];
  const ranges: HighlightRangeDef[] = [];
  for (let lineNumber = start; lineNumber <= end && lineNumber <= lines.length; lineNumber++) {
    const line = lines[lineNumber - 1];
    for (const needle of needles) {
      if (!needle) continue;
      let from = 0;
      for (;;) {
        const idx = line.indexOf(needle, from);
        if (idx === -1) break;
        ranges.push({ line: lineNumber, start: idx, end: idx + needle.length, color: "primary" });
        from = idx + needle.length;
      }
    }
  }
  return ranges;
}

/** The `id` CodeBlock's `lineId` prop assigns to a given 1-based line —
 * shared between the component (which passes `lineId={(n) =>
 * lineElementId(blockId, n)}`) and the measurement hook (which looks the
 * same id up with `document.getElementById`). */
export function lineElementId(blockId: string, lineNumber: number): string {
  return `${blockId}-L${lineNumber}`;
}
