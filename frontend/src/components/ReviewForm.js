import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { Form, Button, Row, Col } from 'react-bootstrap';

import FormContainer from './FormContainer';
import Loader from './Loader';
import Message from './Message';
import { createRestaurantReview } from '../networking/restaurantRequests';


const styles = {
  paper: {
    padding: '15px',
    marginTop: '15px',
    marginBottom: '25px'
  },
  ratingDiv: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rating: {
    color: '#f8e825',
    fontSize: '28px',
    margin: '10px',
    cursor: 'pointer'
  }
}


export default function ReviewForm ({restaurantId, hideForm}) {

  const [ rating, setRating ] = useState(0);
  const [ hoverValue, setHoverValue ] = useState(0);
  const [ comment, setComment ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ message, setMessage ] = useState(null);

  const history = useHistory();
  const { userInfo } = useSelector(state => state.userCookie);

  const handleOnSumit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      const body = {
        user: userInfo.id,
        restaurant: restaurantId,
        rating,
        comment
      }

      const { data, error, message } = await createRestaurantReview (body, userInfo.token);

      if (error) {
        setError(message);
        setMessage(null);
      }
      else {
        setError(null);
        setMessage('Thank You. Your review has been Successfully posted:)')
      }
    }
    catch (error) {
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userInfo)
      history.push('/');

    if (message) {
      setComment('');
      setRating(0);
      setHoverValue(0);
    }
  }, [userInfo, comment, rating, loading, error, hoverValue, message ]);

  return (
    <Paper
      sx={styles.paper}
    >
      <h4>Give Review</h4>
      <p>Your opinion matters :)</p>
      <FormContainer>
        <Form onSubmit={handleOnSumit}>
          { loading && <Loader/> }
          { message && <Message variant='success'>{message}</Message> }
          { error && <Message variant='danger'>{error}</Message>}
          <div style={styles.ratingDiv}>
            {[1, 2, 3, 4, 5].map(a => (
              <span key={a}>
                  <i
                    style={styles.rating}
                    className={ (rating || hoverValue) >= a ? 'fas fa-star' : 'far fa-star' }
                    onClick={() => setRating(a)}
                    onMouseOver={() => {console.log('over');setHoverValue(a)}}
                    onMouseLeave={() => setHoverValue(0)}
                  >

                  </i>
              </span>
            ))}
          </div>
          <Form.Group controlId="comment" className="my-2">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as='textarea'
              value={comment}
              name='comment'
              placeholder="Please leave a comment"
              onChange={e => setComment(e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={3}>
              <Button variant='success' type='submit'>Post</Button>
            </Col>
            <Col>
              <Button variant='secondary' onClick={() => hideForm()}>Cancel</Button>
            </Col>
          </Row>
        </Form>
      </FormContainer>
    </Paper>
  );
}
