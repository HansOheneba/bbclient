/**
 * lib/api.ts  ← UPDATED with comprehensive logging
 */

import type { CartLine } from "@/lib/menu-data";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Enable debug logging
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) {
    console.log("[API]", ...args);
  }
}

function logError(...args: any[]) {
  console.error("[API ERROR]", ...args);
}

// ── Response shapes ──────────────────────────────────────────────────────────

export interface PlaceOrderResponse {
  orderId: number;
  status: string;
  totalGhs: number;
  totalPesewas: number;
  message: string;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function apiUrl(path: string) {
  const url = `${BASE_URL}${path}`;
  log(`Constructed URL: ${url} (from BASE_URL: "${BASE_URL}")`);
  return url;
}

async function handleResponse<T>(res: Response): Promise<T> {
  log(`Response status: ${res.status} ${res.statusText}`);
  log(`Response headers:`, Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    let body: ApiError | null = null;
    let bodyText = "";

    try {
      bodyText = await res.text();
      log(`Error response body:`, bodyText);
      body = JSON.parse(bodyText);
    } catch {
      log(`Could not parse error response as JSON`);
    }

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
 * Maps the Zustand cart lines into the shape expected by CheckoutDto and
 * sends a POST /orders/checkout request.
 */
export async function placeOrderApi(
  payload: PlaceOrderPayload,
): Promise<PlaceOrderResponse> {
  log(`=== PLACE ORDER API CALL ===`);
  log(`Payload received:`, {
    phone: payload.phone,
    locationText: payload.locationText,
    notes: payload.notes,
    itemCount: payload.items.length,
  });

  payload.items.forEach((item, index) => {
    log(`Item ${index + 1}:`, {
      itemId: item.itemId,
      itemName: item.itemName,
      variantId: item.variantId,
      quantity: item.quantity,
      freeToppingId: item.freeToppingId,
      toppingIds: item.toppingIds,
      sugarLevel: item.sugarLevel,
      spiceLevel: item.spiceLevel,
      note: item.note,
    });
  });

  // Transform payload to match DTO
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

      if (hasVariant) {
        itemBody.variantId = line.variantId;
      }

      if (line.sugarLevel !== null && line.sugarLevel !== undefined) {
        itemBody.sugarLevel = String(line.sugarLevel);
      }

      if (line.spiceLevel !== null && line.spiceLevel !== undefined) {
        itemBody.spiceLevel = String(line.spiceLevel);
      }

      if (line.note?.trim()) {
        itemBody.note = line.note.trim();
      }

      return itemBody;
    }),
  };

  log(`Transformed request body:`, JSON.stringify(body, null, 2));

  const url = apiUrl("/orders/checkout");
  log(`Sending POST request to: ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body), // ← this was missing
      mode: "cors",
      credentials: "omit",
    });

    log(`Fetch completed, processing response...`);
    return handleResponse<PlaceOrderResponse>(res);
  } catch (error) {
    logError(`Fetch failed:`, error);

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      if (!BASE_URL) {
        throw new Error(
          "API URL is not configured. Check NEXT_PUBLIC_API_URL in .env.local",
        );
      }

      throw new Error(
        `Cannot connect to backend at ${BASE_URL}. ` +
          `Make sure the server is running and CORS is enabled. ` +
          `If developing locally, your backend should be on a different port (e.g., http://localhost:3001)`,
      );
    }

    throw error;
  }
}
