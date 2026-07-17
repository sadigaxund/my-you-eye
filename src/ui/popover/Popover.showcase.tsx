import type { ShowcaseEntry } from "../../showcase/types";
import { Popover, PopoverTrigger, PopoverContent } from ".";
import { Button } from "../button";
import { Input } from "../input";

const entry: ShowcaseEntry = {
  title: "Popover",
  group: "overlay",
  demos: [
    {
      name: "Default",
      render: () => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Dimensions</p>
              <Input placeholder="Width" size="sm" />
              <Input placeholder="Height" size="sm" />
              <Button size="sm">Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
      ),
    },
  ],
};
export default entry;
