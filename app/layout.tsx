import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Deep Research Multi-Agent System | Autonomous Synthesis',
  description:
    'An autonomous recursive multi-agent deep research intelligence engine that plans, queries, evaluates, and synthesizes exhaustive, citation-backed reports.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F5] text-[#57564C] antialiased selection:bg-[#ECBA82] selection:text-[#024F46]">
        {children}
      </body>
    </html>
  );
}
