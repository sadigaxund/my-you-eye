import { forwardRef } from "react";
import type { ImgHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const imageVariants = cva("inline-block object-cover bg-secondary", {
  variants: {
    fit: {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
      scaleDown: "object-scale-down",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-ui-sm",
      md: "rounded-ui",
      lg: "rounded-ui-lg",
      full: "rounded-full",
    },
    aspect: {
      auto: "aspect-auto",
      square: "aspect-square",
      video: "aspect-video",
      wide: "aspect-[16/9]",
      tall: "aspect-[3/4]",
    },
    bordered: {
      true: "ring-1 ring-border",
    },
    shadowed: {
      true: "shadow-card",
    },
  },
  defaultVariants: {
    fit: "cover",
    radius: "md",
    aspect: "auto",
  },
});

export interface ImageProps
  extends ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof imageVariants> {
  caption?: string;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fit, radius, aspect, bordered, shadowed, caption, alt = "", ...props }, ref) => {
    const img = (
      <img
        ref={ref}
        alt={alt}
        className={cn(imageVariants({ fit, radius, aspect, bordered, shadowed }), className)}
        {...props}
      />
    );
    if (caption) {
      return (
        <figure className="inline-flex flex-col gap-1.5">
          {img}
          <figcaption className="text-xs text-muted text-center">{caption}</figcaption>
        </figure>
      );
    }
    return img;
  },
);
Image.displayName = "Image";

export { Image, imageVariants };
