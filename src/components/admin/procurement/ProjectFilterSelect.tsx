"use client";

import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";

export function ProjectFilterSelect({ projects, value, basePath }: { projects: Project[]; value?: string; basePath: string }) {
  const router = useRouter();

  return (
    <select
      value={value ?? ""}
      onChange={(e) => router.push(`${basePath}?projectId=${e.target.value}`)}
      aria-label="Filter by project"
      className="text-body-sm h-10 rounded-md border border-border-strong bg-surface-raised px-3 text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft"
    >
      {!value && <option value="">Choose a project</option>}
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
