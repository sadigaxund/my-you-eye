import { Fragment } from "react";
import { TexturedSurface, type TexturedSurfaceProps } from "./TexturedSurface";
import { type TextureLayer, type TextureStrength } from "./svg-utils";

const LAYERS: TextureLayer[] = ["page", "surface", "foreground"];
const STRENGTHS: TextureStrength[] = ["subtle", "medium", "strong"];

const LAYER_LABELS: Record<TextureLayer, string> = {
  page: "Page",
  surface: "Surface",
  foreground: "Foreground",
};

export interface ParamTableProps {
  texture?: TexturedSurfaceProps["texture"];
}

export function ParamTable({ texture = "paper-grain" }: ParamTableProps) {
  return (
    <div className="w-full grid grid-cols-[4rem_repeat(3,1fr)] gap-1 items-center">
      <div />
      {STRENGTHS.map((s) => (
        <div key={s} className="text-center text-xs font-medium text-muted">
          {s}
        </div>
      ))}
      {LAYERS.map((layer) => (
        <Fragment key={layer}>
          <div className="text-xs font-medium text-muted self-center">
            {LAYER_LABELS[layer]}
          </div>
          {STRENGTHS.map((strength) => (
            <TexturedSurface
              key={strength}
              texture={texture}
              layer={layer}
              strength={strength}
              className="aspect-square min-h-20 rounded-ui"
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
