import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';

import PreOrderItem from '../components/PreOrderItem';
import PreOrderList from '../components/PreOrderList';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import { getRestaurantProducts } from '../networking/productRequests';
import ReservationSteps from '../components/ReservationSteps';


export default function PreOrder () {

  const [ products, setProducts ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const history = useHistory();
  const location = useLocation();
  const { userInfo } = useSelector(state => state.userCookie);
  const { info, restaurantId, restaurantName, preOrderItems } = useSelector(state => state.reservation);

  const fetchProductsByRestaurantId = async (signal) => {
    try {

      const page = location.search ? Number(location.search.split('=')[2]) : 1;
      const { data, error, message } = await getRestaurantProducts(restaurantId, signal, page);

      if (error) {
        setError(message);
        setProducts(null);
      }
      else {
        setError(null);
        setProducts(data);
      }
    }
    catch (error) {
      setError(error.message);
      setProducts(null);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    
    if (!userInfo || !restaurantId || !restaurantName)
      history.push('/');
    else
      (async () => await fetchProductsByRestaurantId(abortController.signal))();

    return () => abortController.abort();
  }, [userInfo, info, restaurantId, restaurantName, preOrderItems, history, location]);


  useEffect(() => {
    setLoading(false);
  }, [error, products]);

  return (
    <>
      <ReservationSteps
        step1={true}
        step2={true}
      />
      <h4>PreOrder Screen</h4>
      <p>You can pre-order the pizza you wanna have on the reserved date and reduce the waiting time :)</p>
      <br/>
      <Button variant='success' onClick={() => history.push('/reserve-confirm')}>
        Proceed To Confirmation
      </Button>
      <br/>
      <PreOrderList />
      <br/>
      <h4>{products?.count ? products.count : '0'} Product(s)</h4>
      { loading && <Loader/> }
      { error && <Message variant='danger'>{error}</Message>}
      { products &&
        <div>
            <Row>
                {products.products.map(product => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                        <PreOrderItem product={product} />
                    </Col>
                ))}
            </Row>
            <Paginate page={products.page} pages={products.pages} keyword="" />
        </div>
      }
    </>
  );
}
