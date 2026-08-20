import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}