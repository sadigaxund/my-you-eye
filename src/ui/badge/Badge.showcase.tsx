import type { ShowcaseEntry } from "../../showcase/types";
import { Badge } from ".";

const entry: ShowcaseEntry = {
  title: "Badge",
  group: "display",
  demos: [
    {
      name: "Variants (solid)",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      ),
    },
    {
      name: "Variants (soft)",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral" style="soft">Neutral</Badge>
          <Badge variant="primary" style="soft">Primary</Badge>
          <Badge variant="success" style="soft">Success</Badge>
          <Badge variant="warning" style="soft">Warning</Badge>
          <Badge variant="danger" style="soft">Danger</Badge>
        </div>
      ),
    },
  ],
};
export default entry;
