import { ReportDetailClient } from "./report-detail-client";

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <ReportDetailClient reportId={reportId} />;
}
