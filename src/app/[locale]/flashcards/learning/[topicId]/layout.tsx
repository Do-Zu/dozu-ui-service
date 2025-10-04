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
            enableAutoSend={true} // Disable auto-send to prevent duplicate API calls - handleSaveTrackingProgressLearning() handles this
            minSessionTime={5000} // 5 seconds minimum session
            apiEndpoint="/tracking/active-learning" // Behavioral tracking
            learningApiEndpoint="/progress/learning-tracking" // Learning progress tracking
        >
            {children}
        </UserTrackingProvider>
    );
}