"use client";

import * as React from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CartPanel from "@/components/menu/cart-panel";
import { type CartLine, formatGhs } from "@/lib/menu-data";

type FloatingCartButtonProps = {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  onInc: (lineId: string) => void;
  onDec: (lineId: string) => void;
  onRemove: (lineId: string) => void;
};

export default function FloatingCartButton({
  cart,
  cartCount,
  cartTotal,
  onInc,
  onDec,
  onRemove,
}: FloatingCartButtonProps) {
  const [open, setOpen] = React.useState(false);

  if (cartCount <= 0) return null;

  return (
    <>
      {/* Minimal full-width bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="
              w-full
              rounded-xl
              bg-primary text-primary-foreground
              border border-white/10
              shadow-md
              active:scale-[0.99]
              transition-transform
            "
            aria-label="Open cart"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Icon */}
              <div className="h-9 w-9 rounded-lg bg-black/15 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>

              {/* Text */}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium leading-4">
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] opacity-80">View cart</p>
              </div>

              {/* Price */}
              <div className="text-sm font-semibold">
                {formatGhs(cartTotal)}
              </div>

              <ChevronRight className="h-4 w-4 opacity-70" />
            </div>
          </button>
        </div>
      </div>

      {/* Modal dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Your cart</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <CartPanel
              cart={cart}
              cartCount={cartCount}
              cartTotal={cartTotal}
              onInc={onInc}
              onDec={onDec}
              onRemove={onRemove}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Spacer so content isn't hidden */}
      <div className="md:hidden h-20" />
    </>
  );
}
