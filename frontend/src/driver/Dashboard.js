import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';

import { getOrdersByDriver } from '../networking/orderRequests';
import Loader from '../components/Loader';
import Message from '../components/Message';


export default function DriverDashboard () {

  const { userInfo } = useSelector(state => state.userCookie);
  const history = useHistory();

  const [ deliveries, setDeliveries ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ message, setMessage ] = useState(null);

  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo) {
      ( async () => {

        setLoading(true);

        const { error, message, data } = await getOrdersByDriver (userInfo.id, userInfo.token, abortController.signal);

        if (error) {
          setError(message);
          setDeliveries([]);
        }
        else {
          setDeliveries(data);
          setError(null);
        }
        setLoading(false);
      })()
    }
    else
      history.push('/');

    return (() => abortController.abort());
  }, [userInfo]);


  useEffect(() => {
    if (error) {
      setMessage(error);
    }
    else {
      if (deliveries.length === 0) {
        setMessage("You have not made any deliveries yet.");
      }
      else
        setMessage(null);
    }

  }, [error, loading]);


  return (
    <>
      <h4>Driver Dashboard</h4>

      <p>Welcome, {userInfo && userInfo.name}</p>
      <hr/>
      <h5>My Deliveries</h5>
      <Card className='m-3'>
        <Card.Body>
          {loading && <Loader />}
          {message && <Message variant={error ? 'danger' : 'info'}>{message}</Message>}
          {deliveries.map( (order, idx) => (
            <Card key={idx} className='mx-1 mb-2'>
              <Card.Body>
                <Row>
                  <Col>
                    <h6>Order #{order._id}</h6>
                    <p>{order.shippingAddress}</p>
                    <p>{order.user.mobile}</p>
                  </Col>
                  <Col lg={3}>
                    <h6>Status : {order.status}</h6>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    </>
  )
}
