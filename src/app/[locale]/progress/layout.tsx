'use client';

import { ReactNode } from 'react';
import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';

interface ProgressLayoutProps {
  children: ReactNode;
}

export default function ProgressLayout({ children }: ProgressLayoutProps) {
  return (
    <UserTrackingProvider
      autoStartTracking={false} // Don't auto-start tracking on progress page
      enableAutoSend={true}
      minSessionTime={0}
      apiEndpoint="/tracking/active-learning"
    >
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </UserTrackingProvider>
  );
} 