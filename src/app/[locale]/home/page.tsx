'use client';

import React from 'react';

import ContentLibrary from './components/ContentLibrary';
import CoreActionCards from './components/CoreActionCards';
import CurrentProcessLearning from './components/CurrentProcessLearning';
import SuggestContent from './components/SuggestContent';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <CoreActionCards />
      <CurrentProcessLearning />
      <ContentLibrary />
      <SuggestContent />
    </div>
  );
};

export default Home;
