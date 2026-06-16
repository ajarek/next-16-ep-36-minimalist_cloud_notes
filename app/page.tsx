import { db } from '@/lib/db'
import { NotesLayout } from '@/components/layout/NotesLayout'
import { Sidebar } from '@/components/layout/Sidebar'
import { NotesList } from '@/components/layout/NotesList'
import { EditorPanel } from '@/components/layout/EditorPanel'
import type { Note } from '@/types'

export const dynamic = 'force-dynamic'

async function getNotes() {
  return (await db.note.findMany({
    orderBy: { updatedAt: 'desc' },
  })) as Note[]
}

export default async function Home() {
  const notes = await getNotes()
  
  const allCount = notes.filter((n: Note) => !n.isDeleted).length
  const favoritesCount = notes.filter((n: Note) => !n.isDeleted && n.isFavorite).length
  const trashCount = notes.filter((n: Note) => n.isDeleted).length

  return (
    <NotesLayout notes={notes}>
      <Sidebar 
        allCount={allCount} 
        favoritesCount={favoritesCount} 
        trashCount={trashCount} 
      />
      <NotesList notes={notes} />
      <EditorPanel notes={notes} />
    </NotesLayout>
  )
}
