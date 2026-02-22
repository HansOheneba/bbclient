"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type MenuItem,
  type CategoryKey,
  categories,
  formatGhs,
} from "@/lib/menu-data";

type MenuGridProps = {
  activeCategory: CategoryKey;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
};

export default function MenuGrid({
  activeCategory,
  items,
  onItemClick,
}: MenuGridProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {categories.find((c) => c.key === activeCategory)?.label}
          </h1>
          <p className="text-sm text-muted-foreground">
            Tap an item to customize, then add to cart.
          </p>
        </div>

        {/* helper badges */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="secondary">Cup sizes: 500ml / 700ml</Badge>
          <Badge variant="secondary">Call: 0536440126</Badge>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const fromPrice = Math.min(...item.options.map((o) => o.priceGhs));
          const hasMany = item.options.length > 1;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item)}
              className="group text-left rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold leading-5">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <p className="mt-3 font-semibold">
                    {hasMany
                      ? `From ${formatGhs(fromPrice)}`
                      : formatGhs(fromPrice)}
                  </p>
                  {hasMany && item.category !== "shawarma" && (
                    <p className="text-xs text-muted-foreground">
                      500ml / 700ml
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-xl border bg-background flex items-center justify-center group-hover:bg-accent/20 transition">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Extras note */}
      <div className="mt-6 rounded-2xl border bg-card p-4">
        <p className="text-sm">
          Extras are optional. We can tighten topping rules in the next step,
          for example toppings only for drinks.
        </p>
      </div>
    </section>
  );
}
