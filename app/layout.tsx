import './globals.css';
import { GeistSans } from 'geist/font';
import { TopNav } from '@/components/TopNav';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { ChatPanel } from '@/components/ChatPanel';
import { Providers } from '@/components/Providers';
import React from 'react';
import { getConversationHistory } from '@/lib/serverCache';
import type { Message } from '@/lib/types';
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
  // Fetch initial chat history on the server.
  const conversationHistory = getConversationHistory();

  // Ensure data is serializable for the client (dates become strings).
  const initialMessages: Message[] = conversationHistory.map(message => {
    const createdAtDate = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;
    return {
      ...message,
      createdAt: createdAtDate.toISOString(),
    };
  });

  return (
    <html lang="en" className={`${GeistSans.className} bg-surface`} suppressHydrationWarning={true}>
      <body className="flex min-h-screen flex-col bg-surface">
        <Providers initialMessages={initialMessages}>
            <div className="flex flex-col h-screen text-white">
              <TopNav />
              <ChatPanel>
                {children}
              </ChatPanel>
              <DocumentUploadModal />
            </div>
        </Providers>
      </body>
    </html>
  );
}