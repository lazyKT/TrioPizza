import React from 'react';
import { Row, Col } from 'react-bootstrap';

import RegisteredRestaurants from './statistic/RegisteredRestaurants';
import DriverRanking from './statistic/DriverRanking';


export default function Dashboard () {

  return (
    <>
      <Row>

        <Col>
          <RegisteredRestaurants />
        </Col>

        <Col>
          <DriverRanking />
        </Col>

      </Row>
      <br/>
    </>
  )
}
