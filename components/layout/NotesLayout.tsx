'use client'

import { useEffect, useCallback } from 'react'
import { createNote } from '@/app/actions/notes'
import { useUIStore } from '@/providers/StoreProvider'
import type { Note } from '@/types'

interface NotesLayoutProps {
  children: React.ReactNode
  notes: Note[]
}

export function NotesLayout({ children }: NotesLayoutProps) {
  const setActiveNoteId = useUIStore((s) => s.setActiveNoteId)

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey

      if (isCtrlOrCmd && e.key === 'n') {
        e.preventDefault()
        const note = await createNote()
        setActiveNoteId(note.id)
      }
    },
    [setActiveNoteId]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return <div className="notes-shell">{children}</div>
}
