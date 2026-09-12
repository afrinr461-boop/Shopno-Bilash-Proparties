import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { projectRepository } from "@/features/projects/repository";

/**
 * Admin API boundary — authenticated *and* permission-checked server-side.
 * Every /api/admin/* handler should follow this same
 * authenticate → authorize → act shape. "act" now goes through the
 * feature's repository (`src/lib/repository.ts`) rather than a hardcoded
 * array, so this route doesn't need to change again once a real database
 * backs `projectRepository`.
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!hasPermission(user.role, "project.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projects = await projectRepository.list();
  return NextResponse.json({ projects });
}
