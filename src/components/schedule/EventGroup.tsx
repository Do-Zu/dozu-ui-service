import { CalendarEvent } from '../ui/full-calendar';
import DroppableTimeSlot from './DroppableTimeSlot';

const EventGroup = ({ events, hour }: { events: CalendarEvent[]; hour: Date }) => {
    return (
        <DroppableTimeSlot hour={hour}>
            {/* This component now only renders the time slot container */}
        </DroppableTimeSlot>
    );
};

export default EventGroup;
