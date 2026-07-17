import { forwardRef, useState, useRef, useCallback } from "react";
import type { HTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const fileDropVariants = cva(
  "relative flex flex-col items-center justify-center gap-2 rounded-ui border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
  {
    variants: {
      state: {
        default: "border-border bg-bg hover:bg-secondary/50",
        dragging: "border-primary bg-primary/5",
        error: "border-danger bg-danger/5",
        success: "border-success bg-success/5",
      },
      size: {
        sm: "min-h-[80px] p-4 text-xs",
        md: "min-h-[120px] p-8 text-sm",
        lg: "min-h-[160px] p-10 text-base",
      },
    },
    defaultVariants: {
      state: "default",
      size: "md",
    },
  },
);

export interface FileDropProps extends Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> {
  onDrop?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const FileDrop = forwardRef<HTMLDivElement, FileDropProps>(
  ({ className, onDrop, accept, multiple = true, maxSize, size, disabled, ...props }, ref) => {
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndDrop = useCallback((files: FileList) => {
      setError(null);
      setSuccess(false);
      const fileArray = Array.from(files);
      if (!multiple && fileArray.length > 1) {
        setError("Only one file allowed");
        return;
      }
      if (accept) {
        const pattern = accept.replace(/\*/g, ".*");
        const invalid = fileArray.find(f => !f.type.match(pattern));
        if (invalid) {
          setError(`File type not accepted: ${invalid.name}`);
          return;
        }
      }
      if (maxSize) {
        const oversized = fileArray.find(f => f.size > maxSize);
        if (oversized) {
          const mb = maxSize / 1024 / 1024;
          setError(`File too large (max ${mb.toFixed(0)}MB): ${oversized.name}`);
          return;
        }
      }
      setSuccess(true);
      onDrop?.(fileArray);
    }, [multiple, accept, maxSize, onDrop]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback(() => setDragOver(false), []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      validateAndDrop(e.dataTransfer.files);
    }, [disabled, validateAndDrop]);

    const handleClick = useCallback(() => inputRef.current?.click(), []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) validateAndDrop(e.target.files);
    }, [validateAndDrop]);

    const state = disabled ? "default" : error ? "error" : success ? "success" : dragOver ? "dragging" : "default";

    return (
      <div
        ref={ref}
        className={cn(fileDropVariants({ state, size }), disabled && "opacity-50 cursor-not-allowed", className)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleClick}
        {...props}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleFileChange} />
        {dragOver ? (
          <>
            <svg viewBox="0 0 24 24" className="size-8 text-primary fill-none stroke-current stroke-[1.5]">
              <path d="M12 4v12m0 0l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            <p className="font-medium text-primary">Drop files here</p>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="size-8 text-muted fill-none stroke-current stroke-[1.5]">
              <path d="M7 16a4 4 0 010-8 5 5 0 0110 0 4 4 0 010 8h-1M12 4v12m0 0l-3-3m3 3l3-3" />
            </svg>
            <p className="font-medium text-fg">{error || success ? "" : "Drop files here or click to browse"}</p>
            {error && <p className="text-xs text-danger">{error}</p>}
            {success && <p className="text-xs text-success">Files added</p>}
            {!error && !success && (
              <p className="text-xs text-muted">
                {accept ? `Accepts: ${accept}` : "Any file type"}
                {maxSize ? ` · Max ${(maxSize / 1024 / 1024).toFixed(0)}MB` : ""}
                {multiple ? " · Multiple" : ""}
              </p>
            )}
          </>
        )}
      </div>
    );
  },
);
FileDrop.displayName = "FileDrop";

export { FileDrop, fileDropVariants };
