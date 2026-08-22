import { useCallback, useEffect, useRef, useState } from "react";

/** How long the copied/failed acknowledgement stays on the button. */
const FEEDBACK_MS = 1500;

export type CopyState = "idle" | "copied" | "failed";

/**
 * Selects a detached `<textarea>` holding `text` and asks the document to
 * copy the selection. `document.execCommand` is deprecated, and it is still
 * the only copy path that works on a non-secure origin: `navigator.clipboard`
 * is gated behind a secure context, so on plain `http://` (a LAN dev box, a
 * preview served off an IP) the whole API is simply absent. The old code
 * checked for it and returned, which meant the copy button did nothing at
 * all and said nothing about it.
 *
 * The textarea is positioned off-screen rather than hidden with
 * `display: none` / `visibility: hidden`, because a non-rendered element
 * cannot hold a selection and the copy silently produces an empty string.
 */
function selectionCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

/**
 * `copy()` plus the three-state acknowledgement the button renders.
 *
 * The async clipboard is tried first and the selection fallback catches both
 * ways it can be unavailable: missing entirely (non-secure origin) and
 * present but rejecting (permission denied, document not focused). A copy
 * that fails both ways reports `"failed"` rather than leaving the reader to
 * discover an empty clipboard when they paste.
 */
export function useCopy(text: string): { state: CopyState; copy: () => void } {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((next: CopyState) => {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), FEEDBACK_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => flash("copied"),
        () => flash(selectionCopy(text) ? "copied" : "failed"),
      );
      return;
    }
    flash(selectionCopy(text) ? "copied" : "failed");
  }, [text, flash]);

  return { state, copy };
}
