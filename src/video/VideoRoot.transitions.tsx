// Maps the schema's closed `SceneTransition` union onto a
// `@remotion/transitions` presentation and returns the
// `<TransitionSeries.Transition>` element for one scene boundary (TODO.md
// Phase G).
//
// `sceneTransitionNode` is a plain function, NOT a React component — this is
// deliberate, not a style choice. `<TransitionSeries>` only recognises
// `<TransitionSeries.Sequence>`/`.Transition`/`.Overlay` as DIRECT children
// (its own `flattenChildren` only unwraps `React.Fragment`, nothing else —
// see `@remotion/transitions`' source). Wrapping the switch in a component
// (`<SceneTransitionElement .../>`) makes the child's runtime `type` that
// component, which `<TransitionSeries>` then rejects with "only accepts
// <TransitionSeries.Sequence />, <TransitionSeries.Transition />, and
// <TransitionSeries.Overlay /> ... but got [object Object] instead" — it
// never renders the wrapper to see what's inside. Calling this as a plain
// function inline (`{sceneTransitionNode(...)}`) inside the SAME
// `<Fragment>` as the paired `<TransitionSeries.Sequence>` (see
// `VideoRoot.tsx`) makes the actual `<TransitionSeries.Transition>` element
// a value in that Fragment's children, which DOES flatten correctly.
import { TransitionSeries, linearTiming } from "@remotion/transitions";
// Each presentation is its own subpath export (not re-exported from the
// package root) — see @remotion/transitions' package.json "exports".
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { ReactNode } from "react";
import type { SceneTransition } from "../scenes";

/**
 * `null` for `"none"` — no `<TransitionSeries.Transition>` renders at all,
 * which is what keeps `"none"` a genuine zero-overlap hard cut (see
 * `transitionOverlapFrames` in `VideoRoot.duration.ts`, which agrees: 0
 * frames of overlap for `"none"`).
 *
 * @param transition The entering scene's own `transition` field. Default "fade".
 * @param durationInFrames The overlap duration — always
 *   `transitionOverlapFrames(transition, fps)` from `VideoRoot.duration.ts`,
 *   so this and `computeVideoDuration`'s bookkeeping can never disagree.
 */
export function sceneTransitionNode(transition: SceneTransition | undefined, durationInFrames: number): ReactNode | null {
  const timing = linearTiming({ durationInFrames });
  const resolved = transition ?? "fade";
  switch (resolved) {
    case "none":
      return null;
    case "fade":
      return <TransitionSeries.Transition presentation={fade()} timing={timing} />;
    case "slide":
      return <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />;
    case "wipe":
      return <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={timing} />;
    default: {
      const exhaustive: never = resolved;
      throw new Error(`sceneTransitionNode: unhandled transition ${exhaustive}`);
    }
  }
}
