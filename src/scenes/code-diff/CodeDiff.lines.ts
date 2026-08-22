// Line-level diff between two full sources, built from the exact same LCS
// primitive `wordDiff` runs over word tokens (`lcsDiffFlags`, exported from
// `src/ui/diff-block/DiffBlock.wordDiff.ts`) — run here over lines instead.
// This is the one diff algorithm in the library (TODO.md Phase E §6: "do not
// write a second diff algorithm"); `DiffBlock` itself never computes a diff,
// it only *renders* an already-tagged `DiffLine[]` a caller hands it, so
// `CodeDiff` (which receives two full source strings, not pre-tagged lines)
// is what needed this.

import { lcsDiffFlags } from "../../ui/diff-block";
import type { DiffLine } from "../../ui/diff-block";

/** Tags every line of `oldCode`/`newCode` as context/removed/added, in
 * document order, via a standard two-pointer LCS reconstruction: matched
 * (unchanged) indices in `a` and `b` always advance together and in order,
 * so walking both pointers and consuming whichever side is "changed" first
 * reproduces the diff. Feed the result to `pairDiffLines` (from
 * `src/ui/diff-block`) to group it into rows the way `DiffBlock` itself does. */
export function linesDiff(oldCode: string, newCode: string): DiffLine[] {
  const a = oldCode.split("\n");
  const b = newCode.split("\n");
  const { aChanged, bChanged } = lcsDiffFlags(a, b);

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldLine = 1;
  let newLine = 1;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && !aChanged[i] && !bChanged[j]) {
      lines.push({ type: "context", content: a[i], oldLine, newLine });
      i++; j++; oldLine++; newLine++;
    } else if (i < a.length && aChanged[i]) {
      lines.push({ type: "removed", content: a[i], oldLine });
      i++; oldLine++;
    } else if (j < b.length && bChanged[j]) {
      lines.push({ type: "added", content: b[j], newLine });
      j++; newLine++;
    } else {
      // Defensive only: aChanged/bChanged cover every index, so one of the
      // branches above always applies while i < a.length || j < b.length.
      break;
    }
  }
  return lines;
}
