'use client';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'transparent' }}>
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
