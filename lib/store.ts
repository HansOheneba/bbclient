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
import { placeOrderApi } from "@/lib/api";

// ── Order types ──────────────────────────────
export type DeliveryMethod = "delivery" | "pickup";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered";

export type Order = {
  id: string; // local UUID kept for de-duplication / history
  apiOrderId: number | null; // real ID returned by the server
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

function calcToppingExtras(toppingIds: number[]): number {
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
  cart: CartLine[];
  addLine: (
    item: MenuItem,
    optionKey: string,
    freeTopping: number | null,
    toppingIds: number[],
    sugar: number,
    spice: number,
    note: string,
    quantity?: number,
  ) => void;
  incLine: (lineId: string) => void;
  decLine: (lineId: string) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;

  cartCount: () => number;
  cartTotal: () => number;

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

  orders: Order[];
  /**
   * Sends the cart to the API and, on success, clears the cart and saves the
   * order to local history.  Returns the created Order (with apiOrderId set)
   * or throws an Error if the API call fails.
   */
  placeOrder: () => Promise<Order>;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
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
        const shawarma = isShawarma(item);
        const drink = isDrink(item);

        let unitPriceGhs: number;
        let resolvedOptionKey: string;
        let resolvedOptionLabel: string;
        let resolvedVariantId: number | undefined;

        if (drink) {
          unitPriceGhs = item.priceGhs ?? 0;
          resolvedOptionKey = "default";
          resolvedOptionLabel = "";
          resolvedVariantId = undefined;
        } else {
          const option =
            item.options.find((o) => o.key === optionKey) ?? item.options[0];
          if (!option) return;
          unitPriceGhs = option.priceGhs;
          resolvedOptionKey = option.key;
          resolvedOptionLabel = option.label;
          // option.id is the DB variantId the backend needs
          resolvedVariantId = option.id;
        }

        const trimmedNote = note.trim();
        // Ensure we store a numeric product id. UI may sometimes pass a
        // slug-like string (e.g. "shawarma-2") or a numeric-string; coerce
        // to an integer so the backend receives an integer productId.
        function resolveNumericId(rawId: unknown): number {
          if (typeof rawId === "number") return rawId;
          if (typeof rawId === "string") {
            if (/^\d+$/.test(rawId)) return parseInt(rawId, 10);
            const m = rawId.match(/-(\d+)$/);
            if (m) return parseInt(m[1], 10);
          }
          throw new Error(`Unable to resolve numeric id from ${String(rawId)}`);
        }
        const sugarVal = drink ? sugar : null;
        const spiceVal = shawarma ? spice : null;
        const finalFreeTopping = shawarma ? null : freeTopping;
        const finalToppingIds = shawarma ? [] : toppingIds;

        let resolvedItemId: number;
        try {
          resolvedItemId = resolveNumericId((item as any).id);
        } catch (err) {
          // If resolution fails, fall back to using a random id to avoid
          // crashing the UI — caller should ensure items come from the
          // catalog with numeric ids.
          console.error("Could not resolve numeric item id:", err);
          resolvedItemId = Number.NaN;
        }

        const signature = trimmedNote
          ? crypto.randomUUID()
          : `${resolvedItemId}|${resolvedOptionKey}|${finalFreeTopping ?? ""}|${finalToppingIds.slice().sort().join(",")}|${sugarVal ?? ""}|${spiceVal ?? ""}`;

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
            itemId: resolvedItemId,
            itemName: item.name,
            optionKey: resolvedOptionKey,
            optionLabel: resolvedOptionLabel,
            variantId: resolvedVariantId, // ← new field
            unitPriceGhs,
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

      cartCount: () => get().cart.reduce((sum, l) => sum + l.quantity, 0),
      cartTotal: () => calcCartTotal(get().cart),

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

      orders: [],

      placeOrder: async () => {
        console.log("=== PLACE ORDER STORE ===");
        const state = get();

        console.log("Current store state:", {
          cartLength: state.cart.length,
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          deliveryMethod: state.deliveryMethod,
          deliveryLocation: state.deliveryLocation,
        });

        if (state.cart.length === 0) {
          console.error("Cart is empty");
          throw new Error("Your cart is empty");
        }

        const locationText =
          state.deliveryLocation?.label?.trim() || state.deliveryAddress.trim();

        console.log("Location text for API:", locationText);
        console.log(
          "Cart items:",
          state.cart.map((item) => ({
            id: item.itemId,
            name: item.itemName,
            variant: item.variantId,
            quantity: item.quantity,
            toppings: item.toppingIds,
            freeTopping: item.freeToppingId,
          })),
        );

        try {
          console.log("Calling placeOrderApi...");
          // Call the real API — throws on failure
          const response = await placeOrderApi({
            phone: state.customerPhone,
            locationText,
            notes: state.deliveryLocation?.notes ?? state.deliveryNote,
            items: state.cart,
          });

          console.log("API Response received:", response);

          const subtotal = calcCartTotal(state.cart);
          const deliveryFee = state.deliveryMethod === "delivery" ? 10 : 0;

          const order: Order = {
            id: crypto.randomUUID(), // local reference
            apiOrderId: response.orderId, // real server ID
            items: [...state.cart],
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee,
            deliveryMethod: state.deliveryMethod,
            customerName: state.customerName,
            customerPhone: state.customerPhone,
            deliveryAddress: locationText,
            deliveryNote: state.deliveryLocation?.notes ?? state.deliveryNote,
            deliveryLocation: state.deliveryLocation,
            status: "pending",
            createdAt: new Date().toISOString(),
          };

          console.log("Order created:", order);

          set((s) => ({
            orders: [order, ...s.orders],
            cart: [],
            customerName: "",
            customerPhone: "",
            deliveryAddress: "",
            deliveryNote: "",
            deliveryMethod: "delivery",
            deliveryLocation: null,
          }));

          console.log("Store updated, cart cleared");
          return order;
        } catch (error) {
          console.error("Place order failed:", error);
          throw error;
        }
      },
    }),
    {
      name: "bb-cart-storage",
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
