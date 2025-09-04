'use client';

import { MindMapProvider } from '../../context/MindMapContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <MindMapProvider>{children}</MindMapProvider>;
}
