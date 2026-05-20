import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reachr — Sponsoring CRM',
  description: 'Track your brand deals, get paid faster.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
