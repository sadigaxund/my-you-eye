import type { ShowcaseDemo } from "../../showcase/types";
import { TreeView } from ".";
import type { TreeNode } from ".";

// #42: a long, unbroken leaf value used to collapse its key to zero width
// (the value's intrinsic content width dominated the row's flex layout).
// The key now caps at --width-tree-view-key-max and the value takes the
// remaining space with its own ellipsis truncation.
const longValueData: TreeNode[] = [
  {
    id: "lv-release", label: "release", kind: "object",
    children: [
      { id: "lv-version", label: "version", value: { type: "text", value: "2.4.1" } },
      { id: "lv-channel", label: "channel", value: { type: "badge", value: "Stable", badgeVariant: "primary" } },
      { id: "lv-date", label: "date", value: { type: "date-human", value: "2026-08-22T09:00:00Z" } },
      {
        id: "lv-notes",
        label: "notes",
        value: {
          type: "text",
          value: "Fixed a race condition in the reconnect handler that dropped queued events during a token refresh, reduced cold-start latency on the settings page by caching the feature-flag lookup, and corrected timezone rounding in the export scheduler.",
        },
      },
    ],
  },
];

export const longValueDemos: ShowcaseDemo[] = [
  {
    name: "Long leaf value",
    description: "A ~250-character leaf value truncates with an ellipsis instead of squeezing its key to zero.",
    render: () => (
      <div className="max-w-md px-2">
        <TreeView data={longValueData} defaultExpandedDepth={1} />
      </div>
    ),
  },
];
