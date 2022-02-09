import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction"

import ReservationList from './ReservationList';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchReservationTimeSlots, fetchReservationByDates } from '../../networking/restaurantRequests';


const styles = {
  heading: {
    fontSize: '18px',
    fontWeight: 'bold'
  },
  legend: {
    width: '18px',
    height: '18px',
    marginRight: '10px'
  }
}

function createEvents (timeSlots) {
  if (timeSlots) {
    const { data, view } = timeSlots;
    const time = view === 'timeGridWeek' ? 'reservedDateTime' : 'day';

    return data?.map((ts, idx) => {
      return {
        id: idx,
        title: `${ts.count} reservations`,
        start: ts[time].split('Z')[0],
        backgroundColor: ts.count > 5 ? 'red' : ( ts.count > 3 ? 'dodgerblue' : 'green'),
        borderColor: ts.count > 5 ? 'red' : ( ts.count > 3 ? 'dodgerblue' : 'green'),
      };
    });
  }

  return [];
}


function formatAMPM (dateStr) {
  const date = dateStr.split('T')[0];
  const time = dateStr.split('T')[1];
  let hrs = parseInt(time.split(':')[0]);
  let minutes = parseInt(time.split(':')[1]);
  const ampm = hrs >= 12 ? 'pm' : 'am';
  hrs = hrs % 12;
  hrs = hrs ? hrs : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  return `${date} ${hrs}:${minutes} ${ampm}`;
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
    if (e.view.type === 'timeGridWeek')
      setEventDateTime(formatAMPM(e.event.startStr));
    else
      setEventDateTime(e.event.startStr);
    setShowReservationlist(true);
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
          <>
            <h6>Legends</h6>
            <Row className="mb-4 w-75">
              <Col className="d-flex justify-content-start">
                <div style={{ ...styles.legend, background: 'white', border: 'solid 0.5px black'}} />
                <span>Available</span>
              </Col>
              <Col className="d-flex justify-content-start">
                <div style={{ ...styles.legend, background: 'green' }}/>
                <span>75% Available</span>
              </Col>
              <Col className="d-flex justify-content-start">
                <div style={{ ...styles.legend, background: 'dodgerblue' }}/>
                <span>50% Available</span>
              </Col>
              <Col className="d-flex justify-content-start">
                <div style={{ ...styles.legend, background: 'red' }} />
                <span>Full</span>
              </Col>
            </Row>
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
              events={createEvents(timeSlots)}
              eventClick={event => onClickEvent(event)}
            />
          </>
        )
      }
    </>
  )
}
