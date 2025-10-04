'use client';

import LearningProgress from './components/LearningProgress';
// import { ApiDebugger } from './components/ApiDebugger';
// import { AuthStatus } from './components/AuthStatus';
import { useState } from 'react';


export default function StatsPage() {
  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <div className="container mx-auto py-8 space-y-6">
  
      {/* Main stats component */}
      <LearningProgress weekOf={new Date().toLocaleDateString()} />
    </div>
  );
}
