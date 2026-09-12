import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** The Settings tab literally is the existing edit form — redirect rather than duplicate it. */
export default async function ProjectSettingsPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/projects/${id}/edit`);
}
