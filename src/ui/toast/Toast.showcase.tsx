import type { ShowcaseEntry } from "../../showcase/types";
import { Toaster, useToast } from ".";
import { Button } from "../button";

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button onClick={() => toast({ title: "Saved", description: "Changes saved successfully.", variant: "success" })}>
        Success toast
      </Button>
      <Button variant="danger" onClick={() => toast({ title: "Error", description: "Something went wrong.", variant: "danger" })}>
        Error toast
      </Button>
      <Button variant="secondary" onClick={() => toast({ title: "Hello", description: "This is a default toast." })}>
        Default toast
      </Button>
    </div>
  );
}

function ToastSoftToneDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        variant="secondary"
        onClick={() => toast({ title: "Hello", description: "This is a default toast.", tone: "soft" })}
      >
        Default (soft)
      </Button>
      <Button
        onClick={() =>
          toast({ title: "Share link created", description: "Anyone with the link can view this note.", variant: "success", tone: "soft" })
        }
      >
        Success (soft)
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          toast({ title: "Could not publish note", description: "Check your connection and try again.", variant: "danger", tone: "soft" })
        }
      >
        Danger (soft)
      </Button>
    </div>
  );
}

function ToastCustomClassNameDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Draft synced",
            description: "Your note was synced to all devices.",
            className: "border-dashed",
            classNames: { title: "font-mono" },
          })
        }
      >
        Custom className toast
      </Button>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Toast",
  group: "feedback",
  description: "A transient notification for success, danger, and default states, triggered imperatively via the useToast hook.",
  demos: [
    {
      name: "Trigger toasts",
      description: "Solid (default) tone, the soft tone with a status accent bar, and className/classNames overrides.",
      // The Toaster's viewport is `position: fixed` — it belongs to the
      // viewport corner, not to this demo's card, so the card must not
      // become its containing block (see ShowcaseDemo.contain). Every
      // trigger lives inside this ONE Toaster on purpose: a demo card
      // creates its own stacking context, so a toast viewport mounted in an
      // earlier card would paint underneath every later card on the page.
      contain: false,
      render: () => (
        <Toaster>
          <div className="flex flex-col gap-4">
            <ToastDemo />
            <ToastSoftToneDemo />
            <ToastCustomClassNameDemo />
          </div>
        </Toaster>
      ),
    },
  ],
};
export default entry;
