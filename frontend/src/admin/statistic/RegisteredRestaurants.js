import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import CustomDoughnut from '../charts/CustomDoughnut';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchRegisteredRestaurantsStats } from '../../networking/statisticRequests';


function prepareDoughnutData (data) {
  if (data)
    return [ parseInt(data.all_restaurants) - parseInt(data.new_registered), parseInt(data.new_registered) ];
  else
    return []
}


export default function RegisteredRestaurants () {

  const [ data, setData ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);


  const getRegisteredRestaurantsStats = async (signal) => {
    try {
      const { data, error, message } = await fetchRegisteredRestaurantsStats(userInfo.token, signal);

      if (error) {
        setData(message);
        setError(null);
      }
      else {
        setError(null);
        setData(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  useEffect(() => {
    const abortController = new AbortController();

    if (userInfo) {
      (async () => await getRegisteredRestaurantsStats(abortController.signal))();
    }

    return () => abortController.abort();
  }, [userInfo]);

  useEffect(() => {
    setLoading(false);
  }, [error, data]);

  return (
    <>
      <h5>Registered Restaurant(s)</h5>
      <p>Total Restaurants : {data ? data.all_restaurants : 0}</p>
      {
        loading ? <Loader />
        : (
          error ? <Message variant='danger'>{error}</Message>
          : <CustomDoughnut
              data={prepareDoughnutData(data)}
              label={['Old Restaurants', 'New Registered Restaurants This Month']}
            />
        )
      }
    </>
  );
}
