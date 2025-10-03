'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useStreakTracking } from '@/contexts/gamification/GamificationContext';

const LEARNING_ROUTES = [
    '/flashcards/browse/',
    '/learning/',
    '/quiz/',
    '/topics/',
    '/mindmap/',
];

export default function StreakTracker() {
    const pathname = usePathname();
    const { updateStreak, hasUpdatedStreakToday } = useStreakTracking();

    useEffect(() => {
        // Check if current route is a learning activity
        const isLearningActivity = LEARNING_ROUTES.some(route => 
            pathname.includes(route)
        );

        if (isLearningActivity && !hasUpdatedStreakToday) {
            // Delay to ensure user actually engages with content
            const timer = setTimeout(() => {
                updateStreak();
            }, 10000); // Update after 10 seconds of being on learning page
            
            return () => clearTimeout(timer);
        }
    }, [pathname, hasUpdatedStreakToday, updateStreak]);

    return null; // This component doesn't render anything
}