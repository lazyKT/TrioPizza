import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../actions/cartActions';


const styles = {
  box: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '20px'
  },
  paper: {
    borderRadius: '5px',
    padding: '15px',
    marginRight: '10px',
    '&:hover': {
      backgroundColor: '#f9f9f9',
      cursor: 'pointer'
    },
  }
}


function ShippingScreen({ history }) {

    const { shippingAddress } = useSelector(state => state.cart);
    const { userInfo } = useSelector(state => state.userCookie);

    const dispatch = useDispatch()

    const [ address, setAddress ] = useState({
      address: '',
      city: '',
      postalCode: '',
      country: ''
    });
    const [ savedAddress, setSavedAddress ] = useState(null);
    const [ error, setError ] = useState(null);


    // fetch user's saved address
    const fetchSavedAddresses = async (userId, token, signal) => {
      try {
        const { data } = await axios.get(`http://167.71.221.189/api/users/${userId}/addresses`, {
          headers: {
            'Content-Type' : 'application/json',
            Authorization : `Bearer ${token}`
          },
          signal
        });

        setSavedAddress(data);

        setError(null);
      }
      catch (error) {
        if (error.response && error.response.data.details)
          setError(error.response.data.details);
        else
          setError(error.message);
      }
    }

    const handleSavedAddressClick = (idx) => {
      // console.log(savedAddress[idx]);
      setAddress({
        address: savedAddress[idx].address,
        city: savedAddress[idx].city,
        postalCode: savedAddress[idx].postalCode,
        country: savedAddress[idx].country
      });
    }

    const handleOnChange = (e) => {
      setAddress({
        ...address,
        [e.target.name] : e.target.value
      });
    }

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(saveShippingAddress(address))
        history.push('/payment')
    }

    useEffect(() => {
      if (shippingAddress) {
        setAddress({
          address: shippingAddress.address ? shippingAddress.address : '',
          city: shippingAddress.city ? shippingAddress.city : '',
          postalCode: shippingAddress.postalCode ? shippingAddress.postalCode : '',
          country: shippingAddress.country ? shippingAddress.country : ''
        });
      }
    }, [shippingAddress]);


    useEffect(() => {
      const controller = new AbortController();

      if (history && userInfo) {
        (async () => fetchSavedAddresses(userInfo.id, userInfo.token, controller.signal))();
      }

      return(() => controller.abort());

    }, [history, userInfo]);

    return (
        <FormContainer>
            <CheckoutSteps step1 step2 />
            <h1>Shipping</h1>

            { savedAddress && (
              <>
                <h6>Saved Addresses</h6>
                <Box
                  sx={styles.box}
                >
                  {savedAddress.map( (addr, idx) => (
                    <Paper
                      sx={styles.paper}
                      key={idx}
                      onClick={() => handleSavedAddressClick(idx)}
                    >
                      {addr.name}
                    </Paper>
                  ))}
                </Box>
              </>
          )}

            <Form onSubmit={submitHandler}>
                { error && <Message variant='danger'>{error}</Message>}
                <Form.Group controlId='address'>
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter address'
                        name='address'
                        value={address.address}
                        onChange={handleOnChange}
                    >
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId='city'>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter city'
                        name='city'
                        value={address.city}
                        onChange={handleOnChange}
                    >
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId='postalCode'>
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter postal code'
                        name='postalCode'
                        value={address.postalCode}
                        onChange={handleOnChange}
                    >
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId='country'>
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter country'
                        name='country'
                        value={address.country}
                        onChange={handleOnChange}
                    >
                    </Form.Control>
                </Form.Group>

                <Button type='submit' variant='primary'>
                    Continue
                </Button>
            </Form>
        </FormContainer>
    )
}

export default ShippingScreen
