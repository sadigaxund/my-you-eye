import type { ShowcaseEntry } from "../../../showcase/types";
import { Toolbar } from ".";
import { Input } from "../../input";
import { Button } from "../../button";

const entry: ShowcaseEntry = {
  title: "Toolbar",
  group: "patterns",
  demos: [
    {
      name: "Search + actions",
      render: () => (
        <Toolbar
          search={<Input placeholder="Search..." size="sm" className="min-w-[200px]" />}
          actions={<><Button size="sm" variant="secondary">Filter</Button><Button size="sm">New</Button></>}
        />
      ),
    },
  ],
};
export default entry;
