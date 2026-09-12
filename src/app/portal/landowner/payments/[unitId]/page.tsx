import { PropertyPaymentsPage } from "@/components/portal/PropertyPaymentsPage";

export default async function LandownerPropertyPaymentsPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <PropertyPaymentsPage base="/portal/landowner" unitId={unitId} />;
}
