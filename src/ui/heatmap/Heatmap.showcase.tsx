import type { ShowcaseEntry } from "../../showcase/types";
import { Heatmap } from ".";

const hours = ["12a", "4a", "8a", "12p", "4p", "8p"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const values = days.map((_, r) => hours.map((_, c) => Math.round(20 + 60 * Math.abs(Math.sin(r + c)))));

const single: number[][] = [[42], [58], [61], [39], [70], [88], [30]];

const entry: ShowcaseEntry = {
  title: "Heatmap",
  group: "charts",
  description: "Matrix on the sequential ramp, for latency grids and activity calendars. Cells fade in by rank, lowest value first, as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Activity calendar",
      render: () => <Heatmap xLabels={hours} yLabels={days} values={values} title="Requests by hour" />,
    },
    {
      name: "Single column",
      render: () => (
        <Heatmap xLabels={["p99 ms"]} yLabels={days} values={single} title="Daily p99 latency" />
      ),
    },
    {
      name: "Long row label",
      render: () => (
        <Heatmap
          xLabels={hours}
          yLabels={["Payments service", "Checkout API"]}
          values={[hours.map(() => 40), hours.map(() => 70)]}
          title="Error rate by service"
        />
      ),
    },
    {
      name: "Empty",
      render: () => <Heatmap xLabels={[]} yLabels={[]} values={[]} title="Requests by hour" />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <Heatmap xLabels={hours} yLabels={days} values={values} progress={0.5} title="Requests by hour" />,
    },
  ],
};
export default entry;
