import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/orders/callback
 *
 * Called by Hubtel after payment attempt. Always responds 200.
 * Body: { ClientReference, Status, Data: { ... } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the raw payload so we can inspect it in production if needed
    console.log("[Callback] Raw Hubtel payload:", JSON.stringify(body));

    // Hubtel sends:
    // { ResponseCode, Status, Data: { ClientReference, Status, Amount, … } }
    // ClientReference and the per-transaction Status live inside Data.
    const data = body?.Data ?? body?.data ?? {};
    const clientReference: string =
      data.ClientReference ?? data.clientReference ?? "";
    const rawStatus: string =
      data.Status ?? data.status ?? body?.Status ?? body?.status ?? "";

    if (!clientReference) {
      console.warn("[Callback] Missing ClientReference in payload:", body);
      return NextResponse.json({ received: true });
    }

    // Find the order
    const { data: order } = await supabase
      .from("orders")
      .select("id, phone")
      .eq("client_reference", clientReference)
      .single();

    if (!order) {
      console.warn(`[Callback] Unknown clientReference: ${clientReference}`);
      return NextResponse.json({ received: true });
    }

    const status = rawStatus.toLowerCase(); // "success" | "failed" | …

    console.log(
      `[Callback] order ${order.id} | clientRef ${clientReference} | status "${status}"`,
    );

    if (status === "success") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "preparing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
      console.log(`[Callback] Order ${order.id} marked as PAID / preparing`);

      // Send SMS (non-fatal)
      try {
        await sendOrderSms(order.phone);
      } catch (smsErr) {
        console.error("[Callback] SMS send failed (non-fatal):", smsErr);
      }
    } else if (status === "failed") {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
      console.log(`[Callback] Order ${order.id} marked as FAILED`);
    } else {
      console.warn(
        `[Callback] Unrecognised status "${status}" for order ${order.id}`,
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("POST /api/orders/callback error:", err);
    // Always return 200 for Hubtel callbacks
    return NextResponse.json({ received: true });
  }
}

// ── SMS helper ──────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  let p = phone.replace(/\s+/g, "");
  if (p.startsWith("0")) p = "233" + p.slice(1);
  if (!p.startsWith("233")) p = "233" + p;
  return p;
}

async function sendOrderSms(phone: string): Promise<void> {
  const clientId = process.env.HUBTEL_CLIENT_ID;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
  const senderId = process.env.HUBTEL_SENDER_ID;

  if (!clientId || !clientSecret || !senderId) {
    console.warn("Hubtel SMS credentials not configured, skipping SMS");
    return;
  }

  const to = normalizePhone(phone);
  const message =
    "Your Bubble Bliss order has been received and is being prepared! 🧋";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const params = new URLSearchParams({
    clientid: clientId,
    clientsecret: clientSecret,
    from: senderId,
    to,
    content: message,
    registeredDelivery: "true",
  });

  const res = await fetch(
    `https://smsc.hubtel.com/v1/messages/send?${params.toString()}`,
    {
      method: "GET",
      headers: { Authorization: `Basic ${auth}` },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`SMS API error ${res.status}: ${text}`);
  }
}
