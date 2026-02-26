// lib/menu-data.ts

// ── Types ──────────────────────────────────────────────────────────────────────

export type CategoryKey =
  | "milk-tea"
  | "hq-special"
  | "iced-tea"
  | "milkshakes"
  | "shawarma";

export interface MenuItemOption {
  id: number;
  key: string;
  label: string;
  priceGhs: number;
}

export interface MenuItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: CategoryKey;
  priceGhs: number | null; // null for shawarma with variants
  options: MenuItemOption[]; // empty for drinks, populated for shawarma
  image: string | null;
  inStock: boolean;
}

export interface Topping {
  id: number;
  name: string;
  priceGhs: number;
  inStock: boolean;
}

export interface CartLine {
  lineId: string;
  itemId: number;
  itemName: string;
  optionKey: string;
  optionLabel: string;
  variantId?: number;
  unitPriceGhs: number;
  quantity: number;
  freeToppingId: number | null;
  toppingIds: number[];
  note: string;
  sugarLevel: number | null;
  spiceLevel: number | null;
}

// ── Static categories list ─────────────────────────────────────────────────────
// Drives the nav tabs — order and labels are fixed.

export const categories: Array<{ key: CategoryKey; label: string }> = [
  { key: "milk-tea", label: "Milk Tea" },
  { key: "hq-special", label: "HQ Special" },
  { key: "iced-tea", label: "Iced Tea" },
  { key: "milkshakes", label: "Milkshakes" },
  { key: "shawarma", label: "Shawarma" },
];

// ── Toppings cache ─────────────────────────────────────────────────────────────
// cart-panel and item-sheet call toppings.find() synchronously.
// This gets populated after the first fetchCatalog() call.

export let toppings: Topping[] = [];

// ── API fetch ──────────────────────────────────────────────────────────────────

export interface CatalogResponse {
  categories: Array<{ slug: string; name: string }>;
  items: MenuItem[];
  toppings: Topping[];
}

export async function fetchCatalog(): Promise<CatalogResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not set");

  const res = await fetch(`${apiUrl}/catalog`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);

  const data: CatalogResponse = await res.json();

  // Populate the module-level toppings cache
  toppings = data.toppings;

  return data;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatGhs(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}

export function isDrink(item: MenuItem): boolean {
  return item.options.length === 0 && item.priceGhs !== null;
}

export function isShawarma(item: MenuItem): boolean {
  return item.category === "shawarma";
}
