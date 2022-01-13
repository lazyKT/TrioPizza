import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import Loader from '../../components/Loader';
import Message from '../../components/Message';
import FormContainer from '../../components/FormContainer';
import { createRestaurant } from '../../actions/restaurantActions';


export default function NewRestaurant () {

  const [ restaurant, setRestaurant ] = useState({
    name: '',
    description: '',
    address: '',
    district: '',
    postal_code: '',
    contact_number: ''
  });
  const [ allowCreate, setAllowCreate ] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const { loading, error, empty, restaurantInfo } = useSelector(state => state.restaurant);
  const { userInfo } = useSelector(state => state.userCookie);


  const handleOnChange = (e) => {
    setRestaurant({
      ...restaurant,
      [e.target.name] : e.target.value
    });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!allowCreate) return;
    dispatch(createRestaurant(
      userInfo.token,
      {
        ...restaurant,
        owner: userInfo.id
      }
    ));
  };


  useEffect(() => {
    if (!userInfo)
      history.push('/');

    if (!empty) {
      setAllowCreate(false);
    }
    else {
      setAllowCreate(true);
    }
  }, [loading, error, empty, restaurantInfo, userInfo])

  return (
    <>
      { error && <Message variant="info">{error}</Message>}
      { loading && <Loader/> }
      { !restaurantInfo &&
        <FormContainer>
          <h4>Create Restaurant Profile</h4>
          <Form className="mt-5" onSubmit={handleOnSubmit}>
            <Form.Group className="mb-2" controlId='name'>
              <Form.Label>Restaurant Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Name of your restaurant"
                name='name'
                value={restaurant.name}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId='description'>
              <Form.Label>Restaurant Description</Form.Label>
              <Form.Control
                as="textarea"
                required
                type="text"
                placeholder="Enter your restaurant description"
                name='description'
                value={restaurant.description}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId='address'>
              <Form.Label>Address</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Address (eg. Block Num, Street etc...)"
                name='address'
                value={restaurant.address}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId='district'>
              <Form.Label>District</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="District eg. Jurong East"
                name='district'
                value={restaurant.district}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId='postal_code'>
              <Form.Label>Postal Code</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Postal Code eg. 123456"
                name='postal_code'
                value={restaurant.postal_code}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId='contact_number'>
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Contact Number eg. 12345678"
                name='contact_number'
                value={restaurant.contact_number}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload Product Image</Form.Label>
              <Form.Control type="file" />
            </Form.Group>

            <Button
              type="submit"
              variant="success"
            >
              Create Restaurant
            </Button>
          </Form>
        </FormContainer>
      }
    </>
  );
}
