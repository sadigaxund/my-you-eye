import type { ShowcaseEntry } from "../../showcase/types";
import { StatusDot } from ".";

const entry: ShowcaseEntry = {
  title: "StatusDot",
  group: "display",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-2 text-sm"><StatusDot variant="neutral" /> Neutral</span>
          <span className="flex items-center gap-2 text-sm"><StatusDot variant="success" /> Success</span>
          <span className="flex items-center gap-2 text-sm"><StatusDot variant="warning" /> Warning</span>
          <span className="flex items-center gap-2 text-sm"><StatusDot variant="danger" /> Danger</span>
          <span className="flex items-center gap-2 text-sm"><StatusDot variant="info" /> Info</span>
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-2 text-sm"><StatusDot size="sm" variant="success" /> Small</span>
          <span className="flex items-center gap-2 text-sm"><StatusDot size="md" variant="success" /> Medium</span>
        </div>
      ),
    },
    {
      name: "Pulsing",
      render: () => (
        <div className="flex justify-center"><span className="flex items-center gap-2 text-sm"><StatusDot variant="info" pulse /> Running</span></div>
      ),
    },
  ],
};
export default entry;
