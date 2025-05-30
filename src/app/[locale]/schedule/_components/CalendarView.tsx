'use client';

import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';


export default function CalendarView() {
  const calendarRef = useRef(null);

  return (
    <div className="bg-white rounded shadow p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,dayGridMonth'
        }}
        editable={true}
        selectable={true}
        events={[
          { title: 'Toán - Luyện tập', start: new Date(), end: new Date(new Date().getTime() + 60 * 60 * 1000) }
        ]}
      />
    </div>
  );
}
