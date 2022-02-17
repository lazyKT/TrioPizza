import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Form, Row, Col, Image } from 'react-bootstrap';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { getPromoDetails, deletePromoCode } from '../../networking/productRequests';


export default function EditPromotion ({id, backToPromoList}) {

  const [ message, setMessage ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ promo, setPromo ] = useState({
    name: '',
    description: '',
    product: '',
    type: '',
    amount: 0.00,
    expiry_date: ''
  });
  const [ loading, setLoading ] = useState(true);

  const { userInfo } = useSelector(state => state.userCookie);

  const handleOnChange = (e) => {
    setPromo({
      ...promo,
      [e.target.name] : e.target.value
    });
  };


  const handleOnSubmit = async (e) => {
    try {
      e.preventDefault();

      const { data, error, message } = await deletePromoCode(id, userInfo.token);

      if (error) throw new Error(message);

      backToPromoList();
    }
    catch (error) {
      setError(error.message);
    }
  };


  const getPromoDetailsById = async (signal) => {
    try {
      const { data, error, message } = await getPromoDetails(id, userInfo.token, signal);

      if (error)
        throw new Error(message);

      setPromo({
        description: data.description,
        product: data.product_name,
        type: data.type,
        amount: data.amount,
        expiry_date: (new Date(data.expiry_date)).toDateString()
      });
    }
    catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    if (userInfo && id) {
      (async () => await getPromoDetailsById (abortController.signal))();
    }

    return () => abortController.abort();
  }, [userInfo, id, backToPromoList]);

  return (
    <>
      <Button
        onClick={backToPromoList}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>

      <Paper sx={{ paddingTop: '20px', paddingBottom: '50px'}}>
        <FormContainer>
          <h4>Edit Promo Code</h4>
          {message && <Message variant='info'>{message}</Message>}
          {error && <Message variant='danger'>{error}</Message>}

          <Form onSubmit={handleOnSubmit}>

            <Form.Group controlId='name' className='mb-2'>
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Promo Code Name"
                name='name'
                value={promo.product}
                onChange={handleOnChange}
                disabled={true}
              />
            </Form.Group>

            <Form.Group controlId='amount' className="mb-2">
              <Form.Label>Promotion Expiry Date</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Promotion Expiry Date"
                name='expiry_date'
                value={promo.expiry_date}
                onChange={handleOnChange}
                readonly
                disabled={true}
              />
            </Form.Group>

            <Form.Group controlId='description' className='mb-2'>
              <Form.Label>Promo Code Description</Form.Label>
              <Form.Control
                as='textarea'
                required
                type="text"
                placeholder="Enter Promo Code Description"
                name='description'
                value={promo.description}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='type' className='mb-2'>
              <Form.Label>Promotion Type</Form.Label>
              <Form.Control
                as="select"
                required
                type="text"
                placeholder="Tasty Pizza with Pineapple"
                name='type'
                value={promo.type}
                onChange={handleOnChange}
                required
              >
                <option value=''>Select Type</option>
                <option value='cash-off'>Cash Off</option>
                <option value='percent-off'>Percentage Off</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId='amount' className="mb-3">
              <Form.Label>Promotion Amount</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Promoted Amount/Percentage (Decimal Numbers Only)"
                name='amount'
                value={promo.amount}
                onChange={handleOnChange}
                required
              />
            </Form.Group>

            <Button
              variant="contained"
              color="error"
              type="submit"
              endIcon={<DeleteIcon/>}
            >
              Delete Promo Code
            </Button>

          </Form>
        </FormContainer>
      </Paper>

    </>
  )
}
