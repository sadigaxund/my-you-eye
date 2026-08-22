import type { ShowcaseEntry } from "../../showcase/types";
import { TitleBar } from ".";
import { SegmentedControl } from "../segmented-control";
import { DiffStatChip } from "../diff-stat-chip";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "TitleBar",
  group: "navigation",
  description:
    "Window chrome with a two-zone layout — identity + inline breadcrumb on the left, actions on the right. The light counterpart to Toolbar for top-of-shell bars.",
  demos: [
    {
      name: "Identity, breadcrumb, actions",
      description:
        "The breadcrumb sits inline with the identity cluster behind a divider — the bar never grows taller to fit it. Actions here mirror the focused pane's mode and diff state.",
      render: () => (
        <div className="mx-auto max-w-2xl overflow-hidden rounded-ui border border-sidebar-border">
          <TitleBar
            glyph={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                <path d="M8 1.5l6 3v7l-6 3-6-3v-7l6-3z" />
              </svg>
            }
            title="architecture.md"
            subtitle="my-vault"
            breadcrumb="vault / notes / architecture.md"
            actions={
              <>
                <DiffStatChip added={12} removed={5} size="sm" />
                <SegmentedControl
                  options={[
                    { value: "rendered", label: "Rendered" },
                    { value: "source", label: "Source" },
                  ]}
                  value="source"
                  size="xs"
                  aria-label="Editor mode"
                />
                <Button variant="ghost" size="sm">Share</Button>
              </>
            }
          />
          <div className="flex h-24 items-center justify-center bg-surface text-xs text-muted">
            Editor surface below the bar
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
