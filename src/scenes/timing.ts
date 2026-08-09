// The shared timing spine (TODO.md Phase E §1 / D5).
//
// `sceneSteps` turns any `Scene` into the step list `buildSequence` consumes,
// and `sceneDuration` is the total frame length that falls out of running
// that same step list through `buildSequence`. Both `VideoRoot` (an MP4
// render) and the Presenter (a click-through) call these two functions and
// nothing else to find out "how long is this scene, and where do its step
// boundaries fall". Because there is exactly one place this computation
// happens, the two consumers cannot independently drift out of sync with
// each other — a scene is always exactly as long in the video as it is in
// the live presenter, and a step always starts at the same relative frame
// in both. Every other part of the system (Camera keyframes, Caption
// ranges, per-step reveals) is built by calling `useSequence(sceneSteps(scene),
// scene.pace)` — never by hand-deriving frame numbers.
//
// Pure, no React, no `motion/core` hooks — only the pure `buildSequence`
// function and plain types, so this is unit-testable without rendering.

import type { SequenceStepInput } from "../motion/core";
import { buildSequence } from "../motion/core";
import type {
  Scene,
  TitleScene,
  BulletScene,
  CodeScene,
  CodeStep,
  TerminalScene,
  CompareScene,
  WalkthroughScene,
  OutroScene,
} from "./schema/scenes";
import type { DiagramScene, SequenceScene, SequenceStep } from "./schema/scenes.diagram";
import type { ChartScene, StatScene } from "./schema/scenes.data";

const MIN_SCENE_SECONDS = 1;

/** Derives a step's `SequenceStepInput` name/key the same way everywhere —
 * `sceneSteps` uses it to build the step list, and every scene component
 * uses it again to look its own step's `SequenceRange` up out of
 * `useSequence`'s returned map, so the two can never disagree on a step's
 * identity. */
export function stepName(id: string | undefined, index: number): string {
  return id ?? `step-${index}`;
}

function joinText(parts: (string | undefined | null)[]): string | undefined {
  const joined = parts.filter((p): p is string => Boolean(p && p.length > 0)).join(" ");
  return joined.length > 0 ? joined : undefined;
}

function titleSteps(scene: TitleScene): SequenceStepInput[] {
  return [{ name: "title", content: joinText([scene.chapter, scene.title, scene.subtitle]) }];
}

function bulletSteps(scene: BulletScene): SequenceStepInput[] {
  return scene.bullets.map((bullet, i) => ({
    name: stepName(bullet.id, i),
    content: bullet.say ?? joinText([bullet.text, ...(bullet.children ?? [])]),
    hold: bullet.hold,
  }));
}

/** A code step's on-screen "content" for pacing purposes: narration first,
 * then whatever text is actually being read onto the screen this step —
 * the typed-in source (only meaningful while typing), callout copy, or the
 * highlighted substrings. A step that only moves the camera / dims lines
 * with none of the above falls back to the default beat. */
function codeStepContent(step: CodeStep, sceneCode: string, isFirst: boolean): string | undefined {
  if (step.say) return step.say;
  if (step.typed) return step.code ?? (isFirst ? sceneCode : undefined);
  if (step.annotate && step.annotate.length > 0) return joinText(step.annotate.map((a) => a.text));
  if (step.highlight && step.highlight.length > 0) return joinText(step.highlight);
  return undefined;
}

function codeSteps(scene: CodeScene): SequenceStepInput[] {
  return scene.steps.map((step, i) => ({
    name: stepName(step.id, i),
    content: codeStepContent(step, scene.code, i === 0),
    hold: step.hold,
  }));
}

function terminalSteps(scene: TerminalScene): SequenceStepInput[] {
  return scene.entries.map((entry, i) => ({
    name: stepName(entry.id, i),
    content: entry.say ?? joinText([entry.command, entry.spinner, entry.output]),
    hold: entry.hold,
  }));
}

function diagramSteps(scene: DiagramScene): SequenceStepInput[] {
  return scene.steps.map((step, i) => ({
    name: stepName(step.id, i),
    content: step.say ?? (step.annotate && step.annotate.length > 0 ? joinText(step.annotate.map((a) => a.text)) : undefined),
    hold: step.hold,
  }));
}

function sequenceStepContent(step: SequenceStep): string | undefined {
  if (step.say) return step.say;
  return step.type === "note" ? step.text : step.label;
}

function sequenceSteps(scene: SequenceScene): SequenceStepInput[] {
  return scene.messages.map((step, i) => ({
    name: stepName(step.id, i),
    content: sequenceStepContent(step),
    hold: step.hold,
  }));
}

function chartSteps(scene: ChartScene): SequenceStepInput[] {
  if (!scene.steps || scene.steps.length === 0) {
    return [{ name: "chart", content: joinText([scene.title, scene.subtitle]) }];
  }
  return scene.steps.map((step, i) => ({
    name: stepName(step.id, i),
    content: step.say ?? joinText([step.callout?.label, step.focus]),
    hold: step.hold,
  }));
}

function statSteps(scene: StatScene): SequenceStepInput[] {
  return scene.stats.map((stat, i) => ({
    name: stepName(stat.id, i),
    content: stat.say ?? joinText([stat.label, stat.text ?? (stat.value != null ? String(stat.value) : undefined)]),
    hold: stat.hold,
  }));
}

function compareSteps(scene: CompareScene): SequenceStepInput[] {
  return [{ name: "compare", content: scene.say ?? joinText([scene.heading, scene.before.label, scene.after.label]) }];
}

function walkthroughSteps(scene: WalkthroughScene): SequenceStepInput[] {
  return scene.steps.map((step, i) => ({
    name: stepName(step.id, i),
    content: step.say ?? joinText([step.annotate, step.type]),
    hold: step.hold,
  }));
}

function outroSteps(scene: OutroScene): SequenceStepInput[] {
  return [{ name: "outro", content: joinText([scene.title, scene.subtitle, scene.cta, ...(scene.links ?? []).map((l) => l.label)]) }];
}

/**
 * `Scene` -> the step list `buildSequence` consumes. Handles all eleven
 * `SceneKind`s — including the six not yet rendered by `SceneRenderer` —
 * because both `VideoRoot` and the Presenter need every scene's duration up
 * front (e.g. to lay out a `TransitionSeries`), long before that scene's own
 * renderer exists.
 *
 * For scene kinds whose steps are implicit rather than an authored `steps`
 * array (title/compare/outro are each a single beat; bullets and terminal
 * entries are their own steps), the derivation is documented per-kind above.
 */
export function sceneSteps(scene: Scene): SequenceStepInput[] {
  switch (scene.kind) {
    case "title": return titleSteps(scene);
    case "bullets": return bulletSteps(scene);
    case "code": return codeSteps(scene);
    case "terminal": return terminalSteps(scene);
    case "diagram": return diagramSteps(scene);
    case "sequence": return sequenceSteps(scene);
    case "chart": return chartSteps(scene);
    case "stat": return statSteps(scene);
    case "compare": return compareSteps(scene);
    case "walkthrough": return walkthroughSteps(scene);
    case "outro": return outroSteps(scene);
    default: {
      // Exhaustiveness guard: TypeScript flags a missing case above the
      // moment `SceneKind` grows a member, the same discipline
      // `SceneRenderer`'s switch uses.
      const _exhaustive: never = scene;
      throw new Error(`sceneSteps: unhandled scene kind ${(_exhaustive as Scene).kind}`);
    }
  }
}

/**
 * Total frame length of a scene: the last step's `endFrame` from running
 * `sceneSteps(scene)` through the exact same `buildSequence` the video and
 * presenter both use, floored at one second so an empty or misauthored
 * `steps: []` array never collapses a scene (and its `<Sequence>`/transition)
 * to zero frames.
 */
export function sceneDuration(scene: Scene, fps: number): number {
  const steps = sceneSteps(scene);
  const ranges = buildSequence(steps, fps, scene.pace);
  const names = Object.keys(ranges);
  const lastEnd = names.length > 0 ? ranges[names[names.length - 1]].endFrame : 0;
  return Math.max(Math.round(fps * MIN_SCENE_SECONDS), lastEnd);
}
