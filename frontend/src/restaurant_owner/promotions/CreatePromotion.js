import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Form } from 'react-bootstrap';
import Paper from '@mui/material/Paper';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { createNewPromotion } from '../../networking/restaurantRequests';


export default function CreatePromotion ({backToPromoList}) {

  const [ promotion, setPromotion ] = useState({
    description : '',
    type: '',
    expiry_date: '',
    amount: '',
    product: ''
  });
  const [ error, setError ] = useState(null);
  const [ success, setSuccess ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ minDate, setMinDate ] = useState(null);

  const { restaurantInfo } = useSelector(state => state.restaurant);
  const { userInfo } = useSelector(state => state.userCookie);

  const history = useHistory();

  const handleOnChange = e => {
    setPromotion({
      ...promotion,
      [e.target.name] : e.target.value
    })
  };

  const handleOnSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      if (!(new RegExp(/^\d+\.\d+$/)).test(promotion.amount))
        throw new Error('Amount must be a deimal number!');

      if (promotion?.type === '')
        throw new Error ('Invalid Promo Type!');

      const body = {
        ...promotion,
        restaurant: restaurantInfo._id
      }
      const { error, message } = await createNewPromotion (body, userInfo.token);

      if (error) {
        setError(message);
        setSuccess(null);
      }
      else {
        setError(null);
        setSuccess(`New Promotion Created!`);
      }
    }
    catch (error) {
      setError(error.message);
    }
  };


  const setMinimumDate = () => {
    const date = new Date();
    const yyyy = date.getFullYear();

    let mm = date.getMonth() + 1;
    if (mm < 10)
      mm = '0' + mm;

    let dd = date.getDate() + 1;
    if (dd < 10)
      dd = '0' + dd;
    console.log(`${yyyy}-${mm}-${dd}`);
    setMinDate(`${yyyy}-${mm}-${dd}`)
  }

  useEffect(() => {
    if (!userInfo)
      history.push('/');

    if (!restaurantInfo)
      setError('Unexpected Error Encountered! Please refresh the page!');

    setMinimumDate();
  }, [restaurantInfo, userInfo]);

  useEffect(() => {
    setLoading(false);
    if (success) {
      setPromotion({
        description : '',
        type: '',
        expiry_date: '',
        amount: '',
        product: ''
      });
    }
  }, [error, success]);

  return (
    <div>
      <Button
        onClick={backToPromoList}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Paper sx={{padding: '15px'}}>
        <FormContainer>
          <Form onSubmit={handleOnSubmit}>
            <h5>Create Promotions</h5>
            { loading && <Loader/> }
            { error && <Message variant='danger'>{error}</Message> }
            { success && <Message variant='success'>{success}</Message>}
            <Form.Group controlId='product' className='mb-2'>
              <Form.Label>Product ID</Form.Label>
              <Form.Control
                required
                type="number"
                placeholder="Enter Product ID"
                name='product'
                value={promotion.product}
                onChange={handleOnChange}
                required
              />
            </Form.Group>

            <Form.Group controlId='description' className='mb-2'>
              <Form.Label>Promotion Description</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Promotion Description"
                name='description'
                value={promotion.description}
                onChange={handleOnChange}
                required
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
                value={promotion.type}
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
                value={promotion.amount}
                onChange={handleOnChange}
                required
              />
            </Form.Group>

            <Form.Group controlId='amount' className="mb-3">
              <Form.Label>Promotion Amount</Form.Label>
              <Form.Control
                required
                type="date"
                min={minDate}
                placeholder="Enter Promotion Expiry Date"
                name='expiry_date'
                value={promotion.expiry_date}
                onChange={handleOnChange}
                required
              />
            </Form.Group>

            <Button
              type='submit'
              variant='contained'
              color='primary'
            >
              Create
            </Button>
          </Form>
        </FormContainer>
      </Paper>
    </div>
  );
}
