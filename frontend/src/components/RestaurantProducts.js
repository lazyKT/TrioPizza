import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';

import Product from './Product';
import Message from './Message';
import Loader from './Loader';
import Paginate from './Paginate';
import { getRestaurantProducts } from '../networking/productRequests';



export default function RestaurantProducts ({restaurantId, location}) {

  const [ product, setProduct ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);


  const fetchProductsByRestaurantId = async (restaurantId, signal) => {
    try {

      const page = location.search ? Number(location.search.split('=')[2]) : 1;
      const { data, error, message } = await getRestaurantProducts(restaurantId, signal, page);

      if (error) {
        setError(message);
      }
      else {
        setError(null);
        setProduct(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    (async () => await fetchProductsByRestaurantId(restaurantId, abortController.signal))()

    return (() => {
      if (abortController) abortController.abort();
    });

  }, [restaurantId, location]);


  useEffect(() => {
    setLoading(false);
  }, [error, product])

  return (
    <>
      <h4>{product?.count ? product.count : '0'} Product(s)</h4>
      { loading && <Loader/> }
      { error && <Message variant='danger'>{error}</Message>}
      { product &&
        <div>
            <Row>
                {product.products.map(product => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                        <Product product={product} />
                    </Col>
                ))}
            </Row>
            <Paginate page={product.page} pages={product.pages} keyword="" />
        </div>
      }
    </>
  )
}
