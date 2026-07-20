import React from "react";
import { useCurrentFrame } from "remotion";

export interface TypeTextProps {
  text: string;
  delay?: number;
  speed?: number;
  cursor?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TypeText: React.FC<TypeTextProps> = ({
  text,
  delay = 0,
  speed = 2,
  cursor = false,
  className,
  style,
}) => {
  const frame = useCurrentFrame();

  const charsShown = Math.floor((frame - delay) / speed);
  const clamped = Math.max(0, Math.min(text.length, charsShown));
  const visible = text.slice(0, clamped);
  const showCursor = cursor && frame % 15 < 8 && clamped < text.length;

  return (
    <span className={className} style={{ fontFamily: "monospace", ...style }}>
      {visible}
      {showCursor && (
        <span style={{ opacity: frame % 15 < 8 ? 1 : 0 }}>|</span>
      )}
    </span>
  );
};
