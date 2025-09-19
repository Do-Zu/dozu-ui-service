import { ReactNode } from 'react';

export default function FeynmanLayout({ children }: { children: ReactNode }) {
    return <div className="container mx-auto px-4 py-6 lg:py-8">{children}</div>;
}
