import { useCallback, useRef, useState } from "react";

export interface SpeakerPopup {
  win: Window;
  /** Mount point inside the popup document — a plain `<div>` appended
   * after the host page's stylesheets are cloned in, so `createPortal`
   * has somewhere stable to render into. */
  root: HTMLElement;
}

/**
 * Opens `<SpeakerView />` in a second browser window via `window.open` +
 * `createPortal` (TODO.md Phase F: "ship it as its own component so it can
 * be opened in a second window"). Because the popup is the same JS runtime
 * as the page that opened it, the portal shares live React state directly —
 * no `BroadcastChannel`, no serialization, no polling: SpeakerView just
 * re-renders whenever its caller does, same as any other portal.
 *
 * The host page's `<link rel="stylesheet">`/`<style>` nodes are cloned into
 * the popup's `<head>` so the popup resolves the same design tokens/
 * Tailwind classes SpeakerView renders with — this makes no assumption
 * about *how* those styles got onto the host page (Vite dev server, a
 * built `styles.css`, …), only that whatever's already loaded there is
 * what SpeakerView needs too.
 */
export function useSpeakerWindow(title: string | undefined) {
  const [popup, setPopup] = useState<SpeakerPopup | null>(null);
  const popupRef = useRef<SpeakerPopup | null>(null);

  const openSpeakerWindow = useCallback(() => {
    if (popupRef.current && !popupRef.current.win.closed) {
      popupRef.current.win.focus();
      return;
    }
    const win = window.open("", "_blank", "width=960,height=540");
    if (!win) return;
    win.document.title = title ? `Speaker view — ${title}` : "Speaker view";
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      win.document.head.appendChild(node.cloneNode(true));
    });
    win.document.body.style.margin = "0";
    win.document.body.style.height = "100vh";
    const root = win.document.createElement("div");
    root.id = "speaker-view-root";
    root.style.height = "100%";
    win.document.body.appendChild(root);
    const next: SpeakerPopup = { win, root };
    const handleUnload = () => {
      popupRef.current = null;
      setPopup(null);
    };
    win.addEventListener("pagehide", handleUnload, { once: true });
    popupRef.current = next;
    setPopup(next);
  }, [title]);

  return { popup, openSpeakerWindow };
}
