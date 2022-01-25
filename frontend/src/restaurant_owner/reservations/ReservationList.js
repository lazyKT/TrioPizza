import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


import Loader from '../../components/Loader';
import Message from '../../components/Message';


export default function ReservationList ({viewType, dateTime, backToDashboard}) {

  const [ reservations, setReservations ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(null);

  const history = useHistory();
  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantInfo } = useSelector(state => state.restaurant);


  useEffect(() => {
    if (!restaurantInfo || !userInfo)
      history.push('/');
  }, [restaurantInfo, userInfo]);

  useEffect(() => {
    const abortController = new AbortController();


    return () => abortController.abort();
  }, [viewType, dateTime, backToDashboard]);

  return (
    <>
      <MaterialButton
        startIcon={<ArrowBackIcon/>}
        sx={{marginBottom: '20px'}}
        onClick={() => backToDashboard()}
      >
        Back
      </MaterialButton>
      <h5>Reservation(s) on {dateTime}</h5>
      { error && <Message variant='danger'>{error}</Message> }
      { loading && <Loader /> }
    </>
  );
}
