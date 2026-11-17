import type { ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../dialog";
import { Button } from "../../button";
import type { ButtonProps } from "../../button";

export interface ConfirmDialogProps {
  /**
   * Dialog heading and accessible name. Optional: when omitted, `description`
   * is rendered inside the dialog's title element (with description
   * typography) so it becomes the accessible name, and no separate
   * description element is rendered.
   */
  title?: string;
  /** Supporting text under the title. Becomes the accessible name when `title` is omitted. */
  description?: string;
  /** Label of the confirm button. Default "Confirm". */
  confirmLabel?: string;
  /** Label of the cancel button. Default "Cancel". */
  cancelLabel?: string;
  /** Visual variant of the cancel button. Default "ghost"; use "secondary" for equal weight with confirm. */
  cancelVariant?: ButtonProps["variant"];
  /** Styles the confirm button as `danger` instead of `primary`. */
  destructive?: boolean;
  /** Called when the confirm button is clicked. */
  onConfirm: () => void;
  /**
   * Called when the cancel button is clicked. Not called on Escape or
   * overlay click; use `onOpenChange` to observe every close.
   */
  onCancel?: () => void;
  /** Extra content rendered between the header and the action buttons. */
  children?: ReactNode;
  /** Element that opens the dialog (rendered via `asChild`). */
  trigger?: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Called whenever the open state changes (confirm, cancel, Escape, overlay). */
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  cancelVariant = "ghost",
  destructive,
  onConfirm,
  onCancel,
  children,
  trigger,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  if (import.meta.env?.DEV && !title && !description) {
    console.warn("ConfirmDialog: provide a `title` or a `description` so the dialog has an accessible name.");
  }
  const descriptionAsTitle = !title && !!description;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent size="sm" {...(descriptionAsTitle ? { "aria-describedby": undefined } : {})}>
        <DialogHeader>
          {/* text slots wrap (`wrap-anywhere`) so long tokens stay inside the dialog */}
          {title && <DialogTitle className="wrap-anywhere">{title}</DialogTitle>}
          {descriptionAsTitle && (
            <DialogTitle className="text-sm font-normal leading-normal text-muted wrap-anywhere">{description}</DialogTitle>
          )}
          {title && description && <DialogDescription className="wrap-anywhere">{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={cancelVariant} onClick={onCancel}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
