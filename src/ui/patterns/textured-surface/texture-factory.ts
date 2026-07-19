import type { CSSProperties } from "react";
import type {
  PaperState, FrostedBlurState, FrostedGradState, MetallicState,
} from "./svg-utils";
import {
  paperSvg, metallicSvg, frostedBlurSvg, frostedGradSvg,
  tileableMetallicSvg, dataUri, genFrostedTile,
} from "./svg-utils";

export interface LayerStyle {
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
  opacity: number;
  mixBlendMode: CSSProperties["mixBlendMode"];
}

export abstract class Texture {
  abstract readonly tile: number;
  abstract style(layerOpacity: number): LayerStyle;
  abstract codeStyle(layerOpacity: number): string;
  abstract uri: string;
  abstract label: string;

  protected makeStyle(svg: string, tile: number, opacity: number): LayerStyle {
    return {
      backgroundImage: `url("${dataUri(svg)}")`,
      backgroundSize: `${tile}px`,
      backgroundRepeat: "repeat",
      opacity,
      mixBlendMode: "hard-light",
    };
  }
}

export class PaperGrain extends Texture {
  readonly tile: number;
  readonly uri: string;
  readonly label = "Paper Grain";
  private svg: string;
  private p: PaperState;

  constructor(p: PaperState) {
    super();
    this.p = p;
    this.tile = p.tile;
    this.svg = paperSvg(p);
    this.uri = dataUri(this.svg);
  }

  style(opacity: number): LayerStyle {
    return this.makeStyle(this.svg, this.tile, opacity);
  }

  codeStyle(opacity: number): string {
    const json = JSON.stringify({ freq: this.p.freq, octaves: this.p.octaves, stretch: this.p.stretch, tile: this.tile });
    return `new PaperGrain(${json}).style(${opacity})`;
  }
}

export class BrushedAluminium extends Texture {
  readonly tile: number;
  readonly uri: string;
  readonly label = "Brushed Aluminium";
  readonly angle: number;
  private svg: string;
  private m: MetallicState;
  private rotated: boolean;

  constructor(m: MetallicState) {
    super();
    this.m = m;
    this.tile = m.tile;
    this.angle = m.angle;
    this.rotated = m.angle > 0.5;
    this.svg = this.rotated ? tileableMetallicSvg(m) : metallicSvg(m);
    this.uri = dataUri(this.svg);
  }

  style(opacity: number): LayerStyle {
    if (this.rotated) {
      return {
        backgroundImage: `url("${this.uri}")`,
        backgroundSize: `${this.tile}px`,
        backgroundRepeat: "repeat",
        opacity,
        mixBlendMode: "hard-light",
      };
    }
    return this.makeStyle(this.svg, this.tile, opacity);
  }

  codeStyle(opacity: number): string {
    const json = JSON.stringify({
      freqX: this.m.freqX, freqY: this.m.freqY, angle: this.m.angle,
      octaves: this.m.octaves, stretch: this.m.stretch, tile: this.tile,
    });
    return `new BrushedAluminium(${json}).style(${opacity})`;
  }
}

export class FrostedGlassNoise extends Texture {
  readonly tile: number;
  readonly displayTile: number;
  readonly uri: string;
  readonly label = "Frosted Glass (Noise)";
  private svg: string;
  private p: FrostedBlurState;

  constructor(p: FrostedBlurState) {
    super();
    this.p = p;
    this.tile = genFrostedTile(p.tile, p.freq);
    this.svg = frostedBlurSvg(p);
    this.uri = dataUri(this.svg);
  }

  style(opacity: number): LayerStyle {
    return this.makeStyle(this.svg, this.tile, opacity);
  }

  codeStyle(opacity: number): string {
    const json = JSON.stringify({ freq: this.p.freq, octaves: this.p.octaves, stretch: this.p.stretch, tile: this.tile });
    return `new FrostedGlassNoise(${json}).style(${opacity})`;
  }
}

export class FrostedGlassGradient extends Texture {
  readonly tile: number;
  readonly uri: string;
  readonly label = "Frosted Glass (Gradient)";
  private svg: string;
  private s: FrostedGradState;

  constructor(s: FrostedGradState) {
    super();
    this.s = s;
    this.tile = s.tile;
    this.svg = frostedGradSvg(s);
    this.uri = dataUri(this.svg);
  }

  style(opacity: number): LayerStyle {
    return this.makeStyle(this.svg, this.tile, opacity);
  }

  codeStyle(opacity: number): string {
    const json = JSON.stringify({ feather: this.s.feather, blobOpacity: this.s.blobOpacity, tile: this.tile });
    return `new FrostedGlassGradient(${json}).style(${opacity})`;
  }
}
