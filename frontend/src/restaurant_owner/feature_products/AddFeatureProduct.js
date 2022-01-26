import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Container, Row, Col, Image, Button } from 'react-bootstrap';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddBoxIcon from '@mui/icons-material/AddBox';

import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { listRestaurantProducts } from '../../actions/productActions';
import { addToFeatureProducts } from '../../networking/productRequests';



function ProductCard({ product, add }) {
    return (
        <Card className="p-2 rounded">
            <Image
              style={{ height: '230px'}}
              src={product.image} alt={product.name}
            />

            <Card.Body>
              <h6 style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                {product.name}
              </h6>
              <h6>${product.price}</h6>
              <Button className="mt-1 py-1 w-100" variant='danger'
                onClick={add}
              >
                <AddBoxIcon/>
              </Button>
            </Card.Body>
        </Card>
    );
}


export default function AddFeatureProduct ({backToFeatureProductList}) {

  const [ unfeatureProducts, setUnfeaturedProducts ] = useState(null);
  const [ featureError, setFeatureError ] = useState(null);

  const dispatch = useDispatch();
  const { empty, restaurantInfo } = useSelector(state => state.restaurant);
  const { userInfo } = useSelector(state => state.userCookie);
  const { loading, error, products } = useSelector(state => state.productList);

  const addToFeatureProduct = async (product) => {
    try {
      const { data, error, message } = await addToFeatureProducts(
        {
          product: product._id,
          restaurant: restaurantInfo._id
        },
        userInfo.token
      );

      if (error) {
        setFeatureError(message);
      }
      else {
        backToFeatureProductList();
        setFeatureError(null);
      }
    }
    catch (error) {
      setFeatureError(error.message);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    if (userInfo && !empty && restaurantInfo)
      dispatch( listRestaurantProducts(restaurantInfo._id, abortController.signal) );

    return () => abortController.abort();
  }, [userInfo, empty, restaurantInfo]);

  useEffect(() => {
    if (products) {
      setUnfeaturedProducts(
        products.filter(product => product.feature === false)
      );
    }
  }, [loading, error, products, featureError]);

  return (
    <div>
      <MaterialButton
        startIcon={<ArrowBackIcon/>}
        onClick={() => backToFeatureProductList()}
      >
        Back
      </MaterialButton>
      { error && <Message variant='danger'>{error}</Message>}
      { featureError && <Message variant='danger'>{featureError}</Message>}
      { (unfeatureProducts && unfeatureProducts.length === 0) && <Message variant='info'>No Products Found!</Message>}
      { loading && <Loader/> }

      <Container>
        <Row>
          { unfeatureProducts?.map(p => (
            <Col key={p._id} xs={3} className='mb-3'>
              <ProductCard
                product={p}
                add={() => addToFeatureProduct(p)}
              />
            </Col>
          ))}
        </Row>
      </Container>

    </div>
  );
}
