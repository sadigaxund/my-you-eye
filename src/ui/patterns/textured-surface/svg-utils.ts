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

export type TextureKey = "paper" | "frosted" | "metallic";
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

export function frostedGradSvg(s: FrostedGradState): string {
  const f = s.feather, op = s.blobOpacity, t = s.tile;
  return `<svg viewBox='0 0 ${t} ${t}' xmlns='http://www.w3.org/2000/svg'>
<defs>
<radialGradient id='g1' cx='28%' cy='24%' r='55%'>
<stop offset='0%' stop-color='white' stop-opacity='${op}'/>
<stop offset='${f}%' stop-color='white' stop-opacity='${(op * 0.4).toFixed(2)}'/>
<stop offset='100%' stop-color='white' stop-opacity='0'/>
</radialGradient>
<radialGradient id='g2' cx='78%' cy='68%' r='60%'>
<stop offset='0%' stop-color='black' stop-opacity='${op}'/>
<stop offset='${f}%' stop-color='black' stop-opacity='${(op * 0.4).toFixed(2)}'/>
<stop offset='100%' stop-color='black' stop-opacity='0'/>
</radialGradient>
<radialGradient id='g3' cx='65%' cy='15%' r='40%'>
<stop offset='0%' stop-color='white' stop-opacity='${(op * 0.7).toFixed(2)}'/>
<stop offset='100%' stop-color='white' stop-opacity='0'/>
</radialGradient>
<radialGradient id='g4' cx='15%' cy='80%' r='45%'>
<stop offset='0%' stop-color='black' stop-opacity='${(op * 0.7).toFixed(2)}'/>
<stop offset='100%' stop-color='black' stop-opacity='0'/>
</radialGradient>
</defs>
<rect width='100%' height='100%' fill='url(#g1)'/>
<rect width='100%' height='100%' fill='url(#g2)'/>
<rect width='100%' height='100%' fill='url(#g3)'/>
<rect width='100%' height='100%' fill='url(#g4)'/>
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
