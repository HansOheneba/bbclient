import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * POST /api/admin/auth/login
 * Body: { email, password }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, passwordHash FROM AdminUser WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const accessToken = jwt.sign(
      { sub: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return NextResponse.json({ accessToken });
  } catch (err) {
    console.error("POST /api/admin/auth/login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
