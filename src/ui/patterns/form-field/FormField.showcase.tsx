import type { ShowcaseEntry } from "../../../showcase/types";
import { FormField } from ".";
import { Input } from "../../input";

const entry: ShowcaseEntry = {
  title: "FormField",
  group: "patterns",
  demos: [
    {
      name: "Default",
      render: () => (
        <div className="max-w-xs">
          <FormField label="Email">
            <Input placeholder="you@example.com" />
          </FormField>
        </div>
      ),
    },
    {
      name: "With hint",
      render: () => (
        <div className="max-w-xs">
          <FormField label="Password" hint="At least 8 characters">
            <Input type="password" />
          </FormField>
        </div>
      ),
    },
    {
      name: "Required with error",
      render: () => (
        <div className="max-w-xs">
          <FormField label="Full name" required error="Name is required">
            <Input invalid placeholder="Enter your name" />
          </FormField>
        </div>
      ),
    },
  ],
};
export default entry;
