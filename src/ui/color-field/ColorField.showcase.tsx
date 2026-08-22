import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { ColorField } from ".";

function AccentDemo() {
  const [accent, setAccent] = useState("#7c3aed");
  return (
    <div className="flex flex-col items-center gap-4">
      <ColorField
        value={accent}
        onChange={setAccent}
        label="Accent color"
        presets={["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"]}
      />
      <div className="flex items-center gap-2 text-sm">
        <span className="size-4 rounded-full" style={{ backgroundColor: accent }} />
        Accent: <span className="font-mono">{accent}</span>
      </div>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "ColorField",
  group: "inputs",
  description:
    "Themed accent-color field — token-styled swatch over the platform picker, validated hex readout, optional preset swatches.",
  demos: [
    {
      name: "Accent color",
      render: () => <AccentDemo />,
    },
  ],
};
export default entry;
