import React, { useState, useEffect } from 'react'
import { Form, Button, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import { savePaymentMethod } from '../actions/cartActions'

function PaymentScreen({ history }) {

    const cart = useSelector(state => state.cart)
    const { shippingAddress } = cart

    const dispatch = useDispatch()

    const [paymentMethod, setPaymentMethod] = useState('Visa')

    if (!shippingAddress.address) {
        history.push('/shipping')
    }

    const handleOnChange = e => {
      console.log(e.target.value);
      setPaymentMethod(e.target.value);
    }

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(savePaymentMethod(paymentMethod));
        history.push('/placeorder');
    }

    return (
        <FormContainer>
            <CheckoutSteps step1 step2 step3 />

            <Form onSubmit={submitHandler}>
                <Form.Group>
                    <Form.Label as='legend'>Select Method</Form.Label>
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

                <Form.Group>
                    <Col>
                        <Form.Check
                            type='radio'
                            label='Master Card'
                            id='master'
                            name='paymentMethod'
                            value='Master Card'
                            onChange={handleOnChange}
                            checked={paymentMethod === 'Master Card'}
                        />
                    </Col>
                </Form.Group>

                <Form.Group>
                    <Col>
                        <Form.Check
                            type='radio'
                            label='Cash on Delivery'
                            id='paypal'
                            name='paymentMethod'
                            onChange={handleOnChange}
                            value='Cash on Delivery'
                            checked={paymentMethod === 'Cash on Delivery'}
                        />
                    </Col>
                </Form.Group>

                <Button type='submit' variant='primary'>
                    Continue
                </Button>
            </Form>
        </FormContainer>
    )
}

export default PaymentScreen
