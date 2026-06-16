'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function createNote() {
  const note = await db.note.create({
    data: {
      title: 'Untitled',
      content: '',
    },
  })
  revalidatePath('/')
  return note
}

export async function updateNote(
  id: string,
  data: Partial<{ title: string; content: string; isFavorite: boolean }>
) {
  const note = await db.note.update({
    where: { id },
    data,
  })
  revalidatePath('/')
  return note
}

export async function deleteNote(id: string) {
  await db.note.update({
    where: { id },
    data: { isDeleted: true },
  })
  revalidatePath('/')
}

export async function restoreNote(id: string) {
  await db.note.update({
    where: { id },
    data: { isDeleted: false },
  })
  revalidatePath('/')
}

export async function permanentDeleteNote(id: string) {
  await db.note.delete({
    where: { id },
  })
  revalidatePath('/')
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  await db.note.update({
    where: { id },
    data: { isFavorite },
  })
  revalidatePath('/')
}
