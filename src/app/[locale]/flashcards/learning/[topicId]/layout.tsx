'use client';

import { ReactNode } from 'react';
import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';

interface LearningTopicLayoutProps {
    children: ReactNode;
}

export default function LearningTopicLayout({ children }: LearningTopicLayoutProps) {
    return (
        <UserTrackingProvider
            autoStartTracking={true}
            enableAutoSend={true}
            minSessionTime={5000} // 5 seconds minimum session
            apiEndpoint="/tracking/active-learning"
        >
            {children}
        </UserTrackingProvider>
    );
}