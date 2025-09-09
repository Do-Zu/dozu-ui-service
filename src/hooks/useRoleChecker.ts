import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';

export function useRoleChecker() {
    const { hasRole } = useAuth();

    return useMemo(
        () => ({
            isStudent: hasRole('user') && !hasRole('teacher') && !hasRole('admin'),
            isTeacher: hasRole('teacher'),
            isAdmin: hasRole('admin'),
        }),
        [hasRole],
    );
}
