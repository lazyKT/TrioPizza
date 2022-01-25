import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Button, ListGroup, Alert } from 'react-bootstrap';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { getReservationById, editReservationById } from '../../networking/reservationRequests';



const styles = {
  subTitle: {
    marginBottom: '10px',
    marginTop: '10px',
    fontSize: '17px',
    fontWeight: '600'
  },
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


export default function ReservationScreen ({reservation, backToList}) {

  const { userInfo } = useSelector(state => state.userCookie);

  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);


  const cancelOnClick = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const body = { status : 'cancel'};
      const { error, message } = await editReservationById (reservation._id, body, userInfo.token);

      if (error) {
        setError(message);
      }
      else {
        backToList();
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  // useEffect(() => {
  //
  //   const abortController = new AbortController();
  //
  //   if (userInfo && reservationId) {
  //     (async () =>
  //       await fetchReservationById(reservationId, userInfo.token, abortController.signal)
  //     )()
  //   }
  //   else {
  //     history.push('/');
  //   }
  //
  //
  //   return (() => {
  //     abortController.abort();
  //   });
  //
  // }, [userInfo, reservationId, history]);


  useEffect(() => {
    setLoading(false);
  }, [reservation, error]);


  return (
    <>
      <MaterialButton
        startIcon={<ArrowBackIcon/>}
        sx={{marginBottom: '20px'}}
        onClick={() => backToList()}
      >
        Back
      </MaterialButton>
      <Card className='m-2'>
        <Card.Body>
          { loading && <Loader /> }
          { error && <Message variant='danger'>{error}</Message> }
          {
            reservation && (
              <>
                <h4>Reservation # {reservation._id}</h4>
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

                <p style={styles.subTitle}>Customer Details:</p>
                <Row>
                  <Col>
                    <span>Name : </span>
                    { reservation.customer.name}, { reservation.customer.username}
                  </Col>
                  <Col>
                    <span>Contact : </span>
                    { reservation.customer.mobile}
                  </Col>
                </Row>

                <p style={styles.subTitle}>Pre-Order:</p>
                <ListGroup variant='flush'>
                  { reservation.preOrder ? (
                    <>
                      {reservation.preOrder.items.map( item => (
                        <h6>{item.name}</h6>
                      ))}
                    </>
                  ) : (
                    <Alert variant='info'>
                      N/A
                    </Alert>
                  )}
                </ListGroup>

                { reservation.status === 'active' && (
                  <Button
                    variant='danger'
                    className='mt-1'
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
    </>
  );
}
