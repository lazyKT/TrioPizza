import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { listMyOrders } from '../actions/orderActions';



const styles = {
  container: {
    padding: '20px',
    marginTop: '15px',
    marginBottom: '20px'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}


function OrderListScreen({ history }) {

    const dispatch = useDispatch()

    const { loading, error, orders } = useSelector(state => state.myOrderList);
    const { userInfo } = useSelector(state => state.userCookie);


    const orderOnClick = (id) => {
      history.push(`/order/${id}`);
    }

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

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            dispatch(listMyOrders())
        } else {
            history.push('/login')
        }

    }, [dispatch, history, userInfo]);


    return (
        <div>
            <h1>My Orders</h1>
            {loading
                ? (<Loader />)
                : error
                    ? (<Message variant='danger'>{error}</Message>)
                    : (
                        orders && orders.map(order => (
                          <Paper
                            elevation={2}
                            key={order._id}
                            sx={styles.container}
                            onClick={() => orderOnClick(order._id)}
                          >
                            <Box sx={styles.row}>
                              <div>
                                <h5>{displayOrderItem(order.orderItems)}</h5>
                                <h6>{toDate(order.createdAt)}</h6>
                              </div>
                              <h5>{order.totalPrice}&nbsp;$</h5>
                            </Box>
                          </Paper>
                        ))
                    )}
        </div>
    )
}

export default OrderListScreen
