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

const entry: ShowcaseEntry = {
  title: "Toast",
  group: "feedback",
  description: "A transient notification for success, danger, and default states, triggered imperatively via the useToast hook.",
  demos: [
    {
      name: "Trigger toasts",
      // The Toaster's viewport is `position: fixed` — it belongs to the
      // viewport corner, not to this demo's card, so the card must not
      // become its containing block (see ShowcaseDemo.contain).
      contain: false,
      render: () => (
        <Toaster>
          <ToastDemo />
        </Toaster>
      ),
    },
  ],
};
export default entry;
