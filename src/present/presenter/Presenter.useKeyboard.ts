import { useEffect } from "react";

export interface PresenterKeyboardHandlers {
  onNext: () => void;
  onPrev: () => void;
  onToggleOverview: () => void;
  onToggleFullscreen: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * Global keyboard navigation for Presenter (TODO.md Phase F): `→`/Space
 * advances, `←` reverses, `Esc` toggles the overview grid, `f` toggles
 * fullscreen. Bails out entirely while focus sits in an `<input>`,
 * `<textarea>`, or any `contentEditable` element, so a consumer embedding
 * Presenter alongside their own form controls never has typing hijacked.
 */
export function usePresenterKeyboard({ onNext, onPrev, onToggleOverview, onToggleFullscreen }: PresenterKeyboardHandlers): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          onNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrev();
          break;
        case "Escape":
          onToggleOverview();
          break;
        case "f":
        case "F":
          onToggleFullscreen();
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onToggleOverview, onToggleFullscreen]);
}
