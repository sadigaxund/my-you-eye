import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { Stepper, StepperList, StepperPanel, StepperPanelTitle, StepperActions } from ".";
import type { StepperStep } from ".";
import { Input } from "../input";
import { Switch } from "../switch";
import dialogDemos from "./Stepper.showcase.dialog";

const horizontalSteps: readonly StepperStep[] = [
  { id: "destination", label: "Destination", description: "Where the export goes" },
  { id: "credentials", label: "Credentials", description: "Sign-in for that destination" },
  { id: "options", label: "Options", optional: true },
  { id: "review", label: "Review" },
];

function HorizontalDemo() {
  const [current, setCurrent] = useState("destination");
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const index = horizontalSteps.findIndex((s) => s.id === current);
  const next = horizontalSteps[index + 1];

  const advance = () => {
    setCompleted((prev) => new Set(prev).add(current));
    if (next) setCurrent(next.id);
  };

  return (
    <Stepper steps={horizontalSteps} current={current} onCurrentChange={setCurrent} completed={completed}>
      <StepperList />
      <StepperPanel step="destination">
        <StepperPanelTitle>Destination</StepperPanelTitle>
        <Input placeholder="s3://backups/exports" />
      </StepperPanel>
      <StepperPanel step="credentials">
        <StepperPanelTitle>Credentials</StepperPanelTitle>
        <Input placeholder="Access key" />
        <Input type="password" placeholder="Secret key" />
      </StepperPanel>
      <StepperPanel step="options">
        <StepperPanelTitle>Options</StepperPanelTitle>
        <label className="flex items-center gap-inline text-sm text-fg">
          <Switch defaultChecked /> Compress before upload
        </label>
      </StepperPanel>
      <StepperPanel step="review">
        <StepperPanelTitle>Review</StepperPanelTitle>
        <p className="text-sm text-muted">Everything looks good — start the export whenever you're ready.</p>
      </StepperPanel>
      <StepperActions onNext={next ? advance : undefined} />
    </Stepper>
  );
}

const verticalSteps: readonly StepperStep[] = [
  { id: "intro", label: "Welcome", description: "What this sets up" },
  { id: "vault", label: "Vault location" },
  { id: "done", label: "Done", terminal: true },
];

function VerticalDemo() {
  const [current, setCurrent] = useState("intro");
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const index = verticalSteps.findIndex((s) => s.id === current);
  const next = verticalSteps[index + 1];

  const advance = () => {
    setCompleted((prev) => new Set(prev).add(current));
    if (next) setCurrent(next.id);
  };

  return (
    <Stepper
      steps={verticalSteps}
      current={current}
      onCurrentChange={setCurrent}
      completed={completed}
      orientation="vertical"
    >
      <StepperList />
      <StepperPanel step="intro">
        <StepperPanelTitle as="h4">Welcome</StepperPanelTitle>
        <p className="text-sm text-muted">This wizard sets up a synced vault on this device.</p>
      </StepperPanel>
      <StepperPanel step="vault">
        <StepperPanelTitle as="h4">Vault location</StepperPanelTitle>
        <Input placeholder="~/Documents/Vault" />
      </StepperPanel>
      <StepperPanel step="done">
        <StepperPanelTitle as="h4">Done</StepperPanelTitle>
        <p className="text-sm text-muted">Your vault is syncing.</p>
      </StepperPanel>
      <StepperActions onNext={next ? advance : undefined} backLabel="Previous" doneLabel="Finish" />
    </Stepper>
  );
}

const errorSteps: readonly StepperStep[] = [
  { id: "destination", label: "Destination", error: "Choose a destination first" },
  { id: "notes", label: "Notes", optional: true },
  { id: "review", label: "Review" },
];

function ErrorOptionalDemo() {
  const [current, setCurrent] = useState("destination");
  return (
    <Stepper steps={errorSteps} current={current} onCurrentChange={setCurrent}>
      <StepperList />
      <StepperPanel step="destination">
        <StepperPanelTitle>Destination</StepperPanelTitle>
        <Input placeholder="s3://backups/exports" invalid />
      </StepperPanel>
      <StepperPanel step="notes">
        <StepperPanelTitle>Notes</StepperPanelTitle>
        <Input placeholder="Optional note for this export" />
      </StepperPanel>
      <StepperPanel step="review">
        <StepperPanelTitle>Review</StepperPanelTitle>
        <p className="text-sm text-muted">Nothing to review yet.</p>
      </StepperPanel>
      <StepperActions onNext={() => {}} nextLabel="Export" />
    </Stepper>
  );
}

const terminalSteps: readonly StepperStep[] = [
  { id: "mode", label: "Mode" },
  { id: "audience", label: "Audience" },
  { id: "result", label: "Result", terminal: true },
];

function TerminalDemo() {
  const [current, setCurrent] = useState("result");
  const completed = new Set(["mode", "audience"]);
  return (
    <Stepper steps={terminalSteps} current={current} onCurrentChange={setCurrent} completed={completed}>
      <StepperList />
      <StepperPanel step="mode">
        <StepperPanelTitle>Mode</StepperPanelTitle>
        <p className="text-sm text-muted">Link sharing.</p>
      </StepperPanel>
      <StepperPanel step="audience">
        <StepperPanelTitle>Audience</StepperPanelTitle>
        <p className="text-sm text-muted">Anyone with the link.</p>
      </StepperPanel>
      <StepperPanel step="result">
        <StepperPanelTitle>Result</StepperPanelTitle>
        <Input readOnly value="https://vsnote.app/s/9f3a2c" />
      </StepperPanel>
      <StepperActions />
    </Stepper>
  );
}

const entry: ShowcaseEntry = {
  title: "Stepper",
  group: "navigation",
  description:
    "Ordered multi-step flow with locked later steps, per-step actions and a terminal result step.",
  demos: [
    { name: "Horizontal", render: () => <HorizontalDemo /> },
    {
      name: "Vertical",
      description: "List beside the panel; custom Back / Done labels and h4 panel titles.",
      render: () => <VerticalDemo />,
    },
    {
      name: "Error & optional",
      description: "An error on the current step blocks Continue (relabelled \"Export\"); optional steps say so on their marker.",
      render: () => <ErrorOptionalDemo />,
    },
    {
      name: "Terminal step",
      description: "Reaching a terminal step hides Back and locks every earlier step.",
      render: () => <TerminalDemo />,
    },
    ...dialogDemos,
  ],
};
export default entry;
