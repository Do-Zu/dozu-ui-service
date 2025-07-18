'use client';

import React, { useState } from 'react';
import CalendarView from './components/CalendarView';
import { Calendar } from '@/components/ui/full-calendar';

export default function SchedulePage() {
    return (
        <Calendar>
            <div className="max-w-6xl mx-auto p-6 space-y-10">
                <CalendarView />
            </div>
        </Calendar>
    );
}
