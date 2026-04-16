// app/(dashboard)/rooms/[id]/page.tsx
interface Props { params: Promise<{ id: string }> }
import RoomDetailPage from '@/components/rooms/RoomDetailPage'
export default async function Page({ params }: Props) {
  const { id } = await params
  return <RoomDetailPage id={Number(id)} />
}
