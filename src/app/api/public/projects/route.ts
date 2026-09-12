import { NextResponse } from "next/server";

/**
 * Public API boundary — no authentication required, must never return
 * anything beyond `DataVisibility: "public"` fields (see src/types/project.ts,
 * src/types/common.ts). Placeholder only: not wired to a database yet.
 */
export async function GET() {
  return NextResponse.json({ projects: [] });
}
