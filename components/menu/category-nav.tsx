"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type CategoryKey, categories } from "@/lib/menu-data";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
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
  const mounted = useMounted();
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

  }, []);


  React.useEffect(() => {
    const ids = categories.map((c) => sectionIdFor(c.key));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    let latest: CategoryKey | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;

        // Pick the entry with largest intersectionRatio (most visible)
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0].target.id;
        const cat = categories.find((c) => sectionIdFor(c.key) === id)?.key;
        if (cat && cat !== latest) {
          latest = cat;
          onCategoryChange(cat);
        }
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      },
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // Intentionally omit `activeCategory` so scroll drives updates,
    // include `getSectionId` as it can change mapping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSectionId, onCategoryChange]);

  return (
    <div className="sticky top-0 z-40">
      {/* This background block mimics the app header feel */}
      <div className="bg-background/95 backdrop-blur bg-black border-b">
        <div className="mx-auto max-w-7xl px-4 pt-3 pb-2">
          {/* Search bar like the screenshot */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {mounted ? (
                <Search className="h-4 w-4 text-muted-foreground" />
              ) : (
                <span className="block h-4 w-4" aria-hidden="true" />
              )}
            </div>
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
                {mounted ? (
                  <X className="h-4 w-4" />
                ) : (
                  <span className="block h-4 w-4" aria-hidden="true" />
                )}
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
                className="absolute bottom-0 h-[3px] rounded-full transition-[transform,width] duration-300 ease-out"
                style={{
                  width: `${indicator.width}px`,
                  transform: `translateX(${indicator.left}px)`,

                  // Neon gradient based on #b94888
                  background:
                    "linear-gradient(90deg, #ff7bb8 0%, #b94888 50%, #ff7bb8 100%)",

                  // Neon glow layers
                  boxShadow: `
      0 0 6px rgba(185,72,136,0.9),
      0 0 12px rgba(185,72,136,0.8),
      0 0 20px rgba(185,72,136,0.6),
      0 0 30px rgba(185,72,136,0.4)
    `,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
