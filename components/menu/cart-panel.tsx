"use client";

import { useRouter } from "next/navigation";
import { Plus, Minus, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faCube } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type CartLine,
  toppings,
  spiceLevels,
  formatGhs,
} from "@/lib/menu-data";

type CartPanelProps = {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  onInc: (lineId: string) => void;
  onDec: (lineId: string) => void;
  onRemove: (lineId: string) => void;
};

export default function CartPanel({
  cart,
  cartCount,
  cartTotal,
  onInc,
  onDec,
  onRemove,
}: CartPanelProps) {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your cart</h3>
          <p className="text-sm text-muted-foreground">
            {cartCount === 0
              ? "Add items to start an order."
              : `${cartCount} item(s)`}
          </p>
        </div>
        <Badge variant="secondary">{formatGhs(cartTotal)}</Badge>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {cart.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            Your cart is empty.
          </div>
        ) : (
          cart.map((l) => {
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
                      <p className="text-xs text-green-600 mt-1">
                        {freeTopping}
                      </p>
                    ) : null}

                    {paidToppingLabels.length > 0 ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        + {paidToppingLabels.join(", ")}
                      </p>
                    ) : null}

                    {l.sugarLevel !== null ? (
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <FontAwesomeIcon
                          icon={faCube}
                          className="h-3.5 w-3.5 text-muted-foreground"
                        />
                        <span>Sugar: {l.sugarLevel}%</span>
                      </p>
                    ) : null}

                    {l.spiceLevel !== null && l.spiceLevel > 0 ? (
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <FontAwesomeIcon
                          icon={faFire}
                          className="h-3.5 w-3.5 text-muted-foreground"
                        />
                        <span>
                          Spice:{" "}
                          {spiceLevels.find((s) => s.value === l.spiceLevel)
                            ?.label ?? "None"}
                        </span>
                      </p>
                    ) : null}

                    {l.note ? (
                      <p className="text-xs text-muted-foreground mt-1 italic">
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
          })
        )}
      </div>

      <Separator className="my-4" />

      <Button
        type="button"
        className="w-full"
        disabled={cart.length === 0}
        onClick={() => router.push("/order/checkout")}
      >
        Checkout • {formatGhs(cartTotal)}
      </Button>
    </div>
  );
}
