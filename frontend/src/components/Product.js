import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';

import { getProductPromotion } from '../networking/productRequests';

const styles = {
  container: {
    minHeight: '380px'
  },
  img: {
    height: '230px'
  }
}

function Product({ product }) {

  const [ promo, setPromo ] = useState(null);
  const [ promoError, setPromoError ] = useState(null);

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

  const discountedPrice = (price, type) => {
    if (type === 'percent-off') {
      let percentage = Number(promo.amount)/100;
      return (price - (price * percentage)).toFixed(2);
    }
    else {
      return Number(price) - Number(promo.amount);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    if (product?._id) {

      (async () => await getProductPromotionDetails(product._id, abortController.signal))();
    }

    return () => abortController.abort();
  }, [product]);

  return (
    <Card className="my-3 p-3 rounded" style={styles.container}>
      <Link to={`/product/${product._id}`}>
          <Card.Img
            style={styles.img}
            src={product.image}
          />
      </Link>

      <Card.Body>

        <Card.Title className="text-primary">
          <Link to={`/product/${product._id}`}>
            <strong>{product.name}</strong>
          </Link>
          <br/>
          {
            product.feature &&
            <span style={{ color: 'gold'}}>
              <StarIcon fontSize="small"/> <small>featured</small>
            </span>
          }
        </Card.Title>

        <Card.Text className="text-dark">
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
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Product
