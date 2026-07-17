import { useCallback } from "react";

const GRID = 16;

export function snap(v: number): number {
  return Math.round(v / GRID) * GRID;
}

export function useSnap() {
  const snapValue = useCallback((v: number) => snap(v), []);
  return { snap: snapValue, GRID };
}
