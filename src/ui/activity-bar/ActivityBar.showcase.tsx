import type { ShowcaseEntry } from "../../showcase/types";
import { ActivityBar } from ".";
import { TooltipProvider } from "../tooltip";

const items = [
  {
    id: "explorer",
    label: "Explorer",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5.5l2-2h4l2 2v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9z" />
      </svg>
    ),
    active: true,
  },
  {
    id: "search",
    label: "Search",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="5" />
        <path d="M13 13l4 4" />
      </svg>
    ),
  },
  {
    id: "git",
    label: "Source control",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="5" r="2" />
        <circle cx="6" cy="15" r="2" />
        <circle cx="14" cy="8" r="2" />
        <path d="M6 7v6M14 10c0 3-4 2-6 4" />
      </svg>
    ),
    badge: 3,
  },
];

const entry: ShowcaseEntry = {
  title: "ActivityBar",
  group: "navigation",
  description:
    "Vertical icon rail with an active left-edge accent bar and count badges — the activity-bar pattern for app shells, painted from the sidebar token family.",
  demos: [
    {
      name: "Rail with footer item",
      description:
        "Labels live in right-side tooltips (wrap in TooltipProvider). The active indicator is an edge bar, never a fill.",
      render: () => (
        <TooltipProvider>
          <div className="flex h-64 justify-center">
            <ActivityBar
              items={items}
              footer={{
                id: "settings",
                label: "Settings",
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="10" cy="10" r="2.5" />
                    <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.2 5.2l1.4 1.4M13.4 13.4l1.4 1.4M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4" />
                  </svg>
                ),
              }}
            />
          </div>
        </TooltipProvider>
      ),
    },
  ],
};
export default entry;
