import React from 'react';

import CustomDoughnut from './charts/CustomDoughnut';


export default function Dashboard () {

  return (
    <CustomDoughnut data={[12, 19, 3, 5, 2, 0]} />
  )
}
