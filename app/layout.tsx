import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppContextProvider } from '@/lib/context/AppContextProvider'
import { Navbar } from '../Projektordning/projektordning-git/app/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Projektordning - Projekthanteringsverktyg',
  description: 'Ett kraftfullt verktyg för att hantera kyltekniska installationsprojekt',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <AppContextProvider>
          <div className="flex min-h-screen">
            {children}
          </div>
        </AppContextProvider>
      </body>
    </html>
  )
}
