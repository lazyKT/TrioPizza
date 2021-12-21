import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import FormContainer from './FormContainer';


export default function AddNewPlaceForm ({user, dismissForm}) {

  const [ place, setPlace ] = useState ({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });


  const history = useHistory();


  const handleOnChange = (e) => {
    setPlace({
      ...place,
      [e.target.name] : e.target.value
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (!user)
      history.push('/');

  }, [user, dismissForm]);

  return (
    <Card className="p-2 m-2 mb-3">
      <FormContainer>
        <Form onSubmit={submitHandler}>
          <h3>Add New Place</h3>
          <Form.Group controlId='address'>
              <Form.Label>Address</Form.Label>
              <Form.Control
                  required
                  type='text'
                  placeholder='Enter address'
                  name='address'
                  value={place.address}
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
                  value={place.city}
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
                  value={place.postalCode}
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
                  value={place.country}
                  onChange={handleOnChange}
              >
              </Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary'>
              Continue
          </Button>
          <Button onClick={dismissForm}
            type='submit' variant='secondary'>
              Cancel
          </Button>
        </Form>
      </FormContainer>
    </Card>
  )
}
