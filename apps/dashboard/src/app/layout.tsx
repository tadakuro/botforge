import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BotForge',
  description: 'Personal Discord Bot Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
