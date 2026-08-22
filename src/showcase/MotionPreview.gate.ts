/**
 * Shared playback gating for the showcase's live previews.
 *
 * The showcase mounts 71 `MotionPreview`s across 34 pages (5 on the worst
 * page), every one of them its own `MotionRoot mode="live"` with `loop` +
 * `autoPlay`. Ungated, all of them animate forever — including the ones
 * scrolled a page and a half away and the ones in a background tab — and
 * under a textured/backdrop-filter theme every one of those repaints
 * composites through an expensive layer.
 *
 * Both observers here are module-level singletons on purpose: one
 * `IntersectionObserver` for every preview on the page (an observer per
 * preview is exactly the per-instance cost we're removing) and one
 * `visibilitychange` listener fanned out to all subscribers.
 *
 * Showcase-only infrastructure — `src/motion/` may not depend on the DOM's
 * visibility APIs (they are wall-clock-adjacent and would make a driver
 * non-deterministic under frame capture, AGENTS.md §9c rule 1). Gating
 * belongs to the host that mounts the driver, which is this file's caller.
 */

type Listener = (active: boolean) => void;

const onScreenListeners = new Map<Element, Listener>();
let intersectionObserver: IntersectionObserver | null = null;

function ensureIntersectionObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  intersectionObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) onScreenListeners.get(entry.target)?.(entry.isIntersecting);
    },
    // A little slack so a preview is already running by the time it is
    // actually looked at, rather than visibly starting from frame 0 as its
    // top edge crosses the fold.
    { rootMargin: "200px" },
  );
  return intersectionObserver;
}

/** Calls `listener(true/false)` whenever `el` enters/leaves the viewport. */
export function observeOnScreen(el: Element, listener: Listener): () => void {
  const observer = ensureIntersectionObserver();
  if (!observer) {
    // No IntersectionObserver (jsdom, very old browser): degrade to the
    // previous always-playing behaviour rather than to a frozen preview.
    listener(true);
    return () => {};
  }
  onScreenListeners.set(el, listener);
  observer.observe(el);
  return () => {
    onScreenListeners.delete(el);
    observer.unobserve(el);
  };
}

const tabListeners = new Set<Listener>();
let tabListenerAttached = false;

function broadcastTabVisibility() {
  const active = !document.hidden;
  for (const listener of tabListeners) listener(active);
}

/** Calls `listener(false)` when the tab goes to the background, `true` on return. */
export function observeTabVisible(listener: Listener): () => void {
  tabListeners.add(listener);
  if (!tabListenerAttached) {
    document.addEventListener("visibilitychange", broadcastTabVisibility);
    tabListenerAttached = true;
  }
  return () => {
    tabListeners.delete(listener);
  };
}
