/** Rectilinear polygon union via grid decomposition + boundary tracing. */

export interface Rect { x: number; y: number; width: number; height: number; }

function epsUnique(vals: number[]): number[] {
  return Array.from(new Set(vals)).sort((a, b) => a - b);
}

function simplifyCollinear(poly: { x: number; y: number }[]): { x: number; y: number }[] {
  const n = poly.length - 1;
  const r: { x: number; y: number }[] = [];
  for (let k = 0; k < n; k++) {
    const prev = poly[(k - 1 + n) % n];
    const curr = poly[k];
    const next = poly[(k + 1) % n];
    if (!((prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y))) r.push(curr);
  }
  r.push(r[0]);
  return r;
}

function pathD(poly: { x: number; y: number }[], radius: number): string {
  const n = poly.length - 1;
  const pts = poly.slice(0, n);
  if (radius <= 0) return "M" + pts.map((p) => `${p.x},${p.y}`).join("L") + "Z";
  let d = "";
  for (let k = 0; k < n; k++) {
    const prev = pts[(k - 1 + n) % n];
    const curr = pts[k];
    const next = pts[(k + 1) % n];
    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y);
    const rr = Math.min(radius, inLen / 2, outLen / 2);
    const inX = curr.x + ((prev.x - curr.x) * rr) / inLen;
    const inY = curr.y + ((prev.y - curr.y) * rr) / inLen;
    const outX = curr.x + ((next.x - curr.x) * rr) / outLen;
    const outY = curr.y + ((next.y - curr.y) * rr) / outLen;
    d += (k === 0 ? "M" : "L") + `${inX},${inY} Q${curr.x},${curr.y} ${outX},${outY}`;
  }
  return d + "Z";
}

export function computeMergedOutline(rects: Rect[], cornerRadius = 0): string[] {
  if (rects.length === 0) return [];
  const xs = epsUnique(rects.flatMap((r) => [r.x, r.x + r.width]));
  const ys = epsUnique(rects.flatMap((r) => [r.y, r.y + r.height]));
  const nx = xs.length - 1;
  const ny = ys.length - 1;
  if (nx <= 0 || ny <= 0) return [];

  const filled = Array.from({ length: ny }, () => new Array<boolean>(nx));
  for (let j = 0; j < ny; j++) {
    const cy = (ys[j] + ys[j + 1]) / 2;
    for (let i = 0; i < nx; i++) {
      const cx = (xs[i] + xs[i + 1]) / 2;
      let f = false;
      for (const r of rects) {
        if (cx > r.x && cx < r.x + r.width && cy > r.y && cy < r.y + r.height) { f = true; break; }
      }
      filled[j][i] = f;
    }
  }

  const inside = (ci: number, cj: number) => ci >= 0 && ci < nx && cj >= 0 && cj < ny && filled[cj][ci];

  interface Edge { x1: number; y1: number; x2: number; y2: number; }
  const edges: Edge[] = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (!filled[j][i]) continue;
      const x1 = xs[i], x2 = xs[i + 1], y1 = ys[j], y2 = ys[j + 1];
      if (!inside(i, j - 1)) edges.push({ x1, y1, x2, y2: y1 });
      if (!inside(i + 1, j)) edges.push({ x1: x2, y1, x2, y2 });
      if (!inside(i, j + 1)) edges.push({ x1: x2, y1: y2, x2: x1, y2 });
      if (!inside(i - 1, j)) edges.push({ x1, y1: y2, x2: x1, y2: y1 });
    }
  }

  const startMap = new Map<string, Edge[]>();
  for (const e of edges) {
    const k = `${e.x1},${e.y1}`;
    if (!startMap.has(k)) startMap.set(k, []);
    startMap.get(k)!.push(e);
  }

  const used = new Set<Edge>();
  const polygons: { x: number; y: number }[][] = [];
  for (const start of edges) {
    if (used.has(start)) continue;
    const poly = [{ x: start.x1, y: start.y1 }];
    let cur = start;
    used.add(cur);
    for (let g = 0; g < edges.length + 1; g++) {
      poly.push({ x: cur.x2, y: cur.y2 });
      if (cur.x2 === start.x1 && cur.y2 === start.y1) break;
      const next = (startMap.get(`${cur.x2},${cur.y2}`) || []).find((e) => !used.has(e));
      if (!next) break;
      cur = next;
      used.add(cur);
    }
    if (poly.length > 3) polygons.push(poly);
  }

  return polygons.map((p) => pathD(simplifyCollinear(p), cornerRadius));
}
