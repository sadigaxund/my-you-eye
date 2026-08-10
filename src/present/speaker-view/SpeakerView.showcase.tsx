import { Button } from "../../ui/button";
import type { ShowcaseEntry } from "../../showcase/types";
import { SpeakerView } from ".";
import { useSteps } from "../use-steps";
import type { Video } from "../../scenes";

const demoVideo: Video = {
  meta: { fps: 30 },
  scenes: [
    {
      kind: "title",
      title: "How the scheduler works",
      subtitle: "Part 3",
      notes: "Smile, breathe — this is the fun part.",
    },
    {
      kind: "code",
      lang: "ts",
      file: "scheduler.ts",
      code: "function schedule(job) {\n  queue.push(job);\n  drain();\n}",
      notes: "Slow down on the retry loop — that's the bit people always ask about afterward.",
      steps: [
        { say: "Here's the entry point.", focus: [1, 2] },
        { say: "Every job lands on the shared queue.", focus: [2, 2] },
      ],
    },
    { kind: "outro", title: "That's the scheduler.", cta: "Questions?" },
  ],
};

function Demo() {
  const { steps, index, next, prev, isFirst, isLast, current } = useSteps(demoVideo);
  if (!current) return null;
  return (
    <div className="flex flex-col gap-stack">
      <div className="h-80 w-full overflow-hidden rounded-ui border border-border">
        <SpeakerView video={demoVideo} sceneIndex={current.sceneIndex} stepIndex={current.stepIndex} />
      </div>
      <div className="flex items-center gap-inline">
        <Button size="sm" variant="secondary" disabled={isFirst} onClick={prev}>Prev step</Button>
        <Button size="sm" variant="primary" disabled={isLast} onClick={next}>Next step</Button>
        <span className="font-mono text-xs text-muted">{index + 1} / {steps.length}</span>
      </div>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "SpeakerView",
  group: "scenes",
  description:
    "Current + next step side by side, an elapsed timer, and notes from step.say / scene.notes. A plain controlled component (sceneIndex/stepIndex props) so it can be opened in a second window — Presenter's own 'Speaker view' button does exactly that via window.open + a React portal.",
  demos: [{ name: "Now / next / notes / elapsed timer", render: () => <Demo /> }],
};
export default entry;
