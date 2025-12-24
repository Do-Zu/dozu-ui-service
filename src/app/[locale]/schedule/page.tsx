'use client';

import { Calendar } from '@/components/ui/full-calendar';
import { withAuth } from '@/hoc/withAuth';
import CalendarView from './components/CalendarView';

const SchedulePage = () => {
    return (
        <Calendar>
            <CalendarView />
        </Calendar>
    );
};

export default withAuth(SchedulePage);
