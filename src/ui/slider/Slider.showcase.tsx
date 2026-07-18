import type { ShowcaseEntry } from "../../showcase/types";
import { Slider } from ".";

const entry: ShowcaseEntry = {
  title: "Slider",
  group: "inputs",
  demos: [
    {
      name: "Basic slider",
      render: () => (
        <div className="max-w-xs mx-auto space-y-4">
          <Slider defaultValue={50} />
          <Slider defaultValue={30} label="Volume" showValue />
          <Slider defaultValue={75} label="Brightness" showValue min={0} max={200} />
        </div>
      ),
    },
  ],
};
export default entry;
