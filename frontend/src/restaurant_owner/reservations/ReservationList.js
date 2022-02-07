import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import MaterialButton from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ReservationDetails from './ReservationDetails';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { getReservationListByDateTime } from '../../networking/reservationRequests';


const styles = {
  heading: {
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: 500
  },
  paper: {
    margin: '10px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: 'gainsboro',
      color: 'darkblue',
      cursor: 'pointer'
    },
  },
  active: {
    padding: '5px',
    background: 'tomato',
    color: 'white'
  },
  done: {
    padding: '5px',
    background: 'green',
    color: 'white'
  },
  cancel: {
    padding: '5px',
    background: 'lightgray',
    color: 'black'
  }
}


function makeStyle (status) {
  switch (status) {
    case 'active':
      return styles.active;
    case 'complete':
      return styles.done;
    case 'cancel':
      return styles.cancel;
    default:
      throw new Error('Unknown Status');
  }
}

export default function ReservationList ({viewType, dateTime, backToDashboard}) {

  const [ reservations, setReservations ] = useState(null);
  const [ count, setCount ] = useState(0);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(null);
  const [ reservationDetails, setReservationDetails ] = useState(false);

  const history = useHistory();
  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantInfo } = useSelector(state => state.restaurant);


  const fetchReservations = async (dateTime, viewType, signal) => {
    try {
      const { data, error, message } = await getReservationListByDateTime({
        restaurantId: restaurantInfo._id,
        date: viewType === 'dayGridMonth' ? dateTime : null,
        datetime: viewType === 'timeGridWeek' ? dateTime.replaceAll(' ', '+') : null,
        token: userInfo.token,
        signal: signal
      });

      if (error) {
        setError(message);
        setReservations(null);
        setCount(0);
      }
      else {
        setError(null);
        setReservations(data.reservations);
        setCount(data.count);
      }
    }
    catch (error) {
      setError(error.message);
      setReservations(null);
      setCount(0);
    }
  };

  useEffect(() => {
    if (!restaurantInfo || !userInfo)
      history.push('/');
  }, [restaurantInfo, userInfo]);

  useEffect(() => {
    const abortController = new AbortController();

    if (viewType && dateTime && backToDashboard) {
      (async () => await fetchReservations(dateTime, viewType, abortController.signal))();
    }

    return () => abortController.abort();
  }, [viewType, dateTime, backToDashboard, reservationDetails]);

  return (
    <>
      {
        reservationDetails
        ? <ReservationDetails reservation={reservationDetails} backToList={() => setReservationDetails(null)}/>
        : (
          <>
            <MaterialButton
              startIcon={<ArrowBackIcon/>}
              sx={{marginBottom: '20px'}}
              onClick={() => backToDashboard()}
            >
              Back
            </MaterialButton>
            <p style={styles.heading}>Reservation(s) on {dateTime}</p>
            { error && <Message variant='danger'>{error}</Message> }
            { loading && <Loader /> }
            { reservations?.map(r => (
              <Paper
                sx={styles.paper}
                key={r._id}
                onClick={() => setReservationDetails(r)}
              >
                <div>
                  <h6>{r.customer.name}, {r.customer.username}</h6>
                  <h6>
                    <i className="fas fa-user"></i>&nbsp;
                    <strong>{r.num_of_pax} people</strong>
                  </h6>
                </div>
                <h6
                  style={makeStyle(r.status)}
                >
                  <strong>{r.status}</strong>
                </h6>
              </Paper>
            ))}
          </>
        )
      }
    </>
  );
}
