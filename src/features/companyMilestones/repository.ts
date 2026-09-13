import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { CompanyMilestone } from "@/types/companyMilestone";

/** Admin-owned "Our Story" timeline entries, shown on the public About page. */
export const companyMilestoneRepository: Repository<CompanyMilestone> = createPrismaRepository<CompanyMilestone>("companyMilestone");

/** Chronological (oldest first) — the order the public timeline and the admin list both read entries in. */
export async function listMilestonesSorted(): Promise<CompanyMilestone[]> {
  const rows = await companyMilestoneRepository.list();
  return [...rows].sort((a, b) => a.year.localeCompare(b.year) || a.createdAt.localeCompare(b.createdAt));
}
