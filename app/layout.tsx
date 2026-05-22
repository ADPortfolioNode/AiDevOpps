import './globals.css';
import { GeistSans } from 'geist/font';
import { TopNav } from '@/components/TopNav';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { ChatPanel } from '@/components/ChatPanel';
import { Providers } from '@/components/Providers';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AiDevOps',
  description: 'AiDevOps - AI Operations Management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.className} bg-surface`} suppressHydrationWarning={true}>
      <body className="flex min-h-screen flex-col bg-surface">
        <Providers>
            <div className="flex flex-col h-screen text-white">
              <TopNav />
              <div className="flex flex-1 overflow-hidden">
                <DocumentUploadModal />
                <main className="flex-1 overflow-y-auto">{children}</main>
                <ChatPanel>{null}</ChatPanel>
              </div>
            </div>
        </Providers>
      </body>
    </html>
  );
}