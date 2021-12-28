import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';


import ReservationSteps from '../components/ReservationSteps';


export default function PreOrder () {

  const history = useHistory();

  const { userInfo } = useSelector(state => state.userCookie);
  const { info } = useSelector(state => state.reservation);


  useEffect(() => {
    console.log('reservation', info);
    if (!userInfo)
      history.push('/');
  }, [userInfo, info]);


  return (
    <>
      <ReservationSteps selected='add-ons'/>
      <h4>PreOrder Screen</h4>
      jljkljljljl
    </>
  );
}
