import type { ShowcaseEntry } from "../../showcase/types";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "DropdownMenu",
  group: "overlay",
  description: "A click-triggered action menu with labels, separators, destructive items and disabled items.",
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
  ],
};
export default entry;
