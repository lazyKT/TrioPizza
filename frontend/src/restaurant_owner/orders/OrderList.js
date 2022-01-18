import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pagination } from 'react-bootstrap';

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

  const handlePagination = (page) => {
    dispatch(listOrders(page));
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());
    }
  }, [userInfo, showOrderDetails]);


  useEffect(() => console.log(orders), [orders]);

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
            { orders?.orders && (
              <>
                <h5>All Orders ({orders.count})</h5>
                {orders.orders.map(order => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    goToOrderDetails={goToOrderDetails}
                  />
                ))}
              </>
            )}
            <Pagination>
              {[...Array(orders?.pages).keys()].map(p => (
                <Pagination.Item
                  key={p}
                  active={p + 1 === orders?.page}
                  onClick={() => handlePagination(p + 1)}
                >
                  { p + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </>
        )
      }
    </>
  );
}
