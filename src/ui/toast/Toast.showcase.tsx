import type { ShowcaseEntry } from "../../showcase/types";
import { useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Toaster, useToast } from ".";
import type { ToasterProps } from ".";
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
            classNames: { title: "font-mono", description: "italic", close: "opacity-100" },
          })
        }
      >
        Custom className toast
      </Button>
    </div>
  );
}

// The demo cards each create a stacking context, so a Toaster mounted in an
// earlier card would paint its toasts underneath every later card. All demos
// therefore share the ONE Toaster mounted by the LAST demo ("Trigger toasts"); the Placement
// and "Limit and duration" demos steer it through this tiny store and fire
// toasts through the bridge below.
type Placement = NonNullable<ToasterProps["placement"]>;
interface HostOptions {
  placement: Placement;
  mobilePlacement: Placement;
  limit?: number;
}
let hostOptions: HostOptions = { placement: "bottom-right", mobilePlacement: "bottom-right" };
let hostToast: ReturnType<typeof useToast>["toast"] | null = null;
const hostListeners = new Set<() => void>();
function setHostOptions(next: HostOptions) {
  hostOptions = next;
  hostListeners.forEach((l) => l());
}
function useHostOptions(): HostOptions {
  return useSyncExternalStore(
    (l) => {
      hostListeners.add(l);
      return () => void hostListeners.delete(l);
    },
    () => hostOptions,
  );
}

function ToastBridge() {
  const { toast } = useToast();
  useEffect(() => {
    hostToast = toast;
    return () => {
      hostToast = null;
    };
  }, [toast]);
  return null;
}

function SharedToaster({ children }: { children: ReactNode }) {
  const { placement, mobilePlacement, limit } = useHostOptions();
  return (
    <Toaster placement={placement} mobilePlacement={mobilePlacement} limit={limit} duration={4000}>
      <ToastBridge />
      {children}
    </Toaster>
  );
}

function PlacementButtons() {
  const show = (p: Placement) => {
    setHostOptions({ placement: p, mobilePlacement: "bottom-center" });
    hostToast?.({ title: p, description: "Placed via the Toaster placement prop.", tone: "soft" });
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="secondary" onClick={() => show("top-left")}>Top left</Button>
      <Button variant="secondary" onClick={() => show("top-center")}>Top center</Button>
      <Button variant="secondary" onClick={() => show("top-right")}>Top right</Button>
      <Button variant="secondary" onClick={() => show("bottom-left")}>Bottom left</Button>
      <Button variant="secondary" onClick={() => show("bottom-center")}>Bottom center</Button>
      <Button variant="secondary" onClick={() => show("bottom-right")}>Bottom right</Button>
    </div>
  );
}

function LimitButtons() {
  const show = () => {
    setHostOptions({ placement: "bottom-right", mobilePlacement: "bottom-right", limit: 1 });
    hostToast?.({ title: "Synced", description: "Only the newest toast stays visible.", politeness: "polite", duration: 2000 });
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="secondary" onClick={show}>
        Polite toast (limit 1, 2s)
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
      name: "Placement",
      description: "Toaster placement moves the stack to any corner or edge centre; mobilePlacement overrides it below sm.",
      render: () => <PlacementButtons />,
    },
    {
      name: "Limit and duration",
      description: "Toaster limit keeps only the newest toasts; duration and politeness can be set per toast.",
      render: () => <LimitButtons />,
    },
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
        <SharedToaster>
          <div className="flex flex-col gap-4">
            <ToastDemo />
            <ToastSoftToneDemo />
            <ToastCustomClassNameDemo />
          </div>
        </SharedToaster>
      ),
    },
  ],
};
export default entry;
