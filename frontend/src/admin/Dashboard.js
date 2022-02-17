import React from 'react';
import { Container, Card } from 'react-bootstrap';

import RegisteredRestaurants from './statistic/RegisteredRestaurants';
import DriverRanking from './statistic/DriverRanking';


const styles = {
  container: {

  },
  card: {
    width: '100%',
    minWidth: '200px',
    maxWidth: '600px',
    height: '780px'
  }
}

export default function Dashboard () {

  return (
    <>
      <Container className="d-flex justify-content-start" fluid>
        <div>
          <Card className='p-2 m-1' style={styles.card}>
            <RegisteredRestaurants />
          </Card>
        </div>
        <div>
          <Card className='p-2 m-1' style={styles.card}>
            <DriverRanking />
          </Card>
        </div>
      </Container>
      <br/>
    </>
  )
}
