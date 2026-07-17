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
    {
      name: "No indicator",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1" showIndicator={false}>Option A</SelectItem>
              <SelectItem value="2" showIndicator={false}>Option B</SelectItem>
              <SelectItem value="3" showIndicator={false}>Option C</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted">Items without checkmark indicator</p>
        </div>
      ),
    },
  ],
};
export default entry;
