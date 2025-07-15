import { useAuth } from '@/contexts/auth/AuthContext';

export function useRoleChecker() {
    const { hasRole } = useAuth();
    return {
        isStudent: hasRole('user') && !hasRole('teacher'),
        isTeacher: hasRole('teacher'),
        isAdmin: hasRole('admin'),
    };
}
