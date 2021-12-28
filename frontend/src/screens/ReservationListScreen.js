import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';

import Message from '../components/Message';
import Loader from '../components/Loader';
import { getUsersReservations } from '../networking/reservationRequests';


const styles = {
  paper: {
    margin: '10px',
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}


function getDay (date) {
  let day = '';
  switch (date.getDay()) {
    case 0:
      day = 'Sun';
      break;
    case 1:
      day = 'Mon';
      break;
    case 2:
      day = 'Tue';
      break;
    case 3:
      day = 'Wed';
      break;
    case 4:
      day = 'Thu';
      break;
    case 5:
      day = 'Fri';
      break;
    case 6:
      day = 'Sat';
      break;
    default:
      day = 'N.A'
  }
  return day;
}

function formatAMPM (date) {
  let hrs = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hrs >= 12 ? 'pm' : 'am';
  hrs = hrs % 12;
  hrs = hrs ? hrs : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  return `${hrs}:${minutes} ${ampm}`;
}


export default function ReservationListScreen ({history}) {

  const { userInfo } = useSelector(state => state.userCookie);

  const [ reservations, setReservations ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);


  const toDate = (dt) => {
    const date = new Date(dt);
    const day = getDay(date);

    return `${day}, ${date.toLocaleDateString()} ${formatAMPM(date)}`;
  }

  const fetchUsersReservations = async (userId, token, signal) => {
    try {
      const { error, data, message } = await getUsersReservations(userId, token, signal);

      if (error) {
        setError(message);
        setReservations([]);
      }
      else {
        setError(null);
        setReservations(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo) {
      (async () =>
        await fetchUsersReservations(userInfo.id, userInfo.token, abortController.signal)
      )()
    }
    else {
      history.push('/');
    }

    return (() => {
      abortController.abort();
    });

  }, [userInfo]);

  useEffect(() => {
    setLoading(false);
  }, [reservations, error]);


  return (
    <>
      <h4>My Reservations</h4>
      { error && <Message variant='danger'>{error}</Message> }
      { loading && <Loader />}
      { reservations.map ( (r) => (
        <Paper
          sx={styles.paper}
          key={r._id}
        >
          <div>
            <h6>Date : <strong>{toDate(r.reservedDateTime)}</strong></h6>
            <h6>
              <i class="fas fa-user"></i>&nbsp;
              <strong>{r.num_of_pax} people</strong>
            </h6>
          </div>
          <h6>Status : <strong>{r.status}</strong></h6>
        </Paper>
      ))}
    </>
  );
}
