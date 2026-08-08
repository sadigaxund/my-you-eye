import type { ShowcaseEntry } from "../../showcase/types";
import { Legend } from ".";

const items = [
  { label: "Direct", token: "chart-1" as const },
  { label: "Organic search", token: "chart-2" as const },
  { label: "Referral", token: "chart-3" as const },
  { label: "Email", token: "chart-4" as const },
];

const entry: ShowcaseEntry = {
  title: "Legend",
  group: "charts",
  description: "Standalone series-identity legend, shared by every chart and by diagrams.",
  demos: [
    {
      name: "Rect swatches (bar / area fills)",
      render: () => <Legend items={items} swatch="rect" />,
    },
    {
      name: "Line swatches",
      render: () => <Legend items={items} swatch="line" />,
    },
    {
      name: "Dot swatches (scatter / points)",
      render: () => <Legend items={items} swatch="dot" />,
    },
    {
      name: "Vertical orientation",
      render: () => <Legend items={items} orientation="vertical" />,
    },
  ],
};
export default entry;
