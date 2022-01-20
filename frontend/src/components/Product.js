import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';


const styles = {
  container: {
    minHeight: '380px'
  },
  img: {
    height: '230px'
  }
}

function Product({ product }) {
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
                  ${product.price}
              </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default Product
