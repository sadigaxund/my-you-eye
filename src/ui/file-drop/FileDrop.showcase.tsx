import type { ShowcaseEntry } from "../../showcase/types";
import { FileDrop } from ".";

const entry: ShowcaseEntry = {
  title: "FileDrop",
  group: "inputs",
  demos: [
    {
      name: "Default",
      render: () => <FileDrop className="max-w-sm" onDrop={(files) => console.log(files)} />,
    },
    {
      name: "Single image only",
      render: () => (
        <FileDrop className="max-w-sm" multiple={false} accept="image/*" maxSize={5 * 1024 * 1024} onDrop={(files) => console.log(files)} />
      ),
    },
  ],
};
export default entry;
