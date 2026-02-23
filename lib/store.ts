import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CartLine,
  type MenuItem,
  toppings,
  isDrink,
  isShawarma,
} from "@/lib/menu-data";
import type { DeliveryLocationPayload } from "@/lib/location-types";

// ── Order types ──────────────────────────────
export type DeliveryMethod = "delivery" | "pickup";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered";

export type Order = {
  id: string;
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNote: string;
  deliveryLocation: DeliveryLocationPayload | null;
  status: OrderStatus;
  createdAt: string;
};

// ── Cart helpers ─────────────────────────────
function calcToppingExtras(toppingIds: string[]): number {
  return toppingIds.reduce((sum, id) => {
    const t = toppings.find((tp) => tp.id === id);
    return sum + (t?.priceGhs ?? 0);
  }, 0);
}

function calcCartTotal(cart: CartLine[]): number {
  return cart.reduce((sum, l) => {
    const toppingExtra = calcToppingExtras(l.toppingIds);
    return sum + (l.unitPriceGhs + toppingExtra) * l.quantity;
  }, 0);
}

// ── Store shape ──────────────────────────────
type CartStore = {
  // Cart
  cart: CartLine[];
  addLine: (
    item: MenuItem,
    optionKey: string,
    freeTopping: string | null,
    toppingIds: string[],
    sugar: number,
    spice: number,
    note: string,
    quantity?: number,
  ) => void;
  incLine: (lineId: string) => void;
  decLine: (lineId: string) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;

  // Derived (computed on access – stored for convenience)
  cartCount: () => number;
  cartTotal: () => number;

  // Checkout info
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNote: string;
  deliveryMethod: DeliveryMethod;
  deliveryLocation: DeliveryLocationPayload | null;
  setCustomerName: (v: string) => void;
  setCustomerPhone: (v: string) => void;
  setDeliveryAddress: (v: string) => void;
  setDeliveryNote: (v: string) => void;
  setDeliveryMethod: (v: DeliveryMethod) => void;
  setDeliveryLocation: (v: DeliveryLocationPayload | null) => void;

  // Orders
  orders: Order[];
  placeOrder: () => Order | null;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // ── Cart state ─────────────────────────
      cart: [],

      addLine: (
        item,
        optionKey,
        freeTopping,
        toppingIds,
        sugar,
        spice,
        note,
        quantity = 1,
      ) => {
        const option =
          item.options.find((o) => o.key === optionKey) ?? item.options[0];
        if (!option) return;

        const shawarma = isShawarma(item);
        const trimmedNote = note.trim();
        const sugarVal = isDrink(item) ? sugar : null;
        const spiceVal = shawarma ? spice : null;
        const finalFreeTopping = shawarma ? null : freeTopping;
        const finalToppingIds = shawarma ? [] : toppingIds;

        const signature = trimmedNote
          ? crypto.randomUUID() // notes always create a separate line
          : `${item.id}|${option.key}|${finalFreeTopping ?? ""}|${finalToppingIds.slice().sort().join(",")}|${sugarVal ?? ""}|${spiceVal ?? ""}`;

        set((state) => {
          const existing = state.cart.find(
            (l) =>
              `${l.itemId}|${l.optionKey}|${l.freeToppingId ?? ""}|${l.toppingIds.slice().sort().join(",")}|${l.sugarLevel ?? ""}|${l.spiceLevel ?? ""}` ===
              signature,
          );

          if (existing) {
            return {
              cart: state.cart.map((l) =>
                l.lineId === existing.lineId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }

          const line: CartLine = {
            lineId: crypto.randomUUID(),
            itemId: item.id,
            itemName: item.name,
            optionKey: option.key,
            optionLabel: option.label,
            unitPriceGhs: option.priceGhs,
            quantity,
            freeToppingId: finalFreeTopping,
            toppingIds: finalToppingIds,
            sugarLevel: sugarVal,
            spiceLevel: spiceVal,
            note: trimmedNote,
          };

          return { cart: [line, ...state.cart] };
        });
      },

      incLine: (lineId) =>
        set((state) => ({
          cart: state.cart.map((l) =>
            l.lineId === lineId ? { ...l, quantity: l.quantity + 1 } : l,
          ),
        })),

      decLine: (lineId) =>
        set((state) => ({
          cart: state.cart
            .map((l) =>
              l.lineId === lineId ? { ...l, quantity: l.quantity - 1 } : l,
            )
            .filter((l) => l.quantity > 0),
        })),

      removeLine: (lineId) =>
        set((state) => ({
          cart: state.cart.filter((l) => l.lineId !== lineId),
        })),

      clearCart: () => set({ cart: [] }),

      // ── Derived ────────────────────────────
      cartCount: () => get().cart.reduce((sum, l) => sum + l.quantity, 0),
      cartTotal: () => calcCartTotal(get().cart),

      // ── Checkout info ──────────────────────
      customerName: "",
      customerPhone: "",
      deliveryAddress: "",
      deliveryNote: "",
      deliveryMethod: "delivery" as DeliveryMethod,
      deliveryLocation: null,
      setCustomerName: (v) => set({ customerName: v }),
      setCustomerPhone: (v) => set({ customerPhone: v }),
      setDeliveryAddress: (v) => set({ deliveryAddress: v }),
      setDeliveryNote: (v) => set({ deliveryNote: v }),
      setDeliveryMethod: (v) => set({ deliveryMethod: v }),
      setDeliveryLocation: (v) => set({ deliveryLocation: v }),

      // ── Orders ─────────────────────────────
      orders: [],

      placeOrder: () => {
        const state = get();
        if (state.cart.length === 0) return null;

        const subtotal = calcCartTotal(state.cart);
        const deliveryFee = state.deliveryMethod === "delivery" ? 10 : 0;

        const order: Order = {
          id: crypto.randomUUID(),
          items: [...state.cart],
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          deliveryMethod: state.deliveryMethod,
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          deliveryAddress:
            state.deliveryLocation?.label ?? state.deliveryAddress,
          deliveryNote: state.deliveryLocation?.notes ?? state.deliveryNote,
          deliveryLocation: state.deliveryLocation,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        console.log("[placeOrder] payload:", JSON.stringify(order, null, 2));

        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
          // Reset checkout fields
          customerName: "",
          customerPhone: "",
          deliveryAddress: "",
          deliveryNote: "",
          deliveryMethod: "delivery",
          deliveryLocation: null,
        }));

        return order;
      },
    }),
    {
      name: "bb-cart-storage", // localStorage key
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        deliveryAddress: state.deliveryAddress,
        deliveryMethod: state.deliveryMethod,
        deliveryLocation: state.deliveryLocation,
      }),
    },
  ),
);
