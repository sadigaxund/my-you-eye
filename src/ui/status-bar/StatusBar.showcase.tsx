import type { ShowcaseEntry } from "../../showcase/types";
import { StatusBar, StatusBarItem } from ".";
import { TooltipProvider } from "../tooltip";

const entry: ShowcaseEntry = {
  title: "StatusBar",
  group: "navigation",
  description:
    "Two-sided app-wide status strip — the light chrome counterpart to Toolbar. Tones map to semantic tokens; segments with something to say carry tooltips.",
  demos: [
    {
      name: "Left and right slots",
      render: () => (
        <TooltipProvider>
          <div className="mx-auto max-w-2xl overflow-hidden rounded-ui border border-sidebar-border">
            <StatusBar
              left={
                <>
                  <StatusBarItem
                    tone="primary"
                    tooltip="Current branch"
                    onClick={() => {}}
                    label={
                      <>
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5">
                          <circle cx="4" cy="4" r="1.5" />
                          <circle cx="4" cy="12" r="1.5" />
                          <circle cx="12" cy="6" r="1.5" />
                          <path d="M4 5.5v5M12 7.5c0 3-4 2-6 3.5" />
                        </svg>
                        main
                      </>
                    }
                  />
                  <StatusBarItem tone="success" tooltip="All checks passed" onClick={() => {}} label="✓ 12 checks" />
                  <StatusBarItem tone="danger" label="2 conflicts" />
                </>
              }
              right={
                <>
                  <StatusBarItem tooltip="Problems" label="⚠ 4" />
                  <StatusBarItem tone="primary" tooltip="Cursor position" label="Ln 42, Col 8" />
                  <StatusBarItem label="UTF-8" />
                </>
              }
            />
          </div>
        </TooltipProvider>
      ),
    },
  ],
};
export default entry;
