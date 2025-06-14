'use client';

import React, { useState } from 'react';
import CalendarView from './components/CalendarView';

export default function SchedulePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <div className="space-y-10">
        <CalendarView />
      </div>
    </div>
  );
}
