import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { SidebarContainer } from ".";

function ShellDemo() {
  const [width, setWidth] = useState(224);
  const [collapsed, setCollapsed] = useState(false);
  const files = [
    "architecture.md",
    "getting-started.md",
    "theming.md",
    "motion.md",
    "scenes.md",
  ];

  return (
    <div className="mx-auto flex h-72 max-w-2xl overflow-hidden rounded-ui border border-border">
      <SidebarContainer
        label="Explorer"
        width={width}
        onWidthChange={setWidth}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        headerActions={
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((c) => !c)}
            className="flex size-6 cursor-pointer items-center justify-center rounded-ui-sm text-muted hover:bg-sidebar-item-hover hover:text-fg"
          >
            {collapsed ? "»" : "«"}
          </button>
        }
      >
        <ul className="list-none p-1 text-sm">
          {files.map((name) => (
            <li key={name}>
              <span className="block truncate rounded-ui-sm px-2 py-1 font-mono hover:bg-sidebar-item-hover">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </SidebarContainer>
      <div className="flex min-w-0 flex-1 items-center justify-center bg-surface text-xs text-muted">
        Editor surface — drag the edge, or collapse past the threshold
      </div>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "SidebarContainer",
  group: "patterns",
  description:
    "Persistent collapsible/resizable side-panel region — a layout region, not Drawer's transient overlay. The grab edge stays mounted while collapsed and restores by dragging out.",
  demos: [
    {
      name: "Width + collapse are the region's",
      description:
        "Controlled width/collapsed pair: views mounted into the shell share one persisted state instead of each snapping back to defaults.",
      render: () => <ShellDemo />,
    },
  ],
};
export default entry;
