"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type CategoryKey, categories } from "@/lib/menu-data";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type CategoryNavProps = {
  activeCategory: CategoryKey;
  onCategoryChange: (key: CategoryKey) => void;
  query: string;
  onQueryChange: (value: string) => void;
};

export default function CategoryNav({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
}: CategoryNavProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-3">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((c) => {
          const active = c.key === activeCategory;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onCategoryChange(c.key)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card hover:bg-accent/20",
              )}
            >
              <span className="mr-2">{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* search */}
      <div className="mt-3 flex items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-9"
            placeholder="Search the menu"
          />
        </div>
      </div>
    </div>
  );
}
