import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Spotlight } from ".";

// Fixed 24px row height (text-xs + leading-6) so each code line's `y` is
// predictable — index * 24 — the same "caller supplies exact coordinates"
// convention Camera/Morph's showcases use for their own boxes.
const ROW = 24;
function codeLine(text: string, tone: string) {
  return <div className={["whitespace-pre leading-6", tone].join(" ")}>{text}</div>;
}

const NODE_W = 96;
const NODE_H = 56;
const NODE_GAP = 40;
function diagramNode(label: string, x: number) {
  return (
    <div
      key={label}
      style={{ position: "absolute", left: x, top: 0, width: NODE_W, height: NODE_H }}
      className="flex items-center justify-center rounded-ui bg-secondary text-xs text-secondary-fg"
    >
      {label}
    </div>
  );
}
function diagramLine(x: number) {
  return <div key={x} style={{ position: "absolute", left: x, top: NODE_H / 2, width: NODE_GAP, height: 2 }} className="bg-border" />;
}

function statCard(label: string, value: string, x: number, y: number) {
  return (
    <div
      key={label}
      style={{ position: "absolute", left: x, top: y, width: 160, height: 80 }}
      className="flex flex-col justify-center gap-tight rounded-ui bg-surface px-panel"
    >
      <span className="text-xs text-muted">{label}</span>
      <span className="text-lg font-semibold text-fg">{value}</span>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Spotlight",
  group: "motion",
  description:
    "Dims everything except a focused rect via a box-shadow cut-out — never backdrop-filter.",
  demos: [
    {
      name: "One line of code",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative w-full max-w-md rounded-ui bg-code-bg p-panel-sm font-mono text-xs">
            <Spotlight focus={{ x: 0, y: 2 * ROW, width: 260, height: ROW }} duration="slow">
              {codeLine("function retry(fn) {", "text-code-muted")}
              {codeLine("  for (let i = 0; i < 3; i++) {", "text-code-fg")}
              {codeLine("    try { return fn(); }", "text-primary")}
              {codeLine("    catch (e) { continue; }", "text-code-fg")}
              {codeLine("  }", "text-code-muted")}
              {codeLine("}", "text-code-muted")}
            </Spotlight>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "One node in a diagram",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative h-16 w-full max-w-md">
            <Spotlight focus={{ x: NODE_W + NODE_GAP, y: 0, width: NODE_W, height: NODE_H }} duration="slow">
              {diagramLine(NODE_W)}
              {diagramLine(2 * NODE_W + NODE_GAP)}
              {diagramNode("api", 0)}
              {diagramNode("queue", NODE_W + NODE_GAP)}
              {diagramNode("worker", 2 * (NODE_W + NODE_GAP))}
            </Spotlight>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "One card in a dashboard",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative h-44 w-full max-w-md">
            <Spotlight focus={{ x: 176, y: 0, width: 160, height: 80 }} duration="slow">
              {statCard("Requests", "48.2k", 0, 0)}
              {statCard("Error rate", "0.4%", 176, 0)}
              {statCard("p95 latency", "220ms", 0, 96)}
              {statCard("Uptime", "99.98%", 176, 96)}
            </Spotlight>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
