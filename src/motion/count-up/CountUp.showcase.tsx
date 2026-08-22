import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { CountUp } from ".";

const entry: ShowcaseEntry = {
  title: "CountUp",
  group: "motion",
  description: "Numeric tween that reuses src/lib/format.ts for every formatting mode instead of reimplementing Intl formatting.",
  demos: [
    {
      name: "Formats",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="grid grid-cols-2 place-items-center gap-panel font-mono text-2xl text-fg">
            <CountUp to={12489} format="number" duration="slow" formatOptions={{ compact: true }} />
            <CountUp to={0.874} format="percentage" duration="slow" />
            <CountUp to={2_400_000} format="bytes" duration="slow" />
            <CountUp to={4999.5} format="currency" duration="slow" formatOptions={{ currency: "USD" }} />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "Signed & duration",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="flex gap-panel font-mono text-2xl text-fg">
            <CountUp from={0} to={-42} format="signed" duration="slow" />
            <CountUp to={3725} format="duration" duration="slow" />
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
