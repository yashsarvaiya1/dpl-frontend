// app/(dashboard)/teams/[id]/edit/page.tsx
interface Props { params: Promise<{ id: string }> }
import TeamEditPage from '@/components/teams/TeamEditPage'
export default async function Page({ params }: Props) {
  const { id } = await params
  return <TeamEditPage id={Number(id)} />
}
