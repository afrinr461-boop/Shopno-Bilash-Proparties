import type { DocumentOwnerType } from "@/types/document";
import type { ID } from "@/types/common";
import { projectRepository } from "@/features/projects/repository";
import { unitRepository } from "@/features/units/repository";
import { customerRepository } from "@/features/customers/repository";
import { shareholderRepository } from "@/features/shareholders/repository";
import { landownerRepository } from "@/features/landowners/repository";
import { vendorRepository } from "@/features/procurement/repository";
import { constructionActivityLogRepository } from "@/features/construction/repository";

export interface ResolvedDocumentOwner {
  label: string;
  href?: string;
}

/**
 * Resolves a Document's polymorphic `ownerType`/`ownerId` to a display
 * label and (where the admin has a page for that owner) a link.
 * Company/Transaction have no repository to resolve against and fall back
 * to their raw id, same honest "no fabricated name" pattern used for
 * Unit's `buildingId`/`floorId` in Admin Step 6.
 */
export async function resolveDocumentOwner(ownerType: DocumentOwnerType, ownerId: ID): Promise<ResolvedDocumentOwner> {
  switch (ownerType) {
    case "project": {
      const project = await projectRepository.findById(ownerId);
      return project ? { label: project.name, href: `/admin/projects/${project.id}` } : { label: ownerId };
    }
    case "unit": {
      const unit = await unitRepository.findById(ownerId);
      return unit ? { label: unit.unitNumber, href: `/admin/properties/${unit.id}` } : { label: ownerId };
    }
    case "customer": {
      const customer = await customerRepository.findById(ownerId);
      return customer ? { label: customer.name, href: `/admin/customers/${customer.id}` } : { label: ownerId };
    }
    case "shareholder": {
      const shareholder = await shareholderRepository.findById(ownerId);
      return shareholder ? { label: shareholder.name, href: `/admin/shareholders/${shareholder.id}` } : { label: ownerId };
    }
    case "landowner": {
      const landowner = await landownerRepository.findById(ownerId);
      return landowner ? { label: landowner.name, href: `/admin/landowners/${landowner.id}` } : { label: ownerId };
    }
    case "vendor": {
      const vendor = await vendorRepository.findById(ownerId);
      return vendor ? { label: vendor.name, href: `/admin/procurement/${vendor.id}` } : { label: ownerId };
    }
    case "constructionActivity": {
      const entry = await constructionActivityLogRepository.findById(ownerId);
      return entry ? { label: `${entry.date} — ${entry.activity}` } : { label: ownerId };
    }
    default:
      return { label: ownerId };
  }
}
