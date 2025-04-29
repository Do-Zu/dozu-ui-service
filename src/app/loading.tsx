'use client';

import AnimationLoading from '@/components/animations/AnimationLoading';

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <AnimationLoading size={120} />
    </div>
  );
}
