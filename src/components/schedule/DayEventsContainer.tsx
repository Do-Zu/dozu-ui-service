import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import EventCard from './EventCard';
import { CalendarEvent } from '../ui/full-calendar';
import { dayEventVariants } from './constant';

const DayEventsContainer = ({ events, dayDate }: { events: CalendarEvent[]; dayDate: Date }) => {
    const startOfDay = new Date(dayDate);
    startOfDay.setHours(0, 0, 0, 0);

    const dayEvents = events.filter((event) => isSameDay(event.start, dayDate));

    // Group overlapping events for better positioning
    const sortedEvents = dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
        <div className="absolute inset-0 pointer-events-none">
            {sortedEvents.map((event, index) => {
                // Calculate position from start of day (0:00)
                const eventStartMinutes = event.start.getHours() * 60 + event.start.getMinutes();
                const eventEndMinutes = event.end.getHours() * 60 + event.end.getMinutes();

                // Ensure event doesn't go beyond the current day
                const maxMinutes = 24 * 60; // 24 hours
                const clampedEndMinutes = Math.min(eventEndMinutes, maxMinutes);

                // Each hour slot is 80px (h-20), so total day height is 24 * 80px = 1920px
                const hourHeight = 80; // 80px per hour (h-20 = 5rem = 80px)
                const topPosition = (eventStartMinutes / 60) * hourHeight;
                const eventHeight = Math.max(((clampedEndMinutes - eventStartMinutes) / 60) * hourHeight, 20); // Minimum 20px height

                // Check for overlapping events to adjust width and position
                let leftOffset = 0;
                let widthReduction = 0;

                for (let i = 0; i < index; i++) {
                    const prevEvent = sortedEvents[i];
                    const prevStartMinutes = prevEvent.start.getHours() * 60 + prevEvent.start.getMinutes();
                    const prevEndMinutes = prevEvent.end.getHours() * 60 + prevEvent.end.getMinutes();

                    // Check if events overlap
                    if (eventStartMinutes < prevEndMinutes && eventEndMinutes > prevStartMinutes) {
                        leftOffset = Math.max(leftOffset, 50); // 50% offset for overlapping events
                        widthReduction = 50; // Reduce width to 50% for overlapping events
                    }
                }

                return (
                    <div
                        key={event.id}
                        className={cn('absolute pointer-events-auto', dayEventVariants({ variant: event.color }))}
                        style={{
                            top: `${topPosition}px`,
                            height: `${eventHeight}px`,
                            left: `${4 + leftOffset}%`,
                            right: `${4 + widthReduction}%`,
                        }}
                    >
                        <EventCard event={{ ...event, color: event.color ?? undefined }} />
                    </div>
                );
            })}
        </div>
    );
};

export default DayEventsContainer;
