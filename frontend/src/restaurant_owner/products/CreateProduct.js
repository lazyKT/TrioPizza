import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { createProduct } from '../../actions/productActions';
import { PRODUCT_CREATE_RESET } from '../../constants/productConstants';


export default function CreateProduct ({backToProductList}) {

  const [ message, setMessage ] = useState('');
  const [ errorMsg, setErrorMsg ] = useState('');
  const [ newProduct, setNewProduct ] = useState({
    description: '',
    name: '',
    price: ''
  });

  const dispatch = useDispatch();
  const { loading, error, product } = useSelector(state => state.productCreate);
  const { restaurantInfo } = useSelector(state => state.restaurant);

  const handleBackButtonClick = (e) => {
    e.preventDefault();
    backToProductList();
  }

  const handleOnChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name] : e.target.value
    });
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('new product', newProduct);
    const { error, errorMessage } = validateNewProduct(newProduct);
    console.log(error, errorMessage);
    if (error) {
      setErrorMsg(errorMessage);
    }
    else {
      dispatch(createProduct(
        {
          ...newProduct,
          restaurant: restaurantInfo._id
        }
      ));
    }
  }

  const validateNewProduct = (newProduct) => {
    if (newProduct.description && newProduct.description === '')
      return { error : true, errorMessage: '*Empty Description*' };

    if (newProduct.name && newProduct.name === '')
      return { error : true, errorMessage: '*Empty Name*' };

    if (!(new RegExp(/^\d+(\.\d+)?$/)).test(newProduct.price))
      return { error : true, errorMessage: 'Error: Invalid Price*'};

    if (newProduct.price && (newProduct.price === '' || parseInt(newProduct.price) <= 0) )
      return { error : true, errorMessage: '*Invalid Price*'};

    return { error: false };
  }


  useEffect(() => {

    if (!restaurantInfo) {
      backToProductList();
    }

    if (product) {
      setErrorMsg('');
      setMessage(`New Product Created, ${newProduct.name}`);
      setNewProduct({
        description: '',
        name: '',
        price: '0.00'
      });
    }

    return (() => {
      if (product) {
        dispatch({
          type: PRODUCT_CREATE_RESET
        });
        setMessage('');
        setErrorMsg('');
      }
    });
  }, [product]);


  return (
    <>
      <Button
        onClick={handleBackButtonClick}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Paper sx={{ paddingTop: '20px', paddingBottom: '50px'}}>
        <FormContainer>
          <h4>Create Product</h4>
          {message !== '' && <Message variant='info'>{message}</Message>}
          {errorMsg !== '' && <Message variant='danger'>{errorMsg}</Message>}
          {loading && <Loader />}
          <Form onSubmit={handleFormSubmit}>

            <Form.Group controlId='name'>
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Beef Pepperoni"
                name='name'
                value={newProduct.name}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>Product Description</Form.Label>
              <Form.Control
                as="textarea"
                required
                type="text"
                placeholder="Tasty Pizza with Pineapple"
                name='description'
                value={newProduct.description}
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
                value={newProduct.price}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload Product Image</Form.Label>
              <Form.Control type="file" />
            </Form.Group>

            <Button
              type="submit"
              variant="contained"
            >
              Create Product
            </Button>

          </Form>
        </FormContainer>
      </Paper>
    </>
  );
}
