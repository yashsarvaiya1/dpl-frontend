// app/(dashboard)/users/[id]/edit/page.tsx

import UserEditPage from "@/components/users/UserEditPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserEditPage id={Number(id)} />;
}
