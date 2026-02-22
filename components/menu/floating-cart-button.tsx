"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CartPanel from "@/components/menu/cart-panel";
import { type CartLine } from "@/lib/menu-data";

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
  const [justAdded, setJustAdded] = React.useState(false);
  const prevCount = React.useRef(cartCount);

  // Trigger bubble animation when cart count increases
  React.useEffect(() => {
    if (cartCount > prevCount.current) {
      setJustAdded(true);
      const timer = setTimeout(() => setJustAdded(false), 600);
      return () => clearTimeout(timer);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <>
      {/* Floating bubble button – visible only on mobile/tablet */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 md:hidden
          flex items-center justify-center
          h-14 w-14 rounded-full
          bg-primary text-primary-foreground
          shadow-lg shadow-primary/30
          transition-transform duration-300
          hover:scale-110 active:scale-95
          bubble-float
          ${justAdded ? "bubble-pop" : ""}
        `}
        aria-label="Open cart"
      >
        <ShoppingBag className="h-6 w-6" />

        {/* Item count badge */}
        {cartCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-accent text-accent-foreground border-2 border-background"
          >
            {cartCount}
          </Badge>
        )}
      </button>

      {/* Modal dialog for cart */}
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
    </>
  );
}
