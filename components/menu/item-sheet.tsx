"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faFire } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
// using native <select> instead of shadcn Select

import {
  toppings,
  formatGhs,
  isDrink,
  isShawarma,
  type MenuItem,
} from "@/lib/menu-data";
import { sugarLevels, spiceLevels, levelByValue } from "@/lib/levels";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ── Sheet banner image with skeleton ──────────────── */
function SheetImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div
      className="relative w-full h-48 -mt-4 -mx-4 mb-4"
      style={{ width: "calc(100% + 2rem)" }}
    >
      {!loaded && <Skeleton className="absolute inset-0 z-10 rounded-t-2xl" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 560px"
        className="object-cover rounded-t-2xl"
        priority
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

type ItemSheetProps = {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOptionKey: string;
  onOptionChange: (key: string) => void;
  freeToppingId: number | null;
  onFreeToppingChange: (id: number | null) => void;
  selectedToppings: number[];
  onToppingsChange: (toppings: number[]) => void;
  sugarLevel: number;
  onSugarLevelChange: (level: number) => void;
  spiceLevel: number;
  onSpiceLevelChange: (level: number) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onAddToCart: (quantity: number) => void;
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
  sugarLevel,
  onSugarLevelChange,
  spiceLevel,
  onSpiceLevelChange,
  note,
  onNoteChange,
  onAddToCart,
}: ItemSheetProps) {
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (open) setQuantity(1);
  }, [open, item?.id]);

  function togglePaidTopping(id: number) {
    onToppingsChange(
      selectedToppings.includes(id)
        ? selectedToppings.filter((x) => x !== id)
        : [...selectedToppings, id],
    );
  }

  const itemIsShawarma = item ? isShawarma(item) : false;

  // Important: sugar only for drinks, never for shawarma
  const itemIsDrink = item ? isDrink(item) && !itemIsShawarma : false;

  const sugarMeta = levelByValue(sugarLevels, sugarLevel);
  const sugarLabel = sugarMeta?.label ?? "Regular";

  const spiceMeta = levelByValue(spiceLevels, spiceLevel);
  const spiceLabel = spiceMeta?.label ?? "No spice";

  function buildIntentSentence(args: {
    itemName: string;
    optionLabel?: string;
    freeToppingName?: string | null;
    paidToppingNames: string[];
    sugarPct?: string | null;
    spiciness?: string | null;
    isShawarmaItem?: boolean;
  }) {
    const {
      itemName,
      optionLabel,
      freeToppingName,
      paidToppingNames,
      sugarPct,
      spiciness,
      isShawarmaItem,
    } = args;

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

    const sugarSuffix = sugarPct ? `, ${sugarPct} sugar` : "";
    const spiceSuffix =
      spiciness && spiciness !== "No spice" ? `, ${spiciness} spice` : "";
    const suffix = `${sugarSuffix}${spiceSuffix}`;

    if (!freeToppingName && paidToppingNames.length === 0) {
      const noToppings = !isShawarmaItem ? " with no toppings" : "";
      return `I want ${base}${noToppings}${suffix}.`;
    }
    if (freeToppingName && paidToppingNames.length === 0) {
      return `I want ${base} with ${freeToppingName}${suffix}.`;
    }
    if (freeToppingName && paidToppingNames.length > 0) {
      return `I want ${base} with ${freeToppingName} plus ${paidPretty}${suffix}.`;
    }
    return `I want ${base} with ${paidPretty}${suffix}.`;
  }

  const prefersReducedMotion = usePrefersReducedMotion();

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
          },
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

  const freeToppingValue =
    freeToppingId === null ? "none" : String(freeToppingId);
  const freeToppingOptions = toppings.filter((t) => t.inStock);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "p-0 border-0 bg-transparent shadow-none overflow-visible",
          "sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-none",
        )}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key={item?.id ?? "item-modal"}
              {...sheetMotion}
              className={cn(
                "relative mx-auto w-full bg-background border shadow-lg",
                "rounded-t-2xl h-[80vh] overflow-y-auto px-4 pb-6 pt-4",
                "sm:rounded-2xl sm:h-auto sm:max-h-[85vh]",
                "sm:w-140 sm:max-w-[calc(100vw-2rem)]",
              )}
            >
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
                <span className="text-lg leading-none">×</span>
              </button>

              {item ? (
                <>
                  {item.image && (
                    <SheetImage src={item.image} alt={item.name} />
                  )}

                  <SheetHeader className="pr-12">
                    <SheetTitle>{item.name}</SheetTitle>
                    <SheetDescription>{item.description}</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-4 mt-4">
                    {item.options.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Choose your size
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
                    )}

                    {/* Sugar level: drinks only, legend on top */}
                    {itemIsDrink && (
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-medium">Sugar level</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {sugarMeta?.label ?? "Regular"}
                            </span>
                            {sugarMeta?.sublabel ? (
                              <span className="ml-2 text-xs">
                                {sugarMeta.sublabel}
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <Slider
                          min={0}
                          max={4}
                          step={1}
                          value={[sugarLevel]}
                          onValueChange={([v]) => onSugarLevelChange(v)}
                        />

                        {/* Legends aligned under the track */}
                        <div className="flex items-start justify-between">
                          {sugarLevels.map((s) => {
                            const opacity = 0.18 + (s.value / 4) * 0.82;
                            const active = s.value === sugarLevel;
                            return (
                              <div
                                key={s.value}
                                className={cn(
                                  "w-12 flex flex-col items-center gap-0.5 select-none",
                                  active
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                <FontAwesomeIcon
                                  icon={faCube}
                                  className="h-3.5 w-3.5"
                                  style={{ opacity }}
                                />
                                <span className="text-[10px] leading-tight">
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Spiciness: shawarma only, legend on top */}
                    {itemIsShawarma && (
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-medium">Spiciness</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {spiceMeta?.label ?? "No spice"}
                            </span>
                            {spiceMeta?.sublabel ? (
                              <span className="ml-2 text-xs">
                                {spiceMeta.sublabel}
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <Slider
                          min={0}
                          max={4}
                          step={1}
                          value={[spiceLevel]}
                          onValueChange={([v]) => onSpiceLevelChange(v)}
                        />

                        <div className="flex items-start justify-between">
                          {spiceLevels.map((s) => {
                            const opacity = 0.18 + (s.value / 4) * 0.82;
                            const active = s.value === spiceLevel;
                            return (
                              <div
                                key={s.value}
                                className={cn(
                                  "w-12 flex flex-col items-center gap-0.5 select-none",
                                  active
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                <FontAwesomeIcon
                                  icon={faFire}
                                  className="h-3.5 w-3.5"
                                  style={{
                                    opacity,
                                    color:
                                      s.value === 0
                                        ? undefined
                                        : `rgba(220, 38, 38, ${opacity})`,
                                  }}
                                />
                                <span className="text-[10px] leading-tight">
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Complimentary topping (dropdown) */}
                    {!itemIsShawarma && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Complimentary topping
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pick one free topping.
                        </p>

                        <div className="w-fit">
                          <select
                            value={freeToppingValue}
                            onChange={(e) =>
                              onFreeToppingChange(
                                e.target.value === "none"
                                  ? null
                                  : Number(e.target.value),
                              )
                            }
                            className={cn(
                              "h-11 rounded-2xl w-full text-sm",
                              "border-border/60",
                              "bg-card/70",
                              "backdrop-blur-xl supports-[backdrop-filter]:bg-card/55",
                              "shadow-sm",
                              "focus:ring-2 focus:ring-ring",
                              "px-3",
                            )}
                          >
                            <option value="none">No topping</option>
                            {freeToppingOptions.map((t) => (
                              <option key={t.id} value={String(t.id)}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                          If you change your mind, select “No topping”.
                        </p>
                      </div>
                    )}

                    {/* Paid toppings */}
                    {!itemIsShawarma && (
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Additional toppings
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Each extra topping is charged.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {toppings
                            .filter((t) => t.inStock)
                            .map((t) => {
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
                    )}

                    <Separator />

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

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {(() => {
                          const option = item.options.find(
                            (o) => o.key === selectedOptionKey,
                          );

                          const freeName =
                            freeToppingId !== null
                              ? toppings.find((t) => t.id === freeToppingId)
                                  ?.name
                              : null;

                          const paidNames = selectedToppings
                            .map(
                              (id) => toppings.find((t) => t.id === id)?.name,
                            )
                            .filter(Boolean) as string[];

                          const intent = buildIntentSentence({
                            itemName: item.name,
                            optionLabel: option?.label,
                            freeToppingName: itemIsShawarma ? null : freeName,
                            paidToppingNames: itemIsShawarma ? [] : paidNames,
                            sugarPct: itemIsDrink ? sugarLabel : null,
                            spiciness: itemIsShawarma ? spiceLabel : null,
                            isShawarmaItem: itemIsShawarma,
                          });

                          return (
                            <p className="text-xs text-muted-foreground leading-snug">
                              {intent}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg font-medium transition",
                            "focus:outline-none focus:ring-2 focus:ring-ring",
                            quantity <= 1
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-accent/20",
                          )}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((q) => Math.min(20, q + 1))
                          }
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg font-medium transition",
                            "focus:outline-none focus:ring-2 focus:ring-ring hover:bg-accent/20",
                          )}
                        >
                          +
                        </button>
                      </div>

                      <Button
                        type="button"
                        onClick={() => onAddToCart(quantity)}
                      >
                        Add {quantity > 1 ? `${quantity} ` : ""}to cart
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
