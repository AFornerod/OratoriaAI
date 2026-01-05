


// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OratoriaAI - Mejora tu Oratoria con IA',
  description: 'Plataforma de coaching de oratoria potenciada por inteligencia artificial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
      </body>
    </html>
  );
}