import type { ShowcaseEntry } from "../../../showcase/types";
import { Toolbar } from ".";
import { Input } from "../../input";
import { Button } from "../../button";
import { Badge } from "../../badge";

const entry: ShowcaseEntry = {
  title: "Toolbar",
  group: "patterns",
  demos: [
    {
      name: "All slots filled",
      render: () => (
        <Toolbar
          search={<Input placeholder="Search orders..." size="sm" className="min-w-[220px]" />}
          filters={
            <>
              <Button size="sm" variant="secondary">Status</Button>
              <Button size="sm" variant="secondary">Date</Button>
              <Badge variant="primary" style="soft">2 active</Badge>
            </>
          }
          actions={
            <>
              <Button size="sm" variant="secondary">Export</Button>
              <Button size="sm">New order</Button>
            </>
          }
        />
      ),
    },

  ],
};
export default entry;
