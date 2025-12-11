'use client';

import dynamic from 'next/dynamic';

const AnimationLoading = dynamic(() => import('@/components/animations/AnimationLoading'), {
    ssr: false,
});

interface LoadingPageProps {
    isOverlay?: boolean;
    size?: number;
}

const Z_INDEX_OVERLAY = 99999;

export default function LoadingPage({ isOverlay = false, size = 120 }: LoadingPageProps) {
    if (isOverlay) {
        return (
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-0 flex items-center justify-center p-4"
                style={{
                    zIndex: Z_INDEX_OVERLAY,
                }}
            >
                <AnimationLoading size={size} />
            </div>
        );
    }

    return (
        <div
            className="flex items-center justify-center min-h-screen text-center"
            style={{
                zIndex: Z_INDEX_OVERLAY,
            }}
        >
            <AnimationLoading size={size} />
        </div>
    );
}
