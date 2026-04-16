// app/(dashboard)/matches/[id]/page.tsx
interface Props { params: Promise<{ id: string }> }
import MatchDetailPage from '@/components/matches/MatchDetailPage'
export default async function Page({ params }: Props) {
  const { id } = await params
  return <MatchDetailPage id={Number(id)} />
}
