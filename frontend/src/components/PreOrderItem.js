import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import AddBoxIcon from '@mui/icons-material/AddBox';

import { RESERVATION_ADD_PREORDER_ITEM, RESERVATION_MAKE_PREORDER } from '../constants/reservationConstants';


const styles = {
  container: {
    minHeight: '380px'
  },
  img: {
    height: '230px'
  }
}

function Product({ product }) {

  const dispatch = useDispatch();

  const addToPreOrder = (e) => {
    e.preventDefault();
    dispatch({ type: RESERVATION_MAKE_PREORDER });
    dispatch({
      type: RESERVATION_ADD_PREORDER_ITEM,
      payload: product
    });
  }

  return (
    <Card className="my-3 p-3 rounded" style={styles.container}>
      <Card.Img
        style={styles.img}
        src={`http://167.71.221.189${product.image}`}
      />

      <Card.Body>
        <Card.Title className="text-primary">
          <p style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>{product.name}</p>
          {
            product.feature ?
            <span style={{ color: 'gold'}}>
              <StarIcon fontSize="small"/> <small>featured</small>
            </span>
            : <br/>
          }
        </Card.Title>

        <Card.Text className="text-dark">
            ${product.price}
        </Card.Text>
        <Button className="mt-1 py-1 w-100" variant='danger'
          onClick={addToPreOrder}
        >
          <AddBoxIcon/>
        </Button>
      </Card.Body>
    </Card>
  );
}

export default Product
