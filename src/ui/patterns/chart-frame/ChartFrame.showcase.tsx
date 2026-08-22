import type { ShowcaseEntry } from "../../../showcase/types";
import { ChartFrame } from ".";
import { chartFill } from ".";

const entry: ShowcaseEntry = {
  title: "ChartFrame",
  group: "charts",
  description:
    "Shared chart chrome: measurement, axes, gridlines, legend, tooltip layer and empty/loading states. Every chart in this library composes it instead of re-implementing axis code.",
  demos: [
    {
      name: "Axes, gridlines & a custom plot",
      render: () => (
        <ChartFrame
          title="Weekly signups"
          subtitle="Last 7 days"
          xLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          yTicks={[0, 25, 50, 75, 100]}
          legend={[{ label: "Signups", token: "chart-1" }]}
        >
          {({ xScale, yScale, bandWidth }) => {
            const values = [40, 62, 55, 80, 70, 30, 45];
            return (
              <g>
                {values.map((v, i) => {
                  const w = Math.min(bandWidth * 0.6, 24);
                  return (
                    <rect
                      key={i}
                      x={xScale(i) - w / 2}
                      y={yScale(v)}
                      width={w}
                      height={yScale(0) - yScale(v)}
                      rx={4}
                      className={chartFill("chart-1")}
                    />
                  );
                })}
              </g>
            );
          }}
        </ChartFrame>
      ),
    },
    {
      name: "Loading",
      render: () => <ChartFrame title="Weekly signups" loading />,
    },
    {
      name: "Empty",
      render: () => (
        <ChartFrame
          title="Weekly signups"
          empty
          emptyTitle="No data yet"
          emptyDescription="Signups will appear here once tracking starts."
        />
      ),
    },
  ],
};
export default entry;
