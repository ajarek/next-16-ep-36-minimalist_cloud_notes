'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, smoothTransition } from '@/lib/motion'
import { getPreview, formatTime } from '@/lib/utils'
import { toggleFavorite, deleteNote, restoreNote, permanentDeleteNote } from '@/app/actions/notes'
import { useUIStore } from '@/providers/StoreProvider'
import type { Note } from '@/types'

interface NoteCardProps {
  note: Note
  isActive: boolean
  isTrash: boolean
  onClick: () => void
}

const StarFilledIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
)

interface ContextMenu {
  x: number
  y: number
}

export function NoteCard({ note, isActive, isTrash, onClick }: NoteCardProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [favoriting, setFavoriting] = useState(false)
  const setActiveNoteId = useUIStore((s) => s.setActiveNoteId)
  const cardRef = useRef<HTMLDivElement>(null)

  const preview = getPreview(note.content, 90)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const closeMenu = useCallback(() => setContextMenu(null), [])

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      setFavoriting(true)
      await toggleFavorite(note.id, !note.isFavorite)
      setFavoriting(false)
    },
    [note.id, note.isFavorite]
  )

  const handleDelete = useCallback(async () => {
    closeMenu()
    setActiveNoteId(null)
    await deleteNote(note.id)
  }, [note.id, closeMenu, setActiveNoteId])

  const handleRestore = useCallback(async () => {
    closeMenu()
    await restoreNote(note.id)
  }, [note.id, closeMenu])

  const handlePermanentDelete = useCallback(async () => {
    closeMenu()
    setActiveNoteId(null)
    await permanentDeleteNote(note.id)
  }, [note.id, closeMenu, setActiveNoteId])

  return (
    <>
      <motion.div
        ref={cardRef}
        variants={fadeUp}
        transition={smoothTransition}
        className={`note-card ${isActive ? 'active' : ''}`}
        onClick={onClick}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        aria-label={`Note: ${note.title}`}
        aria-selected={isActive}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div className="note-card-title" style={{ flex: 1 }}>
            {note.title || 'Untitled'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {!isTrash && (
              <button
                className={`btn-icon ${note.isFavorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                disabled={favoriting}
                aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {note.isFavorite ? <StarFilledIcon /> : <StarIcon />}
              </button>
            )}
            <button
              className="btn-icon"
              onClick={(e) => { e.stopPropagation(); handleContextMenu(e) }}
              aria-label="Note options"
            >
              <MoreIcon />
            </button>
          </div>
        </div>

        {preview && (
          <div className="note-card-preview">{preview}</div>
        )}

        <div className="note-card-meta">
          <span>{formatTime(new Date(note.updatedAt))}</span>
          {note.isFavorite && !isTrash && (
            <span style={{ color: 'var(--color-warning)', fontSize: 10 }}>★</span>
          )}
        </div>
      </motion.div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={closeMenu}
            onContextMenu={(e) => { e.preventDefault(); closeMenu() }}
          />
          <motion.div
            className="context-menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {isTrash ? (
              <>
                <button className="context-item" onClick={handleRestore}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Restore
                </button>
                <button className="context-item danger" onClick={handlePermanentDelete}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6"/></svg>
                  Delete forever
                </button>
              </>
            ) : (
              <>
                <button className="context-item" onClick={handleToggleFavorite}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={note.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  {note.isFavorite ? 'Remove favorite' : 'Add to favorites'}
                </button>
                <button className="context-item danger" onClick={handleDelete}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6"/></svg>
                  Move to trash
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </>
  )
}
