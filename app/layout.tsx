import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OratoriaAI - Mejora tu Oratoria con IA',
  description: 'Tu coach personal con Inteligencia Artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}