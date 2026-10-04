'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  onRefresh,
  isRefreshing,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#090c0a] text-[#f4f6f4]">
      {/* ── Fixed Sidebar ───────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content Area ───────────────────────────────── */}
      <div className="ml-64 flex-1 min-h-screen flex flex-col min-w-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
