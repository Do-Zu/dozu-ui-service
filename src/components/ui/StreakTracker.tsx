'use client';

import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useStreakTracking } from '@/contexts/gamification/GamificationContext';

interface StreakTrackerProps {
    /** Enable automatic streak tracking when on learning pages */
    autoTrack?: boolean;
    /** Delay before updating streak (in milliseconds) */
    updateDelay?: number;
}

/**
 * StreakTracker component that automatically tracks learning streaks
 * Place this component in your app layout or learning pages to enable automatic streak tracking
 */
export default function StreakTracker({ autoTrack = true, updateDelay = 10000 }: StreakTrackerProps) {
    const { updateStreak, isLoading, error, hasUpdatedStreakToday } = useStreakTracking();
    const pathname = usePathname();
    const params = useParams();

    // Auto-update streak when user accesses learning pages
    useEffect(() => {
        if (!autoTrack) return;

        const learningRoutes = [
            '/flashcards/browse/',
            '/learning/',
            '/quiz/',
            '/topics/',
            '/mindmap/',
            '/class-based/',
        ];

        const isLearningPage = learningRoutes.some(route => pathname.includes(route));
        
        // Get classId from route params (class-based routes have [id] param which is classId)
        const classId = params?.id ? Number(params.id) : null;
        
        // Only update streak if:
        // 1. It's a learning page
        // 2. We have a classId (required for streak updates)
        // 3. Streak hasn't been updated today
        if (isLearningPage && classId !== null && !hasUpdatedStreakToday) {
            // Delay to ensure user actually engages with content
            const timer = setTimeout(() => {
                if (classId !== null) {
                    updateStreak(classId);
                }
            }, updateDelay);
            
            return () => clearTimeout(timer);
        }
    }, [autoTrack, hasUpdatedStreakToday, updateDelay, updateStreak, pathname, params]);

    // Log errors in development
    useEffect(() => {
        if (error && process.env.NODE_ENV === 'development') {
            console.error('StreakTracker error:', error);
        }
    }, [error]);

    // This component doesn't render any UI
    return null;
}