import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import { Row, Col } from 'react-bootstrap';
import { Chart as CharJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';

import RestaurantOrderReservation from './statistic/RestaurantOrderReservation';
import RestaurantProductsStats from './statistic/RestaurantProductsStats';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getRestaurantInfo } from '../actions/restaurantActions';



CharJS.register(ArcElement, Tooltip, Legend);


const data = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const styles = {
  container: {

  }
}


export default function Dashboard () {

  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie);
  const { loading, error, empty, restaurantInfo } = useSelector(state => state.restaurant);


  useEffect(() => {
    const abortController = new AbortController();
    if (userInfo) {
      dispatch(getRestaurantInfo(userInfo.id, userInfo.token, abortController.signal));
    }

    return(() => {
      if (abortController) abortController.abort();
    });
  }, [userInfo]);


  return (
    <>
      { error && <Message variant='danger'>{error}</Message> }
      { empty && <Message variant='info'>Please Create Your Restaurant Profile in Restaurant Setting.</Message>}
      { loading && <Loader /> }
      { restaurantInfo && (
        <div>
          <h5>{restaurantInfo.name}</h5>
          <div>
            <h6>Product Statistics</h6>
            <RestaurantProductsStats />
          </div>
          <Row>
            <Col>
              <RestaurantOrderReservation />
            </Col>
          </Row>
        </div>
      )}
    </>
  )
}
