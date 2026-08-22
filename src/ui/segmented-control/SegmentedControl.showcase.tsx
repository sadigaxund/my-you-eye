import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { SegmentedControl } from ".";
import { TooltipProvider } from "../tooltip";

const modes = [
  { value: "rendered", label: "Rendered" },
  { value: "source", label: "Source" },
  { value: "diff", label: "Diff" },
] as const;

const layouts = [
  {
    value: "unified",
    label: "Unified",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h10M2 7h10M2 10h6" />
      </svg>
    ),
  },
  {
    value: "split",
    label: "Split",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h4v8H2zM8 3h4v8H8z" />
      </svg>
    ),
  },
] as const;

function ControlledDemo() {
  const [mode, setMode] = useState<(typeof modes)[number]["value"]>("source");
  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl options={modes} value={mode} onValueChange={setMode} aria-label="Editor mode" />
      <p className="text-xs text-muted">Mode: {mode}</p>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "SegmentedControl",
  group: "inputs",
  description:
    "A single-choice segmented toggle built on native radios — a form control, not navigation. Use it instead of Tabs when the choice sets a value rather than switching panels.",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-col items-center gap-3">
          <SegmentedControl options={modes} value="diff" size="xs" aria-label="Editor mode" />
          <SegmentedControl options={modes} value="diff" size="sm" aria-label="Editor mode" />
          <SegmentedControl options={modes} value="diff" size="md" aria-label="Editor mode" />
        </div>
      ),
    },
    {
      name: "Disabled segment",
      description:
        "Per-segment disabled is real: a disabled option stays visible, drops to 40% opacity, and is skipped by arrow keys.",
      render: () => (
        <div className="flex justify-center">
          <SegmentedControl
            options={[...modes.slice(0, 1), { ...modes[1], disabled: true }, modes[2]]}
            value="rendered"
            aria-label="Editor mode with unavailable option"
          />
        </div>
      ),
    },
    {
      name: "Icon only",
      description:
        "Labels move into tooltips; wrap in TooltipProvider as with any Tooltip usage.",
      render: () => (
        <TooltipProvider>
          <div className="flex justify-center">
            <SegmentedControl options={layouts} value="unified" iconOnly size="xs" aria-label="Diff layout" />
          </div>
        </TooltipProvider>
      ),
    },
    {
      name: "Controlled",
      render: () => <ControlledDemo />,
    },
  ],
};
export default entry;
