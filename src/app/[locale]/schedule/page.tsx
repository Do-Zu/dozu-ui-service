'use client';

import React, { useState } from 'react';
import SetupForm from './components/SetupForm';
import CalendarView from './components/CalendarView';

export default function SchedulePage() {
  const [step, setStep] = useState<'setup' | 'calendar'>('setup');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {step === 'setup' && (
        <div className="space-y-8">
          <SetupForm onComplete={() => setStep('calendar')} />
        </div>
      )}

      {step === 'calendar' && (
        <div className="space-y-10">
          <CalendarView />
        </div>
      )}
    </div>
  );
}
