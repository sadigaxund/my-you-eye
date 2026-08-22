import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

/** `f` toggles fullscreen on Presenter's own root element (TODO.md Phase F).
 * Tracks the native `fullscreenchange` event rather than polling, so it
 * stays correct if the user exits fullscreen with the browser's own UI
 * (Esc, in most browsers) instead of Presenter's button. */
export function usePresenterFullscreen(containerRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [containerRef]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, [containerRef]);

  return { isFullscreen, toggleFullscreen };
}
