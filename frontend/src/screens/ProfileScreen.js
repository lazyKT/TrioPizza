import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import Typography from '@mui/material/Typography';

import CustomerDetails from './CustomerDetails';
import SavedPlaces from './SavedPlaces';


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


function switchContents (page) {
  switch (page) {
    case 'CustomerDetails':
      return <CustomerDetails />;
    case 'SavedPlaces':
      return <SavedPlaces />;
    default:
      throw new Error('Invalid Page Choice!');
  }
}


export default function ProfileScreen({ history }) {

  const [ page, setPage ] = useState('CustomerDetails');

  const { userInfo } = useSelector(state => state.userCookie);


  useEffect(() => {
    if (!userInfo) history.push('/');
  }, [userInfo]);

  return (
    <Row>
      <Col xs lg='2'>
        <Typography onClick={() => setPage('CustomerDetails')}
          variant='subtitle1' sx={styles.link}>
          Profile
        </Typography>
        { userInfo?.type === 'customer' &&
          (<Typography onClick={() => setPage('SavedPlaces')}
            variant='subtitle1' sx={styles.link}>
            Saved Places
          </Typography>)
        }
      </Col>
      <Col>
        {switchContents(page)}
      </Col>
    </Row>
  );
}
