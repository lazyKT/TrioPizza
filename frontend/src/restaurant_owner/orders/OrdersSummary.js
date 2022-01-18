import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';


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

  const [ monthlyOrders, setMonthlyOrders ] = useState(0);
  const [ dailyOrders, setDailyOrders ] = useState(0);
  const [ activeOrders, setActiveOrders ] = useState(0);



  return (
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
          Total Orders this month : {monthlyOrders}
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
          Total Orers today : {dailyOrders}
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
          Active Orders : {activeOrders}
        </Box>
    </div>
  );
}
