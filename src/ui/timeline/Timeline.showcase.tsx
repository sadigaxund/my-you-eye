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

const entry: ShowcaseEntry = {
  title: "Timeline",
  group: "data",
  description: "Data-driven horizontal/vertical event sequences with optional lanes — roadmaps, request traces, git history. Not a Gantt chart; draws no graph edges.",
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
