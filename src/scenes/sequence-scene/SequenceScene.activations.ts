// Pure data shaping for SequenceScene — no React. Turns `SequenceStep[]`
// (the schema's authored shape) into `SequenceDiagram`'s own `SequenceItem[]`
// + derived `SequenceActivation[]`.
//
// Activation derivation implements scenes.diagram.ts's documented rule
// verbatim: "a participant is busy from the message that reaches it until
// the one it sends back" — a single active/inactive flag per participant,
// not a call-stack depth model. A participant becomes busy the moment a
// message reaches it (unless already busy) and stops being busy the moment
// it next sends a message anywhere (not only a "reply" back to its
// original caller) — the schema deliberately doesn't model nested calls, so
// neither does this. Self-messages (`from === to`, a self-call loop) never
// change activation state; they're a call a participant makes to itself,
// not a hand-off.

import type { SequenceItem, SequenceActivation } from "../../ui/patterns/sequence-diagram";
import type { SequenceStep } from "../schema";

export function sequenceItems(messages: SequenceStep[], ids: string[]): SequenceItem[] {
  return messages.map((step, i) => {
    const id = ids[i];
    if (step.type === "note") return { type: "note", id, participants: step.on, text: step.text };
    return { type: "message", id, from: step.from, to: step.to, label: step.label, kind: step.kind };
  });
}

export function deriveActivations(messages: SequenceStep[], ids: string[]): SequenceActivation[] {
  const busy = new Map<string, string>(); // participant -> start item id
  const out: SequenceActivation[] = [];

  messages.forEach((step, i) => {
    if (step.type !== "message" || step.from === step.to) return;
    const id = ids[i];

    const startId = busy.get(step.from);
    if (startId != null) {
      out.push({ id: `act-${out.length}`, participant: step.from, start: startId, end: id });
      busy.delete(step.from);
    }
    if (!busy.has(step.to)) busy.set(step.to, id);
  });

  // Anyone still busy when the sequence ends stays active to the bottom of
  // the diagram (SequenceActivation.end omitted = "for the rest of the
  // sequence", per its own doc comment).
  for (const [participant, start] of busy) {
    out.push({ id: `act-${out.length}`, participant, start });
  }
  return out;
}
