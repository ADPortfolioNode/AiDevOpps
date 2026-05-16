import './globals.css';
import { GeistSans } from 'geist/font';
import { TopNav } from '../components/TopNav'; // Import the new TopNav Client Component
import { ChatPanel } from '../components/ChatPanel'; // Import the new ChatPanel Client Component
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
        className="flex h-screen flex-col bg-surface overflow-hidden"
        // This is to prevent a hydration warning caused by browser extensions
        // like Grammarly injecting attributes into the body tag.
        // See: https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-hydration-warnings
        suppressHydrationWarning={true}
      >
        <TopNav />
        <ChatPanel className="flex-1">{children}</ChatPanel>
      </body>
    </html>
  );
}