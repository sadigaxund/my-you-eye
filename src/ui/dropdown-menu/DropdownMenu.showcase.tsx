import type { ShowcaseEntry } from "../../showcase/types";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "DropdownMenu",
  group: "overlay",
  demos: [
    {
      name: "Default",
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
