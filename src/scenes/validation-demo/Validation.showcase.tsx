import type { ShowcaseEntry } from "../../showcase/types";
import { Badge } from "../../ui/badge";
import { validateVideo } from "../schema";
import type { ValidationIssue, Video } from "../schema";

// Deliberately broken on purpose, in every way validate.ts checks for:
// an unknown scene kind, a dangling diagram id in every one of
// reveal/connect/flow/annotate.target, a node "group" that doesn't match
// any DiagramGroup, an out-of-bounds CodeStep.focus range, a bar chart
// whose series length doesn't match its categories, a duplicate scene id,
// a duplicate step id, and (as warnings, not errors) a bullet list that's
// too long and a scene where no step ever sets `say`.
const broken: Video = {
  scenes: [
    {
      kind: "bullets",
      id: "intro",
      bullets: [
        { text: "One" }, { text: "Two" }, { text: "Three" }, { text: "Four" },
        { text: "Five" }, { text: "Six" }, { text: "Seven" }, { text: "Eight" },
      ],
    },
    {
      kind: "code",
      id: "intro",
      code: "const x = 1;\nconst y = 2;",
      steps: [
        { id: "step-1", say: "Look at this range", focus: [1, 9] },
        { id: "step-1", say: "duplicate step id" },
      ],
    },
    {
      kind: "diagram",
      nodes: [{ id: "api", label: "API", group: "no-such-group" }],
      edges: [{ from: "api", to: "missing-node" }],
      steps: [
        { reveal: ["missing-node"], connect: ["api->missing-node"], flow: ["nope"], annotate: [{ target: "ghost", text: "?" }] },
      ],
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        categories: ["Mon", "Tue", "Wed"],
        series: [{ label: "Requests", data: [10, 20] }],
      },
    },
    // @ts-expect-error — deliberately an unknown kind, to exercise the "unknown scene kind" check.
    { kind: "storyboard", title: "Not a real scene kind" },
  ],
};

const SEVERITY_VARIANT: Record<ValidationIssue["severity"], "danger" | "warning"> = {
  error: "danger",
  warning: "warning",
};

function IssueRow({ issue }: { issue: ValidationIssue }) {
  return (
    <li className="flex items-start gap-inline py-compact-y">
      <Badge variant={SEVERITY_VARIANT[issue.severity]} tone="soft" className="mt-0.5 shrink-0 uppercase">
        {issue.severity}
      </Badge>
      <div className="flex flex-col gap-tight min-w-0">
        <code className="text-xs text-muted break-all">{issue.path || "(root)"}</code>
        <p className="text-sm text-fg">{issue.message}</p>
      </div>
    </li>
  );
}

function IssueList({ video }: { video: Video }) {
  const issues = validateVideo(video);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  return (
    <div className="flex flex-col gap-stack">
      <p className="text-sm text-muted">
        {errors.length} error{errors.length === 1 ? "" : "s"}, {warnings.length} warning{warnings.length === 1 ? "" : "s"}
      </p>
      <ul className="divide-y divide-border rounded-ui border border-border bg-surface px-panel">
        {issues.map((issue, i) => (
          <IssueRow key={i} issue={issue} />
        ))}
      </ul>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Validation",
  group: "scenes",
  description: "validateVideo(video) run against a deliberately broken Video, so every runtime check is visible.",
  demos: [
    {
      name: "Deliberately broken video",
      render: () => <IssueList video={broken} />,
    },
    {
      name: "Valid, minimal video",
      description: "The same call against well-formed data returns an empty list.",
      render: () => (
        <IssueList
          video={{
            scenes: [
              { kind: "title", title: "All good" },
            ],
          }}
        />
      ),
    },
  ],
};
export default entry;
