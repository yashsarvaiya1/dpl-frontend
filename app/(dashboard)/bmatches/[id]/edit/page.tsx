// app/(dashboard)/bmatches/[id]/edit/page.tsx
interface Props { params: Promise<{ id: string }> }
import BMatchEditPage from '@/components/bmatches/BMatchEditPage'
export default async function Page({ params }: Props) {
  const { id } = await params
  return <BMatchEditPage id={Number(id)} />
}
