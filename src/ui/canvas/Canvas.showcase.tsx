import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas } from ".";

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  description: "An infinite pan/zoom surface with a GPU-composited grid background, used as the base layer for node graphs.",
  demos: [
    {
      name: "Empty grid",
      render: () => <Canvas className="h-[344px] w-full rounded-ui border border-border" />,
    },
  ],
};
export default entry;
