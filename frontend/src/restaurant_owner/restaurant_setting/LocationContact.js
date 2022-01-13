import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, Form, Button } from 'react-bootstrap';

import Loader from '../../components/Loader';
import Message from '../../components/Message';
import FormContainer from '../../components/FormContainer';
import { updateRestaurantLocation } from '../../actions/restaurantActions';


export default function LocationContact () {

  const [ location, setLocation ] = useState(null);
  const [ editing, setEditing ] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();

  const { loading, error, empty, restaurantInfo } = useSelector(state => state.restaurant);
  const { userInfo } = useSelector(state => state.userCookie);


  const handleOnChange = (e) => {
    setLocation({
      ...location,
      [e.target.name] : e.target.value
    })
  };

  const onCancelClick = (e) => {
    e.preventDefault();
    setEditing(false);
    setLocation({
      ...restaurantInfo.locations[0]
    });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    console.log(location, restaurantInfo._id);
    dispatch(updateRestaurantLocation(
      restaurantInfo._id,
      {
        address: location.address,
        district: location.district,
        postal_code: location.postal_code,
        contact_number: location.contact_number
      },
      userInfo.token
    ));
    setEditing(false);
  };


  useEffect(() => {
    if (!userInfo)
      history.push('/');
  }, [userInfo, location]);

  useEffect(() => {
    if (restaurantInfo)
      setLocation(restaurantInfo.locations[0]);
  }, [loading, error, empty, restaurantInfo]);

  return (
    <>
      {loading && <Loader/>}
      {error && <Message variant='danger'>{error}</Message>}
      {empty && <Message variant='info'>You have not set up your restaurant yet!</Message>}
      {location && (
        <Card>
          <Card.Body>
            <Card.Title className="text-center">Restaurant Address & Contact</Card.Title>
            <FormContainer>
              <Form onSubmit={handleOnSubmit}>
                <Form.Group controlId='name'>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Address"
                    name='address'
                    value={location.address}
                    onChange={handleOnChange}
                    readOnly={!editing}
                  />
                </Form.Group>

                <Form.Group controlId='name'>
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Postal Code"
                    name='postal_code'
                    value={location.postal_code}
                    onChange={handleOnChange}
                    readOnly={!editing}
                  />
                </Form.Group>

                <Form.Group controlId='name'>
                  <Form.Label>District</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="District"
                    name='district'
                    value={location.district}
                    onChange={handleOnChange}
                    readOnly={!editing}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId='contact_number'>
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Contact Number"
                    name='contact_number'
                    value={location.contact_number}
                    onChange={handleOnChange}
                    readOnly={!editing}
                  />
                </Form.Group>

                { !editing && (
                  <Button
                    variant="primary"
                    className="mr-1"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                )}

                {editing && (
                  <div>
                    <Button
                      variant="success"
                      className="mr-1 "
                      type="submit"
                    >
                      Save
                    </Button>
                    <Button
                      variant="light"
                      className="mx-1"
                      onClick={onCancelClick}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </Form>
            </FormContainer>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
