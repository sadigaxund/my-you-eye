import type { ShowcaseEntry } from "../../showcase/types";
import { Avatar } from ".";

const entry: ShowcaseEntry = {
  title: "Avatar",
  group: "display",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback="JD" />
          <Avatar size="md" fallback="JD" />
          <Avatar size="lg" fallback="JD" />
        </div>
      ),
    },
    {
      name: "With image",
      render: () => (
        <div className="flex items-center gap-3">
          <Avatar
            size="md"
            src="https://i.pravatar.cc/80?u=1"
            alt="User"
            fallback="U"
          />
          <Avatar size="md" fallback="AB" />
          <Avatar size="md" fallback="MK" />
        </div>
      ),
    },
  ],
};
export default entry;
