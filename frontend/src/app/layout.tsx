import type { Metadata } from 'next';
import './globals.css';
import { AtmosphereProvider } from '@/lib/atmosphere';

export const metadata: Metadata = {
  title: 'ONER — Environmental Command Center',
  description: 'Evidence Intelligence & Environmental Accountability Network. Turn community reports into verified industrial action.',
  keywords: ['environmental AI', 'evidence intelligence', 'carbon emissions', 'industrial monitoring', 'MRV'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen selection:bg-[#A8C83A]/20 selection:text-[#C4DF61]">
        <AtmosphereProvider>
          <div className="relative min-h-screen">
            {children}
          </div>
        </AtmosphereProvider>
      </body>
    </html>
  );
}
