import "server-only";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  sub: number;
  email: string;
}

/**
 * Verify the Bearer token from the Authorization header.
 * Returns the admin user row or throws a Response-ready error.
 */
export async function verifyAdminToken(
  request: NextRequest,
): Promise<{ id: number; email: string }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authHeader.slice(7);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
  } catch {
    throw new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, email FROM AdminUser WHERE id = ?",
    [payload.sub],
  );

  if (rows.length === 0) {
    throw new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { id: rows[0].id, email: rows[0].email };
}
