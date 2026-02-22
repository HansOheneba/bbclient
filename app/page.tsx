"use client";

import * as React from "react";
import Image from "next/image";

import CategoryNav from "@/components/menu/category-nav";
import MenuGrid from "@/components/menu/menu-grid";
import CartPanel from "@/components/menu/cart-panel";
import ItemModal from "@/components/menu/item-modal";
import FloatingCartButton from "@/components/menu/floating-cart-button";

import {
  type CategoryKey,
  type CartLine,
  type MenuItem,
  menu,
  toppings,
} from "@/lib/menu-data";

function calcToppingExtras(
  toppingIds: string[],
  freeToppingId: string | null,
): number {
  return toppingIds.reduce((sum, id) => {
    const t = toppings.find((tp) => tp.id === id);
    return sum + (t?.priceGhs ?? 0);
  }, 0);
}

export default function Home() {
  // ── Category & search state ──────────────
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryKey>("milk-tea");
  const [query, setQuery] = React.useState<string>("");

  // ── Cart state ───────────────────────────
  const [cart, setCart] = React.useState<CartLine[]>([]);

  // ── Item modal state ─────────────────────
  const [openItemId, setOpenItemId] = React.useState<string | null>(null);
  const [selectedOptionKey, setSelectedOptionKey] =
    React.useState<string>("default");
  const [freeToppingId, setFreeToppingId] = React.useState<string | null>(null);
  const [selectedToppings, setSelectedToppings] = React.useState<string[]>([]);
  const [itemNote, setItemNote] = React.useState<string>("");

  // ── Derived values ───────────────────────
  const activeItems = React.useMemo(() => {
    const base = menu.filter((m) => m.category === activeCategory);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [activeCategory, query]);

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);

  const cartTotal = cart.reduce((sum, l) => {
    const toppingExtra = calcToppingExtras(l.toppingIds, l.freeToppingId);
    return sum + (l.unitPriceGhs + toppingExtra) * l.quantity;
  }, 0);

  const openItem = openItemId ? menu.find((m) => m.id === openItemId) : null;

  // ── Helpers ──────────────────────────────
  function resetItemModalDefaults(item: MenuItem) {
    const first = item.options[0];
    setSelectedOptionKey(first ? first.key : "default");
    setFreeToppingId(null);
    setSelectedToppings([]);
    setItemNote("");
  }

  function addLineToCart(
    item: MenuItem,
    optionKey: string,
    freeTopping: string | null,
    toppingIds: string[],
    note: string,
  ) {
    const option =
      item.options.find((o) => o.key === optionKey) ?? item.options[0];
    if (!option) return;

    const trimmedNote = note.trim();
    const signature = `${item.id}|${option.key}|${freeTopping ?? ""}|${toppingIds.slice().sort().join(",")}|${trimmedNote}`;

    setCart((prev) => {
      const existing = prev.find(
        (l) =>
          `${l.itemId}|${l.optionKey}|${l.freeToppingId ?? ""}|${l.toppingIds
            .slice()
            .sort()
            .join(",")}|${l.note}` === signature,
      );

      if (existing) {
        return prev.map((l) =>
          l.lineId === existing.lineId ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }

      const line: CartLine = {
        lineId: crypto.randomUUID(),
        itemId: item.id,
        itemName: item.name,
        optionKey: option.key,
        optionLabel: option.label,
        unitPriceGhs: option.priceGhs,
        quantity: 1,
        freeToppingId: freeTopping,
        toppingIds,
        note: trimmedNote,
      };

      return [line, ...prev];
    });
  }

  function decLine(lineId: string) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.lineId === lineId ? { ...l, quantity: l.quantity - 1 } : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }

  function incLine(lineId: string) {
    setCart((prev) =>
      prev.map((l) =>
        l.lineId === lineId ? { ...l, quantity: l.quantity + 1 } : l,
      ),
    );
  }

  function removeLine(lineId: string) {
    setCart((prev) => prev.filter((l) => l.lineId !== lineId));
  }

  // ── Render ───────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border bg-card">
              <Image
                src="/bbl-white.png"
                alt="Bubble Bliss"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="font-semibold">Bubble Bliss Cafe</p>
              <p className="text-xs text-muted-foreground">
                Abura Taxi Station
              </p>
            </div>
          </div>

          <div className="flex-1" />
        </div>

        {/* Category chips + search */}
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          query={query}
          onQueryChange={setQuery}
        />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          {/* Menu grid */}
          <MenuGrid
            activeCategory={activeCategory}
            items={activeItems}
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
      <ItemModal
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
        note={itemNote}
        onNoteChange={setItemNote}
        onAddToCart={() => {
          if (openItem) {
            addLineToCart(
              openItem,
              selectedOptionKey,
              freeToppingId,
              selectedToppings,
              itemNote,
            );
            setOpenItemId(null);
          }
        }}
      />
    </div>
  );
}
