'use client';

import LearningProgress from './components/LearningProgress';
import { ApiDebugger } from './components/ApiDebugger';
import { AuthStatus } from './components/AuthStatus';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function StatsPage() {
  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Auth Status */}
      <AuthStatus />

      {/* Debug toggle */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setShowDebugger(!showDebugger)}
          size="sm"
        >
          {showDebugger ? 'Hide' : 'Show'} API Debugger
        </Button>
      </div>

      {/* API Debugger */}
      {showDebugger && (
        <ApiDebugger />
      )}

      {/* Main stats component */}
      <LearningProgress weekOf={new Date().toLocaleDateString()} />
    </div>
  );
}
