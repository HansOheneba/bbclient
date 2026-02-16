"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const GlassPopover = PopoverPrimitive.Root;

const GlassPopoverTrigger = PopoverPrimitive.Trigger;

const GlassPopoverAnchor = PopoverPrimitive.Anchor;

const GlassPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl p-4",
        "bg-black/40 backdrop-blur-xl border border-white/20",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        "outline-none",
        "animate-jump-in animate-once animate-ease-in-out animate-duration-300",
        // Glass highlight
        "before:absolute before:inset-0 before:rounded-xl",
        "before:bg-linear-to-b before:from-white/15 before:to-transparent before:pointer-events-none",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
GlassPopoverContent.displayName = PopoverPrimitive.Content.displayName;

export {
  GlassPopover,
  GlassPopoverTrigger,
  GlassPopoverContent,
  GlassPopoverAnchor,
};
