export interface PaperState {
  freq: number; octaves: number; stretch: number; tile: number; opacity: number;
}
export interface FrostedBlurState {
  freq: number; octaves: number; stretch: number; tile: number; opacity: number; seed?: number;
}
export interface MetallicState {
  freqX: number; freqY: number; angle: number; octaves: number; stretch: number; tile: number; opacity: number;
}

export type TextureKey = "paper-grain" | "frosted-glass" | "brushed-aluminium";

export const DEFAULT_PAPER: PaperState = { freq: 0.35, octaves: 3, stretch: 2.6, tile: 200, opacity: 0.18 };
export const DEFAULT_FROSTED_BLUR: FrostedBlurState = { freq: 0.01, octaves: 2, stretch: 2.2, tile: 300, opacity: 0.30 };
export const DEFAULT_METALLIC: MetallicState = { freqX: 0.6, freqY: 0.01, angle: 0, octaves: 4, stretch: 2.6, tile: 200, opacity: 0.22 };

export const MIN_FROSTED_CYCLES = 10;

export function genFrostedTile(tile: number, freq: number): number {
  return Math.max(tile, Math.ceil(MIN_FROSTED_CYCLES / freq));
}

export function dataUri(svg: string): string {
  return `data:image/svg+xml,${svg.trim().replace(/\s+/g, " ").replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E")}`;
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

function frostedSvgBody(fid: string, s: FrostedBlurState): string {
  const o = offset(s.stretch);
  const row = `${s.stretch} 0 0 0 ${o}`;
  const fineFreq = s.freq * 3;
  const seedAttr = s.seed != null ? ` seed='${s.seed}'` : "";
  const gt = genFrostedTile(s.tile, s.freq);
  return `<svg viewBox='0 0 ${gt} ${gt}' xmlns='http://www.w3.org/2000/svg'>
<filter id='${fid}' x='0' y='0' width='${gt}' height='${gt}' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${s.freq}' numOctaves='${s.octaves}' stitchTiles='stitch' x='0' y='0' width='${gt}' height='${gt}' result='cRaw'${seedAttr}/>
<feTurbulence type='fractalNoise' baseFrequency='${fineFreq}' numOctaves='2' stitchTiles='stitch' x='0' y='0' width='${gt}' height='${gt}' result='fRaw'${seedAttr}/>
<feComposite in='cRaw' in2='fRaw' operator='arithmetic' k1='0' k2='0.5' k3='0.5' k4='0' x='0' y='0' width='${gt}' height='${gt}' result='mixedRaw'/>
<feColorMatrix in='mixedRaw' type='matrix' values='${row} ${row} ${row} 1 0 0 0 0' x='0' y='0' width='${gt}' height='${gt}'/>
</filter>
<rect width='100%' height='100%' filter='url(#${fid})'/>
</svg>`.trim();
}

export function frostedBlurSvg(s: FrostedBlurState): string {
  return frostedSvgBody("f", s);
}

/* ---- Element-sized (non-tiling) generators ---- */

export function fullFrostedSvg(s: FrostedBlurState): string {
  return frostedSvgBody("ff", s);
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

/* ---- Per-layer × strength noise presets ---- */
/* Each (layer, strength) pair gets distinct SVG parameters so every
   combination has a qualitatively different texture, not just scaled
   opacity. See AGENTS.md §1 decision tree. */

export type TextureStrength = "subtle" | "medium" | "strong";

interface LayerSvgAssets {
  primary: string;
  secondary: string;
  tileSize: number;
}

type StrengthMap = Record<TextureStrength, LayerSvgAssets>;
type LayerMap = Record<string, StrengthMap>;

function pAssets(freq: number, octaves: number, stretch: number, tile: number, secTile: number): LayerSvgAssets {
  return {
    primary: dataUri(paperSvg({ freq, octaves, stretch, tile, opacity: 0 })),
    secondary: dataUri(paperSvg({ freq, octaves, stretch, tile: secTile, opacity: 0 })),
    tileSize: tile,
  };
}

function mAssets(freqX: number, freqY: number, octaves: number, stretch: number, tile: number, secTile: number): LayerSvgAssets {
  return {
    primary: dataUri(metallicSvg({ freqX, freqY, angle: 0, octaves, stretch, tile, opacity: 0 })),
    secondary: dataUri(metallicSvg({ freqX, freqY, angle: 0, octaves, stretch, tile: secTile, opacity: 0 })),
    tileSize: tile,
  };
}

function fAssets(freq: number, octaves: number, stretch: number, tile: number, secTile: number): LayerSvgAssets {
  const genTile = genFrostedTile(tile, freq);
  const genSecTile = genFrostedTile(secTile, freq);
  return {
    primary: dataUri(fullFrostedSvg({ freq, octaves, stretch, tile: genTile, opacity: 0 })),
    secondary: dataUri(fullFrostedSvg({ freq, octaves, stretch, tile: genSecTile, opacity: 0 })),
    tileSize: genTile,
  };
}

/** Pre-generated page.medium paper-grain SVG data URI — single source of truth
    for the page-level texture. Themes that want a page texture should reference
    this via JS rather than hardcoding SVG strings in CSS. */
export const PAGE_MEDIUM_URI = pAssets(0.12, 3, 2.4, 170, 111).primary;

/** Pre-generated page.medium frosted-glass SVG data URI — tileable low-frequency
    noise for a subtle frosted page overlay. Used by the glass theme.
    Comma-separated list of 3 URIs at different seeds for layered page overlay.
    Use `background-image: var(--texture-paper)` with 3-entry
    `background-size` and `background-position`. */
export const PAGE_MEDIUM_FROSTED_LAYERS = [1, 7, 13]
  .map(s => `url("${dataUri(frostedBlurSvg({ freq: 0.003, octaves: 2, stretch: 2.6, tile: 3334, opacity: 0, seed: s }))}")`)
  .join(", ");

const layerPaper: LayerMap = {
  page: {
    subtle:  pAssets(0.16, 4, 2.0, 140, 91),
    medium:  pAssets(0.12, 3, 2.4, 170, 111),
    strong:  pAssets(0.09, 3, 2.8, 200, 130),
  },
  surface: {
    subtle:  pAssets(0.16, 4, 1.8, 110, 72),
    medium:  pAssets(0.14, 3, 2.0, 130, 85),
    strong:  pAssets(0.11, 3, 2.2, 150, 98),
  },
  foreground: {
    subtle:  pAssets(0.24, 5, 1.4, 65, 42),
    medium:  pAssets(0.20, 4, 1.5, 80, 52),
    strong:  pAssets(0.18, 4, 1.6, 100, 65),
  },
};

const layerMetallic: LayerMap = {
  page: {
    subtle:  mAssets(0.50, 0.010, 3, 2.4, 220, 143),
    medium:  mAssets(0.60, 0.010, 4, 2.6, 200, 127),
    strong:  mAssets(0.40, 0.008, 3, 3.0, 300, 195),
  },
  surface: {
    subtle:  mAssets(0.70, 0.015, 4, 2.2, 160, 104),
    medium:  mAssets(0.60, 0.010, 4, 2.6, 200, 127),
    strong:  mAssets(0.50, 0.010, 3, 3.0, 250, 163),
  },
  foreground: {
    subtle:  mAssets(0.90, 0.025, 5, 1.8, 100, 65),
    medium:  mAssets(0.80, 0.020, 5, 2.0, 120, 78),
    strong:  mAssets(0.70, 0.015, 4, 2.4, 140, 91),
  },
};

export const FROSTED_DITHER = dataUri(ditherSvg());

const layerFrosted: LayerMap = {
  page: {
    subtle:  fAssets(0.005, 2, 2.4, 2000, 1300),
    medium:  fAssets(0.003, 2, 2.6, 3334, 2167),
    strong:  fAssets(0.002, 2, 3.0, 5000, 3250),
  },
  surface: {
    subtle:  fAssets(0.015, 2, 2.0, 667, 434),
    medium:  fAssets(0.010, 2, 2.2, 1000, 650),
    strong:  fAssets(0.008, 2, 2.4, 1250, 813),
  },
  foreground: {
    subtle:  fAssets(0.040, 3, 1.6, 250, 163),
    medium:  fAssets(0.030, 3, 1.8, 334, 217),
    strong:  fAssets(0.020, 3, 2.0, 500, 325),
  },
};

export type TextureLayer = keyof typeof layerPaper;

export type TextureLayerStrengthMap = Record<string, Record<string, LayerSvgAssets>>;

export const LAYER_SVGS: Record<string, TextureLayerStrengthMap> = {
  "paper-grain": layerPaper,
  "brushed-aluminium": layerMetallic,
  "frosted-glass": layerFrosted,
} as const;
