import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import CreateProduct from './CreateProduct';
import ProductList from './ProductList';
import Message from '../../components/Message';


export default function ProductDashboard () {

  const [ openCreateProduct, setOpenCreateProduct ] = useState(false);
  const [ message, setMessage ] = useState(null);

  const { loading, error, empty, restaurantInfo } = useSelector(state => state.restaurant);


  useEffect(() => {
    if (empty) {
      setMessage('You have not set up your restaurant yet!');
    }
  }, [loading, error, empty, restaurantInfo]);

  return (
    <>
      { message && <Message variant="info">{message}</Message>}
      { !empty &&
        <>
          { openCreateProduct ?
            <CreateProduct
              backToProductList={() => setOpenCreateProduct(false)}
            />
            : <ProductList
                addNewProduct={() => setOpenCreateProduct(true)}
              />
          }
        </>
      }
    </>
  );
}
