import type { ShowcaseEntry } from "../../showcase/types";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from ".";
import { Card } from "../card";

const entry: ShowcaseEntry = {
  title: "ContextMenu",
  group: "overlay",
  description:
    "Right-click (or long-press) menu at the pointer position — DropdownMenu's sibling with identical styling and keyboard contract.",
  demos: [
    {
      name: "Row menu",
      description:
        "The file-tree pattern: trigger wraps the row via asChild, destructive items tint danger on focus.",
      render: () => (
        <div className="flex justify-center">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Card className="w-64 cursor-default select-none px-4 py-3 text-sm">
                <span className="font-mono">notes/architecture.md</span>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>New file</ContextMenuItem>
              <ContextMenuItem>New folder</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Rename</ContextMenuItem>
              <ContextMenuItem>Copy path</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem destructive>Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      ),
    },
  ],
};
export default entry;
