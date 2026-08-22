import type { ShowcaseEntry } from "../../showcase/types";
import { PieChart } from ".";

const slices = [
  { label: "Direct", value: 42 },
  { label: "Organic search", value: 28 },
  { label: "Referral", value: 18 },
  { label: "Email", value: 12 },
];

const singleCategory = [
  { label: "Completed", value: 1 },
];

const longLabels = [
  { label: "Enterprise plan renewals", value: 55 },
  { label: "Self-serve new business", value: 30 },
  { label: "Partner-sourced upgrades", value: 15 },
];

const entry: ShowcaseEntry = {
  title: "PieChart",
  group: "charts",
  description: "Pie + donut variants, center label. The arc sweeps clockwise from 12 o'clock as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Pie",
      render: () => <PieChart slices={slices} title="Traffic by source" />,
    },
    {
      name: "Donut with center label",
      render: () => (
        <PieChart
          slices={slices}
          innerRadius={0.65}
          centerValue="1,204"
          centerLabel="Sessions"
          title="Traffic by source"
        />
      ),
    },
    {
      name: "Single category (no legend)",
      render: () => <PieChart slices={singleCategory} innerRadius={0.65} centerValue="100%" centerLabel="Done" title="Task completion" />,
    },
    {
      name: "Long labels",
      render: () => <PieChart slices={longLabels} title="Deal source" />,
    },
    {
      name: "Empty",
      render: () => <PieChart slices={[]} title="Traffic by source" />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <PieChart slices={slices} progress={0.5} title="Traffic by source" />,
    },
  ],
};
export default entry;
