import type { ShowcaseEntry } from "../../../showcase/types";
import { TexturedSurface } from ".";
import { Badge } from "../../badge";
import { Tuner } from "./Tuner";

const TEXTURES = ["paper", "frosted", "metallic"] as const;
const STRENGTHS = ["subtle", "medium", "strong"] as const;

const entry: ShowcaseEntry = {
  title: "TexturedSurface",
  group: "patterns",
  demos: [
    {
      name: "Tuner",
      render: () => <Tuner />,
    },
    {
      name: "Material × Strength",
      render: () => (
        <div className="flex flex-col gap-6">
          {TEXTURES.map((tex) => (
            <div key={tex}>
              <h4 className="text-sm font-medium text-fg capitalize mb-2">{tex}</h4>
              <div className="flex gap-3">
                {STRENGTHS.map((s) => (
                  <div key={s} className="flex-1">
                    <TexturedSurface texture={tex} strength={s} className="p-3 h-24 flex flex-col items-center justify-center">
                      <Badge variant="neutral" style="soft">{s}</Badge>
                    </TexturedSurface>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Applied",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface texture="paper" strength="medium" className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-1 h-10 rounded-full bg-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-fg">Note card</p>
                <p className="text-xs text-muted mt-1">Paper grain adds tactile warmth to content surfaces.</p>
              </div>
            </div>
          </TexturedSurface>
          <TexturedSurface texture="metallic" strength="subtle" color="--color-surface-elevated" variant="elevated" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-2 rounded-full bg-fg/40" />
              <span className="text-xs font-medium text-fg">Brushed metal panel</span>
            </div>
            <p className="text-sm text-fg">Directional streaks read as brushed aluminum.</p>
          </TexturedSurface>
          <div className="relative rounded-ui overflow-hidden bg-secondary">
            <TexturedSurface texture="frosted" strength="medium" color="--color-surface-elevated" variant="elevated" className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-fg">Frosted glass</span>
              </div>
              <p className="text-sm text-fg">Etched haze sits above a solid secondary backdrop.</p>
              <p className="text-xs text-muted mt-1">Switch to the Glass theme for translucency.</p>
            </TexturedSurface>
          </div>
        </div>
      ),
    },
    {
      name: "Theme-driven",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface variant="surface" className="p-4">
            <p className="text-fg">Surface — texture defined by the active theme's tokens.</p>
          </TexturedSurface>
          <TexturedSurface variant="elevated" className="p-4">
            <p className="text-fg">Elevated — same texture with shadow.</p>
          </TexturedSurface>
        </div>
      ),
    },
  ],
};
export default entry;
