import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import CustomVerticalBar from '../charts/CustomVerticalBar';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchDriversOrdersDeliveries } from '../../networking/statisticRequests';


export default function DriverRanking () {

  const [ data, setData ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(false);

  const { userInfo } = useSelector(state => state.userCookie);

  const getDriversOrdersDeliveries = async (signal) => {
    try {
      const { data, error, message } = await fetchDriversOrdersDeliveries(userInfo.token, signal);

      if (error) {
        setData(null);
        setError(message);
      }
      else {
        setData(data);
        setError(null);
      }
    }
    catch (error) {
      setError(error.message);
      setData(null);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();

    if (userInfo) {
      (async () => await getDriversOrdersDeliveries(abortController.signal))();
    }

    return () => abortController.abort();
  }, [userInfo]);

  useEffect(() => {
    if (error || data)
      setLoading(false);
  }, [error, data]);

  return (
    <>
      <h5>Driver Status</h5>
      <br/><br/>
      <p>Number of Driver(s) : { data ? data.length : 0}</p>
      <br/>
      {
        loading ? <Loader />
        : (
          error ? <Message variant='danger'>{error}</Message>
          : <CustomVerticalBar
              data={data}
            />
        )
      }
    </>
  );
}
