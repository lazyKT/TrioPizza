import React, { useState, useEffect } from 'react';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { payOrder, deliverOrder } from '../actions/orderActions';
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants';
import { getOrderDetails, cancelOrder, completeOrder } from '../networking/orderRequests';

function OrderScreen({ match, history }) {

    const [sdkReady, setSdkReady] = useState(false);
    const [ order, setOrder ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    const orderId = match.params.id
    const dispatch = useDispatch();

    const { userInfo } = useSelector(state => state.userCookie);

    const toDate = (date) => {
      const dt = new Date(date);
      return `${dt.toLocaleDateString()}, ${dt.toLocaleTimeString()}`;
    };


    const calculateItemPrice = () => {
      let itemPrice = Number(order.totalPrice) - (Number(order.taxPrice) + Number(order.shippingPrice));
      return itemPrice.toFixed(2);
    }


    const deliverHandler = async (e) => {
      e.preventDefault();
      if (order && orderId) {
        setLoading(true);
        const {error, data, message} = await completeOrder(orderId, userInfo.token);
        if (error) {
          setError(message);
        }
        else {
          setOrder(data);
        }
        setLoading(false);
      }
    }

    const cancelOrderHandler = async (e) => {
      e.preventDefault();
      if (order && orderId) {
        setLoading(true);
        const {error, data, message} = await cancelOrder(orderId, userInfo.token);
        if (error) {
          setError(message);
        }
        else {
          setOrder(data);
        }
        setLoading(false);
      }
    }

    const handleBackButtonClick = () => {
      history.goBack();
    }


    useEffect(() => {

      const abortController = new AbortController();

      if (userInfo && orderId) {
        (async () => {
          const { error, message, data } = await getOrderDetails(orderId, userInfo.token, abortController.signal);
          if (error) {
            setError(message);
          }
          else {
            setOrder(data);
          }
          setLoading(false);
        })();
      }

      if (!userInfo) {
        history.push('/');
      }

      return (() => abortController.abort());

    }, [userInfo]);

    useEffect(() => {
      if (error) {
        setOrder(null);
      }
    }, [error]);

    return loading ? (
        <Loader />
    ) : (
      order ? (
        <div>
          <MaterialButton
            onClick={handleBackButtonClick}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </MaterialButton>
            <h1>Order: #{order._id}</h1>
            <Row>
                <Col md={8}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p><strong>Name: </strong> {order.user.name}</p>
                            <p><strong>Email: </strong><a href={`mailto:${order.user.username}`}>{order.user.username}</a></p>
                            <p>
                                <strong>Delivered Address: </strong>
                                {order.shippingAddress}
                            </p>
                            <p><strong>Mobile: </strong>{order.user.mobile}</p>

                            <Message variant='info'>{ order.status }</Message>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Method: </strong>
                                {order.paymentMethod}
                            </p>
                            {order.isPaid ? (
                                <Message variant='success'>Paid on {toDate(order.paidAt)}</Message>
                            ) : (
                                    <Message variant='warning'>Not Paid</Message>
                                )}

                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {order.orderItems.length === 0 ? <Message variant='info'>
                                Order is empty
                    </Message> : (
                                    <ListGroup variant='flush'>
                                        {order.orderItems.map((item, index) => (
                                            <ListGroup.Item key={index}>
                                                <Row>
                                                    <Col md={2}>
                                                        <Image style={{width: '50px', height: '50px'}}
                                                          src={item.product.image} alt={item.name} fluid rounded />
                                                    </Col>

                                                    <Col>
                                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                    </Col>

                                                    <Col md={4}>
                                                        {item.qty} X ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                        </ListGroup.Item>

                    </ListGroup>

                </Col>

                <Col md={4}>
                    <Card>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Items:</Col>
                                    <Col>
                                      ${calculateItemPrice()}
                                    </Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping:</Col>
                                    <Col>${order.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax:</Col>
                                    <Col>${order.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Total:</Col>
                                    <Col>${order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                        </ListGroup>
                        {userInfo && userInfo.isAdmin &&
                            order.isPaid && !order.isDelivered && order.status === 'progress' && (
                            <ListGroup.Item>
                                { order.driver && <Button
                                    type='button'
                                    className='btn btn-block'
                                    onClick={deliverHandler}
                                >
                                    Mark As Delivered
                                </Button>}

                                <Button
                                    type='button'
                                    className='btn btn-block btn-secondary'
                                    onClick={cancelOrderHandler}
                                >
                                    Cancel Order
                                </Button>

                            </ListGroup.Item>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
      )
      : <Message variant='danger'>{error}</Message>
    )

}

export default OrderScreen
