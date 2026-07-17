import type { ShowcaseEntry } from "../../showcase/types";
import { RadioGroup, RadioGroupItem } from ".";

const entry: ShowcaseEntry = {
  title: "RadioGroup",
  group: "inputs",
  demos: [
    {
      name: "Default",
      render: () => (
        <RadioGroup defaultValue="a">
          <label className="flex items-center gap-2">
            <RadioGroupItem value="a" /> <span className="text-sm">Option A</span>
          </label>
          <label className="flex items-center gap-2">
            <RadioGroupItem value="b" /> <span className="text-sm">Option B</span>
          </label>
          <label className="flex items-center gap-2">
            <RadioGroupItem value="c" disabled /> <span className="text-sm">Option C (disabled)</span>
          </label>
        </RadioGroup>
      ),
    },
  ],
};
export default entry;
