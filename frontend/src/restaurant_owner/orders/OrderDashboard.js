import React from 'react';

import OrderList from './OrderList';
import OrdersSummary from './OrdersSummary';
import ExportOrders from './ExportOrders';

export default function OrderDashboard () {

    return (
      <>
        <OrdersSummary />
        <ExportOrders />
        <OrderList />
      </>
    )
}
