import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import ReservationSteps from '../components/ReservationSteps';
import { createNewReservationRequest } from '../networking/reservationRequests';


export default function ReserveConfirm () {

  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);
  const { info, preOrder } = useSelector(state => state.reservation);

  const history = useHistory();


  const confirmReservationClick = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      const body = {
        user : userInfo.id,
        num_of_pax : info.numOfPax,
        reservedDateTime : `${info.date} ${info.time}`
      }

      const { error, data, message } = await createNewReservationRequest (body, userInfo.token);

      if (error) {
        setError(message);
      }
      else {
        setError(null);
        console.log(data);
      }
    }
    catch (error) {
      console.error(error.message);
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    console.log('userInfo', userInfo);
    console.log('reservation', info);
    if (!userInfo) {
      history.push('/');
    }
  }, [info, userInfo, error, loading]);

  return (
    <>
      {info &&
        <>
          <ReservationSteps
            step1={true}
            step2={true}
            step3={true}
          />
          <FormContainer>
            { error && <Message variant='danger'>{error}</Message> }
            { loading && <Loader /> }
            <h4>It's almost done!</h4>
            <p>
              Please check the below details and confirm your reservation!
              <br/>You can always change back the details by clicking on the navigation above.
            </p>
            <br/>
            Number of Pax: <h5>{info.numOfPax}</h5>
            Date: <h5>{info.date}</h5>
            Time: <h5>{info.time}</h5>
            Pre-Order: <h5>{preOrder ? '2 item(s)' : 'N.A' }</h5>
            <br/>
            <Button
              variant='primary'
              className='my-1'
              onClick={confirmReservationClick}
            >
              Confirm Reservation
            </Button>
          </FormContainer>
        </>
      }
    </>
  );
}
