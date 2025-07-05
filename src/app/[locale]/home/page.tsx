'use client';

import React from 'react';

import CoreActionCards from './components/CoreActionCards';
import CurrentProcessLearning from './components/CurrentProcessLearning';
import { ClassesLibrary } from '../class-based-learning/components/ClassLibrary';
import TopicLibrary from '../topics/components/TopicLibrary';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col h-full">
            <CoreActionCards />
            <CurrentProcessLearning />
            {/* <ClassesLibrary /> */}
            <TopicLibrary />
        </div>
    );
};

export default Home;
