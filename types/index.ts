export interface Note {
  id: string
  title: string
  content: string
  isFavorite: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export type Folder = 'all' | 'favorites' | 'trash'
