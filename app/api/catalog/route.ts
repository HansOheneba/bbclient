import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/catalog
 * Optional query: ?category=slug  — filter items to a single category
 *
 * Returns { categories, items, toppings }
 */
export async function GET(request: NextRequest) {
  try {
    const categoryFilter = request.nextUrl.searchParams.get("category");

    // ── Categories ────────────────────────────
    const { data: catRows, error: catError } = await supabase
      .from("categories")
      .select("slug, name")
      .order("sort_order", { ascending: true });
    if (catError) throw catError;

    // ── Products ──────────────────────────────
    let productQueryBuilder = supabase
      .from("products")
      .select(
        "id, slug, name, description, image, in_stock, price_in_pesewas, category_id, categories!inner(slug)",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (categoryFilter) {
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categoryFilter)
        .single();
      if (catData)
        productQueryBuilder = productQueryBuilder.eq("category_id", catData.id);
    }

    const { data: productRows, error: productError } =
      await productQueryBuilder;
    if (productError) throw productError;

    // ── Variants for those products ───────────
    const productIds = (productRows ?? []).map((p) => p.id);
    const variantMap: Record<number, any[]> = {};

    if (productIds.length > 0) {
      const { data: variantRows, error: variantError } = await supabase
        .from("product_variants")
        .select("id, product_id, key, label, price_in_pesewas")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });
      if (variantError) throw variantError;

      for (const v of variantRows ?? []) {
        if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
        variantMap[v.product_id].push(v);
      }
    }

    // ── Toppings ──────────────────────────────
    const { data: toppingRows, error: toppingError } = await supabase
      .from("toppings")
      .select("id, name, price_in_pesewas, in_stock")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (toppingError) throw toppingError;

    // ── Build response ────────────────────────
    const items = (productRows ?? []).map((p) => {
      const variants = variantMap[p.id] ?? [];
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: (p.categories as any)?.slug,
        priceGhs: p.price_in_pesewas != null ? p.price_in_pesewas / 100 : null,
        options: variants.map((v) => ({
          id: v.id,
          key: v.key,
          label: v.label,
          priceGhs: v.price_in_pesewas / 100,
        })),
        image: p.image,
        inStock: Boolean(p.in_stock),
      };
    });

    return NextResponse.json({
      categories: (catRows ?? []).map((c) => ({ slug: c.slug, name: c.name })),
      items,
      toppings: (toppingRows ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        priceGhs: t.price_in_pesewas / 100,
        inStock: Boolean(t.in_stock),
      })),
    });
  } catch (err) {
    console.error("GET /api/catalog error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
