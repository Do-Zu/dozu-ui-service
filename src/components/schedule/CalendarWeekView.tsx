import { useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { addDays, isToday, setHours, startOfWeek, format as formatDate, format } from 'date-fns';

import { useCalendar, CalendarEvent } from '../ui/full-calendar';
import DayEventsContainer from './DayEventsContainer';
import EventGroup from './EventGroup';
import TimeTable from './TimeTable';
import SaveBar from './SaveBar';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import EventCard from './EventCard';
import { IItemScheduleGenerated, IBatchUpdateRequest } from '@/types/schedule';
import { useTranslations } from 'next-intl';
import { postRequest } from '@/api/api';
import { toast } from '@/hooks/use-toast';

const CalendarWeekView = () => {
    const { view, date, locale, events } = useCalendar();
    const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(events);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const t = useTranslations('schedule');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    // Update local events when calendar events change
    useMemo(() => {
        setLocalEvents(events);
        setHasUnsavedChanges(false);
    }, [events]);

    const weekDates = useMemo(() => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const weekDates = [];

        for (let i = 0; i < 7; i++) {
            const day = addDays(start, i);
            const hours = [...Array(24)].map((_, i) => setHours(day, i));
            weekDates.push(hours);
        }

        return weekDates;
    }, [date]);

    const headerDays = useMemo(() => {
        const daysOfWeek = [];
        for (let i = 0; i < 7; i++) {
            const result = addDays(startOfWeek(date, { weekStartsOn: 1 }), i);
            daysOfWeek.push(result);
        }
        return daysOfWeek;
    }, [date]);

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const { active } = event;
            const activeEvent = localEvents.find((e) => e.id === active.id);
            if (activeEvent) {
                setActiveEvent(activeEvent);
            }
        },
        [localEvents],
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveEvent(null);

            if (!over) return;

            const activeEvent = localEvents.find((e) => e.id === active.id);
            if (!activeEvent) return;

            // Handle drop on time slot
            if (over.data.current?.type === 'timeslot') {
                const newStartTime = over.data.current.hour;
                const eventDuration = activeEvent.end.getTime() - activeEvent.start.getTime();
                const newEndTime = new Date(newStartTime.getTime() + eventDuration);

                const updatedEvent = {
                    ...activeEvent,
                    start: newStartTime,
                    end: newEndTime,
                };

                setLocalEvents((prev) => prev.map((e) => (e.id === active.id ? updatedEvent : e)));
                setHasUnsavedChanges(true);
                return;
            }

            // Handle reordering within the same container
            const activeIndex = localEvents.findIndex((e) => e.id === active.id);
            const overIndex = localEvents.findIndex((e) => e.id === over.id);

            if (activeIndex !== overIndex) {
                setLocalEvents((prev) => arrayMove(prev, activeIndex, overIndex));
                setHasUnsavedChanges(true);
            }
        },
        [localEvents],
    );

    const handleEventChange = useCallback((updatedEvent: CalendarEvent) => {
        setLocalEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
        setHasUnsavedChanges(true);
    }, []);

    const handleSaveChanges = useCallback(async () => {
        setIsSaving(true);
        try {
            // Group events by date for the API
            const schedulesByDate: Record<string, IItemScheduleGenerated[]> = {};

            localEvents.forEach((event) => {
                const dateKey = formatDate(event.start, 'yyyy-MM-dd');

                if (!schedulesByDate[dateKey]) {
                    schedulesByDate[dateKey] = [];
                }

                schedulesByDate[dateKey].push({
                    topicId: event.topicId || 0,
                    priority: event.priority || 0,
                    startTime: event.start,
                    endTime: event.end,
                    title: event.title,
                    description: event.description || null,
                    type: event.type || 'default',
                    amountItem: event.amountItem || 1,
                });
            });

            const fromDate = startOfWeek(date, { weekStartsOn: 1 });
            const toDate = addDays(fromDate, 6);

            const batchUpdateData: IBatchUpdateRequest = {
                fromDate,
                toDate,
                updates: {
                    schedules: schedulesByDate,
                },
            };

            await postRequest('/schedule/batch/session', batchUpdateData);

            setHasUnsavedChanges(false);
            // Optionally refresh the calendar data
        } catch {
            toast({
                description: t('saveBar.errorSaveMessage'),
            });
        } finally {
            setIsSaving(false);
        }
    }, [localEvents, date]);

    const handleCancelChanges = useCallback(() => {
        setLocalEvents(events);
        setHasUnsavedChanges(false);
    }, [events]);

    if (view !== 'week') return null;

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="relative flex h-full flex-col overflow-auto">
                    <div className="sticky top-0 mb-3 flex border-b bg-card">
                        <div className="w-12"></div>
                        {headerDays.map((date, i) => (
                            <div
                                key={date.toString()}
                                className={cn(
                                    'text-center flex-1 gap-1 pb-2 text-sm text-muted-foreground flex items-center justify-center',
                                    [0, 6].includes(i) && 'text-muted-foreground/50',
                                )}
                            >
                                {format(date, 'E', { locale })}
                                <span
                                    className={cn(
                                        'h-6 grid place-content-center',
                                        isToday(date) && 'bg-primary text-primary-foreground rounded-full size-6',
                                    )}
                                >
                                    {format(date, 'd')}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-1">
                        <div className="w-fit">
                            <TimeTable />
                        </div>
                        <div className="grid flex-1 grid-cols-7">
                            {weekDates.map((hours, i) => {
                                const dayDate = hours[0]; // First hour of the day represents the day
                                return (
                                    <div
                                        className={cn(
                                            'h-full text-sm text-muted-foreground border-l first:border-l-0 relative',
                                            [0, 6].includes(i) && 'bg-muted/50',
                                        )}
                                        key={hours[0].toString()}
                                    >
                                        {hours.map((hour) => (
                                            <EventGroup key={hour.toString()} hour={hour} events={localEvents} />
                                        ))}
                                        <DayEventsContainer
                                            events={localEvents}
                                            dayDate={dayDate}
                                            onEventChange={handleEventChange}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeEvent && (
                        <div className="rounded border bg-white p-2 opacity-90 shadow-lg">
                            <EventCard event={activeEvent} isDragging />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <SaveBar
                isVisible={hasUnsavedChanges}
                onSave={handleSaveChanges}
                onCancel={handleCancelChanges}
                isLoading={isSaving}
            />
        </>
    );
};

export default CalendarWeekView;
