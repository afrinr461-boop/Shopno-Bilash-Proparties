import { PropertyDetailPage } from "@/components/portal/PropertyDetailPage";

export default async function LandownerPropertyDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <PropertyDetailPage base="/portal/landowner" unitId={unitId} />;
}
