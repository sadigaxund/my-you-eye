import { forwardRef } from "react";
import { Root, Image, Fallback } from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const fallbackVariants = cva(
  "flex size-full items-center justify-center rounded-full bg-secondary text-secondary-fg font-medium",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback: string;
}

const Avatar = forwardRef<React.ComponentRef<typeof Root>, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => (
    <Root ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
      {src && <Image src={src} alt={alt} className="size-full object-cover" />}
      <Fallback className={cn(fallbackVariants({ size }))}>
        {fallback.slice(0, 2).toUpperCase()}
      </Fallback>
    </Root>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar, avatarVariants };
