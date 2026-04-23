import { GroupDetailClient } from "./group-detail-client";

export const metadata = {
  title: "Group Detail | PassionDen",
  description: "View and manage your group",
};

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <GroupDetailClient groupId={groupId} />;
}
