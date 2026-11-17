import type { ShowcaseEntry } from "../../showcase/types";
import { Thread, ThreadStop } from ".";
import { Card } from "../card";

const entry: ShowcaseEntry = {
  title: "Thread",
  group: "display",
  description: "A plain vertical rule with stops, for histories, step lists and outlines.",
  demos: [
    {
      name: "Career history",
      render: () => (
        <Thread>
          <ThreadStop label="Staff Engineer, Northwind" meta="2023 – present" current>
            Leads the design-system team and the migration to a token-driven theme layer.
          </ThreadStop>
          <ThreadStop label="Senior Engineer, Contoso" meta="2019 – 2023">
            Built the realtime collaboration engine behind the editor.
          </ThreadStop>
          <ThreadStop label="Engineer, Fabrikam" meta="2016 – 2019">
            Shipped the first mobile client and its offline sync.
          </ThreadStop>
          <ThreadStop label="Intern, Initech" meta="2015">
            Automated nightly report generation.
          </ThreadStop>
        </Thread>
      ),
    },
    {
      name: "Tones",
      render: () => (
        <div className="grid gap-panel sm:grid-cols-2">
          <Thread tone="default">
            <ThreadStop label="Draft" meta="Mon" />
            <ThreadStop label="Review" meta="Tue" current />
            <ThreadStop label="Publish" meta="Fri" />
          </Thread>
          <Thread tone="accent">
            <ThreadStop label="Draft" meta="Mon" />
            <ThreadStop label="Review" meta="Tue" current />
            <ThreadStop label="Publish" meta="Fri" />
          </Thread>
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="grid gap-panel sm:grid-cols-2">
          <Thread size="sm">
            <ThreadStop label="Checkout" meta="2 min">Pull the branch.</ThreadStop>
            <ThreadStop label="Build" meta="4 min">Compile the bundle.</ThreadStop>
            <ThreadStop label="Deploy" meta="1 min">Ship to staging.</ThreadStop>
          </Thread>
          <Thread size="md">
            <ThreadStop label="Checkout" meta="2 min">Pull the branch.</ThreadStop>
            <ThreadStop label="Build" meta="4 min">Compile the bundle.</ThreadStop>
            <ThreadStop label="Deploy" meta="1 min">Ship to staging.</ThreadStop>
          </Thread>
        </div>
      ),
    },
    {
      name: "Headings & current",
      description: "Labels as real headings; the current stop is filled and aria-current.",
      render: () => (
        <Thread tone="accent">
          <ThreadStop headingLevel={3} label="Introduction">Why this document exists.</ThreadStop>
          <ThreadStop headingLevel={3} label="Architecture" current>
            The part you are reading now.
          </ThreadStop>
          <ThreadStop headingLevel={3} label="Rollout">Phases and owners.</ThreadStop>
        </Thread>
      ),
    },
    {
      name: "Stress",
      description: "Long labels, an unbroken token, the zero state and a narrow container.",
      render: () => (
        <div className="flex flex-col gap-panel">
          <div className="w-80">
            <Card className="p-panel">
              <Thread>
                <ThreadStop
                  label="Principal Staff Software Engineer, Infrastructure Platform and Developer Experience Group"
                  meta="January 2019 – December 2024 (five years, eleven months)"
                  current
                >
                  Responsible for the build system, the deployment pipeline and every internal tool that a developer touches on the way to production, across all regions.
                </ThreadStop>
                <ThreadStop
                  label="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                  meta="2018"
                >
                  BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
                </ThreadStop>
                <ThreadStop label="Intern" meta="2015" />
              </Thread>
            </Card>
          </div>
          <div className="text-sm text-muted">
            Zero state (renders nothing): <Thread />
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
