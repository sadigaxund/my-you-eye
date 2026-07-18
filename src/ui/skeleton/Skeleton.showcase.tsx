import type { ShowcaseEntry } from "../../showcase/types";
import { Skeleton } from ".";

const entry: ShowcaseEntry = {
  title: "Skeleton",
  group: "feedback",
  demos: [
    {
      name: "Shapes",
      render: () => (
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Skeleton shape="text" />
          <Skeleton shape="text" width="75%" />
          <Skeleton shape="text" width="50%" />
          <div className="flex items-center gap-3">
            <Skeleton shape="circle" width="40px" height="40px" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton shape="text" width="60%" />
              <Skeleton shape="text" width="40%" />
            </div>
          </div>
          <Skeleton shape="rect" width="100%" height="120px" />
        </div>
      ),
    },
  ],
};
export default entry;
