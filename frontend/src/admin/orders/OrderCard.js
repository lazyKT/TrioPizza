import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Row, Col } from 'react-bootstrap';

import OrderDetails from './OrderDetails';


const styles = {
  paper: {
    padding: '15px',
    marginTop: '10px',
    marginBottom: '15px',
    '&:hover': {
      backgroundColor: 'gainsboro',
      cursor: 'pointer'
    },
  },
  box: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  status: {
    padding: '10px',
    borderRadius: '2px',
    color: 'white',
    width: 'fit-content'
  }
}


export default function OrderCard ({order, goToOrderDetails}) {


  const displayOrderItem = (items) => {
    let itemTitle = '';
    items.forEach((item, idx) => {
      if (idx !== 0)
        itemTitle += ', ';
      itemTitle += `${item.name} x ${item.qty}`;
    });

    return itemTitle;
  }

  const toDate = (date) => {
    const dt = new Date(date);
    return `${dt.toLocaleDateString()}, ${dt.toLocaleTimeString()}`;
  }


  const handleOnClick = (e) => {
    e.preventDefault();
    goToOrderDetails(order._id);
  }


  React.useEffect(() => {
    if (order._id === 25) {
      console.log(order);
    }
  });

  return (
    <Paper
      sx={styles.paper}
      onClick={handleOnClick}
    >
      <Row>
        <Col md={8}>
          <p>Order # {order._id}</p>
          { order.orderItems.map( (item, idx) => (
            <h6 key={idx}>{item.name} x {item.qty}</h6>
          ))}
          <h5>{order.totalPrice} $</h5>
          <h6>{toDate(order.createdAt)}</h6>
        </Col>
        <Col md={4}>
          <Box
            sx={{
              ...styles.status,
              backgroundColor: order.status === 'progress' ? 'coral' : (
                order.status === 'delivered' ? 'dodgerBlue' : 'gray'
              )
            }}
          >
            {order.status}
          </Box>
          {order.status === 'progress' &&
          <h6 style={{marginTop: '10px'}}>
            { order.driver ? "Assigned" : "Un-assigned"}
          </h6>}
        </Col>
      </Row>
    </Paper>
  )
}
