'use client';

import AuthSkeleton from '@/components/ui/auth-skeleton';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { ILearningMode, setLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

function HomePage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const [storedValue] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const { isTeacher, isAdmin } = useRoleChecker();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(ROUTES.WELCOME);
            return;
        }

        if (isAdmin) {
            router.push(ROUTES.ADMIN);
            return;
        }

        if (isTeacher) {
            dispatch(setLearningMode(MODE_ACCESS_PAGE_ROLE.classBased));
            router.push(ROUTES.LANDING);
            return;
        }

        // For regular users, set learning mode and go to home
        dispatch(setLearningMode(storedValue));
        router.push(ROUTES.HOME);
    }, [isAuthenticated, isTeacher, isAdmin]);

    return <AuthSkeleton />;
}

export default HomePage;
