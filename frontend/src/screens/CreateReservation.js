import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container } from 'react-bootstrap';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


import FormContainer from '../components/FormContainer';
import ReservationSteps from '../components/ReservationSteps';
import ReviewTimeSlot from '../components/ReviewTimeSlot';
import { RESERVATION_CLEAR_DATA } from '../constants/reservationConstants';
import { saveReservationInfo } from '../actions/reservationActions';
import { getRestaurantById } from '../networking/restaurantRequests';


const reservationTimeSlots = [
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM'
];


export default function CreateReservation ({history}) {

  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantId, restaurantName } = useSelector(state => state.reservation);
  const dispatch = useDispatch();

  const [ reservation, setReservation ] = useState({
    numOfPax: 1,
    date: '',
    time: ''
  });
  const [ minDate, setMinDate ] = useState(null);
  const [ showReservationSlots, setShowReservationSlots ] = useState(false);

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
  }


  const submitHandler = (e) => {
    e.preventDefault();
    const { numOfPax, date, time } = reservation;
    if ( parseInt(numOfPax) > 1 || date !== '' || time !== '') {
      dispatch(saveReservationInfo(reservation));
      history.push('/reserve-add-ons');
    }
  };


  const setMinimumDate = () => {
    const date = new Date();
    const yyyy = date.getFullYear();

    let mm = date.getMonth() + 1;
    if (mm < 10)
      mm = '0' + mm;

    let dd = date.getDate() + 1;
    if (dd < 10)
      dd = '0' + dd;

    setMinDate(`${yyyy}-${mm}-${dd}`)
  }

  useEffect(() => {

    if (!userInfo) {
      // if no credentials found in cookie, log out the account
      history.push('/');
    }

    if (!restaurantId && !restaurantName) {
      history.push('/');
    }

    setMinimumDate();
  }, [userInfo, restaurantId, restaurantName]);


  return (
    <Container className="mt-4">
      <ReservationSteps step1={true}/>
      {
        showReservationSlots
        ? <ReviewTimeSlot
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          backToCreateReservation={() => setShowReservationSlots(false)}/>
        : (
          <>
            { (restaurantName && restaurantId) &&
              <FormContainer>
                <MaterialButton sx={{marginBottom: '10px'}}
                  startIcon={<ArrowBackIcon/>}
                  onClick={() => history.goBack()}
                >
                  Back
                </MaterialButton>
                <h4>{restaurantName}</h4>
                <h6>Create Reservation</h6>
                <Form onSubmit={submitHandler}>

                  <Form.Group controlId='numOfPax'>
                    <Form.Label>Number of Pax</Form.Label>
                    <Form.Control
                      type='number'
                      name='numOfPax'
                      min='1'
                      value={reservation.numOfPax}
                      onChange={handleOnChange}
                      required
                      />
                  </Form.Group>

                  <Button
                    className="my-2"
                    variant='success'
                    onClick={() => setShowReservationSlots(true)}
                  >
                    Check Reservation Time Slots
                  </Button>

                  <Form.Group controlId='date'>
                    <Form.Label>Preferred Date</Form.Label>
                    <Form.Control
                      type='date'
                      name='date'
                      min={minDate}
                      value={reservation.date}
                      onChange={handleOnChange}
                      required
                      />
                  </Form.Group>

                  <Form.Group controlId='time' className="mb-3">
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
                    type='submit'
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
            }
          </>
        )
      }
    </Container>
  );
}
