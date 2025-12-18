'use client';

import React, { ComponentType, ReactNode, useEffect } from 'react';

import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { useAuthStorage } from '../auth/hooks/useAuthStorage';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import PersonalTopicLibrary from '../topics/components/ui/PersonalTopicLibrary';
import CurrentProcessLearning from './components/CurrentProcessLearning';
import HeroSection from './components/HeroSection';
import Actions from './components/actions/Actions';
import LoadingPage from '@/app/loading';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { BackgroundGradient } from '@/components/common/BackgroundGradient';
import GuestLibraryPlaceholder from './components/GuestLibraryPlaceholder';
import Title from './components/Title';

type Section = {
    key: string;
    isAuth: boolean;
    Comp: ComponentType;
    ReplaceComp?: ReactNode;
};

const SECTIONS: Section[] = [
    { key: 'bg', isAuth: false, Comp: BackgroundGradient },
    { key: 'title', isAuth: false, Comp: Title },
    { key: 'hero', isAuth: false, Comp: HeroSection },
    { key: 'actions', isAuth: true, Comp: Actions },
    { key: 'current', isAuth: true, Comp: CurrentProcessLearning },
    { key: 'library', isAuth: true, Comp: PersonalTopicLibrary, ReplaceComp: <GuestLibraryPlaceholder /> },
];

// only for user and student
const Home: React.FC = () => {
    const [learningMode] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const router = useRouter();
    const { isAuthenticated } = useAuthStorage();
    const { isAdmin } = useRoleChecker();

    // Block admin from accessing home page
    useEffect(() => {
        if (isAdmin) {
            router.replace(ROUTES.ADMIN);
            return;
        }
    }, [isAdmin, router]);

    useEffect(() => {
        if (learningMode === MODE_ACCESS_PAGE_ROLE.classBased) {
            router.push(ROUTES.CLASS_BASED);
        }
    }, [learningMode, router]);

    // Show loading if redirecting admin or changing learning mode
    if (isAdmin || learningMode === MODE_ACCESS_PAGE_ROLE.classBased) {
        return <LoadingPage />;
    }

    return (
        <div className="relative flex flex-col h-full w-full">
            {SECTIONS.map(({ key, isAuth, Comp, ReplaceComp }) => (
                <React.Fragment key={key}>
                    {isAuth && !isAuthenticated ? (ReplaceComp ?? null) : <Comp />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Home;
