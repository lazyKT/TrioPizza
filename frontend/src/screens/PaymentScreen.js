import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import { savePaymentMethod } from '../actions/cartActions';


function validatePaymentMethod (method, card) {
  if (method === 'Visa' || method === 'Master') {
    if (!card.name || card?.name === '')
      return { error: true, message: 'Name on Card is required!'}
    else if (!card.cardNumber || card?.cardNumber < 16)
      return { error: true, message: 'Invalid Card Number!'}
    else if (!card.ccv || card?.ccv < 3)
      return { error: true, message: 'Invalid CCV!'}
  }
  return { error: false };
}


function PaymentScreen({ history }) {

    const { shippingAddress } = useSelector(state => state.cart);
    const { userInfo } = useSelector(state => state.userCookie);

    const dispatch = useDispatch()

    const [ paymentMethod, setPaymentMethod ] = useState('');
    const [ card, setCard ] = useState({
      name: '',
      cardNumber: '',
      ccv: ''
    });
    const [ error, setError ] = useState(null);
    const [ showLogin, setShowLogin ] = useState(true);


    const handleOnChange = e => {
      setError(null);
      setPaymentMethod(e.target.value);
    }

    const handleCardNumberChange = (e) => {
      const rgx = new RegExp(/^\d+$/);
      if (e.target.value.length > 16)
        return;
      if (e.target.value === '' || rgx.test(e.target.value))
        setCard({...card, cardNumber: e.target.value});
    };

    const setCCV = (e) => {
      console.log(e.target.key);
      const rgx = new RegExp(/^\d+$/);
      if (e.target.value.length > 3)
        return;
      if (e.target.value === '' || rgx.test(e.target.value))
        setCard({...card, ccv: e.target.value});
    }

    const submitHandler = (e) => {
        e.preventDefault();
        const { error, message } = validatePaymentMethod(paymentMethod, card);
        if (error) {
          setError(message);
          return;
        }
        dispatch(savePaymentMethod(paymentMethod));
        history.push('/placeorder');
    }

    useEffect(() => {
      if (userInfo)
        setShowLogin (false);
      else
        setShowLogin (true);
    }, [userInfo]);

    useEffect(() => {
      if (!shippingAddress.address) {
          history.push('/shipping')
      }
    }, [shippingAddress, error]);

    return (
        <FormContainer>
          <CheckoutSteps step1={showLogin} step2 step3 />

          <Form onSubmit={submitHandler}>
            { error && <Message variant='danger'>{error}</Message> }
            <Form.Label as='legend'>Select Method</Form.Label>
            <Form.Group className="mb-2">
              <Col>
                <Form.Check
                  type='radio'
                  label='Visa'
                  id='Visa'
                  name='paymentMethod'
                  value='Visa'
                  onChange={handleOnChange}
                  checked={paymentMethod === 'Visa'}
                />
              </Col>
            </Form.Group>

            <Form.Group className="mb-2">
              <Col>
                <Form.Check
                  type='radio'
                  label='Master Card'
                  id='master'
                  name='paymentMethod'
                  value='Master'
                  onChange={handleOnChange}
                  checked={paymentMethod === 'Master'}
                />
              </Col>
            </Form.Group>

            <Form.Group className="mb-2">
              <Col>
                <Form.Check
                  type='radio'
                  label='Cash on Delivery'
                  id='paypal'
                  name='paymentMethod'
                  onChange={handleOnChange}
                  value='Cash'
                  checked={paymentMethod === 'Cash'}
                  />
              </Col>
            </Form.Group>

            {
              (paymentMethod === 'Master' || paymentMethod === 'Visa') &&
              <Card className="my-3 p-3">
                <Form.Group controlId='name' className="mb-2">
                  <Form.Label>Name On Card</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Name on Card"
                    name='name'
                    value={card.name}
                    onChange={(e) => setCard({...card, name: e.target.value})}
                  />
                </Form.Group>

                <Form.Group controlId='cardNumber' className="mb-2">
                  <Form.Label>Card Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Card Number"
                    name='cardNumber'
                    value={card.cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </Form.Group>

                <Form.Group controlId='ccv' className="mb-2">
                  <Form.Label>CCV</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="CCV"
                    name='ccv'
                    value={card.ccv}
                    onChange={setCCV}
                  />
                </Form.Group>
              </Card>
            }

            <Button className="mt-2" type='submit' variant='primary'>
              Continue
            </Button>
          </Form>
        </FormContainer>
    )
}

export default PaymentScreen
