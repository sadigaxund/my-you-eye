// Shared chrome for code surfaces: the header bar and the language badge.
//
// Extracted because the same header markup had been written three times —
// twice in CodeBlock itself (the with-header bar and the floating no-header
// badge) and a third time in the scenes-tier `CodeDiff`, which needs an
// identical frame so a `CodeScene` step can cut between a CodeBlock and a
// CodeDiff without the header shifting. Three copies of one design constant
// is exactly the drift AGENTS.md §1 Step-A exists to prevent: change the
// badge's radius in one and the other two silently disagree.

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/** The uppercase language pill. `floating` is the no-header placement,
 * where it sits over the code rather than in a bar. */
export function LanguageBadge({ language, floating }: { language: string; floating?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-ui-sm bg-code-bg/80 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-code-muted border border-border/50",
        floating ? "pointer-events-none" : "shrink-0",
      )}
    >
      {language}
    </span>
  );
}

export interface CodeHeaderBarProps {
  /** Filename or caption at the start of the bar. */
  header?: string;
  /** Language id, rendered as a badge after the caption. */
  language?: string;
  /** Trailing slot at the end of the bar (CodeBlock puts its copy button
   * here). The bar tightens its right padding when one is present, because
   * an icon button carries its own. */
  trailing?: ReactNode;
}

export function CodeHeaderBar({ header, language, trailing }: CodeHeaderBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 h-9 pl-panel border-b border-border shrink-0",
        trailing ? "pr-1.5" : "pr-panel",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {header && <span className="text-xs font-medium text-code-fg truncate">{header}</span>}
        {language && <LanguageBadge language={language} />}
      </div>
      {trailing}
    </div>
  );
}
