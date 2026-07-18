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
        <div className="flex justify-center">
          <div className="max-w-xs">
            <FormField label="Email">
              <Input placeholder="you@example.com" />
            </FormField>
          </div>
        </div>
      ),
    },
    {
      name: "With hint",
      render: () => (
        <div className="flex justify-center">
          <div className="max-w-xs">
            <FormField label="Password" hint="At least 8 characters">
              <Input type="password" />
            </FormField>
          </div>
        </div>
      ),
    },
    {
      name: "Required with error",
      render: () => (
        <div className="flex justify-center">
          <div className="max-w-xs">
            <FormField label="Full name" required error="Name is required">
              <Input invalid placeholder="Enter your name" />
            </FormField>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
