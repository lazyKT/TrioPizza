import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { listOrders } from '../../actions/orderActions.js';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import OrderCard from './OrderCard';


export default function OrderList () {

  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie);
  const { error, loading, orders } = useSelector(state => state.orderList);


  useEffect(() => {
    console.log(orders);
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());
    }
  }, [userInfo]);


  return (
    <>
      { loading && <Loader/>}
      { error && <Message variant="danger">{error}</Message>}
      { orders && (
        <>
          <h5>All Orders ({orders.length})</h5>
          {orders.map(order => (
            <OrderCard key={order._id} order={order}/>
          ))}
        </>
      )}
    </>
  );
}
