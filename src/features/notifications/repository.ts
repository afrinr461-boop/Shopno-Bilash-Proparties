import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Notification } from "@/types/notification";
import type { NotificationPreference } from "@/types/notificationPreference";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Notification domain (`types/notification.ts` — already fully designed,
 * including in ARCHITECTURE.md §6's entity map, before this step touched
 * it). `NotificationProvider` (same file, the dispatch interface for
 * email/SMS/WhatsApp providers) is a future integration, not data, and
 * has no repository.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const notificationRepository: Repository<Notification> = createPrismaRepository<Notification>("notification");

/** Prompt 9 §13 — one row per user, see `types/notificationPreference.ts`'s doc comment. */
export const notificationPreferenceRepository: Repository<NotificationPreference> =
  createPrismaRepository<NotificationPreference>("notificationPreference");
