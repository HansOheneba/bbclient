"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type MenuItem, categories, formatGhs, isDrink } from "@/lib/menu-data";

type MenuGridProps = {
  items: MenuItem[];
  query: string;
  onItemClick: (item: MenuItem) => void;
  loading?: boolean;
};

/* ── Skeleton card for a single menu item ──────────── */
function MenuItemSkeleton() {
  return (
    <div className="rounded-2xl border shadow-sm bg-card/60 overflow-hidden">
      <div className="flex items-stretch">
        <div className="p-3 pr-4 flex items-center">
          <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 lg:h-24 lg:w-24 rounded-xl" />
        </div>
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="mt-2 h-3 w-full rounded" />
              <Skeleton className="mt-1 h-3 w-2/3 rounded" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Full-page skeleton grid ──────────────────────── */
export function MenuGridSkeleton() {
  return (
    <div className="space-y-10">
      {[1, 2].map((section) => (
        <section key={section}>
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="mt-2 mb-4 h-4 w-56 rounded" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── Individual card image with skeleton overlay ───── */
function CardImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-24 lg:w-24 overflow-hidden rounded-xl bg-muted">
      {!loaded && <Skeleton className="absolute inset-0 z-10 rounded-xl" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="96px"
        className="object-cover"
        loading="eager"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function MenuGrid({
  items,
  query,
  onItemClick,
  loading,
}: MenuGridProps) {
  if (loading) return <MenuGridSkeleton />;

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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {group.items.map((item) => (
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
                  {item.image ? (
                    <div className="p-3 pr-4 flex items-center">
                      <CardImage src={item.image} alt={item.name} />
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
                      </div>

                      <div className="shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition group-hover:bg-accent/20">
                          <Plus className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
