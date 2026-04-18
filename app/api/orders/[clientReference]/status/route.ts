import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/orders/[clientReference]/status
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientReference: string }> },
) {
  try {
    const { clientReference } = await params;

    const { data: order, error } = await supabase
      .from("orders")
      .select("status, payment_status, total_pesewas, created_at")
      .eq("client_reference", clientReference)
      .single();

    if (error || !order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: order.status,
      paymentStatus: order.payment_status,
      totalGhs: order.total_pesewas / 100,
      createdAt: order.created_at,
    });
  } catch (err) {
    console.error("GET /api/orders/[clientReference]/status error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
