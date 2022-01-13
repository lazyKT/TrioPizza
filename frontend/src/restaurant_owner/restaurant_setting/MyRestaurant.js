import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Row, Col } from 'react-bootstrap';

import RestaurantDetails from './RestaurantDetails';
import LocationContact from './LocationContact';
import NewRestaurant from './NewRestaurant';
import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { updateRestaurantInfo } from '../../actions/restaurantActions';


const styles = {
  link: {
    marginTop : '15px',
    marginBottom : '10px',
    color: 'gray',
    '&:hover': {
      color: 'black',
      cursor: 'pointer'
    },
  }
}



function renderContent (content) {
  if (content === 'details')
    return <RestaurantDetails />;
  else if (content === 'location')
    return <LocationContact />;
  else
    return <Message variant="info">Unexpected Error! Please refresh the page.</Message>;
}


export default function MyRestaurant () {

  const [ content, setContent ] = useState(null);

  const { loading, error, empty, restaurantInfo } = useSelector(state => state.restaurant);

  useEffect(() => {
    if (empty) {
      setContent(null)
    }
    else if (!empty && restaurantInfo) {
      setContent('details');
    }

  }, [loading, error, empty, restaurantInfo])

  return (
    <Paper sx={{padding: '15px'}}>
      { (restaurantInfo && !empty)
        ? (<Row>
          <Col sm="2">
          <Typography onClick={() => setContent('details')}
            variant='subtitle1'
            sx={{
              ...styles.link,
              color: content === 'details' ? 'black' : 'gray'
            }}
          >
            Restaurant Details
          </Typography>
          <Typography onClick={() => setContent('location')}
            variant='subtitle1'
            sx={{
              ...styles.link,
              color: content === 'location' ? 'black' : 'gray'
            }}
          >
            Loacation & Contact
          </Typography>
          </Col>
          <Col sm="10">
            { renderContent(content) }
          </Col>
        </Row>)
        : <NewRestaurant />
      }
    </Paper>
  );
}
