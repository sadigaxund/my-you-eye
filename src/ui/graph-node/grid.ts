export const GRID = 16;
export const HEADER = 2;
export const ROW = 2;
export const FOOTER = 1;

// `headerCells`/`footerCells` default to the fixed HEADER/FOOTER constants
// — every call site that doesn't pass them gets byte-identical output to
// before these params existed. A header/footer *variant* that genuinely
// needs a taller band (e.g. GraphNode's `subtitle`, which stacks a second
// line under the title) passes a bigger whole-cell count instead of the
// component inventing its own pixel value — the grid formula stays the
// single source of truth (AGENTS.md §7) even when a node's header isn't
// exactly 2 cells.
export function nodeHeightCells(rowCount: number, hasFooter: boolean, headerCells: number = HEADER, footerCells: number = FOOTER): number {
  return headerCells + rowCount * ROW + (hasFooter ? footerCells : 0);
}

export function nodeHeightPx(rowCount: number, hasFooter: boolean, headerCells: number = HEADER, footerCells: number = FOOTER): number {
  return nodeHeightCells(rowCount, hasFooter, headerCells, footerCells) * GRID;
}

/** Row `i`'s vertical center, in px from the node's top. Only depends on
 * the header's cell count — rows always start immediately after the
 * header regardless of footer height. `ROW` is even, so `ROW / 2` is a
 * whole cell: every port center lands on a grid line as long as
 * `headerCells` itself is a whole number (AGENTS.md §7's port formula). */
export function portY(rowIndex: number, headerCells: number = HEADER): number {
  return (headerCells + rowIndex * ROW + ROW / 2) * GRID;
}

export function snap(v: number): number {
  return Math.round(v / GRID) * GRID;
}
