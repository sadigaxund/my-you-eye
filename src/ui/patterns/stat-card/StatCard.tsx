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
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, delta, icon, className, ...props }, ref) => (
    <Card ref={ref} className={cn(className)} {...props}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {delta && (
              <p className="flex items-center gap-1 text-sm">
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
