import type { ShowcaseEntry } from "../../showcase/types";
import { Spinner } from ".";

const entry: ShowcaseEntry = {
  title: "Spinner",
  group: "feedback",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      ),
    },
  ],
};
export default entry;
