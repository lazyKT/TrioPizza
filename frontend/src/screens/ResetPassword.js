import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';

import Loader from '../components/Loader';
import Message from '../components/Message';
import FormContainer from '../components/FormContainer';
import { resetPasswordRequest } from '../networking/userRequests';


export default function ResetPassword ({history, location}) {

  const [ data, setData ] = useState({
    email : '',
    password : '',
    confirmPassword: ''
  });
  const [ token, setToken ] = useState(null);
  const [ expiry, setExpiry ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ message, setMessage ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);


  const validateLink = () => {
    const expiry = location.search ? location.search.split('=')[2] : null;
    const _token = location.search ? location.search.split('=')[1] : null;
    console.log(_token.split('&expiry')[0]);
    setToken(_token.split('&expiry')[0]);
    setExpiry(expiry);

    if (!expiry) {
      setError('Invalid Link!');
      return;
    }
    console.log(expiry);
    const expiryDate = new Date(expiry);
    if (expiryDate < (new Date())) {
      setError("The Password Reset Link has been expired!");
    }
    else {
      setError(null);
    }
  }

  const handleOnChange = (e) => {
    setData({
      ...data,
      [e.target.name] : e.target.value
    });
  };

  const handleOnSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      if (data.password !== data.confirmPassword) {
        setError('Pssowrds do not match!');
        return;
      }

      const body = {
        email: data.email,
        password: data.password,
        token, expiry
      }

      const { message, error } = await resetPasswordRequest(body);

      if (error) {
        setError(message);
        setMessage(null);
      }
      else {
        setError(null);
        setMessage('Password changed successfully!');
        setData({
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    }
    catch (error) {
      setError(error.message);
      setMessage(null);
    }
  }

  useEffect(() => {
    if (userInfo) {
      history.push('/');
    }

    validateLink();

  }, [history, location, userInfo]);

  useEffect(() => {
    if (error) {
      setMessage(null);
      setLoading(false);
    }
  }, [error, data]);

  useEffect(() => {
    if (message) {
      setError(null);
      setLoading(false);
    }
  }, [token, message]);

  return (
    <Card className="mt-5 p-3">
        {error && <Message variant="danger">{error}</Message>}
        <FormContainer>
          <Card.Title>Please reset your password</Card.Title>
          { message && <Message variant='info'>{message}</Message> }
          <Form onSubmit={handleOnSubmit}>
            <Form.Group controlId='username' className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Email Address"
                name='email'
                value={data.email}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='password' className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Enter Password"
                name='password'
                value={data.password}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='confirmPassword' className="mb-3">
              <Form.Label>Confirm Your Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Enter Your Password Again"
                name='confirmPassword'
                value={data.confirmPassword}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="warning"
            >
              Reset Password
            </Button>

          </Form>
        </FormContainer>
    </Card>
  );
}
