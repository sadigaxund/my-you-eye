import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { SplitPane, DockOverlay, MIN_FRACTION } from ".";
import type { SplitNode } from ".";

const initialTree: SplitNode = {
  type: "branch",
  id: "root",
  direction: "row",
  sizes: [0.4, 0.6],
  children: [
    { type: "leaf", id: "left", data: { name: "explorer.md" } },
    {
      type: "branch",
      id: "right",
      direction: "column",
      sizes: [0.5, 0.5],
      children: [
        { type: "leaf", id: "top", data: { name: "editor.tsx" } },
        { type: "leaf", id: "bottom", data: { name: "terminal" } },
      ],
    },
  ],
};

function PaneFrame({ name, docked }: { name: string; docked: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-surface text-xs text-muted">
      {name}
      {docked && <DockOverlay edge="right" />}
    </div>
  );
}

function GridDemo() {
  const [tree, setTree] = useState<SplitNode>(initialTree);
  const [docked, setDocked] = useState(false);

  const resize = (branchId: string, sizes: number[]) => {
    setTree((prev) => {
      const walk = (node: SplitNode): SplitNode => {
        if (node.type === "leaf") return node;
        const nextSizes = node.id === branchId ? sizes : node.sizes;
        return { ...node, sizes: nextSizes, children: node.children.map(walk) };
      };
      return walk(prev);
    });
  };

  return (
    <div className="mx-auto h-72 max-w-2xl">
      <SplitPane
        node={tree}
        className="h-full rounded-ui border border-border"
        renderLeaf={(leaf) => (
          <PaneFrame
            name={(leaf.data as { name?: string } | undefined)?.name ?? "pane"}
            docked={docked && leaf.id === "top"}
          />
        )}
        onResize={resize}
      />
      <p className="mt-2 text-center text-xs text-muted">
        Drag dividers (min {Math.round(MIN_FRACTION * 100)}% per side) · double-click equalizes · arrows nudge, Shift+arrows more.
        {" "}
        <button type="button" className="text-primary underline" onClick={() => setDocked((d) => !d)}>
          toggle dock preview
        </button>
      </p>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "SplitPane",
  group: "patterns",
  description:
    "Recursively splittable pane grid with draggable dividers — a branch/direction/sizes tree, not a fixed split. ResizeHandle and DockOverlay export standalone for any single resizable dimension or drop-zone preview.",
  demos: [
    {
      name: "Nested grid",
      description:
        "A row branch holding a column branch. Controlled via onResize(branchId, sizes); fractions clamp at 12% per side.",
      render: () => <GridDemo />,
    },
  ],
};
export default entry;
