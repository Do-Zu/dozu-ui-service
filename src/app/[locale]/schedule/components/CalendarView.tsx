import {
    CalendarCurrentDate,
    CalendarDayView,
    CalendarNextTrigger,
    CalendarPrevTrigger,
    CalendarTodayTrigger,
    CalendarViewTrigger,
    CalendarWeekView,
    useCalendar,
} from '@/components/ui/full-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

import LoadingPage from '@/app/loading';

export default function CalendarView() {
    const { date, isLoading, handleGetGenerateScheduleEvent } = useCalendar();

    useEffect(() => {
        handleGetGenerateScheduleEvent(date);
    }, []);

    return (
        <div className="h-dvh flex flex-col">
            {isLoading && <LoadingPage isOverlay={true} />}
            <div className="flex px-6 items-center gap-2 mb-6">
                <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
                    Day
                </CalendarViewTrigger>
                <CalendarViewTrigger view="week" className="aria-[current=true]:bg-accent">
                    Week
                </CalendarViewTrigger>

                <span className="flex-1" />

                <CalendarCurrentDate />

                <CalendarPrevTrigger>
                    <ChevronLeft size={20} />
                    <span className="sr-only">Previous</span>
                </CalendarPrevTrigger>

                <CalendarTodayTrigger>Today</CalendarTodayTrigger>

                <CalendarNextTrigger>
                    <ChevronRight size={20} />
                    <span className="sr-only">Next</span>
                </CalendarNextTrigger>
            </div>

            <div className="flex-1 px-6 overflow-hidden">
                <CalendarDayView />
                <CalendarWeekView />
                {/* <CalendarMonthView />
        <CalendarYearView /> */}
            </div>
        </div>
    );
}
