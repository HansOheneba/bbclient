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
import { placeOrderApi, type CheckoutResponse } from "@/lib/api";

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
  apiOrderId: number | null;
  clientReference: string | null; // ← Hubtel reference for status polling
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
   * Calls POST /orders/checkout. On success returns the CheckoutResponse
   * (including checkoutDirectUrl) but does NOT clear the cart yet —
   * the cart is cleared only after payment is confirmed.
   */
  placeOrder: () => Promise<CheckoutResponse>;

  /**
   * Called after payment is confirmed (polling returns "paid").
   * Saves order to history and clears the cart.
   */
  confirmOrder: (response: CheckoutResponse) => void;
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
          resolvedVariantId = option.id;
        }

        const trimmedNote = note.trim();

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
            variantId: resolvedVariantId,
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
        const state = get();

        if (state.cart.length === 0) throw new Error("Your cart is empty");

        const locationText =
          state.deliveryLocation?.label?.trim() || state.deliveryAddress.trim();

        const response = await placeOrderApi({
          phone: state.customerPhone,
          locationText,
          notes: state.deliveryLocation?.notes ?? state.deliveryNote,
          items: state.cart,
        });

        // Don't clear cart yet — wait for payment confirmation
        return response;
      },

      confirmOrder: (response: CheckoutResponse) => {
        const state = get();
        const subtotal = calcCartTotal(state.cart);
        const deliveryFee = 0;
        const locationText =
          state.deliveryLocation?.label?.trim() || state.deliveryAddress.trim();

        const order: Order = {
          id: crypto.randomUUID(),
          apiOrderId: response.orderId,
          clientReference: response.clientReference,
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
          status: "confirmed",
          createdAt: new Date().toISOString(),
        };

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
