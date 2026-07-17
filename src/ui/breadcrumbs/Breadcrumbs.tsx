import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, separator = "/", className, ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)} {...props}>
      <ol className="flex items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted">{separator}</span>}
              {item.href && !isLast ? (
                <a href={item.href} className="text-muted hover:text-fg transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? "text-fg font-medium" : "text-muted"}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  ),
);
Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs };
