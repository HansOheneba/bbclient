// ──────────────────────────────────────────────
// Shared types & static data for the menu / cart
// ──────────────────────────────────────────────

export type CategoryKey =
  | "milk-tea"
  | "hq-special"
  | "iced-tea"
  | "milkshakes"
  | "shawarma";

export type PriceOption = {
  key: string;
  label: string;
  priceGhs: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: CategoryKey;
  options: PriceOption[];
  image?: string;
};

export type Topping = {
  id: string;
  name: string;
  priceGhs: number;
};

export type CartLine = {
  lineId: string;
  itemId: string;
  itemName: string;
  optionKey: string;
  optionLabel: string;
  unitPriceGhs: number;
  quantity: number;
  freeToppingId: string | null;
  toppingIds: string[];
  note: string;
  sugarLevel: number | null; // null for non-drink items
  spiceLevel: number | null; // null for non-shawarma items
};

// ── Categories ───────────────────────────────
export const categories: Array<{
  key: CategoryKey;
  label: string;
}> = [
  { key: "milk-tea", label: "Milk Tea" },
  { key: "hq-special", label: "HQ Special" },
  { key: "iced-tea", label: "Iced Tea" },
  { key: "milkshakes", label: "Milkshakes" },
  { key: "shawarma", label: "Shawarma" },
];

// ── Toppings ─────────────────────────────────
export const toppings: Topping[] = [
  { id: "top-chocolate", name: "Chocolate", priceGhs: 5 },
  { id: "top-sweet-choco", name: "Sweetened Choco", priceGhs: 5 },
  { id: "top-vanilla", name: "Vanilla", priceGhs: 5 },
  { id: "top-cheese-foam", name: "Cheese Foam", priceGhs: 7 },
  { id: "top-strawberry-popping", name: "Strawberry Popping", priceGhs: 6 },
  { id: "top-blueberry-popping", name: "Blueberry Popping", priceGhs: 6 },
  { id: "top-mint-popping", name: "Mint Popping", priceGhs: 6 },
  { id: "top-whipped-cream", name: "Whipped Cream", priceGhs: 6 },
  { id: "top-biscoff", name: "Biscoff Spread", priceGhs: 8 },
  { id: "top-caramel-syrup", name: "Caramel Syrup", priceGhs: 5 },
  { id: "top-grape-popping", name: "Grape Popping", priceGhs: 6 },
  { id: "top-strawberry-jam", name: "Strawberry Jam", priceGhs: 5 },
];

// ── Menu ─────────────────────────────────────
export const menu: MenuItem[] = [
  // MILK TEA
  {
    id: "mt-brown-sugar",
    name: "Brown Sugar Milk",
    description: "Creamy milk tea with deep brown sugar sweetness.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "mt-dalgona",
    name: "Dalgona Coffee",
    description: "Coffee-forward milk tea with a smooth whipped finish.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "mt-vanilla-bliss",
    name: "Vanilla Bliss",
    description: "Classic vanilla milk tea, mellow and rich.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "mt-terrific-taro",
    name: "Terrific Taro",
    description: "Taro milk tea with a nutty, creamy taste.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "mt-matcha-emerald",
    name: "Matcha Emerald",
    description: "Matcha milk tea with a fresh green tea kick.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "mt-lotus",
    name: "Lotus",
    description: "Cookie-style sweetness with a creamy milk tea base.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [{ key: "default", label: "Regular", priceGhs: 50 }],
  },
  {
    id: "mt-oreo",
    name: "Oreo",
    description: "Creamy milk tea blended with Oreo flavor.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [{ key: "default", label: "Regular", priceGhs: 50 }],
  },
  {
    id: "mt-tiramisu",
    name: "Tiramisu",
    description: "Dessert-inspired milk tea with coffee and cream notes.",
    category: "milk-tea",
    image: "/boba.jpg",
    options: [{ key: "default", label: "Regular", priceGhs: 50 }],
  },

  // HQ SPECIAL
  {
    id: "hq-corny",
    name: "Corny Boba-Popcorn",
    description: "Crunchy popcorn vibe with boba goodness.",
    category: "hq-special",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "hq-cheesy-mango",
    name: "Cheesy Mango",
    description: "Sweet mango blend topped with a cheesy twist.",
    category: "hq-special",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "hq-c3-blaze",
    name: "C3 Blaze (Chocolate Chip Cookie)",
    description: "Chocolatey cookie flavor with a creamy finish.",
    category: "hq-special",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "hq-pina-colada",
    name: "Pina Colada (Pineapple & Coconut)",
    description: "Tropical pineapple-coconut blend, super refreshing.",
    category: "hq-special",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "hq-cheesy-ube",
    name: "Cheesy Ube",
    description: "Ube flavor with a creamy cheesy layer.",
    category: "hq-special",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },

  // ICED TEA
  {
    id: "it-fizzy-lemonade",
    name: "Fizzy Lemonade",
    description: "Sparkly lemonade, crisp and cold.",
    category: "iced-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "it-peach",
    name: "Peach Perfect Peach",
    description: "Sweet peach iced tea with a fruity finish.",
    category: "iced-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "it-spiced-chai",
    name: "Spiced Chai",
    description: "Chai spices served chilled for a bold taste.",
    category: "iced-tea",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },

  // MILKSHAKES
  {
    id: "ms-creamy-chai",
    name: "Creamy Chai",
    description: "Milkshake with chai spice and creamy texture.",
    category: "milkshakes",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "ms-bubble-gum",
    name: "Bubble Gum",
    description: "Fun bubble gum milkshake, sweet and smooth.",
    category: "milkshakes",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },
  {
    id: "ms-vanilla",
    name: "Vanilla",
    description: "Classic vanilla milkshake, rich and creamy.",
    category: "milkshakes",
    image: "/boba.jpg",
    options: [
      { key: "regular", label: "Regular (500ml)", priceGhs: 35 },
      { key: "large", label: "Large (700ml)", priceGhs: 40 },
    ],
  },

  // SHAWARMA
  {
    id: "sh-chicken",
    name: "Chicken Shawarma",
    description: "Juicy chicken with fresh veg and signature sauce.",
    category: "shawarma",
    image: "/shawarma.jpg",
    options: [
      { key: "S", label: "Small", priceGhs: 40 },
      { key: "L", label: "Large", priceGhs: 50 },
    ],
  },
  {
    id: "sh-beef",
    name: "Beef Shawarma",
    description: "Savory beef wrap with fresh veg and signature sauce.",
    category: "shawarma",
    image: "/shawarma.jpg",
    options: [
      { key: "S", label: "Small", priceGhs: 45 },
      { key: "L", label: "Large", priceGhs: 55 },
    ],
  },
  {
    id: "sh-mixed",
    name: "Mixed Shawarma",
    description: "Chicken + beef combo for the full experience.",
    category: "shawarma",
    image: "/shawarma.jpg",
    options: [{ key: "default", label: "Regular", priceGhs: 65 }],
  },
];

// Assign a stable image URL to every menu item to simulate a backend
// providing `image` as part of the item payload. Assignment is
// deterministic: we pick from a category-specific pool using a
// simple hash of the `item.id` so the same item always gets the same
// image across runs.
const _imagesByCategory: Record<string, string[]> = {
  "milk-tea": [
    "/menu/caramel.jpg",
    "/menu/coffe.jpg",
    "/menu/oreo.jpg",
    "/menu/strawberry.jpg",
  ],
  "hq-special": [
    "/menu/strawberry.jpg",
    "/menu/caramel.jpg",
    "/menu/coffe.jpg",
  ],
  "iced-tea": ["/menu/strawberry.jpg", "/menu/coffe.jpg"],
  milkshakes: [
    "/menu/milkshake1.jpg",
    "/menu/milkshake2.jpg",
    "/menu/milkshake3.jpg",
  ],
  // keep shawarma pointing to the existing shawarma image in public root
  shawarma: ["/shawarma.jpg"],
};

function _deterministicPick(id: string, pool: string[]) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return pool[sum % pool.length];
}

for (const item of menu) {
  const pool =
    _imagesByCategory[item.category] ?? _imagesByCategory["milk-tea"];
  item.image = _deterministicPick(item.id, pool);
}

// ── Sugar & Spice levels (re-exported from levels.ts) ──
export { sugarLevels, spiceLevels, levelByValue } from "@/lib/levels";
export type { DiscreteLevel, LevelDef } from "@/lib/levels";

// ── Drink detection ──────────────────────────
const drinkCategories = new Set<CategoryKey>([
  "milk-tea",
  "hq-special",
  "iced-tea",
  "milkshakes",
]);

export function isDrink(item: MenuItem): boolean {
  return drinkCategories.has(item.category);
}

export function isShawarma(item: MenuItem): boolean {
  return item.category === "shawarma";
}

// ── Helpers ──────────────────────────────────
export function formatGhs(value: number): string {
  return `GHS ${value.toFixed(0)}`;
}
