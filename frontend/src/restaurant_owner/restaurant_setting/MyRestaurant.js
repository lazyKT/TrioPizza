import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { Card, Image, Button, Form, Stack } from 'react-bootstrap';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';



export default function MyRestaurant () {

  const [ restaurant, setRestaurant ] = useState(null);
  const [ editing, setEditing ] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const { userInfo } = useSelector(state => state.userCookie);
  const { error, empty, loading, restaurantInfo } = useSelector(state => state.restaurant);


  const handleOnChange = (e) => {
    setRestaurant({
      ...restaurant,
      [e.target.name] : e.target.value
    })
  }


  useEffect(() => {
    if (!userInfo) {
      history.push('/');
    }

    if (restaurantInfo)
      setRestaurant(restaurantInfo);
  }, [userInfo, error, empty, loading, restaurantInfo]);

  return (
    <>
      {loading && <Loader/>}
      {error && <Message variant='danger'>{error}</Message>}
      {empty && <Message variant='info'>You have not set up your restaurant yet!</Message>}
      {restaurant && (
        <Paper sx={{padding: '10px'}}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px'}}>
            <Image
              style={{ height: '200px', width: '300px', border: '0.4px solid gainsboro', borderRadius: '10px'}}
              src={restaurant.logo}
              alt={restaurant.name}
              onClick={() => console.log('Onclick Image')}
              fluid
            />
          </div>

          <FormContainer>
            <Form onSubmit={() => console.log('submit')}>

              <Form.Group controlId='name'>
                <Form.Label>Restaurant Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Beef Pepperoni"
                  name='name'
                  value={restaurant.name}
                  onChange={handleOnChange}
                />
              </Form.Group>

              <Form.Group controlId='description'>
                <Form.Label>Restaurant Description</Form.Label>
                <Form.Control
                  as="textarea"
                  required
                  type="text"
                  placeholder="Tasty Pizza with Pineapple"
                  name='description'
                  value={restaurant.description}
                  onChange={handleOnChange}
                />
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
      )}
    </>
  )
}
