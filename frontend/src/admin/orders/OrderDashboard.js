import React from 'react';

import OrderList from './OrderList';
import OrdersSummary from './OrdersSummary';

export default function OrderDashboard () {

    return (
      <>
        <h5>Orders</h5>
        <OrdersSummary />
        <OrderList />
      </>
    )
}
