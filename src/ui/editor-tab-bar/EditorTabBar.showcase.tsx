import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { EditorTabBar } from ".";
import { Button } from "../button";

type Tab = { id: string; label: string; dirty?: boolean; preview?: boolean };

const initialTabs: Tab[] = [
  { id: "readme", label: "README.md", dirty: true },
  { id: "arch", label: "architecture.md" },
  { id: "notes", label: "meeting-notes.md", preview: true },
];

function TabsDemo() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeId, setActiveId] = useState("arch");

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-ui border border-sidebar-border">
      <EditorTabBar
        tabs={tabs}
        activeId={activeId}
        onSelect={setActiveId}
        onClose={(id) => {
          setTabs((prev) => {
            const next = prev.filter((t) => t.id !== id);
            if (id === activeId && next.length > 0) setActiveId(next[Math.max(0, prev.findIndex((t) => t.id === id) - 1)].id);
            return next;
          });
        }}
        onMove={(dragged, target) =>
          setTabs((prev) => {
            const from = prev.findIndex((t) => t.id === dragged);
            const to = prev.findIndex((t) => t.id === target);
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
          })
        }
        dragPayload={(tab) => ({ path: tab.label, name: tab.label })}
        actions={
          <Button variant="ghost" size="sm" aria-label="More document actions">
            …
          </Button>
        }
      />
      <div className="flex h-20 items-center justify-center bg-surface text-xs text-muted">
        {tabs.find((t) => t.id === activeId)?.label ?? "No tab open"} — drag tabs to reorder
      </div>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "EditorTabBar",
  group: "navigation",
  description:
    "Closeable, draggable document tab strip — distinct from Tabs (content-switching nav). Dirty dots sit beside the close button; preview tabs render italic.",
  demos: [
    {
      name: "Open documents",
      description:
        "Drag to reorder (payload also lands on dataTransfer as application/x-tab for pane-docking). Arrow keys move selection; Delete closes the focused tab.",
      render: () => <TabsDemo />,
    },
  ],
};
export default entry;
