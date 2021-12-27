import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button } from 'react-bootstrap';


import FormContainer from '../components/FormContainer';
import Message from '../components/Message';
import Loader from '../components/Loader';
import ReservationSteps from '../components/ReservationSteps';
import { RESERVATION_INFO, RESERVATION_CLEAR_DATA } from '../constants/reservationConstants';


const reservationTimeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
];


export default function CreateReservation ({history}) {

  const { userInfo } = useSelector(state => state.userCookie);
  const dispatch = useDispatch();

  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ reservation, setReservation ] = useState({
    numOfPax: 1,
    date: '',
    time: ''
  });


  const handleOnChange = (e) => {
    setReservation({
      ...reservation,
      [e.target.name] : e.target.value
    });
  };


  const resetData = (e) => {
    e.preventDefault();
    setReservation({
      numOfPax: 1,
      date: '',
      time: ''
    });
    dispatch({
      type: RESERVATION_CLEAR_DATA
    });
  }


  const saveReservationInfo = (e) => {
    e.preventDefault();
    dispatch({
      type: RESERVATION_INFO,
      payload: reservation
    });
  };


  useEffect(() => {
    if (!userInfo) {
      // if no credentials found in cookie, log out the account
      history.push('/');
    }
  }, [userInfo]);

  return (
    <>
      <ReservationSteps selected='reserve'/>
      <FormContainer>
        <h5>Create Reservation</h5>
        { error && <Message variant='info'>{ error }</Message>}
        { loading && <Loader/>}
        <Form>

          <Form.Group controlId='numOfPax'>
            <Form.Label>Number of Pax</Form.Label>
            <Form.Control
              type='number'
              name='numOfPax'
              value={reservation.numOfPax}
              onChange={handleOnChange}
              required
              />
          </Form.Group>

          <Form.Group controlId='date'>
            <Form.Label>Preferred Date</Form.Label>
            <Form.Control
              type='date'
              name='date'
              value={reservation.date}
              onChange={handleOnChange}
              required
              />
          </Form.Group>

          <Form.Group controlId='time'>
            <Form.Label>Time</Form.Label>
            <Form.Control
              as='select'
              name='time'
              value={reservation.time}
              onChange={handleOnChange}
              required
              >
              <option value=''>Choose Time</option>
              { reservationTimeSlots.map( (slot, idx) => (
                <option key={idx} value={slot}>{slot}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Button
            variant='primary'
            className='mr-1'
          >
            Preceed
          </Button>
          <Button
            variant='secondary'
            className='mx-1'
            onClick={resetData}
          >
            Reset
          </Button>

        </Form>
      </FormContainer>
    </>
  );
}
