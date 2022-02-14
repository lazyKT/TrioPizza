import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Card from '@mui/material/Paper';

import RegisteredRestaurants from './statistic/RegisteredRestaurants';
import DriverRanking from './statistic/DriverRanking';


export default function Dashboard () {

  return (
    <>
      <Row>
        <Col>
          <Card sx={{padding: '10px'}}>
            <RegisteredRestaurants />
          </Card>
        </Col>
        <Col>
          <Card sx={{padding: '10px'}}>
            <DriverRanking />
          </Card>
        </Col>
      </Row>
      <br/>
    </>
  )
}
