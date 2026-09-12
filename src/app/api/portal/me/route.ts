import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * Authenticated-portal API boundary — every handler under /api/portal/*
 * must resolve the caller server-side and return 401 if there isn't one.
 * The frontend hiding a link is never sufficient (ARCHITECTURE.md §11).
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
