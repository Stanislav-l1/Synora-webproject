'use client';

import { useState } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-navbar lg:pl-sidebar min-h-screen">
        {children}
      </main>
    </>
  );
}
