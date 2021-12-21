import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import { getUserDetails, updateUserProfile } from '../actions/userActions';
import Loader from '../components/Loader';
import Message from '../components/Message';



export default function CustomerDetails () {

  const [ user, setUser ] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const history = useHistory();
  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie );
  const { loading, error, userDetails } = useSelector(state => state.userDetails);


  const handleOnChange = (e) => {
    setUser({
      ...user,
      [e.target.name] : e.target.value
    })
  }


  const submitHandler = (e) => {
    e.preventDefault();
  }


  useEffect(() => {
    if (!userInfo) {
      history.push('/');
    }
    else {
      dispatch(getUserDetails(userInfo.id));
    }
  }, [userInfo]);


  useEffect(() => {
    if (userDetails) {
      setUser({
        name: userDetails.name,
        email: userDetails.username,
        mobile: userDetails.mobile
      });
    }
  }, [userDetails]);

  return (
    <>
      <h2>User Profile</h2>

      {error && <Message variant='danger'>{error}</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>

          <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                  required
                  type='name'
                  placeholder='Enter name'
                  value={user.name}
                  onChange={handleOnChange}
              >
              </Form.Control>
          </Form.Group>

          <Form.Group controlId='email'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                  required
                  type='email'
                  placeholder='Enter Email'
                  value={user.email}
                  onChange={handleOnChange}
              >
              </Form.Control>
          </Form.Group>

          <Form.Group controlId='email'>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                  required
                  type='mobile'
                  placeholder='Mobile Number 1234 5678'
                  value={user.mobile}
                  onChange={handleOnChange}
              >
              </Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary'>
              Update
          </Button>

      </Form>
    </>
  );
}
