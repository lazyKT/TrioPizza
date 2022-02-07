import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Pagination } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import { listMyOrders } from '../actions/orderActions';



const styles = {
  container: {
    padding: '20px',
    marginTop: '15px',
    marginBottom: '20px',
    '&:hover': {
      backgroundColor: 'gainsboro',
      color: 'darkblue',
      cursor: 'pointer'
    },
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subHeader: {
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
    marginBottom: '20px',
    textDecoration: 'underline',
    textDecorationColor: 'dodgerblue'
  }
}


export default function OrderListScreen({ history }) {

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

    const handlePagination = (page) => {
      dispatch(listMyOrders(page))
    }

    const getActiveOrdersCount = (orders) => {
      if (!orders) return 0;

      const activeOrders = orders.filter(o => o.status === 'active');
      return activeOrders.length;
    }

    useEffect(() => {
        if (userInfo) {
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
                <>
                  <p style={styles.subHeader}>Active Order(s) : {getActiveOrdersCount(orders?.orders)}</p>
                  {orders?.orders && orders.orders.map((order, idx) => (
                    <>
                      <Paper
                        key={order._id}
                        sx={styles.container}
                        onClick={() => orderOnClick(order._id)}
                      >
                        <Box sx={styles.row}>
                          <div>
                            <h5>{displayOrderItem(order.orderItems)}</h5>
                            <h6>{toDate(order.createdAt)}</h6>
                            <h6 style={{
                              padding: '10px',
                              width: 'fit-content',
                              background: order.status === 'progress' ? 'coral' : (
                                order.status === 'delivered' ? 'lightgreen' : 'gainsboro'
                              ),
                            }}>
                              {order.status}
                            </h6>
                          </div>
                          <h5>{order.totalPrice}&nbsp;$</h5>
                        </Box>
                      </Paper>
                    </>
                  ))}
                  <Pagination>
                    {[...Array(orders.pages).keys()].map((p, idx) => (
                      <Pagination.Item
                        key={idx}
                        active={p + 1 === orders.page}
                        onClick={() => handlePagination(p + 1)}
                      >
                      { p + 1 }
                      </Pagination.Item>
                    ))}
                  </Pagination>
                  {orders?.orders?.length === 0 && <Message variant='info'>You have not made any orders yet!</Message>}
                </>
              )}
        </div>
    )
}
