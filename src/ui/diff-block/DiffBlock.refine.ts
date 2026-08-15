// Post-processing for `wordDiff`'s raw segment runs — pure functions, no
// React, no DOM, so every rule below is directly testable.
//
// Why this exists: `tokenizeWords` splits on `\w+|\s+|[^\w\s]`, which makes
// every single punctuation character its own token. An LCS over that token
// stream trivially matches a stray `(`, `.` or space in one line against an
// unrelated one in the other, so a genuinely rewritten line comes back as a
// confetti of two-character changed runs separated by one-character
// "unchanged" ones. Rendered, that reads as noise — a strip of disconnected
// boxes rather than "this part of the line changed".
//
// The fix belongs HERE, not in `wordDiff`: the raw flags are the correct
// answer to "which tokens matched", and `lcsDiffFlags`/`wordDiff` are shared
// (scenes/code-diff runs the same LCS over whole lines). This module only
// decides how those flags should be *displayed*, and both consumers —
// DiffBlock's own static rendering and CodeDiff's animated rows — run it, so
// the two never diverge.

import { wordDiff } from "./DiffBlock.wordDiff";
import type { WordDiffResult, WordDiffSegment } from "./DiffBlock.wordDiff";

/** An unchanged run this short, wedged between two changed runs, is noise
 * rather than a surviving fragment — absorb it. */
const NOISE_LENGTH = 2;

/** A changed run shorter than this is dropped (rendered as unchanged), unless
 * it is the only change on the line — a single `(` lit up on its own says
 * nothing a reader can use. */
const MIN_CHANGED_LENGTH = 2;

/** Above this share of changed characters, per-token highlighting stops
 * being informative: nearly the whole line changed, so the row's own
 * added/removed background already says it, and the boxes just add visual
 * noise on top. */
const WHOLE_LINE_THRESHOLD = 0.55;

/** No letters and no digits — punctuation, brackets, operators, whitespace. */
function isPunctuationOrSpace(text: string): boolean {
  return text.length > 0 && !/[\p{L}\p{N}]/u.test(text);
}

/** Collapses adjacent segments carrying the same `changed` flag into one run,
 * so the rules below always see maximal runs (and so a caller renders one
 * box per run instead of one per token). */
function mergeRuns(segments: WordDiffSegment[]): WordDiffSegment[] {
  const out: WordDiffSegment[] = [];
  for (const seg of segments) {
    const last = out[out.length - 1];
    if (last && last.changed === seg.changed) out[out.length - 1] = { text: last.text + seg.text, changed: seg.changed };
    else out.push({ ...seg });
  }
  return out;
}

/**
 * Rule (a): an unchanged run that is ≤2 characters OR pure
 * whitespace/punctuation, sitting BETWEEN two changed runs, is absorbed into
 * them — one merged changed run instead of two boxes with a hairline gap
 * that `MergedHighlight`'s outline can't bridge.
 *
 * Rule (b): after that, a changed run shorter than 2 characters is demoted to
 * unchanged — unless the line has exactly one changed run, in which case it
 * is the whole story of the line and dropping it would show no diff at all.
 */
export function cleanWordDiffSegments(segments: WordDiffSegment[]): WordDiffSegment[] {
  const runs = mergeRuns(segments);

  const absorbed = runs.map((run, i) => {
    if (run.changed) return run;
    const between = i > 0 && i < runs.length - 1 && runs[i - 1].changed && runs[i + 1].changed;
    if (!between) return run;
    if (run.text.length > NOISE_LENGTH && !isPunctuationOrSpace(run.text)) return run;
    return { ...run, changed: true };
  });

  const merged = mergeRuns(absorbed);
  const changedCount = merged.filter((r) => r.changed).length;
  if (changedCount <= 1) return merged;
  return mergeRuns(merged.map((run) => (run.changed && run.text.length < MIN_CHANGED_LENGTH ? { ...run, changed: false } : run)));
}

/** Share of a side's characters that sit inside a changed run, 0→1. */
export function changedRatio(segments: WordDiffSegment[]): number {
  let changed = 0;
  let total = 0;
  for (const seg of segments) {
    total += seg.text.length;
    if (seg.changed) changed += seg.text.length;
  }
  return total === 0 ? 0 : changed / total;
}

/**
 * Cleans both sides of a `wordDiff` result, or returns `null` when the row
 * should fall back to plain whole-line treatment (rule (c)): once more than
 * `WHOLE_LINE_THRESHOLD` of either side's characters changed, the calm
 * added/removed row background says "this line was rewritten" better than a
 * near-solid block of highlight boxes does.
 *
 * Both sides share one decision on purpose — a row whose old half is boxed
 * and whose new half is not reads as a rendering bug.
 */
export function refineWordDiff(result: WordDiffResult, threshold = WHOLE_LINE_THRESHOLD): WordDiffResult | null {
  const oldSegments = cleanWordDiffSegments(result.oldSegments);
  const newSegments = cleanWordDiffSegments(result.newSegments);
  if (Math.max(changedRatio(oldSegments), changedRatio(newSegments)) > threshold) return null;
  return { oldSegments, newSegments };
}

/** `wordDiff` + `refineWordDiff` in one call — the entry point every renderer
 * of a 1:1 changed pair uses, so no consumer can accidentally paint the raw,
 * un-refined runs. `null` means "render this row with the whole-line
 * treatment instead". */
export function refinedLineDiff(oldText: string, newText: string): WordDiffResult | null {
  return refineWordDiff(wordDiff(oldText, newText));
}
