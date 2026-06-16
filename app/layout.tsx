import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/providers/StoreProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CloudNotes — Your thoughts, beautifully organized',
  description: 'A minimalist, desktop-first notes application with real-time sync, smart folders, and a beautiful three-column layout.',
  keywords: ['notes', 'cloud notes', 'markdown', 'productivity'],
  openGraph: {
    title: 'CloudNotes',
    description: 'Your thoughts, beautifully organized.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} style={{ colorScheme: 'dark' }}>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
