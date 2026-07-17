import type { ShowcaseEntry } from "../../showcase/types";
import { Button } from ".";

const entry: ShowcaseEntry = {
  title: "Button",
  group: "inputs",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
    },
    {
      name: "Disabled & loading",
      render: () => (
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button variant="danger" loading>
            Deleting
          </Button>
        </div>
      ),
    },
  ],
};
export default entry;
