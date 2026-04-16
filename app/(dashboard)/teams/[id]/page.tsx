// app/(dashboard)/teams/[id]/page.tsx
interface Props { params: Promise<{ id: string }> }
import TeamDetailPage from '@/components/teams/TeamDetailPage'
export default async function Page({ params }: Props) {
  const { id } = await params
  return <TeamDetailPage id={Number(id)} />
}
