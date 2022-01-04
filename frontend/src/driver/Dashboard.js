import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, Row, Col, Button, Pagination } from 'react-bootstrap';

import { getOrdersByDriver } from '../networking/orderRequests';
import Loader from '../components/Loader';
import Message from '../components/Message';


export default function DriverDashboard () {

  const { userInfo } = useSelector(state => state.userCookie);
  const history = useHistory();

  const [ deliveries, setDeliveries ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ message, setMessage ] = useState(null);


  const seeOrderDetails = (id) => {
    history.push(`/order/${id}`);
  }

  const handlePagination = async (page) => {
    await fetchOrders(userInfo.id, userInfo.token, null, page);
  }

  const fetchOrders = async (id, token, signal, page = 1) => {
    try {
      setLoading(true);

      const { error, message, data } = await getOrdersByDriver (id, token, signal, page);

      if (error) {
        setError(message);
        setDeliveries(null);
      }
      else {
        setDeliveries(data);
        setError(null);
      }
    }
    catch (error) {
      setError(error.message);
      setDeliveries(null);
    }
  }

  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo) {
      ( async () => fetchOrders(userInfo.id, userInfo.token, abortController.signal))()
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
      if (deliveries?.deliveries?.length === 0) {
        setMessage("You have not made any deliveries yet.");
      }
      else
        setMessage(null);
    }

    setLoading(false);

  }, [error, deliveries]);


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
          {deliveries?.deliveries?.map( (order, idx) => (
            <Card
              key={idx}
              className='mx-1 mb-2'
              onClick={() => seeOrderDetails(order._id)}
            >
              <Card.Body>
                <Row>
                  <Col>
                    <h6>Order #{order._id}</h6>
                    <p>{order.shippingAddress}</p>
                    <p>{order.user.mobile}</p>
                  </Col>
                  <Col lg={3}>
                    {order.status === 'progress' ? (
                      <h5 style={{
                        padding: '10px',
                        background: 'coral',
                        width: 'fit-content',
                        margin: 'auto',
                        color: 'white'
                      }}>
                        Active
                      </h5>
                    ) : (
                      <h6>Status : {order.status}</h6>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
      <Pagination>
        {[...Array(deliveries?.pages).keys()].map(p => (
          <Pagination.Item
            key={p}
            active={p+1 === deliveries?.page}
            onClick={() => handlePagination(p + 1)}
          >
            {p + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </>
  )
}
