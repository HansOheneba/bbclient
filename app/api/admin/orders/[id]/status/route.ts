import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

const VALID_STATUSES = ["pending", "preparing", "ready", "delivered", "cancelled"];

/**
 * PATCH /api/admin/orders/[id]/status
 * Auth required. Body: { status: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await verifyAdminToken(request);
  } catch (res) {
    if (res instanceof Response) return res;
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { message: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }

    await pool.query(
      "UPDATE `Order` SET status = ?, updatedAt = NOW() WHERE id = ?",
      [status, Number(id)],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id]/status error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
