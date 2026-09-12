import { ConstructionDetailPage } from "@/components/portal/ConstructionDetailPage";

export default async function LandownerConstructionDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <ConstructionDetailPage base="/portal/landowner" unitId={unitId} />;
}
