import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Card, Row, Col, Button } from 'react-bootstrap';

import FormContainer from '../components/FormContainer';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { requestPasswordResetLink } from '../networking/userRequests';

const styles = {
  text: {
    fontSize: '17px',
    fontWeight: '500'
  }
}


export default function ForgotPassword ({history}) {

  const [ email, setEmail ] = useState('');
  const [ error, setError ] = useState(null);
  const [ message, setMessage ] = useState(null);
  const [ loading, setLoading ] = useState(false);

  const { userInfo } = useSelector(state => state.userCookie);

  const handleOnSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      const { data, error, message } = await requestPasswordResetLink(email);

      if (error) {
        setError(message);
        setMessage(null);
      }
      else {
        setMessage(data);
      }
    }
    catch (error) {
      setError(error.message);
      setMessage(null);
    }
  }

  useEffect(() => {
    if (userInfo)
      history.push('/');
  }, [userInfo]);

  useEffect(() => {
    if (error) {
      setLoading(false);
      setMessage(null);
    }
  }, [email, error]);

  useEffect(() => {
    if (message) {
      setLoading(false);
      setError(null);
      setEmail('');
    }
  }, [message]);

  return (
    <Card className="mt-5">
      <Card.Body>
        <FormContainer>
          { message && <Message variant='info'>{message}</Message>}
          { error && <Message variant='danger'>{error}</Message>}
          <p style={styles.text}>
            <strong>Please enter your email address.</strong><br/>
            You will receive a password reset link if your email address is registered!
          </p>
          <Form onSubmit={handleOnSubmit}>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Col sm="10">
                <Form.Control
                  placeholder="Please Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Col>
              <Col className="mt-3">
                {
                  loading ? <Loader />
                  : (
                    <Button className="my-2" variant='info' type='submit'>
                      SEND PASSWORD RESET LINK
                    </Button>
                  )
                }
              </Col>
            </Form.Group>
          </Form>
        </FormContainer>
      </Card.Body>
    </Card>
  );
}
