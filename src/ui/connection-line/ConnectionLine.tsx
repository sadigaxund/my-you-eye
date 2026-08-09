import { forwardRef } from "react";
import { ConnectionPath } from "./ConnectionPath";
import type { ConnectionLineProps } from "./ConnectionPath";

const ConnectionLine = forwardRef<SVGSVGElement, ConnectionLineProps>(
  function ConnectionLine(props, ref) {
    return (
      <svg
        ref={ref}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      >
        <ConnectionPath {...props} />
      </svg>
    );
  },
);
ConnectionLine.displayName = "ConnectionLine";

export { ConnectionLine };
export type { ConnectionLineProps };
