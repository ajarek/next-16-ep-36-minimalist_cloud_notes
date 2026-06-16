'use client'

import { createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'
import { createUIStore, type UIStore, type UIStoreApi } from '@/lib/store'

const StoreContext = createContext<UIStoreApi | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<UIStoreApi>(undefined)
  if (!storeRef.current) {
    storeRef.current = createUIStore()
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
}

export function useUIStore<T>(selector: (state: UIStore) => T): T {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useUIStore must be used within StoreProvider')
  return useStore(store, selector)
}
