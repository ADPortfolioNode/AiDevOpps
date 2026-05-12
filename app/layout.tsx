import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AiDevOpps',
  description: 'Vercel-only Node.js version of Concierge'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-gptw="" suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
