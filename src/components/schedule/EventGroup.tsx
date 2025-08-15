import { CalendarEvent } from '../ui/full-calendar';

const EventGroup = ({ events, hour }: { events: CalendarEvent[]; hour: Date }) => {
    return (
        <div className="h-20 border-t last:border-b relative">
            {/* This component now only renders the time slot container */}
        </div>
    );
};

export default EventGroup;
