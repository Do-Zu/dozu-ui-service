'use client';

import React from 'react';
import TeacherClassLibrary from './components/ui/TeacherClassLibrary';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col h-full mt-4">
            <TeacherClassLibrary />
        </div>
    );
};

export default Home;
