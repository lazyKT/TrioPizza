import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Button, Card } from 'react-bootstrap';

import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { createContactSupportRequest } from '../networking/supportRequests';


const styles = {
  header: {
    fontSize: '22px',
    fontWeight: '600',
    textDecoration: 'underline'
  }
};

export default function SupportScreen ({history}) {

  const [ report, setReport ] = useState({
    email: '',
    type: '',
    headline: '',
    content: ''
  });
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ message, setMessage ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);

  const handleOnChange = (e) => {
    setReport({
      ...report,
      [e.target.name] : e.target.value
    });
  };

  const createSupportRequest = async (e) => {
    try {
      setLoading(true);

      e.preventDefault();

      const { data, error, message } = await createContactSupportRequest(report);

      if (error) {
        setError(message);
        setMessage(null);
      }
      else {
        setMessage('Successfully Sumitted!');
        setError(null);
      }
    }
    catch (error) {
      setError(error.message);
      setMessage(null);
    }
  }

  useEffect(() => {
    if (userInfo) {
      setReport({
        ...report,
        email : userInfo.username
      })
    }
    else {
      setReport({
        ...report,
        email : ''
      });
    }
  }, [userInfo]);

  useEffect(() => {
    if (error || report)
      setLoading(false);
  }, [error, report]);

  useEffect(() => {
    if (message) {
      setReport({
        email : userInfo ? userInfo.email : '',
        type : '',
        headline : '',
        content : ''
      });
    }
  }, [message]);

  return (
    <>
      <FormContainer>
        <p style={styles.header}>Contact Us :)</p>
        <Form onSubmit={createSupportRequest}>
          {message && <Message variant='success'>{message}</Message>}
          {error && <Message variant='danger'>{error}</Message>}
          {loading && <Loader />}
          <Form.Group controlId='email' className="mt-2">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Enter Email Address"
              name='email'
              value={report.email}
              onChange={handleOnChange}
              disabled={userInfo && userInfo.username !== null}
            />
          </Form.Group>

          <Form.Group controlId='type' className="mt-2">
            <Form.Label>Contact Matter</Form.Label>
            <Form.Control
              as="select"
              onChange={handleOnChange}
              name="type"
              value={report.type}
              required
            >
              <option value=''>Select Enquiry Type</option>
              <option value="enquiry">Enquiry</option>
              <option value="issue">Issue</option>
              <option value="suggestion">Suggestion</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId='subject' className="mt-2">
            <Form.Label>Headline</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Please briefly describe why you contact the support team"
              name='headline'
              value={report.headline}
              onChange={handleOnChange}
            />
          </Form.Group>

          <Form.Group controlId='content' className="mt-2">
            <Form.Label>Report Content</Form.Label>
            <Form.Control
              as="textarea"
              required
              type="text"
              placeholder="Please state the problem!"
              name='content'
              value={report.content}
              onChange={handleOnChange}
            />
          </Form.Group>

          <Button
            type="submit"
            variant="success"
            className="w-100 mt-3"
          >
            Submit
          </Button>

        </Form>
      </FormContainer>
    </>
  );
}
