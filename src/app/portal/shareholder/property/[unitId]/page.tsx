import { PropertyDetailPage } from "@/components/portal/PropertyDetailPage";

export default async function ShareholderPropertyDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <PropertyDetailPage base="/portal/shareholder" unitId={unitId} />;
}
