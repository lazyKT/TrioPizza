import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Row, Col, Card, Image, Container, Button } from 'react-bootstrap';

import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Rating from '../../components/Rating';
import { getFeatureProducts, removeFromFeatureProducts } from '../../networking/productRequests';


function FeatureProductCard({ product, remove }) {
    return (
        <Card className="p-2 rounded">
            <Image
              style={{ height: '230px'}}
              src={product.image} alt={product.name}
            />

            <Card.Body>
              <h6>{product.name}</h6>
              <h6>${product.price}</h6>
              <Card.Text as="div">
                <div>
                    <Rating value={product.rating} text={`${product.numReviews} reviews`} color={'#f8e825'} />
                </div>
              </Card.Text>
              <Button className="mt-1 py-1 w-100" variant='danger'
                onClick={remove}
              >
                <DeleteForeverIcon/>
              </Button>
            </Card.Body>
        </Card>
    )
}


export default function FeatureProducts () {

  const [ featureProducts, setFeatureProducts ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const { restaurantInfo } = useSelector(state => state.restaurant);
  const { userInfo } = useSelector(state => state.userCookie);

  const fetchFeatureProducts = async (restaurantId, token, signal) => {
    try {
      const { data, error, message } = await getFeatureProducts(restaurantId, token, signal);

      if (error) {
        setFeatureProducts(null);
        setError(message);
      }
      else {
        setError(null);
        setFeatureProducts(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  const removeOnClick = async (featureId) => {
    try {
      setLoading(true);

      const { error, message } = await removeFromFeatureProducts(featureId, userInfo.token);

      if (error) {
        setFeatureProducts(null);
        setError(`Remove Feature Product: ${message}`);
      }
      else {
        await fetchFeatureProducts(restaurantInfo._id, userInfo.token);
      }
    }
    catch (error) {
      setError(`Remove Feature Product: ${error.message}`);
    }
  };

  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo && restaurantInfo) {
      ( async() => await fetchFeatureProducts(restaurantInfo._id, userInfo.token, abortController.signal))();
    }

    return () => abortController.abort();
  }, [userInfo, restaurantInfo]);

  useEffect(() => {
    if (error) setLoading(false);
    if (featureProducts)  setLoading(false);
  }, [error, featureProducts]);

  return (
    <div>
      <h5 style={{ marginBottom: '30px' }}>Feature Products</h5>
      { loading && <Loader/> }
      { error && <Message variant="danger">{error}</Message>}
      { featureProducts && featureProducts.length === 0
        && <Message variant="info">You Don't Have Any Feature Products!</Message>}
      <Container>
        <Row>
          { featureProducts && featureProducts.map(fp => (
            <Col key={fp._id}  xs={3}>
              <FeatureProductCard product={fp.product} remove={() => removeOnClick(fp._id)}/>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
