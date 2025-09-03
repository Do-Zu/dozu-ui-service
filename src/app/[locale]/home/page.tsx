'use client';

import React, { useEffect } from 'react';

import LoadingPage from '@/app/loading';
import { selectLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import PersonalTopicLibrary from '../topics/components/common/PersonalTopicLibrary';
import CoreActionCards from './components/CoreActionCards';
import CurrentProcessLearning from './components/CurrentProcessLearning';
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

    return (
        <div className="flex flex-col h-full">
            <CoreActionCards />
            <CurrentProcessLearning />
            <PersonalTopicLibrary />
        </div>
    );
};

export default Home;
