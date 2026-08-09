import type { ShowcaseEntry } from "../../../showcase/types";
import { StatGrid } from ".";
import type { StatGridItem } from ".";

const kpis: StatGridItem[] = [
  { label: "Revenue", value: "$48.2k", delta: { value: 12.4, label: "vs last month" } },
  { label: "Active users", value: "8,204", delta: { value: 6.1, label: "vs last month" } },
  { label: "Churn", value: "2.1%", delta: { value: -0.4, label: "vs last month" } },
  { label: "Latency (ms)", value: "182", delta: { value: -14.2, label: "vs last week" } },
];

const withSparklines: StatGridItem[] = [
  { label: "Requests/min", value: "1,204", delta: { value: 3.2 }, sparkline: { data: [30, 34, 32, 38, 40, 44, 48], area: true } },
  { label: "Error rate", value: "0.4%", delta: { value: 0.1 }, sparkline: { data: [2, 1.5, 1.8, 1.2, 0.8, 0.6, 0.4] } },
  { label: "P95 latency", value: "220ms", delta: { value: -8.6 }, sparkline: { data: [280, 270, 260, 250, 235, 225, 220] } },
];

const inverted: StatGridItem[] = [
  { label: "Latency (ms)", value: "182", delta: { value: 14.2, label: "vs last week", positiveIsGood: false } },
  { label: "Error rate", value: "0.4%", delta: { value: -0.3, label: "vs last week", positiveIsGood: false } },
];

const entry: ShowcaseEntry = {
  title: "StatGrid",
  group: "patterns",
  description: "A KPI row as one component — data-driven StatGrid over StatCard, instead of a call-site grid of individually placed StatCards.",
  demos: [
    {
      name: "4-column KPI row",
      render: () => (
        <div className="w-full max-w-3xl mx-auto">
          <StatGrid items={kpis} columns={4} />
        </div>
      ),
    },
    {
      name: "3-column with sparklines",
      render: () => (
        <div className="w-full max-w-3xl mx-auto">
          <StatGrid items={withSparklines} columns={3} />
        </div>
      ),
    },
    {
      name: "Size",
      description: "size forwards to every StatCard.",
      render: () => (
        <div className="w-full max-w-3xl mx-auto">
          <StatGrid items={kpis.slice(0, 2)} columns={2} size="sm" />
        </div>
      ),
    },
    {
      name: "positiveIsGood",
      description: "delta.positiveIsGood (default true) flips which sign reads as good — for a metric like latency or error rate where an increase is bad news. The trend glyph still follows the raw sign (both still show ↑); only the success/danger coloring flips.",
      render: () => (
        <div className="w-full max-w-3xl mx-auto">
          <StatGrid items={inverted} columns={2} />
        </div>
      ),
    },
  ],
};
export default entry;
