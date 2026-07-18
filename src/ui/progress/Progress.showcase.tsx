import type { ShowcaseEntry } from "../../showcase/types";
import { Progress } from ".";

const entry: ShowcaseEntry = {
  title: "Progress",
  group: "feedback",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Progress value={65} variant="default" label="Processing" />
          <Progress value={100} variant="success" label="Complete" />
          <Progress value={45} variant="warning" label="Warning" />
          <Progress value={22} variant="danger" label="Failed" />
        </div>
      ),
    },
    {
      name: "No label",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Progress value={30} />
          <Progress value={75} variant="success" />
        </div>
      ),
    },
  ],
};
export default entry;
