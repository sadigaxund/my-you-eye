import type { ShowcaseEntry } from "../../showcase/types";
import { Button } from ".";

const entry: ShowcaseEntry = {
  title: "Button",
  group: "inputs",
  description: "A clickable action trigger with primary, secondary, ghost, and danger variants, three sizes, and loading/disabled states.",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
    },
    {
      name: "Icon-only (compact)",
      description: "size=\"icon-sm\" suits dense inline contexts, such as a table-cell audio player's play/pause toggle, where the text-sized buttons pad too widely around a single glyph. size=\"xs\" is the micro tier (20px) for sidebar-header icon rows.",
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="icon-sm" aria-label="Play">
            <svg viewBox="0 0 10 10" className="size-3 fill-current"><path d="M2 1l7 4-7 4V1z" /></svg>
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label="Pause">
            <svg viewBox="0 0 10 10" className="size-3 fill-current"><rect x="1" y="1" width="3" height="8" rx="0.5" /><rect x="6" y="1" width="3" height="8" rx="0.5" /></svg>
          </Button>
          <Button variant="ghost" size="xs" aria-label="New file">
            <svg viewBox="0 0 12 12" className="size-2.5 fill-none stroke-current"><path d="M6 2v8M2 6h8" /></svg>
          </Button>
          <Button variant="ghost" size="xs" aria-label="Refresh">
            <svg viewBox="0 0 12 12" className="size-2.5 fill-none stroke-current"><path d="M10 6a4 4 0 11-1.2-2.8M10 1v2.5H7.5" /></svg>
          </Button>
        </div>
      ),
    },
    {
      name: "Disabled & loading",
      render: () => (
        <div className="flex flex-wrap justify-center gap-3">
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button variant="danger" loading>
            Deleting
          </Button>
        </div>
      ),
    },
  ],
};
export default entry;
