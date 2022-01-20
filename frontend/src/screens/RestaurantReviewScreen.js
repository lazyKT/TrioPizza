import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Button, Pagination } from 'react-bootstrap';

import Loader from '../components/Loader';
import Message from '../components/Message';
import Review from '../components/Review';
import { fetchRestaurantReviews } from '../networking/restaurantRequests';


export default function RestaurantReview ({ history, location }) {

  const [ restaurantId, setRestaurantId ] = useState(null);
  const [ restaurant, setRestaurant ] = useState(null);
  const [ reviews, setReviews ] = useState(null);
  const [ page, setPage ] = useState(1);
  const [ pages, setPages ] = useState(0);
  const [ count, setCount ] = useState(0);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);


  const getRestaurantReviews = async (signal, page=1) => {
    try {
      const { data, error, message } = await fetchRestaurantReviews(restaurantId, signal, page);

      if (error) {
        setReviews(null);
        setError(message);
        setRestaurant(null);
        setPage(1);
        setPages(0);
        setCount(0);
      }
      else {
        setCount(data.count);
        setReviews(data.reviews);
        setRestaurant(data.restaurant);
        setError(message);
        setPage(data.page);
        setPages(data.pages);
      }
    }
    catch (error) {
      setError(error.message);
    }
  };


  const handlePagination = async (pageNumber) => {
    await getRestaurantReviews(null, pageNumber);
  }


  useEffect(() => {
    if (location?.search)
      setRestaurantId(Number(location.search.split('=')[1]));
    else
      setRestaurantId(-1);
  }, [location]);

  useEffect(() => {
    const abortController = new AbortController();

    if (restaurantId > 0) {
      (async () => await getRestaurantReviews(abortController.signal))();
    }
    else if (restaurantId !== null && restaurantId <= 0) {
      history.push('/');
    }

    return () => abortController.abort();
  }, [restaurantId]);

  useEffect(() => {
    if (reviews || error)
      setLoading(false);
  }, [reviews, error, page, pages, restaurant, count]);

  return (
    <Container className='p-2'>
      <Button
        className='btn-secondary bg-secondary mb-2'
        onClick={() => history.goBack()}
      >
        Back
      </Button>
      <h4>{restaurant && restaurant}</h4>
      <br/>
      <h5>Restaurant Review</h5>
      <br/>
      { loading && <Loader /> }
      { error && <Message variant='danger'>{error}</Message> }
      { reviews?.length > 0 && <h5>{`${count} review(s)`}</h5>}
      { reviews?.map (review => (
        <Review key={review._id} review={review}/>
      ))}
      { reviews?.length > 0 &&
        <Pagination>
          {[...Array(pages).keys()].map(r => (
            <Pagination.Item
              key={r}
              active={r + 1 === page}
              onClick={() => handlePagination(r + 1)}
            >
              { r + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      }
      { reviews?.length === 0 && <Message variant='info'>There is no review(s) yet.</Message>}
    </Container>
  );
}
