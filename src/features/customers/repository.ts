import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Customer } from "@/types/customer";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Customer domain (`types/customer.ts`). Deliberately separate from
 * `features/users/repository.ts` — a Customer is a business record, an
 * account in `userRepository` is a portal login; `Customer.userId` /
 * `User.linkedCustomerId` are the (optional) link between the two (Admin
 * Step 7 §2), not a merge of the two concepts.
 *
 * No public route or API should ever serve records from this repository —
 * customer data is private business data (Admin Step 7 §14).
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const customerRepository: Repository<Customer> = createPrismaRepository<Customer>("customer");
