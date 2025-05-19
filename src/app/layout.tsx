
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from "@/components/ui/toaster"


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TharwaLiv - Livestock Management',
  description: 'Efficiently manage your livestock with TharwaLiv.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DataProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </DataProvider>
        <Toaster />
      </body>
    </html>
  );
}
