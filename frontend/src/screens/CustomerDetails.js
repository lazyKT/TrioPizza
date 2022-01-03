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
    username: '',
    mobile: ''
  });
  const [ editing, setEditing ] = useState(false);
  const [ message, setMessage ] = useState(null);

  const history = useHistory();
  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie );
  const { loading, error, userDetails } = useSelector(state => state.userDetails);
  const { error: errorUpdate, loading: loadingUpdate, success } = useSelector( state =>
                                                                      state.userUpdateProfile);


  const handleOnChange = (e) => {
    setUser({
      ...user,
      [e.target.name] : e.target.value
    })
  }


  const handleCancelClick = (e) => {
    e.preventDefault();
    setEditing(false);
    setMessage(null);
  }


  const handleEditClick = (e) => {
    e.preventDefault();
    setEditing(true);
    setMessage(null);
  }


  const submitHandler = (e) => {
    e.preventDefault();
    const { isValidate, validateMessage } = validateOnSubmit();

    if (isValidate) {
      dispatch(updateUserProfile(user));
    }
    else {
      setMessage({
        error: true,
        text: validateMessage
      });
    }
  }


  const validateOnSubmit = () => {
    const { name, email, mobile } = user;
    if (name && name.length < 4)
      return { isValidate : false, validateMessage : 'Full Name must have at least 4 characters!'};
    else if (mobile && mobile.length !== 8)
      return { isValidate : false, validateMessage : 'Invalid Mobile Number. Mobile number must have 8 digits!' }
    else
      return { isValidate : true }
  }


  useEffect(() => {
    if (!userInfo) {
      history.push('/');
    }
    else {
      dispatch(getUserDetails(userInfo.id));
    }

    if (success) {
      setMessage({
        error: false,
        text: 'User Updated Successfully!'
      });
      setEditing(false);
    }

  }, [userInfo, success]);


  useEffect(() => {
    if (userDetails) {
      setUser({
        name: userDetails.name,
        username: userDetails.username,
        mobile: userDetails.mobile
      });
    }
  }, [userDetails, editing]);

  return (
    <>
      <h2>User Profile</h2>

      {(errorUpdate && editing) && <Message variant='danger'>{errorUpdate}</Message>}
      {error && <Message variant='danger'>{error}</Message>}
      {loading && <Loader />}
      {message && (
        <Message
          variant={ message.error ? 'danger' : 'success'}
        >
          {message.text}
        </Message>
      )}
      <Form onSubmit={submitHandler}>

          <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                  required
                  name='name'
                  placeholder='Enter name'
                  value={user.name}
                  onChange={handleOnChange}
                  readOnly={!editing}
              >
              </Form.Control>
          </Form.Group>

          <Form.Group controlId='email'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                  required
                  name='username'
                  placeholder='Enter Email'
                  value={user.username}
                  onChange={handleOnChange}
              >
              </Form.Control>
          </Form.Group>

          <Form.Group controlId='email'>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                  required
                  name='mobile'
                  placeholder='Mobile Number 1234 5678'
                  value={user.mobile}
                  onChange={handleOnChange}
                  readOnly={!editing}
              >
              </Form.Control>
          </Form.Group>

          { editing ? (
            <>
              <Button
                className='mr-1'
                variant='success'
                type='submit'
              >
                Save Changes
              </Button>
              <Button
                variant='secondary'
                className='mx-2'
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant='primary'
              onClick={handleEditClick}
            >
                Edit Profile
            </Button>
          )}

      </Form>
    </>
  );
}
