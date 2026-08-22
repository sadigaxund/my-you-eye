import type { ShowcaseEntry } from "../../../showcase/types";
import { FileTree } from ".";
import type { FileTreeNode } from ".";

const projectData: FileTreeNode[] = [
  {
    id: "src", name: "src", type: "folder",
    children: [
      {
        id: "src/ui", name: "ui", type: "folder",
        children: [
          {
            id: "src/ui/button", name: "button", type: "folder",
            children: [
              { id: "src/ui/button/Button.tsx", name: "Button.tsx", type: "file", meta: "2.1 kb" },
              { id: "src/ui/button/Button.showcase.tsx", name: "Button.showcase.tsx", type: "file", meta: "1.4 kb" },
              { id: "src/ui/button/index.ts", name: "index.ts", type: "file", meta: "0.1 kb" },
            ],
          },
          {
            id: "src/ui/file-tree", name: "file-tree", type: "folder",
            children: [
              { id: "src/ui/file-tree/FileTree.tsx", name: "FileTree.tsx", type: "file", status: "added", meta: "82 lines" },
              { id: "src/ui/file-tree/index.ts", name: "index.ts", type: "file", status: "added", meta: "2 lines" },
            ],
          },
        ],
      },
      { id: "src/index.ts", name: "index.ts", type: "file", status: "modified", meta: "312 lines" },
    ],
  },
  {
    id: "scripts", name: "scripts", type: "folder",
    children: [
      { id: "scripts/check-showcase.mjs", name: "check-showcase.mjs", type: "file" },
      { id: "scripts/legacy-audit.mjs", name: "legacy-audit.mjs", type: "file", status: "deleted", meta: "44 lines" },
    ],
  },
  { id: "AGENTS.md", name: "AGENTS.md", type: "file", status: "modified", meta: "18.2 kb" },
  { id: "NOTES.local.md", name: "NOTES.local.md", type: "file", status: "untracked", meta: "0.4 kb" },
];

const entry: ShowcaseEntry = {
  title: "FileTree",
  group: "patterns",
  description:
    "A file and folder tree for the \"here's the project structure\" moment in a coding video, built as a pattern over TreeView rather than a fork of it. It shapes FileTreeNode[] into TreeNode[] with icons, a git-status badge and a trailing metadata readout, then renders TreeView.",
  demos: [
    {
      name: "Project tree with git status",
      description: "Status badges (added/modified/deleted/untracked) map onto the same success/warning/danger/primary tokens used elsewhere; \"meta\" renders in TreeView's trailing slot.",
      render: () => (
        <div className="px-2">
          <FileTree data={projectData} defaultExpandedDepth={3} />
        </div>
      ),
    },
    {
      name: "Compact density",
      render: () => (
        <div className="px-2">
          <FileTree data={projectData} density="compact" defaultExpandedDepth={2} />
        </div>
      ),
    },
  ],
};
export default entry;
