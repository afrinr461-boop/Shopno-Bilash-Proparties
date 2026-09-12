import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { GalleryItem } from "@/content/gallery";

/**
 * CMS Step — Gallery, same shape and pattern as `features/news/repository.ts`
 * (the reference CMS domain): the public-facing `GalleryItem` type from
 * `content/gallery.ts` is the entity itself, backed by the real database.
 */
export const galleryRepository: Repository<GalleryItem> = createPrismaRepository<GalleryItem>("galleryImage");
