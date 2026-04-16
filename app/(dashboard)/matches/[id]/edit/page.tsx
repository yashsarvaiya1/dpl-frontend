// app/(dashboard)/matches/[id]/edit/page.tsx
interface Props { params: Promise<{ id: string }> }
import MatchEditPage from '@/components/matches/MatchEditPage'
export default async function Page({ params }: Props) {
  const { id } = await params
  return <MatchEditPage id={Number(id)} />
}
