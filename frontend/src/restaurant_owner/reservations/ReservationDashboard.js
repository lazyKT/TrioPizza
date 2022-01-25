import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction"

import ReservationList from './ReservationList';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchReservationTimeSlots, fetchReservationByDates } from '../../networking/restaurantRequests';


function createEvents (timeSlots) {
  if (timeSlots) {
    const { data, view } = timeSlots;
    const time = view === 'timeGridWeek' ? 'reservedDateTime' : 'day';

    return data?.map((ts, idx) => {
      return {
        id: idx,
        title: `${ts.count} reservations`,
        start: ts[time].split('Z')[0],
        backgroundColor: ts.count > 1 ? 'red' : 'dodgerblue',
        borderColor: ts.count > 1 ? 'red' : 'dodgerblue'
      };
    });
  }

  return [];
}



export default function ReservationDashboard () {

  const [ timeSlots, setTimeSlots ] = useState(null);
  const [ showReservationlist, setShowReservationlist ] = useState(false);
  const [ viewType, setViewType ] = useState(null);
  const [ eventDateTime, setEventDateTime ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const history  = useHistory();
  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantInfo } = useSelector(state => state.restaurant);


  const setDates = async (dateInfo) => {

    const start_date = dateInfo.startStr.split('T')[0];
    const end_date = dateInfo.endStr.split('T')[0];
    const view = dateInfo.view.type;

    if (view === 'dayGridMonth')
      await fetchRestaurantReservationTimeSlots(start_date, end_date, view);
    else if (view === 'timeGridWeek')
      await fetchRestaurantReservationTimeSlots(start_date, end_date, view);
  }

  const fetchRestaurantReservationTimeSlots = async (start_date, end_date, view, signal) => {
    try {
      const { data, error, message } = view === 'dayGridMonth'
      ? await fetchReservationByDates (
        restaurantInfo._id, start_date, end_date, userInfo.token, signal
      )
      : await fetchReservationTimeSlots (
        restaurantInfo._id, start_date, end_date, userInfo.token, signal
      )

      if (error) {
        setTimeSlots([]);
        setError(message);
      }
      else {
        setTimeSlots({ data, view });
        setError(null);
      }
    }
    catch (error) {
      setError(error.message);
      setTimeSlots([]);
    }
  }


  const onClickEvent = (e) => {
    setViewType(e.view.type);
    setEventDateTime(e.event.startStr);
    setShowReservationlist(true);
    console.log(e.event.startStr);
    console.log(e.view.type);
  }


  useEffect(() => {
    if (!userInfo)
      history.push('/');

    if (!restaurantInfo)
      history.push('/');
  }, [userInfo, restaurantInfo]);


  useEffect(() => {
    setLoading(false);
  }, [timeSlots, error]);


  return (
    <>
      {
        showReservationlist
        ? (
            <ReservationList
              viewType={viewType}
              dateTime={eventDateTime}
              backToDashboard={() => setShowReservationlist(false)}
            />
          )
        : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            datesSet={dateInfo => setDates(dateInfo)}
            initialView="dayGridMonth"
            slotMinTime={'11:00:00'}
            slotMaxTime={'21:00:00'}
            height='580px'
            editable={true}
            selectable={true}
            select={() => alert('Coming Soon!')}
            events={createEvents(timeSlots)}
            eventClick={event => onClickEvent(event)}
          />
        )
      }
    </>
  )
}
