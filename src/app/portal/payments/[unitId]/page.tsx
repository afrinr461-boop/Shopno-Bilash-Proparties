import { PropertyPaymentsPage } from "@/components/portal/PropertyPaymentsPage";

export default async function CustomerPropertyPaymentsPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <PropertyPaymentsPage base="/portal" unitId={unitId} />;
}
