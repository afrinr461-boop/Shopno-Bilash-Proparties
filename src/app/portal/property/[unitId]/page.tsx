import { PropertyDetailPage } from "@/components/portal/PropertyDetailPage";

export default async function CustomerPropertyDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <PropertyDetailPage base="/portal" unitId={unitId} />;
}
