import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Button, Card, Form, Modal } from 'react-bootstrap';
import StarIcon from '@mui/icons-material/Star';

import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { listProductDetails, createProductReview } from '../actions/productActions';
import { getProductPromotion } from '../networking/productRequests';
import { PRODUCT_CREATE_REVIEW_RESET } from '../constants/productConstants';
import { RESTAURANT_CART, CART_CLEAR_ITEMS } from '../constants/cartConstants';


function ProductScreen({ match, history }) {
    const [ qty, setQty ] = useState(1);
    const [ rating, setRating ] = useState(0);
    const [ comment, setComment ] = useState('');
    const [ showModal, setShowModal ] = useState(false);
    const [ promo, setPromo ] = useState(null);
    const [ promoError, setPromoError ] = useState(null);

    const dispatch = useDispatch()

    const { loading, error, product } = useSelector(state => state.productDetails);
    const { userInfo } = useSelector(state => state.userCookie);
    const productReviewCreate = useSelector(state => state.productReviewCreate);
    const { restaurant } = useSelector(state => state.cart);


    const {
        loading: loadingProductReview,
        error: errorProductReview,
        success: successProductReview,
    } = productReviewCreate;

    const addToCartHandler = () => {
        if (userInfo) {
          if (restaurant && product?.restaurant?._id !== restaurant) {
            setShowModal(true);
            console.log('product from different restaurants');
          }
          else {
            dispatch({
              type: RESTAURANT_CART,
              payload: product?.restaurant?._id
            });
            history.push(`/cart/${match.params.id}?qty=${qty}`);
          }
        }
        else {
          history.push('/login');
        }
    };

    const createNewCart = (e) => {
      e.preventDefault();
      console.log('createNewCart');
      dispatch({ type: CART_CLEAR_ITEMS });
      dispatch({
        type: RESTAURANT_CART,
        payload: product?.restaurant?._id
      });
      history.push(`/cart/${match.params.id}?qty=${qty}`);
    };

    const submitHandler = (e) => {
      e.preventDefault()
      dispatch(createProductReview(
          match.params.id,
          {
            rating,
            comment
          }
      ));
    };

    const backButtonClicked = (e) => {
      history.goBack();
    };

    const discountedPrice = (price, type) => {
      if (type === 'percent-off') {
        let percentage = Number(promo.amount)/100;
        return (price - (price * percentage)).toFixed(2);
      }
      else {
        return Number(price) - Number(promo.amount);
      }
    }

    const getProductPromotionDetails = async (productId, signal) => {
      try {
        const { data, error, message } = await getProductPromotion(productId, signal);

        if (error) {
          setPromoError(message);
          setPromo(null);
        }
        else {
          setPromoError(null);
          console.log(data);
          setPromo(data);
        }
      }
      catch (error) {
        setPromoError(error.message);
      }
    };


    useEffect(() => {
      if (successProductReview) {
        setRating(0)
        setComment('')
        dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
      }

      dispatch(listProductDetails(match.params.id));

    }, [dispatch, match, successProductReview, restaurant]);

    useEffect(() => {
      const abortController = new AbortController();

      if (product?._id) {

        (async () => await getProductPromotionDetails(product._id, abortController.signal))();
      }

      return () => abortController.abort();
    }, [loading, error, product]);

    return (
        <div>
            <Button
              className='btn btn-light my-3'
              onClick={backButtonClicked}
            >
              Go Back
            </Button>
            {loading ?
                <Loader />
                : error
                    ? <Message variant='danger'>{error}</Message>
                    : (
                        <div>
                          <Row>
                            <Col md={6}>
                              <Image src={product.image} alt={product.name} fluid />
                            </Col>


                            <Col md={3}>
                              { promoError && <Message variant='danger'>{promoError}</Message>}
                              <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <h3>{product.name}</h3>
                                    {
                                      product.feature &&
                                      <span style={{ color: 'gold'}}>
                                        <StarIcon fontSize="small"/> <small>featured Product</small>
                                      </span>
                                    }
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    Price:&nbsp;
                                    <span
                                      style={{
                                        textDecoration: promo?.status === 'active' ? 'line-through' : 'auto',
                                        color: promo?.status === 'active' ? 'red' : 'dark-gray'
                                      }}
                                    >
                                     ${product.price}
                                    </span>
                                    {promo?.status === 'active' &&
                                    <span>&nbsp;${discountedPrice(product.price, promo.type)}</span>
                                    }
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    Description: {product.description}
                                </ListGroup.Item>

                                {promo?.status === 'active' && (
                                  <ListGroup.Item className='text-danger'>
                                      <h5>*{promo.description}</h5>
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Col>


                            <Col md={3}>
                              <Card className='mt-5'>
                                <ListGroup variant='flush'>
                                  <ListGroup.Item>
                                    <Row>
                                        <Col>Price:</Col>
                                        <Col>
                                          {
                                            promo?.status === 'active'
                                            ? <strong>${discountedPrice(product.price, promo.type)}</strong>
                                            : <strong>${product.price}</strong>
                                          }
                                        </Col>
                                    </Row>
                                  </ListGroup.Item>

                                  {product.countInStock > 0 && (
                                      <ListGroup.Item>
                                          <Row>
                                              <Col>Qty</Col>
                                              <Col xs='auto' className='my-1'>
                                                  <Form.Control
                                                      as="select"
                                                      value={qty}
                                                      onChange={(e) => setQty(e.target.value)}
                                                  >
                                                      {

                                                          [...Array(product.countInStock).keys()].map((x) => (
                                                              <option key={x + 1} value={x + 1}>
                                                                  {x + 1}
                                                              </option>
                                                          ))
                                                      }

                                                  </Form.Control>
                                              </Col>
                                          </Row>
                                      </ListGroup.Item>
                                  )}


                                  <ListGroup.Item>
                                      <Button
                                          onClick={addToCartHandler}
                                          className='btn-block'
                                          disabled={product.countInStock == 0}
                                          type='button'>
                                          Add to Cart
                                      </Button>
                                  </ListGroup.Item>
                                </ListGroup>
                              </Card>
                            </Col>
                          </Row>
                        </div>
                    )

            }

            <Modal show={showModal}>
              <Modal.Body>
                You already have item(s) in the cart from different store.
                Proceeding to Add to Cart will remove the item(s) and replace with current item.
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
                <Button variant="success"
                  onClick={createNewCart}
                >
                  Add to Cart
                </Button>
              </Modal.Footer>
            </Modal>
        </div >
    )
}

export default ProductScreen
