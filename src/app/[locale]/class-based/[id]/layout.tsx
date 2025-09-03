'use client';

import { ClassBasedProvider } from '@/contexts/class-based';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ClassBasedProvider>{children}</ClassBasedProvider>;
}
