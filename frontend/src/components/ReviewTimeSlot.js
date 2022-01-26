import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Row, Col } from 'react-bootstrap';

import Loader from './Loader';
import Message from './Message';
import { fetchReservationTimeSlots } from '../networking/restaurantRequests';



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
  return timeSlots.map((ts, idx) => {
    return {
      id: idx,
      title: `${ts.count} reservations`,
      start: ts.reservedDateTime.split('Z')[0],
      backgroundColor: ts.count > 1 ? 'red' : 'dodgerblue',
      borderColor: ts.count > 1 ? 'red' : 'dodgerblue'
    };
  });
}


export default function ReservationDashboard ({restaurantId, restaurantName, backToCreateReservation}) {

  const [ timeSlots, setTimeSlots ] = useState([]);
  const [ startDate, setStartDate ] = useState(null);
  const [ endDate, setEndDate ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const history = useHistory();

  const { userInfo } = useSelector(state => state.userCookie);


  const setDates = (dateInfo) => {
    setStartDate(dateInfo.startStr.split('T')[0]);
    setEndDate(dateInfo.endStr.split('T')[0]);
  }

  const fetchRestaurantReservationTimeSlots = async (signal) => {
    try {
      const { data, error, message } = await fetchReservationTimeSlots (restaurantId, startDate, endDate, userInfo.token, signal);

      if (error) {
        setTimeSlots([]);
        setError(message);
      }
      else {
        setTimeSlots(data);
        setError(null);
      }
    }
    catch (error) {
      setError(error.message);
      setTimeSlots([]);
    }
  }

  useEffect(() => {
    if (!userInfo)
      history.push('/');
    if (!restaurantId)
      history.push('/');
  }, [userInfo, restaurantId]);


  useEffect(() => {
    const abortController = new AbortController();

    if (startDate && endDate)
      (async () => await fetchRestaurantReservationTimeSlots(abortController.signal))();

    return () => abortController.abort();
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(false);
  }, [timeSlots, error]);

  return (
    <>
      <Button sx={{marginBottom: '10px'}}
        startIcon={<ArrowBackIcon/>}
        onClick={() => backToCreateReservation()}
      >
        Back
      </Button>
      <p style={styles.heading}>Reservation TimeSlots at <strong>{restaurantName}</strong></p>
      <h6>Legends</h6>
      <Row className="mb-4 w-50">
        <Col className="d-flex justify-content-start">
          <div style={{ ...styles.legend, background: 'white', border: 'solid 0.5px black'}} />
          <span>Available</span>
        </Col>
        <Col className="d-flex justify-content-start">
          <div style={{ ...styles.legend, background: 'green' }}/>
          <span>Available</span>
        </Col>
        <Col className="d-flex justify-content-start">
          <div style={{ ...styles.legend, background: 'dodgerblue' }}/>
          <span>Available</span>
        </Col>
        <Col className="d-flex justify-content-start">
          <div style={{ ...styles.legend, background: 'red' }} />
          <span>Full</span>
        </Col>
      </Row>
      { loading ? <Loader/>
      :(
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          datesSet={dateInfo => setDates(dateInfo)}
          initialView="timeGridWeek"
          slotMinTime={'11:00:00'}
          slotMaxTime={'21:00:00'}
          height='580px'
          editable={true}
          selectable={true}
          select={() => alert('Coming Soon!')}
          events={createEvents(timeSlots)}
        />
      )}
    </>
  )
}
