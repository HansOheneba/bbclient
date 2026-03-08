import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * POST /api/orders/checkout
 *
 * Body: { phone, locationText, notes?, payeeName?, payeeEmail?, items: [...] }
 */
export async function POST(request: NextRequest) {
  const conn = await pool.getConnection();

  try {
    const body = await request.json();
    const { phone, locationText, notes, payeeName, payeeEmail, items } = body;

    // ── Validation ──────────────────────────
    if (!phone || typeof phone !== "string")
      return NextResponse.json(
        { message: "phone is required" },
        { status: 400 },
      );
    if (!locationText || typeof locationText !== "string")
      return NextResponse.json(
        { message: "locationText is required" },
        { status: 400 },
      );
    if (!Array.isArray(items) || items.length === 0)
      return NextResponse.json(
        { message: "items must be a non-empty array" },
        { status: 400 },
      );

    await conn.beginTransaction();

    let totalPesewas = 0;

    // Pre-validate every item and compute prices
    const resolvedItems: Array<{
      product: RowDataPacket;
      variant: RowDataPacket | null;
      unitPesewas: number;
      quantity: number;
      toppingsResolved: Array<{
        topping: RowDataPacket;
        priceApplied: number;
      }>;
      sugarLevel: string | null;
      spiceLevel: string | null;
      note: string | null;
    }> = [];

    for (const item of items) {
      const { productId, variantId, quantity, toppings, sugarLevel, spiceLevel, note } = item;

      if (!productId || !quantity || quantity < 1) {
        await conn.rollback();
        return NextResponse.json(
          { message: "Each item needs productId and quantity >= 1" },
          { status: 400 },
        );
      }

      // Fetch product
      const [prodRows] = await conn.query<RowDataPacket[]>(
        "SELECT * FROM Product WHERE id = ? AND isActive = 1 AND inStock = 1",
        [productId],
      );
      if (prodRows.length === 0) {
        await conn.rollback();
        return NextResponse.json(
          { message: `Product ${productId} not found, inactive, or out of stock` },
          { status: 400 },
        );
      }
      const product = prodRows[0];

      // Resolve variant
      let variant: RowDataPacket | null = null;
      let unitPesewas: number;

      if (variantId) {
        const [varRows] = await conn.query<RowDataPacket[]>(
          "SELECT * FROM ProductVariant WHERE id = ? AND productId = ?",
          [variantId, productId],
        );
        if (varRows.length === 0) {
          await conn.rollback();
          return NextResponse.json(
            { message: `Variant ${variantId} not found for product ${productId}` },
            { status: 400 },
          );
        }
        variant = varRows[0];
        unitPesewas = variant.priceInPesewas;
      } else {
        if (product.priceInPesewas == null) {
          await conn.rollback();
          return NextResponse.json(
            { message: `Product ${productId} requires a variant selection` },
            { status: 400 },
          );
        }
        unitPesewas = product.priceInPesewas;
      }

      // Resolve toppings
      const toppingsResolved: Array<{
        topping: RowDataPacket;
        priceApplied: number;
      }> = [];

      if (Array.isArray(toppings)) {
        for (let i = 0; i < toppings.length; i++) {
          const { toppingId } = toppings[i];
          const [topRows] = await conn.query<RowDataPacket[]>(
            "SELECT * FROM Topping WHERE id = ? AND isActive = 1 AND inStock = 1",
            [toppingId],
          );
          if (topRows.length === 0) {
            await conn.rollback();
            return NextResponse.json(
              { message: `Topping ${toppingId} not found, inactive, or out of stock` },
              { status: 400 },
            );
          }
          // First topping per item is free
          const priceApplied = i === 0 ? 0 : topRows[0].priceInPesewas;
          toppingsResolved.push({ topping: topRows[0], priceApplied });
        }
      }

      const toppingTotal = toppingsResolved.reduce((s, t) => s + t.priceApplied, 0);
      const itemTotal = (unitPesewas + toppingTotal) * quantity;
      totalPesewas += itemTotal;

      resolvedItems.push({
        product,
        variant,
        unitPesewas,
        quantity,
        toppingsResolved,
        sugarLevel: sugarLevel != null ? String(sugarLevel) : null,
        spiceLevel: spiceLevel != null ? String(spiceLevel) : null,
        note: note?.trim() || null,
      });
    }

    // ── Generate unique clientReference ─────
    const clientReference = crypto.randomUUID().replace(/-/g, "").slice(0, 32);

    // ── Create Order ────────────────────────
    const [orderResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO \`Order\` (phone, locationText, notes, status, paymentStatus, totalPesewas, clientReference, createdAt, updatedAt)
       VALUES (?, ?, ?, 'pending', 'unpaid', ?, ?, NOW(), NOW())`,
      [phone, locationText, notes?.trim() || null, totalPesewas, clientReference],
    );
    const orderId = orderResult.insertId;

    // ── Create OrderItems + OrderItemToppings ─
    for (const ri of resolvedItems) {
      const [itemResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO OrderItem (orderId, productId, variantId, productName, variantLabel, unitPesewas, quantity, sugarLevel, spiceLevel, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          ri.product.id,
          ri.variant?.id ?? null,
          ri.product.name,
          ri.variant?.label ?? null,
          ri.unitPesewas,
          ri.quantity,
          ri.sugarLevel,
          ri.spiceLevel,
          ri.note,
        ],
      );
      const orderItemId = itemResult.insertId;

      for (const tr of ri.toppingsResolved) {
        await conn.query(
          `INSERT INTO OrderItemTopping (orderItemId, toppingId, toppingName, toppingBasePesewas, priceAppliedPesewas)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderItemId,
            tr.topping.id,
            tr.topping.name,
            tr.topping.priceInPesewas,
            tr.priceApplied,
          ],
        );
      }
    }

    await conn.commit();

    // ── Hubtel Checkout ─────────────────────
    let checkoutUrl: string | undefined;
    let checkoutDirectUrl: string | undefined;

    try {
      const hubtelApiId = process.env.HUBTEL_API_ID;
      const hubtelApiKey = process.env.HUBTEL_API_KEY;
      const hubtelMerchant = process.env.HUBTEL_MERCHANT_ACCOUNT;

      if (hubtelApiId && hubtelApiKey && hubtelMerchant) {
        const auth = Buffer.from(`${hubtelApiId}:${hubtelApiKey}`).toString("base64");

        const hubtelRes = await fetch(
          "https://payproxyapi.hubtel.com/items/initiate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
              totalAmount: totalPesewas / 100,
              description: "Bubble Bliss Order",
              callbackUrl: process.env.HUBTEL_CALLBACK_URL,
              returnUrl: process.env.HUBTEL_RETURN_URL,
              cancellationUrl: process.env.HUBTEL_CANCEL_URL,
              merchantAccountNumber: hubtelMerchant,
              clientReference,
              ...(payeeName ? { payeeName } : {}),
              ...(payeeEmail ? { payeeEmail } : {}),
            }),
          },
        );

        const hubtelJson = await hubtelRes.json();

        if (hubtelJson.responseCode === "0000" && hubtelJson.data) {
          checkoutUrl = hubtelJson.data.checkoutUrl;
          checkoutDirectUrl = hubtelJson.data.checkoutDirectUrl;

          // Save hubtel checkout id
          await pool.query(
            "UPDATE `Order` SET hubtelCheckoutId = ? WHERE id = ?",
            [hubtelJson.data.checkoutId, orderId],
          );
        } else {
          console.warn("Hubtel checkout non-0000 response:", hubtelJson);
        }
      }
    } catch (hubtelErr) {
      console.error("Hubtel checkout error (non-fatal):", hubtelErr);
    }

    // ── Response ────────────────────────────
    return NextResponse.json({
      orderId,
      clientReference,
      status: "pending",
      totalGhs: totalPesewas / 100,
      totalPesewas,
      message: "Order placed successfully",
      ...(checkoutUrl ? { checkoutUrl } : {}),
      ...(checkoutDirectUrl ? { checkoutDirectUrl } : {}),
    });
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error("POST /api/orders/checkout error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}
