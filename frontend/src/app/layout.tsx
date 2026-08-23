import type { Metadata } from 'next'
import './globals.css'
import LivingBackground from '@/components/LivingBackground'
import HolographicClouds from '@/components/HolographicClouds'

export const metadata: Metadata = {
  title: 'ONER — Environmental AI Autopilot',
  description: 'ONER is an AI-powered environmental intelligence and autopilot platform for industrial facilities. Sense. Predict. Act.',
  keywords: ['environmental AI', 'carbon emissions', 'industrial monitoring', 'sustainability'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-oner-bg text-oner-text antialiased">
        {/* Holographic Clouds — z-index: 1, mounts once */}
        <HolographicClouds />
        {/* Living background — mounts once, persists across all routes (z-index: 2) */}
        <LivingBackground />
        {/* Application — z-index: 10 sits above canvas (z-index: 2) */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
