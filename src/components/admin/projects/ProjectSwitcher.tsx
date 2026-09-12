"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Project } from "@/types/project";

export interface ProjectSwitcherProps {
  projects: Project[];
  currentId: string;
}

/** Plain native select, matching `ProjectFilterSelect`'s established style — preserves the current tab when switching (e.g. staying on "Construction" for the newly chosen project). */
export function ProjectSwitcher({ projects, currentId }: ProjectSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newId: string) {
    if (newId === currentId) return;
    const marker = `/admin/projects/${currentId}`;
    const rest = pathname.startsWith(marker) ? pathname.slice(marker.length) : "";
    router.push(`/admin/projects/${newId}${rest}`);
  }

  if (projects.length <= 1) return null;

  return (
    <select
      value={currentId}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Switch project"
      className="text-body-sm h-9 rounded-md border border-border-strong bg-surface-raised px-3 text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft"
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
