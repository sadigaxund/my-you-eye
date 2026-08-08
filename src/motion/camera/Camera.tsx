import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTimeline } from "../core/TimelineContext";
import { measureRelative, fitZoom, interpolateCamera, cameraTransform } from "./measure";
import type { CameraRect, CameraKeyframe, ResolvedKeyframe } from "./measure";

export type { CameraRect, CameraKeyframe };

export interface CameraProps {
  children: ReactNode;
  /** Camera moves, in frame order. `focus` is an explicit rect or the `id` of a descendant element to measure. */
  keyframes: CameraKeyframe[];
  /** Compute zoom automatically to fit the focused rect when a keyframe doesn't specify one. Default true. */
  fit?: boolean;
  className?: string;
}

/**
 * Pan + zoom over `children`, subsuming CameraPan/CameraZoom (TODO.md C3).
 * GPU-composited `transform` only — translate + scale on a single scene
 * layer, never top/left/width/height (AGENTS.md §7 canvas performance
 * contract). `focus: elementId` targets are measured via `measure.ts`'s
 * `offsetLeft`/`offsetTop` walk, not `getBoundingClientRect()` — see that
 * file's comment for why (a previous batch shipped exactly that bug).
 */
export function Camera({ children, keyframes, fit = true, className }: CameraProps) {
  const { frame } = useTimeline();
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [measuredRects, setMeasuredRects] = useState<Record<string, CameraRect>>({});

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const measure = () => {
      setContainerSize({ width: root.offsetWidth, height: root.offsetHeight });
      const next: Record<string, CameraRect> = {};
      for (const kf of keyframes) {
        if (typeof kf.focus === "string") {
          const el = document.getElementById(kf.focus);
          if (el) next[kf.focus] = measureRelative(el, root);
        }
      }
      setMeasuredRects(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [keyframes]);

  const resolved: ResolvedKeyframe[] = useMemo(() => {
    return keyframes.map((kf) => {
      const rect =
        typeof kf.focus === "string"
          ? (measuredRects[kf.focus] ?? { x: 0, y: 0, width: containerSize.width, height: containerSize.height })
          : kf.focus;
      const zoom = kf.zoom ?? (fit ? fitZoom(rect, containerSize.width, containerSize.height) : 1);
      return { at: kf.at, rect, zoom };
    });
  }, [keyframes, measuredRects, containerSize, fit]);

  const { rect, zoom } = interpolateCamera(resolved, frame);
  const { panX, panY } = cameraTransform(rect, zoom, containerSize.width, containerSize.height);

  return (
    <div ref={rootRef} className={className} style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
