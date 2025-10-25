'use client';

// This hook is deprecated. Use useStreakTracking from GamificationContext instead.
// Keeping for backward compatibility.

import { useStreakTracking as useNewStreakTracking } from '@/contexts/gamification/GamificationContext';

export function useStreakTracking(options: any = {}) {
    console.warn('useStreakTracking from hooks/useStreakTracking is deprecated. Use useStreakTracking from contexts/gamification/GamificationContext instead.');
    return useNewStreakTracking();
}

export { useStreakListener } from '@/contexts/gamification/GamificationContext';

export default useStreakTracking;