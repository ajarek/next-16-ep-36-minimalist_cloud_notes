import { createStore } from 'zustand/vanilla'
import type { Folder } from '@/types'

export interface UIState {
  activeNoteId: string | null
  activeFolder: Folder
  searchQuery: string
}

export interface UIActions {
  setActiveNoteId: (id: string | null) => void
  setActiveFolder: (folder: Folder) => void
  setSearchQuery: (query: string) => void
}

export type UIStore = UIState & UIActions

export const defaultState: UIState = {
  activeNoteId: null,
  activeFolder: 'all',
  searchQuery: '',
}

export const createUIStore = () =>
  createStore<UIStore>()((set) => ({
    ...defaultState,
    setActiveNoteId: (id) => set({ activeNoteId: id }),
    setActiveFolder: (folder) => set({ activeFolder: folder, activeNoteId: null, searchQuery: '' }),
    setSearchQuery: (query) => set({ searchQuery: query }),
  }))

export type UIStoreApi = ReturnType<typeof createUIStore>
