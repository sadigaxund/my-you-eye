// Diagram + sequence checks — the highest-value part of the validator per
// the repo owner's framing (see scenes.diagram.ts's top comment): "cheaper
// models tend to create nodes, and just wire up the lines without any care
// about how it will look at the end." Every id an author writes in a step
// (reveal/focus/connect/flow/annotate.target/from/to/on) is cross-checked
// against the ids actually declared for that scene.

import {
  isRecord, isString, isFiniteNumber,
  pushError, pushWarning,
  requireString, optionalString, optionalEnum, requireArray,
  checkDuplicateStepIds, warnIfNoSay,
} from "./validate.helpers";
import type { ValidationIssue } from "./validate.helpers";

const MAX_DIAGRAM_NODES = 12;
const EDGE_KINDS = ["sync", "async", "data", "error"] as const;
const EDGE_ROUTES = ["orthogonal", "bezier", "stepped", "straight"] as const;

function edgeId(edge: Record<string, unknown>): string | undefined {
  if (isString(edge.id)) return edge.id;
  if (isString(edge.from) && isString(edge.to)) return `${edge.from}->${edge.to}`;
  return undefined;
}

export function validateDiagram(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  optionalString(issues, `${path}.title`, scene.title, "title");
  optionalEnum(issues, `${path}.preset`, scene.preset, "preset", ["architecture", "dataflow", "state", "flowchart"] as const);
  optionalEnum(issues, `${path}.layout`, scene.layout, "layout", ["layered-horizontal", "layered-vertical", "grid"] as const);

  const nodes = requireArray(issues, `${path}.nodes`, scene.nodes, "nodes");
  const edges = requireArray(issues, `${path}.edges`, scene.edges, "edges", 0);
  const steps = requireArray(issues, `${path}.steps`, scene.steps, "steps", 0);
  const groups = Array.isArray(scene.groups) ? scene.groups : [];

  const nodeIds = new Set<string>();
  const groupIds = new Set<string>();

  if (nodes) {
    if (nodes.length > MAX_DIAGRAM_NODES) {
      pushWarning(issues, `${path}.nodes`, `${nodes.length} nodes is a lot for one diagram — consider splitting past ~${MAX_DIAGRAM_NODES}`);
    }
    nodes.forEach((n, i) => {
      const nPath = `${path}.nodes[${i}]`;
      if (!isRecord(n)) { pushError(issues, nPath, "node must be an object"); return; }
      const id = requireString(issues, `${nPath}.id`, n.id, "id");
      requireString(issues, `${nPath}.label`, n.label, "label");
      if (id) {
        if (nodeIds.has(id)) pushError(issues, `${nPath}.id`, `duplicate node id "${id}"`);
        nodeIds.add(id);
      }
    });
  }

  groups.forEach((g, i) => {
    const gPath = `${path}.groups[${i}]`;
    if (!isRecord(g)) { pushError(issues, gPath, "group must be an object"); return; }
    const id = requireString(issues, `${gPath}.id`, g.id, "id");
    requireString(issues, `${gPath}.label`, g.label, "label");
    if (id) {
      if (groupIds.has(id)) pushError(issues, `${gPath}.id`, `duplicate group id "${id}"`);
      groupIds.add(id);
    }
  });

  // A node's own `group` reference — checked after both id sets are built.
  if (nodes) {
    nodes.forEach((n, i) => {
      if (!isRecord(n) || n.group == null) return;
      if (!isString(n.group) || !groupIds.has(n.group)) {
        pushError(issues, `${path}.nodes[${i}].group`, `group "${String(n.group)}" does not match any DiagramGroup id`);
      }
    });
  }

  const targetIds = new Set([...nodeIds, ...groupIds]);
  const edgeIds = new Set<string>();

  if (edges) {
    edges.forEach((e, i) => {
      const ePath = `${path}.edges[${i}]`;
      if (!isRecord(e)) { pushError(issues, ePath, "edge must be an object"); return; }
      const from = requireString(issues, `${ePath}.from`, e.from, "from");
      const to = requireString(issues, `${ePath}.to`, e.to, "to");
      if (from && !nodeIds.has(from)) pushError(issues, `${ePath}.from`, `"${from}" does not match any node id`);
      if (to && !nodeIds.has(to)) pushError(issues, `${ePath}.to`, `"${to}" does not match any node id`);
      optionalEnum(issues, `${ePath}.kind`, e.kind, "kind", EDGE_KINDS);
      optionalEnum(issues, `${ePath}.route`, e.route, "route", EDGE_ROUTES);
      const id = edgeId(e);
      if (id) {
        if (edgeIds.has(id)) pushError(issues, `${ePath}.id`, `duplicate edge id "${id}" — set an explicit id to disambiguate`);
        edgeIds.add(id);
      }
    });
  }

  if (!steps) return;
  checkDuplicateStepIds(issues, `${path}.steps`, steps);
  warnIfNoSay(issues, path, steps);

  steps.forEach((step, i) => {
    const sPath = `${path}.steps[${i}]`;
    if (!isRecord(step)) { pushError(issues, sPath, "step must be an object"); return; }
    checkIdList(issues, `${sPath}.reveal`, step.reveal, targetIds, "node or group");
    checkIdList(issues, `${sPath}.focus`, step.focus, targetIds, "node or group");
    checkIdList(issues, `${sPath}.connect`, step.connect, edgeIds, "edge");
    checkIdList(issues, `${sPath}.flow`, step.flow, edgeIds, "edge");
    if (step.annotate != null) {
      if (!Array.isArray(step.annotate)) {
        pushError(issues, `${sPath}.annotate`, "annotate must be an array");
      } else {
        step.annotate.forEach((a, ai) => {
          const aPath = `${sPath}.annotate[${ai}]`;
          if (!isRecord(a)) { pushError(issues, aPath, "annotation must be an object"); return; }
          requireString(issues, `${aPath}.text`, a.text, "text");
          if (!isString(a.target) || !targetIds.has(a.target)) {
            pushError(issues, `${aPath}.target`, `target "${String(a.target)}" does not match any node or group id`);
          }
        });
      }
    }
  });
}

function checkIdList(issues: ValidationIssue[], path: string, value: unknown, known: Set<string>, kind: string): void {
  if (value == null) return;
  if (!Array.isArray(value)) { pushError(issues, path, `${path} must be an array of ${kind} ids`); return; }
  value.forEach((id, i) => {
    if (!isString(id) || !known.has(id)) {
      pushError(issues, `${path}[${i}]`, `"${String(id)}" does not match any ${kind} id`);
    }
  });
}

export function validateSequence(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  optionalString(issues, `${path}.title`, scene.title, "title");
  const participants = requireArray(issues, `${path}.participants`, scene.participants, "participants");
  const messages = requireArray(issues, `${path}.messages`, scene.messages, "messages");

  const participantIds = new Set<string>();
  if (participants) {
    participants.forEach((p, i) => {
      const pPath = `${path}.participants[${i}]`;
      if (!isRecord(p)) { pushError(issues, pPath, "participant must be an object"); return; }
      const id = requireString(issues, `${pPath}.id`, p.id, "id");
      requireString(issues, `${pPath}.label`, p.label, "label");
      if (id) {
        if (participantIds.has(id)) pushError(issues, `${pPath}.id`, `duplicate participant id "${id}"`);
        participantIds.add(id);
      }
    });
  }

  if (!messages) return;
  checkDuplicateStepIds(issues, `${path}.messages`, messages);
  warnIfNoSay(issues, path, messages);

  messages.forEach((m, i) => {
    const mPath = `${path}.messages[${i}]`;
    if (!isRecord(m)) { pushError(issues, mPath, "message must be an object"); return; }
    optionalEnum(issues, `${mPath}.type`, m.type, "type", ["message", "note"] as const);
    if (m.type === "note") {
      requireString(issues, `${mPath}.text`, m.text, "text");
      const on = requireArray(issues, `${mPath}.on`, m.on, "on");
      on?.forEach((id, oi) => {
        if (!isString(id) || !participantIds.has(id)) {
          pushError(issues, `${mPath}.on[${oi}]`, `"${String(id)}" does not match any participant id`);
        }
      });
    } else {
      const from = requireString(issues, `${mPath}.from`, m.from, "from");
      const to = requireString(issues, `${mPath}.to`, m.to, "to");
      if (from && !participantIds.has(from)) pushError(issues, `${mPath}.from`, `"${from}" does not match any participant id`);
      if (to && !participantIds.has(to)) pushError(issues, `${mPath}.to`, `"${to}" does not match any participant id`);
      optionalEnum(issues, `${mPath}.kind`, m.kind, "kind", EDGE_KINDS);
      optionalString(issues, `${mPath}.label`, m.label, "label");
    }
    if (m.hold != null && !isFiniteNumber(m.hold) && !isString(m.hold)) {
      pushError(issues, `${mPath}.hold`, "hold must be a Beat (a number of frames or a semantic name)");
    }
  });
}
