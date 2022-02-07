import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';

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
                <Box
                  sx={{
                    ...styles.box,
                    backgroundColor: 'coral',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      opacity: [0.9, 0.8, 0.7],
                    },
                  }}
                >
                  Total Orders this month : {data?.total_orders}
                </Box>

                <Box
                  sx={{
                    ...styles.box,
                    backgroundColor: 'tomato',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      opacity: [0.9, 0.8, 0.7],
                    },
                  }}
                >
                  Delivered Orders : {
                    data?.order_stats[1]?.count || 0
                  }
                </Box>

                <Box
                  sx={{
                    ...styles.box,
                    backgroundColor: 'coral',
                    '&:hover': {
                      backgroundColor: 'tomato',
                      cursor: 'Pointer'
                    },
                  }}
                >
                  Active Orders : {data?.order_stats[2]?.count || 0}
                </Box>

                <Box
                  sx={{
                    ...styles.box,
                    backgroundColor: 'coral',
                    '&:hover': {
                      backgroundColor: 'tomato',
                      cursor: 'Pointer'
                    },
                  }}
                >
                  Cancelled Orders : {data?.order_stats[0]?.count || 0}
                </Box>
            </div>
          )
        )
      }
    </>
  );
}
