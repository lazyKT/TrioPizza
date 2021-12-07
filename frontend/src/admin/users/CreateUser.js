import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';


export default function CreateUser ({backToUserList}) {

  const [ message, setMessage ] = useState('');
  const [ user, setUser ] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    type: ''
  });

  const dispatch = useDispatch();
  const userRegister = useSelector(state => state.userRegister);
  const { error, loading, userInfo } = userRegister;

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setUser({
      ...user,
      [name] : value
    });
  }

  const createNewUser = (event) => {
    event.preventDefault();

    console.log(user);
  }


  return (
    <>
      <Button
        onClick={() => backToUserList()}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Paper
        sx={{ padding: '20px', paddingBottom: '50px'}}
      >
        <FormContainer>
          <h4>Create New User</h4>
          {message && <Message variant='danger'>{message}</Message>}
          {error && <Message variant='danger'>{error}</Message>}
          {loading && <Loader />}
          <Form onSubmit={createNewUser}>

            <Form.Group controlId='firstName'>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter First Name"
                name='firstName'
                value={user.firstName}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='lastName'>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Last Name"
                name='lastName'
                value={user.lastName}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='username'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Email Address"
                name='username'
                value={user.username}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Enter Password"
                name='password'
                value={user.password}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='type'>
              <Form.Label>User Type</Form.Label>
              <Form.Control
                as="select"
                onChange={handleOnChange}
                name="type"
                value={user.type}
              >
                <option>Select User Type</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
              </Form.Control>
            </Form.Group>

            <Button
              type="submit"
              variant="contained"
            >
              Create User
            </Button>

          </Form>
        </FormContainer>
      </Paper>
    </>
  )
}
