import './globals.css';
import { GeistSans } from 'geist/font';
import { TopNav } from '@/components/TopNav';
import { ChatPanel } from '@/components/ChatPanel';
import { ModelProvider } from '@/lib/modelContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AiDevOpps',
  description: 'AiDevOpps - AI Operations Management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body
        className="flex min-h-screen flex-col bg-surface"
        // This is to prevent a hydration warning caused by browser extensions
        // like Grammarly injecting attributes into the body tag.
        // See: https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-hydration-warnings
        suppressHydrationWarning={true}
      >
        <ModelProvider>
          <TopNav />
          <ChatPanel className="flex-1">{children}</ChatPanel>
        </ModelProvider>
      </body>
    </html>
  );
}