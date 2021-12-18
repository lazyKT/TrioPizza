import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

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
    color: 'white'
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


  return (
    <Paper
      sx={styles.paper}
      onClick={handleOnClick}
    >
      <Box sx={styles.box}>
        <div>
          <h5>{displayOrderItem(order.orderItems)}</h5>
          <h5>{order.totalPrice} $</h5>
          <h6>{toDate(order.createdAt)}</h6>
        </div>
        <Box
          sx={{
            ...styles.status,
            backgroundColor: order.status === 'progress' ? 'coral' : 'dodgerBlue'
          }}
        >
          {order.status}
        </Box>
      </Box>
    </Paper>
  )
}
