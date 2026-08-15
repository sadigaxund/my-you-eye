import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import type { ShowcaseEntry } from "../../showcase/types";
import { useSteps } from ".";
import type { Video } from "../../scenes";

const demoVideo: Video = {
  meta: { fps: 30 },
  scenes: [
    { kind: "title", title: "Quarterly review", subtitle: "Growth team" },
    {
      kind: "bullets",
      heading: "Agenda",
      bullets: [{ text: "Revenue" }, { text: "Churn" }, { text: "Roadmap" }],
    },
    { kind: "outro", title: "Thanks for watching!" },
  ],
};

function CustomControls() {
  const { current, index, steps, isFirst, isLast, next, prev, goToScene } = useSteps(demoVideo);
  if (!current) return null;
  return (
    <div className="flex flex-col gap-stack">
      <div className="flex items-center gap-inline">
        <Badge variant="neutral">scene {current.sceneIndex + 1}</Badge>
        <Badge variant="neutral">step {current.stepIndex + 1}</Badge>
        <span className="font-mono text-xs text-muted">
          {index + 1} / {steps.length} — {current.scene.kind}
        </span>
      </div>
      <p className="min-h-8 text-sm text-fg">{current.content ?? <span className="text-muted">(no content)</span>}</p>
      <div className="flex items-center gap-inline">
        <Button size="sm" variant="secondary" disabled={isFirst} onClick={prev}>Prev</Button>
        <Button size="sm" variant="primary" disabled={isLast} onClick={next}>Next</Button>
        <Button size="sm" variant="ghost" onClick={() => goToScene(0)}>Restart</Button>
      </div>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "useSteps",
  group: "scenes",
  description:
    "Headless step-navigation hook that flattens a whole Video into one (scene, step) list.",
  demos: [{ name: "Custom controls built from useSteps", render: () => <CustomControls /> }],
};
export default entry;
