'use client';

import dynamic from 'next/dynamic';

const AnimationLoading = dynamic(() => import('@/components/animations/AnimationLoading'), {
  ssr: false,
});

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <AnimationLoading size={120} />
    </div>
  );
}
