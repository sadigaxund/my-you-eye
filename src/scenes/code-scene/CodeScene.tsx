import { useId, useMemo } from "react";
import { CodeBlock } from "../../ui/code-block";
import { Annotation } from "../../ui/annotation";
import { Camera } from "../../motion/camera";
import { useProgress, useSequence, useTimeline } from "../../motion/core";
import { CodeDiff } from "../code-diff";
import { sceneSteps, stepName } from "../timing";
import { runningSources, buildHighlightRanges, lineElementId } from "./CodeScene.sources";
import { useCodeCameraKeyframes } from "./CodeScene.useCamera";
import { useCodeAnnotations } from "./CodeScene.useAnnotations";
import type { CodeScene as CodeSceneData } from "../schema";

export interface CodeSceneProps {
  scene: CodeSceneData;
}

/** Fraction of a rewriting step spent in `CodeDiff` before it settles into a
 * plain `CodeBlock` of the new source. Not a prop: a scene author picks the
 * step's pace, and how that budget splits between "show the change" and "let
 * the result be read" is a property of the scene format, not of one call
 * site (AGENTS.md D5 — the schema is the API). */
const DIFF_SHARE = 0.55;

/** Which step is "current" at `frame`: the last one whose own range has
 * started. Only this one step's code/diff/typing is rendered — earlier
 * steps are already fully settled into whatever source they left behind
 * (which the next step's `beforeSource` captures), later steps haven't
 * happened yet. */
function currentStepIndex(scene: CodeSceneData, ranges: ReturnType<typeof useSequence>, frame: number): number {
  let index = 0;
  scene.steps.forEach((step, i) => {
    if (frame >= ranges[stepName(step.id, i)].startFrame) index = i;
  });
  return index;
}

/**
 * `CodeBlock` with the filename tab, per-step `focus` dimming + `Camera`
 * framing, `highlight` substrings, `typed` character reveal, and a
 * `CodeDiff` cross-fade for any step that supplies `code` (TODO.md Phase
 * E). Every step's timing comes from `useSequence(sceneSteps(scene),
 * scene.pace)` — the same spine `sceneDuration` uses, so this scene can
 * never show a step for a different length of time than the MP4 render
 * budgets for it.
 *
 * `typed` reveals character-by-character via the same `useProgress()`
 * primitive `TypeText` itself is built on, sliced directly into
 * `CodeBlock`'s `code` prop rather than nesting an actual `<TypeText>` —
 * `TypeText` renders plain, untokenized text, and there is no way to nest
 * it inside `CodeBlock` without either duplicating the visible text or
 * losing syntax highlighting/the line gutter while typing. This is a
 * deliberate, documented deviation from a literal "wrap it in TypeText"
 * reading; the underlying timing primitive is shared, only the leaf
 * rendering differs.
 *
 * Camera keyframes come from real DOM measurement of each `focus` range
 * (`CodeScene.useCamera.ts`), never a hardcoded line-height constant — the
 * exact class of bug AGENTS.md TODO A1 fixed for `CodeBlock`'s own overlay.
 *
 * `step.annotate` (`CodeScene.useAnnotations.ts`) mounts `Annotation`s as
 * plain DOM siblings of `CodeBlock`/`CodeDiff` *inside* `Camera`'s own
 * transformed layer, targeting the same untransformed coordinates
 * `measureRelative` already produces for the keyframes above — so a
 * callout pans/zooms with the code exactly like `DiagramScene`'s node
 * annotations pan/zoom with `Canvas`, with no separate sync code.
 */
export function CodeScene({ scene }: CodeSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame } = useTimeline();
  const blockId = `code-${useId().replace(/:/g, "")}`;

  const { before, after } = useMemo(() => runningSources(scene), [scene]);
  const hasSteps = scene.steps.length > 0;
  const index = hasSteps ? currentStepIndex(scene, ranges, frame) : 0;
  // A scene authored with no steps at all (invalid per the validator, but
  // this component still shouldn't crash on it) falls back to a static,
  // unanimated display of the scene's own source.
  const step = hasSteps
    ? scene.steps[index]
    : { id: undefined, focus: undefined, highlight: undefined, typed: false, code: undefined, annotate: undefined };
  const range = hasSteps ? ranges[stepName(step.id, index)] : { startFrame: 0, endFrame: 30 };
  const prevSource = hasSteps ? before[index] : scene.code;
  const nextSource = hasSteps ? after[index] : scene.code;

  const stepProgress = useProgress({ delay: range.startFrame, duration: Math.max(1, range.endFrame - range.startFrame) });
  const { containerRef, keyframes } = useCodeCameraKeyframes(scene, ranges, blockId);
  const { annotations, containerWidth } = useCodeAnnotations(step.annotate, containerRef, blockId);

  const showLineNumbers = scene.lineNumbers !== false;
  const highlightEnabled = Boolean(scene.lang);
  const highlightRanges = useMemo(
    () => buildHighlightRanges(nextSource, step.focus, step.highlight),
    [nextSource, step.focus, step.highlight],
  );

  // A step that rewrites the code spends only its first `DIFF_SHARE` showing
  // the diff, then settles into the ordinary CodeBlock for the rest. Running
  // the diff for the whole step left the viewer staring at red/green gutter
  // chrome until the step ended, so "the code now" was never actually shown
  // — the step's own `focus` framing and highlights had nothing to land on,
  // and the next step began from what still looked like a pending change.
  const diffFrames = Math.max(1, Math.round((range.endFrame - range.startFrame) * DIFF_SHARE));
  const isDiff = !step.typed && nextSource !== prevSource && frame < range.startFrame + diffFrames;
  const isTyped = Boolean(step.typed);
  const typedCode = isTyped ? nextSource.slice(0, Math.floor(nextSource.length * stepProgress)) : nextSource;

  return (
    <div className="flex h-full w-full flex-col gap-stack bg-bg p-panel-xl text-fg">
      <div ref={containerRef} className="relative min-h-0 flex-1">
        <Camera keyframes={keyframes} className="h-full w-full">
          {/* Camera's transformed layer is a plain 100%×100% block, so a
              short file used to sit pinned to its top edge with the rest of
              the 16:9 frame empty. Centring the panel (and letting it size to
              its content via `max-h-full` instead of `h-full`) is what makes
              the frame read as composed rather than as a half-filled page.
              The Annotations stay outside this wrapper: they are
              `absolute inset-0` against Camera's own positioned root, which
              is the coordinate space `useCodeAnnotations` measures in. */}
          <div className="flex h-full w-full items-center justify-center">
          {isDiff ? (
            <CodeDiff
              key={index}
              from={prevSource}
              to={nextSource}
              language={scene.lang}
              header={scene.file}
              delay={range.startFrame}
              duration={diffFrames}
              className="max-h-full"
            />
          ) : (
            <CodeBlock
              key={index}
              code={typedCode}
              language={scene.lang}
              header={scene.file}
              highlight={highlightEnabled}
              showLineNumbers={showLineNumbers}
              focusRange={step.focus}
              highlightRanges={highlightRanges.length > 0 ? highlightRanges : undefined}
              lineId={(n) => lineElementId(blockId, n)}
              className="max-h-full"
            />
          )}
          </div>
          {annotations.map((a, i) => (
            <Annotation
              key={i}
              target={a.target}
              label={a.text}
              side={a.side}
              containerWidth={containerWidth}
              progress={stepProgress}
            />
          ))}
        </Camera>
      </div>
    </div>
  );
}
