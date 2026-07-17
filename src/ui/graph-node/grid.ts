export const GRID = 16;
export const HEADER = 2;
export const ROW = 2;
export const FOOTER = 1;

export function nodeHeightCells(rowCount: number, hasFooter: boolean): number {
  return HEADER + rowCount * ROW + (hasFooter ? FOOTER : 0);
}

export function nodeHeightPx(rowCount: number, hasFooter: boolean): number {
  return nodeHeightCells(rowCount, hasFooter) * GRID;
}

export function portY(rowIndex: number): number {
  return (HEADER + rowIndex * ROW + ROW / 2) * GRID;
}

export function snap(v: number): number {
  return Math.round(v / GRID) * GRID;
}
