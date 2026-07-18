import type { ShowcaseEntry } from "../../showcase/types";
import { TooltipProvider, Tooltip } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "Tooltip",
  group: "overlay",
  demos: [
    {
      name: "Directions",
      render: () => (
        <TooltipProvider>
          <div className="flex flex-wrap justify-center gap-3">
            <Tooltip content="Top tooltip" side="top">
              <Button variant="secondary">Top</Button>
            </Tooltip>
            <Tooltip content="Bottom tooltip" side="bottom">
              <Button variant="secondary">Bottom</Button>
            </Tooltip>
            <Tooltip content="Left tooltip" side="left">
              <Button variant="secondary">Left</Button>
            </Tooltip>
            <Tooltip content="Right tooltip" side="right">
              <Button variant="secondary">Right</Button>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ],
};
export default entry;
