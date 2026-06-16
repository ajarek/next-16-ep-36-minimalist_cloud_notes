# Minimalist Cloud Notes App — Implementation Plan

A full-stack, desktop-first notes app with a three-column layout, inspired by Apple Notes + Notion. Built on Next.js 16 App Router, Tailwind CSS v4, Zustand, Framer Motion, and Prisma + Neon PostgreSQL.

---

## User Review Required

> [!IMPORTANT]
> **Database**: The plan uses **Neon PostgreSQL** (via the MCP server already connected) + Prisma. A free project will be provisioned automatically. No local Postgres setup is required.

> [!IMPORTANT]
> **shadcn/ui**: shadcn/ui uses its own CLI and requires a `components.json` config. It also needs a Tailwind v4-compatible setup. The plan installs it via `npx shadcn@latest init` and uses only the primitives required (ScrollArea, Dialog, Tooltip). All aesthetic decisions are custom — shadcn provides headless primitives only.

> [!IMPORTANT]
> **MVP scope (no auth)**: The spec lists `userId` on the `Note` model. For MVP, all notes belong to a single anonymous session (no sign-in). Auth can be layered in later via NextAuth / Neon Auth.

> [!WARNING]
> **TipTap**: TipTap rich-text editor is **PRO** scope. The MVP uses a styled `contenteditable` `<div>` + `innerHTML` for content, which is fully functional and autosaving. TipTap can be added incrementally.

---

## Open Questions

> [!NOTE]
> No blocking questions — the spec is detailed enough to proceed. The decisions above are based on the spec's own priorities. Approve to begin.

---

## Proposed Changes

### Phase 1 — Dependencies

Install all missing packages in one pass:

```
zustand framer-motion @prisma/client prisma
```

shadcn/ui initialized separately via CLI (requires interactive setup).

---

### Phase 2 — Database (Neon + Prisma)

#### [NEW] `prisma/schema.prisma`

```prisma
model Note {
  id          String   @id @default(cuid())
  title       String   @default("Untitled")
  content     String   @default("")
  isFavorite  Boolean  @default(false)
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### [NEW] `lib/db.ts`

Singleton Prisma client (avoids hot-reload connection storms in dev).

---

### Phase 3 — Server Layer

#### [NEW] `app/actions/notes.ts` — Server Actions (`'use server'`)

- `createNote()` → inserts, revalidates `/`
- `updateNote(id, data)` → patches title/content/isFavorite, revalidates `/`
- `deleteNote(id)` → soft-deletes (sets `isDeleted = true`), revalidates `/`
- `restoreNote(id)` → clears `isDeleted`, revalidates `/`
- `permanentDeleteNote(id)` → hard delete, revalidates `/`

#### [NEW] `app/api/notes/route.ts` — Route Handler

`GET /api/notes` — returns all non-deleted notes (for future SWR / optimistic use).

---

### Phase 4 — Global State (Zustand)

#### [NEW] `lib/store.ts`

```ts
interface UIStore {
  activeNoteId: string | null
  activeFolder: 'all' | 'favorites' | 'trash'
  searchQuery: string
  // setters...
}
```

Client-only store (no SSR hydration needed — state is ephemeral UI).

#### [NEW] `providers/StoreProvider.tsx`

Thin `'use client'` wrapper that mounts the Zustand store into the React tree via context (pattern required for RSC + Client interop).

---

### Phase 5 — Layout & Components

#### [MODIFY] `app/globals.css`

Full design system with:
- Dark-mode first color palette (zinc/slate with warm accents)
- Inter font via Google Fonts
- Custom CSS variables for all design tokens
- Scrollbar styling, selection color, prose styles
- `@theme` block extending Tailwind v4 tokens

#### [MODIFY] `app/layout.tsx`

- Add Inter font
- Wrap children in `StoreProvider`
- Update metadata (title, description, OG)
- Set `<html>` to `dark` class for dark-mode-first

#### [MODIFY] `app/page.tsx`

Server Component — fetches all notes from DB, renders the three-column shell.

```
<NotesLayout>
  <Sidebar />           ← sticky, 220px
  <NotesList notes />   ← scrollable, 300px
  <EditorPanel note />  ← flex-1
</NotesLayout>
```

---

#### [NEW] `components/layout/NotesLayout.tsx` — `'use client'`

Three-column flex container. Handles column resize hints and keyboard shortcuts (`Cmd+N` → new note, `Cmd+K` → focus search).

#### [NEW] `components/layout/Sidebar.tsx` — `'use client'`

- App logo + name at top
- Navigation items: All Notes, Favorites, Trash (with counts)
- Bottom: user avatar placeholder
- Active folder highlighted with accent
- Zustand `activeFolder` setter on click
- Framer Motion `layoutId` for sliding active pill

#### [NEW] `components/layout/NotesList.tsx` — `'use client'`

- Receives `notes[]` as props (server-fetched)
- Filters by `activeFolder` and `searchQuery` (client-side)
- Groups by: Today / Yesterday / Last week / Older
- `AnimatePresence` + `motion.div` for list transitions
- Active note highlighted
- "New Note" button at top → calls `createNote()` Server Action

#### [NEW] `components/layout/EditorPanel.tsx` — `'use client'`

- Shows `EmptyState` when no note selected
- Renders `NoteEditor` when note is active
- `motion.div` slide-in animation on note switch

---

#### [NEW] `components/notes/NoteCard.tsx` — `'use client'`

Single note card in the list:
- Title (truncated)
- Content preview (first 80 chars, stripped HTML)
- Relative timestamp
- Favorite star icon (toggle)
- Right-click / long-press context menu (Delete, Favorite)
- Hover: subtle scale + bg transition
- `motion.div` with `initial/animate/exit`

#### [NEW] `components/notes/NoteEditor.tsx` — `'use client'`

- Editable title (`<h1>` with `contenteditable`)
- Body (`<div contenteditable>` with prose styles)
- Autosave via `useEffect` debounce (800ms)
- Toolbar: Bold, Italic, Bullet List, Image (MVP stubs)
- Word count + last saved indicator in footer
- `useTransition` + Server Action for save

#### [NEW] `components/notes/EmptyState.tsx`

- Animated SVG illustration
- "Select a note or create a new one" text
- "New Note" CTA button
- `motion.div` fade-in

---

#### [NEW] `lib/utils.ts`

- `cn()` — class name merging (clsx + twMerge)
- `formatRelativeDate()` — Today / Yesterday / date string
- `stripHtml()` — content preview helper
- `debounce()` — for autosave

#### [NEW] `lib/motion.ts`

Shared animation variants:
```ts
export const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }
export const slideIn = { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 } }
export const springTransition = { type: "spring", stiffness: 300, damping: 30 }
```

---

### Phase 6 — Types

#### [NEW] `types/index.ts`

```ts
export interface Note {
  id: string
  title: string
  content: string
  isFavorite: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## File Structure (Final)

```
app/
├── layout.tsx              ← MODIFY — Inter font, StoreProvider, metadata
├── page.tsx                ← MODIFY — server fetch + three-column render
├── globals.css             ← MODIFY — full design system
├── actions/
│   └── notes.ts            ← NEW — Server Actions
├── api/
│   └── notes/route.ts      ← NEW — Route Handler
components/
├── layout/
│   ├── NotesLayout.tsx     ← NEW
│   ├── Sidebar.tsx         ← NEW
│   ├── NotesList.tsx       ← NEW
│   └── EditorPanel.tsx     ← NEW
├── notes/
│   ├── NoteCard.tsx        ← NEW
│   ├── NoteEditor.tsx      ← NEW
│   └── EmptyState.tsx      ← NEW
providers/
│   └── StoreProvider.tsx   ← NEW
lib/
├── db.ts                   ← NEW — Prisma singleton
├── store.ts                ← NEW — Zustand store
├── motion.ts               ← NEW — animation variants
└── utils.ts                ← NEW — helpers
prisma/
│   └── schema.prisma       ← NEW
types/
│   └── index.ts            ← NEW
```

---

## Verification Plan

### Automated
- `npm run build` — TypeScript compilation + Next.js build

### Manual
1. App loads → three-column layout visible
2. Sidebar folder switching → NotesList filters correctly
3. Clicking a note → EditorPanel slides in
4. Editing title/content → autosave after 800ms (footer shows "Saved")
5. New Note button → optimistic card appears in list
6. Favorite toggle → note moves to Favorites folder
7. Delete → note moves to Trash folder
8. Search query → NotesList filters in real-time
9. Keyboard: `Cmd/Ctrl+N` → creates new note
