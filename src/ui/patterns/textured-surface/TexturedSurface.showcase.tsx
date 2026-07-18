import type { ShowcaseEntry } from "../../../showcase/types";
import { TexturedSurface } from ".";

const entry: ShowcaseEntry = {
  title: "TexturedSurface",
  group: "patterns",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface variant="surface" className="p-4">
            <p className="text-fg">Surface — paper grain over surface color (multiply)</p>
          </TexturedSurface>
          <TexturedSurface variant="elevated" className="p-4">
            <p className="text-fg">Elevated — same texture with shadow</p>
          </TexturedSurface>
        </div>
      ),
    },
    {
      name: "Custom colors",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface color="--color-bg" className="p-4">
            <p>Background color surface</p>
          </TexturedSurface>
          <TexturedSurface color="--color-primary" className="p-4">
            <p className="text-primary-fg">Primary color surface</p>
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
