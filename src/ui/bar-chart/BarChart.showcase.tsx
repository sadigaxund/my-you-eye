import type { ShowcaseEntry } from "../../showcase/types";
import { BarChart } from ".";

const categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const series = [{ label: "Signups", data: [40, 62, 55, 80, 70, 30, 45] }];
const grouped = [
  { label: "Desktop", data: [30, 45, 40, 55, 50, 20, 25] },
  { label: "Mobile", data: [20, 25, 30, 35, 32, 15, 22] },
  { label: "Tablet", data: [8, 10, 9, 12, 11, 5, 6] },
];
const longLabels = [
  { label: "Enterprise plan renewals", data: [120, 98] },
];

const entry: ShowcaseEntry = {
  title: "BarChart",
  group: "charts",
  description: "Vertical/horizontal, grouped/stacked. Bars grow from the baseline as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Single series (vertical)",
      render: () => <BarChart categories={categories} series={series} title="Weekly signups" />,
    },
    {
      name: "Grouped, multi-series",
      render: () => <BarChart categories={categories} series={grouped} title="Sessions by device" />,
    },
    {
      name: "Stacked",
      render: () => <BarChart categories={categories} series={grouped} mode="stacked" title="Sessions by device (stacked)" />,
    },
    {
      name: "Horizontal",
      render: () => (
        <BarChart
          categories={["North America", "Europe", "Asia Pacific", "Latin America"]}
          series={[{ label: "Revenue", data: [820, 640, 510, 210] }]}
          orientation="horizontal"
          title="Revenue by region"
        />
      ),
    },
    {
      name: "Horizontal, grouped",
      render: () => (
        <BarChart
          categories={["North America", "Europe", "Asia Pacific"]}
          series={[
            { label: "This quarter", data: [820, 640, 510] },
            { label: "Last quarter", data: [740, 610, 470] },
          ]}
          orientation="horizontal"
          title="Revenue by region"
        />
      ),
    },
    {
      name: "Long category label",
      render: () => (
        <BarChart
          categories={["Enterprise plan renewals", "Self-serve upgrades"]}
          series={longLabels}
          orientation="horizontal"
          title="Deal type"
        />
      ),
    },
    {
      name: "Empty",
      render: () => <BarChart categories={[]} series={[]} title="Weekly signups" />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <BarChart categories={categories} series={grouped} progress={0.5} title="Sessions by device" />,
    },
    {
      name: "Focus a category",
      description: "focus dims every bar outside the named category to opacity-muted — for ChartScene's per-step focus callout.",
      render: () => <BarChart categories={categories} series={series} focus="Thu" title="Weekly signups" />,
    },
  ],
};
export default entry;
