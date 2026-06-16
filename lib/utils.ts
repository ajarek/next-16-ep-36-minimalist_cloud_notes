import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const d = new Date(date)

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfToday.getDate() - 1)
  const startOfLastWeek = new Date(startOfToday)
  startOfLastWeek.setDate(startOfToday.getDate() - 7)

  if (d >= startOfToday) return 'Today'
  if (d >= startOfYesterday) return 'Yesterday'
  if (d >= startOfLastWeek) return 'Last week'

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export function getPreview(content: string, maxLen = 100): string {
  const stripped = stripHtml(content)
  if (stripped.length <= maxLen) return stripped
  return stripped.slice(0, maxLen).trimEnd() + '…'
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function groupNotesByDate<T extends { updatedAt: Date }>(
  notes: T[]
): { label: string; items: T[] }[] {
  const groups: Record<string, T[]> = {}

  for (const note of notes) {
    const label = formatRelativeDate(note.updatedAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(note)
  }

  const order = ['Today', 'Yesterday', 'Last week']
  const sorted = [...order.filter((l) => groups[l]), ...Object.keys(groups).filter((l) => !order.includes(l))]

  return sorted.map((label) => ({ label, items: groups[label] }))
}
