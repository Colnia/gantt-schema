import type { Metadata } from 'next'
import './globals.css'
import { AppContextProvider } from '@/lib/context/AppContextProvider'

export const metadata: Metadata = {
  title: 'Gantt Schema App',
  description: 'Modern Gantt Chart Application',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </body>
    </html>
  )
}
