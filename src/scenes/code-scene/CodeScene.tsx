import { useId, useMemo } from "react";
import { CodeBlock } from "../../ui/code-block";
import { Camera } from "../../motion/camera";
import { useProgress, useSequence, useTimeline } from "../../motion/core";
import { CodeDiff } from "../code-diff";
import { sceneSteps, stepName } from "../timing";
import { runningSources, buildHighlightRanges, lineElementId } from "./CodeScene.sources";
import { useCodeCameraKeyframes } from "./CodeScene.useCamera";
import type { CodeScene as CodeSceneData } from "../schema";

export interface CodeSceneProps {
  scene: CodeSceneData;
}

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
    : { id: undefined, focus: undefined, highlight: undefined, typed: false, code: undefined };
  const range = hasSteps ? ranges[stepName(step.id, index)] : { startFrame: 0, endFrame: 30 };
  const prevSource = hasSteps ? before[index] : scene.code;
  const nextSource = hasSteps ? after[index] : scene.code;

  const stepProgress = useProgress({ delay: range.startFrame, duration: Math.max(1, range.endFrame - range.startFrame) });
  const { containerRef, keyframes } = useCodeCameraKeyframes(scene, ranges, blockId);

  const showLineNumbers = scene.lineNumbers !== false;
  const highlightEnabled = Boolean(scene.lang);
  const highlightRanges = useMemo(
    () => buildHighlightRanges(nextSource, step.focus, step.highlight),
    [nextSource, step.focus, step.highlight],
  );

  const isDiff = !step.typed && nextSource !== prevSource;
  const isTyped = Boolean(step.typed);
  const typedCode = isTyped ? nextSource.slice(0, Math.floor(nextSource.length * stepProgress)) : nextSource;

  return (
    <div className="flex h-full w-full flex-col gap-stack bg-bg p-panel-xl text-fg">
      <div ref={containerRef} className="relative min-h-0 flex-1">
        <Camera keyframes={keyframes} className="h-full w-full">
          {isDiff ? (
            <CodeDiff
              key={index}
              from={prevSource}
              to={nextSource}
              language={scene.lang}
              header={scene.file}
              delay={range.startFrame}
              duration={Math.max(1, range.endFrame - range.startFrame)}
              className="h-full"
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
              className="h-full"
            />
          )}
        </Camera>
      </div>
    </div>
  );
}
