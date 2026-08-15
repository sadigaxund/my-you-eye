import { useId, useMemo } from "react";
import { CodeBlock } from "../../ui/code-block";
import { Annotation } from "../../ui/annotation";
import { Camera } from "../../motion/camera";
import { useProgress, useSequence, useTimeline } from "../../motion/core";
import { CodeDiff } from "../code-diff";
import { codeTransitionFrames, sceneSteps, stepName } from "../timing";
import { runningSources, buildHighlightRanges, lineElementId } from "./CodeScene.sources";
import { useCodeCameraKeyframes } from "./CodeScene.useCamera";
import { useCodeAnnotations } from "./CodeScene.useAnnotations";
import type { CodeScene as CodeSceneData } from "../schema";

export interface CodeSceneProps {
  scene: CodeSceneData;
}

/**
 * The typed-so-far prefix of `source`, with every not-yet-typed character
 * dropped EXCEPT its newlines. Keeping the trailing newlines means the
 * partial string always has the final line count, so `CodeBlock`'s gutter
 * (derived from `code.split("\n")`) renders the same number of rows — and
 * therefore the same digit width, and therefore the same code x-origin — on
 * every frame of the typing. Without it, the gutter grows from "1" to "12"
 * mid-type and shoves the code sideways under a camera that is measuring
 * exactly those line positions.
 */
function typedSlice(source: string, progress: number): string {
  const cut = Math.floor(source.length * progress);
  return source.slice(0, cut) + source.slice(cut).replace(/[^\n]/g, "");
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
  const { frame, fps } = useTimeline();
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

  // A step that rewrites the code shows the diff for its transition window
  // only, then settles into the ordinary CodeBlock for the rest. Running the
  // diff for the whole step left the viewer staring at red/green gutter
  // chrome until the step ended, so "the code now" was never actually shown:
  // the step's own `focus` framing and highlights had nothing to land on, and
  // the next step began from what still looked like a pending change. The
  // window is the same `codeTransitionFrames` the camera keyframes use, so
  // the diff resolves exactly as the camera arrives.
  const diffFrames = codeTransitionFrames(range.endFrame - range.startFrame, fps);
  const isDiff = !step.typed && nextSource !== prevSource && frame < range.startFrame + diffFrames;
  const isTyped = Boolean(step.typed);
  const typedCode = isTyped ? typedSlice(nextSource, stepProgress) : nextSource;

  // Every layout-affecting CodeBlock prop, shared verbatim by the visible
  // block and the hidden final-source block that reserves its box below —
  // the two must size identically for the reservation to mean anything.
  const blockProps = {
    language: scene.lang,
    header: scene.file,
    highlight: highlightEnabled,
    showLineNumbers,
    focusRange: step.focus,
    highlightRanges: highlightRanges.length > 0 ? highlightRanges : undefined,
  };

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
          ) : isTyped ? (
            /* Reserve the FINAL layout up front — the same trick TypeText's
               `preserveLayout` uses (src/motion/type-text/TypeText.tsx), for
               the same reason: a box that grows with the text is a box that
               moves under everything measuring it. Both blocks occupy the
               one grid cell, the hidden one (full source) sizing it and the
               visible one (typed prefix) stretching into it, so block width,
               block height and gutter width are final from frame 1 and the
               only thing that changes per frame is which characters are
               painted. The container therefore never resizes while typing,
               so `useCodeCameraKeyframes`' ResizeObserver stays quiet and
               the centring wrapper below has nothing left to re-centre.
               The ghost deliberately gets NO `lineId`: duplicate element ids
               would make the camera's `getElementById` measure the invisible
               copy instead of the real one. */
            <div key={index} className="grid max-h-full">
              <div aria-hidden className="invisible col-start-1 row-start-1 min-w-0">
                <CodeBlock code={nextSource} {...blockProps} className="max-h-full" />
              </div>
              <CodeBlock
                code={typedCode}
                {...blockProps}
                lineId={(n) => lineElementId(blockId, n)}
                className="col-start-1 row-start-1 min-w-0 max-h-full"
              />
            </div>
          ) : (
            <CodeBlock
              key={index}
              code={nextSource}
              {...blockProps}
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
