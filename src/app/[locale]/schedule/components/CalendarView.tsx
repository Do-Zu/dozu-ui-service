'use client';

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
import { useTranslations } from 'next-intl';

import LoadingPage from '@/app/loading';

export default function CalendarView() {
    const { date, isLoading, handleGetGenerateScheduleEvent } = useCalendar();
    const t = useTranslations('schedule.calendar');

    useEffect(() => {
        handleGetGenerateScheduleEvent(date);
    }, []);

    return (
        <div className="h-dvh flex flex-col">
            {isLoading && <LoadingPage isOverlay={true} />}
            <div className="flex px-6 items-center gap-2 mb-6">
                <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
                    {t('view.day')}
                </CalendarViewTrigger>
                <CalendarViewTrigger view="week" className="aria-[current=true]:bg-accent">
                    {t('view.week')}
                </CalendarViewTrigger>

                <span className="flex-1" />

                <CalendarCurrentDate />

                <CalendarPrevTrigger>
                    <ChevronLeft size={20} />
                    <span className="sr-only">{t('controls.previous')}</span>
                </CalendarPrevTrigger>

                <CalendarTodayTrigger>{t('controls.today')}</CalendarTodayTrigger>

                <CalendarNextTrigger>
                    <ChevronRight size={20} />
                    <span className="sr-only">{t('controls.next')}</span>
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
