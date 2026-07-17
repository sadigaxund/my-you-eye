import type { ShowcaseEntry } from "../../../showcase/types";
import { ConfirmDialog } from ".";
import { Button } from "../../button";

const entry: ShowcaseEntry = {
  title: "ConfirmDialog",
  group: "patterns",
  demos: [
    {
      name: "Default",
      render: () => (
        <ConfirmDialog
          title="Delete item"
          description="This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={() => alert("Confirmed!")}
          trigger={<Button variant="danger">Delete</Button>}
        />
      ),
    },
    {
      name: "Non-destructive",
      render: () => (
        <ConfirmDialog
          title="Leave page?"
          description="You have unsaved changes."
          confirmLabel="Leave"
          onConfirm={() => alert("Left!")}
          trigger={<Button variant="secondary">Leave</Button>}
        />
      ),
    },
  ],
};
export default entry;
