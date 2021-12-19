import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { listOrders } from '../../actions/orderActions.js';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';


export default function OrderList () {

  const [ showOrderDetails, setShowOrderDetails ] = useState(false);
  const [ selected, setSelected ] = useState(-1);

  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie);
  const { error, loading, orders } = useSelector(state => state.orderList);


  const goToOrderDetails = (id) => {
    setShowOrderDetails(true);
    setSelected(id);
  };

  const goBackToOrderList = () => {
    setShowOrderDetails(false);
    setSelected(-1);
  };


  useEffect(() => {
    console.log(orders);
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());
    }
  }, [userInfo]);


  return (
    <>
      { showOrderDetails && selected !== -1
        ? <OrderDetails
            id={selected}
            backToOrderList={goBackToOrderList}
          />
        : (
          <>
          { loading && <Loader/>}
          { error && <Message variant="danger">{error}</Message>}
          { orders && (
            <>
              <h5>All Orders ({orders.length})</h5>
              {orders.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  goToOrderDetails={goToOrderDetails}
                />
              ))}
            </>
          )}
          </>
        )
      }
    </>
  );
}
