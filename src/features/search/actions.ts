"use server";

import { getCurrentUser } from "@/lib/auth";
import { searchAdmin, type SearchResult } from "@/features/search";

export async function runAdminSearch(query: string): Promise<SearchResult[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return searchAdmin(user, query);
}
