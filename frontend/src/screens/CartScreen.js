import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MaterialButton from '@mui/material/Button';
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Message from '../components/Message';
import { addToCart, removeFromCart, changeQty } from '../actions/cartActions';

function CartScreen({ match, location, history }) {
    const productId = match.params.id
    const qty = location.search ? Number(location.search.split('=')[1]) : 1;
    const dispatch = useDispatch();

    const { userInfo } = useSelector(state => state.userCookie);

    const { cartItems } = useSelector(state => state.cart);

    useEffect(() => {
      if (!userInfo) {
        history.push('/');
      }
    }, [history, userInfo, cartItems]);


    const removeFromCartHandler = (id) => {
      dispatch(removeFromCart(id))
    }

    const checkoutHandler = () => {
        if (userInfo)
          history.push('/shipping');
        else
          history.push('/login?redirect=shipping');
    }

    return (
      <div>
        <MaterialButton
          onClick={() => history.goBack()}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </MaterialButton>
        <Row>
            <Col md={8}>
                <h1>Shopping Cart</h1>
                {cartItems.length === 0 ? (
                    <Message variant='info'>
                        Your cart is empty <Link to='/'>Go Back</Link>
                    </Message>
                ) :
                (
                  <ListGroup variant='flush'>
                      <Message variant='info'>Please do not refresh the browser.</Message>
                      {cartItems.map(item => (
                          <ListGroup.Item key={item.product}>
                              <Row>
                                  <Col md={2}>
                                      <Image
                                        style={{height: '75px', width: '80px'}}
                                        src={item.image}
                                        alt={item.name}
                                        fluid rounded
                                      />
                                  </Col>
                                  <Col md={3} className="d-flex align-items-center">
                                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                                  </Col>

                                  <Col md={2}>
                                      ${item.price}
                                  </Col>

                                  <Col md={3}>
                                    <Form.Control
                                        as="select"
                                        value={item.qty}
                                        onChange={(e) => dispatch(changeQty(item.product, parseInt(e.target.value)))}
                                    >
                                      <option value={1}>1</option>
                                      <option value={2}>2</option>
                                      <option value={3}>3</option>
                                      <option value={4}>4</option>
                                      <option value={5}>5</option>
                                      <option value={6}>6</option>
                                    </Form.Control>
                                  </Col>

                                  <Col md={1}>
                                    <Button
                                        type='button'
                                        variant='light'
                                        onClick={() => removeFromCartHandler(item.product)}
                                    >
                                        <i className='fas fa-trash'></i>
                                    </Button>
                                  </Col>
                              </Row>
                              {item.promo &&
                                <Row>
                                  <Col md={2}>

                                  </Col>
                                  <Col md={3}>
                                      <span style={{color: 'red'}}>*Promotion Applied</span>
                                  </Col>
                                </Row>
                              }
                          </ListGroup.Item>
                      ))}
                  </ListGroup>
                )}
            </Col>

            <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                            ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                        </ListGroup.Item>
                    </ListGroup>

                    <ListGroup.Item>
                        <Button
                            type='button'
                            className='btn-block'
                            disabled={cartItems.length === 0}
                            onClick={checkoutHandler}
                        >
                            Proceed To Checkout
                        </Button>
                    </ListGroup.Item>


                </Card>
            </Col>
        </Row>
      </div>
    );
}

export default CartScreen
