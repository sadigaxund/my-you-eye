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
          <TexturedSurface texture="paper" strength="medium" color="--color-bg" className="p-4">
            <p>Background with paper grain</p>
          </TexturedSurface>
          <TexturedSurface texture="paper" strength="medium" color="--color-primary" className="p-4">
            <p className="text-primary-fg">Primary surface with paper grain</p>
          </TexturedSurface>
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
