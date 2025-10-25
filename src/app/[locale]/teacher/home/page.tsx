'use client';

import React from 'react';
import TeacherClassLibrary from './components/ui/TeacherClassLibrary';
import { withAuth } from '@/hoc/withAuth';
import { USER_ROLES } from '@/utils/constants/roles';

const AuthComponent = withAuth(TeacherClassLibrary, { requiredRole: USER_ROLES.TEACHER });

const Home: React.FC = () => {
    return (
        <div className="flex flex-col h-full mt-4">
            <AuthComponent />
        </div>
    );
};

export default Home;
