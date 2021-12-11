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
import { listProductDetails, updateProduct } from '../../actions/productActions';
import { PRODUCT_UPDATE_RESET } from '../../constants/productConstants';


export default function EditProduct ({editingID, backToProductList}) {

  const [ message, setMessage ] = useState('');
  const [ editingProduct, setEditingProduct ] = useState({
    name: '',
    description: '',
    price: ''
  });

  const dispatch = useDispatch();
  const { loading, product, error } = useSelector(state => state.productDetails );

  const { updateError, updatedProduct } = useSelector(state => state.productUpdate);


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
      dispatch(updateProduct(editingProduct, editingID));
    }
  }


  const validateEditingProduct = (editingProduct) => {
    if (editingProduct.description && editingProduct.description === '')
      return { error : true, errorMessage: 'Error: Empty Description*' };

    if (editingProduct.name && editingProduct.name === '')
      return { error : true, errorMessage: 'Error: Empty Name*' };

    if (editingProduct.price && (editingProduct.price === '' || parseInt(editingProduct.price) < 0) )
      return { error : true, errorMessage: 'Error: Invalid Price*'};

    return { error: false };
  }


  useEffect(() => {
    // Fetch Product Details
    dispatch(listProductDetails(editingID));
  }, [editingID, backToProductList]);

  useEffect(() => {
    if (product) {
      setEditingProduct({
        name: product.name,
        description: product.description,
        price: product.price
      });
    }
    else if (error) {
      setMessage(error);
    }
  }, [product, error]);

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
