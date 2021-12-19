import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Button, ButtonGroup } from 'react-bootstrap';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getOrderDetails } from '../../actions/orderActions';
import { getAvailableDrivers } from '../../actions/userActions';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import AsignDriver from './AsignDriver';


const styles = {
  paper: {
    margin: '10px',
    padding: '15px'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px'
  }
}


export default function OrderDetails ({id, backToOrderList}) {

  const [ driver, setDriver ] = useState(-1);
  const [ drivers, setDrives ] = useState([]);

  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie);
  const { error, loading, order } = useSelector(state => state.orderDetails);


  const backButtonClick = (e) => {
    e.preventDefault();
    backToOrderList();
  };

  const toDate = (date) => {
    const dt = new Date(date);
    return `${dt.toLocaleDateString()}, ${dt.toLocaleTimeString()}`;
  };


  useEffect(() => {
    if (id && userInfo && userInfo.isAdmin)
      dispatch(getOrderDetails(id));
  }, [userInfo, id]);

  return (
    <>
      <MaterialButton
        endIcon={<ArrowBackIcon/>}
        onClick={backButtonClick}
      >
        Back
      </MaterialButton>
      {
        loading ? <Loader />
        : (
          error ? <Message variant='danger'>{error}</Message>
          : (
            <Paper
              sx={styles.paper}
            >
              <Box
                sx={styles.row}
              >
                <h5>Order : #{id}</h5>
                <h6>Status : &nbsp;
                  <strong style={{
                    color: order.status === 'progress' ? 'coral' : 'dodgerBlue'
                  }}>
                    {order.status}
                  </strong>
                </h6>
              </Box>

              <AsignDriver
                id={id}
                driver={order.driver}
              />

              <Box
                sx={styles.row}
              >
                <div>
                  <p>Customer</p>
                  <h6>{order.user.name}, {order.user.username}</h6>
                </div>
                <div>
                  <p>Date & Time</p>
                  <h6>{toDate(order.createdAt)}</h6>
                </div>
              </Box>
            </Paper>
          )
        )
      }
    </>
  )
}
