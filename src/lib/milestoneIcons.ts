import { Building2, KeyRound, Handshake, TrendingUp, Award, Expand, Flag, type LucideIcon } from "lucide-react";
import type { MilestoneIconKey } from "@/types/companyMilestone";

/** One place mapping a `CompanyMilestone.icon` key to its lucide symbol + label — shared by the admin form's picker and the public timeline's display, so the two can never drift apart. */
export const MILESTONE_ICON_MAP: Record<MilestoneIconKey, { icon: LucideIcon; label: string }> = {
  founded: { icon: Building2, label: "Founded" },
  handover: { icon: KeyRound, label: "Handover" },
  partnership: { icon: Handshake, label: "Partnership" },
  growth: { icon: TrendingUp, label: "Growth" },
  award: { icon: Award, label: "Award / Recognition" },
  expansion: { icon: Expand, label: "Expansion" },
  milestone: { icon: Flag, label: "General Milestone" },
};
