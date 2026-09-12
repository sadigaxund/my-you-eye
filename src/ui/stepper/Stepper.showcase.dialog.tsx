import { useState } from "react";
import type { ShowcaseDemo } from "../../showcase/types";
import { Stepper, StepperList, StepperPanel, StepperPanelTitle, StepperActions } from ".";
import type { StepperStep } from ".";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { Switch } from "../switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../select";
import { RadioGroup, RadioGroupItem } from "../radio-group";

const publishSteps: readonly StepperStep[] = [
  { id: "mode", label: "Mode", description: "How this link is shared" },
  { id: "audience", label: "Audience" },
  { id: "protection", label: "Protection", optional: true },
  { id: "details", label: "Details" },
  { id: "result", label: "Result", terminal: true },
];

function PublishFlow() {
  const [current, setCurrent] = useState("mode");
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const [protect, setProtect] = useState(false);
  const [busy, setBusy] = useState(false);
  const index = publishSteps.findIndex((s) => s.id === current);
  const next = publishSteps[index + 1];

  const advance = () => {
    if (current === "details") {
      setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        setCompleted((prev) => new Set(prev).add(current));
        setCurrent("result");
      }, 900);
      return;
    }
    setCompleted((prev) => new Set(prev).add(current));
    if (next) setCurrent(next.id);
  };

  return (
    <Stepper steps={publishSteps} current={current} onCurrentChange={setCurrent} completed={completed}>
      <StepperList />
      <StepperPanel step="mode">
        <StepperPanelTitle>Mode</StepperPanelTitle>
        <RadioGroup defaultValue="link" aria-label="Sharing mode">
          <label className="flex items-center gap-inline text-sm text-fg">
            <RadioGroupItem value="link" /> Anyone with the link
          </label>
          <label className="flex items-center gap-inline text-sm text-fg">
            <RadioGroupItem value="listed" /> Listed people only
          </label>
        </RadioGroup>
      </StepperPanel>
      <StepperPanel step="audience">
        <StepperPanelTitle>Audience</StepperPanelTitle>
        <Select defaultValue="anyone">
          <SelectTrigger>
            <SelectValue placeholder="Who can open this" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anyone">Anyone with the link</SelectItem>
            <SelectItem value="team">My team only</SelectItem>
          </SelectContent>
        </Select>
      </StepperPanel>
      <StepperPanel step="protection">
        <StepperPanelTitle>Protection</StepperPanelTitle>
        <label className="flex items-center gap-inline text-sm text-fg">
          <Switch checked={protect} onCheckedChange={setProtect} /> Require a password
        </label>
        {protect && <Input type="password" placeholder="Set a password" />}
      </StepperPanel>
      <StepperPanel step="details">
        <StepperPanelTitle>Details</StepperPanelTitle>
        <Input placeholder="Link name" defaultValue="Q3 roadmap" />
        <Textarea placeholder="Note for people opening this link" />
      </StepperPanel>
      <StepperPanel step="result">
        <StepperPanelTitle>Result</StepperPanelTitle>
        <Input readOnly value="https://vsnote.app/s/9f3a2c" />
        <div className="flex justify-end">
          <Button variant="ghost" size="sm">Copy</Button>
        </div>
      </StepperPanel>
      <DialogFooter>
        <StepperActions onNext={advance} busy={busy} />
      </DialogFooter>
    </Stepper>
  );
}

function DialogDemo() {
  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Share link</Button>
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Share this document</DialogTitle>
            <DialogDescription>Choose who can open it and how.</DialogDescription>
          </DialogHeader>
          <PublishFlow />
        </DialogContent>
      </Dialog>
    </div>
  );
}

const demos: ShowcaseDemo[] = [
  {
    name: "Inside a Dialog",
    description:
      "A publish flow: mode, audience, optional protection, details, then a terminal result step. Details → Result shows the busy state.",
    render: () => <DialogDemo />,
  },
];

export default demos;
