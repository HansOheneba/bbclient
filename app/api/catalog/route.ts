import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

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
    const [catRows] = await pool.query<RowDataPacket[]>(
      "SELECT slug, name FROM Category ORDER BY sortOrder ASC",
    );

    // ── Products ──────────────────────────────
    let productQuery = `
      SELECT
        p.id, p.slug, p.name, p.description, p.image, p.inStock,
        p.priceInPesewas, p.categoryId,
        c.slug AS categorySlug
      FROM Product p
      JOIN Category c ON c.id = p.categoryId
      WHERE p.isActive = 1
    `;
    const productParams: unknown[] = [];

    if (categoryFilter) {
      productQuery += " AND c.slug = ?";
      productParams.push(categoryFilter);
    }

    productQuery += " ORDER BY p.sortOrder ASC";

    const [productRows] = await pool.query<RowDataPacket[]>(
      productQuery,
      productParams,
    );

    // ── Variants for those products ───────────
    const productIds = productRows.map((p) => p.id);
    let variantMap: Record<number, RowDataPacket[]> = {};

    if (productIds.length > 0) {
      const [variantRows] = await pool.query<RowDataPacket[]>(
        `SELECT id, productId, \`key\`, label, priceInPesewas
         FROM ProductVariant
         WHERE productId IN (${productIds.map(() => "?").join(",")})
         ORDER BY sortOrder ASC`,
        productIds,
      );

      for (const v of variantRows) {
        if (!variantMap[v.productId]) variantMap[v.productId] = [];
        variantMap[v.productId].push(v);
      }
    }

    // ── Toppings ──────────────────────────────
    const [toppingRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, priceInPesewas, inStock FROM Topping WHERE isActive = 1 ORDER BY sortOrder ASC",
    );

    // ── Build response ────────────────────────
    const items = productRows.map((p) => {
      const variants = variantMap[p.id] ?? [];
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.categorySlug,
        priceGhs: p.priceInPesewas != null ? p.priceInPesewas / 100 : null,
        options: variants.map((v) => ({
          id: v.id,
          key: v.key,
          label: v.label,
          priceGhs: v.priceInPesewas / 100,
        })),
        image: p.image,
        inStock: Boolean(p.inStock),
      };
    });

    return NextResponse.json({
      categories: catRows.map((c) => ({ slug: c.slug, name: c.name })),
      items,
      toppings: toppingRows.map((t) => ({
        id: t.id,
        name: t.name,
        priceGhs: t.priceInPesewas / 100,
        inStock: Boolean(t.inStock),
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
