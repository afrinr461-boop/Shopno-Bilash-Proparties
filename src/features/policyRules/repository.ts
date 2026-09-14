import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { PolicyRule } from "@/types/policyRule";

/** Admin-owned "Company Policy" rules, shown on the public /policy page. */
export const policyRuleRepository: Repository<PolicyRule> = createPrismaRepository<PolicyRule>("policyRule");

/** Creation order (oldest first) — the order both the admin list and the public page read entries in, same reasoning as `listMilestonesSorted`. */
export async function listPolicyRulesOrdered(): Promise<PolicyRule[]> {
  const rows = await policyRuleRepository.list();
  return [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
