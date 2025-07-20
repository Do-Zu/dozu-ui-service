'use client';

import React from 'react';

import CoreActionCards from './components/CoreActionCards';
import CurrentProcessLearning from './components/CurrentProcessLearning';
import PersonalTopicLibrary from '../topics/components/personal/PersonalTopicLibrary';
import { useSelector } from 'react-redux';
import { selectLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { StudentClassLibrary } from '../class-based/components/student/StudentClassLibrary';
import { TeacherClassLibrary } from '../class-based/components/teacher/TeacherClassLibrary';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { withAuth } from '@/hoc/withAuth';

const Home: React.FC = () => {
    const learningMode = useSelector(selectLearningMode);
    const { isTeacher } = useRoleChecker();
    const router = useRouter();

    if (isTeacher) {
        return (
            <div className="flex flex-col h-full">
                <CoreActionCards />
                <CurrentProcessLearning />
                <TeacherClassLibrary />
            </div>
        );
    }

    if (learningMode === 'class-based') {
        router.push(ROUTES.CLASS_BASED);
    }

    return (
        <div className="flex flex-col h-full">
            <CoreActionCards />
            <CurrentProcessLearning />
            <PersonalTopicLibrary />
        </div>
    );
};

export default withAuth(Home);
