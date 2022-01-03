import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';


let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'All-day event',
    start: todayStr
  },
  {
    id: 2,
    title: 'Timed event',
    start: todayStr + 'T12:00:00'
  }
]


export default function ReservationDashboard () {


  return (
    <>
      <h6>Reservation Dashboard</h6>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        slotMinTime={'09:00:00'}
        slotMaxTime={'20:00:00'}
        height='700px'
        editable={true}
        selectable={true}
        select={() => alert('Coming Soon!')}
        initialEvents={INITIAL_EVENTS}
      />
    </>
  )
}
