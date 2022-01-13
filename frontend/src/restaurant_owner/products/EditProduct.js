import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Form } from 'react-bootstrap';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { listProductDetails, updateProduct, deleteProduct } from '../../actions/productActions';
import { PRODUCT_UPDATE_RESET, PRODUCT_DELETE_RESET } from '../../constants/productConstants';


export default function EditProduct ({editingID, backToProductList}) {

  const [ message, setMessage ] = useState('');
  const [ editingProduct, setEditingProduct ] = useState({
    name: '',
    description: '',
    price: ''
  });

  const dispatch = useDispatch();
  const { loading, product, error } = useSelector(state => state.productDetails );
  const { restaurantInfo } = useSelector(state => state.restaurant);
  const { updateError, updatedProduct } = useSelector(state => state.productUpdate);
  const { errorDelete, successDelete } = useSelector(state => state.productDelete);


  const handleOnChange = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.name] : e.target.value
    })
  };


  const handleOnSubmit = (e) => {
    e.preventDefault();
    const { error, errorMessage } = validateEditingProduct(editingProduct);
    if (error) {
      setMessage(errorMessage);
    }
    else {
      dispatch(updateProduct(
        { ...editingProduct, restaurant: restaurantInfo._id }, 
        editingID
      ));
    }
  }

  const validateEditingProduct = (editingProduct) => {
    if (editingProduct.description && editingProduct.description === '')
      return { error : true, errorMessage: 'Error: Empty Description*' };

    if (editingProduct.name && editingProduct.name === '')
      return { error : true, errorMessage: 'Error: Empty Name*' };

    if (editingProduct.price && (editingProduct.price === '' || parseInt(editingProduct.price) <= 0) )
      return { error : true, errorMessage: 'Error: Invalid Price*'};

    return { error: false };
  }

  const onDeleteProduct = (e) => {
    e.preventDefault();
    if (editingID && parseInt(editingID) > 0) {
      dispatch(deleteProduct(editingID));
    }
  }


  useEffect(() => {
    // Fetch Product Details
    dispatch(listProductDetails(editingID));
  }, [editingID, backToProductList]);

  useEffect(() => {

    if (!restaurantInfo)
      backToProductList();

    if (product) {
      setEditingProduct({
        name: product.name ? product.name : 'Failed to fetch',
        description: product.description ? product.description : 'Failed to fetch',
        price: product.price ? product.price : ''
      });
    }
    else if (error) {
      setMessage(error);
    }
  }, [product, error, restaurantInfo]);

  useEffect(() => {

    if (updatedProduct) {
      setEditingProduct({
        name: product.name,
        description: product.description,
        price: product.price
      });
      setMessage('Product Updated Successfully');
    }

    return(() => {
      if (updatedProduct) {
        dispatch({
          type: PRODUCT_UPDATE_RESET
        });
        setMessage('');
      }
    });
  }, [updatedProduct]);

  useEffect(() => {
    if (successDelete) {
      backToProductList();
    }
    else if (errorDelete) {
      setMessage(errorDelete);
    }

    return(() => {
      if (successDelete)
        dispatch({
          type: PRODUCT_DELETE_RESET
        });
    });
  }, [errorDelete, successDelete]);


  return (
    <>
      <Button
        onClick={backToProductList}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>

      <Paper sx={{ paddingTop: '20px', paddingBottom: '50px'}}>
        <FormContainer>
          <h4>Edit Product</h4>
          {message !== '' && <Message variant='info'>{message}</Message>}
          {error && <Message variant='danger'>{error}</Message>}
          <Form onSubmit={handleOnSubmit}>

            <Form.Group controlId='name'>
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Product Name"
                name='name'
                value={editingProduct.name}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>Product Description</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Product Description"
                name='description'
                value={editingProduct.description}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='price'>
              <Form.Label>Product Price</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Product Price"
                name='price'
                value={editingProduct.price}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <Button
                variant="contained"
                type="submit"
              >
                Save Changes
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={onDeleteProduct}
              >
                Delete Product
              </Button>
            </Box>

          </Form>
        </FormContainer>
      </Paper>

    </>
  );
}
