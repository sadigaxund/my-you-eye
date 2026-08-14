import type { ShowcaseEntry } from "../../showcase/types";
import { Timeline } from ".";
import type { TimelineEvent } from ".";

const roadmap: TimelineEvent[] = [
  { at: 0, label: "Kickoff", state: "done" },
  { at: 1, label: "Design", state: "done" },
  { at: 2, label: "Build", state: "active" },
  { at: 3, label: "Beta", state: "pending" },
  { at: 4, label: "Launch", state: "pending" },
];

const requestTrace: TimelineEvent[] = [
  { at: 0, label: "GET /orders", lane: "client", state: "done" },
  { at: 1, label: "auth check", lane: "api", state: "done" },
  { at: 2, label: "query", lane: "db", state: "done" },
  { at: 3, label: "500 error", lane: "db", state: "error" },
  { at: 4, label: "retry", lane: "api", state: "active" },
];

const gitHistory: TimelineEvent[] = [
  { at: 0, label: "Initial commit", description: "Project scaffold", state: "done" },
  { at: 1, label: "Add auth", description: "JWT-based sessions", state: "done" },
  { at: 2, label: "Fix rate limiter", description: "Off-by-one in the token bucket", state: "error" },
  { at: 3, label: "Ship v1.2", description: "In progress", state: "active" },
];

const releaseLanes: TimelineEvent[] = [
  { at: 0, label: "Plan", lane: "PM", state: "done" },
  { at: 1, label: "Spec review", lane: "PM", state: "done" },
  { at: 0, label: "Scaffold", lane: "Eng", state: "done" },
  { at: 1, label: "Implement", lane: "Eng", state: "active" },
  { at: 2, label: "Release notes", lane: "PM", state: "pending" },
];

const deployTrace: TimelineEvent[] = [
  { at: 0, until: 120, label: "build", lane: "ci", state: "done" },
  { at: 120, until: 190, label: "test", lane: "ci", state: "done" },
  { at: 190, until: 210, label: "publish", lane: "ci", state: "done" },
  { at: 200, until: 260, label: "canary", lane: "deploy", state: "active" },
  { at: 260, until: 300, label: "rollout", lane: "deploy", state: "pending" },
  { at: 150, until: 175, label: "flake", lane: "ci", state: "error" },
];

const entry: ShowcaseEntry = {
  title: "Timeline",
  group: "data",
  description: "Data-driven horizontal/vertical event sequences with optional lanes — roadmaps, request traces, git history. Events can be instants or spans (`until`). Draws no graph edges.",
  demos: [
    {
      name: "Horizontal — single lane",
      render: () => (
        <div className="max-w-xl mx-auto">
          <Timeline events={roadmap} />
        </div>
      ),
    },
    {
      name: "Horizontal — lanes",
      description: "A request trace across client/api/db lanes.",
      render: () => (
        <div className="max-w-xl mx-auto">
          <Timeline events={requestTrace} />
        </div>
      ),
    },
    {
      name: "Spans — events with a duration",
      description: "Give an event `until` and it renders as a bar from `at` to `until` with its marker at the start, instead of a point. This is what makes a CI/deploy trace or a roadmap with real durations expressible; without it every event is an instant.",
      render: () => (
        <div className="max-w-xl mx-auto">
          <Timeline events={deployTrace} axis={(ms) => `${ms}ms`} />
        </div>
      ),
    },
    {
      name: "Shared scale across lanes",
      description: "Every lane is measured against ONE scale spanning all events. Each lane previously computed its own min/max, so two events with the same `at` in different lanes landed at different x positions — which defeats the only reason to have parallel lanes. Compare the `at: 200` boundary: ci's \"publish\" ends where deploy's \"canary\" begins, and they line up.",
      render: () => (
        <div className="max-w-xl mx-auto">
          <Timeline events={deployTrace} lanes={["ci", "deploy"]} axis={(ms) => `${ms}ms`} />
        </div>
      ),
    },
    {
      name: "Label placement",
      description: "Point events sit proportionally to `at`, so close neighbours collide — and the label is by far the widest part of an event. `stagger` (default) alternates above/below the rule so adjacent labels can never overlap, without measuring anything. `below` is tighter but only safe when events are well separated.",
      render: () => (
        <div className="max-w-xl mx-auto flex flex-col gap-panel-lg">
          {(["stagger", "below"] as const).map((placement) => (
            <div key={placement} className="flex flex-col gap-tight">
              <span className="text-xs font-medium text-muted">labelPlacement=&quot;{placement}&quot;</span>
              <Timeline events={roadmap} labelPlacement={placement} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Density",
      render: () => (
        <div className="max-w-sm mx-auto flex flex-col gap-panel-lg">
          {(["comfortable", "compact"] as const).map((density) => (
            <div key={density} className="flex flex-col gap-tight">
              <span className="text-xs font-medium text-muted">density=&quot;{density}&quot;</span>
              <Timeline orientation="vertical" events={gitHistory} density={density} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Progress (playhead reveal)",
      description: "`progress` is a playhead over the `at` domain, not an item counter — events appear as the head passes their `at`, and a span's bar is CLIPPED at the head so it grows rather than popping in whole. Pure function of the prop, no internal timer (TODO.md D4).",
      render: () => (
        <div className="max-w-xl mx-auto flex flex-col gap-panel-lg">
          {[0.3, 0.65, 1].map((p) => (
            <div key={p} className="flex flex-col gap-tight">
              <span className="text-xs font-medium text-muted">progress={p}</span>
              <Timeline events={deployTrace} lanes={["ci", "deploy"]} progress={p} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Vertical — single lane",
      render: () => (
        <div className="max-w-sm mx-auto">
          <Timeline orientation="vertical" events={gitHistory} />
        </div>
      ),
    },
    {
      name: "Vertical — lanes",
      render: () => (
        <div className="max-w-lg mx-auto">
          <Timeline orientation="vertical" events={releaseLanes} lanes={["PM", "Eng"]} />
        </div>
      ),
    },
  ],
};
export default entry;
