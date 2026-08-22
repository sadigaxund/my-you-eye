// Live-only diagram interactivity (TODO.md D2 / Phase F).
//
// Why this lives here and not in src/present/: DiagramScene needs to read
// it, and scenes must never import src/present/ (tier direction — see this
// repo's tier table). The *definition* (this file: the context object, its
// value shape, and the inert default) lives in the scenes tier so a scene
// can depend on it without crossing that boundary. The *provider* — the
// component that actually owns hover/expand state and mounts a real
// `<LiveInteractionContext.Provider>` — lives entirely in src/present/
// (Presenter.Stage.tsx) and is the only place a non-null value is ever
// supplied.
//
// Every other consumer of a scene — a plain static render, a Remotion video
// render, a showcase demo, the Presenter's own overview-grid thumbnails —
// mounts no provider at all. `useLiveInteraction()` then returns `INERT`:
// every id is null, every callback is a no-op, `isLive` is false. Because
// DiagramScene branches on these values (see diagram-scene/DiagramScene.tsx)
// and every branch's "off" state is `INERT`'s value, a scene rendered with
// no provider mounted produces byte-identical DOM to a scene that has never
// heard of this module — nothing here can affect video output.
import { createContext, useContext } from "react";

export interface LiveInteractionValue {
  /** True only when a real provider is mounted (Presenter's live stage).
   * Lets a scene gate purely cosmetic live-only affordances (e.g. a
   * `cursor-pointer` class) without those affordances ever appearing when
   * nothing is actually interactive — `hoveredNodeId`/`expandedNodeId`
   * being null isn't enough on its own, since that's also INERT's steady
   * state while a real provider is momentarily hovering nothing. */
  isLive: boolean;
  /** Node id currently hovered, or null. */
  hoveredNodeId: string | null;
  /** Node id currently "expanded" (clicked), or null. */
  expandedNodeId: string | null;
  /** Called on pointer enter (the node's id) and pointer leave (null). */
  onNodeHover: (id: string | null) => void;
  /** Called on click; the provider toggles the node's expanded state. */
  onNodeClick: (id: string) => void;
}

const INERT: LiveInteractionValue = {
  isLive: false,
  hoveredNodeId: null,
  expandedNodeId: null,
  onNodeHover: () => {},
  onNodeClick: () => {},
};

/** Internal — only src/present/ (Presenter.Stage.tsx) mounts a real
 * provider on this. Every other reader goes through `useLiveInteraction()`. */
export const LiveInteractionContext = createContext<LiveInteractionValue | null>(null);

/**
 * Read the live interaction state. Safe to call unconditionally from any
 * scene — with no provider mounted (the default, and always true under
 * Remotion or a plain static render) it returns `INERT`, never `null`, so a
 * scene never needs an `if (context)` branch of its own; every value it
 * reads is simply false/null and every callback is a no-op.
 */
export function useLiveInteraction(): LiveInteractionValue {
  return useContext(LiveInteractionContext) ?? INERT;
}
