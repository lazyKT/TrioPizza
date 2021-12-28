import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card } from 'react-bootstrap';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Message from '../components/Message';
import Loader from '../components/Loader';
import { getReservationById } from '../networking/reservationRequests';



export default function ReservationScreen ({match, history}) {

  const { userInfo } = useSelector(state => state.userCookie);
  const reservationId = match.params.id;

  const [ reservation, setReservation ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);


  const fetchReservationById = async (reservationId, token, signal) => {
    try {
      const { message, data, error } = await getReservationById(reservationId, token, signal);

      if (error) {
        setError(message);
        setReservation(null);
      }
      else {
        setError(null);
        setReservation(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  const backButtonClick = (e) => {
    history.goBack();
  }


  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo && reservationId) {
      (async () =>
        await fetchReservationById(reservationId, userInfo.token, abortController.signal)
      )()
    }
    else {
      history.push('/');
    }


    return (() => {
      abortController.abort();
    });

  }, [userInfo, reservationId]);

  useEffect(() => {
    setLoading(false);
  }, [reservation, error]);


  return (
    <>
      <MaterialButton
        startIcon={<ArrowBackIcon />}
        onClick={backButtonClick}
      >
        Back
      </MaterialButton>
      <Card className='m-2'>
        <Card.Body>
          { loading && <Loader /> }
          { error && <Message variant='danger'>{error}</Message> }
          {
            reservation && (
              <div>
                <h4>Reservation # {reservationId}</h4>
                Date:<h5>{reservation.reservedDateTime}</h5>
              </div>
            )
          }
        </Card.Body>
      </Card>
    </>
  );
}
