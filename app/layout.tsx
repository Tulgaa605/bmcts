import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEBO 2018',
  description: 'Нягтлан бодох бүртгэлийн систем',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="min-h-dvh overflow-x-hidden bg-slate-100 text-gray-800 antialiased">{children}</body>
    </html>
  );
}