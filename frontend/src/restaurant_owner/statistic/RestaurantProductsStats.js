import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ListGroup, Row, Col } from 'react-bootstrap';
import Paper from '@mui/material/Paper';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';

import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchRestaurantProductsStats } from '../../networking/statisticRequests';


const styles = {
  flex: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  paper: {
    margin: '15px',
    padding: '20px',
    width: '50%',
  }
}


export default function RestaurantProductsStats () {

  const [ data, setData ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantInfo } = useSelector(state => state.restaurant);


  const getRestaurantProductsStats = async (signal) => {
    try {
      const { data, error, message } = await fetchRestaurantProductsStats (restaurantInfo._id, userInfo.token, signal);

      if (error) {
        setData(null);
        setError(message);
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

    if (userInfo && restaurantInfo) {
      (async () => await getRestaurantProductsStats(abortController.signal))();
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
            <div style={styles.flex}>
              <Paper sx={{ ...styles.paper, maxWidth: '250px', height: '100px' }}>
                <p>Total Earning<AttachMoneyIcon fontSize="small"/></p>
                <h4>{data.total_earnings} SGD</h4>
              </Paper>

              <Paper sx={{ ...styles.paper, maxWidth: '350px' }}>
                <p><StackedBarChartIcon fontSize="small"/>Top Products</p>
                <ListGroup>
                  <Row>
                    <Col>
                      Product
                    </Col>
                    <Col>
                      Total Earnings
                    </Col>
                  </Row>
                  { data?.sales.slice(0, 3).map((sale, idx) => (
                     <ListGroup.Item key={idx}>
                       <Row>
                        <Col>
                          <h6>{sale.product}</h6>
                        </Col>
                        <Col>
                          <p>{sale.totalPrice__sum ? sale.totalPrice__sum : 0}</p>
                        </Col>
                       </Row>
                     </ListGroup.Item>
                   ))}
                </ListGroup>
              </Paper>
            </div>
          )
        )
      }
    </>
  );
}
