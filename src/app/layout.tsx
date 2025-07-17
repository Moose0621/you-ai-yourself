// import { Inter } from 'next/font/google'
import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Phish Stats - Song Statistics & Analytics',
  description: 'Explore comprehensive statistics about Phish songs, performances, and tour data',
  keywords: 'Phish, statistics, songs, jam band, analytics, tour data',
  authors: [{ name: 'Phish Stats Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Phish Stats'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Phish Stats" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
