import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folder = searchParams.get('folder') ?? 'all'

  const where =
    folder === 'trash'
      ? { isDeleted: true }
      : folder === 'favorites'
        ? { isDeleted: false, isFavorite: true }
        : { isDeleted: false }

  const notes = await db.note.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  return Response.json(notes)
}
