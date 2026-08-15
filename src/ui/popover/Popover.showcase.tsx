import type { ShowcaseEntry } from "../../showcase/types";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from ".";
import { Button } from "../button";
import { Input } from "../input";

const entry: ShowcaseEntry = {
  title: "Popover",
  group: "overlay",
  description: "A click-triggered floating panel for secondary controls, positioned by Radix and portalled above the page.",
  demos: [
    {
      name: "Default",
      render: () => (
        <div className="flex justify-center">
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
        </div>
      ),
    },
    {
      name: "Positioning",
      description: "side picks the edge and align picks where along it, and both forward straight to Radix.",
      render: () => (
        <div className="flex flex-wrap justify-center gap-3">
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Top</Button></PopoverTrigger>
            <PopoverContent side="top" className="w-56">
              <p className="text-sm text-fg">Opens above the trigger.</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Bottom</Button></PopoverTrigger>
            <PopoverContent side="bottom" className="w-56">
              <p className="text-sm text-fg">Opens below the trigger — the default side.</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Left</Button></PopoverTrigger>
            <PopoverContent side="left" className="w-56">
              <p className="text-sm text-fg">Opens to the left of the trigger.</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Right</Button></PopoverTrigger>
            <PopoverContent side="right" className="w-56">
              <p className="text-sm text-fg">Opens to the right of the trigger.</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Align start</Button></PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-56">
              <p className="text-sm text-fg">Left edge flush with the trigger's left edge.</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Align end</Button></PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-56">
              <p className="text-sm text-fg">Right edge flush with the trigger's right edge.</p>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
    {
      name: "With close button",
      render: () => (
        <div className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Share link</Button></PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Anyone with the link can view</p>
                <Input size="sm" defaultValue="https://my-you-eye.dev/p/9f2a41" readOnly />
                <div className="flex justify-end gap-2">
                  <PopoverClose asChild>
                    <Button size="sm" variant="ghost">Cancel</Button>
                  </PopoverClose>
                  <Button size="sm">Copy</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
  ],
};
export default entry;
