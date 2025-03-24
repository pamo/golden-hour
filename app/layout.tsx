import '@/app/globals.css';

import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import type React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Golden Hour Checker',
  description: 'Check the quality of golden hour for photography',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
