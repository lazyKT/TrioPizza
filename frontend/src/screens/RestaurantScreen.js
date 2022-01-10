import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, ListGroup, Image } from 'react-bootstrap';

import Message from '../components/Message';
import Loader from '../components/Loader';
import { getRestaurantById } from '../networking/restaurantRequests';


export default function RestaurantScreen ({match, history}) {

  const [ restaurant, setRestaurant ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie );

  const getFullAddress = () => {
    return `${restaurant.locations[0].address}, ${restaurant.locations[0].district}, S${restaurant.locations[0].postal_code}`;
  }

  const fetchRestaurantInfo = async (id, signal) => {
    try {
      const { error, message, data } = await getRestaurantById(id, signal);

      if (error) {
        setError(message);
      }
      else {
        setError (null);
        setRestaurant(data);
        console.log(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  useEffect(() => {
    console.log('RestaurantScreen')
    const abortController = new AbortController();

    if (match) {
      (async () => await fetchRestaurantInfo(match.params.id, abortController.signal))()
    }

    return (() => {
      if (abortController) abortController.abort();
    });

  }, [history, match, userInfo]);

  useEffect(() => {
    setLoading(false);
  }, [error, restaurant]);


  return (
    <div>
      <Link to='/' className='btn btn-light my-3'>Go Back</Link>
      {loading && <Loader/>}
      {error && <Message variant='danger'>{error}</Message>}
      {restaurant &&
        <>
          <Row>

            <Col md={6}>
              <Image src={restaurant.logo} alt={restaurant.name} fluid />
            </Col>

            <Col md={3}>
              <ListGroup variant="flush">
                  <ListGroup.Item>
                      <h3>{restaurant.name}</h3>
                  </ListGroup.Item>

                  <ListGroup.Item>
                      Description: {restaurant.description}
                  </ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md={3}>
              <ListGroup className="py-3" variant="flush">
                  <ListGroup.Item>
                      <h6>Address: {getFullAddress()}</h6>
                  </ListGroup.Item>
                  <ListGroup.Item>
                      <h6>Contact: {restaurant.locations[0].contact_number}</h6>
                  </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      }
    </div>
  );
}
