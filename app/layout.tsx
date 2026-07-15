import type { Metadata, Viewport } from 'next';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Linkraa — Premium Media Preview & Save Manager',
  description: 'Paste, preview, and save publicly accessible media links or direct files locally with smooth glassmorphic UI and real-time downloads.',
  keywords: ['media downloader', 'link manager', 'mp4 preview', 'mp3 downloader', 'video saver'],
  authors: [{ name: 'Linkraa Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
