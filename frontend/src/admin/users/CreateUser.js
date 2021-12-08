import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { register } from '../../actions/userActions';


export default function CreateUser ({backToUserList}) {

  const [ user, setUser ] = useState({
    name: '',
    username: '',
    password: '',
    mobile: '',
    type: ''
  });

  const dispatch = useDispatch();
  const userRegister = useSelector(state => state.userRegister);
  const { error, loading, userInfo } = userRegister;


  const handleBackButtonClick = (event) => {
    event.preventDefault();
    console.log(handleBackButtonClick);
    backToUserList();
  }


  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setUser({
      ...user,
      [name] : value
    });
  }

  const createNewUser = (event) => {
    event.preventDefault();
    dispatch(register(user));
  }


  useEffect(() => {
    console.log(userInfo);
    if (userInfo) {
      // after successful user creation, redirect back to user list page
      backToUserList();
    }
  }, [userInfo]);

  return (
    <>
      <Button
        onClick={handleBackButtonClick}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Paper
        sx={{ padding: '20px', paddingBottom: '50px'}}
      >
        <FormContainer>
          <h4>Create New User</h4>
          {error && <Message variant='danger'>{error}</Message>}
          {loading && <Loader />}
          <Form onSubmit={createNewUser}>

            <Form.Group controlId='name'>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Full Name"
                name='name'
                value={user.name}
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

            <Form.Group controlId='mobile'>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Mobile Number"
                name='mobile'
                value={user.mobile}
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
                required
              >
                <option>Select User Type</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
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
