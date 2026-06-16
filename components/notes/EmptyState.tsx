'use client'

import { motion } from 'framer-motion'
import { createNote } from '@/app/actions/notes'
import { useUIStore } from '@/providers/StoreProvider'
import { fadeUp, smoothTransition } from '@/lib/motion'
import { useTransition } from 'react'

const NotebookIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
    <line x1="8" y1="2" x2="8" y2="22"/>
    <line x1="16" y1="6" x2="16" y2="6"/>
    <line x1="16" y1="10" x2="16" y2="10"/>
    <line x1="16" y1="14" x2="16" y2="14"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

export function EmptyState() {
  const setActiveNoteId = useUIStore((s) => s.setActiveNoteId)
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      const note = await createNote()
      setActiveNoteId(note.id)
    })
  }

  return (
    <div className="empty-state">
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ ...smoothTransition, delay: 0.05 }}
        style={{
          width: 80, height: 80,
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          marginBottom: 8,
        }}
      >
        <NotebookIcon />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ ...smoothTransition, delay: 0.1 }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          No note selected
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--color-text-tertiary)', maxWidth: 240 }}>
          Choose a note from the list, or create a new one to get started.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ ...smoothTransition, delay: 0.15 }}
      >
        <button
          id="btn-empty-new-note"
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={isPending}
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          <PlusIcon />
          New Note
        </button>
      </motion.div>

      <motion.p
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ ...smoothTransition, delay: 0.2 }}
        style={{ margin: '12px 0 0', fontSize: '11.5px', color: 'var(--color-text-tertiary)' }}
      >
        Press <kbd style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '1px 5px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>⌘ N</kbd> to create a new note
      </motion.p>
    </div>
  )
}
