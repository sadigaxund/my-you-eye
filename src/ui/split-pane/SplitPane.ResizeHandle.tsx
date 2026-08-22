import { forwardRef, useRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface ResizeHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd"> {
  /** Layout axis of the SPLIT the handle bisects — "row" means siblings sit
   *  side by side and the handle is a vertical line (aria-orientation
   *  "vertical"). */
  direction: "row" | "column";
  onDragStart?: () => void;
  /** Pointer drags report the cumulative px delta from gesture start along
   *  the split axis — NOT a per-frame delta, so handlers can be pure
   *  functions of the offset. Keyboard Arrow keys report one-shot ±8px
   *  (±32px with Shift) steps as the non-drag alternative. */
  onDrag: (deltaPx: number) => void;
  onDragEnd?: () => void;
  /** Conventionally "equalize the two neighbors". */
  onDoubleClick?: () => void;
}

// Pointer-drag mechanics for ANY single resizable dimension (#8) — the pane
// grid's dividers and a sidebar's width edge reuse this exact primitive.
// Capture-on-pointerdown keeps tracking outside the handle's own bounds;
// keyboard arrows provide the non-drag alternative (±2% of the parent).
const ResizeHandle = forwardRef<HTMLDivElement, ResizeHandleProps>(
  ({ className, direction, onDragStart, onDrag, onDragEnd, onDoubleClick, ...props }, ref) => {
    const origin = useRef<number | null>(null);

    const axis = () => {
      const el = ref && typeof ref === "object" ? ref.current : null;
      return direction === "row"
        ? { pos: el ? el.getBoundingClientRect().left : 0 }
        : { pos: el ? el.getBoundingClientRect().top : 0 };
    };

    const start = (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      origin.current = axis().pos;
      onDragStart?.();
    };

    const move = (e: React.PointerEvent<HTMLDivElement>) => {
      if (origin.current === null) return;
      const current = direction === "row" ? e.clientX : e.clientY;
      // The handle's own left/top shifts as parents resize during the drag,
      // so measure from the GESTURE-START anchor, not live geometry.
      onDrag(current - origin.current);
    };

    const end = (e: React.PointerEvent<HTMLDivElement>) => {
      if (origin.current === null) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      origin.current = null;
      onDragEnd?.();
    };

    const keyMove = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 32 : 8;
      const forward: Record<string, number> =
        direction === "row"
          ? { ArrowRight: step, ArrowLeft: -step }
          : { ArrowDown: step, ArrowUp: -step };
      const d = forward[e.key];
      if (d !== undefined) {
        e.preventDefault();
        onDrag(d);
      }
    };

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={direction === "row" ? "vertical" : "horizontal"}
        tabIndex={0}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onLostPointerCapture={() => {
          origin.current = null;
        }}
        onKeyDown={keyMove}
        onDoubleClick={onDoubleClick}
        className={cn(
          "group relative z-10 shrink-0 select-none outline-none",
          direction === "row"
            ? "w-px cursor-col-resize after:absolute after:inset-y-0 after:-left-1 after:w-2.5"
            : "h-px cursor-row-resize after:absolute after:inset-x-0 after:-top-1 after:h-2.5",
          "after:content-[''] hover:bg-primary focus-visible:bg-primary",
          "after:hover:bg-transparent",
          className,
        )}
        {...props}
      />
    );
  },
);
ResizeHandle.displayName = "ResizeHandle";

export { ResizeHandle };
