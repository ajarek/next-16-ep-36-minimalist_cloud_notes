'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/providers/StoreProvider'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { EmptyState } from '@/components/notes/EmptyState'
import { slideInRight, smoothTransition } from '@/lib/motion'
import type { Note } from '@/types'

interface EditorPanelProps {
  notes: Note[]
}

export function EditorPanel({ notes }: EditorPanelProps) {
  const activeNoteId = useUIStore((s) => s.activeNoteId)
  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null

  return (
    <section className="editor-col">
      <AnimatePresence mode="wait">
        {activeNote ? (
          <motion.div
            key={activeNote.id}
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={smoothTransition}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <NoteEditor note={activeNote} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ height: '100%' }}
          >
            <EmptyState />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
