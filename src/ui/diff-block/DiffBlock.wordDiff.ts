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

/** Token-level LCS diff between an old and new line. Returns both sides as
 * ordered segment runs, each flagged `changed` (unmatched) or not. */
export function wordDiff(oldText: string, newText: string): WordDiffResult {
  const a = tokenizeWords(oldText);
  const b = tokenizeWords(newText);
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const oldSegments: WordDiffSegment[] = [];
  const newSegments: WordDiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      oldSegments.push({ text: a[i], changed: false });
      newSegments.push({ text: b[j], changed: false });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      oldSegments.push({ text: a[i], changed: true });
      i++;
    } else {
      newSegments.push({ text: b[j], changed: true });
      j++;
    }
  }
  while (i < m) { oldSegments.push({ text: a[i], changed: true }); i++; }
  while (j < n) { newSegments.push({ text: b[j], changed: true }); j++; }
  return { oldSegments, newSegments };
}
