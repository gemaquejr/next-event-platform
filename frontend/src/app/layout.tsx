import type { Metadata } from 'next';

import { AuthProvider } from '@/contexts/AuthContext';

import './globals.css';

export const metadata: Metadata = {
  title: 'Event Platform',
  description:
    'Encontre eventos, faça reservas e gerencie seus ingressos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
