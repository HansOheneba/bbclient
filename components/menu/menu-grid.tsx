"use client";

import Image from "next/image";
import { Plus, SearchX } from "lucide-react";
import {
  type MenuItem,
  type CategoryKey,
  categories,
  formatGhs,
  isDrink,
} from "@/lib/menu-data";

type MenuGridProps = {
  items: MenuItem[];
  query: string;
  onItemClick: (item: MenuItem) => void;
};

export default function MenuGrid({ items, query, onItemClick }: MenuGridProps) {
  // Group items by category, preserving category order
  const grouped = categories
    .map((cat) => ({
      ...cat,
      items: items.filter((i) => i.category === cat.key),
    }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0 && query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-semibold">
          No results for &ldquo;{query.trim()}&rdquo;
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          What you&apos;re looking for might be out of stock or not on our menu
          yet. Try a different search!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {grouped.map((group) => (
        <section key={group.key} id={group.key} className="scroll-mt-44">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>{group.label}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Tap an item to customize, then add to cart.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((item) => {
              const fromPrice = Math.min(
                ...item.options.map((o) => o.priceGhs),
              );
              const hasMany = item.options.length > 1;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="group text-left rounded-2xl border bg-card shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="flex">
                    {/* Product image */}
                    {item.image && (
                      <div className="relative w-28 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Text content */}
                    <div className="flex-1 min-w-0 p-4 flex items-start justify-between gap-3">
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
                        {hasMany && isDrink(item) && (
                          <p className="text-xs text-muted-foreground">
                            {item.options.map((o) => o.label).join(" / ")}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-xl border bg-background flex items-center justify-center group-hover:bg-accent/20 transition">
                          <Plus className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
