'use client';

/**
 * Provider wrapper for Gamification functionality
 * Add this to your app layout or specific pages that need gamification features
 */

import { GamificationProvider } from '@/contexts/gamification/GamificationContext';

interface GamificationWrapperProps {
    children: React.ReactNode;
    autoLoad?: boolean;
}

export default function GamificationWrapper({ children, autoLoad = true }: GamificationWrapperProps) {
    return (
        <GamificationProvider autoLoad={autoLoad}>
            {children}
        </GamificationProvider>
    );
}

// Example usage:
// In your layout.tsx or page.tsx:
// <GamificationWrapper>
//   <YourAppContent />
// </GamificationWrapper>

// For components that need streak tracking:
// import { useStreakTracking, usePointsManagement } from '@/contexts/gamification/GamificationContext';
// const { updateStreak, currentStreakData } = useStreakTracking();
// const { pointsData, buyStreakFreeze } = usePointsManagement();