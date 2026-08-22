import type { ShowcaseEntry } from "../../showcase/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from ".";

const entry: ShowcaseEntry = {
  title: "Select",
  group: "inputs",
  demos: [
    {
      name: "Icon + label",
      description:
        "Item content is one unwrappable row — compose an icon directly as a child, no wrapper span needed.",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="General access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restricted">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.5">
                  <rect x="3.5" y="7" width="9" height="6.5" rx="1" />
                  <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
                </svg>
                Restricted to listed people
              </SelectItem>
              <SelectItem value="link">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="5.5" />
                  <path d="M2.5 8h11M8 2.5c1.8 1.6 2.6 3.4 2.6 5.5S9.8 12.9 8 13.5C6.2 12.9 5.4 10.1 5.4 8S6.2 4.1 8 2.5z" />
                </svg>
                Anyone with the link
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
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
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
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
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
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
