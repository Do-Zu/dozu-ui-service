'use client';

import dynamic from 'next/dynamic';

const AnimationLoading = dynamic(() => import('@/components/animations/AnimationLoading'), {
    ssr: false,
});

interface LoadingPageProps {
    isOverlay?: boolean;
    size?: number;
}

export default function LoadingPage({ isOverlay = false, size = 120 }: LoadingPageProps) {
    if (isOverlay) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-0 z-[100] flex items-center justify-center p-4">
                <AnimationLoading size={size} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen text-center">
            <AnimationLoading size={size} />
        </div>
    );
}
