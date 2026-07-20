import { useMemo } from "react";
import { computeMergedOutline, type Rect } from "./CodeBlock.merged-outline";

export interface MergedHighlightProps {
  rects: Rect[];
  color: string;
  strokeColor: string;
  strokeWidth?: number;
  cornerRadius?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
}

export function MergedHighlight({
  rects,
  color,
  strokeColor,
  strokeWidth = 1.5,
  cornerRadius = 5,
  fillOpacity = 0.15,
  strokeOpacity = 0.3,
}: MergedHighlightProps) {
  const paths = useMemo(() => computeMergedOutline(rects, cornerRadius), [rects, cornerRadius]);

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible">
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={color}
          fillOpacity={fillOpacity}
          fillRule="evenodd"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
