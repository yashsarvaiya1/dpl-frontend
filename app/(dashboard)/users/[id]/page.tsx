// app/(dashboard)/users/[id]/page.tsx

import UserDetailPage from "@/components/users/UserDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailPage id={Number(id)} />;
}
