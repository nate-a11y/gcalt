import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sideline - Youth Sports Team Management',
  description: 'Bring everyone closer to the game. Live streaming, scorekeeping, scheduling, and team management for youth sports.',
  keywords: ['youth sports', 'team management', 'scorekeeping', 'live streaming', 'baseball', 'softball', 'basketball', 'soccer'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
