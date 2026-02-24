"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faCube } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { type CartLine, toppings, formatGhs } from "@/lib/menu-data";
import { sugarLevels, spiceLevels, levelByValue } from "@/lib/levels";

type CartPanelProps = {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  onInc: (lineId: string) => void;
  onDec: (lineId: string) => void;
  onRemove: (lineId: string) => void;
};


export function CartPanelSkeleton() {
  return (
    <div className="sticky top-10 h-fit max-h-[calc(100dvh-2rem)] w-full">
      <div className="h-fit max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="mt-1.5 h-4 w-36 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <Separator className="my-3" />

        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-2/3 rounded" />
                  <Skeleton className="mt-1.5 h-3 w-1/2 rounded" />
                  <Skeleton className="mt-1.5 h-3 w-1/3 rounded" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-6 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export default function CartPanel({
  cart,
  cartCount,
  cartTotal,
  onInc,
  onDec,
  onRemove,
}: CartPanelProps) {
  const router = useRouter();

  // This makes the panel smaller by default and only introduces inner scrolling
  // when the cart has enough items to warrant it.
  const listMaxHeight = useMemo(() => {
    // 0–2 items: no forced scrolling, let the panel size naturally
    if (cart.length <= 2) return undefined;

    // 3+ items: constrain list to viewport so the whole card stays sticky
    // Header + separators + footer are accounted for roughly here.
    return "calc(100dvh - 230px)";
  }, [cart.length]);

  return (
    <div className="sticky top-4 h-fit max-h-[calc(100dvh-2rem)] w-full">
      {/* Card wrapper so the whole thing sticks immediately */}
      <div className="h-fit max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Your cart</h3>
            <p className="text-sm text-muted-foreground">
              {cartCount === 0
                ? "Add items to start an order."
                : `${cartCount} item(s)`}
            </p>
          </div>
          <Badge variant="secondary">{formatGhs(cartTotal)}</Badge>
        </div>

        <Separator className="my-3" />

        {/* Important: min-h-0 lets the scroll area actually shrink inside flex containers */}
        <div className="min-h-0">
          {cart.length === 0 ? (
            <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              Your cart is empty.
            </div>
          ) : (
            <div
              className="space-y-3 overflow-y-auto pr-1"
              style={{ maxHeight: listMaxHeight }}
            >
              {cart.map((l) => {
                const freeTopping = l.freeToppingId
                  ? toppings.find((t) => t.id === l.freeToppingId)?.name
                  : null;

                const paidToppingLabels = l.toppingIds
                  .map((id) => toppings.find((t) => t.id === id)?.name)
                  .filter(Boolean) as string[];

                return (
                  <div key={l.lineId} className="rounded-xl border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-5">{l.itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.optionLabel} • {formatGhs(l.unitPriceGhs)}
                        </p>

                        {freeTopping ? (
                          <p className="mt-1 text-xs text-green-600">
                            {freeTopping}
                          </p>
                        ) : null}

                        {paidToppingLabels.length > 0 ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            + {paidToppingLabels.join(", ")}
                          </p>
                        ) : null}

                        {l.sugarLevel !== null ? (
                          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <FontAwesomeIcon
                              icon={faCube}
                              className="h-3.5 w-3.5 text-muted-foreground"
                            />
                            <span>
                              {levelByValue(sugarLevels, l.sugarLevel)?.label ??
                                "Regular"}
                            </span>
                          </p>
                        ) : null}

                        {l.spiceLevel !== null && l.spiceLevel > 0 ? (
                          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <FontAwesomeIcon
                              icon={faFire}
                              className="h-3.5 w-3.5 text-muted-foreground"
                            />
                            <span>
                              {levelByValue(spiceLevels, l.spiceLevel)?.label ??
                                "No spice"}
                            </span>
                          </p>
                        ) : null}

                        {l.note ? (
                          <p className="mt-1 text-xs text-muted-foreground italic">
                            📝 {l.note}
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                        onClick={() => onRemove(l.lineId)}
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={() => onDec(l.lineId)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="w-6 text-center text-sm font-medium">
                          {l.quantity}
                        </span>

                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={() => onInc(l.lineId)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm font-semibold">
                        {formatGhs(l.unitPriceGhs * l.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator className="my-3" />

        <Button
          type="button"
          className="w-full"
          disabled={cart.length === 0}
          onClick={() => router.push("/order/checkout")}
        >
          Checkout • {formatGhs(cartTotal)}
        </Button>
      </div>
    </div>
  );
}
