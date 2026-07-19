import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { CellType } from "../cell-type";
import type { CellValueType, UrlReplacement } from "../cell-type";

export interface DataListItem {
  label: string;
  value?: string | number | boolean | null;
  type?: CellValueType;
  badgeVariant?: "neutral" | "primary" | "success" | "warning" | "danger";
  badgeStyle?: "solid" | "soft";
  statusVariant?: "neutral" | "success" | "warning" | "danger" | "info";
  statusPulse?: boolean;
  icon?: ReactNode;
}

const dataListVariants = cva("overflow-hidden divide-y divide-border", {
  variants: {
    variant: {
      default: "",
      compact: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface DataListProps
  extends HTMLAttributes<HTMLDListElement>,
    VariantProps<typeof dataListVariants> {
  items: DataListItem[];
  replacements?: UrlReplacement[];
}

const DataList = forwardRef<HTMLDListElement, DataListProps>(
  ({ className, variant, items, replacements, ...props }, ref) => (
    <dl
      ref={ref}
      className={cn(dataListVariants({ variant }), className)}
      {...props}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-between gap-4 min-w-0",
            variant === "compact" ? "py-1 px-2" : "py-2 px-3",
          )}
        >
          <dt className="flex shrink-0 items-center gap-2 text-sm text-muted">
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            {item.label}
          </dt>
          <dd className="min-w-0 flex-1 overflow-hidden text-sm text-fg font-medium">
            {item.value !== undefined ? (
              <CellType
                type={item.type ?? "text"}
                value={item.value}
                badgeVariant={item.badgeVariant}
                badgeStyle={item.badgeStyle}
                statusVariant={item.statusVariant}
                statusPulse={item.statusPulse}
                replacements={replacements}
              />
            ) : (
              <span className="text-muted">—</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  ),
);
DataList.displayName = "DataList";

export { DataList };
