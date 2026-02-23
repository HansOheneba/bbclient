"use client";

import Image from "next/image";
import { Plus, SearchX } from "lucide-react";
import { type MenuItem, categories, formatGhs, isDrink } from "@/lib/menu-data";

type MenuGridProps = {
  items: MenuItem[];
  query: string;
  onItemClick: (item: MenuItem) => void;
};

export default function MenuGrid({ items, query, onItemClick }: MenuGridProps) {
  const grouped = categories
    .map((cat) => ({
      ...cat,
      items: items.filter((i) => i.category === cat.key),
    }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0 && query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <SearchX className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-semibold">
          No results for &ldquo;{query.trim()}&rdquo;
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
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
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <span>{group.label}</span>
          </h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Tap an item to customize, then add to cart.
          </p>

          {/* Desktop = 2 columns. Mobile = 1. */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                  className={[
                    "group text-left rounded-2xl border shadow-sm transition",
                    "bg-card/60 hover:bg-card hover:shadow-md",
                    "overflow-hidden",
                  ].join(" ")}
                >
                  <div className="flex items-stretch">
                    {/* Text */}
                          {/* Image (padded, fixed size, doesn’t touch edges) */}
                          {item.image ? (
                            <div className="p-3 pr-4 flex items-center">
                              <div className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-24 lg:w-24 overflow-hidden rounded-xl bg-muted">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 pr-4 flex items-center">
                              <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-24 lg:w-24 rounded-xl bg-muted" />
                            </div>
                          )}
                    <div className="flex-1 min-w-0 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold leading-5">{item.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>

                          {/* <p className="mt-3 font-semibold">
                            {hasMany
                              ? `From ${formatGhs(fromPrice)}`
                              : formatGhs(fromPrice)}
                          </p> */}

                          {/* {hasMany && isDrink(item) && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.options.map((o) => o.label).join(" / ")}
                            </p>
                          )} */}
                        </div>

                        {/* Plus button */}
                        <div className="shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition group-hover:bg-accent/20">
                            <Plus className="h-5 w-5" />
                          </div>
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
