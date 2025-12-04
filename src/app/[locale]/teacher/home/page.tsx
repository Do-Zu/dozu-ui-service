'use client';

import React from 'react';
import TeacherClassLibrary from './components/ui/TeacherClassLibrary';
import { withAuth } from '@/hoc/withAuth';
import { USER_ROLES } from '@/utils/constants/roles';
import { BackgroundGradient } from '@/components/common/BackgroundGradient';

const AuthComponent = withAuth(TeacherClassLibrary, { requiredRole: USER_ROLES.TEACHER });

const Home: React.FC = () => {
    return (
        <div className="relative flex flex-col h-full min-h-screen">
            <BackgroundGradient />
            <div className="relative flex-1 pt-8 pb-16">
                <AuthComponent />
            </div>
        </div>
    );
};

export default Home;
