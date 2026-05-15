import './globals.css';
import { GeistSans } from 'geist/font';
import { TopNav } from '../components/TopNav'; // Import the new TopNav Client Component
import { ChatPanel } from '../components/ChatPanel'; // Import the new ChatPanel Client Component
import type { Metadata } from 'next';
 erro
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Metadata can be defined directly in a Server Component
  const metadata: Metadata = {
    title: 'AiDevOpps Concierge',
    description: 'Vercel-only Node.js version of Concierge.',
  };

  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body
        className="flex min-h-screen flex-col bg-surface"
        // This is to prevent a hydration warning caused by browser extensions
        // like Grammarly injecting attributes into the body tag.
        // See: https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-hydration-warnings
        suppressHydrationWarning={true}
      >
        <TopNav />
        <ChatPanel>{children}</ChatPanel>
      </body>
    </html>
  );
}