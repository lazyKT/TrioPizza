import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';

import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchRestaurantOrderStats } from '../../networking/statisticRequests';


const styles = {
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '15px',
  },
  box: {
    padding: '15px',
    margin: '10px',
    borderRadius: '5px',
  }
}


export default function OrdersSummary () {

  const [ data, setData ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantInfo } = useSelector(state => state.restaurant);

  const getRestaurantOrderStats = async (signal) => {
    try {
      const { data, error, message } = await fetchRestaurantOrderStats(restaurantInfo._id, userInfo.token, signal);

      if (error) {
        setError(message);
        setData(null);
      }
      else {
        setError(null);
        console.log(data);
        setData(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    if (userInfo && restaurantInfo) {
      (async () => await getRestaurantOrderStats(abortController.signal))();
    }

    return () => abortController.abort();
  }, [userInfo, restaurantInfo]);

  useEffect(() => {
    if (data || error)
      setLoading(false);
  }, [data, error]);

  return (
    <>
      {
        loading ? <Loader />
        : (
          error ? <Message variant='danger'>{error}</Message>
          : (
            <div style={styles.container}>
                <Paper
                  sx={styles.box}
                >
                  Total Orders this month : {data?.total_orders}
                </Paper>

                <Paper
                  sx={styles.box}
                >
                  Delivered Orders : {
                    data?.order_stats[1]?.count || 0
                  }
                </Paper>

                <Paper
                  sx={styles.box}
                >
                  Active Orders : {data?.order_stats[2]?.count || 0}
                </Paper>

                <Paper
                  sx={styles.box}
                >
                  Cancelled Orders : {data?.order_stats[0]?.count || 0}
                </Paper>
            </div>
          )
        )
      }
    </>
  );
}
