import { CalendarEvent } from '../ui/full-calendar';
import DroppableTimeSlot from './DroppableTimeSlot';

const EventGroup = ({ hour }: { events: CalendarEvent[]; hour: Date }) => {
    return <DroppableTimeSlot hour={hour}></DroppableTimeSlot>;
};

export default EventGroup;
