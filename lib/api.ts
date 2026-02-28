import type { CartLine } from "@/lib/menu-data";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log("[API]", ...args);
}
function logError(...args: any[]) {
  console.error("[API ERROR]", ...args);
}

// ── Response shapes ──────────────────────────────────────────────────────────

export interface CheckoutResponse {
  orderId: number;
  clientReference: string;
  totalGhs: number;
  totalPesewas: number;
  checkoutUrl: string;
  checkoutDirectUrl: string;
  message: string;
}

export interface OrderStatusResponse {
  orderId: number;
  status: string;
  paymentStatus: string;
  totalGhs: number;
  createdAt: string;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function apiUrl(path: string) {
  return `${BASE_URL}${path}`;
}

async function handleResponse<T>(res: Response): Promise<T> {
  log(`Response status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    let body: ApiError | null = null;
    let bodyText = "";
    try {
      bodyText = await res.text();
      body = JSON.parse(bodyText);
    } catch {}

    const msg = Array.isArray(body?.message)
      ? body!.message.join(", ")
      : (body?.message ?? bodyText ?? `Request failed (${res.status})`);

    logError(`Request failed: ${msg}`);
    throw new Error(msg);
  }

  const data = await res.json();
  log(`Success response:`, data);
  return data as T;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  phone: string;
  locationText: string;
  notes?: string;
  items: CartLine[];
}

/**
 * Initiates checkout — returns Hubtel checkout URLs + clientReference.
 * No order is confirmed until payment completes via callback.
 */
export async function placeOrderApi(
  payload: PlaceOrderPayload,
): Promise<CheckoutResponse> {
  log(`=== PLACE ORDER API CALL ===`);

  const body = {
    phone: payload.phone,
    locationText: payload.locationText,
    ...(payload.notes?.trim() ? { notes: payload.notes.trim() } : {}),
    items: payload.items.map((line) => {
      const hasVariant =
        line.variantId !== undefined && line.variantId !== null;

      const itemBody: any = {
        productId: line.itemId,
        quantity: line.quantity,
        toppings: [
          ...(line.freeToppingId !== null && line.freeToppingId !== undefined
            ? [{ toppingId: line.freeToppingId }]
            : []),
          ...line.toppingIds.map((id) => ({ toppingId: id })),
        ],
      };

      if (hasVariant) itemBody.variantId = line.variantId;
      if (line.sugarLevel !== null && line.sugarLevel !== undefined)
        itemBody.sugarLevel = String(line.sugarLevel);
      if (line.spiceLevel !== null && line.spiceLevel !== undefined)
        itemBody.spiceLevel = String(line.spiceLevel);
      if (line.note?.trim()) itemBody.note = line.note.trim();

      return itemBody;
    }),
  };

  log(`Request body:`, JSON.stringify(body, null, 2));

  try {
    const res = await fetch(apiUrl("/orders/checkout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      mode: "cors",
      credentials: "omit",
    });
    return handleResponse<CheckoutResponse>(res);
  } catch (error) {
    logError(`Fetch failed:`, error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        !BASE_URL
          ? "API URL is not configured. Check NEXT_PUBLIC_API_URL in .env.local"
          : `Cannot connect to backend at ${BASE_URL}.`,
      );
    }
    throw error;
  }
}

/**
 * Polls the order status by clientReference.
 * Frontend calls this every few seconds after the payment iframe opens.
 */
export async function getOrderStatusApi(
  clientReference: string,
): Promise<OrderStatusResponse> {
  const res = await fetch(apiUrl(`/orders/${clientReference}/status`), {
    method: "GET",
    headers: { Accept: "application/json" },
    mode: "cors",
    credentials: "omit",
  });
  return handleResponse<OrderStatusResponse>(res);
}
