import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

/**
 * PATCH /api/admin/products/[id]/stock
 * Auth required. Body: { inStock: boolean }
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
    const { inStock } = await request.json();

    if (typeof inStock !== "boolean") {
      return NextResponse.json(
        { message: "inStock must be a boolean" },
        { status: 400 },
      );
    }

    await pool.query("UPDATE Product SET inStock = ? WHERE id = ?", [
      inStock ? 1 : 0,
      Number(id),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/products/[id]/stock error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
