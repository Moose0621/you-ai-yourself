import './globals.css'

export const metadata = {
  title: 'Phish Stats - Song Statistics & Analytics',
  description: 'Explore comprehensive statistics about Phish songs, performances, and tour data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
