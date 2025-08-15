import { setHours } from 'date-fns';
import { useCalendar } from '../ui/full-calendar';
import DayEventsContainer from './DayEventsContainer';
import EventGroup from './EventGroup';
import TimeTable from './TimeTable';

const CalendarDayView = () => {
    const { view, events, date } = useCalendar();

    if (view !== 'day') return null;

    const hours = [...Array(24)].map((_, i) => setHours(date, i));

    return (
        <div className="flex relative pt-2 overflow-auto h-full">
            <TimeTable />
            <div className="flex-1 relative">
                {hours.map((hour) => (
                    <EventGroup key={hour.toString()} hour={hour} events={events} />
                ))}
                <DayEventsContainer events={events} dayDate={date} />
            </div>
        </div>
    );
};

export default CalendarDayView;
