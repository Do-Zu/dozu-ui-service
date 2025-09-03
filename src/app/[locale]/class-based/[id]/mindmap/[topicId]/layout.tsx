'use client';

import { MindMapProvider } from '@/app/[locale]/mindmap/context/MindMapContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <MindMapProvider>{children}</MindMapProvider>;
}
