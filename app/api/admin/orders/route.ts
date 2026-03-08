import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

/**
 * GET /api/admin/orders
 * Auth required. Returns all orders with items and toppings.
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdminToken(request);
  } catch (res) {
    if (res instanceof Response) return res;
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch orders
    const [orders] = await pool.query<RowDataPacket[]>(
      `SELECT id, phone, locationText, notes, status, paymentStatus,
              totalPesewas, clientReference, hubtelCheckoutId, createdAt, updatedAt
       FROM \`Order\`
       ORDER BY createdAt DESC`,
    );

    if (orders.length === 0) {
      return NextResponse.json([]);
    }

    const orderIds = orders.map((o) => o.id);

    // Fetch items for all orders
    const [items] = await pool.query<RowDataPacket[]>(
      `SELECT id, orderId, productId, variantId, productName, variantLabel,
              unitPesewas, quantity, sugarLevel, spiceLevel, note
       FROM OrderItem
       WHERE orderId IN (${orderIds.map(() => "?").join(",")})`,
      orderIds,
    );

    // Fetch toppings for all items
    const itemIds = items.map((i) => i.id);
    let toppingsMap: Record<number, RowDataPacket[]> = {};

    if (itemIds.length > 0) {
      const [toppings] = await pool.query<RowDataPacket[]>(
        `SELECT id, orderItemId, toppingId, toppingName, toppingBasePesewas, priceAppliedPesewas
         FROM OrderItemTopping
         WHERE orderItemId IN (${itemIds.map(() => "?").join(",")})`,
        itemIds,
      );

      for (const t of toppings) {
        if (!toppingsMap[t.orderItemId]) toppingsMap[t.orderItemId] = [];
        toppingsMap[t.orderItemId].push(t);
      }
    }

    // Build item map per order
    const itemsMap: Record<number, RowDataPacket[]> = {};
    for (const item of items) {
      if (!itemsMap[item.orderId]) itemsMap[item.orderId] = [];
      itemsMap[item.orderId].push(item);
    }

    // Assemble response
    const result = orders.map((o) => ({
      ...o,
      totalGhs: o.totalPesewas / 100,
      items: (itemsMap[o.id] ?? []).map((item) => ({
        ...item,
        unitGhs: item.unitPesewas / 100,
        toppings: (toppingsMap[item.id] ?? []).map((t) => ({
          ...t,
          toppingBaseGhs: t.toppingBasePesewas / 100,
          priceAppliedGhs: t.priceAppliedPesewas / 100,
        })),
      })),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/admin/orders error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
