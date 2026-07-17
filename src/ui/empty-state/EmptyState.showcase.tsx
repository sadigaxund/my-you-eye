import type { ShowcaseEntry } from "../../showcase/types";
import { EmptyState } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "EmptyState",
  group: "display",
  demos: [
    {
      name: "Default",
      render: () => (
        <EmptyState
          title="No results found"
          description="Try adjusting your search or filters."
        />
      ),
    },
    {
      name: "With icon and action",
      render: () => (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="size-10 fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          }
          title="All caught up!"
          description="You've processed all pending items."
          action={<Button variant="secondary">Refresh</Button>}
        />
      ),
    },
  ],
};
export default entry;
