import type { ShowcaseEntry } from "../../showcase/types";
import { Sparkline } from ".";
import { StatCard } from "../patterns/stat-card";

const trendUp = [12, 14, 13, 16, 18, 17, 21, 24, 23, 27, 30, 33];
const trendDown = [33, 30, 27, 23, 24, 21, 17, 18, 16, 13, 14, 12];

const entry: ShowcaseEntry = {
  title: "Sparkline",
  group: "charts",
  description: "Inline micro-chart with no axes, which feeds StatCard's trend slot. It draws left to right as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Basic",
      render: () => <Sparkline data={trendUp} />,
    },
    {
      name: "Area fill",
      render: () => <Sparkline data={trendUp} area />,
    },
    {
      name: "Downward trend, danger token",
      render: () => <Sparkline data={trendDown} token="chart-8" area />,
    },
    {
      name: "Inside StatCard",
      render: () => (
        <StatCard
          label="Weekly active users"
          value="24,801"
          delta={{ value: "12.4%", direction: "up", label: "vs last week" }}
          icon={<Sparkline data={trendUp} area width={64} height={20} />}
        />
      ),
    },
    {
      name: "Empty",
      render: () => <Sparkline data={[]} />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <Sparkline data={trendUp} area progress={0.5} />,
    },
  ],
};
export default entry;
