"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
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

  /**
   * Optional:
   * If your sections have different ids than the category key,
   * pass a mapper here.
   */
  getSectionId?: (key: CategoryKey) => string;

  /**
   * Optional:
   * If you do not want auto-scrolling, set false.
   */
  scrollOnSelect?: boolean;
};

export default function CategoryNav({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  getSectionId,
  scrollOnSelect = true,
}: CategoryNavProps) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  }>({
    left: 0,
    width: 0,
  });

  function sectionIdFor(key: CategoryKey) {
    return getSectionId ? getSectionId(key) : String(key);
  }

  function scrollToCategory(key: CategoryKey) {
    const id = sectionIdFor(key);
    const el = document.getElementById(id);
    if (!el) return;

    // Best practice: add scroll-mt on the section so sticky headers do not cover it.
    // Example: <section id="starter" className="scroll-mt-36">
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateIndicator() {
    const root = scrollerRef.current;
    const activeBtn = btnRefs.current[String(activeCategory)];
    if (!root || !activeBtn) return;

    const rootRect = root.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    setIndicator({
      left: btnRect.left - rootRect.left + root.scrollLeft,
      width: btnRect.width,
    });

    // Keep the active tab in view
    activeBtn.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  React.useLayoutEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  React.useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);

    // If fonts load late, widths can change
    // This is light and helps keep the underline aligned.
    const t = window.setTimeout(() => updateIndicator(), 150);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sticky top-0 z-40">
      {/* This background block mimics the app header feel */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="mx-auto max-w-7xl px-4 pt-3 pb-2">
          {/* Search bar like the screenshot */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                onQueryChange(e.target.value);
                // Scroll to top so results are visible, not stuck at the footer
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cn(
                "pl-9 pr-9 h-11 rounded-2xl",
                "bg-muted/40 border-muted-foreground/20",
              )}
              placeholder="Search the menu"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tabs row */}
          <div className="mt-3">
            <div
              ref={scrollerRef}
              className={cn(
                "relative flex items-center gap-6",
                "overflow-x-auto no-scrollbar",
                "pb-2",
              )}
            >
              {categories.map((c) => {
                const active = c.key === activeCategory;
                return (
                  <button
                    key={c.key}
                    ref={(el) => {
                      btnRefs.current[String(c.key)] = el;
                    }}
                    type="button"
                    onClick={() => {
                      onCategoryChange(c.key);
                      if (scrollOnSelect) scrollToCategory(c.key);
                    }}
                    className={cn(
                      "relative shrink-0",
                      "text-sm font-semibold",
                      "transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}

              {/* Sliding underline indicator */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bottom-0 h-0.5 rounded-full",
                  "bg-emerald-400",
                  "transition-[transform,width] duration-300 ease-out",
                )}
                style={{
                  width: `${indicator.width}px`,
                  transform: `translateX(${indicator.left}px)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
