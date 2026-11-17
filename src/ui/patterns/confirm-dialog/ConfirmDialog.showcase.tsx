import type { ShowcaseEntry } from "../../../showcase/types";
import { ConfirmDialog } from ".";
import { Button } from "../../button";
import { Card } from "../../card";

const entry: ShowcaseEntry = {
  title: "ConfirmDialog",
  group: "patterns",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex justify-center gap-6">
          <ConfirmDialog
            title="Delete item"
            description="This action cannot be undone."
            confirmLabel="Delete"
            destructive
            onConfirm={() => alert("Confirmed!")}
            trigger={<Button variant="danger">Delete</Button>}
          />
          <ConfirmDialog
            title="Leave page?"
            description="You have unsaved changes."
            confirmLabel="Leave"
            onConfirm={() => alert("Left!")}
            trigger={<Button variant="secondary">Leave</Button>}
          />
        </div>
      ),
    },
    {
      name: "Custom labels",
      description: "Description-only dialog with custom button labels and an equal-weight deny button.",
      render: () => (
        <ConfirmDialog
          description="Allow Notes to access your microphone?"
          confirmLabel="Allow"
          cancelLabel="Don't allow"
          cancelVariant="secondary"
          onConfirm={() => alert("Allowed")}
          onCancel={() => alert("Denied")}
          trigger={<Button variant="secondary">Request access</Button>}
        />
      ),
    },
    {
      name: "Body slot",
      description: "Children render between the header and the actions.",
      render: () => (
        <ConfirmDialog
          title="Publish note"
          description="Anyone with the link will be able to read it."
          confirmLabel="Publish"
          onConfirm={() => alert("Published")}
          trigger={<Button>Publish</Button>}
        >
          <p className="text-sm">The note will be visible until you unpublish it.</p>
          <Card className="mt-stack p-panel-sm text-sm">
            Do you want to share it with everyone in the workspace?
          </Card>
        </ConfirmDialog>
      ),
    },
    {
      name: "Stress",
      description: "Long title, unbroken token, in a narrow container.",
      render: () => (
        <div className="w-80">
          <ConfirmDialog
            title="Permanently delete the quarterly planning workspace and every attached revision history"
            description="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
            confirmLabel="Delete everything"
            destructive
            onConfirm={() => alert("Deleted")}
            trigger={<Button variant="danger" className="w-full">Delete workspace</Button>}
          />
        </div>
      ),
    },
  ],
};
export default entry;
