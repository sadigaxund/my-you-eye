import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { Combobox } from ".";
import type { ComboboxOption } from ".";

const fruits: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
  { value: "fig", label: "Fig" },
  { value: "grape", label: "Grape" },
  { value: "honeydew", label: "Honeydew" },
];

const entry: ShowcaseEntry = {
  title: "Combobox",
  group: "inputs",
  demos: [
    {
      name: "Basic",
      render: () => {
        const [val, setVal] = useState("");
        return (
          <div className="flex flex-col gap-3 max-w-xs">
            <Combobox
              options={fruits}
              value={val}
              onChange={setVal}
              placeholder="Pick a fruit..."
            />
            <p className="text-xs text-muted">Selected: {val || "none"}</p>
          </div>
        );
      },
    },
    {
      name: "Disabled",
      render: () => (
        <div className="max-w-xs">
          <Combobox
            options={fruits}
            placeholder="Disabled combobox"
            disabled
          />
        </div>
      ),
    },
  ],
};
export default entry;
