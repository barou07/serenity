import type { Metadata, Viewport } from 'next'
import { DM_Sans, Lora } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })

export const metadata: Metadata = {
  title: 'Serenity - Mindful Chat',
  description: 'A calm, emotionally supportive chat companion that helps you explore and understand your feelings through guided conversations and an interactive emotion wheel.',
}

export const viewport: Viewport = {
  themeColor: '#e8e4f0',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${lora.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
