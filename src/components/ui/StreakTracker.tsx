'use client';

import { useEffect } from 'react';
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

    // Auto-update streak when user accesses learning pages
    useEffect(() => {
        if (!autoTrack) return;

        const learningRoutes = [
            '/flashcards/browse/',
            '/learning/',
            '/quiz/',
            '/topics/',
            '/mindmap/',
        ];

        const currentPath = window.location.pathname;
        const isLearningPage = learningRoutes.some(route => currentPath.includes(route));
        
        if (isLearningPage && !hasUpdatedStreakToday) {
            // Delay to ensure user actually engages with content
            const timer = setTimeout(() => {
                updateStreak();
            }, updateDelay);
            
            return () => clearTimeout(timer);
        }
    }, [autoTrack, hasUpdatedStreakToday, updateDelay, updateStreak]);

    // Log errors in development
    useEffect(() => {
        if (error && process.env.NODE_ENV === 'development') {
            console.error('StreakTracker error:', error);
        }
    }, [error]);

    // This component doesn't render any UI
    return null;
}