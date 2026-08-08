import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Card, CardContent } from "../../card";
import { Badge } from "../../badge";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down"; label?: string };
  icon?: ReactNode;
  /** Padding density, forwarded to CardContent. Default "md" matches Card/Alert. */
  size?: "sm" | "md" | "lg";
}

// CardContent is normally the second half of a Header+Content pair and
// zeroes its own top padding accordingly (the header already carries
// bottom spacing). StatCard has no header above its content, so it restores
// a symmetric top padding matching whichever `size` token drives the other
// three sides.
const PT_BY_SIZE = { sm: "pt-panel-sm", md: "pt-panel", lg: "pt-panel-lg" } as const;

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, delta, icon, size = "md", className, ...props }, ref) => (
    <Card ref={ref} className={cn(className)} {...props}>
      <CardContent size={size} className={PT_BY_SIZE[size]}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-tight">
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {delta && (
              <p className="flex items-center gap-tight text-sm">
                <Badge
                  variant={delta.direction === "up" ? "success" : "danger"}
                  style="soft"
                >
                  {delta.direction === "up" ? "↑" : "↓"} {delta.value}
                </Badge>
                {delta.label && <span className="text-muted">{delta.label}</span>}
              </p>
            )}
          </div>
          {icon && <div className="text-muted">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  ),
);
StatCard.displayName = "StatCard";

export { StatCard };
