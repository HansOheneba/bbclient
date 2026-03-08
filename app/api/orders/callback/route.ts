import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

/**
 * POST /api/orders/callback
 *
 * Called by Hubtel after payment attempt. Always responds 200.
 * Body: { ClientReference, Status, Data: { ... } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ClientReference, Status } = body;

    if (!ClientReference) {
      return NextResponse.json({ received: true });
    }

    // Find the order
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, phone FROM orders WHERE clientReference = ?",
      [ClientReference],
    );

    if (rows.length === 0) {
      console.warn(`Callback for unknown clientReference: ${ClientReference}`);
      return NextResponse.json({ received: true });
    }

    const order = rows[0];
    const status = String(Status).toLowerCase();

    if (status === "success") {
      await pool.query(
        "UPDATE orders SET paymentStatus = 'paid', status = 'preparing', updatedAt = NOW() WHERE id = ?",
        [order.id],
      );

      // Send SMS (non-fatal)
      try {
        await sendOrderSms(order.phone);
      } catch (smsErr) {
        console.error("SMS send failed (non-fatal):", smsErr);
      }
    } else if (status === "failed") {
      await pool.query(
        "UPDATE orders SET paymentStatus = 'failed', updatedAt = NOW() WHERE id = ?",
        [order.id],
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
