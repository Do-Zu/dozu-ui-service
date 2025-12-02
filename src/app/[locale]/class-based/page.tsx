'use client';

import React from 'react';
import StudentClassLibrary from './components/ui/class/StudentClassLibrary';
import { BackgroundGradient } from '@/components/common/BackgroundGradient';

// only for student, teacher will use /home as default
const Page: React.FC = () => {
    return (
        <div className="relative flex flex-col h-full min-h-screen">
            <BackgroundGradient />
            <div className="relative flex-1 mt-8">
                <StudentClassLibrary />
            </div>
        </div>
    );
};

export default Page;
