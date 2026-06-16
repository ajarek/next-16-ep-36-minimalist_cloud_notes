'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { updateNote, toggleFavorite } from '@/app/actions/notes'
import { debounce } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import type { Note } from '@/types'

interface NoteEditorProps {
  note: Note
}

const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  </svg>
)

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
  </svg>
)

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)

export function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isPending, startTransition] = useTransition()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    if (titleRef.current) titleRef.current.innerText = note.title
    if (contentRef.current) contentRef.current.innerHTML = note.content
  }, [note.id, note.title, note.content])

  // Autosave
  const debouncedSave = useCallback(
    debounce((id: string, data: { title: string; content: string }) => {
      startTransition(async () => {
        await updateNote(id, data)
        setLastSaved(new Date())
      })
    }, 800),
    []
  )

  const handleTitleChange = () => {
    const newTitle = titleRef.current?.innerText || ''
    setTitle(newTitle)
    debouncedSave(note.id, { title: newTitle, content })
  }

  const handleContentChange = () => {
    const newContent = contentRef.current?.innerHTML || ''
    setContent(newContent)
    debouncedSave(note.id, { title, content: newContent })
  }

  const execCommand = (command: string) => {
    document.execCommand(command, false)
    handleContentChange()
  }

  const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button className="btn-icon" onClick={() => execCommand('bold')} title="Bold">
          <BoldIcon />
        </button>
        <button className="btn-icon" onClick={() => execCommand('italic')} title="Italic">
          <ItalicIcon />
        </button>
        <button className="btn-icon" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
          <ListIcon />
        </button>
        
        <div className="toolbar-divider" />
        
        <button 
          className={`btn-icon ${note.isFavorite ? 'active' : ''}`} 
          onClick={() => toggleFavorite(note.id, !note.isFavorite)}
          title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <StarIcon filled={note.isFavorite} />
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isPending && <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Saving...</div>}
          {!isPending && lastSaved && (
            <div className="status-saved">
              <div className="status-dot" />
              Saved at {formatTime(lastSaved)}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            ref={titleRef}
            className="note-title-editor"
            contentEditable
            onInput={handleTitleChange}
            onBlur={handleTitleChange}
            suppressContentEditableWarning
            data-placeholder="Untitled"
          />
          
          <div style={{ height: '24px' }} />

          <div
            ref={contentRef}
            className="prose-editor"
            contentEditable
            onInput={handleContentChange}
            onBlur={handleContentChange}
            suppressContentEditableWarning
            data-placeholder="Start writing..."
            style={{ minHeight: '300px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--color-border-soft)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
        <div>{wordCount} {wordCount === 1 ? 'word' : 'words'}</div>
        <div>Last updated {new Date(note.updatedAt).toLocaleDateString()}</div>
      </div>
    </div>
  )
}
