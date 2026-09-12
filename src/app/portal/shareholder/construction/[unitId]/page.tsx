import { ConstructionDetailPage } from "@/components/portal/ConstructionDetailPage";

export default async function ShareholderConstructionDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <ConstructionDetailPage base="/portal/shareholder" unitId={unitId} />;
}
