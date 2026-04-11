import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-provider'

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'TDS Photography | Quotation Generator',
  description: 'Generate professional photography quotations for TDS Photography',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jost.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
