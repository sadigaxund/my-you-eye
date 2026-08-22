import type { ShowcaseEntry } from "../../../showcase/types";
import { Comparison } from ".";

function Panel({ tone, text }: { tone: "before" | "after"; text: string }) {
  return (
    <div className={tone === "before" ? "flex h-48 items-center justify-center bg-secondary/40 text-sm text-muted" : "flex h-48 items-center justify-center bg-primary/10 text-sm text-primary"}>
      {text}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Comparison",
  group: "patterns",
  description: "Before and after, either as two side-by-side columns or as an overlay wipe with a draggable divider. The divider position can be controlled, uncontrolled, or driven by a `progress` prop (0→1) so a scene can animate it without importing src/motion/.",
  demos: [
    {
      name: "Side-by-side",
      render: () => (
        <div className="max-w-xl mx-auto">
          <Comparison
            mode="side-by-side"
            beforeLabel="Before"
            afterLabel="After"
            before={<Panel tone="before" text="Old layout" />}
            after={<Panel tone="after" text="New layout" />}
          />
        </div>
      ),
    },
    {
      name: "Wipe (draggable)",
      description: "Drag the handle, or focus it and use the arrow keys.",
      render: () => (
        <div className="max-w-xl mx-auto">
          <Comparison
            mode="wipe"
            beforeLabel="Before"
            afterLabel="After"
            defaultValue={35}
            before={<Panel tone="before" text="Old layout" />}
            after={<Panel tone="after" text="New layout" />}
          />
        </div>
      ),
    },
    {
      name: "Wipe — progress-driven",
      description: "progress (0→1) locks the divider to a pure function of the prop and hides the drag handle, which is how a video scene animates the reveal.",
      render: () => (
        <div className="flex flex-col gap-4 max-w-xl mx-auto">
          <Comparison mode="wipe" progress={0.25} before={<Panel tone="before" text="Old layout" />} after={<Panel tone="after" text="New layout" />} />
          <Comparison mode="wipe" progress={0.75} before={<Panel tone="before" text="Old layout" />} after={<Panel tone="after" text="New layout" />} />
        </div>
      ),
    },
  ],
};
export default entry;
