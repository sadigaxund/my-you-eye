import { useEffect, useRef, useState } from "react";

/**
 * GUARD EXCEPTION — this is the one file in `src/present/` (and the whole
 * repo outside `src/motion/core/`) `scripts/check-motion.mjs` allows to use
 * `Date.now()`/`setInterval()`. It is genuinely wall-clock UI chrome — "how
 * long has the speaker been talking" — never a value any scene, motion
 * primitive, or MP4 output frame is a function of; nothing here feeds back
 * into `useTimeline()`/`useProgress()` or a driver. See TODO.md Phase F and
 * the narrowly-scoped `PRESENT_TIMER_EXCEPTION` constant in
 * `scripts/check-motion.mjs`, which names exactly this file and no other.
 */
export function useElapsedSeconds(running: boolean): number {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return undefined;
    if (startRef.current == null) startRef.current = Date.now() - elapsed * 1000;
    const start = startRef.current;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
    // Only `running` should restart the interval — `elapsed` above is read
    // once, to preserve a paused count across a running:false -> true flip,
    // not tracked on every tick, so it's deliberately not a dependency here.
  }, [running]);

  return elapsed;
}
