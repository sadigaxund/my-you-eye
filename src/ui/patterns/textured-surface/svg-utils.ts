export interface PaperState {
  freq: number; octaves: number; stretch: number; tile: number; opacity: number;
}
export interface FrostedBlurState {
  freq: number; octaves: number; stretch: number; tile: number; opacity: number;
}
export interface FrostedGradState {
  feather: number; blobOpacity: number; tile: number; opacity: number;
}
export interface MetallicState {
  freqX: number; freqY: number; angle: number; octaves: number; stretch: number; tile: number; opacity: number;
}

export type TextureKey = "paper-grain" | "frosted-glass" | "brushed-aluminium";
export type SubMode = "blur" | "gradient";

export const DEFAULT_PAPER: PaperState = { freq: 0.35, octaves: 3, stretch: 2.6, tile: 200, opacity: 0.18 };
export const DEFAULT_FROSTED_BLUR: FrostedBlurState = { freq: 0.01, octaves: 2, stretch: 2.2, tile: 300, opacity: 0.30 };
export const DEFAULT_FROSTED_GRAD: FrostedGradState = { feather: 55, blobOpacity: 0.8, tile: 280, opacity: 0.30 };
export const DEFAULT_METALLIC: MetallicState = { freqX: 0.6, freqY: 0.01, angle: 0, octaves: 4, stretch: 2.6, tile: 200, opacity: 0.22 };

export function dataUri(svg: string): string {
  return `data:image/svg+xml,${encodeSvg(svg)}`;
}

function encodeSvg(svg: string): string {
  return svg.trim().replace(/\s+/g, " ")
    .replace(/"/g, "'").replace(/%/g, "%25")
    .replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E");
}

function offset(stretch: number): string {
  return (0.5 * (1 - stretch)).toFixed(3);
}

export function paperSvg(s: PaperState): string {
  const o = offset(s.stretch);
  return `<svg viewBox='0 0 ${s.tile} ${s.tile}' xmlns='http://www.w3.org/2000/svg'>
<filter id='p' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${s.freq}' numOctaves='${s.octaves}' stitchTiles='stitch' x='0' y='0' width='100%' height='100%' result='noise'/>
<feColorMatrix in='noise' type='matrix' values='${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} 1 0 0 0 0'/>
</filter>
<rect width='100%' height='100%' filter='url(#p)'/>
</svg>`.trim();
}

export function metallicSvg(s: MetallicState): string {
  const o = offset(s.stretch);
  const cx = s.tile / 2, cy = s.tile / 2;
  return `<svg viewBox='0 0 ${s.tile} ${s.tile}' xmlns='http://www.w3.org/2000/svg'>
<filter id='m' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${s.freqX} ${s.freqY}' numOctaves='${s.octaves}' stitchTiles='stitch' x='0' y='0' width='${s.tile}' height='${s.tile}' result='noise'/>
<feColorMatrix in='noise' type='matrix' values='${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} 1 0 0 0 0'/>
</filter>
<g transform='rotate(${s.angle} ${cx} ${cy})'>
<rect x='-50%' y='-50%' width='200%' height='200%' filter='url(#m)'/>
</g>
</svg>`.trim();
}

export function frostedBlurSvg(s: FrostedBlurState): string {
  const o = offset(s.stretch);
  return `<svg viewBox='0 0 ${s.tile} ${s.tile}' xmlns='http://www.w3.org/2000/svg'>
<filter id='f' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${s.freq}' numOctaves='${s.octaves}' stitchTiles='stitch' x='0' y='0' width='${s.tile}' height='${s.tile}'/>
<feColorMatrix type='matrix' values='${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} 1 0 0 0 0'/>
</filter>
<rect width='100%' height='100%' filter='url(#f)'/>
</svg>`.trim();
}

interface BlobSpec {
  id: string;
  cx: number; cy: number; r: number;
  color: string;
  stops: Array<{ offset: number; opacity: number }>;
}

const WRAP_OFFSETS = [-1, 0, 1];

function wrappedBlobDefs(b: BlobSpec, t: number): string {
  const stopsMarkup = b.stops
    .map(s => `<stop offset='${s.offset}%' stop-color='${b.color}' stop-opacity='${s.opacity}'/>`)
    .join("");
  const base = `<radialGradient id='${b.id}-base' gradientUnits='userSpaceOnUse'
    cx='${b.cx * t}' cy='${b.cy * t}' r='${b.r * t}'>${stopsMarkup}</radialGradient>`;
  const shifted = WRAP_OFFSETS.flatMap(ox => WRAP_OFFSETS.map(oy =>
    ox === 0 && oy === 0 ? "" :
      `<radialGradient id='${b.id}-${ox}-${oy}' href='#${b.id}-base'
        gradientTransform='translate(${ox * t} ${oy * t})'/>`
  )).join("");
  return base + shifted;
}

function wrappedBlobRects(id: string, t: number): string {
  return WRAP_OFFSETS.flatMap(ox => WRAP_OFFSETS.map(oy => {
    const gid = ox === 0 && oy === 0 ? `${id}-base` : `${id}-${ox}-${oy}`;
    return `<rect width='${t}' height='${t}' fill='url(#${gid})'/>`;
  })).join("");
}

export function frostedGradSvg(s: FrostedGradState): string {
  const f = s.feather, op = s.blobOpacity, t = s.tile;
  const blobs: BlobSpec[] = [
    { id: "g1", cx: 0.28, cy: 0.24, r: 0.55, color: "white",
      stops: [{ offset: 0, opacity: op }, { offset: f, opacity: +(op * 0.4).toFixed(2) }, { offset: 100, opacity: 0 }] },
    { id: "g2", cx: 0.78, cy: 0.68, r: 0.60, color: "black",
      stops: [{ offset: 0, opacity: op }, { offset: f, opacity: +(op * 0.4).toFixed(2) }, { offset: 100, opacity: 0 }] },
    { id: "g3", cx: 0.65, cy: 0.15, r: 0.40, color: "white",
      stops: [{ offset: 0, opacity: +(op * 0.7).toFixed(2) }, { offset: 100, opacity: 0 }] },
    { id: "g4", cx: 0.15, cy: 0.80, r: 0.45, color: "black",
      stops: [{ offset: 0, opacity: +(op * 0.7).toFixed(2) }, { offset: 100, opacity: 0 }] },
  ];
  return `<svg viewBox='0 0 ${t} ${t}' xmlns='http://www.w3.org/2000/svg'>
<defs>${blobs.map(b => wrappedBlobDefs(b, t)).join("")}</defs>
${blobs.map(b => wrappedBlobRects(b.id, t)).join("")}
</svg>`.trim();
}

/* ---- Element-sized (non-tiling) generators ---- */

export function fullFrostedSvg(s: FrostedBlurState): string {
  const o = offset(s.stretch);
  return `<svg viewBox='0 0 ${s.tile} ${s.tile}' xmlns='http://www.w3.org/2000/svg'>
<filter id='ff' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${s.freq}' numOctaves='${s.octaves}'/>
<feColorMatrix type='matrix' values='${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} 1 0 0 0 0'/>
</filter>
<rect width='100%' height='100%' filter='url(#ff)'/>
</svg>`.trim();
}

export function fullMetallicNoiseSvg(s: MetallicState): string {
  const o = offset(s.stretch);
  return `<svg viewBox='0 0 ${s.tile} ${s.tile}' xmlns='http://www.w3.org/2000/svg'>
<filter id='fm' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${s.freqX} ${s.freqY}' numOctaves='${s.octaves}'/>
<feColorMatrix type='matrix' values='${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} 1 0 0 0 0'/>
</filter>
<rect width='100%' height='100%' filter='url(#fm)'/>
</svg>`.trim();
}

/* Tileable anisotropic noise at 0° — for CSS-rotated tiling. Identical
   to fullMetallicNoiseSvg but with stitchTiles for seamless repeat. */
export function tileableMetallicSvg(s: MetallicState): string {
  const o = offset(s.stretch);
  return `<svg viewBox='0 0 ${s.tile} ${s.tile}' xmlns='http://www.w3.org/2000/svg'>
<filter id='tm' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${s.freqX} ${s.freqY}' numOctaves='${s.octaves}' stitchTiles='stitch'/>
<feColorMatrix type='matrix' values='${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} ${s.stretch} 0 0 0 ${o} 1 0 0 0 0'/>
</filter>
<rect width='100%' height='100%' filter='url(#tm)'/>
</svg>`.trim();
}

export function ditherSvg(): string {
  return `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'>
<filter id='d'>
<feTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='1'/>
</filter>
<rect width='100%' height='100%' filter='url(#d)'/>
</svg>`.trim();
}
