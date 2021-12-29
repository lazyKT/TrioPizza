import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Button, ListGroup, Alert } from 'react-bootstrap';


import Message from '../components/Message';
import Loader from '../components/Loader';
import { getReservationById, editReservationById } from '../networking/reservationRequests';



const styles = {
  active: {
    padding: '5px',
    width: 'fit-content',
    background: 'tomato',
    color: 'white'
  },
  done: {
    padding: '5px',
    background: 'green',
    width: 'fit-content',
    color: 'white'
  },
  cancel: {
    padding: '5px',
    background: 'lightgray',
    width: 'fit-content',
    color: 'black'
  }
}


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


  const cancelOnClick = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const body = { status : 'cancel'};
      const { error, message } = await editReservationById (reservationId, body, userInfo.token);

      if (error) {
        setError(message);
      }
      else {
        history.push('/my-reservations')
      }
    }
    catch (error) {
      setError(error.message);
    }
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

  }, [userInfo, reservationId, history]);


  useEffect(() => {
    setLoading(false);
  }, [reservation, error]);


  return (
    <Card className='m-2'>
      <Card.Body>
        { loading && <Loader /> }
        { error && <Message variant='danger'>{error}</Message> }
        {
          reservation && (
            <>
              <h4>Reservation # {reservationId}</h4>
              <Row>
                <Col>
                  Date:<h5>{reservation.reservedDateTime}</h5>
                </Col>
                <Col>
                  <h6
                    style={
                      reservation.status === 'active' ? styles.active : (
                        reservation.status === 'done' ? styles.done : styles.cancel
                      )
                    }
                  >
                    <strong>{reservation.status}</strong>
                  </h6>
                  <h6>
                    <i className="fas fa-user"></i>&nbsp;
                    <strong>{reservation.num_of_pax} people</strong>
                  </h6>
                </Col>
              </Row>

              <h6>Pre-Order:</h6>
              <ListGroup variant='flush'>
                { reservation.preOrder ? (
                  <>
                    {reservation.preOrder.items.map( item => (
                      <h6>{item.name}</h6>
                    ))}
                  </>
                ) : (
                  <Alert variant='info'>
                    You have nothing in Pre-Order List.
                  </Alert>
                )}
              </ListGroup>

              { reservation.status === 'active' && (
                <Button
                  variant='danger'
                  className='mx-1'
                  onClick={cancelOnClick}
                >
                  Cancel Reservation
                </Button>
              )}
            </>
          )
        }
      </Card.Body>
    </Card>
  );
}
