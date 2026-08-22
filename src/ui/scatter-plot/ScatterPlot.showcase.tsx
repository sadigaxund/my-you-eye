import type { ShowcaseEntry } from "../../showcase/types";
import { ScatterPlot } from ".";

const single = [
  { label: "Page load", data: [
    { x: 1.2, y: 40 }, { x: 2.1, y: 55 }, { x: 3.0, y: 62 }, { x: 4.4, y: 80 },
    { x: 5.1, y: 88 }, { x: 2.8, y: 58 }, { x: 3.6, y: 70 }, { x: 1.8, y: 46 },
  ] },
];

const multi = [
  { label: "Free tier", data: [{ x: 1, y: 20 }, { x: 2, y: 28 }, { x: 3, y: 22 }, { x: 4, y: 30 }] },
  { label: "Pro tier", data: [{ x: 1, y: 45 }, { x: 2, y: 60 }, { x: 3, y: 55 }, { x: 4, y: 72 }] },
  { label: "Enterprise", data: [{ x: 1, y: 80 }, { x: 2, y: 95 }, { x: 3, y: 110 }, { x: 4, y: 130 }] },
];

const entry: ShowcaseEntry = {
  title: "ScatterPlot",
  group: "charts",
  description: "Points + optional trend line. Points fade in by index order as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Single series",
      render: () => <ScatterPlot series={single} title="Page size vs. load time" />,
    },
    {
      name: "With trend line",
      render: () => <ScatterPlot series={single} trendLine title="Page size vs. load time" />,
    },
    {
      name: "Multi-series (3, all-pairs cap)",
      render: () => <ScatterPlot series={multi} title="Usage by plan tier" />,
    },
    {
      name: "Long point label (tooltip)",
      render: () => (
        <ScatterPlot
          series={[{ label: "Deals", data: [{ x: 2, y: 40, label: "Enterprise plan renewal — Acme Corp" }, { x: 4, y: 70 }] }]}
          title="Deal size vs. days to close"
        />
      ),
    },
    {
      name: "Loading",
      render: () => <ScatterPlot series={[]} loading title="Page size vs. load time" />,
    },
    {
      name: "Empty",
      render: () => <ScatterPlot series={[]} title="Page size vs. load time" />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <ScatterPlot series={multi} progress={0.5} title="Usage by plan tier" />,
    },
  ],
};
export default entry;
