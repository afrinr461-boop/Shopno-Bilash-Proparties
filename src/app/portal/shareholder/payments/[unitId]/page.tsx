import { PropertyPaymentsPage } from "@/components/portal/PropertyPaymentsPage";

export default async function ShareholderPropertyPaymentsPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <PropertyPaymentsPage base="/portal/shareholder" unitId={unitId} />;
}
