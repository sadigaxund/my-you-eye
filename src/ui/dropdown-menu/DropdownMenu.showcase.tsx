import type { ShowcaseEntry } from "../../showcase/types";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownSubmenu, DropdownSubmenuTrigger, DropdownSubmenuContent } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "DropdownMenu",
  group: "overlay",
  description: "A click-triggered action menu with labels, separators, destructive items, disabled items and nested submenus.",
  demos: [
    {
      name: "Default",
      description: "A disabled item stays visible at half opacity and never receives focus or a click.",
      render: () => (
        <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem disabled>Transfer ownership</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>Delete account</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      ),
    },
    {
      name: "With submenu",
      description:
        "Arrow-right or hover opens the nested level; the trigger's disabled prop grays out the whole submenu at once.",
      render: () => (
        <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Format document</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownSubmenu>
              <DropdownSubmenuTrigger>Format</DropdownSubmenuTrigger>
              <DropdownSubmenuContent>
                <DropdownMenuItem>Prettify selection</DropdownMenuItem>
                <DropdownMenuItem>Prettify file</DropdownMenuItem>
              </DropdownSubmenuContent>
            </DropdownSubmenu>
            <DropdownSubmenu>
              <DropdownSubmenuTrigger disabled>Insert snippet</DropdownSubmenuTrigger>
              <DropdownSubmenuContent>
                <DropdownMenuItem>Table</DropdownMenuItem>
                <DropdownMenuItem>Code fence</DropdownMenuItem>
              </DropdownSubmenuContent>
            </DropdownSubmenu>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>Delete file</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      ),
    },
  ],
};
export default entry;
