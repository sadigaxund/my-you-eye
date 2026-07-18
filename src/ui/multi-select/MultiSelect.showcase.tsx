import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MultiSelect } from ".";
import type { MultiSelectOption } from ".";

const fruits: MultiSelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
  { value: "fig", label: "Fig" },
  { value: "grape", label: "Grape" },
  { value: "honeydew", label: "Honeydew" },
];

function BasicDemo() {
  const [val, setVal] = useState<string[]>(["apple", "cherry"]);
  return (
    <div className="flex flex-col gap-3 max-w-xs mx-auto">
      <MultiSelect
        options={fruits}
        value={val}
        onChange={setVal}
        placeholder="Pick fruits..."
      />
      <p className="text-xs text-muted text-center">Selected: {val.join(", ") || "none"}</p>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "MultiSelect",
  group: "inputs",
  demos: [
    {
      name: "Basic",
      render: () => <BasicDemo />,
    },
    {
      name: "Empty",
      render: () => (
        <div className="max-w-xs mx-auto">
          <MultiSelect options={fruits} placeholder="Pick fruits..." />
        </div>
      ),
    },
    {
      name: "Disabled",
      render: () => (
        <div className="max-w-xs mx-auto">
          <MultiSelect options={fruits} value={["banana"]} placeholder="Pick fruits..." disabled />
        </div>
      ),
    },
  ],
};
export default entry;
