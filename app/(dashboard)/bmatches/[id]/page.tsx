// app/(dashboard)/bmatches/[id]/page.tsx
interface Props { params: Promise<{ id: string }> }
import BMatchDetailPage from '@/components/bmatches/BMatchDetailPage'
export default async function Page({ params }: Props) {
  const { id } = await params
  return <BMatchDetailPage id={Number(id)} />
}
