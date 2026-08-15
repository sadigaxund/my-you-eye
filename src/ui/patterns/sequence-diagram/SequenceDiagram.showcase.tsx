import type { ShowcaseEntry } from "../../../showcase/types";
import { SequenceDiagram } from ".";
import type { SequenceItem, SequenceActivation } from ".";

const participants = [
  { id: "client", label: "Client" },
  { id: "api", label: "API" },
  { id: "db", label: "DB" },
];

const items: SequenceItem[] = [
  { type: "message", id: "m1", from: "client", to: "api", label: "GET /users", kind: "sync" },
  { type: "message", id: "m2", from: "api", to: "api", label: "validate()", kind: "sync" },
  { type: "message", id: "m3", from: "api", to: "db", label: "SELECT *", kind: "sync" },
  { type: "note", id: "n1", participants: ["db"], text: "Index scan, ~2ms" },
  { type: "message", id: "m4", from: "db", to: "api", label: "rows[]", kind: "data" },
  { type: "message", id: "m5", from: "api", to: "client", label: "200 OK", kind: "data" },
];

const activations: SequenceActivation[] = [
  { id: "a-api", participant: "api", start: "m1", end: "m5" },
  { id: "a-db", participant: "db", start: "m3", end: "m4" },
];

const errorItems: SequenceItem[] = [
  { type: "message", id: "e1", from: "client", to: "api", label: "POST /orders", kind: "sync" },
  { type: "note", id: "e-note", participants: ["client", "api"], text: "Idempotency key attached to every retry" },
  { type: "message", id: "e2", from: "api", to: "db", label: "INSERT", kind: "sync" },
  { type: "message", id: "e3", from: "db", to: "api", label: "constraint violation", kind: "error" },
  { type: "message", id: "e4", from: "api", to: "api", label: "log + rollback()", kind: "async" },
  { type: "message", id: "e5", from: "api", to: "client", label: "409 Conflict", kind: "error" },
];

const errorActivations: SequenceActivation[] = [
  { id: "e-a-api", participant: "api", start: "e1", end: "e5", accentColor: "danger" },
  { id: "e-a-db", participant: "db", start: "e2", end: "e3" },
];

const entry: ShowcaseEntry = {
  title: "SequenceDiagram",
  group: "patterns",
  description:
    "UML-style sequence diagram with participant lanes, dashed lifelines, messages as ConnectionLayer edges, activation bars and notes. Every coordinate is a multiple of GRID (16), and message arrows come from ConnectionLayer rather than from hand-drawn <path>s.",
  demos: [
    {
      name: "Request flow",
      description: "A synchronous call chain with a self-message (validate()), a note, and two activation bars.",
      render: () => (
        <SequenceDiagram participants={participants} items={items} activations={activations} />
      ),
    },
    {
      name: "Self-messages, spanning note, error path",
      description: "kind=\"error\" and kind=\"async\" styling, a note spanning two lanes, and a danger-accented activation bar.",
      render: () => (
        <SequenceDiagram participants={participants} items={errorItems} activations={errorActivations} />
      ),
    },
    {
      name: "Progress reveal",
      description: "progress (0→1) reveals items strictly in order: fully revealed messages stay drawn, and the in-flight one draws a true prefix of its own route, corner and all for the self-message loop.",
      render: () => (
        <div className="flex flex-col gap-6">
          <SequenceDiagram participants={participants} items={items} activations={activations} progress={0.4} />
          <SequenceDiagram participants={participants} items={items} activations={activations} progress={0.8} />
        </div>
      ),
    },
  ],
};
export default entry;
