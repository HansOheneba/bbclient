"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import CategoryNav from "@/components/menu/category-nav";
import MenuGrid from "@/components/menu/menu-grid";
import CartPanel from "@/components/menu/cart-panel";
import ItemSheet from "@/components/menu/item-sheet";
import FloatingCartButton from "@/components/menu/floating-cart-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faCloudSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import {
  type CategoryKey,
  type MenuItem,
  menu,
  categories,
} from "@/lib/menu-data";
import { useCartStore } from "@/lib/store";

export default function Home() {
  // ── Category & search state ──────────────
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryKey>("milk-tea");
  const [query, setQuery] = React.useState<string>("");

  // ── Cart state (Zustand) ─────────────────
  const cart = useCartStore((s) => s.cart);
  const cartCount = useCartStore((s) => s.cartCount)();
  const cartTotal = useCartStore((s) => s.cartTotal)();
  const addLine = useCartStore((s) => s.addLine);
  const incLine = useCartStore((s) => s.incLine);
  const decLine = useCartStore((s) => s.decLine);
  const removeLine = useCartStore((s) => s.removeLine);

  // ── Item modal state ─────────────────────
  const [openItemId, setOpenItemId] = React.useState<string | null>(null);
  const [selectedOptionKey, setSelectedOptionKey] =
    React.useState<string>("default");
  const [freeToppingId, setFreeToppingId] = React.useState<string | null>(null);
  const [selectedToppings, setSelectedToppings] = React.useState<string[]>([]);
  const [sugarLevel, setSugarLevel] = React.useState<number>(50);
  const [spiceLevel, setSpiceLevel] = React.useState<number>(2);
  const [itemNote, setItemNote] = React.useState<string>("");

  // ── Derived values ───────────────────────
  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menu;
    return menu.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [query]);

  const openItem = openItemId ? menu.find((m) => m.id === openItemId) : null;

  // ── Helpers ──────────────────────────────
  function resetItemModalDefaults(item: MenuItem) {
    const first = item.options[0];
    setSelectedOptionKey(first ? first.key : "default");
    setFreeToppingId(null);
    setSelectedToppings([]);
    setSugarLevel(50);
    setSpiceLevel(2);
    setItemNote("");
  }

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return {
        text: "Good morning",
        icon: faSun,
      };
    }

    if (hour < 17) {
      return {
        text: "Good afternoon",
        icon: faCloudSun,
      };
    }

    return {
      text: "Good evening",
      icon: faMoon,
    };
  }, []);

  // ── Nav menu state ─────────────────────────
  const [navOpen, setNavOpen] = React.useState(false);

  // ── Scroll-spy: update active category as user scrolls ──
  const isManualScroll = React.useRef(false);

  React.useEffect(() => {
    const sectionIds = categories.map((c) => c.key);
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScroll.current) return;
        // Find the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveCategory(visible[0].target.id as CategoryKey);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredItems]);

  function handleCategoryChange(key: CategoryKey) {
    isManualScroll.current = true;
    setActiveCategory(key);
    // Let the scroll settle, then re-enable scroll-spy
    setTimeout(() => {
      isManualScroll.current = false;
    }, 800);
  }

  // ── Render ───────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="leading-tight">
            <p className="font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={greeting.icon} className="text-[#fffff]" />
              {greeting.text}
            </p>
            <p className="text-xs text-muted-foreground">
              What are we getting today?
            </p>
          </div>

          <div className="flex-1" />

          {/* Menu icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              className="rounded-lg border bg-card p-2 hover:bg-accent/20 transition"
              aria-label="Open navigation menu"
            >
              {navOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {navOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNavOpen(false)}
                />
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border bg-card shadow-lg p-2 space-y-1">
                  {[
                    { label: "Home", href: "/" },
                    { label: "Our Story", href: "/#story" },
                    { label: "Contact", href: "/#contact" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setNavOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent/20 transition"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category chips + search */}
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          query={query}
          onQueryChange={setQuery}
        />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          {/* Menu grid */}
          <MenuGrid
            items={filteredItems}
            query={query}
            onItemClick={(item) => {
              setOpenItemId(item.id);
              resetItemModalDefaults(item);
            }}
          />

          {/* Desktop cart sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-[140px] h-[calc(100vh-170px)] rounded-2xl border bg-card p-4">
              <CartPanel
                cart={cart}
                cartCount={cartCount}
                cartTotal={cartTotal}
                onInc={incLine}
                onDec={decLine}
                onRemove={removeLine}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Floating cart button for mobile/tablet – opens Dialog modal */}
      <FloatingCartButton
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onInc={incLine}
        onDec={decLine}
        onRemove={removeLine}
      />

      {/* Item customisation modal */}
      <ItemSheet
        item={openItem ?? null}
        open={openItemId !== null}
        onOpenChange={(open) => {
          if (!open) setOpenItemId(null);
        }}
        selectedOptionKey={selectedOptionKey}
        onOptionChange={setSelectedOptionKey}
        freeToppingId={freeToppingId}
        onFreeToppingChange={setFreeToppingId}
        selectedToppings={selectedToppings}
        onToppingsChange={setSelectedToppings}
        sugarLevel={sugarLevel}
        onSugarLevelChange={setSugarLevel}
        spiceLevel={spiceLevel}
        onSpiceLevelChange={setSpiceLevel}
        note={itemNote}
        onNoteChange={setItemNote}
        onAddToCart={(quantity) => {
          if (openItem) {
            addLine(
              openItem,
              selectedOptionKey,
              freeToppingId,
              selectedToppings,
              sugarLevel,
              spiceLevel,
              itemNote,
              quantity,
            );
            setOpenItemId(null);
          }
        }}
      />
    </div>
  );
}
