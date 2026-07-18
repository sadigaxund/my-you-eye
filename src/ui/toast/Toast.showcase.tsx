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
  demos: [
    {
      name: "Trigger toasts",
      render: () => (
        <Toaster>
          <ToastDemo />
        </Toaster>
      ),
    },
  ],
};
export default entry;
