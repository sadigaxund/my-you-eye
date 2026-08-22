import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { useTimeline } from "./TimelineContext";
import { useProgress } from "./useProgress";

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-inline">
      <span className="w-36 shrink-0 font-mono text-xs text-fg">{label}</span>
      <div className="h-2 flex-1 overflow-visible rounded-ui bg-secondary">
        <div className="h-2 rounded-ui bg-primary" style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right font-mono text-xs text-muted">{value.toFixed(2)}</span>
    </div>
  );
}

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
      <ProgressRow label="linear" value={linear} />
      <ProgressRow label="easing=standard" value={eased} />
      <ProgressRow label="spring=bouncy" value={spring} />
    </div>
  );
}

function BeatComparison() {
  const instant = useProgress({ duration: "instant" });
  const quick = useProgress({ duration: "quick" });
  const normal = useProgress({ duration: "normal" });
  const slow = useProgress({ duration: "slow" });
  return (
    <div className="flex flex-col gap-stack">
      <ProgressRow label='duration="instant"' value={instant} />
      <ProgressRow label='duration="quick"' value={quick} />
      <ProgressRow label='duration="normal"' value={normal} />
      <ProgressRow label='duration="slow"' value={slow} />
    </div>
  );
}

function EasingSpringMatrix() {
  const linear = useProgress({ duration: "slow", easing: "linear" });
  const standard = useProgress({ duration: "slow", easing: "standard" });
  const easeIn = useProgress({ duration: "slow", easing: "in" });
  const easeOut = useProgress({ duration: "slow", easing: "out" });
  const gentle = useProgress({ duration: "slow", spring: "gentle" });
  const snappy = useProgress({ duration: "slow", spring: "snappy" });
  const bouncy = useProgress({ duration: "slow", spring: "bouncy" });
  return (
    <div className="flex flex-col gap-stack">
      <ProgressRow label='easing="linear"' value={linear} />
      <ProgressRow label='easing="standard"' value={standard} />
      <ProgressRow label='easing="in"' value={easeIn} />
      <ProgressRow label='easing="out"' value={easeOut} />
      <ProgressRow label='spring="gentle"' value={gentle} />
      <ProgressRow label='spring="snappy"' value={snappy} />
      <ProgressRow label='spring="bouncy"' value={bouncy} />
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Motion Core",
  group: "motion",
  description:
    "The foundation every primitive builds on: useTimeline() and useProgress(), which read from whichever driver is mounted.",
  demos: [
    {
      name: "useTimeline / useProgress",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <TimelineReadout />
        </MotionPreview>
      ),
    },
    {
      name: "Beat values",
      description: 'The 4 named Beat durations racing to progress=1 at once — "instant" (0.15s) through "slow" (0.9s).',
      render: () => (
        <MotionPreview durationInFrames={60}>
          <BeatComparison />
        </MotionPreview>
      ),
    },
    {
      name: "Easing vs spring",
      description: "Every EasingName and SpringName at one duration, where springs may overshoot past 1.00.",
      render: () => (
        <MotionPreview durationInFrames={60}>
          <EasingSpringMatrix />
        </MotionPreview>
      ),
    },
    {
      name: "Seek & scrub",
      description:
        "Every demo's Play/Pause/Replay buttons and scrub slider are already DomDriverHandle calls.",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <TimelineReadout />
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
