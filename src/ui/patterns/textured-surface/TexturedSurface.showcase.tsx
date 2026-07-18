import type { ShowcaseEntry } from "../../../showcase/types";
import { TexturedSurface } from ".";
import { Badge } from "../../badge";

const TEXTURES = ["paper", "frosted", "metallic"] as const;
const STRENGTHS = ["subtle", "medium", "strong"] as const;

const entry: ShowcaseEntry = {
  title: "TexturedSurface",
  group: "patterns",
  demos: [
    {
      name: "Theme-driven (default)",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface variant="surface" className="p-4">
            <p className="text-fg">Surface — texture driven by the active theme's tokens</p>
          </TexturedSurface>
          <TexturedSurface variant="elevated" className="p-4">
            <p className="text-fg">Elevated — same texture with shadow</p>
          </TexturedSurface>
        </div>
      ),
    },
    {
      name: "Texture × Strength matrix",
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
      name: "Custom colors + paper texture",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface texture="paper" strength="subtle" color="--color-bg" className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-1 h-10 rounded-full bg-primary shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-fg">Note card</span>
                </div>
                <p className="text-sm text-fg">Paper grain adds a tactile feel to backgrounds</p>
                <p className="text-xs text-muted mt-1">Subtle texture, visible on close inspection</p>
              </div>
            </div>
          </TexturedSurface>
          <TexturedSurface texture="metallic" strength="medium" color="--color-surface" variant="elevated" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-fg">Brushed metal</span>
              <div className="size-1.5 rounded-full bg-fg/30" />
            </div>
            <p className="text-sm text-fg">Directional streaks on a neutral surface</p>
            <p className="text-xs text-muted mt-1">Anistropic noise reads as brushed aluminum</p>
          </TexturedSurface>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)' }} className="relative min-h-[200px] rounded-ui overflow-hidden">
            <div className="p-4 h-full min-h-[200px] flex items-end">
              <div className="w-full">
                <TexturedSurface texture="frosted" strength="subtle" color="--color-surface-elevated" variant="elevated" className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-xs font-medium text-fg">Frosted glass</span>
                  </div>
                  <p className="text-sm text-fg">Etched haze over a vibrant backdrop</p>
                  <p className="text-xs text-muted mt-1">Switch to the Glass theme for the full translucency</p>
                </TexturedSurface>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Radii",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface radius="sm" className="p-4">Small radius</TexturedSurface>
          <TexturedSurface radius="default" className="p-4">Default radius</TexturedSurface>
          <TexturedSurface radius="lg" className="p-4">Large radius</TexturedSurface>
        </div>
      ),
    },
  ],
};
export default entry;
