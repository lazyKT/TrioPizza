import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';


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
  }
}


export default function OrderCard ({order}) {


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

  return (
    <Paper sx={styles.paper}>
      <Box sx={styles.box}>
        <div>
          <h5>{displayOrderItem(order.orderItems)}</h5>
          <h6>{toDate(order.createdAt)}</h6>
        </div>
        <h5>{order.totalPrice} &nbsp;$</h5>
      </Box>
    </Paper>
  )
}
