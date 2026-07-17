import { useCallback } from "react";
import { GRID, snap as gridSnap } from "../graph-node/grid";

export function snap(v: number): number {
  return gridSnap(v);
}

export function useSnap() {
  const snapValue = useCallback((v: number) => snap(v), []);
  return { snap: snapValue, GRID };
}
