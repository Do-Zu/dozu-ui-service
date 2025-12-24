import { useState } from 'react';
import { setHours } from 'date-fns';
import { CalendarEvent, useCalendar } from '../ui/full-calendar';
import DayEventsContainer from './DayEventsContainer';
import EventGroup from './EventGroup';
import TimeTable from './TimeTable';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import EventCard from './EventCard';

const CalendarDayView = () => {
    const { view, events, date, setEvents } = useCalendar();
    const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    if (view !== 'day') return null;

    const hours = [...Array(24)].map((_, i) => setHours(date, i));

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const currentActiveEvent = events.find((e) => e.id === active.id);
        if (currentActiveEvent) {
            setActiveEvent(currentActiveEvent);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveEvent(null);

        if (!over) return;

        const currentActiveEvent = events.find((e) => e.id === active.id);

        if (!currentActiveEvent) return;

        if (over.data.current?.type === 'timeslot') {
            const newStartTime: Date = over.data.current.hour;
            const eventDuration = currentActiveEvent.end.getTime() - currentActiveEvent.start.getTime();
            const newEndTime = new Date(newStartTime.getTime() + eventDuration);

            const updatedEvent: CalendarEvent = {
                ...currentActiveEvent,
                start: newStartTime,
                end: newEndTime,
            };

            setEvents(events.map((calendarEvent) => (calendarEvent.id === active.id ? updatedEvent : calendarEvent)));
            return;
        }

        const activeIndex = events.findIndex((calendarEvent) => calendarEvent.id === active.id);
        const overIndex = events.findIndex((calendarEvent) => calendarEvent.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            setEvents(arrayMove(events, activeIndex, overIndex));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="relative flex h-full overflow-auto pt-2">
                <TimeTable />
                <div className="relative flex-1">
                    {hours?.map((hour) => <EventGroup key={hour.toString()} hour={hour} events={events} />)}
                    <DayEventsContainer events={events} dayDate={date} />
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
    );
};

export default CalendarDayView;
