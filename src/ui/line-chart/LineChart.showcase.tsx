import type { ShowcaseEntry } from "../../showcase/types";
import { LineChart } from ".";

const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const single = [{ label: "Active users", data: [1200, 1900, 1700, 2400, 2100, 2600, 3000] }];
const multi = [
  { label: "This year", data: [1200, 1900, 1700, 2400, 2100, 2600, 3000] },
  { label: "Last year", data: [900, 1400, 1300, 1800, 1700, 2000, 2200] },
];

const entry: ShowcaseEntry = {
  title: "LineChart",
  group: "charts",
  description: "Multi-series, optional area fill, point markers. Draws left-to-right as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Single series",
      render: () => <LineChart categories={categories} series={single} title="Active users" />,
    },
    {
      name: "Multi-series",
      render: () => <LineChart categories={categories} series={multi} title="Active users, YoY" />,
    },
    {
      name: "Area fill",
      render: () => <LineChart categories={categories} series={single} area title="Active users" />,
    },
    {
      name: "No point markers",
      render: () => <LineChart categories={categories} series={multi} showPoints={false} title="Active users, YoY" />,
    },
    {
      name: "Long category label",
      render: () => (
        <LineChart
          categories={["Q1 — pre-launch", "Q2 — general availability", "Q3 — expansion"]}
          series={[{ label: "MRR", data: [12000, 28000, 41000] }]}
          title="MRR by quarter"
        />
      ),
    },
    {
      name: "Empty",
      render: () => <LineChart categories={[]} series={[]} title="Active users" />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <LineChart categories={categories} series={multi} area progress={0.5} title="Active users, YoY" />,
    },
    {
      name: "Focus a category",
      description: "focus dims every point marker outside the named category to opacity-muted while the lines stay at full opacity, for ChartScene's per-step focus callout.",
      render: () => <LineChart categories={categories} series={multi} focus={categories[3]} title="Active users, YoY" />,
    },
  ],
};
export default entry;
