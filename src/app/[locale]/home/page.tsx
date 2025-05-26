'use client';

import React from 'react';

import ContentLibrary from './components/ContentLibrary';
import CoreActionCards from './components/CoreActionCards';
import CurrentProcessLearning from './components/CurrentProcessLearning';
import SuggestContent from './components/SuggestContent';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* <div className="bg-white dark:bg-gray-800 border-b border-[#dee2e6] dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back to your learning hub</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Content
          </Button>
        </div>
      </div> */}

      <CoreActionCards />
      <CurrentProcessLearning />
      <SuggestContent />

      <div className="flex-1 overflow-auto p-4">
        <ContentLibrary />
      </div>
    </div>
  );
};

export default Home;
