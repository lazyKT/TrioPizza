import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';


import Loader from '../components/Loader';
import Message from '../components/Message';
import { getDriverOrderStats } from '../networking/orderRequests';


export default function DriverStats () {

  const [ total, setTotal ] = useState(0);
  const [ cancelledCount, setCancelledCount ] = useState(0);
  const [ activeCount, setActiveCount ] = useState(0);
  const [ deliveredCount, setDeliveredCount ] = useState(0);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);
  const history = useHistory();


  const fetchDriverStats = async (userId, token, signal) => {
    try {
      const { data, message, error } = await getDriverOrderStats(userId, token, signal);

      if (error) {
        setError (message);
      }
      else {
        setTotal(data.total_orders);
        setCancelledCount(data?.orders_stats?.cancelled);
        setActiveCount(data?.orders_stats?.progress);
        setDeliveredCount(data?.orders_stats?.delivered);
        setError(null);
      }
    }
    catch (error) {
      setError (error.message);
    }
  }


  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo) {
      (async () =>
        await fetchDriverStats(userInfo.id, userInfo.token, abortController.singal)
      )();
    }
    else {
      history.push('/login');
    }


    return (() => abortController.abort());
  }, [userInfo, history]);


  useEffect(() => {
    setLoading(false);
  }, [error, activeCount, total, deliveredCount, cancelledCount])


  return (
    <Container>
      <h4>Driver Stats</h4>
      {loading && <Loader />}
      {error && <Message variant="danger">{ error }</Message>}
      <Row className='my-2'>
        <Col className="p-2 mr-2">
          <Paper
            sx={{ padding: '20px', background: 'dodgerblue' }}
          >
            <Typography
              variant="subtitle2"
              sx={{color: 'white'}}
            >
              Total Orders:
            </Typography>
            <Typography
              variant="h5"
              sx={{color: 'white'}}
            >
              { total }
            </Typography>
          </Paper>
        </Col>

        <Col className="p-2 ml-2">
          <Paper
            sx={{ padding: '20px', background: 'coral'}}
          >
            <Typography
              sx={{color: 'white'}}
              variant="subtitle2"
            >
              Total Active Orders:
            </Typography>
            <Typography
              variant="h5"
              sx={{color: 'white'}}
            >
              { activeCount }
            </Typography>
          </Paper>
        </Col>
      </Row>
      <Row>
        <Col className="p-2 mr-2">
          <Paper
            sx={{ padding: '20px', background: 'limegreen' }}
          >
            <Typography
              variant="subtitle2"
              sx={{color: 'white'}}
            >
              Total Orders Delivered:
            </Typography>
            <Typography
              variant="h5"
              sx={{color: 'white'}}
            >
              { deliveredCount }
            </Typography>
          </Paper>
        </Col>

        <Col className="p-2 ml-2">
          <Paper
            sx={{ padding: '20px' }}
          >
            <Typography
              variant="subtitle2"
            >
              Total Orders Cancelled:
            </Typography>
            <Typography
              variant="h5"
            >
              { cancelledCount }
            </Typography>
          </Paper>
        </Col>
      </Row>
    </Container>
  );
}
