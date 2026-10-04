import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ONER — Environmental AI Autopilot',
  description: 'AI-powered environmental intelligence and industrial control autopilot. Sense. Predict. Act.',
  keywords: ['environmental AI', 'carbon emissions', 'industrial monitoring', 'sustainability', 'autopilot'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d0b] text-[#f0f3f1] antialiased min-h-screen selection:bg-emerald-500/20 selection:text-emerald-300">
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
