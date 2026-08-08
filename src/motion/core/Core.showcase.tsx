import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { useTimeline } from "./TimelineContext";
import { useProgress } from "./useProgress";

function TimelineReadout() {
  const { frame, fps, durationInFrames } = useTimeline();
  const linear = useProgress({ duration: "slow", easing: "linear" });
  const eased = useProgress({ duration: "slow", easing: "standard" });
  const spring = useProgress({ duration: "slow", spring: "bouncy" });

  return (
    <div className="flex flex-col gap-stack font-mono text-xs text-fg">
      <div className="flex gap-panel">
        <span>frame {frame}</span>
        <span>fps {fps}</span>
        <span>duration {durationInFrames}</span>
      </div>
      {[
        { label: "linear", value: linear },
        { label: "easing=standard", value: eased },
        { label: "spring=bouncy", value: spring },
      ].map((row) => (
        <div key={row.label} className="flex items-center gap-inline">
          <span className="w-32 shrink-0">{row.label}</span>
          <div className="h-2 flex-1 overflow-visible rounded-ui bg-secondary">
            <div
              className="h-2 rounded-ui bg-primary"
              style={{ width: `${Math.min(1, Math.max(0, row.value)) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right">{row.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Motion Core",
  group: "motion",
  description:
    "The foundation every primitive is built on: useTimeline() / useProgress() reading from whichever driver is mounted. Scrub to see the raw numbers update — this is what proves DomDriver and RemotionDriver agree.",
  demos: [
    {
      name: "useTimeline / useProgress",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <TimelineReadout />
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
