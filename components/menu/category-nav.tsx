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
  getSectionId?: (key: CategoryKey) => string;
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

  // Track whether the user manually clicked a tab so we can
  // suppress the scroll-observer from fighting the click.
  const userClickedRef = React.useRef(false);
  const clickLockTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Debounce timer for the scroll observer
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  function sectionIdFor(key: CategoryKey) {
    return getSectionId ? getSectionId(key) : String(key);
  }

  function scrollToCategory(key: CategoryKey) {
    const id = sectionIdFor(key);
    const el = document.getElementById(id);
    if (!el) return;
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
    const t = window.setTimeout(() => updateIndicator(), 150);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll-position based active section detection.
  // This is more reliable than IntersectionObserver for nav sync because
  // we measure each section's top offset directly and pick the one closest
  // to the viewport top — with a debounce so it doesn't fire on every pixel.
  React.useEffect(() => {
    const DEBOUNCE_MS = 80; // wait for scroll to settle before updating nav
    const NAV_OFFSET = 120; // approximate sticky nav height in px

    function getActiveSection(): CategoryKey | null {
      const pairs = categories
        .map((c) => {
          const el = document.getElementById(sectionIdFor(c.key));
          if (!el) return null;
          const top = el.getBoundingClientRect().top - NAV_OFFSET;
          return { key: c.key, top };
        })
        .filter(Boolean) as { key: CategoryKey; top: number }[];

      if (pairs.length === 0) return null;

      // Find the last section whose top is at or above the viewport fold
      // i.e. top <= 0, meaning we've scrolled past its start.
      const passed = pairs.filter((p) => p.top <= 0);

      if (passed.length === 0) {
        // Haven't reached any section yet — use the first
        return pairs[0].key;
      }

      // The most recently passed section = largest (least negative) top
      passed.sort((a, b) => b.top - a.top);
      return passed[0].key;
    }

    function onScroll() {
      // If the user just clicked a tab, let the programmatic scroll finish
      // before we re-engage the observer so the nav doesn't jump back.
      if (userClickedRef.current) return;

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        const next = getActiveSection();
        if (next && next !== activeCategory) {
          onCategoryChange(next);
        }
      }, DEBOUNCE_MS);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, getSectionId, onCategoryChange]);

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-background/95 backdrop-blur bg-black border-b">
        <div className="mx-auto max-w-7xl px-4 pt-3 pb-2">
          {/* Search */}
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

          {/* Tabs */}
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

                      // Lock the scroll observer out for long enough that the
                      // smooth-scroll animation completes (~800 ms is safe for
                      // most page lengths). Without this the observer fires
                      // mid-scroll and snaps the nav back to the wrong tab.
                      userClickedRef.current = true;
                      if (clickLockTimer.current)
                        clearTimeout(clickLockTimer.current);
                      clickLockTimer.current = setTimeout(() => {
                        userClickedRef.current = false;
                      }, 900);

                      if (scrollOnSelect) scrollToCategory(c.key);
                    }}
                    className={cn(
                      "relative shrink-0",
                      "text-sm font-semibold",
                      "transition-colors duration-200",
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
                className="absolute bottom-0 h-[3px] rounded-full"
                style={{
                  width: `${indicator.width}px`,
                  transform: `translateX(${indicator.left}px)`,
                  // Smooth CSS transition on the underline itself
                  transition:
                    "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  background:
                    "linear-gradient(90deg, #ff7bb8 0%, #b94888 50%, #ff7bb8 100%)",
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
