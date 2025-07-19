'use client';

import React, { useState } from 'react';
import CalendarView from './components/CalendarView';
import { Calendar } from '@/components/ui/full-calendar';

export default function SchedulePage() {
    return (
        <Calendar>
            <div className="mx-auto p-2 space-y-10">
                <CalendarView />
            </div>
        </Calendar>
    );
}
