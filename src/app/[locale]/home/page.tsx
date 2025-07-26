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
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

const Home: React.FC = () => {
    const learningMode = useSelector(selectLearningMode);
    const { isTeacher } = useRoleChecker();
    const router = useRouter();

    useEffect(() => {
        if (!isTeacher && learningMode === MODE_ACCESS_PAGE_ROLE.classBased) {
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
