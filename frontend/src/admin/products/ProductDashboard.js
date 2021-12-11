import React, { useState } from 'react';

import CreateProduct from './CreateProduct';
import ProductList from './ProductList';


export default function ProductDashboard () {

  const [ openCreateProduct, setOpenCreateProduct ] = useState(false);

  const addNewProduct = () => setOpenCreateProduct(true);

  const closeCreateProduct = () => setOpenCreateProduct(false);

  return (
    <>
      { openCreateProduct ?
        <CreateProduct
          backToProductList={closeCreateProduct}
        />
        : <ProductList
            addNewProduct={addNewProduct}
          />
      }
    </>
  );
}
