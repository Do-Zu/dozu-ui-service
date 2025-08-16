'use client';

import React from 'react';
import { StudentClassLibrary } from './components/ui/StudentClassLibrary';

// only for student, teacher will use /home as default
const Page: React.FC = () => {
    return (
        <div className="flex flex-col h-full mt-8">
            <StudentClassLibrary />
        </div>
    );
};

export default Page;
