import type { ShowcaseEntry } from "../../showcase/types";
import { Input } from ".";
import { Kbd } from "../kbd";

const entry: ShowcaseEntry = {
  title: "Input",
  group: "inputs",
  description: "A single-line text field with default and filled variants, two sizes, an invalid state for validation errors, and leading/trailing slots.",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Input placeholder="Default variant" />
          <Input variant="filled" placeholder="Filled variant" />
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
        </div>
      ),
    },
    {
      name: "Leading & trailing",
      description:
        "Slots ride inside the field's edges — a shortcut hint on a search field is the classic use.",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Input
            leading={
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 text-muted fill-none stroke-current" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
            }
            trailing={<Kbd>⌘K</Kbd>}
            placeholder="Search files"
            aria-label="Search files"
          />
          <Input size="sm" trailing={<span className="text-xs text-muted">px</span>} placeholder="Border width" aria-label="Border width in pixels" />
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Input disabled value="Disabled" />
          <Input invalid placeholder="Invalid state" />
        </div>
      ),
    },
  ],
};
export default entry;
