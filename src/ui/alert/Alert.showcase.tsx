import type { ShowcaseEntry } from "../../showcase/types";
import { Alert } from ".";

const entry: ShowcaseEntry = {
  title: "Alert",
  group: "feedback",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-3 max-w-lg">
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
        <div className="flex flex-col gap-3 max-w-lg">
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
        <div className="max-w-lg">
          <Alert variant="success" title="Done" icon={<span>✓</span>}>
            Your changes have been saved.
          </Alert>
        </div>
      ),
    },
  ],
};
export default entry;
