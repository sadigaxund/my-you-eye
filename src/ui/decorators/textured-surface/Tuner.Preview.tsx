import { useRef, useState, useEffect, type CSSProperties } from "react";

const FEATHER_A = "repeating-linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)";
const FEATHER_B = "repeating-linear-gradient(to bottom, black 0%, transparent 50%, black 100%)";

function maskProps(gradient: string, tile: number): CSSProperties {
  return {
    WebkitMaskImage: gradient,
    maskImage: gradient,
    WebkitMaskSize: `100% ${tile}px`,
    maskSize: `100% ${tile}px`,
    WebkitMaskRepeat: "repeat",
    maskRepeat: "repeat",
  };
}

export function Preview({ bg, uri, tile, opacity, angle, seamBlend }: {
  bg: string; uri: string; tile: number; opacity: number; angle?: number;
  seamBlend?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState(0);
  const rotated = !!angle && Math.abs(angle) > 0.5;

  useEffect(() => {
    if (!rotated) return;
    const el = ref.current;
    if (!el) return;
    const measure = () => setSz(2 * Math.max(el.offsetWidth, el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rotated]);

  const half = rotated ? sz / 2 || 0 : 0;
  const layerStyle: CSSProperties = rotated
    ? { top: "50%", left: "50%", width: sz || 1, height: sz || 1, marginLeft: -half, marginTop: -half, transform: `rotate(${angle}deg)`, transformOrigin: "center" }
    : { inset: "0" };

  return (
    <div ref={ref} className="flex-1 rounded-ui overflow-hidden relative border border-border">
      <div className="absolute inset-0" style={{ background: bg }} />
      <div aria-hidden className="absolute pointer-events-none"
        style={{
          ...layerStyle,
          backgroundImage: `url("${uri}")`,
          backgroundSize: `${tile}px`,
          backgroundRepeat: "repeat",
          opacity,
          mixBlendMode: "hard-light" as const,
          ...(seamBlend ? maskProps(FEATHER_A, tile) : {}),
        }} />
      {seamBlend && (
        <div aria-hidden className="absolute pointer-events-none"
          style={{
            ...layerStyle,
            backgroundImage: `url("${uri}")`,
            backgroundSize: `${tile}px`,
            backgroundRepeat: "repeat",
            backgroundPosition: `0 ${tile / 2}px`,
            opacity,
            mixBlendMode: "hard-light" as const,
            ...maskProps(FEATHER_B, tile),
          }} />
      )}
    </div>
  );
}
