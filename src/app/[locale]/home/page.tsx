'use client';

import React, { ComponentType, ReactNode, useEffect } from 'react';

import { ILearningMode, selectLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAuthStorage } from '../auth/hooks/useAuthStorage';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import PersonalTopicLibrary from '../topics/components/ui/PersonalTopicLibrary';
import CurrentProcessLearning from './components/CurrentProcessLearning';
import HeroSection from './components/HeroSection';
import LoadingPage from '@/app/loading';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRoleChecker } from '@/hooks/useRoleChecker';

const BackgroundGradient: React.FC = React.memo(() => (
    <div aria-hidden className="h-full pointer-events-none absolute inset-0 overflow-hidden select-none">
        {/* Base subtle vertical wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white dark:from-slate-950 dark:via-slate-950/70 dark:to-slate-950" />

        {/* Large soft radial glow center */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120rem] h-[120rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.20),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_65%)] blur-3xl" />

        {/* Accent blobs (animated) */}
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/50 via-sky-400/40 to-cyan-300/40 dark:from-indigo-500/40 dark:via-sky-500/30 dark:to-cyan-400/30 blur-3xl opacity-70 animate-pulse" />
        <div className="absolute top-1/4 -right-28 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/40 via-fuchsia-400/30 to-indigo-400/40 dark:from-cyan-500/35 dark:via-fuchsia-500/25 dark:to-indigo-500/35 blur-3xl opacity-60 animate-pulse [animation-delay:900ms]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gradient-to-tr from-violet-400/30 via-sky-400/25 to-teal-300/30 dark:from-violet-500/25 dark:via-sky-500/20 dark:to-teal-400/25 blur-3xl opacity-50 animate-pulse [animation-delay:1600ms]" />

        {/* Soft horizon sheen */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60rem] h-72 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12),transparent_75%)]" />

        {/* Optional subtle noise (very light) */}
        <div className="absolute inset-0 opacity-[0.09] mix-blend-overlay dark:opacity-[0.06] [background-image:radial-gradient(rgba(0,0,0,0.35)_1px,transparent_1px)] [background-size:14px_14px]" />
    </div>
));

type Section = {
    key: string;
    isAuth: boolean;
    Comp: ComponentType;
    ReplaceComp?: ReactNode;
};

const SECTIONS: Section[] = [
    { key: 'bg', isAuth: false, Comp: BackgroundGradient },
    { key: 'hero', isAuth: false, Comp: HeroSection },
    { key: 'current', isAuth: true, Comp: CurrentProcessLearning },
    { key: 'library', isAuth: true, Comp: PersonalTopicLibrary, ReplaceComp: <div></div> },
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
