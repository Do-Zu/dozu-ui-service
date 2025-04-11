'use client';

import React from 'react';
import Profile from './_components/Profile';  // Import Profile component

const AboutPage: React.FC = () => {
  return (
    <div>
      <h1>About Page</h1>
      <Profile name="John Doe" age={30} bio="A passionate developer!" />
    </div>
  );
};

export default AboutPage;
