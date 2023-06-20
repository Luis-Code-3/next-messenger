import './globals.css'
import { Inter } from 'next/font/google'
import AuthContext from './context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Next Messenger',
  description: 'User messenger app created by Next JS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {




  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext>
         {children}
        </AuthContext>
      </body>
    </html>
  )
}
