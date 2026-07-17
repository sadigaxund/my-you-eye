import type { ShowcaseEntry } from "../../showcase/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from ".";

const entry: ShowcaseEntry = {
  title: "Select",
  group: "inputs",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Select>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Small" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger size="md">
              <SelectValue placeholder="Medium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Disabled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger invalid>
              <SelectValue placeholder="Invalid state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ],
};
export default entry;
