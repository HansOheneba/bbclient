import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

/**
 * GET /api/orders/[clientReference]/status
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientReference: string }> },
) {
  try {
    const { clientReference } = await params;

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT status, paymentStatus, totalPesewas, createdAt FROM `Order` WHERE clientReference = ?",
      [clientReference],
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const order = rows[0];

    return NextResponse.json({
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalGhs: order.totalPesewas / 100,
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error("GET /api/orders/[clientReference]/status error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
