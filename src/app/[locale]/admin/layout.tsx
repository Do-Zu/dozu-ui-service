'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/providers/theme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="w-64 border-r hidden md:block" />

        <div className="flex flex-1 flex-col">
          <Topbar />
          <Separator />
          <ScrollArea className="flex-1 p-6">
            {children}
          </ScrollArea>
        </div>
      </div>
    </ThemeProvider>
  );
}
