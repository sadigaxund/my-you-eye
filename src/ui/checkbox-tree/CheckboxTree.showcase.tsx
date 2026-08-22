import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { CheckboxTree } from ".";
import type { CheckboxTreeNode } from ".";

const docs = [
  {
    id: "docs/architecture.md",
    name: "architecture.md",
    type: "file",
  },
  {
    id: "docs/guides",
    name: "guides",
    type: "folder",
    children: [
      { id: "docs/guides/getting-started.md", name: "getting-started.md", type: "file" },
      { id: "docs/guides/theming.md", name: "theming.md", type: "file" },
      { id: "docs/guides/motion.md", name: "motion.md", type: "file" },
    ],
  },
  {
    id: "docs/changelog.md",
    name: "changelog.md",
    type: "file",
  },
] satisfies CheckboxTreeNode[];

function PickerDemo() {
  const [checked, setChecked] = useState<ReadonlySet<string>>(
    new Set(["docs/architecture.md", "docs/guides/getting-started.md"]),
  );

  const toggle = (node: CheckboxTreeNode, nextChecked: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      const collect = (n: CheckboxTreeNode): string[] => {
        if (n.type === "file") return [n.id];
        return (n.children ?? []).flatMap(collect);
      };
      for (const id of collect(node)) {
        if (nextChecked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2 mx-auto max-w-xs">
      <CheckboxTree data={docs} checked={checked} onNodeToggle={toggle} aria-label="Files to publish" />
      <p className="text-xs text-muted text-center">
        {checked.size} of 5 files included — folder checks derive, never store.
      </p>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "CheckboxTree",
  group: "data",
  description:
    "A controlled tree picker with tri-state folders. Folder checked/unchecked/indeterminate is derived fresh from the checked file set every render — the checked-set owner stays outside.",
  demos: [
    {
      name: "Publish-style picker",
      description:
        "Toggling a folder applies to all descendant files. Unchecked rows dim as a second cue; indeterminate folders show Radix's native mixed state via the library's Checkbox.",
      render: () => <PickerDemo />,
    },
  ],
};
export default entry;
