'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/providers/StoreProvider'
import { createNote } from '@/app/actions/notes'
import { NoteCard } from '@/components/notes/NoteCard'
import { groupNotesByDate } from '@/lib/utils'
import { fadeUp, staggerContainer, smoothTransition } from '@/lib/motion'
import type { Note } from '@/types'

interface NotesListProps {
  notes: Note[]
}

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export function NotesList({ notes }: NotesListProps) {
  const activeFolder = useUIStore((s) => s.activeFolder)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const setActiveNoteId = useUIStore((s) => s.setActiveNoteId)
  const activeNoteId = useUIStore((s) => s.activeNoteId)

  const [isPending, startTransition] = useTransition()
  const searchRef = useRef<HTMLInputElement>(null)

  // Filter by folder + search
  const filtered = notes.filter((n) => {
    if (activeFolder === 'trash') return n.isDeleted
    if (activeFolder === 'favorites') return !n.isDeleted && n.isFavorite
    return !n.isDeleted
  }).filter((n) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    )
  })

  const groups = groupNotesByDate(filtered)

  // Keyboard shortcut: Cmd+F or / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleNewNote = useCallback(() => {
    startTransition(async () => {
      const note = await createNote()
      setActiveNoteId(note.id)
    })
  }, [setActiveNoteId])

  const label = activeFolder === 'all' ? 'All Notes' : activeFolder === 'favorites' ? 'Favorites' : 'Trash'

  return (
    <section className="list-col">
      {/* Header */}
      <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid var(--color-border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {label}
          </h2>
          {activeFolder !== 'trash' && (
            <button
              id="btn-new-note"
              className="btn btn-primary"
              onClick={handleNewNote}
              disabled={isPending}
              style={{ padding: '6px 10px', fontSize: '12px', gap: '4px', opacity: isPending ? 0.6 : 1 }}
            >
              <PlusIcon />
              New
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <SearchIcon />
          <input
            ref={searchRef}
            id="search-input"
            className="search-input"
            type="text"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notes"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 2, borderRadius: 4, display: 'flex' }}
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.length === 0 ? (
          <motion.div
            key="empty"
            {...fadeUp}
            transition={smoothTransition}
            style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}
          >
            {searchQuery ? `No notes match "${searchQuery}"` : `No notes in ${label.toLowerCase()}`}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeFolder}-${searchQuery}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {groups.map(({ label: groupLabel, items }) => (
                <div key={groupLabel}>
                  <div className="group-label">{groupLabel}</div>
                  {items.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isActive={activeNoteId === note.id}
                      isTrash={activeFolder === 'trash'}
                      onClick={() => setActiveNoteId(note.id)}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer count */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border-soft)', fontSize: '11px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
        {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
      </div>
    </section>
  )
}
