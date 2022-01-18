import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Button, Card, Form, Modal } from 'react-bootstrap';

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

    const discountedPrice = (price) => {
      let percentage = Number(promo.amount)/100;
      return (price - (price * percentage)).toFixed(2);
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
                                        </ListGroup.Item>

                                        <ListGroup.Item>
                                            <Rating value={product.rating} text={`${product.numReviews} reviews`} color={'#f8e825'} />
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
                                            <span>&nbsp;${discountedPrice(product.price)}</span>
                                            }
                                        </ListGroup.Item>

                                        <ListGroup.Item>
                                            Description: {product.description}
                                        </ListGroup.Item>

                                        {promo && (
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
                                                        ? <strong>${discountedPrice(product.price)}</strong>
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

                            <Row>
                                <Col md={6}>
                                    <h4>Reviews</h4>
                                    {product.reviews.length === 0 && <Message variant='info'>No Reviews</Message>}

                                    <ListGroup variant='flush'>
                                        {product.reviews.map((review) => (
                                            <ListGroup.Item key={review._id}>
                                                <strong>{review.name}</strong>
                                                <Rating value={review.rating} color='#f8e825' />
                                                <p>{review.createdAt.substring(0, 10)}</p>
                                                <p>{review.comment}</p>
                                            </ListGroup.Item>
                                        ))}

                                        <ListGroup.Item>
                                            <h4>Write a review</h4>

                                            {loadingProductReview && <Loader />}
                                            {successProductReview && <Message variant='success'>Review Submitted</Message>}
                                            {errorProductReview && <Message variant='danger'>{errorProductReview}</Message>}

                                            {userInfo ? (
                                                <Form onSubmit={submitHandler}>
                                                    <Form.Group controlId='rating'>
                                                        <Form.Label>Rating</Form.Label>
                                                        <Form.Control
                                                            as='select'
                                                            value={rating}
                                                            onChange={(e) => setRating(e.target.value)}
                                                        >
                                                            <option value=''>Select...</option>
                                                            <option value='1'>1 - Poor</option>
                                                            <option value='2'>2 - Fair</option>
                                                            <option value='3'>3 - Good</option>
                                                            <option value='4'>4 - Very Good</option>
                                                            <option value='5'>5 - Excellent</option>
                                                        </Form.Control>
                                                    </Form.Group>

                                                    <Form.Group controlId='comment'>
                                                        <Form.Label>Review</Form.Label>
                                                        <Form.Control
                                                            as='textarea'
                                                            row='5'
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                        ></Form.Control>
                                                    </Form.Group>

                                                    <Button
                                                        disabled={loadingProductReview}
                                                        type='submit'
                                                        variant='primary'
                                                    >
                                                        Submit
                                                    </Button>

                                                </Form>
                                            ) : (
                                                    <Message variant='info'>Please <Link to='/login'>login</Link> to write a review</Message>
                                                )}
                                        </ListGroup.Item>
                                    </ListGroup>
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
