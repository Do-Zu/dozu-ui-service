'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { useEffect } from 'react';
import AuthSkeleton from '@/components/ui/auth-skeleton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { ILearningMode, setLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { useDispatch } from 'react-redux';

function HomePage() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    const [storedValue] = useLocalStorage<ILearningMode>('learningMode', 'personal');
    const { isTeacher } = useRoleChecker();
    const dispatch = useDispatch();

    useEffect(() => {
        if (isAuthenticated || user?.isNewUser) {
            router.push(ROUTES.HOME);
        } else {
            router.push(ROUTES.WELCOME);
        }

        if (isAuthenticated && isTeacher) {
            dispatch(setLearningMode('class-based'));
        } else {
            dispatch(setLearningMode(storedValue));
        }
    }, [isAuthenticated]);

    return <AuthSkeleton />;
}

export default HomePage;
