'use client';

import React, { useEffect } from 'react';

import LoadingPage from '@/app/loading';
import { withAuth } from '@/hoc/withAuth';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { selectLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { TeacherClassLibrary } from '../class-based/components/teacher/TeacherClassLibrary';
import PersonalTopicLibrary from '../topics/components/personal/PersonalTopicLibrary';
import CoreActionCards from './components/CoreActionCards';
import CurrentProcessLearning from './components/CurrentProcessLearning';

const Home: React.FC = () => {
    const learningMode = useSelector(selectLearningMode);
    const { isTeacher } = useRoleChecker();
    const router = useRouter();

    useEffect(() => {
        if (!isTeacher && learningMode === 'class-based') {
            router.push(ROUTES.CLASS_BASED);
        }
    }, [learningMode, isTeacher]);

    if (isTeacher) {
        return (
            <div className="flex flex-col h-full mt-4">
                <TeacherClassLibrary />
            </div>
        );
    }

    if (learningMode === 'class-based') {
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
