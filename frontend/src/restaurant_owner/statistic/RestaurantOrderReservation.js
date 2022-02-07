import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';


import { fetchRestaurantsTimelineStats } from '../../networking/statisticRequests';
import LineChart from '../charts/LineChart';
import Loader from '../../components/Loader';
import Message from '../../components/Message';


const dummyData = [
  {
    count: 20,
    month: '2022-01-01'
  },
  {
    count: 10,
    month: '2022-02-01'
  },
  {
    count: 6,
    month: '2022-03-01'
  },
  {
    count: 13,
    month: '2022-06-01'
  }
];

const dummyData2 = [
  {
    count: 30,
    month: '2022-01-01'
  },
  {
    count: 25,
    month: '2022-02-01'
  },
  {
    count: 36,
    month: '2022-03-01'
  },
  {
    count: 53,
    month: '2022-04-01'
  },
  {
    count: 53,
    month: '2022-05-01'
  },
  {
    count: 43,
    month: '2022-06-01'
  },
];


export default function RestaurantOrderReservation () {

  const [ reservations, setReservations ] = useState(null);
  const [ orders, setOrders ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantInfo } = useSelector(state => state.restaurant);

  const getRestaurantsTimelineStats = async (type, signal) => {
    try {
      const { data, error, message } = await fetchRestaurantsTimelineStats(
        restaurantInfo._id,
        type,
        'month',
        userInfo.token,
        signal
      );

      if (error) {
        console.error(message);
        setError(message);
        setReservations(null);
      }
      else {
        if (type === 'reservations')
          setReservations(data);
        else if (type === 'orders')
          setOrders(data);
        setError(null);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  useEffect(() => {
    const abortController1 = new AbortController();
    const abortController2 = new AbortController();

    if (userInfo && restaurantInfo) {
      (async () => {
        await getRestaurantsTimelineStats('orders', abortController1.signal);
        await getRestaurantsTimelineStats('reservations', abortController2.signal);
      })();
    }

    return () => {
      abortController1.abort();
      abortController2.abort();
    };
  }, [userInfo, restaurantInfo]);

  useEffect(() => {
    setLoading(false);
  }, [error, reservations, orders]);

  return (
    <>
      <h6>Restaurant Orders & Reservation Statistic</h6>
      {
        loading ? <Loader />
        : (
          error ? <Message variant='danger'>{error}</Message>
          : (
            <LineChart
              data1={dummyData}
              data2={dummyData2}
            />
          )
        )
      }
    </>
  );
}
