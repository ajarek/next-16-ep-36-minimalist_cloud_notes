'use client'

import { motion } from 'framer-motion'
import { useUIStore } from '@/providers/StoreProvider'
import { springTransition } from '@/lib/motion'
import type { Folder } from '@/types'

interface NavItem {
  id: Folder
  label: string
  icon: React.ReactNode
  count: number
}

interface SidebarProps {
  allCount: number
  favoritesCount: number
  trashCount: number
}

const NoteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
)

const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
  </svg>
)

const CloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
)

export function Sidebar({ allCount, favoritesCount, trashCount }: SidebarProps) {
  const activeFolder = useUIStore((s) => s.activeFolder)
  const setActiveFolder = useUIStore((s) => s.setActiveFolder)

  const navItems: NavItem[] = [
    { id: 'all', label: 'All Notes', icon: <NoteIcon />, count: allCount },
    { id: 'favorites', label: 'Favorites', icon: <StarIcon />, count: favoritesCount },
    { id: 'trash', label: 'Trash', icon: <TrashIcon />, count: trashCount },
  ]

  return (
    <aside className="sidebar-col">
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--color-border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--color-brand-500), oklch(72% 0.20 280))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            <CloudIcon />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>CloudNotes</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Personal workspace</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '12px 8px', flex: 1, overflow: 'auto' }}>
        <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', padding: '0 8px 8px' }}>
          Library
        </div>
        {navItems.map((item) => (
          <div key={item.id} style={{ position: 'relative', marginBottom: '2px' }}>
            {activeFolder === item.id && (
              <motion.div
                layoutId="nav-active-bg"
                transition={springTransition}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'oklch(62% 0.18 250 / 15%)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            )}
            <button
              id={`sidebar-${item.id}`}
              className={`nav-item ${activeFolder === item.id ? 'active' : ''}`}
              onClick={() => setActiveFolder(item.id)}
              style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count > 0 && (
                <span className="count">{item.count}</span>
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border-soft)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, var(--color-surface-4), var(--color-surface-3))',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)',
          flexShrink: 0,
        }}>
          U
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Local user
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {allCount} {allCount === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </div>
    </aside>
  )
}
