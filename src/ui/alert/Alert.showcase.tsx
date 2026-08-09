import type { ShowcaseEntry } from "../../showcase/types";
import { Alert } from ".";

const entry: ShowcaseEntry = {
  title: "Alert",
  group: "feedback",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          <Alert variant="info">This is an informational message.</Alert>
          <Alert variant="success">Operation completed successfully.</Alert>
          <Alert variant="warning">Please review before proceeding.</Alert>
          <Alert variant="danger">Something went wrong.</Alert>
        </div>
      ),
    },
    {
      name: "With title",
      render: () => (
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          <Alert variant="info" title="Heads up!">
            We just released a new version.
          </Alert>
          <Alert variant="danger" title="Error">
            Your session has expired. Please log in again.
          </Alert>
        </div>
      ),
    },
    {
      name: "With icon",
      render: () => (
        <div className="max-w-lg mx-auto">
          <Alert variant="success" title="Done" icon={<span>✓</span>}>
            Your changes have been saved.
          </Alert>
        </div>
      ),
    },
    {
      name: "Size",
      description: "size (sm/md/lg, default md) — same padding scale as Card, so density is uniform between Card/Alert/StatCard.",
      render: () => (
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          <Alert variant="info" size="sm">Compact padding for dense layouts.</Alert>
          <Alert variant="info" size="md">Default padding.</Alert>
          <Alert variant="info" size="lg">Roomier padding.</Alert>
        </div>
      ),
    },
    {
      name: "Note & tip",
      description: "variant=\"note\"/\"tip\" — presentation callouts (a left-accent card) for narrative asides in a video, distinct from the four status-alert variants above.",
      render: () => (
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          <Alert variant="note" title="Note">
            The cache is invalidated automatically after a deploy.
          </Alert>
          <Alert variant="tip" title="Tip">
            You can pass a numeric delta to StatCard and it formats the sign for you.
          </Alert>
        </div>
      ),
    },
    {
      name: "Presentation size (xl)",
      description: "size=\"xl\" steps up padding (its own --spacing-panel-xl token) and title/body typography for legibility at video scale.",
      render: () => (
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          <Alert variant="tip" size="xl" title="Pro tip">
            Compose, don't restyle — CodeBlock's tokenizer is reused by both DiffBlock and Terminal.
          </Alert>
        </div>
      ),
    },
  ],
};
export default entry;
