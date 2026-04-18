import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

/**
 * POST /api/orders/checkout
 *
 * Body: { phone, locationText, notes?, payeeName?, payeeEmail?, items: [...] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, locationText, notes, payeeName, payeeEmail, items } = body;

    // ── Validation ──────────────────────────
    if (!phone || typeof phone !== "string")
      return NextResponse.json(
        { message: "phone is required" },
        { status: 400 },
      );

    // Strip spaces/dashes then accept: 0XXXXXXXXX (10 digits) or 233XXXXXXXXX (12 digits)
    const normalizedPhone = String(phone).replace(/[\s\-]/g, "");
    if (!/^(0\d{9}|233\d{9})$/.test(normalizedPhone))
      return NextResponse.json(
        {
          message:
            "Please enter a valid Ghanaian phone number (e.g. 0244123456)",
        },
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

    let totalPesewas = 0;

    type ResolvedItem = {
      product: any;
      variant: any | null;
      unitPesewas: number;
      quantity: number;
      toppingsResolved: Array<{ topping: any; priceApplied: number }>;
      sugarLevel: string | null;
      spiceLevel: string | null;
      note: string | null;
    };

    const resolvedItems: ResolvedItem[] = [];

    // ── Validate & price every item ─────────
    for (const item of items) {
      const {
        productId,
        variantId,
        quantity,
        toppings,
        sugarLevel,
        spiceLevel,
        note,
      } = item;

      if (!productId || !quantity || quantity < 1)
        return NextResponse.json(
          { message: "Each item needs productId and quantity >= 1" },
          { status: 400 },
        );

      // Fetch product (server-side price lookup — never trust client prices)
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .eq("in_stock", true)
        .single();

      if (!product)
        return NextResponse.json(
          {
            message: `Product ${productId} not found, inactive, or out of stock`,
          },
          { status: 400 },
        );

      let variant: any = null;
      let unitPesewas: number;

      if (variantId) {
        const { data: variantData } = await supabase
          .from("product_variants")
          .select("*")
          .eq("id", variantId)
          .eq("product_id", productId)
          .single();

        if (!variantData)
          return NextResponse.json(
            {
              message: `Variant ${variantId} not found for product ${productId}`,
            },
            { status: 400 },
          );

        variant = variantData;
        unitPesewas = variant.price_in_pesewas;
      } else {
        if (product.price_in_pesewas == null)
          return NextResponse.json(
            { message: `Product ${productId} requires a variant selection` },
            { status: 400 },
          );
        unitPesewas = product.price_in_pesewas;
      }

      // Resolve toppings (first one per item is free)
      const toppingsResolved: Array<{ topping: any; priceApplied: number }> =
        [];

      if (Array.isArray(toppings)) {
        for (let i = 0; i < toppings.length; i++) {
          const { toppingId } = toppings[i];
          const { data: toppingData } = await supabase
            .from("toppings")
            .select("*")
            .eq("id", toppingId)
            .eq("is_active", true)
            .eq("in_stock", true)
            .single();

          if (!toppingData)
            return NextResponse.json(
              {
                message: `Topping ${toppingId} not found, inactive, or out of stock`,
              },
              { status: 400 },
            );

          const priceApplied = i === 0 ? 0 : toppingData.price_in_pesewas;
          toppingsResolved.push({ topping: toppingData, priceApplied });
        }
      }

      const toppingTotal = toppingsResolved.reduce(
        (s, t) => s + t.priceApplied,
        0,
      );
      totalPesewas += (unitPesewas + toppingTotal) * quantity;

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
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        phone: normalizedPhone,
        customer_name: payeeName?.trim() || null,
        location_text: locationText,
        notes: notes?.trim() || null,
        status: "pending",
        payment_status: "unpaid",
        total_pesewas: totalPesewas,
        client_reference: clientReference,
      })
      .select("id")
      .single();

    if (orderError) throw orderError;
    const orderId = orderData.id;

    // ── Create OrderItems + OrderItemToppings ─
    for (const ri of resolvedItems) {
      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderId,
          product_id: ri.product.id,
          variant_id: ri.variant?.id ?? null,
          product_name: ri.product.name,
          variant_label: ri.variant?.label ?? null,
          unit_pesewas: ri.unitPesewas,
          quantity: ri.quantity,
          sugar_level: ri.sugarLevel,
          spice_level: ri.spiceLevel,
          note: ri.note,
        })
        .select("id")
        .single();

      if (itemError) throw itemError;
      const orderItemId = itemData.id;

      for (const tr of ri.toppingsResolved) {
        const { error: toppingInsertError } = await supabase
          .from("order_item_toppings")
          .insert({
            order_item_id: orderItemId,
            topping_id: tr.topping.id,
            topping_name: tr.topping.name,
            topping_base_pesewas: tr.topping.price_in_pesewas,
            price_applied_pesewas: tr.priceApplied,
          });

        if (toppingInsertError) throw toppingInsertError;
      }
    }

    // ── Derive base URL from request ─────────
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (request.url.startsWith("https") ? "https" : "http");
    const host = request.headers.get("host") ?? "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

    const callbackUrl =
      process.env.HUBTEL_CALLBACK_URL ?? `${baseUrl}/api/orders/callback`;
    const returnUrl = `${baseUrl}/payment/success?ref=${clientReference}`;
    const cancelUrl = `${baseUrl}/payment/cancelled?ref=${clientReference}`;

    // ── Hubtel Checkout ─────────────────────
    let checkoutUrl: string | undefined;
    let checkoutDirectUrl: string | undefined;

    try {
      const hubtelApiId = process.env.HUBTEL_API_ID;
      const hubtelApiKey = process.env.HUBTEL_API_KEY;
      const hubtelMerchant = process.env.HUBTEL_MERCHANT_ACCOUNT;

      if (hubtelApiId && hubtelApiKey && hubtelMerchant) {
        const auth = Buffer.from(`${hubtelApiId}:${hubtelApiKey}`).toString(
          "base64",
        );

        const hubtelPayload = {
          totalAmount: totalPesewas / 100,
          description: "Bubble Bliss Order",
          callbackUrl,
          returnUrl,
          cancellationUrl: cancelUrl,
          merchantAccountNumber: hubtelMerchant,
          clientReference,
          ...(payeeName ? { payeeName } : {}),
          ...(payeeEmail ? { payeeEmail } : {}),
        };

        console.log(
          "[Hubtel] Initiating checkout for",
          clientReference,
          "| callbackUrl:",
          callbackUrl,
          "| returnUrl:",
          returnUrl,
        );

        const hubtelRes = await fetch(
          "https://payproxyapi.hubtel.com/items/initiate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify(hubtelPayload),
          },
        );

        const hubtelJson = await hubtelRes.json();
        console.log("[Hubtel] Response:", JSON.stringify(hubtelJson));

        if (hubtelJson.responseCode === "0000" && hubtelJson.data) {
          checkoutUrl = hubtelJson.data.checkoutUrl;
          checkoutDirectUrl = hubtelJson.data.checkoutDirectUrl;

          await supabase
            .from("orders")
            .update({ hubtel_checkout_id: hubtelJson.data.checkoutId })
            .eq("id", orderId);
        } else {
          console.warn("[Hubtel] Non-0000 response:", hubtelJson);
        }
      } else {
        console.warn(
          "[Hubtel] Missing credentials — HUBTEL_API_ID / HUBTEL_API_KEY / HUBTEL_MERCHANT_ACCOUNT",
        );
      }
    } catch (hubtelErr) {
      console.error("[Hubtel] Checkout error (non-fatal):", hubtelErr);
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
    console.error("POST /api/orders/checkout error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
