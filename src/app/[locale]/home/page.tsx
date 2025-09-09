'use client';

import React, { useEffect } from 'react';

import LoadingPage from '@/app/loading';
import { selectLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import PersonalTopicLibrary from '../topics/components/ui/PersonalTopicLibrary';
import CoreActionCards from './components/CoreActionCards';
import CurrentProcessLearning from './components/CurrentProcessLearning';
import HeroSection from './components/HeroSection';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

// only for user and student
const Home: React.FC = () => {
    const learningMode = useSelector(selectLearningMode);
    const router = useRouter();

    useEffect(() => {
        if (learningMode === MODE_ACCESS_PAGE_ROLE.classBased) {
            router.push(ROUTES.CLASS_BASED);
        }
    }, [learningMode]);

    if (learningMode === MODE_ACCESS_PAGE_ROLE.classBased) {
        return <LoadingPage />;
    }

    const BackGroundGradient = () => (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-600/40 via-sky-500/40 to-cyan-400/40 blur-3xl opacity-60 animate-pulse" />
            <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-500/40 via-fuchsia-500/30 to-indigo-500/40 blur-3xl opacity-50 animate-pulse [animation-delay:1200ms]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[40rem] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_70%)]" />
        </div>
    );

    return (
        <div className="relative flex flex-col h-full w-full">
            <BackGroundGradient />
            <HeroSection />

            {/* Core actions */}
            {/* <section className="relative z-10 mt-2">
                <CoreActionCards />
            </section> */}

            <section className="relative z-10">
                <CurrentProcessLearning />
            </section>

            <section className="relative z-10">
                <PersonalTopicLibrary />
            </section>
        </div>
    );
};

export default Home;
