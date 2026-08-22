// Pure word-level diff (no React, no DOM) — an LCS over word/punctuation
// tokens, same shape of algorithm as a classic Myers-lite line diff but run
// on tokens within a single changed-line pair rather than on whole lines.
// DiffBlock composes this only for a 1:1 removed→added pair (see
// `pairDiffLines` in DiffBlock.tsx); runs of N removed vs M added lines
// (N,M > 1) render as plain whole-line highlights — see the "chose not to
// do" note in the component doc comment.

export interface WordDiffSegment {
  text: string;
  changed: boolean;
}

function tokenizeWords(s: string): string[] {
  return s.match(/\w+|\s+|[^\w\s]/g) ?? [];
}

export interface WordDiffResult {
  oldSegments: WordDiffSegment[];
  newSegments: WordDiffSegment[];
}

export interface LcsDiffFlags {
  /** `true` at index i means `a[i]` has no match in `b` (unified-diff "removed"). */
  aChanged: boolean[];
  /** `true` at index j means `b[j]` has no match in `a` (unified-diff "added"). */
  bChanged: boolean[];
}

/**
 * Token-level LCS diff, generic over the token type — the one diff
 * algorithm in the library (AGENTS.md §"reuse, don't reimplement"). `wordDiff`
 * below is this run over word/punctuation tokens within a single line;
 * `src/scenes/code-diff` runs the exact same function over an old/new
 * source's *lines* to build the `DiffLine[]` `pairDiffLines` expects, rather
 * than hand-rolling a second LCS for line-level diffing.
 */
export function lcsDiffFlags<T>(a: T[], b: T[], equal: (x: T, y: T) => boolean = (x, y) => x === y): LcsDiffFlags {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = equal(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const aChanged = new Array<boolean>(m).fill(true);
  const bChanged = new Array<boolean>(n).fill(true);
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (equal(a[i], b[j])) {
      aChanged[i] = false;
      bChanged[j] = false;
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return { aChanged, bChanged };
}

/** Token-level LCS diff between an old and new line. Returns both sides as
 * ordered segment runs, each flagged `changed` (unmatched) or not. */
export function wordDiff(oldText: string, newText: string): WordDiffResult {
  const a = tokenizeWords(oldText);
  const b = tokenizeWords(newText);
  const { aChanged, bChanged } = lcsDiffFlags(a, b);
  return {
    oldSegments: a.map((text, i) => ({ text, changed: aChanged[i] })),
    newSegments: b.map((text, i) => ({ text, changed: bChanged[i] })),
  };
}
