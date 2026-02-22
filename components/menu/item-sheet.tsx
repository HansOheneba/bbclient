"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toppings, formatGhs, type MenuItem } from "@/lib/menu-data";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ItemSheetProps = {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOptionKey: string;
  onOptionChange: (key: string) => void;
  freeToppingId: string | null;
  onFreeToppingChange: (id: string | null) => void;
  selectedToppings: string[];
  onToppingsChange: (toppings: string[]) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onAddToCart: () => void;
};

export default function ItemSheet({
  item,
  open,
  onOpenChange,
  selectedOptionKey,
  onOptionChange,
  freeToppingId,
  onFreeToppingChange,
  selectedToppings,
  onToppingsChange,
  note,
  onNoteChange,
  onAddToCart,
}: ItemSheetProps) {
  function togglePaidTopping(id: string) {
    onToppingsChange(
      selectedToppings.includes(id)
        ? selectedToppings.filter((x) => x !== id)
        : [...selectedToppings, id],
    );
  }

  function selectFreeTopping(id: string) {
    onFreeToppingChange(freeToppingId === id ? null : id);
  }

  function buildIntentSentence(args: {
    itemName: string;
    optionLabel?: string;
    freeToppingName?: string | null;
    paidToppingNames: string[];
  }) {
    const { itemName, optionLabel, freeToppingName, paidToppingNames } = args;

    const base = optionLabel ? `${itemName} (${optionLabel})` : itemName;

    const paidPretty =
      paidToppingNames.length === 0
        ? ""
        : paidToppingNames.length === 1
          ? paidToppingNames[0]
          : paidToppingNames.length === 2
            ? `${paidToppingNames[0]} and ${paidToppingNames[1]}`
            : `${paidToppingNames.slice(0, -1).join(", ")}, and ${
                paidToppingNames[paidToppingNames.length - 1]
              }`;

    if (!freeToppingName && paidToppingNames.length === 0) {
      return `I am ordering ${base}.`;
    }
    if (freeToppingName && paidToppingNames.length === 0) {
      return `I am ordering ${base} with ${freeToppingName}.`;
    }
    if (freeToppingName && paidToppingNames.length > 0) {
      return `I am ordering ${base} with ${freeToppingName} plus ${paidPretty}.`;
    }
    return `I am ordering ${base} with ${paidPretty}.`;
  }

  const prefersReducedMotion = usePrefersReducedMotion();

  // Bottom-sheet slide animation (real sheet feel)
  const sheetMotion = prefersReducedMotion
    ? {}
    : {
        initial: { y: "100%", opacity: 1 },
        animate: {
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }, // easeOutCubic-ish
        },
        exit: {
          y: "100%",
          opacity: 1,
          transition: {
            duration: 0.22,
            ease: [0.4, 0, 1, 1] as [number, number, number, number],
          },
        },
      };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Keep Sheet in charge of overlay + focus-trap.
          We animate the panel inside so we don’t fight Radix. */}
      <SheetContent
        side="bottom"
        className={cn(
          // Let our own panel control sizing/rounded corners
          "p-0 border-0 bg-transparent shadow-none overflow-visible",

          // On desktop: center the sheet container and keep the close button INSIDE by not constraining weirdly
          "sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-none",
        )}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key={item?.id ?? "item-modal"}
              {...sheetMotion}
              className={cn(
                // This is the actual visible sheet panel
                "relative mx-auto w-full bg-background border shadow-lg",

                // Mobile bottom sheet: rounded top only + fixed height
                "rounded-t-2xl h-[80vh] overflow-y-auto px-4 pb-6 pt-4",

                // Desktop: more like a dialog card centered, not full height
                "sm:rounded-2xl sm:h-auto sm:max-h-[85vh]",
                "sm:w-140 sm:max-w-[calc(100vw-2rem)]",
              )}
            >
              {/* Custom close button INSIDE the panel (so it never floats outside on desktop) */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className={cn(
                  "absolute right-3 top-3 z-10",
                  "inline-flex h-9 w-9 items-center justify-center rounded-full",
                  "border bg-background/80 backdrop-blur",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-accent/20 transition",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                )}
              >
                {/* simple X icon without extra deps */}
                <span className="text-lg leading-none">×</span>
              </button>

              {item ? (
                <>
                  {/* Product image banner */}
                  {item.image && (
                    <div className="relative w-full h-48 -mt-4 -mx-4 mb-4" style={{ width: 'calc(100% + 2rem)' }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 560px"
                        className="object-cover rounded-t-2xl"
                        priority
                      />
                    </div>
                  )}

                  <SheetHeader className="pr-12">
                    <SheetTitle>{item.name}</SheetTitle>
                    <SheetDescription>{item.description}</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-4 mt-4">
                    {/* Options */}
                    <div>
                      <p className="text-sm font-medium mb-2">
                        {item.options.length > 1 && item.category !== "shawarma"
                          ? "Choose your size"
                          : "Choose option"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.options.map((o) => {
                          const active = o.key === selectedOptionKey;
                          return (
                            <button
                              key={o.key}
                              type="button"
                              onClick={() => onOptionChange(o.key)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm font-medium transition",
                                "focus:outline-none focus:ring-2 focus:ring-ring",
                                active
                                  ? "bg-foreground text-background border-foreground"
                                  : "bg-card hover:bg-accent/20",
                              )}
                            >
                              {o.label} • {formatGhs(o.priceGhs)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Free topping */}
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Complimentary topping
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Select one topping for free!
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {toppings.map((t) => {
                          const active = freeToppingId === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => selectFreeTopping(t.id)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                "focus:outline-none focus:ring-2 focus:ring-ring",
                                active
                                  ? "bg-green-600 text-white border-green-600"
                                  : "bg-card hover:bg-accent/20",
                              )}
                            >
                              {t.name} {active ? "• FREE" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Paid toppings */}
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Additional toppings
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Want more? Each extra topping is charged.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {toppings.map((t) => {
                          const active = selectedToppings.includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => togglePaidTopping(t.id)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                "focus:outline-none focus:ring-2 focus:ring-ring",
                                active
                                  ? "bg-foreground text-background border-foreground"
                                  : "bg-card hover:bg-accent/20",
                              )}
                            >
                              {t.name} (+{formatGhs(t.priceGhs)})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Note */}
                    <div>
                      <label
                        htmlFor="item-note"
                        className="text-sm font-medium mb-1 block"
                      >
                        Add a note (optional)
                      </label>
                      <textarea
                        id="item-note"
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder="e.g. less sugar, extra ice, no pearls…"
                        rows={2}
                        className="w-full rounded-lg border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>

                    {/* Footer row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {(() => {
                          const option = item.options.find(
                            (o) => o.key === selectedOptionKey,
                          );

                          const freeName = freeToppingId
                            ? toppings.find((t) => t.id === freeToppingId)?.name
                            : null;

                          const paidNames = selectedToppings
                            .map(
                              (id) => toppings.find((t) => t.id === id)?.name,
                            )
                            .filter(Boolean) as string[];

                          const intent = buildIntentSentence({
                            itemName: item.name,
                            optionLabel: option?.label,
                            freeToppingName: freeName,
                            paidToppingNames: paidNames,
                          });

                          return (
                            <p className="text-xs text-muted-foreground leading-snug">
                              {intent}
                            </p>
                          );
                        })()}
                      </div>

                      <Button type="button" onClick={onAddToCart}>
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(!!mq.matches);

    onChange();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }

    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  return reduced;
}
