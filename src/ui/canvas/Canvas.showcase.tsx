import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas } from ".";

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "display",
  demos: [
    {
      name: "Dot grid",
      render: () => (
        <Canvas className="h-48 w-full rounded-ui border border-border" />
      ),
    },
  ],
};
export default entry;
