import type { ShowcaseEntry } from "../../showcase/types";
import { Gauge } from ".";

const slaBands = [
  { upTo: 70, status: "danger" as const },
  { upTo: 90, status: "warning" as const },
  { upTo: 100, status: "success" as const },
];

const entry: ShowcaseEntry = {
  title: "Gauge",
  group: "charts",
  description: "Arc meter with threshold bands, for SLOs and single-value metrics. The needle sweeps from min as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Basic",
      render: () => <Gauge value={72} max={100} label="CPU utilization" />,
    },
    {
      name: "Threshold bands — healthy",
      render: () => <Gauge value={96} max={100} bands={slaBands} label="Uptime SLA" valueFormat={(v) => `${v}%`} />,
    },
    {
      name: "Threshold bands — critical",
      render: () => <Gauge value={58} max={100} bands={slaBands} label="Uptime SLA" valueFormat={(v) => `${v}%`} />,
    },
    {
      name: "Custom range",
      render: () => <Gauge value={340} min={0} max={500} label="Requests / sec" />,
    },
    {
      name: "Long label",
      render: () => <Gauge value={310} min={0} max={400} label="P99 checkout latency budget remaining" />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <Gauge value={96} max={100} bands={slaBands} progress={0.5} label="Uptime SLA" valueFormat={(v) => `${v}%`} />,
    },
  ],
};
export default entry;
